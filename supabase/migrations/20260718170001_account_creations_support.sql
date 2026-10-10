-- ============================================================
-- MIGRATION : espace client — créations, favoris, support, notifications
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saved_design_type') THEN
    CREATE TYPE public.saved_design_type AS ENUM ('hommage', 'prenom', 'animal', 'drapeau', 'custom');
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 1. SAVED DESIGNS (Mes créations)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_designs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text,
  type            public.saved_design_type DEFAULT 'custom',
  shape           text,
  dimensions      text,
  front_design    jsonb,
  back_design     jsonb,
  photo_url       text,
  text_content    text,
  colors          jsonb,
  background      text,
  frame           text,
  preview_url     text,
  is_public       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS saved_designs_updated_at ON public.saved_designs;
CREATE TRIGGER saved_designs_updated_at
  BEFORE UPDATE ON public.saved_designs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can manage their own designs"
  ON public.saved_designs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public designs"
  ON public.saved_designs FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins can manage all designs"
  ON public.saved_designs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 2. UPLOADED IMAGES (photos client)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_images (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  public_url      text NOT NULL,
  file_name       text,
  file_size       bigint,
  mime_type       text,
  width           integer,
  height          integer,
  album           text DEFAULT 'default',
  is_archived     boolean NOT NULL DEFAULT false,
  linked_order_id uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS uploaded_images_updated_at ON public.uploaded_images;
CREATE TRIGGER uploaded_images_updated_at
  BEFORE UPDATE ON public.uploaded_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can manage their own images"
  ON public.uploaded_images FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all images"
  ON public.uploaded_images FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 3. FAVORITES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id      text NOT NULL,
  saved_design_id uuid REFERENCES public.saved_designs(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 4. REVIEWS — extension de la table avis existante
-- ----------------------------------------------------------------
ALTER TABLE public.avis
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS photos jsonb,
  ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS avis_user_id_idx ON public.avis(user_id);
CREATE INDEX IF NOT EXISTS avis_product_handle_idx ON public.avis(product_handle);

-- ----------------------------------------------------------------
-- 5. SUPPORT TICKETS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject         text NOT NULL,
  category        text,
  status          public.ticket_status NOT NULL DEFAULT 'open',
  priority        public.ticket_priority NOT NULL DEFAULT 'medium',
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage tickets"
  ON public.support_tickets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 6. SUPPORT MESSAGES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type     text NOT NULL CHECK (sender_type IN ('user', 'support')),
  content         text NOT NULL,
  attachments     jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS support_messages_ticket_id_idx ON public.support_messages(ticket_id);

CREATE POLICY "Users can view ticket messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid()));

CREATE POLICY "Users can send messages on their own tickets"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_type = 'user' AND
    EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage messages"
  ON public.support_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 7. NOTIFICATIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            public.notification_type NOT NULL DEFAULT 'system',
  title           text NOT NULL,
  message         text,
  data            jsonb,
  link            text,
  read            boolean NOT NULL DEFAULT false,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications(user_id, read, created_at DESC);

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------
-- 8. Storage buckets for avatars and creations
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false),
       ('creations', 'creations', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own avatars"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own creations"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'creations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own creations"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'creations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view public creations"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'creations');

CREATE POLICY "Admins can manage avatars"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage creations"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'creations' AND public.has_role(auth.uid(), 'admin'));
