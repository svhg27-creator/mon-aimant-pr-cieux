
-- 1. Enum + table de rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Table family_photos
CREATE TABLE public.family_photos (
  family_id text PRIMARY KEY,
  photo_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.family_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view family photos"
  ON public.family_photos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert family photos"
  ON public.family_photos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update family photos"
  ON public.family_photos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete family photos"
  ON public.family_photos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER family_photos_updated_at
  BEFORE UPDATE ON public.family_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Bucket de stockage public
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-photos', 'family-photos', true);

CREATE POLICY "Anyone can view family-photos files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'family-photos');

CREATE POLICY "Admins can upload family-photos files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'family-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update family-photos files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'family-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete family-photos files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'family-photos' AND public.has_role(auth.uid(), 'admin'));
