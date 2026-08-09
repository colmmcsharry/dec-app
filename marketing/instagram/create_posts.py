#!/usr/bin/env python3
"""Compose Peak Performance Code Instagram carousel slides from app assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets" / "images"
OUT_DIR = Path("/opt/cursor/artifacts/instagram")
REPO_OUT = Path(__file__).resolve().parent / "output"

SIZE = 1080
PURPLE = (113, 135, 206)
PURPLE_DARK = (90, 110, 181)
NAVY = (31, 42, 58)
MUTED = (91, 102, 120)
WHITE = (255, 255, 255)
SOFT_BG = (232, 235, 245)
SOFT_BG_2 = (248, 246, 252)
CREAM = (255, 252, 248)

FONT_DIR = Path("/tmp/fonts")


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / f"Poppins-{weight}.ttf"), size)


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def rounded_rect_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def paste_rounded(
    base: Image.Image,
    img: Image.Image,
    box: tuple[int, int],
    radius: int = 36,
    shadow: bool = True,
) -> None:
    x, y = box
    if shadow:
        shadow_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
        s = Image.new("RGBA", (img.width + 40, img.height + 40), (0, 0, 0, 0))
        sd = ImageDraw.Draw(s)
        sd.rounded_rectangle(
            (10, 14, img.width + 30, img.height + 34),
            radius=radius + 4,
            fill=(20, 28, 45, 55),
        )
        s = s.filter(ImageFilter.GaussianBlur(18))
        shadow_layer.paste(s, (x - 20, y - 16), s)
        base.alpha_composite(shadow_layer)

    mask = rounded_rect_mask(img.size, radius)
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.paste(img, (x, y), mask)
    base.alpha_composite(layer)


def soft_gradient(size: int = SIZE) -> Image.Image:
    img = Image.new("RGBA", (size, size), SOFT_BG + (255,))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(SOFT_BG[0] * (1 - t) + SOFT_BG_2[0] * t)
        g = int(SOFT_BG[1] * (1 - t) + SOFT_BG_2[1] * t)
        b = int(SOFT_BG[2] * (1 - t) + min(255, SOFT_BG_2[2] + 8) * t)
        for x in range(size):
            # soft vignette / corner wash
            cx = abs(x - size * 0.25) / size
            cy = abs(y - size * 0.15) / size
            wash = max(0.0, 1.0 - (cx * cx + cy * cy) * 2.2)
            rr = min(255, int(r + 18 * wash))
            gg = min(255, int(g + 14 * wash))
            bb = min(255, int(b + 22 * wash))
            px[x, y] = (rr, gg, bb, 255)

    # decorative circles
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.ellipse((-180, -120, 420, 480), fill=(*PURPLE, 28))
    d.ellipse((720, 780, 1280, 1340), fill=(180, 200, 230, 40))
    d.ellipse((850, -80, 1200, 270), fill=(255, 255, 255, 70))
    img = Image.alpha_composite(img, overlay)
    return img


def fit_contain(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / img.width, max_h / img.height)
    new_size = (max(1, int(img.width * ratio)), max(1, int(img.height * ratio)))
    return img.resize(new_size, Image.Resampling.LANCZOS)


def black_to_alpha(img: Image.Image, threshold: int = 22) -> Image.Image:
    """Make near-black pixels transparent (phone mockup letterboxing)."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def trim_transparent(img: Image.Image, pad: int = 8) -> Image.Image:
    """Crop to non-transparent content bounds."""
    bbox = img.split()[-1].getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    return img.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(img.width, right + pad),
            min(img.height, bottom + pad),
        )
    )


