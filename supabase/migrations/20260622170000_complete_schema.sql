-- ============================================================
-- MIGRATION : schéma complet Mon Aimant Précieux / Mémora
-- ============================================================

-- ----------------------------------------------------------------
-- 1. PROFILES — données étendues par utilisateur
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  phone         text,
  address_line1 text,
  address_line2 text,
  city          text,
  postal_code   text,
  country       text DEFAULT 'FR',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger : créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 2. AVIS — avis clients vérifiés
-- ----------------------------------------------------------------
CREATE TYPE public.avis_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.avis (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     text NOT NULL,
  product_handle text,
  verified    boolean NOT NULL DEFAULT false,
  status      avis_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved avis"
  ON public.avis FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Authenticated users can submit avis"
  ON public.avis FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own avis"
  ON public.avis FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all avis"
  ON public.avis FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 3. CUSTOM_ORDERS — demandes de personnalisation de magnets
-- ----------------------------------------------------------------
CREATE TYPE public.order_status AS ENUM ('draft', 'pending', 'in_production', 'shipped', 'delivered', 'cancelled');

CREATE TABLE IF NOT EXISTS public.custom_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email           text NOT NULL,
  product_family  text,                          -- ex: 'prenoms', 'animaux', 'drapeau-coeur'
  product_handle  text,                          -- handle Shopify si lié
  prenom          text,
  photo_url       text,
  note            text,
  status          order_status NOT NULL DEFAULT 'draft',
  shopify_order_id text,
  quantity        integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cts  integer,                       -- prix en centimes
  currency        text NOT NULL DEFAULT 'EUR',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER custom_orders_updated_at
  BEFORE UPDATE ON public.custom_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can view their own orders"
  ON public.custom_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.custom_orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft orders"
  ON public.custom_orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'draft')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.custom_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 4. PRENOMS — catalogue des prénoms (remplace le fichier statique)
-- ----------------------------------------------------------------
CREATE TYPE public.prenom_genre AS ENUM ('fille', 'garcon', 'mixte');

CREATE TABLE IF NOT EXISTS public.prenoms (
  id            serial PRIMARY KEY,
  prenom        text NOT NULL,
  genre         prenom_genre NOT NULL,
  origine       text,
  signification text,
  photo_url     text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX prenoms_genre_idx ON public.prenoms (genre);
CREATE INDEX prenoms_prenom_idx ON public.prenoms (lower(prenom));

ALTER TABLE public.prenoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prenoms"
  ON public.prenoms FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage prenoms"
  ON public.prenoms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 5. CATALOGUE_ANIMAUX — catalogue des magnets animaux
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_animaux (
  id            serial PRIMARY KEY,
  espece        text NOT NULL,     -- 'chats', 'chiens', 'rongeurs', 'oiseaux', 'poissons', 'reptiles'
  nom           text NOT NULL,
  description   text,
  photo_url     text,
  product_handle text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX catalogue_animaux_espece_idx ON public.catalogue_animaux (espece);

ALTER TABLE public.catalogue_animaux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active animaux"
  ON public.catalogue_animaux FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage animaux"
  ON public.catalogue_animaux FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 6. CATALOGUE_DRAPEAUX — catalogue des magnets drapeaux-cœur
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_drapeaux (
  id            serial PRIMARY KEY,
  region        text NOT NULL,     -- 'europe', 'asie', 'afrique', 'amerique-nord', 'amerique-sud', 'oceanie', 'autre'
  pays          text NOT NULL,
  code_iso      char(2),
  photo_url     text,
  product_handle text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX catalogue_drapeaux_region_idx ON public.catalogue_drapeaux (region);

ALTER TABLE public.catalogue_drapeaux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active drapeaux"
  ON public.catalogue_drapeaux FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage drapeaux"
  ON public.catalogue_drapeaux FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 7. NEWSLETTER_SUBSCRIBERS — abonnés newsletter
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  confirmed   boolean NOT NULL DEFAULT false,
  token       text,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at  timestamptz,
  unsubscribed_at timestamptz
);

CREATE INDEX newsletter_email_idx ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers"
  ON public.newsletter_subscribers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 8. CONTACT_MESSAGES — formulaire de contact
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 9. PRODUCT_UPLOADS — photos uploadées par clients pour magnets
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_uploads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path  text NOT NULL,
  public_url    text NOT NULL,
  file_name     text,
  file_size     bigint,
  mime_type     text,
  linked_order_id uuid REFERENCES public.custom_orders(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploads"
  ON public.product_uploads FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON public.product_uploads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all uploads"
  ON public.product_uploads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 10. Bucket storage pour uploads clients
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-uploads', 'customer-uploads', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'customer-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own uploaded files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'customer-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all customer uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'customer-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customer uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'customer-uploads' AND public.has_role(auth.uid(), 'admin'));
