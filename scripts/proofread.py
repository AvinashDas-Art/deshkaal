"""देशकाल · प्रूफ़ रीडिंग की मशीनी जांच (vartani.py के बाद चलाने के लिए).

vartani छोड़ देता है वे सब गड़बड़ियां जो सिर्फ़ अक्षरों की नहीं, संदर्भ की होती हैं:
मिलते-जुलते लाइन-ब्रेक, बेजोड़ उद्धरण, फ़ॉरवर्ड के साथ आए वेब-पते, दो बार लिखा शब्द,
हिंदी वाक्य के आख़िर में अंग्रेज़ी फुल स्टॉप, और तीन भाषाओं का आपस में बेमेल होना।

चलाएं:
  python3 scripts/proofread.py data/hamsafar/<id>.json
  python3 scripts/proofread.py --today          # आज की सारी नई फ़ाइलें
  python3 scripts/proofread.py data/days/2026-10-20.json
  python3 scripts/proofread.py --all            # पूरा भंडार (सिर्फ़ गिनती देखने)

नतीजा: त्रुटि मिले तो exit 1, वरना 0. हर त्रुटि के साथ जगह और सुधार का इशारा।
"""
import argparse
import glob
import json
import os
import re
import sys
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEV = r"\u0900-\u097F"
HINDI_DOT = re.compile(rf"[{DEV}][\"'”’)]?\s*\.")        # देवनागरी के बाद अंग्रेज़ी फुल स्टॉप
DOMAIN = re.compile(r"\b[a-z0-9][a-z0-9-]{1,}\.(?:com|in|org|net|co|io|gov|edu)\b", re.I)
DOUBLE_SPACE = re.compile(r"[^\S\n]{2,}")
SPACE_BEFORE_PUNCT = re.compile(r"\s+([,;:।])")
DANDA_DOUBLE = re.compile(r"।।|!!|\?\?")
REPEAT_WORD = re.compile(rf"\b([{DEV}]{{2,}})\s+\1\b")
BAD_DASH = re.compile(r"[—–]")
CHANDRABINDU = re.compile("ँ")
ZERO_WIDTH = re.compile("[\u200b-\u200f\u202a-\u202e\ufeff]")
TAB = re.compile(r"\t")
MD_IMG = re.compile(r"^\[\[img:\d+\]\]$")
SUBHEAD = re.compile(r"^#{2,3} ")
PARA_NUM = re.compile(r"^\d+\.$")


class Report:
    def __init__(self):
        self.items = []  # (level, file, where, msg)

    def add(self, level, f, where, msg):
        self.items.append((level, f, where, msg))

    def errors(self):
        return [i for i in self.items if i[0] == "error"]

    def warnings(self):
        return [i for i in self.items if i[0] == "warn"]

    def show(self):
        for level, f, where, msg in self.items:
            tag = "✗" if level == "error" else "!"
            print(f"  {tag} {os.path.basename(f)} · {where}: {msg}")
        e, w = len(self.errors()), len(self.warnings())
        print(f"\nत्रुटियां: {e} · चेतावनियां: {w}")
        return 1 if e else 0


def is_prose_para(p):
    return not (MD_IMG.match(p) or SUBHEAD.match(p) or PARA_NUM.match(p) or p.strip() == "*")


