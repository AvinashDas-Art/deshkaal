#!/usr/bin/env python3
"""देशकाल की वर्तनी: शैली-पुस्तिका के नियम अपने आप लागू करता है।

    python3 scripts/vartani.py               # सिर्फ़ जांच, कुछ नहीं बदलता
    python3 scripts/vartani.py --fix         # सब ठीक करता है
    python3 scripts/vartani.py --fix FILE..  # सिर्फ़ ये फ़ाइलें
    python3 scripts/vartani.py --log out.csv # हर बदलाव की सूची

JSON फ़ाइलों में सिर्फ़ पाठ वाले मान बदलते हैं (url, src, id, img, photo, yt जैसे नहीं)।
नाम वाले मान (by, pub, artist, handle) में सिर्फ़ चंद्रबिंदु और डैश ठीक होते हैं, शब्द नहीं,
ताकि 'नई दुनिया' जैसे अख़बार या किसी का नाम न बदले।
"""
import json, re, sys, csv, os, glob

DEV = "\u0900-\u0963\u0966-\u097F"   # देवनागरी, पर । और ॥ के बिना
B = f"(?<![{DEV}])"          # शब्द की शुरुआत
E = f"(?![{DEV}])"           # शब्द का अंत

# (नियम का नाम, पैटर्न, बदलाव)
WORD_RULES = [
    ("गए/गई", B + "गईं" + E, "गयीं"), ("गए/गई", B + "गई" + E, "गयी"), ("गए/गई", B + "गए" + E, "गये"),
    ("नई/नए", B + "नईं" + E, "नयीं"), ("नई/नए", B + "नई" + E, "नयी"), ("नई/नए", B + "नए" + E, "नये"),
    ("के लिये", "(?<=के )लिये" + E, "लिए"), ("के लिये", B + "(इस|किस|जिस|उस)लिये" + E, r"\1लिए"),
    ("चाहिये", B + "चाहिये" + E, "चाहिए"), ("हुयी", B + "हुयी" + E, "हुई"), ("हुयी", B + "हुये" + E, "हुए"),
    ("जायेगा", B + "जायेगा" + E, "जाएगा"), ("जायेगा", B + "जायेगी" + E, "जाएगी"), ("जायेगा", B + "जायेंगे" + E, "जाएंगे"), ("जायेगा", B + "जायेंगी" + E, "जाएंगी"),
    ("सम्पूर्ण", "सम्पूर्ण", "संपूर्ण"), ("अंय", B + "अंय" + E, "अन्य"),
    ("शृंखला", "श्रृ", "शृ"), ("रोशनदान", "रौशनदान", "रोशनदान"),
]
# नुक़्ता: पक्के शब्द (शब्द की शुरुआत से; आगे प्रत्यय चल सकते हैं, जैसे ख़बरें, ज़रूरी)
# नुक़्ता: पक्के शब्द। हर शब्द के साथ उसके चलने वाले रूप (प्रत्यय), ताकि गुजरात, आवाजाही, वक्तव्य, खुदाई जैसे शब्द न छुए जाएं
C = "(?:ों|ें|ी|ीं|े)?"            # ख़बर, ख़बरें, ख़बरों
A = "(?:ा|े|ों|ाओं)"                # फ़ैसला, फ़ैसले, फ़ैसलों
V = "(?:ा|ी|े|ना|नी|ने|ता|ती|ते|ी|ीं)"  # गुज़रा, गुज़रना, गुज़रती
NUKTA = [
    ("खबर", "ख़बर", C), ("अखबार", "अख़बार", C), ("खिलाफ", "ख़िलाफ़", ""), ("फैसल", "फ़ैसल", A), ("जरूर", "ज़रूर", "(?:ी|त|तों|तें)?"),
    ("फिल्म", "फ़िल्म", C), ("जिंदगी", "ज़िंदगी", "(?:यां|यों)?"), ("सिर्फ", "सिर्फ़", ""), ("कानून", "क़ानून", "(?:ी|ों|न)?"),
    ("गलत", "ग़लत", "(?:ी|ियां|ियों)?"), ("खत्म", "ख़त्म", ""), ("खतर", "ख़तर", A), ("आजाद", "आज़ाद", "(?:ी)?"), ("जमीन", "ज़मीन", C),
    ("इंतजार", "इंतज़ार", ""), ("बाजार", "बाज़ार", C), ("जिक्र", "ज़िक्र", ""), ("कब्ज", "क़ब्ज़", A), ("हफ्त", "हफ़्त", A),
    ("दफ्तर", "दफ़्तर", C), ("ताकत", "ताक़त", C), ("हकीकत", "हक़ीक़त", C), ("कीमत", "क़ीमत", C), ("शख्स", "शख़्स", C),
    ("नजर", "नज़र", C), ("मजदूर", "मज़दूर", "(?:ों|ी|ीं)?"), ("जमानत", "ज़मानत", C), ("गिरफ्तार", "गिरफ़्तार", "(?:ी|ियां|ियों)?"),
    ("खुद", "ख़ुद", ""), ("गरीब", "ग़रीब", "(?:ों|ी)?"), ("तारीख", "तारीख़", C), ("कत्ल", "क़त्ल", ""), ("कागज", "काग़ज़", C),
    ("इजाजत", "इजाज़त", ""), ("मुफ्त", "मुफ़्त", ""), ("जुबान", "ज़ुबान", C), ("खामोश", "ख़ामोश", "(?:ी)?"), ("ख्याल", "ख़याल", C),
    ("खयाल", "ख़याल", C), ("जहर", "ज़हर", "(?:ीला|ीले|ीली)?"), ("जुल्म", "ज़ुल्म", C), ("मकसद", "मक़सद", C), ("वक्त", "वक़्त", ""),
    ("आवाज", "आवाज़", "(?:ें|ों)?"), ("इलाक", "इलाक़", A), ("तरीक", "तरीक़", A), ("दस्तावेज", "दस्तावेज़", C), ("फर्क", "फ़र्क़", ""),
    ("फर्ज", "फ़र्ज़", ""), ("जिम्मेदार", "ज़िम्मेदार", "(?:ी|ियां|ियों|ों)?"), ("जरिए", "ज़रिए", ""), ("जरिये", "ज़रिए", ""),
    ("ज्यादा", "ज़्यादा", ""), ("गुजर", "गुज़र", V), ("गुजार", "गुज़ार", "(?:िश|ा|ी|े|ना|ने|ती|ते)?"), ("गुस्स", "ग़ुस्स", A),
    ("सफर", "सफ़र", ""), ("फौज", "फ़ौज", "(?:ी|ों)?"), ("फायद", "फ़ायद", A), ("फर्जी", "फ़र्ज़ी", ""), ("खास", "ख़ास", "(?:कर|तौर)?"),
    ("खुश", "ख़ुश", "(?:ी|ियां|ियों)?"), ("खून", "ख़ून", "(?:ी)?"), ("मजबूत", "मज़बूत", "(?:ी)?"), ("मजहब", "मज़हब", "(?:ी|ों)?"),
    ("मुकदम", "मुक़दम", A), ("कदम", "क़दम", "(?:ों)?"), ("किस्स", "क़िस्स", A), ("कर्ज", "क़र्ज़", C), ("साफ", "साफ़", ""),
    ("माफी", "माफ़ी", ""), ("तरफ", "तरफ़", ""), ("खारिज", "ख़ारिज", ""), ("मजाक", "मज़ाक़", ""), ("नाराज", "नाराज़", "(?:गी)?"),
    ("अंदाज", "अंदाज़", A + "?"), ("बेहतर", "बेहतर", ""),
]
NUKTA_RULES = [("नुक़्ता", B + re.escape(k) + "(" + suf + ")" + E, lambda m, v=v: v + (m.group(1) or "")) for k, v, suf in NUKTA if k != v]

