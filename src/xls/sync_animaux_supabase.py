#!/usr/bin/env python3
"""
Synchronise les catalogues animaux vers Supabase (DB + Storage) depuis :
  - les images locales : public/catalogue/animaux/<espece>s/<espece>-NNN.png
    (déjà extraites dans le bon ordre depuis les fichiers 37x37 *.xlsx)
  - les noms de races : src/data/<espece>s.ts (source de vérité)

Pour chaque espèce configurée :
  1. Upload les images dans le bucket (upsert)
  2. Purge puis ré-insère les lignes catalogue_animaux (nom = race,
     photo_url = URL publique du bucket)
  3. Supprime les lignes/objets obsolètes au-delà du nombre de races

Usage : python3 sync_animaux_supabase.py          # toutes les espèces
        python3 sync_animaux_supabase.py chien    # une seule espèce
Prérequis : le projet Supabase doit être actif (pas en pause).
"""

import os
import re
import sys
import json
import urllib.request
import urllib.error

PROJECT_DIR = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux"

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

# espece -> (bucket, dossier images, fichier data)
CONFIGS = {
    "chat":   ("catalogue-animaux-chats",   "catalogue/animaux/chats",   "chats.ts"),
    "chien":  ("catalogue-animaux-chiens",  "catalogue/animaux/chiens",  "chiens.ts"),
    "lapin":  ("catalogue-animaux-lapins",  "catalogue/animaux/lapins",  "lapins.ts"),
    "oiseau": ("catalogue-animaux-oiseaux", "catalogue/animaux/oiseaux", "oiseaux.ts"),
    "rongeur":("catalogue-animaux-rongeurs","catalogue/animaux/rongeurs","rongeurs.ts"),
}

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}


def api(method, path, data=None, headers=None, raw=False):
    url = f"{SUPABASE_URL}{path}"
    body = data if raw else (json.dumps(data).encode() if data is not None else None)
    h = {**HEADERS, **(headers or {})}
    if not raw and data is not None:
        h.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            payload = r.read()
            return r.status, (payload if raw else (json.loads(payload) if payload else None))
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        print(f"\n❌ Impossible de joindre Supabase : {e}")
        print("   Le projet est probablement en pause — réactive-le sur")
        print("   https://supabase.com/dashboard puis relance ce script.")
        sys.exit(1)


def load_races(ts_file):
    """Lit les noms de races dans src/data/<espece>s.ts, dans l'ordre."""
    path = os.path.join(PROJECT_DIR, "src/data", ts_file)
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return re.findall(r'race:\s*"([^"]+)"', f.read())


def sync_espece(espece, bucket, img_subdir, ts_file):
    img_dir = os.path.join(PROJECT_DIR, "public", img_subdir)
    races = load_races(ts_file)
    files = sorted(f for f in os.listdir(img_dir)
                   if re.fullmatch(rf"{espece}-\d+\.png", f)) if os.path.isdir(img_dir) else []

    print(f"\n{'='*55}\n{espece.upper()} — {len(races)} races, {len(files)} images → {bucket}")
    if not races or not files:
        print("   ⏭  rien à faire (races ou images manquantes)")
        return
    if len(files) != len(races):
        print(f"   ⚠️  désalignement : {len(files)} images vs {len(races)} races — ignoré")
        return

    status, _ = api("GET", f"/storage/v1/bucket/{bucket}")
    if status != 200:
        status, body = api("POST", "/storage/v1/bucket",
                           {"id": bucket, "name": bucket, "public": True})
        if status not in (200, 201):
            print(f"   ❌ Bucket : {status} {body}")
            return

    # Purge des anciennes lignes (évite les doublons)
    status, _ = api("DELETE", f"/rest/v1/catalogue_animaux?espece=ilike.{espece}")
    print(f"   purge lignes : {status}")

    up_ok = db_ok = 0
    for i, (fname, race) in enumerate(zip(files, races), 1):
        with open(os.path.join(img_dir, fname), "rb") as f:
            data = f.read()
        status, _ = api("POST", f"/storage/v1/object/{bucket}/{fname}", data,
                        headers={"Content-Type": "image/png", "x-upsert": "true"}, raw=True)
        up_ok += status in (200, 201)
        if status not in (200, 201):
            print(f"   [{i:03d}] ✗ upload {fname} [{status}]")

        record = {
            "categorie": "animaux",
            "espece": espece,
            "nom": race,
            "description": race,
            "photo_url": f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{fname}",
            "image_name": fname,
            "image_index": i,
            "bucket_name": bucket,
            "active": True,
        }
        status, body = api("POST", "/rest/v1/catalogue_animaux", record,
                           headers={"Prefer": "return=minimal"})
        db_ok += status in (200, 201, 204)
        if status not in (200, 201, 204):
            print(f"   [{i:03d}] ✗ DB {race}: {status} {body}")

    # Nettoyage des objets obsolètes dans le bucket
    status, objects = api("POST", f"/storage/v1/object/list/{bucket}",
                          {"prefix": "", "limit": 500, "offset": 0})
    stale = []
    if status == 200 and isinstance(objects, list):
        valid = {f"{espece}-{i:03d}.png" for i in range(1, len(races) + 1)}
        stale = [o["name"] for o in objects if o.get("name") not in valid]
        if stale:
            api("DELETE", f"/storage/v1/object/{bucket}", {"prefixes": stale})

    print(f"   → {up_ok}/{len(files)} images, {db_ok}/{len(races)} lignes DB"
          + (f", {len(stale)} objets supprimés" if stale else ""))


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for espece, (bucket, img_subdir, ts_file) in CONFIGS.items():
        if only and espece != only:
            continue
        sync_espece(espece, bucket, img_subdir, ts_file)
    print("\n✅ Synchronisation terminée")


if __name__ == "__main__":
    main()
