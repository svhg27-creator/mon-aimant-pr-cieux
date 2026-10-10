#!/usr/bin/env python3
"""
Extrait les images du fichier 37x37 Rongeur.xlsx vers public/catalogue/animaux/rongeurs/
et met à jour la table public.catalogue_animaux avec les chemins locaux.
Usage : python3 extract_rongeurs.py
"""

import os
import zipfile
import psycopg2
from pathlib import Path

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 Rongeur.xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
OUTPUT_DIR = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/public/catalogue/animaux/rongeurs"
LOCAL_PREFIX = "/catalogue/animaux/rongeurs"
CATEGORIE = "rongeur"


def extract_images():
    """Extrait les images du fichier Excel dans le dossier public."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with zipfile.ZipFile(XLSX_PATH) as z:
        media_files = sorted([
            f for f in z.namelist()
            if "xl/media/" in f and f.lower().endswith((".png", ".jpg", ".jpeg"))
        ])

        print(f"{len(media_files)} images trouvées dans le Excel")

        for i, media_path in enumerate(media_files, 1):
            ext = media_path.rsplit(".", 1)[-1].lower()
            image_name = f"rongeur-{i:03d}.{ext}"
            dest = os.path.join(OUTPUT_DIR, image_name)
            with open(dest, "wb") as f:
                f.write(z.read(media_path))
            print(f"  ✅ {image_name}")

    return len(media_files)


def remove_jpeg_duplicates():
    """Supprime les fichiers .jpeg si un .png existe pour le même index."""
    removed = 0
    for jpeg in Path(OUTPUT_DIR).glob("*.jpeg"):
        png = jpeg.with_suffix(".png")
        if png.exists():
            jpeg.unlink()
            removed += 1
            print(f"  🗑️  doublon supprimé : {jpeg.name}")
    return removed


def update_database():
    """Met à jour la base de données avec les chemins locaux."""
    print("\nMise à jour de la base de données...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    cur.execute("DELETE FROM public.catalogue_animaux WHERE LOWER(categorie) = 'rongeur' OR LOWER(espece) = 'rongeur'")
    deleted = cur.rowcount
    print(f"  {deleted} anciennes lignes supprimées")

    files = sorted(Path(OUTPUT_DIR).glob("rongeur-*"))
    inserted = 0
    for i, f in enumerate(files, 1):
        image_name = f.name
        photo_url = f"{LOCAL_PREFIX}/{image_name}"
        nom = f"Rongeur {i}"
        cur.execute("""
            INSERT INTO public.catalogue_animaux (categorie, espece, nom, description, photo_url, image_name, image_index, active, bucket_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, true, %s)
        """, (CATEGORIE, CATEGORIE, nom, nom, photo_url, image_name, i, "catalogue-rongeurs"))
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"  {inserted} lignes insérées")


def main():
    print("Extraction des images...")
    total = extract_images()
    remove_jpeg_duplicates()
    update_database()
    print(f"\n✅ Terminé : {total} images extraites et enregistrées en base")


if __name__ == "__main__":
    main()
