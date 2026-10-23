#!/usr/bin/env python3
"""देशकाल · हमसफ़र: बिना तस्वीर की हर रचना के लिए कोलाज अपने-आप बनाना.

मालिक का नियम (23 अक्टूबर 2026): हमसफ़र की जिस रचना के साथ तस्वीर नहीं आयी, उसके साथ देशकाल का कोलाज लगेगा,
ताकि होमपेज और हमसफ़र के ख़ाने कभी ख़ाली न दिखें (बिना तस्वीर के कार्ड पर सिर्फ़ उद्धरण रह जाता है).

चलाएं:
  python3 scripts/hs_autocollage.py                 # जिनमें images नहीं हैं, उन सबके लिए
  python3 scripts/hs_autocollage.py ID [ID ...]      # सिर्फ़ ये रचनाएं (ID = फ़ाइल का नाम, .json के बिना)
  python3 scripts/hs_autocollage.py --force ID       # तस्वीर हो तब भी नया कोलाज (पुराना कोलाज बदलने के लिए)
  हाथ से बने कोलाज के स्पेक में "manual": true रखें; स्क्रिप्ट उसे कभी नहीं बदलती.

क्या करता है: रचना के अपने शीर्षक, चुने हुए वाक्यांश और (हो तो) एक सवाल से काग़ज़ी पट्टियां बनाता है, विषय के हिसाब से
मोटिफ़ (किताबें, शहर, खिड़की, चांद-क़लम, सिक्के, क़लम-ज़ंजीर) और रंग चुनता है, `public/media/hamsafar/<id>-1.jpg`
लिखता है, स्पेक `data/collage/<id>.json` में रखता है और रचना की json में `images` (हिंदी, en, ur) जोड़ देता है.
पट्टियों में अंक, अंग्रेज़ी अक्षर और कड़े/हिंसक शब्द नहीं जाते; किसी असली व्यक्ति का चेहरा, लोगो या झंडा कभी नहीं बनता.
"""
import glob, hashlib, json, os, random, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import collage as C

ROOT = C.ROOT
W, H = 1200, 840
PALETTE = [(176, 28, 24), (16, 82, 72), (26, 46, 104), (138, 84, 22), (88, 30, 72), (40, 56, 68)]
MOTIF_KEYS = [
    ("coin-stairs", r"धन|बैंक|बाज़ार|अर्थ|रुपय|डॉलर|कमाई|क़र्ज़|बीमा|निजीकरण|दाम|महंगाई"),
    ("pen-chain", r"आयोग|सेंसर|पाबंदी|आज़ादी|पत्रकार|गोदी|प्रेस|अदालत|संविधान|सत्याग्रह|आलोचना|पत्र"),
    ("city", r"शहर|मुंबई|बंबई|दिल्ली|महानगर|सड़क|चप्पे|गली|मोहल्ल|इमारत"),
    ("books", r"किताब|पुस्तक|उपन्यास|लेखक|अनुवाद|साहित्य|भाषा|अलीगढ़|विश्वविद्यालय|स्कूल|पढ़"),
    ("window", r"घर|रास्ता|याद|पिता|साइकिल|मां|बचपन|रोशन|खिड़की|दीवार"),
    ("moon", r"कविता|गीत|रात|चांद|समय|नींद|सपना"),
]
ROTATE = ["books", "city", "window", "moon"]
ALT = {
    "books": ("किताबों की ढेरी", "a stack of books", "کتابوں کی ڈھیری"),
    "city": ("शहर की इमारतों की क़तार", "a row of city buildings", "شہر کی عمارتوں کی قطار"),
    "window": ("रोशनी बिखेरती मेहराबदार खिड़की", "an arched window spilling light", "روشنی بکھیرتی محرابی کھڑکی"),
    "moon": ("चांद, तारे और क़लम", "a moon, stars and a pen", "چاند، ستارے اور قلم"),
    "coin-stairs": ("सीढ़ियों पर सिक्कों की ढेरियां", "stacks of coins on steps", "سیڑھیوں پر سکوں کی ڈھیریاں"),
    "pen-chain": ("क़लम पर ज़ंजीर और ताला", "a pen bound with chains and a padlock", "قلم پر زنجیر اور تالا"),
}
BAD = re.compile(r"[0-9A-Za-z\[\]()/@#]|प्रेस्टीट्यूट|अराजक|सिकुलर|देशद्रोही|आतंकवाद|ग़द्दार|गद्दार|दंगाई|जिहाद|हत्या|हत्यारे|बलात्कार|रेप|ख़ून|लाश|हरामी|कमीन|साला|चूतिया|गाली|वेश्या|रंडी|यौन|धर्मांतरण|दंगा|हमला|मौत|फांसी|छलनी|गोली|बम|मारो|मार डाल|भाजपा|बीजेपी|कांग्रेस|आरएसएस|संघ|मोदी|शाह|भागवत|राहुल|योगी|केजरीवाल|नीतीश|लालू|ममता|एजेंट|दलाल|चमचा|कुमार|सिंह|ख़ान|खान|यादव|शर्मा|गुप्ता|सरकार|पार्टी|नेता|मंत्री|पुलिस|न्यायाधीश|वनवासी|पंडे|पुजारी|गोदी|ट्रंप|ट्रम्प|पुतिन|नेतन्याहू|बाइडेन|जिनपिंग|सुनक|काली|लक्ष्मी|दुर्गा|हनुमान|अल्लाह|धार्मिक|रिमेम्बर|डेविल|धंधा|एनडीटीवी|ख़ेमे|मीडिया|चैनल|अख़बार")


