#!/usr/bin/env python3
"""
Extrait les images d'un fichier xlsx de planche catalogue (37x37 *.xlsx)
dans l'ordre visuel (position des ancres : feuille → ligne → colonne)
et applique le recadrage Excel (a:srcRect) pour que l'image extraite
corresponde à ce qui est affiché dans Excel (gros plan, cadrage…).

Usage : python3 extract_xls_images.py <fichier.xlsx> <dossier_sortie> <prefixe>
Ex.   : python3 extract_xls_images.py "37x37 CHIEN.xlsx" \
            ../../public/catalogue/animaux/chiens chien
"""

import zipfile
import re
import sys
import os
import io
import xml.etree.ElementTree as ET
from PIL import Image

NS = {
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}
R_EMBED = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"


def ordered_images(xlsx_path):
    """Retourne [(media_path, srcRect|None)] dans l'ordre visuel des feuilles."""
    z = zipfile.ZipFile(xlsx_path)

    wb = z.read("xl/workbook.xml").decode()
    wb_rels = z.read("xl/_rels/workbook.xml.rels").decode()
    rid2target = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', wb_rels))
    sheets = [
        rid2target[m.group(1)]
        for m in re.finditer(r'<sheet name="[^"]+"[^>]*r:id="(rId\d+)"', wb)
    ]

    result = []
    for target in sheets:
        snum = re.search(r"sheet(\d+)\.xml", target).group(1)
        sheet_xml = z.read(f"xl/worksheets/sheet{snum}.xml").decode()
        m = re.search(r'<drawing r:id="(rId\d+)"', sheet_xml)
        if not m:
            continue
        srels = z.read(f"xl/worksheets/_rels/sheet{snum}.xml.rels").decode()
        dr_name = dict(
            re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', srels)
        )[m.group(1)].split("/")[-1]
        dr_rels = z.read(f"xl/drawings/_rels/{dr_name}.rels").decode()
        rid2media = dict(
            re.findall(r'Id="(rId\d+)"[^>]*Target="\.\./media/([^"]+)"', dr_rels)
        )
        tree = ET.fromstring(z.read(f"xl/drawings/{dr_name}"))

        anchors = []
        for anchor in tree:
            if anchor.tag.split("}")[-1] not in ("twoCellAnchor", "oneCellAnchor"):
                continue
            frm = anchor.find("xdr:from", NS)
            blip = anchor.find(".//a:blip", NS)
            rid = blip.get(R_EMBED) if blip is not None else None
            media = rid2media.get(rid)
            if not media:
                continue
            # Recadrage éventuel : <a:srcRect l t r b> en 1/1000 de %
            rect = anchor.find(".//a:srcRect", NS)
            src_rect = None
            if rect is not None:
                src_rect = {
                    k: int(rect.get(k, "0")) / 100000 for k in ("l", "t", "r", "b")
                }
            anchors.append((
                int(frm.find("xdr:row", NS).text),
                int(frm.find("xdr:col", NS).text),
                media,
                src_rect,
            ))
        anchors.sort(key=lambda a: (a[0], a[1]))
        result.extend((media, rect) for _, _, media, rect in anchors)
    return z, result


def main():
    xlsx_path, out_dir, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)

    z, images = ordered_images(xlsx_path)
    print(f"{len(images)} images (ordre visuel + recadrage Excel)")

    cropped = 0
    for i, (media, rect) in enumerate(images, 1):
        img = Image.open(io.BytesIO(z.read(f"xl/media/{media}")))
        if rect and any(v > 0 for v in rect.values()):
            w, h = img.size
            box = (
                round(rect["l"] * w),
                round(rect["t"] * h),
                round((1 - rect["r"]) * w),
                round((1 - rect["b"]) * h),
            )
            img = img.crop(box)
            cropped += 1
            tag = f"recadrée l{rect['l']:.0%} t{rect['t']:.0%} r{rect['r']:.0%} b{rect['b']:.0%}"
        else:
            tag = ""
        dest = os.path.join(out_dir, f"{prefix}-{i:03d}.png")
        img.save(dest, "PNG")
        print(f"  {prefix}-{i:03d}.png ← {media} {tag}")

    print(f"\n✅ {len(images)} images écrites dans {out_dir} ({cropped} recadrées)")


if __name__ == "__main__":
    main()
