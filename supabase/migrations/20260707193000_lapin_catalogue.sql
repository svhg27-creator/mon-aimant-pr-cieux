-- ============================================================
-- Migration : catalogue des lapins
-- Fichier source : 37x37 Lapin.xlsx
-- Bucket : catalogue-lapins
-- Table : public.catalogue_animaux
-- ============================================================

-- 1. Bucket Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogue-lapins', 'catalogue-lapins', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Table catalogue des animaux (création si absente)
CREATE TABLE IF NOT EXISTS public.catalogue_animaux (
  id             serial PRIMARY KEY,
  categorie      text,
  espece         text,
  race           text,
  couleur        text,
  photo_url      text,
  image_name     text,
  image_index    integer,
  product_handle text,
  active         boolean DEFAULT true,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now(),
  bucket_name    text,
  tags           text[]
);

-- 3. Colonnes supplémentaires si la table existait déjà
ALTER TABLE public.catalogue_animaux
  ADD COLUMN IF NOT EXISTS bucket_name text,
  ADD COLUMN IF NOT EXISTS image_index integer,
  ADD COLUMN IF NOT EXISTS image_name  text,
  ADD COLUMN IF NOT EXISTS tags        text[],
  ADD COLUMN IF NOT EXISTS updated_at  timestamp with time zone DEFAULT now();

-- 4. RLS sur la table
ALTER TABLE public.catalogue_animaux ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public peut voir catalogue_animaux" ON public.catalogue_animaux;
CREATE POLICY "Public peut voir catalogue_animaux"
  ON public.catalogue_animaux FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admin gère catalogue_animaux" ON public.catalogue_animaux;
CREATE POLICY "Admin gère catalogue_animaux"
  ON public.catalogue_animaux FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. RLS sur le bucket Storage
DROP POLICY IF EXISTS "Public lecture catalogue-lapins" ON storage.objects;
CREATE POLICY "Public lecture catalogue-lapins"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'catalogue-lapins');

DROP POLICY IF EXISTS "Admin écriture catalogue-lapins" ON storage.objects;
CREATE POLICY "Admin écriture catalogue-lapins"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'catalogue-lapins' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'catalogue-lapins' AND public.has_role(auth.uid(), 'admin'));

-- 6. Trigger updated_at (si la fonction existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    EXECUTE 'CREATE OR REPLACE TRIGGER set_updated_at_catalogue_animaux
      BEFORE UPDATE ON public.catalogue_animaux
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END $$;
