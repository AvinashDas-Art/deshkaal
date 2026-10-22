"""देशकाल: पेंटिंग (और Unsplash के अलावा कोई भी तस्वीर) साइट पर ही रखना.

दूसरे संग्रहालयों की तस्वीरें ब्राउज़र में सीधे (क्रॉस-ओरिजिन) नहीं खिंचतीं, इसलिए GitHub पर ये स्क्रिप्ट
उन्हें उतारकर public/media/<id>.jpg में रख देती है; build.js और प्रिव्यू कार्ड यही फ़ाइल इस्तेमाल करते हैं.
चलाएं: python3 scripts/media.py           (सबसे नया दिन)
       python3 scripts/media.py --all     (सारे दिन)
"""
import json, os, sys, glob, io, re, time, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "media")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) deshkaal.xyz/1.0 (sampark@deshkaal.xyz)"}


def need(a):
    p = a.get("photo") or {}
    src = p.get("src", "")
    return bool(src) and p.get("kind") != "collage" and (p.get("kind") == "painting" or "images.unsplash.com" not in src)


def variants(src):
    """Wikimedia कभी-कभी ग़ैर-मानक चौड़ाई वाले thumb लौटाने से मना करता है: मानक चौड़ाइयां और मूल फ़ाइल भी आज़माएं."""
    yield src
    m = re.match(r"(https://upload\.wikimedia\.org/wikipedia/commons)/thumb/(\w/\w\w)/([^/]+)/\d+px-[^/?]+", src)
    if m:
        base, d, name = m.groups()
        for w in (1280, 960, 640):
            yield f"{base}/thumb/{d}/{name}/{w}px-{name}"
        yield f"{base}/{d}/{name}"


def fetch(src):
    err = None
    for u in variants(src):
        for t in range(2):
            try:
                with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40) as r:
                    return Image.open(io.BytesIO(r.read())).convert("RGB")
            except Exception as e:
                err = e; time.sleep(3 + 4 * t)
    raise err


def main():
    os.makedirs(OUT, exist_ok=True)
    files = sorted(glob.glob(os.path.join(ROOT, "data", "days", "*.json")))
    if "--all" not in sys.argv: files = files[-2:]
    n = miss = 0
    for f in files:
        for a in json.load(open(f, encoding="utf-8")):
            if not need(a): continue
            out = os.path.join(OUT, a["id"] + ".jpg")
            if os.path.exists(out): continue
            try:
                im = fetch(a["photo"]["src"])
                if im.width > 1400: im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
                im.save(out, "JPEG", quality=84, optimize=True, progressive=True); n += 1; time.sleep(1.5)
            except Exception as e:
                miss += 1; print("नहीं मिली:", a["id"], a["photo"]["src"][:90], e)
    print(f"साइट पर रखी गयीं: {n}" + (f", छूटीं: {miss}" if miss else ""))


if __name__ == "__main__":
    main()
