-- ============================================================
-- MIGRATION : espace client — profils, adresses, commandes, paiements
-- ============================================================

-- ----------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type') THEN
    CREATE TYPE public.address_type AS ENUM ('billing', 'shipping');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM ('order', 'shipping', 'promotion', 'product', 'support', 'system');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM ('open', 'waiting', 'closed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
    CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 1. PROFILES — extensions
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS gdpr_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS marketing_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_sms boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_push boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ----------------------------------------------------------------
-- 2. USER PREFERENCES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme         text NOT NULL DEFAULT 'system',
  language      text NOT NULL DEFAULT 'fr',
  currency      text NOT NULL DEFAULT 'EUR',
  email_notifications boolean NOT NULL DEFAULT true,
  sms_notifications   boolean NOT NULL DEFAULT false,
  push_notifications  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences"
  ON public.user_preferences FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 3. ADDRESSES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            public.address_type NOT NULL,
  label           text,
  first_name      text,
  last_name       text,
  company         text,
  address_line1   text NOT NULL,
  address_line2   text,
  city            text NOT NULL,
  postal_code     text NOT NULL,
  country         text NOT NULL DEFAULT 'FR',
  phone           text,
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS addresses_updated_at ON public.addresses;
CREATE TRIGGER addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can manage their own addresses"
  ON public.addresses FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON public.addresses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 4. ORDERS — extensions
-- ----------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS billing_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipping_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipping_carrier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS estimated_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number) WHERE order_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_id_status_idx ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------
-- 5. ORDER ITEMS — extensions
-- ----------------------------------------------------------------
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_image_url text,
  ADD COLUMN IF NOT EXISTS customization jsonb,
  ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2),
  ADD COLUMN IF NOT EXISTS discount_amount integer,
  ADD COLUMN IF NOT EXISTS fulfilled_quantity integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

DROP TRIGGER IF EXISTS order_items_updated_at ON public.order_items;
CREATE TRIGGER order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------
-- 6. PAYMENTS — extensions
-- ----------------------------------------------------------------
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_method_details jsonb,
  ADD COLUMN IF NOT EXISTS refunded_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failure_code text,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;

CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------
-- 7. INVOICES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number  text NOT NULL UNIQUE,
  amount          integer NOT NULL,
  currency        text NOT NULL DEFAULT 'EUR',
  status          text NOT NULL DEFAULT 'draft',
  pdf_url         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
