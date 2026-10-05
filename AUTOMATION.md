# रोज़ का ऑटोमेशन (Daily run playbook)

This file is the instruction set for the daily scheduled run that publishes Deshkaal. The run reads it at the start, every day.

## Schedule
Every day, finish by 07:00 IST. Sunday runs additionally write the weekly special (see below).

## Steps
1. `git pull` the repo. Read `EDITORIAL.md`, `SOURCES.md` and this file.
2. Collect candidates published in the last 72 hours from the sources in `SOURCES.md` (WebFetch the listed opinion/section pages; WebSearch to fill gaps). Skip anything already in `data/days/*.json` (match on `url`).
3. Select **15-16 news/opinion pieces + 3 literature pieces**, scored against `EDITORIAL.md`. Prefer India relevance, then South Asia, then Global South. Spread across categories: देश, दुनिया, समाज, अर्थ, पर्यावरण, स्त्री, संस्कृति, साहित्य. Never select paywalled pieces.
4. For each piece, WebFetch the article and write an **original** Hindi summary (rules below).
5. Write `data/days/YYYY-MM-DD.json` (schema below). Order: strongest India-relevant piece first (becomes the lead), literature last.
6. Run `node build.js`. It must finish without errors.
7. Check: every `url` opens and is free to read; spelling rules hold (`grep -nE "ँ|—|–|गए|गई|हुयी|जायेग|सम्पूर्ण|अंय"` over the new day file must return nothing).
8. Commit `data/days/YYYY-MM-DD.json` with message `देशकाल: YYYY-MM-DD` and push to `main`. Cloudflare Pages deploys automatically.
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

## Sunday special (रविवार विशेष)
On Sundays, also pick the five most important pieces of the week from the last 7 day files and list their ids in `data/weekly/YYYY-MM-DD.json` as `{"ids": [...], "intro": "दो-तीन वाक्य"}`.
