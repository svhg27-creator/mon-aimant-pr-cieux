#!/usr/bin/env python3
"""Upload catalogue images to Supabase Storage and insert/update DB records."""

import os
import mimetypes
import urllib.request
import urllib.error
import json

import os

def _load_env(path):
    if not os.path.exists(path):
        return
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

_load_env(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".env"))

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://fcjxacmdzhzjdiqjsbid.supabase.co")
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

CATALOGUE_DIR = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/public/catalogue"

CONFIGS = [
    ("chats",    "chat",    "catalogue-animaux-chats",    "animaux"),
    ("chiens",   "chien",   "catalogue-animaux-chiens",   "animaux"),
    ("lapins",   "lapin",   "catalogue-animaux-lapins",   "animaux"),
    ("oiseaux",  "oiseau",  "catalogue-animaux-oiseaux",  "animaux"),
    ("rongeurs", "rongeur", "catalogue-animaux-rongeurs", "animaux"),
    ("drapeaux", "drapeau", "catalogue-animaux-drapeaux", "drapeau"),
]

HEADERS_JSON = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


def supabase_request(method, path, data=None, headers=None):
    url = f"{SUPABASE_URL}{path}"
    body = json.dumps(data).encode() if data else None
    h = {**HEADERS_JSON, **(headers or {})}
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return r.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def ensure_bucket(bucket_name):
    status, body = supabase_request("GET", f"/storage/v1/bucket/{bucket_name}")
    if status == 200:
        print(f"  bucket '{bucket_name}' existe déjà")
        return True
    payload = {"id": bucket_name, "name": bucket_name, "public": True}
    status, body = supabase_request("POST", "/storage/v1/bucket", payload)
    if status in (200, 201):
        print(f"  bucket '{bucket_name}' créé")
        return True
    print(f"  ERREUR bucket '{bucket_name}': {status} {body}")
    return False


def upload_file(bucket_name, object_name, file_path):
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{object_name}"
    mime = mimetypes.guess_type(file_path)[0] or "image/png"
    with open(file_path, "rb") as f:
        data = f.read()
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": mime,
        "x-upsert": "true",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def upsert_catalogue_record(espece, image_index, image_name, bucket_name, photo_url):
    nom = f"{espece.capitalize()} {image_index}"
    record = {
        "espece": espece,
        "nom": nom,
        "photo_url": photo_url,
        "image_name": image_name,
        "image_index": image_index,
        "bucket_name": bucket_name,
        "active": True,
    }
    status, body = supabase_request(
        "POST",
        "/rest/v1/catalogue_animaux",
        record,
        {
            "Prefer": "resolution=merge-duplicates,return=minimal",
            "on_conflict": "espece,image_index",
        },
    )
    return status


def main():
    total_uploaded = 0
    total_db = 0

    for folder, espece, bucket, categorie in CONFIGS:
        img_dir = os.path.join(CATALOGUE_DIR, folder)
        if not os.path.isdir(img_dir):
            print(f"[SKIP] {folder} — dossier introuvable")
            continue

        files = sorted([
            f for f in os.listdir(img_dir)
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ])

        if not files:
            print(f"[SKIP] {folder} — aucune image")
            continue

        print(f"\n{'='*50}")
        print(f"  {folder.upper()} — {len(files)} images → bucket: {bucket}")
        print(f"{'='*50}")

        ensure_bucket(bucket)

        uploaded = 0
        db_ok = 0
        for i, fname in enumerate(files, 1):
            file_path = os.path.join(img_dir, fname)
            ext = fname.rsplit(".", 1)[-1].lower()
            object_name = f"{espece}-{i:03d}.{ext}"
            photo_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{object_name}"

            status = upload_file(bucket, object_name, file_path)
            if status in (200, 201):
                uploaded += 1
                print(f"  ↑ {object_name} [{status}]")
            else:
                print(f"  ✗ {object_name} [{status}]")

            db_status = upsert_catalogue_record(espece, i, object_name, bucket, photo_url)
            if db_status in (200, 201, 204):
                db_ok += 1
            else:
                print(f"    DB ERREUR {object_name}: {db_status}")

        print(f"  → {uploaded}/{len(files)} uploadés, {db_ok}/{len(files)} en DB")
        total_uploaded += uploaded
        total_db += db_ok

    print(f"\n{'='*50}")
    print(f"TOTAL: {total_uploaded} images uploadées, {total_db} enregistrements DB")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
