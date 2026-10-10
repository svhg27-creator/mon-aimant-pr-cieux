-- ============================================================
-- MIGRATION : espace client — fonctions et triggers
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Numéro de commande automatique : ORD-AAAA-MM-XXXXXX
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix text;
  suffix integer;
  candidate text;
  exists_check boolean;
BEGIN
  prefix := 'ORD-' || to_char(now(), 'YYYY-MM') || '-';
  suffix := 1;
  LOOP
    candidate := prefix || LPAD(suffix::text, 6, '0');
    SELECT EXISTS (SELECT 1 FROM public.orders WHERE order_number = candidate) INTO exists_check;
    EXIT WHEN NOT exists_check;
    suffix := suffix + 1;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_number_trigger ON public.orders;
CREATE TRIGGER orders_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- ----------------------------------------------------------------
-- 2. Mise à jour du profil et préférences à l'inscription
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_code text;
  suffix integer;
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Génère un code de parrainage court unique
  suffix := 1;
  LOOP
    referral_code := UPPER(SUBSTRING(MD5(NEW.id::text || suffix::text) FROM 1 FOR 8));
    IF NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = referral_code) THEN
      EXIT;
    END IF;
    suffix := suffix + 1;
  END LOOP;

  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, referral_code)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 3. Historique de connexion simple (appelé côté client/edge)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_user_login(
  p_user_id uuid,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_succeeded boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_history (user_id, ip_address, user_agent, succeeded)
  VALUES (p_user_id, p_ip_address, p_user_agent, p_succeeded);
END;
$$;

-- ----------------------------------------------------------------
-- 4. Trigger d'audit générique
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Audit sur les tables principales
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_addresses ON public.addresses;
CREATE TRIGGER audit_addresses
  AFTER INSERT OR UPDATE OR DELETE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_saved_designs ON public.saved_designs;
CREATE TRIGGER audit_saved_designs
  AFTER INSERT OR UPDATE OR DELETE ON public.saved_designs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_support_tickets ON public.support_tickets;
CREATE TRIGGER audit_support_tickets
  AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
