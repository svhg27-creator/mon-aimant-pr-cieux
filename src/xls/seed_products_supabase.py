#!/usr/bin/env python3
"""
Remplit la table Supabase `products` avec tous les articles vendables :

  - les 5 formats de magnets personnalisés (magnet-rond-25, …)
  - un produit par visuel de catalogue animaux (catalogue-chat-1, …)
    → le nom du visuel apparaît dans les commandes Stripe
  - un produit par drapeau cœur (catalogue-drapeau-1, …)

Les IDs correspondent aux `product_id` envoyés par le site à la fonction
`create-checkout` (CatalogueBuyBar variantKey / AddToCartButton handle).

Usage : python3 seed_products_supabase.py
Prérequis : le projet Supabase doit être actif (pas en pause).
"""

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

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

ESPECES = {
    "chat": "Chat",
    "chien": "Chien",
    "lapin": "Lapin",
    "oiseau": "Oiseau",
    "rongeur": "Rongeur",
}

# Prix en centimes — doivent correspondre aux prix affichés côté site
SHAPES = [
    ("magnet-rond-25",          "Magnet Rond Ø25 mm",          250),
    ("magnet-rond-37",          "Magnet Rond Ø37 mm",          350),
    ("magnet-carre-37",         "Magnet Carré 37×37 mm",       450),
    ("magnet-coeur-70",         "Magnet Cœur 70×65 mm",        500),
    ("magnet-rectangle-37x115", "Magnet Rectangle 115×37 mm",  650),
]

PRIX_ANIMAL = 450   # Carré 37×37
PRIX_DRAPEAU = 500  # Cœur 70×65


def api(method, path, data=None):
    req = urllib.request.Request(
        f"{SUPABASE_URL}{path}",
        method=method,
        data=json.dumps(data).encode() if data is not None else None,
        headers=HEADERS,
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read()
            return r.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def main():
    rows = []

    # 1. Formats personnalisables
    for pid, name, price in SHAPES:
        rows.append({"id": pid, "name": name, "unit_price": price, "currency": "eur", "is_active": True})

    # 2. Visuels catalogue animaux (noms depuis catalogue_animaux)
    for espece, label in ESPECES.items():
        status, data = api(
            "GET",
            f"/rest/v1/catalogue_animaux?espece=eq.{espece}&select=image_index,nom&order=image_index",
        )
        if status != 200 or not isinstance(data, list):
            print(f"  {espece}: ERREUR {status} — {data}")
            continue
        for row in data:
            rows.append({
                "id": f"catalogue-{espece}-{row['image_index']}",
                "name": f"Magnet {label} — {row['nom']}",
                "unit_price": PRIX_ANIMAL,
                "currency": "eur",
                "is_active": True,
            })
        print(f"  {espece}: {len(data)} produits")

    # 3. Drapeaux cœur (noms depuis le fichier data local)
    with open(f"{PROJECT_DIR}/src/data/drapeaux-coeur.json", encoding="utf-8") as f:
        drapeaux = json.load(f)
    for d in drapeaux:
        rows.append({
            "id": f"catalogue-drapeau-{d['image_index']}",
            "name": f"Magnet Drapeau cœur — {d['pays']}",
            "unit_price": PRIX_DRAPEAU,
            "currency": "eur",
            "is_active": True,
        })
    print(f"  drapeau: {len(drapeaux)} produits")

    # 4. Upsert par lots de 200
    print(f"\n{len(rows)} produits à insérer/mettre à jour…")
    inserted = 0
    for i in range(0, len(rows), 200):
        batch = rows[i:i + 200]
        status, data = _upsert(batch)
        if status not in (200, 201):
            print(f"  ERREUR upsert lot {i}: {status} — {data}")
            return
        inserted += len(batch)
    print(f"OK : {inserted} produits synchronisés")


def _upsert(batch):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/products",
        method="POST",
        data=json.dumps(batch).encode(),
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read()
            return r.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


if __name__ == "__main__":
    main()