def content_bbox(img: Image.Image, threshold: int = 18) -> tuple[int, int, int, int]:
    """Bounding box of non-near-black pixels."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 10 and (r + g + b) > threshold * 3:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return (0, 0, w, h)
    return (min_x, min_y, max_x + 1, max_y + 1)


def trim_black_phone(img: Image.Image, threshold: int = 18) -> Image.Image:
    """Crop black letterboxing around phone mockups without punching UI blacks."""
    rgba = img.convert("RGBA")
    left, top, right, bottom = content_bbox(rgba, threshold=threshold)
    pad = 4
    return rgba.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(rgba.width, right + pad),
            min(rgba.height, bottom + pad),
        )
    )


def knockout_black_bg(img: Image.Image, threshold: int = 20) -> Image.Image:
    """For collage assets: transparent black bg + crop."""
    return trim_transparent(black_to_alpha(img, threshold=threshold), pad=4)


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    fnt: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int = 920,
) -> int:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    line_h = int(fnt.size * 1.22)
    for i, line in enumerate(lines):
        w = draw.textlength(line, font=fnt)
        draw.text(((SIZE - w) / 2, y + i * line_h), line, font=fnt, fill=fill)
    return y + len(lines) * line_h


def brand_badge(canvas: Image.Image, y: int = 56) -> None:
    logo = fit_contain(load_rgba(ASSETS / "logo-square.png"), 72, 72)
    x = (SIZE - logo.width) // 2
    # white circle behind logo
    badge = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(badge)
    pad = 10
    d.ellipse(
        (x - pad, y - pad, x + logo.width + pad, y + logo.height + pad),
        fill=(255, 255, 255, 230),
    )
    canvas.alpha_composite(badge)
    canvas.paste(logo, (x, y), logo)


def slide_1_hero() -> Image.Image:
    canvas = soft_gradient()
    draw = ImageDraw.Draw(canvas)
    brand_badge(canvas, 48)

    y = 150
    y = draw_centered_text(draw, "Peak Performance Code", y, font("Bold", 54), NAVY)
    y += 10
    y = draw_centered_text(
        draw,
        "Mind  ·  Body  ·  Soul",
        y,
        font("Medium", 28),
        PURPLE_DARK,
    )
    y += 8
    y = draw_centered_text(
        draw,
        "Holistic coaching for real life — videos, workbooks & daily progress.",
        y,
        font("Regular", 26),
        MUTED,
        max_width=860,
    )

    collage = knockout_black_bg(
        load_rgba(ASSETS / "onboarding" / "modules-collage.png"), threshold=20
    )
    collage = fit_contain(collage, 860, 640)
    px = (SIZE - collage.width) // 2
    py = min(SIZE - collage.height - 90, y + 20)
    # Soft drop shadow under phones
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse(
        (px + 40, py + collage.height - 50, px + collage.width - 40, py + collage.height + 30),
        fill=(30, 40, 60, 45),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas.alpha_composite(shadow)
    canvas.paste(collage, (px, py), collage)

    # bottom CTA strip
    strip = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(strip)
    sd.rounded_rectangle((220, 1000, 860, 1052), radius=26, fill=(*PURPLE, 235))
    canvas.alpha_composite(strip)
    draw = ImageDraw.Draw(canvas)
    label = "Swipe to explore the app →"
    lw = draw.textlength(label, font=font("SemiBold", 22))
    draw.text(((SIZE - lw) / 2, 1012), label, font=font("SemiBold", 22), fill=WHITE)
    return canvas.convert("RGB")


def slide_2_modules() -> Image.Image:
    canvas = soft_gradient()
    draw = ImageDraw.Draw(canvas)

    y = 56
    y = draw_centered_text(draw, "10 modules. One system.", y, font("Bold", 48), NAVY)
    y += 6
    y = draw_centered_text(
        draw,
        "Sleep, energy, movement, nutrition, habits & more.",
        y,
        font("Regular", 24),
        MUTED,
        max_width=880,
    )

    phone = trim_black_phone(load_rgba(ASSETS / "onboarding" / "modules.png"))
    phone = fit_contain(phone, 520, 780)
    px = (SIZE - phone.width) // 2
    py = y + 24
    paste_rounded(canvas, phone, (px, py), radius=48, shadow=True)
    return canvas.convert("RGB")


def slide_3_features() -> Image.Image:
    canvas = soft_gradient()
    draw = ImageDraw.Draw(canvas)

    y = 48
    y = draw_centered_text(draw, "Learn. Practice. Progress.", y, font("Bold", 46), NAVY)
    y += 4
    y = draw_centered_text(
        draw,
        "Video lessons + printable workbooks in every module.",
        y,
        font("Regular", 23),
        MUTED,
        max_width=900,
    )

    videos = trim_black_phone(load_rgba(ASSETS / "onboarding" / "videos.png"))
    workbooks = trim_black_phone(load_rgba(ASSETS / "onboarding" / "workbooks.png"))
    videos = fit_contain(videos, 430, 760)
    workbooks = fit_contain(workbooks, 430, 760)

    gap = 28
    total_w = videos.width + workbooks.width + gap
    start_x = (SIZE - total_w) // 2
    py = y + 20
    paste_rounded(canvas, videos, (start_x, py), radius=42, shadow=True)
    paste_rounded(canvas, workbooks, (start_x + videos.width + gap, py), radius=42, shadow=True)

    # captions under phones
    draw = ImageDraw.Draw(canvas)
    for label, x0, w in (
        ("Videos", start_x, videos.width),
        ("Workbooks", start_x + videos.width + gap, workbooks.width),
    ):
        chip_w = 160
        chip_h = 40
        cx = x0 + (w - chip_w) // 2
        cy = min(SIZE - 70, py + max(videos.height, workbooks.height) + 18)
        draw.rounded_rectangle((cx, cy, cx + chip_w, cy + chip_h), radius=20, fill=(*PURPLE, 230))
        tw = draw.textlength(label, font=font("SemiBold", 20))
        draw.text((cx + (chip_w - tw) / 2, cy + 7), label, font=font("SemiBold", 20), fill=WHITE)

    return canvas.convert("RGB")


def slide_4_cta() -> Image.Image:
    canvas = soft_gradient()
    draw = ImageDraw.Draw(canvas)

    logo = fit_contain(load_rgba(ASSETS / "logo-square.png"), 220, 220)
    lx = (SIZE - logo.width) // 2
    # white plate
    plate = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pad = 28
    pd.rounded_rectangle(
        (lx - pad, 120 - pad, lx + logo.width + pad, 120 + logo.height + pad),
        radius=48,
        fill=(255, 255, 255, 240),
    )
    canvas.alpha_composite(plate)
    # soft shadow under plate via paste_rounded style
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (lx - pad + 6, 126 - pad, lx + logo.width + pad + 6, 132 + logo.height + pad),
        radius=48,
        fill=(20, 28, 45, 40),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.alpha_composite(plate)
    canvas.paste(logo, (lx, 120), logo)

    draw = ImageDraw.Draw(canvas)
    y = 120 + logo.height + pad + 36
    y = draw_centered_text(draw, "Peak Performance Code", y, font("Bold", 46), NAVY)
    y += 8
    y = draw_centered_text(
        draw,
        "Science-backed coaching for sleep, nutrition, mindset, movement & recovery.",
        y,
        font("Regular", 26),
        MUTED,
        max_width=820,
    )

    y += 40
    # store buttons
    btn_w, btn_h = 340, 72
    gap = 24
    total = btn_w * 2 + gap
    bx = (SIZE - total) // 2
    for i, label in enumerate(("App Store", "Google Play")):
        x0 = bx + i * (btn_w + gap)
        if i == 0:
            draw.rounded_rectangle(
                (x0, y, x0 + btn_w, y + btn_h),
                radius=36,
                fill=PURPLE,
            )
            fill = WHITE
        else:
            draw.rounded_rectangle(
                (x0, y, x0 + btn_w, y + btn_h),
                radius=36,
                fill=WHITE,
                outline=PURPLE,
                width=3,
            )
            fill = PURPLE_DARK
        tw = draw.textlength(label, font=font("SemiBold", 26))
        draw.text(
            (x0 + (btn_w - tw) / 2, y + 18),
            label,
            font=font("SemiBold", 26),
            fill=fill,
        )

    y += btn_h + 40
    y = draw_centered_text(
        draw,
        "By Declan Treanor  ·  Performance Treanor",
        y,
        font("Medium", 22),
        MUTED,
    )
    return canvas.convert("RGB")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPO_OUT.mkdir(parents=True, exist_ok=True)

    slides = [
        ("01-hero.jpg", slide_1_hero),
        ("02-modules.jpg", slide_2_modules),
        ("03-videos-workbooks.jpg", slide_3_features),
        ("04-cta.jpg", slide_4_cta),
    ]

    for name, fn in slides:
        img = fn()
        for dest in (OUT_DIR / name, REPO_OUT / name):
            img.save(dest, "JPEG", quality=92, optimize=True)
            print(f"Wrote {dest} ({img.size[0]}x{img.size[1]})")

    caption = """Peak Performance Code is live — your pocket coach for mind, body & soul.

Science-backed modules on sleep, morning routines, energy, movement, nutrition, habits and more. Watch the videos. Use the workbooks. Track your progress.

Built by Declan Treanor / Performance Treanor for professionals who want more from their day — without the gimmicks.

Available on the App Store & Google Play.
Link in bio.

#PeakPerformanceCode #PerformanceTreanor #MindBodySoul #HolisticHealth #SleepBetter #HighPerformance #WellnessApp #Nutrition #Habits #PersonalDevelopment"""

    for dest in (OUT_DIR / "CAPTION.txt", REPO_OUT / "CAPTION.txt"):
        dest.write_text(caption.strip() + "\n", encoding="utf-8")
        print(f"Wrote {dest}")


if __name__ == "__main__":
    main()
