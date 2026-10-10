-- Ajoute la date de fête (saint) à la table prenoms
ALTER TABLE public.prenoms
  ADD COLUMN IF NOT EXISTS fete_date date,
  ADD COLUMN IF NOT EXISTS fete_label text;
