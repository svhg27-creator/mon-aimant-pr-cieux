#!/usr/bin/env python3
"""
Extrait les images du fichier 37x37 CHAT.xlsx et les uploade
dans le bucket Supabase 'catalogue-animaux-chats'.
"""

import zipfile
import os
import sys
import urllib.request
import urllib.error
import json
import io

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 CHAT.xlsx"
SUPABASE_URL = "https://fcjxacmdzhzjdiqjsbid.supabase.co"

# service_role key fournie directement (nécessaire pour bypass RLS sur storage)
# À récupérer sur : https://supabase.com/dashboard/project/fcjxacmdzhzjdiqjsbid/settings/api
SUPABASE_SERVICE_KEY = input("Colle ta service_role key Supabase (Settings > API > service_role) : ").strip()

if not SUPABASE_SERVICE_KEY or not SUPABASE_SERVICE_KEY.startswith("eyJ"):
    print("❌ Clé invalide")
    sys.exit(1)

print(f"Clé reçue : {SUPABASE_SERVICE_KEY[:30]}...")

BUCKET_NAME = "catalogue-animaux-chats"
HEADERS_JSON = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}

def supabase_request(method, path, data=None, headers=None):
    url = f"{SUPABASE_URL}{path}"
    h = dict(HEADERS_JSON)
    if headers:
        h.update(headers)
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def create_bucket():
    print(f"\n1. Création du bucket '{BUCKET_NAME}'...")
    status, body = supabase_request("POST", "/storage/v1/bucket", {
        "id": BUCKET_NAME,
        "name": BUCKET_NAME,
        "public": True,
        "file_size_limit": 5242880,  # 5MB
        "allowed_mime_types": ["image/png", "image/jpeg", "image/webp"]
    })
    if status in (200, 201):
        print(f"   ✅ Bucket créé")
    elif status == 400 and b"already exists" in body.lower() if isinstance(body, bytes) else False:
        print(f"   ℹ️  Bucket déjà existant")
    else:
        resp_text = body.decode() if isinstance(body, bytes) else str(body)
        if "already exists" in resp_text or "Duplicate" in resp_text:
            print(f"   ℹ️  Bucket déjà existant")
        else:
            print(f"   ⚠️  Status {status}: {resp_text[:200]}")

def upload_image(image_name, image_data):
    path = f"/storage/v1/object/{BUCKET_NAME}/{image_name}"
    url = f"{SUPABASE_URL}{path}"
    h = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "image/png",
        "x-upsert": "true",
    }
    req = urllib.request.Request(url, data=image_data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def main():
    create_bucket()

    print(f"\n2. Extraction et upload des images depuis le Excel...")
    with zipfile.ZipFile(XLSX_PATH) as z:
        media_files = sorted([f for f in z.namelist() if "xl/media/" in f])
        total = len(media_files)
        print(f"   {total} images trouvées\n")

        ok = 0
        errors = 0
        for i, media_path in enumerate(media_files, 1):
            # Nom propre : chat-001.png, chat-002.png ...
            ext = media_path.rsplit(".", 1)[-1].lower()
            image_name = f"chat-{i:03d}.{ext}"

            image_data = z.read(media_path)
            status, err = upload_image(image_name, image_data)

            if status in (200, 201):
                pub_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{image_name}"
                print(f"   [{i:02d}/{total}] ✅ {image_name} → {pub_url}")
                ok += 1
            else:
                print(f"   [{i:02d}/{total}] ❌ {image_name} — erreur {status}: {err[:100] if err else ''}")
                errors += 1

    print(f"\n{'='*50}")
    print(f"✅ Upload terminé : {ok} réussis, {errors} erreurs")
    print(f"\nURL publique base : {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/")

if __name__ == "__main__":
    main()
