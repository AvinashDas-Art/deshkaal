"""देशकाल: पोस्टर-कोलाज बनाना (काग़ज़-कटाई शैली, मौलिक आकृतियां + अपनी ही सुर्खियों के टुकड़े).

चलाएं: python3 scripts/collage.py data/collage/<नाम>.json
स्पेक (JSON):
  {"out": "public/media/vishesh/x.jpg", "size": [1200, 840], "seed": 7,
   "bg": [176, 28, 24], "motif": "pen-chain",
   "strips": [{"t": "भारत में रोक", "x": 90, "y": 120, "r": -6, "style": "paper|ink|red", "px": 44}],
   "stamp": {"t": "राष्ट्रविरोधी?", "x": 760, "y": 640, "r": -9, "px": 78}}
motif: pen-chain (क़लम पर ज़ंजीर और ताला), coin-stairs (पीढ़ियों की सीढ़ी पर घटती सिक्कों की ढेरी), books (किताबों की ढेरी), city (शहर की इमारतें), window (रोशनी वाली खिड़की), moon (चांद, तारे और क़लम). वैकल्पिक: "dark" और "halftone" (RGB) पृष्ठभूमि के रंग के हिसाब से.
  नये मोटिफ़ MOTIFS{} में जोड़ें.
सारी तस्वीरें ख़ुद कोड से खिंचती हैं: कोई असली व्यक्ति, लोगो या किसी का कार्टून इसमें नहीं आता.
"""
import json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops, features

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(ROOT, "scripts", "fonts")
LAYOUT = ImageFont.Layout.RAQM if features.check("raqm") else ImageFont.Layout.BASIC
S = 2  # सुपरसैंपलिंग


def font(name, px):
    return ImageFont.truetype(os.path.join(F, name), int(px * S), layout_engine=LAYOUT)


def v(x):
    return int(round(x * S))


def shadow_paste(canvas, layer, xy, blur=10, off=(6, 8), alpha=110):
    """layer (RGBA) को canvas पर चिपकाएं, नीचे नरम परछाईं के साथ. xy = layer का बायां-ऊपरी कोना (1x इकाई)."""
    x, y = v(xy[0]), v(xy[1])
    a = layer.split()[3].point(lambda p: int(p * alpha / 255))
    sh = Image.new("RGBA", layer.size, (20, 6, 6, 0))
    sh.putalpha(a)
    sh = sh.filter(ImageFilter.GaussianBlur(v(blur)))
    canvas.alpha_composite(sh, (x + v(off[0]), y + v(off[1])))
    canvas.alpha_composite(layer, (x, y))


def rotated(layer, deg):
    return layer.rotate(deg, resample=Image.BICUBIC, expand=True)


def torn_poly(w, h, rnd, step=14, amp=4):
    pts = []
    x = 0
    while x < w:
        pts.append((x, rnd.uniform(0, amp)))
        x += step + rnd.uniform(-3, 3)
    pts.append((w, rnd.uniform(0, amp)))
    y = 0
    while y < h:
        pts.append((w - rnd.uniform(0, amp), y))
        y += step + rnd.uniform(-3, 3)
    pts.append((w - rnd.uniform(0, amp), h))
    x = w
    while x > 0:
        pts.append((x, h - rnd.uniform(0, amp)))
        x -= step + rnd.uniform(-3, 3)
    pts.append((0, h - rnd.uniform(0, amp)))
    y = h
    while y > 0:
        pts.append((rnd.uniform(0, amp), y))
        y -= step + rnd.uniform(-3, 3)
    return pts


