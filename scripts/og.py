"""देशकाल: हर लेख के लिए सोशल मीडिया प्रिव्यू तस्वीर (1200x630) बनाना.

चलाएं: python3 scripts/og.py          (सिर्फ़ नये लेखों के लिए)
       python3 scripts/og.py --all    (सब दोबारा)
ज़रूरत: Pillow (libraqm के साथ, देवनागरी जोड़ने के लिए). public/og/<id>.png में लिखता है.
"""
import json, os, sys, glob, io, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter, features

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(ROOT, "scripts", "fonts")
OUT = os.path.join(ROOT, "public", "og")
LAYOUT = ImageFont.Layout.RAQM if features.check("raqm") else ImageFont.Layout.BASIC
W, H = 1200, 630
PAPER, INK, LAL = (241, 242, 238), (31, 33, 38), (207, 58, 46)
CAT = {"देश": (178, 58, 46), "दुनिया": (46, 63, 143), "समाज": (162, 101, 14), "अर्थ": (45, 106, 79),
       "पर्यावरण": (91, 122, 30), "स्त्री": (154, 47, 103), "संस्कृति": (90, 62, 145), "साहित्य": (110, 68, 35)}

def font(name, size, wght=None):
    f = ImageFont.truetype(os.path.join(F, name), size, layout_engine=LAYOUT)
    if wght:
        try:
            names = [str(ax.get("name", b"")).lower() for ax in f.get_variation_axes()]
            f.set_variation_by_axes([wght if "weight" in n or "wght" in n else 100 for n in names])
        except Exception: pass
    return f

def wrap(draw, text, fnt, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= width: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def fit_headline(draw, text, width, max_lines, sizes):
    for s in sizes:
        f = font("Teko-SemiBold.ttf", s)
        lines = wrap(draw, text, f, width)
        if len(lines) <= max_lines: return f, lines, s
    f = font("Teko-SemiBold.ttf", sizes[-1]); lines = wrap(draw, text, f, width)[:max_lines]
    lines[-1] = lines[-1].rstrip("।,:") + "…"
    return f, lines, sizes[-1]

def halftone(img, box, col, step=14):
    d = ImageDraw.Draw(img); x0, y0, x1, y1 = box
    import math
    for y in range(y0, y1, step):
        for x in range(x0, x1, step):
            t = .5 + .5 * math.sin((x - x0) / (x1 - x0) * 3.1) * math.cos((y - y0) / (y1 - y0) * 2.4)
            r = step * .45 * t
            if r > .6: d.ellipse([x - r, y - r, x + r, y + r], fill=col)

def photo(a):
    p = a.get("photo")
    if not p: return None
    try:
        with urllib.request.urlopen(p["src"].replace("w=1400", "w=900"), timeout=20) as r:
            return Image.open(io.BytesIO(r.read())).convert("RGB")
    except Exception:
        return None

def make(a, ph=None):
    col = CAT.get(a["cat"], CAT["दुनिया"])
    img = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(img)
    # right panel: photo (toned) or halftone in the category colour, cut diagonally
    panel = Image.new("RGB", (W, H), col)
    if ph:
        s = max(560 / ph.width, H / ph.height); ph = ph.resize((int(ph.width * s), int(ph.height * s)))
        g = ph.convert("L").convert("RGB"); tone = Image.new("RGB", g.size, col)
        ph = Image.blend(ph, Image.new("RGB", ph.size, col), .12) if (a.get("photo") or {}).get("kind") == "painting" else Image.blend(g, tone, .42); panel.paste(ph, (W - ph.width, (H - ph.height) // 2))
    else:
        halftone(panel, (640, 0, W, H), tuple(min(255, c + 70) for c in col))
    mask = Image.new("L", (W, H), 0); ImageDraw.Draw(mask).polygon([(760, 0), (W, 0), (W, H), (640, H)], fill=255)
    img.paste(panel, (0, 0), mask)
    d.polygon([(746, 0), (760, 0), (640, H), (626, H)], fill=LAL)
    # masthead: small sun + name
    d.ellipse([60, 44, 110, 94], fill=LAL)
    d.text((66, 30), "देशकाल", font=font("YatraOne.ttf", 46), fill=INK)
    # kicker
    kick = font("NotoSansDevanagari.ttf", 26, 700)
    d.text((62, 128), a["cat"], font=kick, fill=col)
    # headline: first part (before colon/comma) in red, rest in ink
    # Teko का कोलन बहुत छोटा दिखता है: लाल हिस्से के बाद का कोलन हटा दें, रंग ही विराम है
    h0 = a["h"]; a = dict(a, h=h0.replace(":", "", 1))
    f, lines, size = None, None, None
    for s_ in [96, 88, 80, 72, 64, 58]:
        f, lines, size = fit_headline(d, a["h"], 600, 4, [s_])
        if len(lines) * int(s_ * 1.02) <= 360 and not lines[-1].endswith("…"): break
    y = 172; lh = int(size * 1.02)
    cut = h0.find(":")
    if cut < 0: cut = h0.find(",")
    red_words = h0[:cut + 1].split() if 0 < cut < len(h0) - 4 else []
    n = 0
    for ln in lines:
        x = 60
        for w in ln.split():
            fill = LAL if n < len(red_words) else INK
            d.text((x, y), w, font=f, fill=fill); x += d.textlength(w + " ", font=f); n += 1
        y += lh
    # source line
    src = font("NotoSansDevanagari.ttf", 24, 500)
    d.text((62, H - 70), f"मूल: {a['by']} · {a['pub']}", font=src, fill=(85, 89, 99))
    d.text((62, H - 38), "deshkaal.xyz", font=font("NotoSansDevanagari.ttf", 22, 700), fill=LAL)
    return img

def main():
    """--all: सब दोबारा. --photos: सिर्फ़ तस्वीर वाले लेख, और तभी जब तस्वीर सचमुच डाउनलोड हो
    (GitHub Actions में चलता है, जहां Unsplash तक पहुंच है; बनी हुई तस्वीर का निशान data/og-photo/<id> में रहता है)."""
    os.makedirs(OUT, exist_ok=True)
    redo, photos = "--all" in sys.argv, "--photos" in sys.argv
    n, miss = 0, 0
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "days", "*.json"))):
        for a in json.load(open(f, encoding="utf-8")):
            out = os.path.join(OUT, a["id"] + ".png"); mark = os.path.join(ROOT, "data", "og-photo", a["id"]); os.makedirs(os.path.dirname(mark), exist_ok=True)
            if photos:
                if not a.get("photo") or (os.path.exists(mark) and not redo): continue
                ph = photo(a)
                if ph is None: miss += 1; print("तस्वीर नहीं मिली:", a["id"]); continue
                make(a, ph).save(out, optimize=True); open(mark, "w").write(a["photo"]["src"]); n += 1
                continue
            if os.path.exists(out) and not redo: continue
            ph = photo(a) if a.get("photo") else None
            make(a, ph).save(out, optimize=True); n += 1
            if ph is not None: open(mark, "w").write(a["photo"]["src"])
    print(f"प्रिव्यू तस्वीरें बनीं: {n}" + (f", तस्वीर न मिलने से छूटीं: {miss}" if miss else ""))

if __name__ == "__main__":
    main()
