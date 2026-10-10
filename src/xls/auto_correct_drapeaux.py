#!/usr/bin/env python3
"""
Corrige automatiquement les noms de pays des drapeaux dont la description
contient le pays de manière identifiable.
Usage : python3 auto_correct_drapeaux.py
"""

import re
import zipfile
import xml.etree.ElementTree as ET
import psycopg2
from pathlib import Path

XLSX_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 Drapeau coeur .xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"

NS = {"xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"}

# Mapping description (mots-clés en minuscules) -> nom officiel
DESCRIPTION_MAP = {
    "australia": "Australie",
    "arabie saoudite": "Arabie saoudite",
    "armenie": "Arménie",
    "chili": "Chili",
    "chine": "Chine",
    "coreen": "Corée du Sud",
    "canada": "Canada",
    "corée du nord": "Corée du Nord",
    "equateur": "Équateur",
    "honduras": "Honduras",
    "hongrie": "Hongrie",
    "kazakhstan": "Kazakhstan",
    "mongolie": "Mongolie",
    "moldavie": "Moldavie",
    "nicaragua": "Nicaragua",
    "nouvelle-zélande": "Nouvelle-Zélande",
    "paraguay": "Paraguay",
    "suedois": "Suède",
    "uruguay": "Uruguay",
    "hong kong": "Hong Kong",
    "sud-africain": "Afrique du Sud",
    "maldives": "Maldives",
    "albanie": "Albanie",
    "andorre": "Andorre",
}


def parse_drawing(content):
    root = ET.fromstring(content)
    images = []
    for anchor in root.findall(".//xdr:twoCellAnchor", NS):
        pic = anchor.find(".//xdr:pic", NS)
        if pic is None:
            continue
        blip = pic.find(".//a:blip", {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"})
        if blip is None:
            continue
        rId = blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
        if not rId:
            continue
        from_cell = anchor.find("xdr:from", NS)
        col = int(from_cell.find("xdr:col", NS).text)
        row = int(from_cell.find("xdr:row", NS).text)

        nv = pic.find(".//xdr:cNvPr", NS)
        descr = nv.get("descr", "") if nv is not None else ""

        images.append({"rId": rId, "col": col, "row": row, "descr": descr})
    return images


def get_image_filename(z, drawing_num, rId):
    rels_path = f"xl/drawings/_rels/drawing{drawing_num}.xml.rels"
    content = z.read(rels_path).decode("utf-8")
    for match in re.finditer(rf'<Relationship[^>]+Id="{rId}"[^>]+Target="([^"]+)"', content):
        return Path(match.group(1).replace("../media/", "")).name
    return None


def detect_country(descr):
    if not descr:
        return None
    lower = descr.lower()
    for keyword, country in DESCRIPTION_MAP.items():
        if keyword in lower:
            return country
    return None


def main():
    print("Analyse des descriptions d'images...")

    with zipfile.ZipFile(XLSX_PATH) as z:
        all_images = []
        drawing_files = sorted(
            [f for f in z.namelist() if re.match(r"xl/drawings/drawing\d+\.xml$", f)],
            key=lambda x: int(re.search(r"\d+", x).group())
        )

        for drawing_path in drawing_files:
            drawing_name = Path(drawing_path).name
            drawing_num = int(re.search(r"\d+", drawing_name).group())
            images = parse_drawing(z.read(drawing_path).decode("utf-8"))
            for img in images:
                filename = get_image_filename(z, drawing_num, img["rId"])
                if filename:
                    all_images.append({
                        "page": drawing_num,
                        "col": img["col"],
                        "row": img["row"],
                        "filename": filename,
                        "descr": img["descr"],
                    })

    # Trier par position visuelle
    all_images.sort(key=lambda x: (x["page"], x["row"], x["col"]))

    corrections = []
    for i, img in enumerate(all_images, 1):
        country = detect_country(img["descr"])
        if country:
            corrections.append((i, country, img["descr"][:60]))

    print(f"\n{len(corrections)} drapeaux identifiables trouvés")

    if not corrections:
        print("Aucune correction possible.")
        return

    print("\nCorrections à appliquer :")
    for idx, country, descr in corrections:
        print(f"  drapeau-{idx:03d} → {country}  ({descr})")

    print("\nMise à jour de la base de données...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    updated = 0
    for idx, country, _ in corrections:
        cur.execute(
            "UPDATE public.catalogue_drapeaux SET pays = %s WHERE image_index = %s",
            (country, idx)
        )
        if cur.rowcount > 0:
            updated += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"\n✅ {updated} noms mis à jour automatiquement")


if __name__ == "__main__":
    main()
