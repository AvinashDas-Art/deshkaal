"""देशकाल: Instagram/Facebook के लिए 1080x1350 कार्ड.

चलाएं: python3 scripts/ig.py            (आज के अंक के कार्ड, जो पहले से नहीं बने)
       python3 scripts/ig.py 2026-10-06 (किसी ख़ास दिन के)
       python3 scripts/ig.py --all      (सब दिन, दोबारा)
बनता है:
  public/ig/<id>.jpg           हर लेख का कार्ड
  public/ig/<day>-cover.jpg    सुबह के कैरोसेल का पहला पन्ना (आज की सुर्ख़ियां)
  public/ig/<day>-end.jpg      कैरोसेल का आख़िरी पन्ना (कहां-कहां मिलेंगे)
Instagram सिर्फ़ JPEG लेता है, इसलिए JPEG.
"""
import json, os, sys, glob, math, datetime
from PIL import Image, ImageDraw, ImageFont, features

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import og  # फ़ॉन्ट, रंग, तस्वीर लाने का तरीक़ा वहीं से

ROOT, OUT = og.ROOT, os.path.join(og.ROOT, "public", "ig")
W, H = 1080, 1350
PAPER, INK, INK2, LAL = og.PAPER, og.INK, (85, 89, 99), og.LAL
MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"]
DAYS = ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"]


def daylabel(d):
    t = datetime.date.fromisoformat(d)
    return f"{DAYS[t.weekday()]}, {t.day} {MONTHS[t.month - 1]} {t.year}"


def ns(size, w=500):
    return og.font("NotoSansDevanagari.ttf", size, w)


def masthead(d, x, y, size, sun=True, col=INK):
    """छोटा मास्टहेड: लाल सूरज पर Yatra One में देशकाल."""
    f = og.font("YatraOne.ttf", size)
    w = d.textlength("देशकाल", font=f)
    if sun:
        r = size * 0.43
        cx, cy = x + w * 0.47, y + size * 0.78
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=LAL)
    d.text((x, y), "देशकाल", font=f, fill=col)
    return w


def headline(d, h, x, y, width, max_h, sizes=(118, 108, 98, 90, 82, 74, 66)):
    """Teko हेडलाइन: कोलन/कॉमा से पहले का हिस्सा लाल, कोलन हटाकर."""
    marks = [i for i in (h.find(":"), h.find("?")) if i > 0]
    cut = min(marks) if marks else h.find(",")
    red_n = len(h[:cut + 1].split()) if 0 < cut < len(h) - 4 else 0
    text = h.replace(":", "", 1)
    for s in sizes:
        f = og.font("Teko-SemiBold.ttf", s)
        lines = og.wrap(d, text, f, width)
        lh = int(s * 1.0)
        if len(lines) * lh <= max_h: break
    n = 0
    for ln in lines:
        cx = x
        for w in ln.split():
            d.text((cx, y), w, font=f, fill=LAL if n < red_n else INK)
            cx += d.textlength(w + " ", font=f); n += 1
        y += lh
    return y