def strip(text, px, style, rnd):
    f = font("NotoSansDevanagari.ttf", px)
    try:
        f.set_variation_by_axes([800 if "wght" in str(ax.get("name", b"")).lower() or "weight" in str(ax.get("name", b"")).lower() else 100 for ax in f.get_variation_axes()])
    except Exception:
        pass
    tmp = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    tw = int(tmp.textlength(text, font=f))
    padx, pady = v(18), v(10)
    w, h = tw + 2 * padx, int(px * S * 1.55) + 2 * pady // 2
    bg, fg = {"paper": ((238, 230, 211), (24, 22, 22)), "ink": ((26, 24, 26), (240, 232, 214)), "red": ((214, 58, 40), (250, 244, 230))}[style]
    lay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.polygon([(a * 1, b * 1) for a, b in torn_poly(w, h, rnd, step=v(14), amp=v(5))], fill=bg + (255,))
    # काग़ज़ के रेशे
    for _ in range(int(w * h / 900)):
        px_, py_ = rnd.randrange(w), rnd.randrange(h)
        c = rnd.randint(-14, 8)
        d.point((px_, py_), fill=tuple(max(0, min(255, k + c)) for k in bg) + (255,))
    d.text((padx, pady // 2 - int(px * S * 0.12)), text, font=f, fill=fg)
    return lay


def grain(img, rnd, amount=14):
    n = Image.effect_noise(img.size, 64).convert("L")
    n = n.point(lambda p: 128 + int((p - 128) * amount / 64))
    rgb = img.convert("RGB")
    out = ImageChops.add(rgb, Image.merge("RGB", (n, n, n)), scale=1, offset=-128)
    return out


def halftone(canvas, box, color, rnd, pitch=16, rmax=6, fade="left"):
    d = ImageDraw.Draw(canvas)
    x0, y0, x1, y1 = [v(k) for k in box]
    p = v(pitch)
    j = 0
    y = y0
    while y < y1:
        x = x0 + (p // 2 if j % 2 else 0)
        while x < x1:
            t = (x - x0) / max(1, x1 - x0) if fade == "left" else 1 - (x - x0) / max(1, x1 - x0)
            t = max(0.0, min(1.0, t))
            r = v(rmax) * (1 - t)
            if r > 0.8:
                d.ellipse((x - r, y - r, x + r, y + r), fill=color)
            x += p
        y += p * 0.866
        j += 1


# ---------- मोटिफ़: क़लम, ज़ंजीर, ताला ----------

def bezier(p0, p1, p2, p3, n=60):
    out = []
    for i in range(n + 1):
        t = i / n
        a, b, c, d = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def link_img(length, width, thick, edge_on):
    L, W = v(length), v(width if not edge_on else width * 0.34)
    pad = v(4)
    lay = Image.new("RGBA", (L + 2 * pad, W + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    t = v(thick)
    base, hi, lo = (176, 182, 190), (232, 236, 240), (92, 98, 108)
    box = (pad, pad, pad + L, pad + W)
    d.rounded_rectangle(box, radius=W // 2, outline=lo, width=t + v(2))
    d.rounded_rectangle(box, radius=W // 2, outline=base, width=t)
    inner = (pad + t // 3, pad + t // 3, pad + L - t // 3, pad + W - t // 3)
    d.arc(inner, 200, 330, fill=hi, width=max(1, t // 3))
    return lay


def chain(canvas, pts_bez, link_len=58, link_w=34, thick=8, ang_jit=0, rnd=None):
    pts = bezier(*pts_bez, n=400)
    dist = [0.0]
    for a, b in zip(pts, pts[1:]):
        dist.append(dist[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = dist[-1]
    step = link_len * 0.74
    n = int(total / step)
    for i in range(n + 1):
        target = i * step
        k = min(range(len(dist)), key=lambda j: abs(dist[j] - target))
        a, b = pts[max(0, k - 1)], pts[min(len(pts) - 1, k + 1)]
        ang = math.degrees(math.atan2(-(b[1] - a[1]), b[0] - a[0]))
        lay = link_img(link_len, link_w, thick, i % 2 == 1)
        lay = rotated(lay, ang + (rnd.uniform(-ang_jit, ang_jit) if rnd else 0))
        cx, cy = pts[k]
        shadow_paste(canvas, lay, (cx - lay.width / S / 2, cy - lay.height / S / 2), blur=4, off=(3, 5), alpha=120)
    return pts[-1]


def padlock(canvas, cx, cy, scale=1.0, deg=-6):
    W, H = 170 * scale, 150 * scale
    pad = 60 * scale
    lay = Image.new("RGBA", (v(W + 2 * pad), v(H + 2 * pad + 90 * scale)), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    ox, oy = v(pad), v(pad + 90 * scale)
    # कड़ा (shackle)
    sw = v(22 * scale)
    d.arc((ox + v(W * 0.2), oy - v(95 * scale), ox + v(W * 0.8), oy + v(70 * scale)), 180, 360, fill=(110, 116, 126), width=sw + v(4))
    d.arc((ox + v(W * 0.2), oy - v(95 * scale), ox + v(W * 0.8), oy + v(70 * scale)), 180, 360, fill=(190, 196, 204), width=sw)
    d.line((ox + v(W * 0.2) + sw // 2, oy - v(12 * scale), ox + v(W * 0.2) + sw // 2, oy + v(14 * scale)), fill=(190, 196, 204), width=sw)
    d.line((ox + v(W * 0.8) - sw // 2, oy - v(12 * scale), ox + v(W * 0.8) - sw // 2, oy + v(14 * scale)), fill=(190, 196, 204), width=sw)
    # देह
    body = (ox, oy, ox + v(W), oy + v(H))
    d.rounded_rectangle(body, radius=v(18 * scale), fill=(150, 104, 18))
    d.rounded_rectangle((ox + v(5), oy + v(5), ox + v(W) - v(5), oy + v(H) - v(5)), radius=v(15 * scale), fill=(214, 164, 44))
    d.rounded_rectangle((ox + v(14 * scale), oy + v(12 * scale), ox + v(W) - v(14 * scale), oy + v(H * 0.42)), radius=v(12 * scale), fill=(236, 196, 84))
    # कुंजी-छेद
    kx, ky = ox + v(W / 2), oy + v(H * 0.52)
    d.ellipse((kx - v(15 * scale), ky - v(15 * scale), kx + v(15 * scale), ky + v(15 * scale)), fill=(58, 38, 8))
    d.polygon([(kx - v(9 * scale), ky + v(6 * scale)), (kx + v(9 * scale), ky + v(6 * scale)), (kx + v(14 * scale), ky + v(48 * scale)), (kx - v(14 * scale), ky + v(48 * scale))], fill=(58, 38, 8))
    lay = rotated(lay, deg)
    shadow_paste(canvas, lay, (cx - lay.width / S / 2, cy - lay.height / S / 2), blur=9, off=(8, 12), alpha=150)


def pen_layer():
    L, H = 800, 96
    lay = Image.new("RGBA", (v(L), v(H)), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    mid = v(H / 2)
    # धड़
    d.rounded_rectangle((v(250), mid - v(36), v(L - 20), mid + v(36)), radius=v(34), fill=(22, 22, 26))
    d.polygon([(v(250), mid - v(36)), (v(150), mid - v(24)), (v(78), mid - v(8)), (v(66), mid), (v(78), mid + v(8)), (v(150), mid + v(24)), (v(250), mid + v(36))], fill=(42, 42, 48))
    d.polygon([(v(78), mid - v(8)), (v(30), mid - v(2)), (v(10), mid), (v(30), mid + v(2)), (v(78), mid + v(8))], fill=(16, 16, 20))
    # पट्टियां और चमक
    d.rectangle((v(250), mid - v(36), v(276), mid + v(36)), fill=(230, 226, 214))
    d.rectangle((v(640), mid - v(36), v(652), mid + v(36)), fill=(214, 58, 40))
    d.line((v(290), mid - v(24), v(L - 60), mid - v(24)), fill=(92, 94, 104), width=v(5))
    d.line((v(110), mid - v(14), v(250), mid - v(26)), fill=(86, 88, 98), width=v(3))
    return lay


def motif_pen_chain(canvas, rnd, size):
    W, H = size
    d = ImageDraw.Draw(canvas)
    # पीछे का बड़ा, गोल, काग़ज़ी सूरज
    cx, cy, R = W * 0.56, H * 0.52, H * 0.40
    disc = Image.new("RGBA", (v(2 * R + 40), v(2 * R + 40)), (0, 0, 0, 0))
    dd = ImageDraw.Draw(disc)
    pts = []
    for k in range(120):
        a = k / 120 * 2 * math.pi
        r = R * (1 + rnd.uniform(-0.012, 0.012))
        pts.append((v(R + 20) + v(r) * math.cos(a), v(R + 20) + v(r) * math.sin(a)))
    dd.polygon(pts, fill=(238, 226, 200, 255))
    shadow_paste(canvas, disc, (cx - R - 20, cy - R - 20), blur=14, off=(10, 14), alpha=130)
    halftone(canvas, (cx - R + 10, cy - R + 10, cx + R - 10, cy + R - 10), (222, 205, 172), rnd, pitch=15, rmax=5.5, fade="right")
    # क़लम
    pen = rotated(pen_layer(), 24)
    px_, py_ = cx - 40, cy + 10
    shadow_paste(canvas, pen, (px_ - pen.width / S / 2, py_ - pen.height / S / 2), blur=10, off=(10, 14), alpha=150)
    # नोक से निकलती लहरदार रेखा (कार्टूनिस्ट की रेखा)
    tip = (px_ - 400 * math.cos(math.radians(24)), py_ + 400 * math.sin(math.radians(24)))
    stroke = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(stroke)
    path = bezier(tip, (tip[0] - 90, tip[1] + 60), (tip[0] - 150, tip[1] - 60), (tip[0] - 250, tip[1] + 50), 80)
    for i, (x, y) in enumerate(path):
        t = i / len(path)
        w = v(15 * (1 - 0.78 * t))
        sd.ellipse((v(x) - w, v(y) - w, v(x) + w, v(y) + w), fill=(14, 14, 18, 255))
    canvas.alpha_composite(stroke)
    # ज़ंजीरें: तीनों ताले की तरफ़
    lock = (cx + 40, cy - 10)
    chain(canvas, [(W * 0.30, -30), (W * 0.36, H * 0.30), (lock[0] - 140, lock[1] - 120), lock], rnd=rnd, ang_jit=3)
    chain(canvas, [(W * 1.02, H * 0.05), (W * 0.90, H * 0.30), (lock[0] + 150, lock[1] - 90), lock], rnd=rnd, ang_jit=3)
    end = chain(canvas, [lock, (lock[0] - 40, lock[1] + 140), (lock[0] - 160, lock[1] + 200), (W * 0.34, H * 0.93)], rnd=rnd, ang_jit=4)
    padlock(canvas, lock[0], lock[1] + 20, 1.35, -7)
    # टूटी कड़ी: खुली और अलग गिरी हुई
    bl = link_img(58, 34, 8, False)
    bl = rotated(bl, 40)
    shadow_paste(canvas, bl, (W * 0.22, H * 0.90), blur=4, off=(3, 5), alpha=120)


# ---------- मोटिफ़: पीढ़ियों की सीढ़ी पर सिक्कों की ढेरी ----------

def coin_layer(rx, ry, th, face=(226, 170, 44), edge=(150, 100, 18)):
    """एक सिक्का (ऊपर से तिरछा): किनारा + चेहरा + भीतर का छल्ला. लौटाता है (layer, चेहरे का केंद्र-y)."""
    pad = v(6)
    w, h = v(2 * rx) + 2 * pad, v(2 * ry + th) + 2 * pad
    lay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cx = w // 2
    top = pad + v(ry)
    bot = top + v(th)
    d.ellipse((cx - v(rx), bot - v(ry), cx + v(rx), bot + v(ry)), fill=edge + (255,))
    d.rectangle((cx - v(rx), top, cx + v(rx), bot), fill=edge + (255,))
    d.ellipse((cx - v(rx), top - v(ry), cx + v(rx), top + v(ry)), fill=face + (255,), outline=(120, 78, 10, 255), width=v(2))
    d.ellipse((cx - v(rx * 0.78), top - v(ry * 0.78), cx + v(rx * 0.78), top + v(ry * 0.78)), outline=(250, 214, 110, 255), width=v(3))
    d.ellipse((cx - v(rx * 0.34), top - v(ry * 0.34), cx + v(rx * 0.34), top + v(ry * 0.34)), fill=(214, 156, 34, 255), outline=(250, 214, 110, 255), width=v(2))
    # किनारे पर खड़ी धारियां
    for k in range(-int(rx) + 6, int(rx) - 4, 9):
        d.line((cx + v(k), top + v(ry * 0.92 * math.sqrt(max(0, 1 - (k / rx) ** 2))), cx + v(k), bot + v(ry * 0.92 * math.sqrt(max(0, 1 - (k / rx) ** 2)))), fill=(118, 78, 12, 150), width=v(1.4))
    return lay


def coin_stack(canvas, rnd, cx, base_y, n, rx=70, ry=22, th=15):
    for i in range(n):
        lay = coin_layer(rx, ry, th)
        jx = rnd.uniform(-5, 5)
        x = cx - lay.width / S / 2 + jx
        y = base_y - (i + 1) * th - ry - 6
        shadow_paste(canvas, lay, (x, y), blur=3, off=(2, 4), alpha=110)


def flying_coin(canvas, rnd, x, y, rx=44, ry=14, deg=0, th=10):
    lay = rotated(coin_layer(rx, ry, th), deg)
    shadow_paste(canvas, lay, (x - lay.width / S / 2, y - lay.height / S / 2), blur=6, off=(5, 9), alpha=120)


def paper_block(canvas, rnd, x, y, w, h, fill, edge_halftone=None):
    lay = Image.new("RGBA", (v(w), v(h)), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.polygon(torn_poly(v(w), v(h), rnd, step=v(18), amp=v(5)), fill=fill + (255,))
    for _ in range(int(w * h / 700)):
        px_, py_ = rnd.randrange(lay.width), rnd.randrange(lay.height)
        c = rnd.randint(-16, 8)
        d.point((px_, py_), fill=tuple(max(0, min(255, k + c)) for k in fill) + (255,))
    shadow_paste(canvas, lay, (x, y), blur=9, off=(8, 12), alpha=140)


def motif_coin_stairs(canvas, rnd, size):
    W, H = size
    # पीछे का बड़ा काग़ज़ी सूरज
    cx, cy, R = W * 0.60, H * 0.40, H * 0.36
    disc = Image.new("RGBA", (v(2 * R + 40), v(2 * R + 40)), (0, 0, 0, 0))
    dd = ImageDraw.Draw(disc)
    pts = [(v(R + 20) + v(R * (1 + rnd.uniform(-0.012, 0.012))) * math.cos(k / 120 * 2 * math.pi), v(R + 20) + v(R * (1 + rnd.uniform(-0.012, 0.012))) * math.sin(k / 120 * 2 * math.pi)) for k in range(120)]
    dd.polygon(pts, fill=(238, 226, 200, 255))
    shadow_paste(canvas, disc, (cx - R - 20, cy - R - 20), blur=14, off=(10, 14), alpha=130)
    halftone(canvas, (cx - R + 10, cy - R + 10, cx + R - 10, cy + R - 10), (222, 205, 172), rnd, pitch=15, rmax=5.5, fade="right")
    # तीन पीढ़ियां: तीन सीढ़ियां, हर सीढ़ी पर ढेरी छोटी
    steps = [(50, 360, 360, 480, (240, 232, 212)), (410, 520, 340, 320, (222, 208, 176)), (750, 650, 360, 190, (196, 178, 142))]
    for x, y, w, h, col in steps:
        paper_block(canvas, rnd, x, y, w, h, col)
    coin_stack(canvas, rnd, 230, 360, 9)
    coin_stack(canvas, rnd, 580, 520, 4)
    coin_stack(canvas, rnd, 930, 650, 1)
    # सीढ़ी से लुढ़कते सिक्के
    for (x, y, deg) in [(430, 250, -24), (500, 330, 12), (700, 430, -18), (790, 520, 20), (1060, 600, 8)]:
        flying_coin(canvas, rnd, x, y, deg=deg)


# ---------- नये मोटिफ़: किताबें, शहर, खिड़की, चांद-क़लम (हमसफ़र के स्वचालित कोलाज के लिए) ----------

def sun_disc(canvas, rnd, cx, cy, R, col=(238, 226, 200), ht=(222, 205, 172)):
    disc = Image.new("RGBA", (v(2 * R + 40), v(2 * R + 40)), (0, 0, 0, 0))
    dd = ImageDraw.Draw(disc)
    pts = [(v(R + 20) + v(R * (1 + rnd.uniform(-0.012, 0.012))) * math.cos(k / 120 * 2 * math.pi), v(R + 20) + v(R * (1 + rnd.uniform(-0.012, 0.012))) * math.sin(k / 120 * 2 * math.pi)) for k in range(120)]
    dd.polygon(pts, fill=col + (255,))
    shadow_paste(canvas, disc, (cx - R - 20, cy - R - 20), blur=14, off=(10, 14), alpha=130)
    halftone(canvas, (cx - R + 10, cy - R + 10, cx + R - 10, cy + R - 10), ht, rnd, pitch=15, rmax=5.5, fade="right")


def book_layer(w, h, col, rnd):
    lay = Image.new("RGBA", (v(w), v(h)), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.polygon(torn_poly(v(w), v(h), rnd, step=v(16), amp=v(3)), fill=col + (255,))
    light = tuple(min(255, c + 46) for c in col)
    dark = tuple(max(0, c - 40) for c in col)
    d.rectangle((v(w * 0.04), 0, v(w * 0.055), v(h)), fill=dark + (255,))
    d.rectangle((v(w * 0.945), 0, v(w * 0.96), v(h)), fill=dark + (255,))
    d.rectangle((v(w * 0.30), v(h * 0.30), v(w * 0.70), v(h * 0.70)), fill=light + (255,))
    d.rectangle((v(w * 0.34), v(h * 0.44), v(w * 0.66), v(h * 0.50)), fill=col + (255,))
    return lay


def motif_books(canvas, rnd, size):
    W, H = size
    sun_disc(canvas, rnd, W * 0.64, H * 0.38, H * 0.31)
    books = [(520, 84, (176, 40, 36), -6, -1.5), (470, 76, (24, 26, 32), 10, 2), (500, 80, (232, 218, 186), -12, -2.5), (430, 72, (222, 160, 40), 8, 1.5), (380, 66, (40, 100, 90), -4, -1)]
    y = H - 50
    cx = W * 0.5
    for w, h, col, dx, deg in books:
        lay = rotated(book_layer(w, h, col, rnd), deg)
        y -= h
        shadow_paste(canvas, lay, (cx - lay.width / S / 2 + dx, y - (lay.height / S - h) / 2), blur=7, off=(6, 9), alpha=140)


def motif_city(canvas, rnd, size):
    W, H = size
    sun_disc(canvas, rnd, W * 0.68, H * 0.34, H * 0.27)
    cols = [(30, 30, 40), (56, 54, 70), (232, 220, 190), (206, 186, 150), (22, 22, 28)]
    x, i = 10, 0
    while x < W - 30:
        bw, bh, col = rnd.randint(100, 175), rnd.randint(230, 470), cols[i % len(cols)]
        i += 1
        lay = Image.new("RGBA", (v(bw), v(bh)), (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        d.polygon(torn_poly(v(bw), v(bh), rnd, step=v(18), amp=v(4)), fill=col + (255,))
        dark = sum(col) < 300
        for wy in range(24, bh - 20, 36):
            for wx in range(16, bw - 20, 30):
                c = (250, 214, 110) if rnd.random() < 0.35 else ((72, 70, 90) if dark else (176, 160, 128))
                d.rectangle((v(wx), v(wy), v(wx + 14), v(wy + 20)), fill=c + (255,))
        shadow_paste(canvas, lay, (x, H - bh), blur=8, off=(6, 8), alpha=130)
        x += bw - rnd.randint(0, 14)


def motif_window(canvas, rnd, size):
    W, H = size
    ww, wh = 360, 560
    x0, y0 = W * 0.5 - ww / 2, 60
    beam = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(beam).polygon([(v(x0 + 40), v(y0 + wh - 30)), (v(x0 + ww - 40), v(y0 + wh - 30)), (v(W * 0.95), v(H)), (v(W * 0.05), v(H))], fill=(255, 236, 170, 70))
    canvas.alpha_composite(beam)
    lay = Image.new("RGBA", (v(ww), v(wh)), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    paper, m = (238, 226, 200, 255), 26
    d.rectangle((0, v(ww / 2), v(ww), v(wh)), fill=paper)
    d.ellipse((0, 0, v(ww), v(ww)), fill=paper)
    inner = (14, 28, 44, 255)
    d.rectangle((v(m), v(ww / 2), v(ww - m), v(wh - m)), fill=inner)
    d.ellipse((v(m), v(m), v(ww - m), v(ww - m)), fill=inner)
    d.ellipse((v(ww / 2 - 70), v(ww / 2 - 120), v(ww / 2 + 70), v(ww / 2 + 20)), fill=(250, 214, 110, 255))
    d.rectangle((v(ww / 2 - 7), v(m), v(ww / 2 + 7), v(wh - m)), fill=paper)
    d.rectangle((v(m), v(wh * 0.55), v(ww - m), v(wh * 0.55 + 14)), fill=paper)
    shadow_paste(canvas, lay, (x0, y0), blur=10, off=(8, 12), alpha=140)
    paper_block(canvas, rnd, x0 - 30, y0 + wh - 6, ww + 60, 44, (214, 196, 160))


def motif_moon(canvas, rnd, size):
    W, H = size
    R, cx, cy = H * 0.30, W * 0.64, H * 0.38
    lay = Image.new("RGBA", (v(2 * R + 40), v(2 * R + 40)), (0, 0, 0, 0))
    ImageDraw.Draw(lay).ellipse((v(20), v(20), v(20 + 2 * R), v(20 + 2 * R)), fill=(238, 226, 200, 255))
    cut = Image.new("L", lay.size, 255)
    ImageDraw.Draw(cut).ellipse((v(20 + R * 0.55), v(20 - R * 0.10), v(20 + R * 0.55 + 2 * R * 0.92), v(20 - R * 0.10 + 2 * R * 0.92)), fill=0)
    lay.putalpha(ImageChops.multiply(lay.split()[3], cut))
    shadow_paste(canvas, lay, (cx - R - 20, cy - R - 20), blur=14, off=(10, 14), alpha=130)
    d = ImageDraw.Draw(canvas)
    for _ in range(14):
        sx, sy, r = rnd.uniform(40, W - 40), rnd.uniform(30, H * 0.7), rnd.uniform(8, 20)
        k = 0.28
        d.polygon([(v(sx), v(sy - r)), (v(sx + r * k), v(sy - r * k)), (v(sx + r), v(sy)), (v(sx + r * k), v(sy + r * k)), (v(sx), v(sy + r)), (v(sx - r * k), v(sy + r * k)), (v(sx - r), v(sy)), (v(sx - r * k), v(sy - r * k))], fill=(250, 236, 190, 255))
    pen = rotated(pen_layer(), 24)
    px_, py_ = W * 0.56, H * 0.70
    shadow_paste(canvas, pen, (px_ - pen.width / S / 2, py_ - pen.height / S / 2), blur=10, off=(10, 14), alpha=150)
    tip = (px_ - 400 * math.cos(math.radians(24)), py_ + 400 * math.sin(math.radians(24)))
    stroke = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(stroke)
    path = bezier(tip, (tip[0] - 90, tip[1] + 60), (tip[0] - 150, tip[1] - 60), (tip[0] - 250, tip[1] + 50), 80)
    for i, (x, y) in enumerate(path):
        w = v(15 * (1 - 0.78 * i / len(path)))
        sd.ellipse((v(x) - w, v(y) - w, v(x) + w, v(y) + w), fill=(14, 14, 18, 255))
    canvas.alpha_composite(stroke)


MOTIFS = {"pen-chain": motif_pen_chain, "coin-stairs": motif_coin_stairs, "books": motif_books, "city": motif_city, "window": motif_window, "moon": motif_moon}


def build(spec):
    rnd = random.Random(spec.get("seed", 1))
    W, H = spec.get("size", [1200, 840])
    bg = tuple(spec.get("bg", [176, 28, 24]))
    canvas = Image.new("RGBA", (v(W), v(H)), bg + (255,))
    d = ImageDraw.Draw(canvas)
    # रंग का ढलान: कोने गहरे
    grad = Image.new("L", (v(W), v(H)), 0)
    gd = ImageDraw.Draw(grad)
    for i in range(40):
        t = i / 40
        gd.ellipse((v(-W * 0.2 * (1 - t) - 40 * t), v(-H * 0.3 * (1 - t)), v(W * 1.2 - 0), v(H * 1.3)), outline=int(60 * (1 - t)), width=v(40))
    dark = Image.new("RGBA", canvas.size, tuple(spec.get("dark", [60, 6, 6])) + (255,))
    canvas = Image.composite(dark, canvas, grad.point(lambda p: int(p * 0.55)))
    d = ImageDraw.Draw(canvas)
    halftone(canvas, (0, H * 0.45, W * 0.45, H), tuple(spec.get("halftone", [132, 18, 16])) + (255,), rnd, pitch=18, rmax=7, fade="right")
    # पीछे वाली पट्टियां
    strips = spec.get("strips", [])
    back = [s for s in strips if not s.get("front")]
    front = [s for s in strips if s.get("front")]
    for s in back:
        lay = rotated(strip(s["t"], s.get("px", 44), s.get("style", "paper"), rnd), s.get("r", 0))
        shadow_paste(canvas, lay, (s["x"], s["y"]), blur=8, off=(6, 9), alpha=120)
    MOTIFS[spec.get("motif", "pen-chain")](canvas, rnd, (W, H))
    for s in front:
        lay = rotated(strip(s["t"], s.get("px", 44), s.get("style", "paper"), rnd), s.get("r", 0))
        shadow_paste(canvas, lay, (s["x"], s["y"]), blur=8, off=(6, 9), alpha=140)
    st = spec.get("stamp")
    if st:
        f = font("YatraOne.ttf", st.get("px", 76))
        tmp = ImageDraw.Draw(Image.new("RGB", (4, 4)))
        tw = int(tmp.textlength(st["t"], font=f))
        pad = v(26)
        lay = Image.new("RGBA", (tw + 2 * pad, int(st.get("px", 76) * S * 1.5) + pad), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        col = (246, 238, 220, 255)
        ld.rectangle((0, 0, lay.width, lay.height), fill=(34, 8, 8, 235))
        ld.rectangle((v(3), v(3), lay.width - v(3), lay.height - v(3)), outline=col, width=v(7))
        ld.rectangle((v(14), v(14), lay.width - v(14), lay.height - v(14)), outline=col, width=v(2))
        ld.text((pad, int(pad * 0.5)), st["t"], font=f, fill=col)
        # घिसा हुआ ठप्पा: छोटे-छोटे धब्बे मिटाएं
        a = lay.split()[3]
        mk = Image.new("L", lay.size, 255)
        md = ImageDraw.Draw(mk)
        for _ in range(520):
            x, y = rnd.randrange(lay.width), rnd.randrange(lay.height)
            r = rnd.randint(1, v(3.2))
            md.ellipse((x - r, y - r, x + r, y + r), fill=0)
        lay.putalpha(ImageChops.multiply(a, mk))
        lay = rotated(lay, st.get("r", -8))
        shadow_paste(canvas, lay, (st["x"], st["y"]), blur=3, off=(3, 4), alpha=90)
    # खरोंचें
    sc = ImageDraw.Draw(canvas)
    for _ in range(46):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        L = rnd.uniform(20, 160)
        a = rnd.uniform(-0.6, 0.6)
        sc.line((v(x), v(y), v(x + L * math.cos(a)), v(y + L * math.sin(a))), fill=(255, 235, 220, rnd.randint(18, 48)), width=max(1, v(rnd.uniform(0.5, 1.4))))
    out = grain(canvas, rnd, 16).resize((W, H), Image.LANCZOS)
    return out


def main():
    spec_path = sys.argv[1]
    spec = json.load(open(spec_path, encoding="utf8"))
    img = build(spec)
    out = os.path.join(ROOT, spec["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, quality=88, optimize=True)
    print("लिखा:", out, img.size)


if __name__ == "__main__":
    main()
