# अनुवाद (English, اردو) — rules for translating a day file

Input: `data/days/YYYY-MM-DD.json` (Hindi). Output: `data/i18n/en/YYYY-MM-DD.json` and `data/i18n/ur/YYYY-MM-DD.json`.

Output is a JSON array with one object per input item, same order, same `id`. Translate ONLY these fields (omit a field if the input lacks it):
```json
{
  "id": "2026-10-06-01",
  "h": "headline",
  "dek": "one sentence",
  "by": "author name(s) in the target script",
  "pub": "publication name as readers of that language know it",
  "date": "6 October 2026",
  "lang": "language of the original article, e.g. English / انگریزی",
  "body": ["paragraph", "..."],
  "nazar": ["..."],
  "sawal": "question",
  "ref": [["term", "two-line explanation"]],
  "shabd": "one word (only if input has shabd)",
  "ank": [["700", "label"]],
  "chart": {"title": "...", "unit": "...", "bars": [["label", 12]], "note": "..."},
  "photo_note": "translation of photo.note (only if input has photo.note)"
}
```
Do not copy any other field. Keep every number, name and fact exactly as in the Hindi. Do not add facts, do not drop sentences.

## English
- Plain, warm, clear English that an ordinary reader in India or abroad reads at one go. Short sentences. No jargon, no stiff officialese, no flourish.
- Headlines sharp and natural, sentence case. Keep the meaning of the Hindi headline, not its word order.
- Indian terms that have no easy English: keep them and explain lightly the first time (e.g. "Adivasi (indigenous) communities").
- Literature: titles of Hindi/Urdu works in italics-free plain transliteration with meaning in brackets once.
- Date format: "6 October 2026". `lang`: "English", "Hindi", "Urdu", "Bengali" etc.

## اردو
- Everyday Hindustani Urdu, the language of Urdu newspapers in India: easy, flowing, nothing heavily Persianised or Arabicised. If a simpler common word exists, use it.
- Correct Urdu spelling in Nastaliq-ready Unicode (ی not ي, ک not ك, ہ/ھ correctly). Use Western digits (0-9) for numbers.
- Names of people and places in Urdu script as they are commonly written. Well-known publications in Urdu script where common (الجزیرہ, ڈان), otherwise keep the Latin name.
- Date format: "6 اکتوبر 2026". `lang`: انگریزی، ہندی، اردو، بنگالی etc.
- No em dash. Keep the same tone as the Hindi: no melodrama, no sermon.

Write valid JSON (UTF-8, not escaped). Check with `python3 -c "import json;json.load(open(PATH))"`.