CHAR_RULES = [
    ("चंद्रबिंदु", "ँ", "ं"),
    ("डैश", r"(?<=\d)\s*[–—]\s*(?=\d)", "-"),
    ("डैश", r"\s*—\s*", ", "), ("डैश", r"\s+–\s+", ", "), ("डैश", "–", "-"),
]
SKIP_KEYS = {"url", "src", "img", "photo", "yt", "ia", "id", "page", "poster", "code", "handle", "net", "kind", "sec", "cat",
             "day", "date", "lang", "motif", "seed", "updated", "since", "key", "file", "image", "link", "href", "u"}
NAME_KEYS = {"by", "pub", "artist", "artist_en", "credit", "src_name", "who"}

def fix_text(s, names=False, log=None, where=""):
    rules = CHAR_RULES if names else CHAR_RULES + WORD_RULES + NUKTA_RULES
    out = s
    for name, pat, rep in rules:
        new, n = re.subn(pat, rep, out)
        if n and log is not None:
            for m in re.finditer(pat, out):
                a, b = max(0, m.start() - 25), m.end() + 25
                log.append((where, name, out[a:b].replace("\n", " "), m.group(0), m.expand(rep) if isinstance(rep, str) else rep(m)))
        out = new
    if out != s and ("\u2014" in s or "\u2013" in s):
        out = re.sub(r",\s*,", ",", out).replace(" ,", ",").replace(",.", ".").replace(",।", "।")
    return out

