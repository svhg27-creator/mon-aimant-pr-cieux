#!/usr/bin/env python3
"""
Import universel : lit tous les fichiers 37x37 *.xlsx du dossier xls/
et crée un bucket Supabase par catégorie.

Mapping fichier → bucket :
  37x37 CHAT.xlsx      → catalogue-animaux-chats
  37x37 CHIEN.xlsx     → catalogue-animaux-chiens
  37x37 RONGEUR.xlsx   → catalogue-animaux-rongeurs
  37x37 OISEAU.xlsx    → catalogue-animaux-oiseaux
  37x37 POISSON.xlsx   → catalogue-animaux-poissons
  37x37 REPTILE.xlsx   → catalogue-animaux-reptiles
  37x37 DRAPEAU*.xlsx  → catalogue-drapeaux-<region>
  37x37 Prénoms.xlsx   → (ignoré, géré par import_prenoms.py)
"""

import zipfile
import psycopg2
import psycopg2.extras
import os
import re
from datetime import datetime, timezone

XLS_DIR  = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls"
DB_URL   = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
SUPABASE_URL = "https://fcjxacmdzhzjdiqjsbid.supabase.co"

# Mapping : mot-clé dans le nom de fichier → (bucket, préfixe image)
CATALOGUE = {
    "CHAT":    ("catalogue-animaux-chats",    "chat"),
    "CHIEN":   ("catalogue-animaux-chiens",   "chien"),
    "RONGEUR": ("catalogue-animaux-rongeurs", "rongeur"),
    "LAPIN":   ("catalogue-animaux-lapins",   "lapin"),
    "OISEAU":  ("catalogue-animaux-oiseaux",  "oiseau"),
    "POISSON": ("catalogue-animaux-poissons", "poisson"),
    "REPTILE": ("catalogue-animaux-reptiles", "reptile"),
    "DRAPEAU": ("catalogue-drapeaux",         "drapeau"),
}

SKIP_KEYWORDS = ["PRÉNOM", "PRENOM", "PRENOMS", "PRÉNOMS"]

def detect_category(filename):
    name_upper = filename.upper()
    for skip in SKIP_KEYWORDS:
        if skip in name_upper:
            return None, None
    for keyword, (bucket, prefix) in CATALOGUE.items():
        if keyword in name_upper:
            return bucket, prefix
    return None, None

def ensure_bucket(cur, conn, bucket_name):
    cur.execute("""
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (%s, %s, true, 5242880, ARRAY['image/png','image/jpeg','image/webp'])
        ON CONFLICT (id) DO UPDATE SET public = true
    """, (bucket_name, bucket_name))
    conn.commit()

def ensure_policies(conn, bucket_name):
    cur2 = conn.cursor()
    for policy_name, sql in [
        (f"Public view {bucket_name}",
         f"CREATE POLICY \"{bucket_name} public select\" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = '{bucket_name}')"),
        (f"Admin upload {bucket_name}",
         f"CREATE POLICY \"{bucket_name} admin insert\" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = '{bucket_name}' AND public.has_role(auth.uid(), 'admin'))"),
        (f"Admin delete {bucket_name}",
         f"CREATE POLICY \"{bucket_name} admin delete\" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = '{bucket_name}' AND public.has_role(auth.uid(), 'admin'))"),
    ]:
        try:
            cur2.execute(sql)
            conn.commit()
        except Exception:
            conn.rollback()
    cur2.close()

def import_file(cur, conn, xlsx_path, bucket_name, prefix, already_done=False):
    now = datetime.now(timezone.utc)
    ok = errors = skipped = 0

    with zipfile.ZipFile(xlsx_path) as z:
        media_files = sorted([
            f for f in z.namelist()
            if "xl/media/" in f and f.lower().rsplit(".", 1)[-1] in ("png", "jpg", "jpeg")
        ])
        total = len(media_files)
        print(f"   {total} images trouvées")

        # Récupérer les noms déjà en base pour ce bucket
        cur.execute("SELECT name FROM storage.objects WHERE bucket_id = %s", (bucket_name,))
        existing = {row[0] for row in cur.fetchall()}

        for i, media_path in enumerate(media_files, 1):
            ext = media_path.rsplit(".", 1)[-1].lower()
            image_name = f"{prefix}-{i:03d}.{ext}"
            mime = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"

            if image_name in existing:
                print(f"   [{i:03d}/{total}] ⏭  {image_name} (déjà présent)")
                skipped += 1
                continue

            image_data = z.read(media_path)
            size = len(image_data)

            try:
                cur.execute("""
                    INSERT INTO storage.objects (
                        bucket_id, name, owner, owner_id,
                        version, created_at, updated_at, last_accessed_at,
                        metadata, user_metadata
                    ) VALUES (
                        %s, %s, NULL, NULL,
                        gen_random_uuid()::text, %s, %s, %s,
                        %s::jsonb, '{}'::jsonb
                    )
                    ON CONFLICT (bucket_id, name) DO NOTHING
                """, (
                    bucket_name, image_name,
                    now, now, now,
                    psycopg2.extras.Json({"mimetype": mime, "size": size, "cacheControl": "3600"})
                ))
                conn.commit()
                print(f"   [{i:03d}/{total}] ✅ {image_name} ({size//1024}KB)")
                ok += 1
            except Exception as e:
                conn.rollback()
                print(f"   [{i:03d}/{total}] ❌ {image_name} — {e}")
                errors += 1

    return ok, skipped, errors

def main():
    print("Connexion à Supabase...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    xlsx_files = sorted([
        f for f in os.listdir(XLS_DIR)
        if f.endswith(".xlsx") and not f.startswith("~")
    ])

    results = []
    for filename in xlsx_files:
        bucket_name, prefix = detect_category(filename)
        if not bucket_name:
            print(f"\n⏭  {filename} ignoré")
            continue

        xlsx_path = os.path.join(XLS_DIR, filename)
        print(f"\n{'='*60}")
        print(f"📁 {filename}")
        print(f"   → bucket: {bucket_name}  |  préfixe: {prefix}")

        ensure_bucket(cur, conn, bucket_name)
        ensure_policies(conn, bucket_name)
        print(f"   ✅ Bucket prêt")

        ok, skipped, errors = import_file(cur, conn, xlsx_path, bucket_name, prefix)
        results.append((filename, bucket_name, ok, skipped, errors))

    cur.close()
    conn.close()

    print(f"\n{'='*60}")
    print("RÉSUMÉ FINAL")
    print(f"{'='*60}")
    for filename, bucket, ok, skipped, errors in results:
        print(f"  {filename}")
        print(f"    bucket : {bucket}")
        print(f"    insérés: {ok}  |  ignorés: {skipped}  |  erreurs: {errors}")
        print(f"    URL    : {SUPABASE_URL}/storage/v1/object/public/{bucket}/")

if __name__ == "__main__":
    main()
