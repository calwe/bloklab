#!/usr/bin/env python3
"""Generate blocks.json from block textures in public/blocks/.

For each texture, computes a representative OKLCH color by averaging all
pixels (weighted by alpha) in linear RGB space, then converting to OKLCH.

Usage:
    python scripts/generate_blocks_json.py

Output:
    src/data/blocks.json
"""

import json
import math
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow not found. Install with: pip install Pillow")

import numpy as np


# ---------------------------------------------------------------------------
# Color conversion
# ---------------------------------------------------------------------------

def srgb_to_linear(c: float) -> float:
    """Convert an sRGB channel value [0, 1] to linear light."""
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def linear_rgb_to_oklab(r: float, g: float, b: float) -> tuple[float, float, float]:
    """Convert linear sRGB to OKLab.

    Based on Björn Ottosson's OKLab specification:
    https://bottosson.github.io/posts/oklab/
    """
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

    l_ = l ** (1 / 3)
    m_ = m ** (1 / 3)
    s_ = s ** (1 / 3)

    L =  0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a =  1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    return L, a, b_


def oklab_to_oklch(L: float, a: float, b: float) -> tuple[float, float, float]:
    """Convert OKLab to OKLCH (cylindrical form)."""
    C = math.sqrt(a * a + b * b)
    H = math.degrees(math.atan2(b, a))
    if H < 0:
        H += 360
    return L, C, H


def linear_to_srgb(c: float) -> float:
    """Convert a linear light channel value [0, 1] to sRGB."""
    if c <= 0.0031308:
        return 12.92 * c
    return 1.055 * (c ** (1 / 2.4)) - 0.055


def srgb_to_hsl(r: float, g: float, b: float) -> tuple[float, float, float]:
    """Convert sRGB [0, 1] to HSL. Returns (h [0-360], s [0-1], l [0-1])."""
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    l = (max_c + min_c) / 2

    if max_c == min_c:
        return 0.0, 0.0, l

    d = max_c - min_c
    s = d / (2 - max_c - min_c) if l > 0.5 else d / (max_c + min_c)

    if max_c == r:
        h = (g - b) / d + (6 if g < b else 0)
    elif max_c == g:
        h = (b - r) / d + 2
    else:
        h = (r - g) / d + 4
    h *= 60

    return h, s, l


def compute_all_colors(image_path: Path) -> dict[str, dict[str, float]]:
    """Compute all color space representations for a texture.

    Averages pixels in linear RGB space (weighted by alpha), then converts
    to all target color spaces.
    """
    pixels = np.array(Image.open(image_path).convert("RGBA"), dtype=np.float64)
    r, g, b, a = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2], pixels[:, :, 3]
    weights = a / 255.0
    total_weight = weights.sum()

    if total_weight == 0:
        return {
            "oklch": {"L": 0.0, "C": 0.0, "H": 0.0},
            "oklab": {"L": 0.0, "a": 0.0, "b": 0.0},
            "srgb": {"r": 0.0, "g": 0.0, "b": 0.0},
            "linear_rgb": {"r": 0.0, "g": 0.0, "b": 0.0},
            "hsl": {"h": 0.0, "s": 0.0, "l": 0.0},
        }

    # Average in linear light (physically correct)
    lin_r = np.where(r / 255.0 <= 0.04045, r / 255.0 / 12.92, ((r / 255.0 + 0.055) / 1.055) ** 2.4)
    lin_g = np.where(g / 255.0 <= 0.04045, g / 255.0 / 12.92, ((g / 255.0 + 0.055) / 1.055) ** 2.4)
    lin_b = np.where(b / 255.0 <= 0.04045, b / 255.0 / 12.92, ((b / 255.0 + 0.055) / 1.055) ** 2.4)

    avg_r = (lin_r * weights).sum() / total_weight
    avg_g = (lin_g * weights).sum() / total_weight
    avg_b = (lin_b * weights).sum() / total_weight

    # Linear RGB → OKLab → OKLCH
    L, a_ok, b_ok = linear_rgb_to_oklab(avg_r, avg_g, avg_b)
    L_lch, C, H = oklab_to_oklch(L, a_ok, b_ok)

    # Linear RGB → sRGB
    sr = linear_to_srgb(avg_r)
    sg = linear_to_srgb(avg_g)
    sb = linear_to_srgb(avg_b)

    # sRGB → HSL
    h, s, l = srgb_to_hsl(sr, sg, sb)

    return {
        "oklch": {"L": round(L_lch, 4), "C": round(C, 4), "H": round(H, 2)},
        "oklab": {"L": round(L, 4), "a": round(a_ok, 4), "b": round(b_ok, 4)},
        "srgb": {"r": round(sr, 4), "g": round(sg, 4), "b": round(sb, 4)},
        "linear_rgb": {"r": round(avg_r, 4), "g": round(avg_g, 4), "b": round(avg_b, 4)},
        "hsl": {"h": round(h, 2), "s": round(s, 4), "l": round(l, 4)},
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def filename_to_name(filename: str) -> str:
    """Convert a snake_case filename stem to Title Case."""
    return Path(filename).stem.replace("_", " ").title()


def has_transparency(image_path: Path) -> bool:
    """Return True if the image contains any pixel with alpha < 255."""
    pixels = np.array(Image.open(image_path).convert("RGBA"))
    return bool((pixels[:, :, 3] < 255).any())


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    project_root = Path(__file__).parent.parent
    blocks_dir = project_root / "public" / "blocks"
    output_path = project_root / "src" / "data" / "blocks.json"

    if not blocks_dir.exists():
        raise SystemExit(f"Error: blocks directory not found at {blocks_dir}")

    texture_files = sorted(blocks_dir.glob("*.png"))

    if not texture_files:
        raise SystemExit(f"No PNG files found in {blocks_dir}")

    blocks = []
    for i, path in enumerate(texture_files):
        colors = compute_all_colors(path)
        transparent = has_transparency(path)

        oklch = colors["oklch"]
        print(
            f"  {path.name:<40} "
            f"L={oklch['L']:.4f}  C={oklch['C']:.4f}  H={oklch['H']:>6.2f}°"
            f"  {'(transparent)' if transparent else ''}"
        )

        blocks.append({
            "id": i,
            "name": filename_to_name(path.name),
            "file": path.name,
            "transparent": transparent,
            **colors,
        })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(blocks, f, indent=4)
        f.write("\n")

    print(f"\nWrote {len(blocks)} blocks to {output_path}")


if __name__ == "__main__":
    main()
