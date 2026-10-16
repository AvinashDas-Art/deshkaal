/* हमसफ़र: पाठकों की मौलिक रचनाएं (लेख, कविता, कहानी, रिपोर्ताज, कार्टून, तस्वीरें)
   डेटा: data/hamsafar/<id>.json  ·  तस्वीरें: public/media/hamsafar/
   निजता: रिपॉज़िटरी पब्लिक है, इसलिए किसी रचना की फ़ाइल में ईमेल, फ़ोन या पता हो तो बिल्ड रुक जाता है। */
const fs = require("fs"), path = require("path");
const MAIL = "sampark@deshkaal.xyz";
const KIND = { lekh: "लेख", reportaj: "रिपोर्ताज", kahani: "कहानी", kavita: "कविता", cartoon: "कार्टून", photo: "तस्वीरें", sansmaran: "संस्मरण", diary: "डायरी" };
const BANNED_KEYS = ["email", "mail", "phone", "mobile", "contact", "address", "pata", "whatsapp"];
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, PHONE_RE = /(?:\+?\d{1,3}[\s-]?)?(?<![\d-])[6-9]\d{4}[\s-]?\d{5}(?![\d-])/;

function load() {
  const dir = "data/hamsafar";
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => {
    const w = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const k of Object.keys(w)) if (BANNED_KEYS.includes(k.toLowerCase())) throw new Error(`hamsafar/${f}: "${k}" फ़ील्ड पब्लिक रिपॉज़िटरी में नहीं रखी जा सकती`);
    const txt = JSON.stringify(w).replace(new RegExp(MAIL.replace(".", "\\."), "g"), "");
    if (EMAIL_RE.test(txt)) throw new Error(`hamsafar/${f}: इसमें कोई ईमेल पता है, हटाइए`);
    const prose = [w.h, w.dek, w.by, w.place, w.bio, w.pull, w.note, ...(w.body || []), ...(w.images || []).map(i => (i.cap || "") + " " + (i.alt || ""))].join(" ");
    if (PHONE_RE.test(prose)) throw new Error(`hamsafar/${f}: इसमें फ़ोन नंबर जैसा कुछ है, हटाइए`);
    if (!w.id || !w.date || !w.h || !w.by || !KIND[w.kind]) throw new Error(`hamsafar/${f}: id, date, h, by और सही kind ज़रूरी हैं`);
    return w;
  });
  list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  list.forEach((w, i) => { w.no = i + 1; });
  return list.reverse();
}

