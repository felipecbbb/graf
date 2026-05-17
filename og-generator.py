"""Generate og-image.png (1200x630) for GRAF Studio."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630

CREAM = (245, 241, 234)
INK = (15, 15, 15)
INK_SOFT = (42, 42, 42)
MUTED = (107, 102, 97)
ACCENT = (255, 107, 53)

img = Image.new("RGB", (W, H), CREAM)

# ---- Accent gradient blob (right side) ----
blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(blob)
for r in range(460, 0, -8):
    alpha = int(70 * (1 - r / 460))
    bd.ellipse(
        [W - 120 - r, H // 2 + 40 - r, W - 120 + r, H // 2 + 40 + r],
        fill=(ACCENT[0], ACCENT[1], ACCENT[2], alpha),
    )
blob = blob.filter(ImageFilter.GaussianBlur(radius=50))
img.paste(blob, (0, 0), blob)

# Subtle noise/grain (simulated)
import random
random.seed(7)
grain = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(grain)
for _ in range(3000):
    x = random.randint(0, W - 1)
    y = random.randint(0, H - 1)
    a = random.randint(3, 12)
    gd.point((x, y), fill=(15, 15, 15, a))
img.paste(grain, (0, 0), grain)

draw = ImageDraw.Draw(img)


def load(paths, size):
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


serif_huge = load(
    ["/System/Library/Fonts/Supplemental/Georgia.ttf",
     "/System/Library/Fonts/Times.ttc"],
    140,
)
serif_huge_italic = load(
    ["/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
     "/System/Library/Fonts/Supplemental/Georgia.ttf",
     "/System/Library/Fonts/Times.ttc"],
    140,
)
serif_wordmark = load(
    ["/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
     "/System/Library/Fonts/Supplemental/Georgia.ttf"],
    36,
)
sans = load(
    ["/System/Library/Fonts/Supplemental/Helvetica Neue.ttc",
     "/System/Library/Fonts/Helvetica.ttc"],
    22,
)
mono = load(
    ["/System/Library/Fonts/Menlo.ttc",
     "/System/Library/Fonts/Monaco.ttf"],
    17,
)

PAD = 80

# ---- Logo mark + wordmark (top-left) ----
ox, oy = PAD, 70
sq = 22
gap = 6
draw.rounded_rectangle([ox, oy, ox + sq, oy + sq], radius=4, fill=INK)
draw.rounded_rectangle(
    [ox + sq + gap, oy, ox + 2 * sq + gap, oy + sq], radius=4, outline=INK, width=2
)
draw.rounded_rectangle(
    [ox, oy + sq + gap, ox + sq, oy + 2 * sq + gap], radius=4, outline=INK, width=2
)
draw.rounded_rectangle(
    [ox + sq + gap, oy + sq + gap, ox + 2 * sq + gap, oy + 2 * sq + gap],
    radius=4,
    fill=INK,
)
draw.text((ox + 2 * sq + gap + 18, oy - 4), "GRAF", font=serif_wordmark, fill=INK)

# ---- Eyebrow ----
eb_y = 200
draw.line([(PAD, eb_y - 12), (PAD + 50, eb_y - 12)], fill=ACCENT, width=2)
draw.text((PAD, eb_y - 4), "ESTUDIO DE AUTOMATIZACIÓN CON IA", font=mono, fill=MUTED)

# ---- Headline (two lines) ----
hd_y = eb_y + 36
draw.text((PAD, hd_y), "Automatizamos", font=serif_huge, fill=INK)
draw.text((PAD, hd_y + 145), "con ", font=serif_huge, fill=INK)
# "IA" in accent
ia_x = PAD + draw.textlength("con ", font=serif_huge)
draw.text((ia_x, hd_y + 145), "IA", font=serif_huge_italic, fill=ACCENT)
# ", a medida."
rest_x = ia_x + draw.textlength("IA", font=serif_huge_italic)
draw.text((rest_x, hd_y + 145), ", a medida.", font=serif_huge_italic, fill=INK_SOFT)

# ---- Bottom strip ----
strip_y = H - 60
draw.line([(PAD, strip_y - 18), (W - PAD, strip_y - 18)], fill=(15, 15, 15), width=1)
draw.text((PAD, strip_y - 4), "graf-studio.es", font=sans, fill=INK)

tags = "4 INGENIEROS  ·  MADRID  ·  AD-HOC"
tw = draw.textlength(tags, font=mono)
draw.text((W - PAD - tw, strip_y + 2), tags, font=mono, fill=MUTED)

img.save("/Users/felipecamarabarroso/Desktop/GRAF/og-image.png", "PNG", optimize=True)
print(f"OG image saved: {W}x{H}")
