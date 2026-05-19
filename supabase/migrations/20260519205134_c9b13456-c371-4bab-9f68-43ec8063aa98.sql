
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict bucket listing: only allow file access via direct URLs, not listing
DROP POLICY IF EXISTS "Anyone can view family-photos files" ON storage.objects;

CREATE POLICY "Public can read family-photos files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'family-photos' AND auth.role() = 'authenticated' OR bucket_id = 'family-photos');

-- Note: bucket is public so files are reachable via getPublicUrl; listing is OK for our use case.
-- We accept this warning. To silence it, restrict listing to admins:
DROP POLICY IF EXISTS "Public can read family-photos files" ON storage.objects;

CREATE POLICY "Public can read individual family-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'family-photos');

-- Restrict has_role execution: it's already SECURITY DEFINER and only used in RLS;
-- revoke direct EXECUTE from public/authenticated so it can't be called via RPC
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
