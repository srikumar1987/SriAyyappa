"""Writes neutral placeholder pictures for products. Names are shown on the page in the selected language,
so the pictures must not contain any words.

Run:  python scripts/make_placeholder_images.py
"""
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "images"

NAMES = [
    "brass-lamp", "agarbatti", "pooja-thali", "kumkum", "camphor",
    "banana-chips", "mixture", "murukku", "achappam", "jackfruit-chips",
    "tapioca-chips", "payasam-mix", "coconut-oil", "spices-pack", "jaggery",
]

SVG = """<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#FFF8E7"/>
  <circle cx="200" cy="150" r="90" fill="#FFD700" opacity="0.3"/>
  <text x="200" y="185" font-size="90" text-anchor="middle" fill="#C41E3A">\u0950</text>
</svg>
"""

for name in NAMES:
    (OUT_DIR / f"{name}.svg").write_text(SVG, encoding="utf-8")
print(f"Wrote {len(NAMES)} placeholder pictures")
