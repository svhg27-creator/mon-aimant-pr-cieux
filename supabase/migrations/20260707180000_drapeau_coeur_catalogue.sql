-- ============================================================
-- Migration : catalogue drapeaux coeur
-- Fichier source : 37x37 Drapeau coeur.xlsx
-- Bucket : catalogue-drapeaux
-- Table : public.catalogue_drapeaux
-- ============================================================

-- 1. Bucket Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogue-drapeaux', 'catalogue-drapeaux', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Table catalogue des drapeaux (création si absente)
CREATE TABLE IF NOT EXISTS public.catalogue_drapeaux (
  id             serial PRIMARY KEY,
  region         text,
  pays           text,
  code_iso       text,
  code_pays      text,
  photo_url      text,
  image_name     text,
  image_index    integer,
  product_handle text,
  active         boolean DEFAULT true,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- 3. Colonnes supplémentaires si la table existait déjà
ALTER TABLE public.catalogue_drapeaux
  ADD COLUMN IF NOT EXISTS code_pays  text,
  ADD COLUMN IF NOT EXISTS image_index integer,
  ADD COLUMN IF NOT EXISTS image_name  text,
  ADD COLUMN IF NOT EXISTS updated_at  timestamp with time zone DEFAULT now();

-- 4. Suppression du bucket parasite : impossible directement en SQL (API Storage uniquement)

-- 5. RLS sur la table
ALTER TABLE public.catalogue_drapeaux ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public peut voir catalogue_drapeaux" ON public.catalogue_drapeaux;
CREATE POLICY "Public peut voir catalogue_drapeaux"
  ON public.catalogue_drapeaux FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admin gère catalogue_drapeaux" ON public.catalogue_drapeaux;
CREATE POLICY "Admin gère catalogue_drapeaux"
  ON public.catalogue_drapeaux FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. RLS sur le bucket Storage
DROP POLICY IF EXISTS "Public lecture catalogue-drapeaux" ON storage.objects;
CREATE POLICY "Public lecture catalogue-drapeaux"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'catalogue-drapeaux');

DROP POLICY IF EXISTS "Admin écriture catalogue-drapeaux" ON storage.objects;
CREATE POLICY "Admin écriture catalogue-drapeaux"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'catalogue-drapeaux' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'catalogue-drapeaux' AND public.has_role(auth.uid(), 'admin'));

-- 7. Pré-remplissage avec les 15 URLs publiques du bucket
INSERT INTO public.catalogue_drapeaux (pays, region, photo_url, image_name, image_index, active)
SELECT
  'Drapeau ' || i,
  'À définir',
  'https://fcjxacmdzhzjdiqjsbid.supabase.co/storage/v1/object/public/catalogue-drapeaux/drapeau-' || lpad(i::text, 3, '0') || '.png',
  'drapeau-' || lpad(i::text, 3, '0') || '.png',
  i,
  true
FROM generate_series(1, 15) AS i
ON CONFLICT DO NOTHING;

-- 8. Trigger updated_at (si la fonction existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    EXECUTE 'CREATE OR REPLACE TRIGGER set_updated_at_catalogue_drapeaux
      BEFORE UPDATE ON public.catalogue_drapeaux
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END $$;
