#!/usr/bin/env python3
"""Régénère src/data/prenoms-{filles,garcons,mixtes}.ts depuis le classeur Excel.

Source : onglet "Listes" (colonnes "Liste filles" / "Liste garçons")
Fêtes  : onglet "Prénoms avec fête" (colonnes Fête (fille) / Fête (garçon))

Usage : python3 scripts/generate-prenoms.py
Nécessite : pip3 install openpyxl

Après modification du classeur dans Excel : Cmd+S puis relancer ce script.
"""

import openpyxl
import json
import os

CLASSEUR = os.path.expanduser(
    "~/Desktop/Marché de Noel/37x37_Prenoms_fusion.11.xlsm"
)
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")

# Prénoms absents de l'onglet "Prénoms avec fête" : date ajoutée à la main.
# Format : {"Prénom": {"fete_label": "le JJ Mois", "sexe": "Fille"|"Garçon"|"Mixte"}}
OVERRIDES = {
    "Fabio": {"fete_label": "le 20 Janvier"},
}


def load():
    wb = openpyxl.load_workbook(CLASSEUR, read_only=True, data_only=True)
    fetes = {}
    for r in wb["Prénoms avec fête"].iter_rows(min_row=2, max_col=4, values_only=True):
        if r[0]:
            fetes[str(r[0]).strip()] = (r[1], r[2], r[3])
    filles, garcons = [], []
    for r in wb["Listes"].iter_rows(min_row=2, max_col=2, values_only=True):
        if r[0]:
            filles.append(str(r[0]).strip())
        if r[1]:
            garcons.append(str(r[1]).strip())
    return fetes, filles, garcons


def label(ff, fg):
    if ff and fg and ff != fg:
        return f"{ff} (fille) / {fg} (garçon)"
    return ff or fg or None


def items(names, set_f, set_g, fetes):
    out = []
    for n in names:
        s, ff, fg = fetes.get(n, (None, None, None))
        if s is None:
            s = (
                "Mixte"
                if n in set_f and n in set_g
                else ("Fille" if n in set_f else "Garçon")
            )
        entry = {"prenom": n, "fete_label": label(ff, fg), "sexe": s}
        if n in OVERRIDES:
            entry.update(OVERRIDES[n])
        out.append(entry)
    return out


def write(path, typename, constname, data):
    lines = [
        f"export interface {typename} {{",
        "  prenom: string;",
        "  fete_label: string | null;",
        "  sexe: string | null;",
        "}",
        "",
        f"export const {constname}: {typename}[] = [",
    ]
    for it in data:
        lines.append(
            '  {\n    "prenom": %s,\n    "fete_label": %s,\n    "sexe": %s\n  },'
            % (
                json.dumps(it["prenom"], ensure_ascii=False),
                json.dumps(it["fete_label"], ensure_ascii=False),
                json.dumps(it["sexe"], ensure_ascii=False),
            )
        )
    lines.append("];\n")
    with open(path, "w") as f:
        f.write("\n".join(lines))


def main():
    fetes, filles, garcons = load()
    set_f, set_g = set(filles), set(garcons)
    write(os.path.join(DATA_DIR, "prenoms-filles.ts"), "PrenomFille", "PRENOMS_FILLES", items(filles, set_f, set_g, fetes))
    write(os.path.join(DATA_DIR, "prenoms-garcons.ts"), "PrenomGarcon", "PRENOMS_GARCONS", items(garcons, set_f, set_g, fetes))
    print("filles:", len(filles), "garcons:", len(garcons))


if __name__ == "__main__":
    main()
