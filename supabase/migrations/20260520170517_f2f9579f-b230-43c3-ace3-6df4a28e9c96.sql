-- Table des demandes de rôle admin
CREATE TYPE public.role_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requested_role app_role NOT NULL DEFAULT 'admin',
  status role_request_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

-- Une seule demande en attente par (user, rôle)
CREATE UNIQUE INDEX role_requests_one_pending_per_user
  ON public.role_requests (user_id, requested_role)
  WHERE status = 'pending';

ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- L'utilisateur voit ses propres demandes
CREATE POLICY "Users can view their own role requests"
  ON public.role_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- L'utilisateur peut créer une demande pour lui-même
CREATE POLICY "Users can create their own role request"
  ON public.role_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins voient tout
CREATE POLICY "Admins can view all role requests"
  ON public.role_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins peuvent modifier (approuver / refuser)
CREATE POLICY "Admins can update role requests"
  ON public.role_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger : quand approuvée, attribuer le rôle
CREATE OR REPLACE FUNCTION public.apply_role_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.requested_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    NEW.reviewed_at = now();
    NEW.reviewed_by = auth.uid();
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.reviewed_at = now();
    NEW.reviewed_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_role_request
  BEFORE UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.apply_role_request();