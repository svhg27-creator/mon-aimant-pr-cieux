#!/usr/bin/env python3
"""
Extrait les images du fichier 37x37 Drapeau coeur .xlsx vers public/catalogue/drapeaux/
avec le bon ordre numérique, et met à jour la table public.catalogue_drapeaux.
Usage : python3 extract_drapeaux.py
"""

import os
import re
import zipfile
import openpyxl
import psycopg2
from pathlib import Path

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 Drapeau coeur .xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
OUTPUT_DIR = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/public/catalogue/drapeaux"
LOCAL_PREFIX = "/catalogue/drapeaux"


def extract_number(name):
    """Extrait le numéro d'un chemin image comme xl/media/image123.png."""
    match = re.search(r"(\d+)", Path(name).name)
    return int(match.group(1)) if match else 999999


def extract_images():
    """Extrait les images dans l'ordre numérique correct."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with zipfile.ZipFile(XLSX_PATH) as z:
        media_files = sorted(
            [f for f in z.namelist() if "xl/media/" in f and f.lower().endswith((".png", ".jpg", ".jpeg"))],
            key=extract_number
        )

        print(f"{len(media_files)} images trouvées")

        for i, media_path in enumerate(media_files, 1):
            ext = Path(media_path).suffix.lower().lstrip(".")
            image_name = f"drapeau-{i:03d}.{ext}"
            dest = os.path.join(OUTPUT_DIR, image_name)
            with open(dest, "wb") as f:
                f.write(z.read(media_path))
            print(f"  ✅ {image_name} ← {Path(media_path).name}")

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


def extract_noms():
    """Extrait les noms de pays dans l'ordre visuel."""
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    noms = []
    for sheet in wb.sheetnames:
        ws = wb[sheet]
        for row in [4, 7, 10, 13, 16]:
            for col in [2, 4, 6]:
                val = ws.cell(row=row, column=col).value
                if val and str(val).strip():
                    text = str(val).strip()
                    if "🖼️" in text or "🌍" in text or text.lower().startswith("page"):
                        continue
                    noms.append(text)
    return noms


def update_database(noms):
    """Met à jour la base de données avec les bons chemins et noms."""
    print("\nMise à jour de la base de données...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # Supprimer les anciennes entrées
    cur.execute("DELETE FROM public.catalogue_drapeaux")
    deleted = cur.rowcount
    print(f"  {deleted} anciennes lignes supprimées")

    files = sorted(Path(OUTPUT_DIR).glob("drapeau-*"))
    inserted = 0
    for i, f in enumerate(files, 1):
        image_name = f.name
        photo_url = f"{LOCAL_PREFIX}/{image_name}"
        pays = noms[i - 1] if i <= len(noms) else f"Drapeau {i}"
        cur.execute("""
            INSERT INTO public.catalogue_drapeaux (pays, region, photo_url, image_name, image_index, active)
            VALUES (%s, %s, %s, %s, %s, true)
        """, (pays, "À définir", photo_url, image_name, i))
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"  {inserted} lignes insérées")


def main():
    print("Extraction des images dans le bon ordre...")
    total = extract_images()
    remove_jpeg_duplicates()
    noms = extract_noms()
    print(f"\nNoms extraits : {len(noms)}")
    update_database(noms)
    print(f"\n✅ Terminé : {total} images et noms mis à jour")


if __name__ == "__main__":
    main()
