"""Generate a JavaScript HERO_SKIN_MANIFEST from the PNG files in this folder.

Run from this folder:
    py generate_hero_skin_manifest.py

The generated block is saved as HERO_SKIN_MANIFEST.js in this folder. Copy that
block over the existing HERO_SKIN_MANIFEST constant in website/script.js.
"""

from collections import defaultdict
from pathlib import Path
import re


SCRIPT_FOLDER = Path(__file__).resolve().parent
OUTPUT_FILE = SCRIPT_FOLDER / "HERO_SKIN_MANIFEST.js"
SKIN_FILE_PATTERN = re.compile(r"^(?P<hero>[a-z]+)(?P<skin_id>\d+)\.png$", re.IGNORECASE)


def main() -> None:
    skins_by_hero: dict[str, list[str]] = defaultdict(list)
    skipped_files: list[str] = []

    for image_path in SCRIPT_FOLDER.glob("*.png"):
        match = SKIN_FILE_PATTERN.fullmatch(image_path.name)
        if match is None:
            skipped_files.append(image_path.name)
            continue

        hero = match["hero"].lower()
        skin_id = match["skin_id"]
        skins_by_hero[hero].append(skin_id)

    if not skins_by_hero:
        raise SystemExit(f"No matching PNG skin files found in: {SCRIPT_FOLDER}")

    lines = ["const HERO_SKIN_MANIFEST = {"]
    heroes = sorted(skins_by_hero.items())
    for index, (hero, skin_ids) in enumerate(heroes):
        ordered_ids = sorted(skin_ids, key=int)
        ids_as_js = ",".join(f'\"{skin_id}\"' for skin_id in ordered_ids)
        comma = "," if index < len(heroes) - 1 else ""
        lines.append(f"    {hero}: [{ids_as_js}]{comma}")
    lines.append("};")

    manifest = "\n".join(lines) + "\n"
    OUTPUT_FILE.write_text(manifest, encoding="utf-8")

    print(f"Wrote {len(heroes)} heroes to: {OUTPUT_FILE}")
    if skipped_files:
        print("Skipped files with an unexpected name format:")
        for filename in sorted(skipped_files):
            print(f"  - {filename}")


if __name__ == "__main__":
    main()