def check_hindi_text(rep, f, where, text, level="error"):
    if BAD_DASH.search(text):
        rep.add(level, f, where, "em/en डैश है — ' - ' या कॉमा कीजिए")
    if CHANDRABINDU.search(text):
        rep.add(level, f, where, "चंद्रबिंदु (ँ) है — अनुस्वार (ं) कीजिए")
    if ZERO_WIDTH.search(text):
        rep.add("error", f, where, "छिपा हुआ शून्य-चौड़ाई अक्षर है")
    if TAB.search(text):
        rep.add("error", f, where, "टैब है, स्पेस कीजिए")
    if DOUBLE_SPACE.search(text):
        rep.add("error", f, where, "दो या ज़्यादा स्पेस लगातार")
    for m in SPACE_BEFORE_PUNCT.finditer(text):
        rep.add("error", f, where, f"विराम से पहले स्पेस: «{text[max(0,m.start()-12):m.end()+2]}»")
    if DANDA_DOUBLE.search(text):
        rep.add("error", f, where, "दोहरा विराम (।। / !! / ??)")
    for m in HINDI_DOT.finditer(text):
        rep.add("error", f, where, f"हिंदी वाक्य के आख़िर में अंग्रेज़ी फुल स्टॉप: «{text[max(0,m.start()-14):m.end()+1]}»")
    for m in DOMAIN.finditer(text):
        rep.add("error", f, where, f"पाठ में कच्चा वेब-पता: «{m.group(0)}» (फ़ॉरवर्ड का कूड़ा?)")
    for m in REPEAT_WORD.finditer(text):
        rep.add("error", f, where, f"शब्द दो बार: «{m.group(0)}»")
    if text.count("‘") != text.count("’"):
        rep.add("error", f, where, f"‘ बनाम ’ बेमेल ({text.count('‘')}/{text.count('’')})")
    if text.count("“") != text.count("”"):
        rep.add("error", f, where, f"“ बनाम ” बेमेल ({text.count('“')}/{text.count('”')})")
    if text.count("(") != text.count(")"):
        rep.add("error", f, where, f"कोष्ठक बेमेल ({text.count('(')}/{text.count(')')})")


def check_para_end(rep, f, where, p):
    """हिंदी अनुच्छेद विराम पर ख़त्म हो — । ” ’ ) या ! ? """
    t = p.rstrip()
    if not t:
        rep.add("error", f, where, "ख़ाली अनुच्छेद")
        return
    if not re.search(r"[।!?…]($|[”’\"')\]]$)", t):
        rep.add("error", f, where, f"अनुच्छेद विराम पर ख़त्म नहीं होता: «…{t[-30:]}»")
    if len(t) > 900:
        rep.add("warn", f, where, f"बहुत लंबा अनुच्छेद ({len(t)} अक्षर) — तोड़िए")


def check_parity(rep, f, d):
    """तीन भाषाएं: अनुच्छेदों की गिनती, तस्वीरें, pull."""
    hi = d.get("body") or []
    hi_n = sum(1 for p in hi if is_prose_para(p))
    for lg in ("en", "ur"):
        if lg not in d:
            rep.add("error", f, lg, "अनुवाद का खंड नहीं है")
            continue
        body = d[lg].get("body") or []
        n = sum(1 for p in body if is_prose_para(p))
        if n != hi_n:
            rep.add("error", f, f"{lg}/body", f"अनुच्छेद {n}, हिंदी में {hi_n}")
        for k in ("h", "dek", "by", "bio", "tr"):
            if not (d[lg].get(k) or "").strip():
                rep.add("error", f, f"{lg}.{k}", "ख़ाली है")
        if len(d[lg].get("images") or []) != len(d.get("images") or []):
            rep.add("error", f, f"{lg}.images", "तस्वीरों की गिनती हिंदी से अलग")
        pull = (d[lg].get("pull") or "").strip()
        if pull and pull not in " ".join(body):
            rep.add("error", f, f"{lg}.pull", "यह वाक्य अनुवाद के पाठ में शब्दश: नहीं है")
    pull_hi = (d.get("pull") or "").strip()
    if pull_hi and pull_hi not in " ".join(hi):
        rep.add("error", f, "pull", "यह वाक्य पाठ में शब्दश: नहीं है")


def check_hamsafar(rep, f, d):
    for k in ("id", "date", "h", "by", "kind"):
        if not d.get(k):
            rep.add("error", f, k, "ज़रूरी खाना ख़ाली है")
    if d.get("photo") and not os.path.exists(os.path.join(ROOT, "public", d["photo"].lstrip("/"))):
        rep.add("error", f, "photo", f"फ़ाइल नहीं मिली: public{d['photo']}")
    for i, im in enumerate(d.get("images") or []):
        src = (im.get("src") or "").lstrip("/")
        if not src:
            rep.add("error", f, f"images[{i}]", "src ख़ाली")
            continue
        if not os.path.exists(os.path.join(ROOT, "public", src)):
            rep.add("error", f, f"images[{i}]", f"फ़ाइल नहीं मिली: public/{src}")
        for k in ("alt", "cap"):
            if not (im.get(k) or "").strip():
                rep.add("error", f, f"images[{i}].{k}", "ख़ाली है")
        if not (im.get("w") and im.get("h")):
            rep.add("warn", f, f"images[{i}]", "w/h नहीं — लेआउट हिल सकता है")
    if d.get("id") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}-[a-z0-9-]+", d["id"]):
        rep.add("error", f, "id", "id का ढांचा ग़लत (YYYY-MM-DD-slug)")
    if d.get("id") and d.get("date") and not d["id"].startswith(d["date"]):
        rep.add("warn", f, "id", "id की तारीख़ date से अलग")


