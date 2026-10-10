#!/usr/bin/env python3
"""
Prépare les visuels QR code des drapeaux cœur → public/catalogue/drapeaux-qr/

Source : « QR code PNG Pays » (fichiers utilisateur, un QR par pays encodant
la page Wikipédia FR du pays). Les pays sans fichier reçoivent un QR généré
avec le même motif (lien Wikipédia FR) et le même rendu noir/blanc.

Sortie : qr-NNN.png où NNN = image_index du drapeau dans drapeaux-coeur.json.

Usage : python3 prepare_qr_drapeaux.py
"""

import json
import shutil
import unicodedata
import urllib.parse
from pathlib import Path

import qrcode

PROJECT = Path("/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux")
QR_SRC = Path("/Users/stephanevigneron/Desktop/Projet Magnet/QR Code/QR code PNG Pays ")
OUT_DIR = PROJECT / "public/catalogue/drapeaux-qr"

# alias fichier QR -> nom du pays dans le catalogue
ALIAS = {
    "ANGLETERRE": "Royaume-Uni",
    "BOSNIE": "Bosnie-Herzégovine",
    "COREE DU NORD": "Corée du Nord",
    "COREE DU SUD": "Corée du Sud",
    "COTE D'IVOIRE": "Côte d'Ivoire",
    "ETATS UNIS": "États-Unis",
    "NOUVELLE ZELANDE": "Nouvelle-Zélande",
    "PAYS BAS": "Pays-Bas",
    "TCHEQUIE": "République tchèque",
}

# pays du catalogue sans article Wikipédia évident / entrées parasites
NO_QR = {"Drapeau 47"}

# nom catalogue -> titre de l'article Wikipédia FR quand il diffère
WIKI_ALIAS = {
    "Congo (RDC)": "République démocratique du Congo",
    "Congo": "République du Congo",
    "République tchèque": "Tchéquie",
    "Pays-Bas": "Pays-Bas",
    "Royaume-Uni": "Royaume-Uni",
    "États-Unis": "États-Unis",
    "Bosnie-Herzégovine": "Bosnie-Herzégovine",
    "Côte d'Ivoire": "Côte d'Ivoire",
    "Trinité-et-Tobago": "Trinité-et-Tobago",
    "Saint-Christophe-et-Niévès": "Saint-Christophe-et-Niévès",
    "Saint-Vincent-et-les-Grenadines": "Saint-Vincent-et-les-Grenadines",
    "São Tomé-et-Príncipe": "São Tomé-et-Principe",
    "Timor oriental": "Timor oriental",
    "Îles Marshall": "Îles Marshall",
    "Îles Salomon": "Îles Salomon",
    "Micronésie": "Micronésie (pays)",
    "Palestine": "Palestine",
    "Vatican": "Vatican",
    "Eswatini": "Eswatini",
    "Curaçao": "Curaçao",
}


def norm(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s.upper()) if unicodedata.category(c) != "Mn"
    )


def wiki_url(pays: str) -> str:
    titre = WIKI_ALIAS.get(pays, pays).replace(" ", "_")
    return "https://fr.wikipedia.org/wiki/" + urllib.parse.quote(titre)


def make_qr(url: str, dest: Path):
    qr = qrcode.QRCode(border=4, box_size=10)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(dest)


def main():
    drapeaux = json.loads((PROJECT / "src/data/drapeaux-coeur.json").read_text(encoding="utf-8"))
    qr_files = {}
    for f in QR_SRC.glob("*.png"):
        pays = ALIAS.get(f.stem.upper(), f.stem)
        qr_files[norm(pays)] = f

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("qr-*.png"):
        old.unlink()

    copies, generes = 0, 0
    for d in drapeaux:
        pays = d["pays"]
        if pays in NO_QR:
            d["qr_url"] = None
            continue
        d["qr_url"] = f"/catalogue/drapeaux-qr/qr-{d['image_index']:03d}.png"
        dest = OUT_DIR / f"qr-{d['image_index']:03d}.png"
        src = qr_files.get(norm(pays))
        if src:
            shutil.copyfile(src, dest)
            copies += 1
        else:
            make_qr(wiki_url(pays), dest)
            generes += 1

    print(f"{copies} QR copiés, {generes} QR générés")
    print(f"Total fichiers : {len(list(OUT_DIR.glob('qr-*.png')))}")

    # Réécrit les fichiers data avec le champ qr_url
    (PROJECT / "src/data/drapeaux-coeur.json").write_text(
        json.dumps(drapeaux, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    body = ",\n".join(
        "  {\n"
        f'    "id": {d["id"]},\n'
        f'    "pays": {json.dumps(d["pays"], ensure_ascii=False)},\n'
        f'    "photo_url": {json.dumps(d["photo_url"], ensure_ascii=False)},\n'
        f'    "qr_url": {json.dumps(d["qr_url"], ensure_ascii=False)},\n'
        f'    "image_index": {d["image_index"]},\n'
        f'    "active": {str(d["active"]).lower()}\n'
        "  }"
        for d in drapeaux
    )
    ts = (
        "export interface DrapeauCoeurItem {\n"
        "  id: number;\n"
        "  pays: string;\n"
        "  photo_url: string;\n"
        "  qr_url: string | null;\n"
        "  image_index: number;\n"
        "  active: boolean;\n"
        "}\n\n"
        f"export const DRAPEAUX_COEUR: DrapeauCoeurItem[] = [\n{body},\n];\n"
    )
    (PROJECT / "src/data/drapeaux-coeur.ts").write_text(ts, encoding="utf-8")
    print("  drapeaux-coeur.json / .ts mis à jour (qr_url)")


if __name__ == "__main__":
    main()
