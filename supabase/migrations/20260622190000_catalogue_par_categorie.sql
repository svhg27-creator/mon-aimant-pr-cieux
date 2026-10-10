-- ============================================================
-- Migration : tables catalogue par catégorie + nettoyage
-- ============================================================

-- 1. Supprimer les tables créées par erreur
DROP TABLE IF EXISTS public."Chat" CASCADE;
DROP TABLE IF EXISTS public.chiens CASCADE;

-- 2. Enum pour les espèces animales
DO $$ BEGIN
  CREATE TYPE public.animal_espece AS ENUM (
    'chat', 'chien', 'lapin', 'rongeur', 'oiseau', 'poisson', 'reptile', 'autre'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Table catalogue_animaux (remplace l'existante, plus complète)
ALTER TABLE public.catalogue_animaux
  ADD COLUMN IF NOT EXISTS categorie    text,
  ADD COLUMN IF NOT EXISTS image_index  integer,
  ADD COLUMN IF NOT EXISTS bucket_name  text,
  ADD COLUMN IF NOT EXISTS image_name   text,
  ADD COLUMN IF NOT EXISTS tags         text[],
  ADD COLUMN IF NOT EXISTS updated_at   timestamp with time zone DEFAULT now();

-- bucket_name calculé depuis espece
COMMENT ON COLUMN public.catalogue_animaux.bucket_name IS 'Nom du bucket Supabase Storage ex: catalogue-animaux-chats';
COMMENT ON COLUMN public.catalogue_animaux.image_name  IS 'Nom du fichier image ex: chat-001.png';

-- 4. Table catalogue_drapeaux (remplace l'existante, plus complète)
ALTER TABLE public.catalogue_drapeaux
  ADD COLUMN IF NOT EXISTS code_pays    text,
  ADD COLUMN IF NOT EXISTS image_index  integer,
  ADD COLUMN IF NOT EXISTS image_name   text,
  ADD COLUMN IF NOT EXISTS updated_at   timestamp with time zone DEFAULT now();

COMMENT ON COLUMN public.catalogue_drapeaux.image_name IS 'Nom du fichier image ex: drapeau-001.png';

-- 5. Pré-remplir catalogue_animaux avec les images des buckets
-- Chats (62 images)
INSERT INTO public.catalogue_animaux (espece, nom, photo_url, bucket_name, image_name, image_index, active)
SELECT
  'chat',
  'Chat ' || i,
  'https://fcjxacmdzhzjdiqjsbid.supabase.co/storage/v1/object/public/catalogue-animaux-chats/chat-' || lpad(i::text, 3, '0') || '.png',
  'catalogue-animaux-chats',
  'chat-' || lpad(i::text, 3, '0') || '.png',
  i,
  true
FROM generate_series(1, 62) AS i
ON CONFLICT DO NOTHING;

-- Chiens (105 images)
INSERT INTO public.catalogue_animaux (espece, nom, photo_url, bucket_name, image_name, image_index, active)
SELECT
  'chien',
  'Chien ' || i,
  'https://fcjxacmdzhzjdiqjsbid.supabase.co/storage/v1/object/public/catalogue-animaux-chiens/chien-' || lpad(i::text, 3, '0') || '.png',
  'catalogue-animaux-chiens',
  'chien-' || lpad(i::text, 3, '0') || '.png',
  i,
  true
FROM generate_series(1, 105) AS i
ON CONFLICT DO NOTHING;

-- Lapins (15 images)
INSERT INTO public.catalogue_animaux (espece, nom, photo_url, bucket_name, image_name, image_index, active)
SELECT
  'lapin',
  'Lapin ' || i,
  'https://fcjxacmdzhzjdiqjsbid.supabase.co/storage/v1/object/public/catalogue-animaux-lapins/lapin-' || lpad(i::text, 3, '0') || '.png',
  'catalogue-animaux-lapins',
  'lapin-' || lpad(i::text, 3, '0') || '.png',
  i,
  true
FROM generate_series(1, 15) AS i
ON CONFLICT DO NOTHING;

-- Rongeurs (23 images)
INSERT INTO public.catalogue_animaux (espece, nom, photo_url, bucket_name, image_name, image_index, active)
SELECT
  'rongeur',
  'Rongeur ' || i,
  'https://fcjxacmdzhzjdiqjsbid.supabase.co/storage/v1/object/public/catalogue-animaux-rongeurs/rongeur-' || lpad(i::text, 3, '0') || '.png',
  'catalogue-animaux-rongeurs',
  'rongeur-' || lpad(i::text, 3, '0') || '.png',
  i,
  true
FROM generate_series(1, 23) AS i
ON CONFLICT DO NOTHING;

-- Oiseaux (19 images)
INSERT INTO public.catalogue_animaux (espece, nom, photo_url, bucket_name, image_name, image_index, active)
SELECT
  'oiseau',
  'Oiseau ' || i,
  'https://fcjxacmdzhzjdiqjsbid.supabase.co/storage/v1/object/public/catalogue-animaux-oiseaux/oiseau-' || lpad(i::text, 3, '0') || '.png',
  'catalogue-animaux-oiseaux',
  'oiseau-' || lpad(i::text, 3, '0') || '.png',
  i,
  true
FROM generate_series(1, 19) AS i
ON CONFLICT DO NOTHING;

-- 6. Retirer la contrainte NOT NULL sur region si elle existe
ALTER TABLE public.catalogue_drapeaux ALTER COLUMN region DROP NOT NULL;

-- Pré-remplir catalogue_drapeaux (15 images)
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

-- 7. RLS sur catalogue_animaux
ALTER TABLE public.catalogue_animaux ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public peut voir catalogue_animaux" ON public.catalogue_animaux;
CREATE POLICY "Public peut voir catalogue_animaux"
  ON public.catalogue_animaux FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admin gère catalogue_animaux" ON public.catalogue_animaux;
CREATE POLICY "Admin gère catalogue_animaux"
  ON public.catalogue_animaux FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. RLS sur catalogue_drapeaux
ALTER TABLE public.catalogue_drapeaux ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public peut voir catalogue_drapeaux" ON public.catalogue_drapeaux;
CREATE POLICY "Public peut voir catalogue_drapeaux"
  ON public.catalogue_drapeaux FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admin gère catalogue_drapeaux" ON public.catalogue_drapeaux;
CREATE POLICY "Admin gère catalogue_drapeaux"
  ON public.catalogue_drapeaux FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Trigger updated_at
CREATE OR REPLACE TRIGGER set_updated_at_catalogue_animaux
  BEFORE UPDATE ON public.catalogue_animaux
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_catalogue_drapeaux
  BEFORE UPDATE ON public.catalogue_drapeaux
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