def check_days(rep, f, d):
    items = d if isinstance(d, list) else []
    if not items:
        rep.add("error", f, "—", "ख़ाली अंक")
    for it in items:
        i = it.get("id", "?")
        for k in ("sec", "h", "dek", "by", "pub", "url", "body"):
            if not it.get(k):
                rep.add("error", f, i, f"खाना ख़ाली: {k}")
        if (it.get("url") or "").find("facebook.com") >= 0:
            rep.add("error", f, i, "url फ़ेसबुक का है — मूल साइट का होना चाहिए")
        if len(it.get("body") or []) < 3:
            rep.add("warn", f, i, "सार 3 अनुच्छेद से छोटा")


def scan(rep, path):
    try:
        d = json.load(open(path, encoding="utf-8"))
    except Exception as e:
        rep.add("error", path, "—", f"JSON टूटा: {e}")
        return
    is_hs = "/hamsafar/" in path or os.path.basename(path).count("-") >= 3 and "days" not in path
    body = d.get("body") if isinstance(d, dict) else None
    kind = (d.get("kind") if isinstance(d, dict) else "") or ""
    # कविता/कार्टून/तस्वीरों में पद्य-पंक्तियां होती हैं: वहां विराम और फुल स्टॉप के नियम नहीं
    verse = kind in ("kavita", "cartoon", "photo")
    if isinstance(d, dict) and body:
        for n, p in enumerate(body, 1):
            if is_prose_para(p):
                check_hindi_text(rep, path, f"body[{n}]", p, level="warn" if verse else "error")
                if not verse:
                    check_para_end(rep, path, f"body[{n}]", p)
        check_hindi_text(rep, path, "h", d.get("h") or "", level="warn")
        check_hindi_text(rep, path, "dek", d.get("dek") or "", level="warn")
        if "en" in d or "ur" in d:
            check_parity(rep, path, d)
        if is_hs:
            check_hamsafar(rep, path, d)
    elif isinstance(d, list):
        check_days(rep, path, d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--today", action="store_true", help="आज (IST) की फ़ाइलें")
    ap.add_argument("--all", action="store_true", help="पूरा भंडार")
    ap.add_argument("--changed", action="store_true", help="सिर्फ़ वे जो अभी बदले/जुड़े (git)")
    a = ap.parse_args()

    files = list(a.files)
    if a.changed:
        import subprocess
        out = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT,
                             capture_output=True, text=True).stdout
        for line in out.splitlines():
            p2 = line[3:].strip().strip('"')
            if p2.endswith(".json") and p2.startswith("data/"):
                files.append(os.path.join(ROOT, p2))
        if not files:
            print("कोई बदली हुई JSON फ़ाइल नहीं — जांचने को कुछ नहीं")
            return 0
    if a.today or a.all:
        if a.today:
            day = datetime.now(IST).strftime("%Y-%m-%d")
            files += [p for p in glob.glob(os.path.join(ROOT, "data", "**", "*.json"), recursive=True)
                      if p.endswith(f"{day}.json") or f"{day}-" in os.path.basename(p)]
        else:
            files += glob.glob(os.path.join(ROOT, "data", "hamsafar", "*.json"))
            files += glob.glob(os.path.join(ROOT, "data", "days", "*.json"))
    files = sorted(set(os.path.abspath(p) for p in files if p.endswith(".json")))
    if not files:
        print("कोई फ़ाइल नहीं मिली")
        return 2

    rep = Report()
    for p in files:
        before = len(rep.items)
        scan(rep, p)
        n = len(rep.items) - before
        if n and a.all:
            print(f"{os.path.basename(p)}: {n}")
    print(f"\nजांची फ़ाइलें: {len(files)}")
    return rep.show()


if __name__ == "__main__":
    sys.exit(main())
