#!/usr/bin/env python3
"""
Extrait les images du fichier 37x37 CHIEN.xlsx et les insère
dans le bucket Supabase 'catalogue-animaux-chiens' via PostgreSQL.
"""

import zipfile
import psycopg2
import psycopg2.extras
from datetime import datetime, timezone

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 CHIEN.xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
BUCKET_NAME = "catalogue-animaux-chiens"
SUPABASE_URL = "https://fcjxacmdzhzjdiqjsbid.supabase.co"

def main():
    print("Connexion à Supabase...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    print(f"Extraction des images depuis Excel...")
    with zipfile.ZipFile(XLSX_PATH) as z:
        media_files = sorted([f for f in z.namelist() if "xl/media/" in f and f.lower().endswith((".png", ".jpg", ".jpeg"))])
        total = len(media_files)
        print(f"   {total} images trouvées\n")

        ok = 0
        errors = 0
        now = datetime.now(timezone.utc)

        for i, media_path in enumerate(media_files, 1):
            ext = media_path.rsplit(".", 1)[-1].lower()
            image_name = f"chien-{i:03d}.{ext}"
            mime = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
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
                    psycopg2.extras.Json({"mimetype": mime, "size": size, "cacheControl": "3600"})
                ))
                conn.commit()
                print(f"   [{i:03d}/{total}] ✅ {image_name} ({size//1024}KB)")
                ok += 1

            except Exception as e:
                conn.rollback()
                print(f"   [{i:03d}/{total}] ❌ {image_name} — {e}")
                errors += 1

    cur.close()
    conn.close()

    print(f"\n{'='*55}")
    print(f"✅ Terminé : {ok} images insérées, {errors} erreurs")
    print(f"\nURL publique base :")
    print(f"  {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/chien-001.png")

if __name__ == "__main__":
    main()