def hid(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def fit(text, style, px0, maxw, pxmin, step=2):
    px = px0
    while px >= pxmin:
        w = C.strip(text, px, style, random.Random(1)).width / C.S
        if w <= maxw:
            return px, w
        px -= step
    return None


def clean(s):
    s = re.sub(r"^[\s\"“”‘’'\-•*]+", "", s)
    s = re.sub(r"[\s\"“”‘’'।!]+$", "", s)
    s = s.strip()
    if s.count("‘") != s.count("’") or s.count("“") != s.count("”"):
        s = re.sub(r"[‘’“”]", "", s)
    return s


def clean_title(s):
    s = s.strip()
    if BAD.search(s) and ":" in s:
        s = s.split(":", 1)[0].strip()
    if s.count("‘") != s.count("’") or s.count("“") != s.count("”") or s.count("'") % 2:
        s = re.sub(r"[‘’“”']", "", s)
    return s


def clause(s, lo=16, hi=58):
    """पूरा वाक्य ठीक लंबाई का हो तो (अधूरा नहीं) वही; वरना None."""
    return s if lo <= len(s) <= hi and "।" not in s else None


def cut_clause(s, lo=24, hi=46):
    """लंबे वाक्य का पहला अल्पविराम-खंड, अंत में … के साथ (साफ़ दिखे कि यह अंश है)."""
    for part in re.split(r"[,;:]\s*", s)[:-1]:
        part = clean(part)
        if lo <= len(part) <= hi:
            return part + "…"
    return None


def pieces(d):
    out = []
    for p in d.get("body") or []:
        parts = p.split("\n") if d.get("kind") == "kavita" else re.split(r"(?<=[।?!])\s+|\n", p)
        out += [x.strip() for x in parts if x.strip()]
    return out


def pick_fragments(d, n=3):
    title = clean_title(d["h"])
    sents = pieces(d)
    cands = []
    pull = clean(d.get("pull") or "")
    if pull and d.get("kind") != "kavita":
        cands.append(("pull", -1, pull))
    for i, s in enumerate(sents):
        cands.append(("b", i, clean(s)))

    def usable(s, c):
        return c and not BAD.search(s) and "?" not in s and c.rstrip("…") not in title and title not in c

    def spread(good, m):
        out = []
        for third in range(3):
            lo, hi = m * third // 3, m * (third + 1) // 3
            seg = [g for g in good if lo <= g[1] < max(hi, lo + 1)]
            seg.sort(key=lambda g: abs(len(g[2]) - 32))
            if seg and seg[0][2] not in out:
                out.append(seg[0][2])
        return out

    m = max(1, len(sents))
    whole = [(t, i, clause(s)) for t, i, s in cands if usable(s, clause(s))]
    chosen = []
    if whole and whole[0][0] == "pull":
        chosen.append(whole[0][2])
    chosen += spread([g for g in whole if g[0] == "b"], m)
    if len(chosen) < n:
        cut = [(t, i, cut_clause(s)) for t, i, s in cands if usable(s, cut_clause(s)) and not (t == "b" and any(s.startswith(x) for x in chosen))]
        for c in spread([g for g in cut if g[0] == "b"], m):
            if len(chosen) < n and c not in chosen:
                chosen.append(c)
    uniq = []
    for c in chosen:
        if not any(c in u or u in c for u in uniq):
            uniq.append(c)
    return uniq[: n + 1]


def pick_question(d):
    for s in pieces(d):
        if s.endswith("?"):
            q = clean(s.rstrip("?"))
            if 8 <= len(q) <= 18 and not BAD.search(q):
                return q + "?"
    return None


def choose_motif(d, prev):
    text = d["h"] + " " + (d.get("dek") or "")
    m = None
    if d.get("kind") == "kavita":
        m = "moon"
    else:
        for name, rx in MOTIF_KEYS:
            if re.search(rx, text):
                m = name
                break
        if not m and d.get("kind") in ("sansmaran", "kahani"):
            m = "window"
    if not m:
        m = ROTATE[hid(d["id"]) % len(ROTATE)]
    if m == prev:
        pool = [x for x in ROTATE if x != prev]
        m = pool[hid(d["id"]) % len(pool)]
    return m


def split_title(h):
    h = h.strip()
    if ": " in h:
        a, b = h.split(": ", 1)
        return [a + ":", b]
    words = h.split(" ")
    best, cut = 10**9, None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if abs(len(a) - len(b)) < best:
            best, cut = abs(len(a) - len(b)), i
    return [" ".join(words[:cut]), " ".join(words[cut:])] if cut else [h]


def make_spec(d, motif, color):
    pid = d["id"]
    strips = []
    # शीर्षक (किनारे से ~66px भीतर: कार्ड पर तस्वीर कटकर बैठती है)
    htitle = clean_title(d["h"])
    one = fit(htitle, "ink", 44, 820, 32)
    if one:
        strips.append({"t": htitle, "x": 66, "y": 48, "r": -4, "style": "ink", "px": one[0], "front": True})
    else:
        for k, line in enumerate(split_title(htitle)):
            f = fit(line, "ink", 40, 800, 26)
            if not f:
                line = clause(line, 6, 40) or line[:40]
                f = fit(line, "ink", 30, 800, 22) or (24, 700)
            strips.append({"t": line, "x": 66 + 34 * k, "y": 44 + 80 * k, "r": -4 + 6 * k, "style": "ink", "px": f[0], "front": True})
    # अंश
    frags = pick_fragments(d)
    slots = [("paper", 3, 190, "right"), ("red", -3, 560, "left"), ("paper", -2, 690, "right"), ("red", 2, 770, "left")]
    for text, (style, r, y, side) in zip(frags, slots):
        f = fit(text, style, 30, 700, 22)
        if not f:
            continue
        px, w = f
        x = W - w - 72 if side == "right" else 66
        strips.append({"t": text, "x": int(max(66, x)), "y": y, "r": r, "style": style, "px": px, "front": True})
    spec = {"out": f"public/media/hamsafar/{pid}-1.jpg", "size": [W, H], "seed": hid(pid) % 997, "bg": list(color),
            "dark": [int(c * 0.26) for c in color], "halftone": [int(c * 0.72) for c in color], "motif": motif, "strips": strips}
    q = pick_question(d)
    if q:
        spec["stamp"] = {"t": q, "x": 72, "y": 330, "r": -8, "px": 62 if len(q) <= 10 else 50}
    return spec


def indent_of(raw):
    m = re.match(r"\s*\{\n( +)", raw)
    return len(m.group(1)) if m else 1


def attach(d, motif):
    a_hi, a_en, a_ur = ALT[motif]
    src = f"/media/hamsafar/{d['id']}-1.jpg"
    d["images"] = [{"src": src, "w": W, "h": H, "alt": f"{a_hi}: काग़ज़ से कटी आकृतियों पर रचना के अपने अंश", "cap": "कोलाज: देशकाल"}]
    if "en" in d:
        d["en"]["images"] = [{"alt": f"{a_en[0].upper() + a_en[1:]}, cut from paper, with lines from the piece itself", "cap": "Collage: Deshkaal"}]
    if "ur" in d:
        d["ur"]["images"] = [{"alt": f"{a_ur}: کاغذ سے کٹی شکلوں پر تحریر کے اپنے ٹکڑے", "cap": "کولاج: دیش کال"}]


def spec_path(pid):
    return os.path.join(ROOT, "data", "collage", pid + ".json")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    allf = sorted(glob.glob(os.path.join(ROOT, "data", "hamsafar", "*.json")))
    # पिछली रचना का मोटिफ़/रंग उसके स्पेक से पढ़ें, ताकि नतीजा इस पर निर्भर न रहे कि कौन-सी रचनाएं इस बार चलीं
    known = {}
    for f in allf:
        pid = os.path.basename(f)[:-5]
        if os.path.exists(spec_path(pid)):
            sp = json.load(open(spec_path(pid), encoding="utf8"))
            known[pid] = (sp.get("motif"), tuple(sp.get("bg", [])))
    made = 0
    for f in allf:
        pid = os.path.basename(f)[:-5]
        if args and pid not in args:
            continue
        raw = open(f, encoding="utf8").read()
        d = json.loads(raw)
        if d.get("kind") in ("cartoon", "photo") or (d.get("images") and not force):
            continue
        if os.path.exists(spec_path(pid)) and json.load(open(spec_path(pid), encoding="utf8")).get("manual"):
            print(f"{pid}: हाथ का बना कोलाज है (manual), छुआ नहीं")
            continue
        earlier = [k for k in known if k < pid]
        prev_motif, prev_color = known[max(earlier)] if earlier else (None, None)
        motif = choose_motif(d, prev_motif)
        k = hid(pid) % len(PALETTE)
        if PALETTE[k] == prev_color:
            k = (k + 1) % len(PALETTE)
        color = PALETTE[k]
        spec = make_spec(d, motif, color)
        os.makedirs(os.path.dirname(spec_path(pid)), exist_ok=True)
        json.dump(spec, open(spec_path(pid), "w", encoding="utf8"), ensure_ascii=False, indent=2)
        img = C.build(spec)
        out = os.path.join(ROOT, spec["out"])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        img.save(out, quality=84, optimize=True)
        attach(d, motif)
        json.dump(d, open(f, "w", encoding="utf8"), ensure_ascii=False, indent=indent_of(raw))
        known[pid] = (motif, color)
        made += 1
        print(f"{pid}: {motif} · {len(spec['strips'])} पट्टियां" + (f" · ठप्पा {spec['stamp']['t']}" if spec.get("stamp") else ""))
        for st in spec["strips"]:
            print("    ", st["t"])
    print(f"कोलाज बने: {made}")


if __name__ == "__main__":
    main()
