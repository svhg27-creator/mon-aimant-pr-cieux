#!/usr/bin/env python3
"""
Extrait les images du fichier 37x37 CHAT.xlsx et les insère
directement dans storage.objects via PostgreSQL (bypass API).
"""

import zipfile
import psycopg2
import psycopg2.extras
import sys
import base64
from datetime import datetime, timezone

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 CHAT.xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
BUCKET_NAME = "catalogue-animaux-chats"
SUPABASE_URL = "https://fcjxacmdzhzjdiqjsbid.supabase.co"

def main():
    print("Connexion à Supabase...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # 1. S'assurer que le bucket existe
    cur.execute("""
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (%s, %s, true, 5242880, ARRAY['image/png','image/jpeg','image/webp'])
        ON CONFLICT (id) DO UPDATE SET public = true
    """, (BUCKET_NAME, BUCKET_NAME))
    conn.commit()
    print(f"✅ Bucket '{BUCKET_NAME}' prêt")

    # 2. Extraire et insérer les images
    print(f"\nExtraction des images depuis Excel...")
    with zipfile.ZipFile(XLSX_PATH) as z:
        media_files = sorted([f for f in z.namelist() if "xl/media/" in f and f.endswith(".png")])
        total = len(media_files)
        print(f"   {total} images PNG trouvées\n")

        ok = 0
        errors = 0
        now = datetime.now(timezone.utc)

        for i, media_path in enumerate(media_files, 1):
            image_name = f"chat-{i:03d}.png"
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
                    ON CONFLICT (bucket_id, name) DO UPDATE
                        SET metadata = EXCLUDED.metadata,
                            updated_at = EXCLUDED.updated_at
                """, (
                    BUCKET_NAME, image_name,
                    now, now, now,
                    psycopg2.extras.Json({"mimetype": "image/png", "size": size, "cacheControl": "3600"})
                ))
                conn.commit()

                pub_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{image_name}"
                print(f"   [{i:02d}/{total}] ✅ {image_name} ({size//1024}KB)")
                ok += 1

            except Exception as e:
                conn.rollback()
                print(f"   [{i:02d}/{total}] ❌ {image_name} — {e}")
                errors += 1

    cur.close()
    conn.close()

    print(f"\n{'='*55}")
    print(f"✅ Terminé : {ok} images insérées, {errors} erreurs")
    print(f"\nURL publique base :")
    print(f"  {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/chat-001.png")

if __name__ == "__main__":
    main()