module.exports = function (H) {
  const { layout, esc, dayLabel, SITE, LATEST } = H;
  const ALL = load().filter(w => w.date <= LATEST);
  /* तीन भाषाएं: हिंदी मूल, अंग्रेज़ी और उर्दू अनुवाद (w.en, w.ur) */
  const P = lg => lg === "hi" ? "" : "/" + lg;
  const url = (w, lg = "hi") => `${P(lg)}/hamsafar/${w.id}/`;
  const has = lg => w => lg === "hi" || !!w[lg];
  const loc = (w, lg) => lg === "hi" || !w[lg] ? w : { ...w, ...w[lg], images: (w.images || []).map((im, i) => ({ ...im, ...((w[lg].images || [])[i] || {}) })) };
  const TX = {
    hi: { sec: "हमसफ़र", kind: KIND, back: "← हमसफ़र", ed: "संपादक की बात", author: "रचनाकार", share: "आगे भेजिए", native: "शेयर करें", copy: "लिंक कॉपी",
      fine: by => `यह रचना ${by} ने देशकाल को भेजी है। इसके सारे अधिकार उन्हीं के हैं।`, invK: "आप भी हमसफ़र बनिए", invB: "अपनी रचना देशकाल को भेजिए →", more: "हमसफ़र में और",
      bandSub: "पाठकों की रचनाएं, कार्टून और तस्वीरें, जो देशकाल को भेजी गयीं", all: "सारी रचनाएं →", send: "अपनी रचना भेजिए", galK: "पाठकों की ओर से",
      galI: "ये रचनाएं देशकाल के पाठकों ने भेजी हैं: लेख, कविताएं, कहानियां, कार्टून और तस्वीरें। हर रचना पढ़कर, जांचकर, उनके नाम के साथ छापी गयी है।", first: "पहली रचना आपकी हो सकती है।",
      galT: "हमसफ़र: पाठकों की रचनाएं", galD: "देशकाल के पाठकों के भेजे लेख, कविताएं, कहानियां, कार्टून और तस्वीरें।", also: "यह रचना इन भाषाओं में भी:", orig: "", desc: (w, k) => `${w.by} की ${k}, हमसफ़र में` },
    en: { sec: "Hamsafar", kind: { lekh: "Essay", reportaj: "Report", kahani: "Story", kavita: "Poem", cartoon: "Cartoon", photo: "Photographs", sansmaran: "Memoir", diary: "Diary" }, back: "← Hamsafar", ed: "Editor's note", author: "The writer", share: "Share", native: "Share", copy: "Copy link",
      fine: by => `${by} sent this piece to Deshkaal. All rights remain with the writer.`, invK: "Walk with us", invB: "Send your own work to Deshkaal →", more: "More from Hamsafar",
      bandSub: "Readers' own writing, cartoons and photographs, sent to Deshkaal", all: "All pieces →", send: "Send your work", galK: "From our readers",
      galI: "Hamsafar means fellow traveller. These are pieces our readers have sent to Deshkaal: essays, poems, stories, cartoons and photographs, each one read, checked and published under the writer's name, and translated from the original with care.", first: "The first piece could be yours.",
      galT: "Hamsafar: readers' own work", galD: "Essays, memoirs, poems, stories, cartoons and photographs sent to Deshkaal by its readers.", also: "Read this piece in:", orig: "Original in Hindi", desc: (w, k) => `${k} by ${w.by}, in Hamsafar` },
    ur: { sec: "ہم سفر", kind: { lekh: "مضمون", reportaj: "رپورتاژ", kahani: "کہانی", kavita: "نظم", cartoon: "کارٹون", photo: "تصویریں", sansmaran: "یادداشت", diary: "ڈائری" }, back: "→ ہم سفر", ed: "مدیر کی بات", author: "قلم کار", share: "آگے بھیجیے", native: "شیئر کریں", copy: "لنک کاپی",
      fine: by => `یہ تحریر ${by} نے دیش کال کو بھیجی ہے۔ اس کے تمام حقوق انہی کے ہیں۔`, invK: "آپ بھی ہم سفر بنیے", invB: "اپنی تحریر دیش کال کو بھیجیے ←", more: "ہم سفر میں اور",
      bandSub: "قارئین کی تحریریں، کارٹون اور تصویریں، جو دیش کال کو بھیجی گئیں", all: "ساری تحریریں ←", send: "اپنی تحریر بھیجیے", galK: "قارئین کی طرف سے",
      galI: "یہ تحریریں دیش کال کے قارئین نے بھیجی ہیں: مضمون، نظمیں، کہانیاں، کارٹون اور تصویریں۔ ہر تحریر پڑھ کر، جانچ کر، لکھنے والے کے نام کے ساتھ چھاپی گئی ہے، اور اصل سے احتیاط کے ساتھ ترجمہ کی گئی ہے۔", first: "پہلی تحریر آپ کی ہو سکتی ہے۔",
      galT: "ہم سفر: قارئین کی تحریریں", galD: "دیش کال کے قارئین کی بھیجی ہوئی تحریریں، نظمیں، کہانیاں، کارٹون اور تصویریں۔", also: "یہ تحریر ان زبانوں میں بھی:", orig: "اصل ہندی میں", desc: (w, k) => `${w.by} کی ${k}، ہم سفر میں` }
  };
  const LN = { hi: "हिंदी", en: "English", ur: "اردو" };
  const deva = n => String(n);   /* अंक हमेशा 1, 2, 3 (मालिक का नियम) */
  const initial = s => [...s.trim()][0] || "द";
  /* लेखक की तस्वीर हो तो वही, वरना नाम का पहला अक्षर लाल गोले में */
  const av = (w, cls = "") => w.photo ? `<img class="hw-av${cls}" src="${esc(w.photo)}" alt="" loading="lazy">` : `<span class="hw-av${cls}" aria-hidden="true">${esc(initial(w.by))}</span>`;
  const mailto = (subject, body) => `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const SEND = mailto("रचना: [शीर्षक]", `नमस्ते,

रचना का प्रकार (लेख / कविता / कहानी / रिपोर्ताज / कार्टून / तस्वीरें):
शीर्षक:
नाम, जैसा छपना चाहिए:
अपनी एक तस्वीर (साथ में जोड़ें, JPG):
शहर या गांव:
अपने बारे में एक-दो पंक्ति:
क्या यह रचना पहले कहीं छपी है? (नहीं / हां, कहां और कब):

मैंने देशकाल की संपादकीय नीति पढ़ ली है। यह रचना मेरी अपनी है। तस्वीरों में पहचाने जा सकने वाले लोगों की सहमति ली गयी है।

रचना (यहां लिखें, या फ़ाइल जोड़ें):
`);
  const share = (u, title, lg = "hi") => { const X = TX[lg]; const U = encodeURIComponent(SITE + u), t = encodeURIComponent(title);
    return `<div class="share" data-url="${SITE}${u}" data-title="${esc(title)}"><span class="share-l">${X.share}</span>
    <button class="sh sh-native" type="button" hidden>${X.native}</button>
    <a class="sh" href="https://wa.me/?text=${t}%0A${U}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="sh" href="https://t.me/share/url?url=${U}&text=${t}" target="_blank" rel="noopener">Telegram</a>
    <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${U}" target="_blank" rel="noopener">X</a>
    <a class="sh" href="https://www.facebook.com/sharer/sharer.php?u=${U}" target="_blank" rel="noopener">Facebook</a>
    <button class="sh sh-copy" type="button">${X.copy}</button></div>`; };

  /* डाक टिकट: हर रचना का अपना */
  const stamp = (w, big, lg = "hi") => `<span class="hs-stamp${big ? " big" : ""}" aria-hidden="true"><span class="hs-st-in"><i></i><b>${TX[lg].kind[w.kind] || KIND[w.kind]}</b><small>${TX[lg].sec} ${deva(w.no)}</small></span></span>`;
  const thumb = w => w.images && w.images[0] ? `<img src="${esc(w.images[0].src)}" alt="" loading="lazy"${w.images[0].w ? ` width="${w.images[0].w}" height="${w.images[0].h}"` : ""}>` : "";

  const card = (w0, lg = "hi") => { const w = loc(w0, lg); return `<article class="hs-card k-${w.kind}${w.images && w.images[0] ? " has-img" : ""}"><a href="${url(w, lg)}">
    ${w.images && w.images[0] ? `<span class="hs-thumb">${thumb(w)}</span>` : `<span class="hs-quote">${esc(w.pull || w.dek || "")}</span>`}
    ${stamp(w, false, lg)}<span class="hs-ct"><h4>${esc(w.h)}</h4><span class="hs-by">${w.photo ? av(w, " sm") : ""}<b>${esc(w.by)}</b>${w.place ? `<small>${esc(w.place)}</small>` : ""}</span></span></a></article>`; };

  /* पहले पन्ने का बैंड: रचनाएं हों तो ताज़ा तीन, न हों तो न्योते का पोस्टकार्ड */
  function band(lg = "hi") {
    const X = TX[lg], recent = ALL.filter(has(lg)).slice(0, 3);
    if (!recent.length && lg !== "hi") return "";
    if (!recent.length) return `<section class="hs-band hs-empty"><div class="hs-pc">
      <div class="hs-pc-l"><p class="hs-k">हमसफ़र · न्योता</p><h3>यह पगडंडी आपके क़दमों से भी बनेगी</h3>
      <p>लेख, कविता, कहानी, रिपोर्ताज, कार्टून या तस्वीरें: इस वक़्त पर आपकी नज़र देशकाल पर छप सकती है, आपके नाम के साथ, पूरे सलीक़े से।</p>
      <a class="hs-btn" href="/bhejiye/">रचना भेजिए</a></div>
      <div class="hs-pc-r" aria-hidden="true"><span class="hs-pc-lines"><i>सेवा में,</i><i>संपादक, देशकाल</i><i>${MAIL}</i></span>${stamp({ kind: "lekh", no: 1 }, true).replace("लेख", "आपकी रचना").replace("हमसफ़र 1", "डाक मुफ़्त")}<span class="hs-postmark"><svg viewBox="0 0 100 100"><defs><path id="hspm" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="27"/><text><textPath href="#hspm">देशकाल · पाठकों की डाक · देशकाल ·</textPath></text></svg></span></div>
    </div></section>`;
    return `<section class="hs-band"><div class="sechead sec-hamsafar"><h3>${X.sec}</h3><p>${X.bandSub}</p></div>
      <div class="hs-grid n${recent.length}">${recent.map(w => card(w, lg)).join("")}</div>
      <p class="hs-more"><a href="${P(lg)}/hamsafar/">${X.all}</a><a class="hs-btn sm" href="/bhejiye/">${X.send}</a></p></section>`;
  }

  /* न्योते का पन्ना (तीन भाषाओं में) */
  const ICONS = [`<path d="M14 8h28l10 10v38H14z"/><path d="M42 8v10h10"/><path d="M22 28h22M22 36h22M22 44h14"/>`, `<path d="M46 10c-14 4-26 18-30 40l6-2c2-8 6-14 12-18"/><path d="M16 50l-4 6"/><path d="M28 30c6 0 12-2 18-8"/>`, `<rect x="10" y="12" width="44" height="32" rx="3"/><path d="M20 52l6-8h8"/><circle cx="25" cy="27" r="4"/><path d="M33 34c4-6 10-6 14 0"/>`, `<rect x="8" y="18" width="48" height="32" rx="4"/><path d="M22 18l4-6h12l4 6"/><circle cx="32" cy="34" r="9"/>`];
  const IV = {
 "hi": {
  "k1": "हमसफ़र · लेखकों-पत्रकारों के लिए न्योता",
  "h1": "यह पगडंडी आपके क़दमों से भी बनेगी",
  "lede": "आपने कुछ लिखा है, कोई कार्टून बनाया है, या किसी लम्हे को तस्वीर में थाम लिया है, जो इस वक़्त को समझने में मदद करता है? उसे देशकाल को भेजिए। अच्छी रचना हम पूरे सम्मान और सलीक़े से छापते हैं, आपके नाम के साथ।",
  "send": "रचना भेजिए",
  "niti0": "पहले संपादकीय नीति पढ़ें",
  "stampB": "आपकी रचना",
  "stampS": "डाक मुफ़्त",
  "postmark": "देशकाल · पाठकों की डाक · देशकाल ·",
  "to1": "सेवा में,",
  "to2": "संपादक, देशकाल",
  "from": "भेजने वाला: आप",
  "whatH": "क्या भेज सकते हैं",
  "preK": "भेजने से पहले, एक गुज़ारिश",
  "preH": "देशकाल की संपादकीय नीति एक बार ज़रूर पढ़ लीजिए",
  "preP": "इससे अंदाज़ा हो जाएगा कि हम किन आवाज़ों को आगे रखते हैं, और किन चीज़ों से दूर रहते हैं। आपका और हमारा, दोनों का वक़्त बचेगा।",
  "preBtn": "संपादकीय नीति पढ़ें →",
  "howH": "कैसे भेजें",
  "rAddr": "पता",
  "rSub": "विषय",
  "rSubV": "रचना: आपकी रचना का शीर्षक",
  "rWith": "साथ में",
  "with": [
   "रचना, ईमेल में ही, या .docx, .txt, .pdf फ़ाइल में",
   "आपका नाम, जैसा छपना चाहिए",
   "शहर या गांव",
   "अपने बारे में एक-दो पंक्ति, और अपनी एक साफ़ तस्वीर, जो रचना के साथ छपेगी",
   "कार्टून और तस्वीरें JPG या PNG में, पूरे आकार में"
  ],
  "tip": "नीचे का बटन दबाते ही एक तैयार ईमेल खुलेगा, जिसमें बस ख़ाली जगहें भरनी हैं।",
  "openMail": "ईमेल खोलिए, रचना भेजिए",
  "thenH": "फिर क्या होता है",
  "week": "हर रचना का जवाब, आम तौर पर सात दिन के भीतर। छापने से पहले भाषा और लंबाई में हल्का संपादन हो सकता है, आपकी बात और आवाज़ बदले बिना।",
  "humK": "एक विनम्र बात",
  "hum1": "देशकाल मूल रूप से एक पीपुल्स मीडिया एग्रीगेटर है। हमारा रोज़ का काम है दुनिया भर की ज़रूरी टिप्पणियां चुनना, और उनका सार अपनी ज़बान में आप तक लाना। मौलिक रचनाओं का यह पन्ना, हमसफ़र, उसी काम में जोड़ी गयी एक अतिरिक्त सुविधा है, उन आवाज़ों के लिए जिन्हें अक्सर अपनी जगह नहीं मिलती।",
  "hum2": "इसीलिए एक बात पहले कह देना हमें ज़रूरी लगता है। अभी हम किसी रचना के लिए पारिश्रमिक नहीं दे पाते। जो दे सकते हैं, वह है आपकी रचना के लिए पूरा सम्मान, सधा हुआ संपादन, एक ख़ूबसूरत पन्ना, आपका नाम, और पाठकों तक उसकी पहुंच। उम्मीद है, आप हमारी इस सीमा को समझेंगे।",
  "sign": "आपका,<br><b>देशकाल</b>",
  "rightsH": "हक़ और निजता",
  "rg": [
   [
    "रचना आपकी",
    "कॉपीराइट आपके पास ही रहेगा। आप उसे कहीं और भी छपवा सकते हैं।"
   ],
   [
    "छापने की इजाज़त",
    "भेजकर आप देशकाल को उसे वेबसाइट, ई-पेपर, न्यूज़लेटर और सोशल मीडिया पर छापने, और अंग्रेज़ी-उर्दू में अनुवाद करने की इजाज़त देते हैं।"
   ],
   [
    "आपका पता, आपका",
    "ईमेल, फ़ोन या पता कभी नहीं छपता। सिर्फ़ नाम, शहर, आपका परिचय और आपकी तस्वीर।"
   ],
   [
    "हटवाना हो तो",
    "छपी रचना हटवानी हो, तो एक ईमेल काफ़ी है।"
   ]
  ],
  "recentH": "हमसफ़र में हाल में",
  "all": "सारी रचनाएं →",
  "wait": "आपकी रचना का इंतज़ार है।",
  "kinds": [
   [
    "लेख और रिपोर्ताज",
    "ज़मीन से रिपोर्ट, विश्लेषण, संस्मरण। 600 से 1,500 शब्द।"
   ],
   [
    "कविता और कहानी",
    "जो इस वक़्त की धड़कन पकड़े। कविता एक से तीन, कहानी 3,000 शब्द तक।"
   ],
   [
    "कार्टून",
    "एक पैनल या स्ट्रिप। JPG या PNG, कम से कम 1600 पिक्सल चौड़ा।"
   ],
   [
    "तस्वीरें",
    "एक तस्वीर या फ़ोटो-निबंध, दस तक। हर तस्वीर के साथ एक-दो पंक्ति।"
   ]
  ],
  "checks": [
   "रचना आपकी अपनी हो। पहले कहीं छपी हो, तो बता दीजिए कहां और कब।",
   "तथ्य और आंकड़े हों, तो उनके स्रोत भी साथ भेजिए।",
   "तस्वीर में पहचाने जा सकने वाले लोगों की सहमति ली गयी हो, ख़ासकर बच्चों की, और मुश्किल हालात में घिरे लोगों की।",
   "हिंदी, उर्दू या अंग्रेज़ी, किसी भी ज़बान में भेजिए।",
   "एक ईमेल में एक रचना।"
  ],
  "steps": [
   [
    "पढ़ते हैं",
    "हर रचना पूरे ध्यान से पढ़ी जाती है, किसी भी नाम या पहचान से पहले।"
   ],
   [
    "जांचते हैं",
    "मौलिकता, तथ्य और स्रोत। कहीं और छपी चीज़ हम अपनी कहकर नहीं छापते।"
   ],
   [
    "छापते हैं",
    "अपने ख़ास पन्ने पर, आपके नाम और परिचय के साथ। फिर ई-पेपर, न्यूज़लेटर और सोशल मीडिया तक। लिंक आपको भेजते हैं।"
   ],
   [
    "या लौटाते हैं",
    "विनम्रता से, एक चिट्ठी के साथ। अगली रचना का इंतज़ार फिर भी रहेगा।"
   ]
  ],
  "title": "रचना भेजिए",
  "desc": "अपना लेख, कविता, कहानी, रिपोर्ताज, कार्टून या तस्वीरें देशकाल को भेजिए। अच्छी रचनाएं हमसफ़र में, आपके नाम के साथ, पूरे सलीक़े से छपती हैं।",
  "mailSub": "रचना: [शीर्षक]",
  "mail": "नमस्ते,\n\nरचना का प्रकार (लेख / कविता / कहानी / रिपोर्ताज / कार्टून / तस्वीरें):\nशीर्षक:\nनाम, जैसा छपना चाहिए:\nअपनी एक तस्वीर (साथ में जोड़ें, JPG):\nशहर या गांव:\nअपने बारे में एक-दो पंक्ति:\nक्या यह रचना पहले कहीं छपी है? (नहीं / हां, कहां और कब):\n\nमैंने देशकाल की संपादकीय नीति पढ़ ली है। यह रचना मेरी अपनी है। तस्वीरों में पहचाने जा सकने वाले लोगों की सहमति ली गयी है।\n\nरचना (यहां लिखें, या फ़ाइल जोड़ें):\n"
 },
 "en": {
  "k1": "Hamsafar · an invitation to readers",
  "h1": "This footpath will be made by your steps too",
  "lede": "Have you written something, drawn a cartoon, or caught in a photograph a moment that helps make sense of these times? Send it to Deshkaal. We publish good work with full respect and care, under your name.",
  "send": "Send your work",
  "niti0": "Read the editorial policy first",
  "stampB": "Your work",
  "stampS": "Postage free",
  "postmark": "Deshkaal · readers' post · Deshkaal ·",
  "to1": "To,",
  "to2": "The Editor, Deshkaal",
  "from": "From: you",
  "whatH": "What you can send",
  "preK": "Before you send, a request",
  "preH": "Please read Deshkaal's editorial policy once",
  "preP": "It will show which voices we put first, and what we stay away from. It will save both your time and ours.",
  "preBtn": "Read the editorial policy →",
  "howH": "How to send",
  "rAddr": "To",
  "rSub": "Subject",
  "rSubV": "Work: the title of your piece",
  "rWith": "Include",
  "with": [
   "The piece itself, in the email, or as a .docx, .txt or .pdf file",
   "Your name, as it should appear",
   "Your town or village",
   "One or two lines about yourself, and one clear photograph of you, to be printed with the piece",
   "Cartoons and photographs in JPG or PNG, at full size"
  ],
  "tip": "The button below opens a ready-made email in which you only need to fill the blanks.",
  "openMail": "Open the email, send your work",
  "thenH": "What happens next",
  "week": "Every piece gets a reply, usually within seven days. Before publishing there may be light editing of language and length, without changing your point or your voice.",
  "humK": "A humble word",
  "hum1": "Deshkaal is at heart a people's media aggregator. Our daily work is to choose the important commentary from around the world and bring its summary to you in our own language. This page of original work, Hamsafar, is an extra feature added to that work, for the voices that often do not find their place.",
  "hum2": "That is why we think it right to say one thing at the outset. For now we are not able to pay for any piece. What we can give is full respect for your work, careful editing, a handsome page, your name, and its reach to readers. We hope you will understand this limit of ours.",
  "sign": "Yours,<br><b>Deshkaal</b>",
  "rightsH": "Rights and privacy",
  "rg": [
   [
    "Your work",
    "The copyright stays with you. You may have it published elsewhere too."
   ],
   [
    "Permission to publish",
    "By sending it you permit Deshkaal to publish it on the website, e-paper, newsletter and social media, and to translate it into English and Urdu."
   ],
   [
    "Your address stays yours",
    "Your email, phone or address is never published. Only your name, town, your introduction and your photograph."
   ],
   [
    "If you want it removed",
    "If you want a published piece taken down, one email is enough."
   ]
  ],
  "recentH": "Recently in Hamsafar",
  "all": "All pieces →",
  "wait": "We are waiting for your work.",
  "kinds": [
   [
    "Essays and reportage",
    "Reports from the ground, analysis, memoir. 600 to 1,500 words."
   ],
   [
    "Poems and stories",
    "That catch the pulse of these times. One to three poems, stories up to 3,000 words."
   ],
   [
    "Cartoons",
    "A single panel or a strip. JPG or PNG, at least 1600 pixels wide."
   ],
   [
    "Photographs",
    "One photograph or a photo-essay, up to ten. A line or two with each photograph."
   ]
  ],
  "checks": [
   "The work should be your own. If it has been published before, tell us where and when.",
   "If there are facts and figures, send their sources too.",
   "Consent should have been taken from identifiable people in photographs, especially children and people in difficult situations.",
   "Send it in any language: Hindi, Urdu or English.",
   "One piece in one email."
  ],
  "steps": [
   [
    "We read",
    "Every piece is read with full attention, before any name or identity is seen."
   ],
   [
    "We check",
    "Originality, facts and sources. We do not publish as ours something published elsewhere."
   ],
   [
    "We publish",
    "On our special page, with your name and introduction. Then on the e-paper, newsletter and social media. We send you the links."
   ],
   [
    "Or we return",
    "Politely, with a letter. We will still await your next piece."
   ]
  ],
  "title": "Send your work",
  "desc": "Send Deshkaal your essay, poem, story, reportage, cartoon or photographs. Good work is published in Hamsafar, under your name, with full care.",
  "mailSub": "Work: [title]",
  "mail": "Hello,\n\nType of work (essay / poem / story / reportage / cartoon / photographs):\nTitle:\nName, as it should appear:\nA photograph of yourself (attach, JPG):\nTown or village:\nOne or two lines about yourself:\nHas this work been published before? (No / Yes, where and when):\n\nI have read Deshkaal's editorial policy. This work is my own. Consent has been taken from identifiable people in the photographs.\n\nThe work (write here, or attach a file):\n"
 },
 "ur": {
  "k1": "ہم سفر · قارئین کے لیے دعوت",
  "h1": "یہ پگڈنڈی آپ کے قدموں سے بھی بنے گی",
  "lede": "آپ نے کچھ لکھا ہے، کوئی کارٹون بنایا ہے، یا کسی لمحے کو تصویر میں تھام لیا ہے، جو اس وقت کو سمجھنے میں مدد کرتا ہے؟ اسے دیشکال کو بھیجیے۔ اچھی تخلیق ہم پورے احترام اور سلیقے سے چھاپتے ہیں، آپ کے نام کے ساتھ۔",
  "send": "تحریر بھیجیے",
  "niti0": "پہلے ادارتی پالیسی پڑھیں",
  "stampB": "آپ کی تحریر",
  "stampS": "ڈاک مفت",
  "postmark": "دیشکال · قارئین کی ڈاک · دیشکال ·",
  "to1": "خدمت میں،",
  "to2": "مدیر، دیشکال",
  "from": "بھیجنے والا: آپ",
  "whatH": "کیا بھیج سکتے ہیں",
  "preK": "بھیجنے سے پہلے، ایک گزارش",
  "preH": "دیشکال کی ادارتی پالیسی ایک بار ضرور پڑھ لیجیے",
  "preP": "اس سے اندازہ ہو جائے گا کہ ہم کن آوازوں کو آگے رکھتے ہیں، اور کن چیزوں سے دور رہتے ہیں۔ آپ کا اور ہمارا، دونوں کا وقت بچے گا۔",
  "preBtn": "ادارتی پالیسی پڑھیں ←",
  "howH": "کیسے بھیجیں",
  "rAddr": "پتا",
  "rSub": "موضوع",
  "rSubV": "تحریر: آپ کی تحریر کا عنوان",
  "rWith": "ساتھ میں",
  "with": [
   "تحریر، ای میل میں ہی، یا .docx، .txt، .pdf فائل میں",
   "آپ کا نام، جیسا چھپنا چاہیے",
   "شہر یا گاؤں",
   "اپنے بارے میں ایک دو سطریں، اور اپنی ایک صاف تصویر، جو تحریر کے ساتھ چھپے گی",
   "کارٹون اور تصویریں JPG یا PNG میں، پورے سائز میں"
  ],
  "tip": "نیچے کا بٹن دباتے ہی ایک تیار ای میل کھلے گا، جس میں بس خالی جگہیں بھرنی ہیں۔",
  "openMail": "ای میل کھولیے، تحریر بھیجیے",
  "thenH": "پھر کیا ہوتا ہے",
  "week": "ہر تحریر کا جواب، عام طور پر سات دن کے اندر۔ چھاپنے سے پہلے زبان اور طوالت میں ہلکی تدوین ہو سکتی ہے، آپ کی بات اور آواز بدلے بغیر۔",
  "humK": "ایک عاجزانہ بات",
  "hum1": "دیشکال بنیادی طور پر ایک پیپلز میڈیا ایگریگیٹر ہے۔ ہمارا روز کا کام ہے دنیا بھر کے اہم تبصرے چننا، اور ان کا خلاصہ اپنی زبان میں آپ تک لانا۔ اصل تخلیقات کا یہ صفحہ، ہم سفر، اسی کام میں جوڑی گئی ایک اضافی سہولت ہے، ان آوازوں کے لیے جنھیں اکثر اپنی جگہ نہیں ملتی۔",
  "hum2": "اسی لیے ایک بات پہلے کہہ دینا ہمیں ضروری لگتا ہے۔ ابھی ہم کسی تحریر کے لیے معاوضہ نہیں دے پاتے۔ جو دے سکتے ہیں، وہ ہے آپ کی تحریر کے لیے پورا احترام، سلیقے کی تدوین، ایک خوبصورت صفحہ، آپ کا نام، اور قارئین تک اس کی رسائی۔ امید ہے، آپ ہماری اس حد کو سمجھیں گے۔",
  "sign": "آپ کا،<br><b>دیشکال</b>",
  "rightsH": "حق اور رازداری",
  "rg": [
   [
    "تحریر آپ کی",
    "کاپی رائٹ آپ کے پاس ہی رہے گا۔ آپ اسے کہیں اور بھی چھپوا سکتے ہیں۔"
   ],
   [
    "چھاپنے کی اجازت",
    "بھیج کر آپ دیشکال کو اسے ویب سائٹ، ای پیپر، نیوزلیٹر اور سوشل میڈیا پر چھاپنے، اور انگریزی اور اردو میں ترجمہ کرنے کی اجازت دیتے ہیں۔"
   ],
   [
    "آپ کا پتا، آپ کا",
    "ای میل، فون یا پتا کبھی نہیں چھپتا۔ صرف نام، شہر، آپ کا تعارف اور آپ کی تصویر۔"
   ],
   [
    "ہٹوانا ہو تو",
    "چھپی تحریر ہٹوانی ہو، تو ایک ای میل کافی ہے۔"
   ]
  ],
  "recentH": "ہم سفر میں حال میں",
  "all": "ساری تحریریں ←",
  "wait": "آپ کی تحریر کا انتظار ہے۔",
  "kinds": [
   [
    "مضمون اور رپورتاژ",
    "زمین سے رپورٹ، تجزیہ، یادیں۔ 600 سے 1,500 لفظ۔"
   ],
   [
    "نظم اور کہانی",
    "جو اس وقت کی دھڑکن پکڑے۔ نظم ایک سے تین، کہانی 3,000 لفظ تک۔"
   ],
   [
    "کارٹون",
    "ایک پینل یا اسٹرپ۔ JPG یا PNG، کم سے کم 1600 پکسل چوڑا۔"
   ],
   [
    "تصویریں",
    "ایک تصویر یا فوٹو مضمون، دس تک۔ ہر تصویر کے ساتھ ایک دو سطریں۔"
   ]
  ],
  "checks": [
   "تحریر آپ کی اپنی ہو۔ پہلے کہیں چھپی ہو، تو بتا دیجیے کہاں اور کب۔",
   "حقائق اور اعداد و شمار ہوں، تو ان کے ماخذ بھی ساتھ بھیجیے۔",
   "تصویر میں پہچانے جا سکنے والے لوگوں کی رضامندی لی گئی ہو، خاص کر بچوں کی، اور مشکل حالات میں گھرے لوگوں کی۔",
   "ہندی، اردو یا انگریزی، کسی بھی زبان میں بھیجیے۔",
   "ایک ای میل میں ایک تحریر۔"
  ],
  "steps": [
   [
    "پڑھتے ہیں",
    "ہر تحریر پوری توجہ سے پڑھی جاتی ہے، کسی بھی نام یا پہچان سے پہلے۔"
   ],
   [
    "جانچتے ہیں",
    "اصلیت، حقائق اور ماخذ۔ کہیں اور چھپی چیز ہم اپنی کہہ کر نہیں چھاپتے۔"
   ],
   [
    "چھاپتے ہیں",
    "اپنے خاص صفحے پر، آپ کے نام اور تعارف کے ساتھ۔ پھر ای پیپر، نیوزلیٹر اور سوشل میڈیا تک۔ لنک آپ کو بھیجتے ہیں۔"
   ],
   [
    "یا لوٹاتے ہیں",
    "شائستگی سے، ایک خط کے ساتھ۔ اگلی تحریر کا انتظار پھر بھی رہے گا۔"
   ]
  ],
  "title": "تحریر بھیجیے",
  "desc": "اپنا مضمون، نظم، کہانی، رپورتاژ، کارٹون یا تصویریں دیشکال کو بھیجیے۔ اچھی تحریریں ہم سفر میں، آپ کے نام کے ساتھ، پورے سلیقے سے چھپتی ہیں۔",
  "mailSub": "تحریر: [عنوان]",
  "mail": "سلام،\n\nتحریر کی قسم (مضمون / نظم / کہانی / رپورتاژ / کارٹون / تصویریں):\nعنوان:\nنام، جیسا چھپنا چاہیے:\nاپنی ایک تصویر (ساتھ میں جوڑیں، JPG):\nشہر یا گاؤں:\nاپنے بارے میں ایک دو سطریں:\nکیا یہ تحریر پہلے کہیں چھپی ہے؟ (نہیں / ہاں، کہاں اور کب):\n\nمیں نے دیشکال کی ادارتی پالیسی پڑھ لی ہے۔ یہ تحریر میری اپنی ہے۔ تصویروں میں پہچانے جا سکنے والے لوگوں کی رضامندی لی گئی ہے۔\n\nتحریر (یہاں لکھیں، یا فائل جوڑیں):\n"
 }
};
  function invitePage(lg = "hi") {
    const I = IV[lg];
    const kinds = I.kinds.map((k, i) => [k[0], k[1], ICONS[i]]), checks = I.checks, steps = I.steps;
    const SEND_L = lg === "hi" ? SEND : mailto(I.mailSub, I.mail);
    const recent = ALL.slice(0, 3);
    const body = `<div class="hsi">
  <section class="hsi-hero">
    <div class="hsi-ht">
      <p class="hs-k">${I.k1}</p>
      <h1>${I.h1}</h1>
      <p class="hsi-lede">${I.lede}</p>
      <div class="hsi-acts"><a class="hs-btn" href="${SEND_L}">${I.send}</a><a class="hs-btn ghost" href="${P(lg)}/niti/">${I.niti0}</a></div>
    </div>
    <div class="hsi-env" aria-hidden="true">
      <div class="env"><span class="env-flap"></span>
        <span class="hs-stamp big"><span class="hs-st-in"><i></i><b>${I.stampB}</b><small>${I.stampS}</small></span></span>
        <span class="hs-postmark"><svg viewBox="0 0 100 100"><defs><path id="hspm2" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="27"/><text><textPath href="#hspm2">${I.postmark}</textPath></text></svg></span>
        <span class="env-to"><i>${I.to1}</i><i>${I.to2}</i><i class="m">${MAIL}</i></span>
        <span class="env-from">${I.from}</span>
      </div>
    </div>
  </section>

  <section class="hsi-kinds"><h2 class="hsi-h">${I.whatH}</h2>
    <div class="hsi-kg">${kinds.map(([t, d, ic], i) => `<div class="hsi-kind"><span class="hsi-kn">${deva(i + 1)}</span><svg viewBox="0 0 64 64" aria-hidden="true">${ic}</svg><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
  </section>

  <section class="hsi-niti">
    <div class="hsi-niti-card">
      <p class="hs-k">${I.preK}</p>
      <h2>${I.preH}</h2>
      <p>${I.preP}</p>
      <a class="hs-btn" href="${P(lg)}/niti/">${I.preBtn}</a>
    </div>
    <ul class="hsi-checks">${checks.map(c => `<li>${c}</li>`).join("")}</ul>
  </section>

  <section class="hsi-how"><h2 class="hsi-h">${I.howH}</h2>
    <div class="hsi-letter">
      <div class="hl-row"><span>${I.rAddr}</span><b class="hl-mail">${MAIL}</b></div>
      <div class="hl-row"><span>${I.rSub}</span><b>${I.rSubV}</b></div>
      <div class="hl-row top"><span>${I.rWith}</span><ol>
        ${I.with.map(x => `<li>${x}</li>`).join("")}
      </ol></div>
      <p class="hl-tip">${I.tip}</p>
      <a class="hs-btn big" href="${SEND_L}">${I.openMail}</a>
    </div>
  </section>

  <section class="hsi-steps"><h2 class="hsi-h">${I.thenH}</h2>
    <ol class="hsi-tl">${steps.map(([t, d], i) => `<li><span class="hsi-dot">${deva(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol>
    <p class="hsi-week">${I.week}</p>
  </section>

  <section class="hsi-note">
    <div class="hsi-chitthi">
      <p class="hs-k">${I.humK}</p>
      <p>${I.hum1}</p>
      <p>${I.hum2}</p>
      <p class="hsi-sign">${I.sign}</p>
    </div>
  </section>

  <section class="hsi-rights"><h2 class="hsi-h">${I.rightsH}</h2>
    <div class="hsi-rg">
      <div><h3>${I.rg[0][0]}</h3><p>${I.rg[0][1]}</p></div>
      <div><h3>${I.rg[1][0]}</h3><p>${I.rg[1][1]}</p></div>
      <div><h3>${I.rg[2][0]}</h3><p>${I.rg[2][1]}</p></div>
      <div><h3>${I.rg[3][0]}</h3><p>${I.rg[3][1]}</p></div>
    </div>
  </section>

  ${recent.length ? `<section class="hsi-recent"><h2 class="hsi-h">${I.recentH}</h2><div class="hs-grid n${recent.length}">${recent.map(w => card(w, lg)).join("")}</div><p class="hs-more"><a href="${P(lg)}/hamsafar/">${I.all}</a></p></section>` : ""}

  <section class="hsi-end"><p>${I.wait}</p><a class="hs-btn big" href="${SEND_L}">${I.send}</a><p class="hsi-mail">${MAIL}</p></section>
</div>`;
    return layout({ title: I.title, desc: I.desc, url: P(lg) + "/bhejiye/", body, image: "/og-bhejiye.png" });
  }

  /* सारी रचनाएं */
  function galleryPage(lg = "hi") {
    const X = TX[lg], list = ALL.filter(has(lg));
    const body = `<section class="hs-gal"><p class="hs-k">${X.galK}</p><h1>${X.sec}</h1>
      <p class="hs-gal-i">${X.galI}</p>
      ${list.length ? `<div class="hs-grid all">${list.map(w => card(w, lg)).join("")}</div>` : `<p class="hs-first">${X.first}</p>`}
      <p class="hs-more"><a class="hs-btn" href="/bhejiye/">${X.send}</a></p></section>`;
    return layout({ tab: "hamsafar", title: X.galT, desc: X.galD, url: `${P(lg)}/hamsafar/`, body, alt: { hi: "/hamsafar/", en: "/en/hamsafar/", ur: "/ur/hamsafar/" } });
  }

  /* एक रचना का पन्ना */
  function workPage(w0, lg = "hi") {
    const w = loc(w0, lg), X = TX[lg], langs = ["hi", "en", "ur"].filter(l => l === "hi" || w0[l]);
    const imgs = w.images || [], body = w.body || [];
    const fig = (im, cls = "") => `<figure class="hw-fig ${cls}"><img src="${esc(im.src)}" alt="${esc(im.alt || im.cap || w.h)}"${im.w ? ` width="${im.w}" height="${im.h}"` : ""} loading="lazy">${im.cap ? `<figcaption>${esc(im.cap)}</figcaption>` : ""}</figure>`;
    let main = "";
    if (w.kind === "cartoon") {
      main = `<figure class="toon-board big hw-toon"><a class="toon-frame" href="${esc(imgs[0].src)}" target="_blank" rel="noopener"><span class="toon-tape l"></span><span class="toon-tape r"></span><img src="${esc(imgs[0].src)}" alt="${esc(imgs[0].alt || w.h)}"${imgs[0].w ? ` width="${imgs[0].w}" height="${imgs[0].h}"` : ""}></a><figcaption><span class="toon-sig">${esc(w.by)}</span><span>${esc(imgs[0].cap || "")}</span></figcaption></figure>
        ${body.length ? `<div class="hw-body">${body.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}`;
    } else if (w.kind === "photo") {
      main = `${body.length ? `<div class="hw-body hw-intro">${body.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}<div class="hw-essay">${imgs.map((im, i) => fig(im, i === 0 ? "first" : "")).join("")}</div>`;
    } else if (w.kind === "kavita") {
      const intro = (w.intro || []).length ? `<div class="hw-body hw-intro">${w.intro.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : "";
      const verse = w.poems && w.poems.length
        ? w.poems.map((p, i) => `<section class="hw-poem" aria-labelledby="poem-${i + 1}"><h2 id="poem-${i + 1}">${i + 1}. ${esc(p.h)}</h2>${p.stanzas.map(s => `<p>${esc(s)}</p>`).join("")}</section>`).join("")
        : `<div class="hw-poem">${body.map(s => `<p>${esc(s)}</p>`).join("")}</div>`;
      main = `${imgs[0] ? fig(imgs[0], "hw-cover") : ""}${intro}${verse}`;
    } else {
      /* पाठ में "[[img:N]]" वाली अकेली पंक्ति = N-वीं तस्वीर ठीक वहीं; पाठ में [शब्द](https://...) = कड़ी */
      const inl = body.some(p => /^\[\[img:\d+\]\]$/.test(p)), used = new Set(body.map(p => (p.match(/^\[\[img:(\d+)\]\]$/) || [])[1]).filter(Boolean).map(Number));
      const link = t => t.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (m, a, u) => `<a href="${u}" target="_blank" rel="noopener nofollow">${a}</a>`);
      if (inl) {
        const nTxt = body.filter(p => !/^\[\[img:\d+\]\]$/.test(p)).length, atI = Math.max(1, Math.round(nTxt * 0.4)); let k = 0;
        const paras = body.map(p => { const m = p.match(/^\[\[img:(\d+)\]\]$/); if (m) return imgs[+m[1]] ? fig(imgs[+m[1]]) : ""; k++; return `<p>${link(esc(p))}</p>${w.pull && k === atI && nTxt > 3 ? `<blockquote class="hw-pull">${esc(w.pull)}</blockquote>` : ""}`; }).join("");
        main = `${imgs[0] && !used.has(0) ? fig(imgs[0], "hw-cover") : ""}<div class="hw-body hw-inl">${paras}<span class="hw-end" aria-hidden="true"></span></div>`;
      } else {
      const at = Math.max(1, Math.round(body.length * 0.4));
      const paras = body.map((p, i) => `<p>${link(esc(p))}</p>${w.pull && i === at - 1 && body.length > 3 ? `<blockquote class="hw-pull">${esc(w.pull)}</blockquote>` : ""}${imgs[1] && i === Math.min(body.length - 2, at + 1) ? fig(imgs[1]) : ""}`).join("");
      main = `${imgs[0] ? fig(imgs[0], "hw-cover") : ""}<div class="hw-body">${paras}<span class="hw-end" aria-hidden="true"></span></div>${imgs.slice(2).map(im => fig(im)).join("")}`;
      }
    }
    const others = ALL.filter(has(lg)).filter(x => x.id !== w.id).slice(0, 3);
    const pic = w.photo && !(imgs[0] && w.kind !== "kavita");
    const page = `<article class="hw k-${w.kind}">
      <a class="back" href="${P(lg)}/hamsafar/">${X.back}</a>
      <header class="hw-head${pic ? " has-pic" : ""}">
        ${pic ? `<figure class="hw-pic"><img src="${esc(w.photo)}" alt="${esc(w.by)}"><figcaption>${esc(w.by)}</figcaption>${stamp(w, false, lg)}</figure>` : stamp(w, true, lg)}
        <p class="hs-k">${X.sec} ${deva(w.no)} · ${X.kind[w.kind]}${w.cat && lg === "hi" ? " · " + esc(w.cat) : ""}${lg !== "hi" ? " · " + X.orig : ""}</p>
        <h1>${esc(w.h)}</h1>${w.dek ? `<p class="hw-dek">${esc(w.dek)}</p>` : ""}
        <p class="hw-by">${av(w)}<span><b>${esc(w.by)}</b><small>${w.place ? esc(w.place) + " · " : ""}${dayLabel(w.date)}</small></span></p>
        ${langs.length > 1 ? `<p class="hw-langs"><span>${X.also}</span>${langs.filter(l => l !== lg).map(l => `<a href="${url(w0, l)}" lang="${l}"${l === "ur" ? ' dir="rtl"' : ""}>${LN[l]}</a>`).join("")}</p>` : ""}
      </header>
      ${main}
      ${w.note ? `<aside class="hw-ed"><small>${X.ed}</small><p>${esc(w.note)}</p></aside>` : ""}
      <aside class="hw-author">${av(w, " big")}<div><small>${X.author}</small><h3>${esc(w.by)}</h3>${w.bio ? `<p>${esc(w.bio)}</p>` : ""}${w.bio_url ? `<p><a href="${esc(w.bio_url)}" target="_blank" rel="noopener">${esc(w.bio_source || "परिचय का स्रोत")}</a></p>` : ""}</div></aside>
      ${share(url(w0, lg), w.h, lg)}
      <p class="fine">${esc(w.fine || X.fine(w.by))}${w.tr ? " " + esc(w.tr) : ""}${w.prev ? " " + esc(w.prev) : ""}</p>
      <a class="hw-invite" href="/bhejiye/"><span class="hs-k">${X.invK}</span><b>${X.invB}</b></a>
      ${others.length ? `<div class="hw-others"><h5>${X.more}</h5><div class="hs-grid n${others.length}">${others.map(o => card(o, lg)).join("")}</div></div>` : ""}
    </article>`;
    const ld = { "@context": "https://schema.org", "@type": w.kind === "photo" || w.kind === "cartoon" ? "CreativeWork" : "Article", headline: w.h, description: w.dek || "", datePublished: w.date, inLanguage: lg, ...(lg !== "hi" ? { translationOfWork: { "@type": "CreativeWork", url: SITE + url(w0) , inLanguage: "hi" } } : {}), author: { "@type": "Person", name: w.by }, publisher: { "@type": "Organization", name: "देशकाल" } };
    const alt = Object.fromEntries(langs.map(l => [l, url(w0, l)]));
    return layout({ tab: "hamsafar", alt, title: `${w.h}: ${w.by}`, desc: w.dek || X.desc(w, X.kind[w.kind]), url: url(w0, lg), body: page + `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`, image: imgs[0] && /\.(jpe?g|png)$/i.test(imgs[0].src) ? imgs[0].src : (w.photo || "/og-bhejiye.png"), published: w.date });
  }

  return { ALL, has, band, invitePage, galleryPage, workPage, url };
};
