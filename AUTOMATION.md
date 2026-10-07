# रोज़ का ऑटोमेशन (Daily run playbook)

This file is the instruction set for the daily scheduled run that publishes Deshkaal. The run reads it at the start, every day.

## Schedule
Every day, finish by 07:00 IST. Sunday runs additionally write the weekly special (see below).

## Steps
1. `git pull` the repo. Read `EDITORIAL.md`, `SOURCES.md`, `TRANSLATION.md` and this file.
2. Scan the day's biggest world and India developments first (see "दुनिया पर नज़र" in `SOURCES.md`). Then collect candidates published in the last 72 hours from the sources in `SOURCES.md`, across all its groups, at most 2 pieces from one source (WebFetch the listed opinion/section pages; WebSearch to fill gaps). Skip anything already in `data/days/*.json` (match on `url`).
3. Select **15-16 news/opinion pieces + exactly 6 literature pieces** (the front page shows literature in rows of three; never 4 or 5), scored against `EDITORIAL.md`. Prefer India relevance, then South Asia, then Global South. Spread across categories: देश, दुनिया, समाज, अर्थ, पर्यावरण, स्त्री, संस्कृति, साहित्य. Never select paywalled pieces. **Every day include 2-3 PARI (ruralindiaonline.org) reports** among the news pieces (see `SOURCES.md` for how to find them). PARI reporting does not go stale: a PARI story of **any age**, even years old, may be taken; the 72-hour rule does not apply to PARI. Never take one already used (check `url` in all `data/days/*.json`). Prefer a new PARI story if there is one, otherwise pick an older one that speaks to today's news or season. Keep its original publication date in `date`. Place one in the top five.
4. For each piece, WebFetch the article and write an **original** Hindi summary (rules below).
5. Write `data/days/YYYY-MM-DD.json` (schema below). Order: strongest India-relevant piece first (becomes the lead), literature last.
5a. **Translate** the day into English and Urdu: write `data/i18n/en/YYYY-MM-DD.json` and `data/i18n/ur/YYYY-MM-DD.json` exactly as `TRANSLATION.md` says (plain, natural English; easy everyday Urdu). Run the two languages as two parallel subagents if you can. Every item of the day file must be translated; check counts and ids with python. If time is short before 07:00, push the Hindi day first (step 8) and the translations in a second commit right after; the English and Urdu pages show only translated pieces.
6. Run `python3 scripts/og.py` (makes the social-media preview image for each new piece in `public/og/`; needs Pillow, install with `pip install --break-system-packages pillow` if missing), then `node build.js`. Both must finish without errors. Cards for pieces with a `photo` will show the halftone here (Unsplash is not reachable from the run); the GitHub workflow `og-photos.yml` redraws them with the real photo within a couple of minutes of the push. Do not try to fix this in the run.
7. Check: every `url` opens and is free to read; spelling rules hold (`grep -nE "ँ|—|–|गए|गई|हुयी|जायेग|सम्पूर्ण|अंय"` over the new day file must return nothing).
8. Commit `data/days/YYYY-MM-DD.json`, `data/i18n/en/YYYY-MM-DD.json`, `data/i18n/ur/YYYY-MM-DD.json` and the new `public/og/*.png` files with message `देशकाल: YYYY-MM-DD` and push to `main`. Cloudflare Pages deploys automatically.
9. Report: number of pieces, sources used, sources that failed.

## Writing rules
- Plain, natural Hindustani (Hindi with natural Urdu words). No bookish Sanskritised Hindi. No melodrama, no sermonising.
- Summaries are our own writing. No quoted sentences from the original; never reproduce poems, lyrics or long passages. Do not mirror the original's structure paragraph by paragraph.
- Body: 4-5 short paragraphs, 220-320 words. Enough to understand the argument, not a replacement for reading the original.
- `nazar` (देशकाल की नज़र): 1-2 short paragraphs on what it means for India and for the people named in the editorial policy. Opinion is clearly ours.
- `sawal`: one question, under 12 words, that stays with the reader.
- `ref` (संदर्भ): 1-2 terms or events a general reader may not know, two lines each.
- Headline (`h`): our own, sharp, under 12 words. Dek: one sentence.
- Spelling: अनुस्वार, never चंद्रबिंदु (हां, यहां, पहुंच). Never em dash or en dash; use comma or hyphen. गये/गयी (not गए/गई). हुई (not हुयी). जाएगा/जाएगी. संपूर्ण. अन्य. Correct नुक़्ता (ज़िंदगी, फ़ैसला, ख़ामोशी).
- Facts only from the article itself or well-established background knowledge. If unsure, leave it out.

