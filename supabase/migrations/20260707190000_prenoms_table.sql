-- ============================================================
-- Migration : table des prénoms
-- Fichier source : 37x37 Prénoms.xlsx
-- Contenu : données textuelles uniquement (pas d'images)
-- ============================================================

-- Enum pour le genre
DO $$ BEGIN
  CREATE TYPE public.genre AS ENUM ('fille', 'garçon', 'unisexe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table des prénoms
CREATE TABLE IF NOT EXISTS public.prenoms (
  id             serial PRIMARY KEY,
  prenom         text NOT NULL,
  genre          public.genre NOT NULL,
  origine        text NOT NULL,
  signification  text,
  fete_date      date,
  fete_label     text,
  photo_url      text,          -- optionnel, si un visuel est associé plus tard
  product_handle text,
  active         boolean DEFAULT true,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_prenoms_prenom ON public.prenoms (prenom);
CREATE INDEX IF NOT EXISTS idx_prenoms_genre  ON public.prenoms (genre);
CREATE INDEX IF NOT EXISTS idx_prenoms_fete   ON public.prenoms (fete_date);

-- RLS
ALTER TABLE public.prenoms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public peut voir prenoms" ON public.prenoms;
CREATE POLICY "Public peut voir prenoms"
  ON public.prenoms FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admin gère prenoms" ON public.prenoms;
CREATE POLICY "Admin gère prenoms"
  ON public.prenoms FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    EXECUTE 'CREATE OR REPLACE TRIGGER set_updated_at_prenoms
      BEFORE UPDATE ON public.prenoms
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END $$;
