#!/usr/bin/env python3
"""
Import des prénoms depuis le fichier Excel vers Supabase (table public.prenoms).
Usage : python3 import_prenoms.py [--force]

Le fichier Excel contient deux onglets :
  - "Prènom Fille"  : Prénom | Description | date texte | date datetime
  - "Prènom Garçon" : Prénom | date texte | date datetime

Les colonnes origine et signification ne sont pas présentes dans le fichier,
elles sont laissées à NULL en base (à compléter manuellement si besoin).
"""

import argparse
import openpyxl
import psycopg2
from datetime import date, datetime

EXCEL_PATH = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/src/xls/37x37 Prénoms.xlsx"
DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"


def normalize_date(raw_date):
    """Nettoie une date Excel : corrige l'année 1900 et retourne un objet date."""
    if not raw_date:
        return None
    if hasattr(raw_date, 'date'):
        d = raw_date.date()
    elif isinstance(raw_date, date):
        d = raw_date
    else:
        return None

    # Excel représente parfois les dates de fête avec l'année 1900/2024 au lieu de
    # la date récurrente. On normalise en année 2024 pour conserver mois/jour.
    if d.year < 2000:
        d = d.replace(year=2024)
    return d


def parse_fille_row(row):
    """Onglet Fille : Prénom | 'Se fête' | date texte | date datetime"""
    prenom = str(row[0]).strip() if row[0] else None
    fete_label = str(row[2]).strip() if row[2] else None
    fete_date = normalize_date(row[3])
    return prenom, fete_label, fete_date


def parse_garcon_row(row):
    """Onglet Garçon : Prénom | date texte | date datetime"""
    prenom = str(row[0]).strip() if row[0] else None
    fete_label = str(row[1]).strip() if row[1] else None
    fete_date = normalize_date(row[2])
    return prenom, fete_label, fete_date


def load_prenoms_from_excel():
    """Charge tous les prénoms depuis le fichier Excel."""
    print("Lecture du fichier Excel...")
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True, data_only=True)
    prenoms = []

    # --- Filles ---
    ws_f = wb["Prènom Fille"]
    for row in ws_f.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        prenom, fete_label, fete_date = parse_fille_row(row)
        if prenom:
            prenoms.append((prenom, "fille", fete_label, fete_date))

    nb_filles = len([p for p in prenoms if p[1] == "fille"])
    print(f"  → {nb_filles} prénoms filles")

    # --- Garçons ---
    ws_g = wb["Prènom Garçon"]
    for row in ws_g.iter_rows(min_row=2, values_only=True):
        if not row or not row[0] or str(row[0]).strip().lower() in ("prénom", ""):
            continue
        prenom, fete_label, fete_date = parse_garcon_row(row)
        if prenom:
            prenoms.append((prenom, "garcon", fete_label, fete_date))

    nb_garcons = len([p for p in prenoms if p[1] == "garcon"])
    print(f"  → {nb_garcons} prénoms garçons")
    print(f"  → Total : {len(prenoms)} prénoms")
    return prenoms


def import_to_supabase(prenoms, force=False):
    """Insère ou met à jour les prénoms en base."""
    print("\nConnexion à Supabase...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    if force:
        print("⚠️  Mode force : suppression des anciennes entrées...")
        cur.execute("DELETE FROM public.prenoms WHERE genre IN ('fille', 'garcon')")
        print(f"   {cur.rowcount} lignes supprimées")

    print("Insertion en base (upsert sur conflit)...")

    insert_sql = """
        INSERT INTO public.prenoms (prenom, genre, fete_label, fete_date, active)
        VALUES (%s, %s::public.prenom_genre, %s, %s, true)
        ON CONFLICT DO NOTHING
    """

    inserted = 0
    skipped = 0
    errors = 0
    for prenom, genre, fete_label, fete_date in prenoms:
        try:
            cur.execute(insert_sql, (prenom, genre, fete_label, fete_date))
            if cur.rowcount > 0:
                inserted += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  ERREUR pour {prenom} ({genre}): {e}")
            conn.rollback()
            errors += 1
            continue

    conn.commit()

    # Stats finales
    cur.execute("SELECT genre, COUNT(*) FROM public.prenoms GROUP BY genre")
    stats = cur.fetchall()
    cur.close()
    conn.close()

    print(f"\n✅ Import terminé !")
    print(f"   Insérés  : {inserted}")
    print(f"   Ignorés  : {skipped} (déjà présents)")
    if errors:
        print(f"   Erreurs  : {errors}")
    print(f"\n   Total en base :")
    for genre, count in stats:
        print(f"      {genre}: {count}")


def main():
    parser = argparse.ArgumentParser(description="Import des prénoms depuis Excel vers Supabase")
    parser.add_argument("--force", action="store_true", help="Vide la table avant réimport")
    args = parser.parse_args()

    prenoms = load_prenoms_from_excel()
    import_to_supabase(prenoms, force=args.force)


if __name__ == "__main__":
    main()
