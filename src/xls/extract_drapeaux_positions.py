#!/usr/bin/env python3
"""
Extrait les images du fichier 37x37 Drapeau coeur .xlsx en utilisant les positions
exactes des images dans les fichiers drawing.xml pour les associer aux bons noms de pays.
Usage : python3 extract_drapeaux_positions.py
"""

import os
import re
import zipfile
import xml.etree.ElementTree as ET
import openpyxl
import json
from pathlib import Path

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 Drapeau coeur .xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
OUTPUT_DIR = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/public/catalogue/drapeaux"
LOCAL_PREFIX = "/catalogue/drapeaux"

NAMESPACES = {
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def parse_drawing(z, drawing_name):
    """Parse un fichier drawing.xml et retourne la liste des images avec rId, col, row."""
    content = z.read(f"xl/drawings/{drawing_name}").decode("utf-8")
    root = ET.fromstring(content)

    images = []
    for anchor in root.findall(".//xdr:twoCellAnchor", NAMESPACES):
        pic = anchor.find(".//xdr:pic", NAMESPACES)
        if pic is None:
            continue

        blip = pic.find(".//a:blip", {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"})
        if blip is None:
            continue

        rId = blip.get(f'{{{NAMESPACES["r"]}}}embed')
        if not rId:
            continue

        from_cell = anchor.find("xdr:from", NAMESPACES)
        col = int(from_cell.find("xdr:col", NAMESPACES).text)
        row = int(from_cell.find("xdr:row", NAMESPACES).text)

        images.append({"rId": rId, "col": col, "row": row})

    return images


def get_image_filename(z, drawing_num, rId):
    """Retourne le nom du fichier image pour un rId donné."""
    rels_path = f"xl/drawings/_rels/drawing{drawing_num}.xml.rels"
    content = z.read(rels_path).decode("utf-8")
    for match in re.finditer(rf'<Relationship[^>]+Id="{rId}"[^>]+Target="([^"]+)"', content):
        target = match.group(1)
        return target.replace("../media/", "")
    return None


def extract_all_images():
    """Extrait toutes les images avec leur position et nom de fichier."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for existing in Path(OUTPUT_DIR).glob("*"):
        existing.unlink()

    with zipfile.ZipFile(XLSX_PATH) as z:
        all_images = []

        drawing_files = sorted(
            [f for f in z.namelist() if re.match(r"xl/drawings/drawing\d+\.xml$", f)],
            key=lambda x: int(re.search(r"\d+", x).group())
        )

        for drawing_path in drawing_files:
            drawing_name = Path(drawing_path).name
            drawing_num = int(re.search(r"\d+", drawing_name).group())

            images = parse_drawing(z, drawing_name)
            for img in images:
                filename = get_image_filename(z, drawing_num, img["rId"])
                if filename:
                    all_images.append({
                        "page": drawing_num,
                        "col": img["col"],
                        "row": img["row"],
                        "filename": filename,
                    })

        # Trier par page, puis par row, puis par col (ordre visuel)
        all_images.sort(key=lambda x: (x["page"], x["row"], x["col"]))

        print(f"{len(all_images)} images trouvées")

        for i, img in enumerate(all_images, 1):
            ext = Path(img["filename"]).suffix.lower().lstrip(".")
            image_name = f"drapeau-{i:03d}.{ext}"
            dest = os.path.join(OUTPUT_DIR, image_name)
            with open(dest, "wb") as f:
                f.write(z.read(f"xl/media/{img['filename']}"))
            print(f"  ✅ {image_name} ← {img['filename']} (page={img['page']}, row={img['row']}, col={img['col']})")

    return all_images


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


def extract_noms_by_position():
    """Extrait les noms de pays en fonction des positions des images."""
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)

    with zipfile.ZipFile(XLSX_PATH) as z:
        drawing_files = sorted(
            [f for f in z.namelist() if re.match(r"xl/drawings/drawing\d+\.xml$", f)],
            key=lambda x: int(re.search(r"\d+", x).group())
        )

        noms = []
        for drawing_path in drawing_files:
            drawing_name = Path(drawing_path).name
            drawing_num = int(re.search(r"\d+", drawing_name).group())
            ws = wb[wb.sheetnames[drawing_num - 1]]

            images = parse_drawing(z, drawing_name)
            # Pour chaque image, lire le nom dans la cellule juste en dessous
            # Les images sont centrées sur les colonnes B, D, F (indices 1, 3, 5)
            # Les noms sont dans la cellule en dessous (row + 1 ou row + 2)
            images.sort(key=lambda x: (x["row"], x["col"]))
            for img in images:
                # La cellule nom est à la colonne de l'image, 2 lignes en dessous (0-indexed -> +2 openpyxl)
                name_col = img["col"] + 1
                best_nom = None
                for delta in [2, 1, 3]:
                    val = ws.cell(row=img["row"] + delta, column=name_col).value
                    if val and str(val).strip():
                        text = str(val).strip()
                        if "🖼️" not in text and "🌍" not in text and not text.lower().startswith("page"):
                            best_nom = text
                            break
                noms.append(best_nom or f"Drapeau {len(noms) + 1}")

    return noms


def export_data(noms):
    """Exporte les noms et chemins vers src/data/drapeaux-coeur.ts et un JSON."""
    print(f"\nNoms extraits : {len(noms)}")

    files = sorted(Path(OUTPUT_DIR).glob("drapeau-*"))
    items = []
    for i, f in enumerate(files, 1):
        image_name = f.name
        photo_url = f"{LOCAL_PREFIX}/{image_name}"
        pays = noms[i - 1] if i <= len(noms) else f"Drapeau {i}"
        items.append({
            "id": i,
            "pays": pays,
            "photo_url": photo_url,
            "image_index": i,
            "active": True,
        })

    json_path = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/data/drapeaux-coeur.json"
    ts_path = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/data/drapeaux-coeur.ts"

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write('export interface DrapeauCoeurItem {\n')
        f.write('  id: number;\n')
        f.write('  pays: string;\n')
        f.write('  photo_url: string;\n')
        f.write('  image_index: number;\n')
        f.write('  active: boolean;\n')
        f.write('}\n\n')
        f.write('export const DRAPEAUX_COEUR: DrapeauCoeurItem[] = ')
        f.write(json.dumps(items, ensure_ascii=False, indent=2))
        f.write(';\n')

    print(f"  {len(items)} drapeaux exportés vers {ts_path}")


def main():
    print("Extraction des images avec positions exactes...")
    extract_all_images()
    remove_jpeg_duplicates()
    noms = extract_noms_by_position()
    export_data(noms)
    print("\n✅ Terminé : images et noms mis à jour avec les positions exactes")


if __name__ == "__main__":
    main()
