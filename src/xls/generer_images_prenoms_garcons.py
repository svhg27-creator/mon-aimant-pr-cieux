#!/usr/bin/env python3
"""
Génère des images de fête de prénoms garçons au style du modèle Matéo.
Style : fond bleu clair, texte noir centré, police Chalkboard SE.
Usage : python3 generer_images_prenoms_garcons.py
"""

import os
import psycopg2
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

DB_URL = "postgresql://postgres:1HVEqHSfAlQlonUc@db.fcjxacmdzhzjdiqjsbid.supabase.co:5432/postgres"
OUTPUT_DIR = "/Users/stephanevigneron/Desktop/site stephane/mon-aimant-pr-cieux/public/catalogue/prenoms/garcons"
LOCAL_PREFIX = "/catalogue/prenoms/garcons"

# Couleurs
BACKGROUND_COLOR = "#9FC5E8"  # Bleu clair du modèle Matéo
TEXT_COLOR = "#1a1a1a"

# Dimensions
WIDTH = 600
HEIGHT = 600


def find_fonts():
    """Trouve la police Chalkboard SE, sinon une police de fallback."""
    candidates = [
        "/System/Library/Fonts/Supplemental/ChalkboardSE.ttc",
        "/System/Library/Fonts/Supplemental/Chalkboard.ttc",
        "/System/Library/Fonts/MarkerFelt.ttc",
        "/System/Library/Fonts/Supplemental/Comic Sans MS.ttf",
        "/Library/Fonts/Comic Sans MS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None


def fit_text(draw, text, max_width, font_path, max_size=120, min_size=40):
    """Ajuste la taille de police pour que le texte tienne dans max_width."""
    for size in range(max_size, min_size - 1, -4):
        try:
            font = ImageFont.truetype(font_path, size)
        except Exception:
            continue
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        if text_width <= max_width:
            return font, text_width, bbox[3] - bbox[1]
    font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    return font, bbox[2] - bbox[0], bbox[3] - bbox[1]


def create_image(prenom, fete_label, font_path):
    """Crée une image de prénom au style du modèle Matéo."""
    img = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)

    # Prénom en très gros, centré
    max_width = WIDTH - 80
    prenom_font, pw, ph = fit_text(draw, prenom, max_width, font_path, max_size=120, min_size=40)

    # "se fête" en plus petit
    se_fete_font = ImageFont.truetype(font_path, 36)
    sf_bbox = draw.textbbox((0, 0), "se fête", font=se_fete_font)
    sf_w = sf_bbox[2] - sf_bbox[0]

    # Date de fête en gros
    date_font = ImageFont.truetype(font_path, 50)
    date_bbox = draw.textbbox((0, 0), fete_label, font=date_font)
    date_w = date_bbox[2] - date_bbox[0]
    date_h = date_bbox[3] - date_bbox[1]

    # Calcul des positions verticales
    total_height = ph + 110 + (sf_bbox[3] - sf_bbox[1]) + 75 + date_h
    start_y = (HEIGHT - total_height) // 2

    # Dessiner le prénom
    x = (WIDTH - pw) // 2
    y = start_y
    draw.text((x, y), prenom, font=prenom_font, fill=TEXT_COLOR)

    # Dessiner "se fête"
    y += ph + 110
    x = (WIDTH - sf_w) // 2
    draw.text((x, y), "se fête", font=se_fete_font, fill=TEXT_COLOR)

    # Dessiner la date
    y += (sf_bbox[3] - sf_bbox[1]) + 75
    x = (WIDTH - date_w) // 2
    draw.text((x, y), fete_label, font=date_font, fill=TEXT_COLOR)

    return img


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    font_path = find_fonts()
    if not font_path:
        print("ERREUR: Aucune police trouvée")
        return

    print(f"Police utilisée: {font_path}")

    print("Connexion à la base...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, prenom, fete_label FROM public.prenoms WHERE genre = 'garcon' AND active = true ORDER BY prenom, id"
    )
    rows = cur.fetchall()
    print(f"{len(rows)} prénoms garçons à générer")

    generated = 0
    updated = 0
    for id_, prenom, fete_label in rows:
        if not fete_label:
            fete_label = "date inconnue"

        filename = f"prenom-garcon-{id_}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)

        try:
            img = create_image(prenom, fete_label, font_path)
            img.save(filepath, "PNG")
            generated += 1

            photo_url = f"{LOCAL_PREFIX}/{filename}"
            cur.execute(
                "UPDATE public.prenoms SET photo_url = %s WHERE id = %s",
                (photo_url, id_)
            )
            if cur.rowcount > 0:
                updated += 1
        except Exception as e:
            print(f"  ❌ Erreur pour {prenom} (id={id_}): {e}")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n✅ {generated} images générées")
    print(f"✅ {updated} URLs mises à jour en base")


if __name__ == "__main__":
    main()
