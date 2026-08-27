from pathlib import Path
from PIL import Image
import subprocess
import shutil
import tempfile
import numpy as np

BASE = Path(__file__).parent

COLUMNS = 6
ROWS = 10
FPS = 25

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

FFMPEG = shutil.which("ffmpeg")

if FFMPEG is None:
    raise RuntimeError("FFmpeg was not found in PATH.")

BAYER = np.array([
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
], dtype=np.float32)

def split_sprites(image):
    width, height = image.size

    sprite_width = round(width / COLUMNS)
    sprite_height = round(height / ROWS)

    sprites = []

    for row in range(ROWS):
        for column in range(COLUMNS):
            left = column * sprite_width
            top = row * sprite_height
            right = min(left + sprite_width, width)
            bottom = min(top + sprite_height, height)

            sprite = image.crop(
                (left, top, right, bottom)
            )

            if sprite.size != (sprite_width, sprite_height):
                fixed = Image.new(
                    "RGBA",
                    (sprite_width, sprite_height),
                    (0, 0, 0, 0)
                )

                fixed.alpha_composite(sprite)
                sprite = fixed

            sprites.append(sprite)

    return sprites

def dither_alpha(image):
    image = image.convert("RGBA")

    array = np.array(image, dtype=np.uint8)

    alpha = array[:, :, 3].astype(np.float32)

    pattern = np.tile(
        BAYER,
        (
            (alpha.shape[0] + 3) // 4,
            (alpha.shape[1] + 3) // 4
        )
    )

    pattern = pattern[
        :alpha.shape[0],
        :alpha.shape[1]
    ]

    threshold = (pattern + 0.5) * (255.0 / 16.0)

    array[:, :, 3] = np.where(
        alpha >= threshold,
        255,
        0
    ).astype(np.uint8)

    return Image.fromarray(array, "RGBA")

def create_gif(sprites, output):
    with tempfile.TemporaryDirectory() as temp:
        temp_dir = Path(temp)

        for index, sprite in enumerate(sprites):
            sprite = dither_alpha(sprite)

            sprite.save(
                temp_dir / f"frame_{index:03}.png",
                format="PNG",
                compress_level=0
            )

        palette = temp_dir / "palette.png"

        subprocess.run(
            [
                FFMPEG,
                "-y",
                "-framerate",
                str(FPS),
                "-i",
                str(temp_dir / "frame_%03d.png"),
                "-vf",
                "palettegen=stats_mode=full:reserve_transparent=1",
                str(palette)
            ],
            check=True
        )

        subprocess.run(
            [
                FFMPEG,
                "-y",
                "-framerate",
                str(FPS),
                "-i",
                str(temp_dir / "frame_%03d.png"),
                "-i",
                str(palette),
                "-lavfi",
                "paletteuse=dither=sierra2_4a:alpha_threshold=128",
                "-loop",
                "0",
                str(output)
            ],
            check=True
        )

for image_path in BASE.iterdir():
    if not image_path.is_file():
        continue

    if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
        continue

    try:
        print(f"Processing: {image_path.name}")

        image = Image.open(image_path).convert("RGBA")

        sprites = split_sprites(image)

        output = BASE / f"{image_path.stem}.gif"

        create_gif(
            sprites,
            output
        )

        print(f"Created: {output.name}")
        print(f"Source: {image.size}")
        print(f"Frame: {sprites[0].size}")
        print(f"Frames: {len(sprites)}")
        print()

    except Exception as error:
        print(f"Failed: {image_path.name}")
        print(error)

print("Done.")