## Day file schema
```json
[
  {
    "id": "2026-10-05-01",
    "day": "2026-10-05",
    "cat": "देश",
    "motif": "list | arc | scales | tents | coins | rings | book | soil | mountain | marks | waves",
    "seed": 11,
    "h": "हेडलाइन",
    "dek": "एक वाक्य",
    "by": "मूल लेखक (हिंदी लिपि में)",
    "pub": "प्रकाशन",
    "date": "3 अक्टूबर 2026",
    "lang": "अंग्रेज़ी",
    "url": "https://...",
    "body": ["अनुच्छेद", "..."],
    "nazar": ["..."],
    "sawal": "सवाल?",
    "ref": [["शब्द", "दो लाइन की व्याख्या"]],
    "ank": [["700", "दिल्ली में हिरासत में लिये गये प्रदर्शनकारी"]]
  }
]
```
`ank` (optional, lead piece only): one or two striking figures from the article, each a number plus a label under 8 words. They print as red blocks in the front-page hero. Use only figures stated in the article. The lead headline should have a natural break after a colon or comma: the part before it prints in red, the rest in black.

`motif` picks the collage drawing; choose the one closest to the subject. `seed` is any number, different for each piece.

## Lead (front-page hero): pick one of three forms
Choose by what makes today's lead piece strongest, and vary across days:
- `"hero": "poster"` (default): split headline, diagonal collage, `ank` figures. Best with a photo.
- `"hero": "shabd"` + `"shabd": "एक शब्द"`: one word that carries the whole story (e.g. "नाकेबंदी", "कचरा") printed huge, the collage showing through its letters. Keep it to 3-5 letters' width; one word only.
- `"hero": "ank"` + `"chart"`: when the story is about numbers. `{"title": "...", "unit": "...", "bars": [["लेबल", संख्या], ...], "note": "एक लाइन"}`, 3-6 bars, the last bar is highlighted in red, all figures from the article only.

## Images: photos and paintings (`photo`) — the collage is the face of the site
The site is a collage of real photographs and paintings. Every day:
- **At least 12 of the news pieces** get an image, and the lead always does. Aim for a mix: roughly two thirds photographs, one third paintings.
- **Every literature piece** gets a painting.
- Never use the same image twice in a day, and do not reuse an image from the last 7 day files (check `src` in them).

Photographs (`"kind": "photo"`):
- Source: Unsplash, via WebFetch of `https://unsplash.com/napi/search/photos?query=...&per_page=15`. Only results on `images.unsplash.com` (never `plus.unsplash.com`, never premium).
- People, places, work, crowds, landscapes that fit the story. Never a photo with a party flag or slogan unrelated to the story; never one that could pass for the actual event unless it is. Add `"note": "प्रतीकात्मक तस्वीर"` when illustrative.
- `"photo": {"kind": "photo", "src": "https://images.unsplash.com/photo-...?fit=max&fm=jpg&q=75&w=1400", "credit": "Photographer / Unsplash", "page": "https://unsplash.com/photos/<id>", "note": "प्रतीकात्मक तस्वीर"}`

Paintings (`"kind": "painting"`), public domain only, from **Wikimedia Commons** (museum sites like the Art Institute block outside use, do not use them):
- WebFetch `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=<words>&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json`. Take only results whose `extmetadata.LicenseShortName` is "Public domain" and that are paintings (not photos of pages, maps or PDFs).
- Prefer Indian and South Asian art: Raja Ravi Varma, Amrita Sher-Gil, Abanindranath Tagore, Kalighat pat, Company school, Mughal, Rajput and Pahari miniatures; then any public-domain painting whose subject fits (labour, fields, rivers, cities, women, crowds, letters, books).
- `src` = the `thumburl` (1200 px wide) without anything after `?`; `page` = `descriptionurl`.
- `"photo": {"kind": "painting", "src": "<thumburl>", "credit": "<artist> / Wikimedia Commons", "page": "<descriptionurl>", "note": "<title, in Hindi, short>"}`
- GitHub copies every painting onto the site (`public/media/<id>.jpg`, by `scripts/media.py`), so the collage never depends on the museum's server.
- Paintings show in their own colours with a light category tint; photographs are toned in the category colour. Both sit inside the hand-cut collage.
- Never use photos from the source article or from any news agency.

## Sunday special (रविवार विशेष)
On Sundays, also pick the five most important pieces of the week from the last 7 day files and list their ids in `data/weekly/YYYY-MM-DD.json` as `{"ids": [...], "intro": "दो-तीन वाक्य"}`.

## Literature: always six
jankipul.com and samalochan.com often refuse the cloud fetcher (robots.txt time-outs). Try each once (homepage, then /feed). If blocked, use WebSearch for the site name plus this week to find new posts and their URLs, and WebFetch the post URL directly. If a source still cannot be read, take more pieces from sammukh.com and hindwi.org (homepage lists the newest बेला posts). Never summarise a piece you could not read. Literature pieces may be up to 3 weeks old.