def walk(v, key="", log=None, where=""):
    if isinstance(v, str):
        if key in SKIP_KEYS or v.startswith(("http", "/", "#")):
            return v
        return fix_text(v, key in NAME_KEYS, log, f"{where}:{key}")
    if isinstance(v, list):
        return [walk(x, key, log, where) for x in v]
    if isinstance(v, dict):
        return {k: walk(x, k, log, where) for k, x in v.items()}
    return v

DEFAULT = ["data/days/*.json", "data/i18n/*/*.json", "data/hamsafar/*.json", "data/cartoons/*.json", "data/live/*.json",
           "data/picks/*.json", "data/weekly/*.json", "data/special.json", "data/og-photo/*.json",
           "EDITORIAL.md", "PRIVACY.md", "src/i18n.js", "src/hamsafar.js", "src/client.js", "build.js"]

def main():
    args = sys.argv[1:]
    fix = "--fix" in args
    logf = args[args.index("--log") + 1] if "--log" in args else None
    files = [a for a in args if not a.startswith("--") and a != logf] or [f for g in DEFAULT for f in sorted(glob.glob(g))]
    log, changed = [], []
    for f in files:
        raw = open(f, encoding="utf-8").read()
        if f.endswith(".json"):
            data = json.loads(raw)
            new = json.dumps(walk(data, log=log, where=f), ensure_ascii=False, indent=1)
            if new == json.dumps(data, ensure_ascii=False, indent=1):
                continue
            new += "\n"
        else:
            # कोड और md: सिर्फ़ उद्धरण के भीतर या md की पंक्तियों में हिंदी शब्द; URL नहीं छूते
            parts = re.split(r"(https?://\S+)", raw)
            new = "".join(p if p.startswith("http") else fix_text(p, False, log, f) for p in parts)
        if new != raw:
            changed.append(f)
            if fix:
                open(f, "w", encoding="utf-8").write(new)
    by = {}
    for r in log:
        by[r[1]] = by.get(r[1], 0) + 1
    print(f"{'ठीक कीं' if fix else 'मिलीं'}: {len(log)} जगहें, {len(changed)} फ़ाइलें · " + ", ".join(f"{k} {v}" for k, v in sorted(by.items(), key=lambda x: -x[1])))
    if logf:
        with open(logf, "w", newline="", encoding="utf-8-sig") as h:
            w = csv.writer(h); w.writerow(["फ़ाइल:फ़ील्ड", "नियम", "संदर्भ", "पहले", "अब"]); w.writerows(log)
    return 1 if (log and not fix) else 0

if __name__ == "__main__":
    sys.exit(main())
