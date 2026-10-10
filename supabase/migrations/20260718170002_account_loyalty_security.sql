-- ============================================================
-- MIGRATION : espace client — fidélité, parrainage, panier, sécurité, audit
-- ============================================================

-- ----------------------------------------------------------------
-- 1. LOYALTY POINTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points          integer NOT NULL,
  action          text NOT NULL,
  description     text,
  order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  balance         integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS loyalty_points_user_id_idx ON public.loyalty_points(user_id, created_at DESC);

CREATE POLICY "Users can view their own loyalty points"
  ON public.loyalty_points FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage loyalty points"
  ON public.loyalty_points FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 2. REFERRAL CODES & REWARDS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code            text NOT NULL UNIQUE,
  reward_amount   integer NOT NULL DEFAULT 500,
  max_uses        integer,
  uses_count      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS referral_codes_updated_at ON public.referral_codes;
CREATE TRIGGER referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS referral_codes_user_id_idx ON public.referral_codes(user_id);

CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage referral codes"
  ON public.referral_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  reward_amount   integer NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS referral_rewards_updated_at ON public.referral_rewards;
CREATE TRIGGER referral_rewards_updated_at
  BEFORE UPDATE ON public.referral_rewards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS referral_rewards_referrer_idx ON public.referral_rewards(referrer_id);

CREATE POLICY "Users can view their own rewards"
  ON public.referral_rewards FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admins can manage rewards"
  ON public.referral_rewards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 3. COUPONS USED
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons_used (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  coupon_code     text NOT NULL,
  discount_amount integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons_used ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS coupons_used_user_id_idx ON public.coupons_used(user_id);

CREATE POLICY "Users can view their own coupons"
  ON public.coupons_used FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 4. CARTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      text UNIQUE,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS carts_updated_at ON public.carts;
CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS carts_user_id_idx ON public.carts(user_id);

CREATE POLICY "Users can manage their own cart"
  ON public.carts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id         uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id      text,
  saved_design_id uuid REFERENCES public.saved_designs(id) ON DELETE CASCADE,
  quantity        integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price      integer,
  currency        text,
  customization   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS cart_items_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON public.cart_items(cart_id);

CREATE POLICY "Users can manage their own cart items"
  ON public.cart_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

-- ----------------------------------------------------------------
-- 5. LOGIN HISTORY
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address      text,
  user_agent      text,
  location        text,
  succeeded       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS login_history_user_id_idx ON public.login_history(user_id, created_at DESC);

CREATE POLICY "Users can view their own login history"
  ON public.login_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all login history"
  ON public.login_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 6. USER DEVICES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_devices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name     text,
  device_type     text,
  os              text,
  browser         text,
  fingerprint   text,
  trusted         boolean NOT NULL DEFAULT false,
  last_active_at  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_devices_user_id_idx ON public.user_devices(user_id);

CREATE POLICY "Users can view their own devices"
  ON public.user_devices FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 7. USER SESSIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash      text,
  ip_address      text,
  user_agent      text,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id, created_at DESC);

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 8. AUDIT LOGS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action          text NOT NULL,
  table_name      text,
  record_id       text,
  old_data        jsonb,
  new_data        jsonb,
  ip_address      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS audit_logs_user_table_idx ON public.audit_logs(user_id, table_name, created_at DESC);

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage audit logs"
  ON public.audit_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
