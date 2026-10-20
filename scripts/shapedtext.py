"""देवनागरी/उर्दू की असली शेपिंग (HarfBuzz) — उन मशीनों के लिए जहां Pillow में libraqm नहीं है.

Pillow बिना raqm के अक्षर-दर-अक्षर छापता है: "चु" का ु अलग, "जि" का ि पीछे, "क्ष" टूटा.
यहाँ HarfBuzz से शेप करके freetype से ग्लिफ़ छापे जाते हैं, ताकि कार्ड का पाठ ठीक जुड़े.

    import shapedtext as st
    st.ok                                  # True अगर uharfbuzz + freetype-py मिले
    st.width("चुंबन", "scripts/fonts/…ttf", 44)
    st.draw(img, (60, 170), "चुंबन", "scripts/fonts/…ttf", 44, (207, 58, 46))

draw() का (x, y) वही है जो Pillow के d.text() में होता है: बायां-ऊपरी कोना, ascender रेखा पर.
"""
from PIL import Image

try:
    import uharfbuzz as hb
    import freetype
    ok = True
except Exception:          # पुरानी मशीन: चुपचाप Pillow वाले रास्ते पर लौट जाएं
    ok = False

_CACHE = {}


class _Shaper:
    def __init__(self, path):
        self.data = open(path, "rb").read()
        self.face = hb.Face(self.data)
        self.font = hb.Font(self.face)
        self.ft = freetype.Face(path)

    def shape(self, text, px):
        self.font.scale = (px * 64, px * 64)
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, {"kern": True, "liga": True, "calt": True})
        self.ft.set_char_size(px * 64)
        return buf.glyph_infos, buf.glyph_positions


def _sh(path):
    s = _CACHE.get(path)
    if s is None:
        s = _CACHE[path] = _Shaper(path)
    return s


def width(text, path, px):
    """पाठ की चौड़ाई (पिक्सल में), शेपिंग के बाद."""
    _, pos = _sh(path).shape(text, px)
    return sum(p.x_advance for p in pos) / 64.0


def draw(base, xy, text, path, px, fill):
    """पाठ को base (RGB) पर छापें; लौटाएं चौड़ाई."""
    s = _sh(path)
    infos, pos = s.shape(text, px)
    asc = s.ft.size.ascender // 64
    desc = -s.ft.size.descender // 64
    adv = sum(p.x_advance for p in pos) / 64.0
    pen, boxes = 0, []
    for info, p in zip(infos, pos):
        s.ft.load_glyph(info.codepoint, freetype.FT_LOAD_RENDER)
        bm = s.ft.glyph.bitmap
        gx = pen + p.x_offset // 64 + s.ft.glyph.bitmap_left
        gy = asc - p.y_offset // 64 - s.ft.glyph.bitmap_top
        if bm.width and bm.rows:
            g = Image.frombytes("L", (bm.width, bm.rows), bytes(bm.buffer), "raw", "L", bm.pitch)
            boxes.append((gx, gy, g))
        pen += p.x_advance // 64
    minx = min([0] + [b[0] for b in boxes])
    miny = min([0] + [b[1] for b in boxes])
    maxx = max([int(adv)] + [b[0] + b[2].width for b in boxes])
    maxy = max([asc + desc] + [b[1] + b[2].height for b in boxes])
    mask = Image.new("L", (max(1, maxx - minx), max(1, maxy - miny)), 0)
    for gx, gy, g in boxes:
        mask.paste(g, (gx - minx, gy - miny), g)
    base.paste(Image.new("RGB", mask.size, fill), (int(xy[0]) + minx, int(xy[1]) + miny), mask)
    return adv