def panel(img, a, box, cut_left, cut_right):
    """ऊपर का हिस्सा: तस्वीर (रंग में डूबी) या श्रेणी के रंग का हाफ़टोन, नीचे से तिरछा कटा."""
    col = og.CAT.get(a["cat"], og.CAT["दुनिया"])
    x0, y0, x1, y1 = box
    pnl = Image.new("RGB", (W, H), col)
    ph = og.photo(a) if a.get("photo") else None
    if ph:
        s = max((x1 - x0) / ph.width, (y1 - y0) / ph.height)
        ph = ph.resize((int(ph.width * s) + 1, int(ph.height * s) + 1))
        g = ph.convert("L").convert("RGB")
        ph = Image.blend(ph, Image.new("RGB", ph.size, col), .12) if (a.get("photo") or {}).get("kind") == "painting" else Image.blend(g, Image.new("RGB", g.size, col), .42)
        pnl.paste(ph, (x0 + (x1 - x0 - ph.width) // 2, y0 + (y1 - y0 - ph.height) // 2))
    else:
        og.halftone(pnl, (x0, y0, x1, y1 + 40), tuple(min(255, c + 70) for c in col), step=18)
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([(x0, y0), (x1, y0), (x1, cut_right), (x0, cut_left)], fill=255)
    img.paste(pnl, (0, 0), m)
    d = ImageDraw.Draw(img)
    d.polygon([(x0, cut_left), (x1, cut_right), (x1, cut_right + 16), (x0, cut_left + 16)], fill=LAL)
    return bool(ph)


def story_card(a, num=None):
    img = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(img)
    col = og.CAT.get(a["cat"], og.CAT["दुनिया"])
    # पहले नाप लें: हेडलाइन और डेक कितनी जगह लेंगे, ताकि ऊपर का चित्र बाक़ी जगह भर दे
    scratch = ImageDraw.Draw(Image.new("RGB", (W, H)))
    h_end = headline(scratch, a["h"], 60, 0, W - 120, 440)
    f = ns(34, 400); dek_all = og.wrap(d, a.get("dek", ""), f, W - 128); dek = dek_all[:3]
    if len(dek) < len(dek_all): dek[-1] = dek[-1].rstrip("।,") + "…"
    block = 56 + h_end + 34 + len(dek) * 50
    top = 1172 - block                     # टेक्स्ट यहां से शुरू
    cut = top - 120
    panel(img, a, (0, 0, W, cut + 60), cut + 60, cut - 30)
    d.rounded_rectangle([40, 36, 352, 132], 16, fill=PAPER)
    masthead(d, 64, 34, 64)
    y = top
    d.text((64, y), a["cat"], font=ns(34, 700), fill=col)
    y = headline(d, a["h"], 60, y + 56, W - 120, 440)
    yy = y + 34
    for ln in dek:
        d.text((64, yy), ln, font=f, fill=INK2); yy += 50
    d.line([(64, 1196), (W - 64, 1196)], fill=(207, 210, 200), width=2)
    d.text((64, 1218), f"मूल: {a['by']} · {a['pub']}", font=ns(28, 500), fill=INK2)
    d.text((64, 1262), "पूरा लेख: deshkaal.xyz", font=ns(28, 700), fill=LAL)
    return img


def cover_card(day, items):
    img = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(img)
    # ऊपर नीली, नीचे हल्दी की तिरछी पट्टियां: साइट के कवर जैसी
    top = Image.new("RGB", (W, H), og.CAT["दुनिया"]); og.halftone(top, (0, 0, W, 200), (90, 106, 184), step=16)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 120), (0, 190)], fill=255); img.paste(top, (0, 0), m)
    d.polygon([(0, 190), (W, 120), (W, 134), (0, 204)], fill=LAL)
    f = og.font("YatraOne.ttf", 190)
    w = d.textlength("देशकाल", font=f)
    masthead(d, (W - w) / 2, 250, 190)
    tag = og.font("NotoSansDevanagari.ttf", 36, 400)
    d.text((W / 2, 520), "ज़रूरी ख़बरों तक जाती एक पगडंडी", font=tag, fill=INK2, anchor="ma")
    d.text((W / 2, 590), daylabel(day) + " · आज की टिप्पणियां", font=ns(32, 700), fill=LAL, anchor="ma")
    y = 680
    news = [a for a in items if a["cat"] != "साहित्य"][:5]
    for i, a in enumerate(news, 1):
        d.text((92, y - 4), str(i), font=og.font("YatraOne.ttf", 60), fill=LAL, anchor="ra")
        f = ns(38, 600); allw = og.wrap(d, a["h"].replace(":", ","), f, W - 220); lines = allw[:2]
        if len(allw) > 2: lines[1] = lines[1].rstrip("।,") + "…"
        yy = y
        for ln in lines:
            d.text((130, yy), ln, font=f, fill=INK); yy += 52
        y = yy + 26
    d.line([(64, 1220), (W - 64, 1220)], fill=(207, 210, 200), width=2)
    d.text((64, 1244), f"आज कुल {len(items)} टिप्पणियां · आगे की स्लाइड में पढ़िए", font=ns(29, 600), fill=INK2)
    return img


def end_card(day):
    img = Image.new("RGB", (W, H), og.CAT["दुनिया"]); d = ImageDraw.Draw(img)
    og.halftone(img, (0, 0, W, H), (64, 80, 160), step=20)
    d.rounded_rectangle([70, 150, W - 70, H - 150], 28, fill=PAPER)
    f = og.font("YatraOne.ttf", 140); w = d.textlength("देशकाल", font=f)
    masthead(d, (W - w) / 2, 210, 140)
    d.text((W / 2, 430), "हर सुबह 7 बजे, नयी टिप्पणियां", font=ns(40, 700), fill=INK, anchor="ma")
    rows = [("वेबसाइट", "deshkaal.xyz"), ("WhatsApp", "चैनल: देशकाल"), ("Telegram", "t.me/deshkaal"), ("ईमेल", "deshkaal.xyz पर जुड़ें")]
    y = 560
    for k, v in rows:
        d.text((150, y), k, font=ns(34, 700), fill=LAL)
        d.text((430, y), v, font=ns(34, 500), fill=INK); y += 90
    d.text((W / 2, 1000), "पूरे लेख का लिंक बायो में", font=ns(36, 700), fill=INK2, anchor="ma")
    d.text((W / 2, 1060), "पढ़ें, सहेजें, आगे भेजें", font=ns(32, 400), fill=INK2, anchor="ma")
    return img


def save(img, path):
    img.save(path, "JPEG", quality=90, optimize=True, progressive=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    redo = "--all" in sys.argv
    files = sorted(glob.glob(os.path.join(ROOT, "data", "days", "*.json")))
    if args: files = [os.path.join(ROOT, "data", "days", args[0] + ".json")]
    elif not redo: files = files[-1:]
    n = 0
    for fpath in files:
        day = os.path.basename(fpath)[:10]
        items = json.load(open(fpath, encoding="utf-8"))
        for i, a in enumerate(items, 1):
            p = os.path.join(OUT, a["id"] + ".jpg")
            if os.path.exists(p) and not redo: continue
            save(story_card(a), p); n += 1
        for name, mk in (("cover", lambda: cover_card(day, items)), ("end", lambda: end_card(day))):
            p = os.path.join(OUT, f"{day}-{name}.jpg")
            if os.path.exists(p) and not redo: continue
            save(mk(), p); n += 1
    print(f"Instagram कार्ड बने: {n}")


if __name__ == "__main__":
    main()
