/* हमसफ़र: पाठकों की मौलिक रचनाएं (लेख, कविता, कहानी, रिपोर्ताज, कार्टून, तस्वीरें)
   डेटा: data/hamsafar/<id>.json  ·  तस्वीरें: public/media/hamsafar/
   निजता: रिपॉज़िटरी पब्लिक है, इसलिए किसी रचना की फ़ाइल में ईमेल, फ़ोन या पता हो तो बिल्ड रुक जाता है। */
const fs = require("fs"), path = require("path");
const MAIL = "sampark@deshkaal.xyz";
const KIND = { lekh: "लेख", reportaj: "रिपोर्ताज", kahani: "कहानी", kavita: "कविता", cartoon: "कार्टून", photo: "तस्वीरें", sansmaran: "संस्मरण" };
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
  const url = w => `/hamsafar/${w.id}/`;
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
  const share = (u, title) => { const U = encodeURIComponent(SITE + u), t = encodeURIComponent(title);
    return `<div class="share" data-url="${SITE}${u}" data-title="${esc(title)}"><span class="share-l">आगे भेजिए</span>
    <button class="sh sh-native" type="button" hidden>शेयर करें</button>
    <a class="sh" href="https://wa.me/?text=${t}%0A${U}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="sh" href="https://t.me/share/url?url=${U}&text=${t}" target="_blank" rel="noopener">Telegram</a>
    <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${U}" target="_blank" rel="noopener">X</a>
    <a class="sh" href="https://www.facebook.com/sharer/sharer.php?u=${U}" target="_blank" rel="noopener">Facebook</a>
    <button class="sh sh-copy" type="button">लिंक कॉपी</button></div>`; };

  /* डाक टिकट: हर रचना का अपना */
  const stamp = (w, big) => `<span class="hs-stamp${big ? " big" : ""}" aria-hidden="true"><span class="hs-st-in"><i></i><b>${KIND[w.kind]}</b><small>हमसफ़र ${deva(w.no)}</small></span></span>`;
  const thumb = w => w.images && w.images[0] ? `<img src="${esc(w.images[0].src)}" alt="" loading="lazy"${w.images[0].w ? ` width="${w.images[0].w}" height="${w.images[0].h}"` : ""}>` : "";

  const card = w => `<article class="hs-card k-${w.kind}${w.images && w.images[0] ? " has-img" : ""}"><a href="${url(w)}">
    ${w.images && w.images[0] ? `<span class="hs-thumb">${thumb(w)}</span>` : `<span class="hs-quote">${esc(w.pull || w.dek || "")}</span>`}
    ${stamp(w)}<span class="hs-ct"><h4>${esc(w.h)}</h4><span class="hs-by">${w.photo ? av(w, " sm") : ""}<b>${esc(w.by)}</b>${w.place ? `<small>${esc(w.place)}</small>` : ""}</span></span></a></article>`;

  /* पहले पन्ने का बैंड: रचनाएं हों तो ताज़ा तीन, न हों तो न्योते का पोस्टकार्ड */
  function band() {
    const recent = ALL.slice(0, 3);
    if (!recent.length) return `<section class="hs-band hs-empty"><div class="hs-pc">
      <div class="hs-pc-l"><p class="hs-k">हमसफ़र · न्योता</p><h3>यह पगडंडी आपके क़दमों से भी बनेगी</h3>
      <p>लेख, कविता, कहानी, रिपोर्ताज, कार्टून या तस्वीरें: इस वक़्त पर आपकी नज़र देशकाल पर छप सकती है, आपके नाम के साथ, पूरे सलीक़े से।</p>
      <a class="hs-btn" href="/bhejiye/">रचना भेजिए</a></div>
      <div class="hs-pc-r" aria-hidden="true"><span class="hs-pc-lines"><i>सेवा में,</i><i>संपादक, देशकाल</i><i>${MAIL}</i></span>${stamp({ kind: "lekh", no: 1 }, true).replace("लेख", "आपकी रचना").replace("हमसफ़र 1", "डाक मुफ़्त")}<span class="hs-postmark"><svg viewBox="0 0 100 100"><defs><path id="hspm" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="27"/><text><textPath href="#hspm">देशकाल · पाठकों की डाक · देशकाल ·</textPath></text></svg></span></div>
    </div></section>`;
    return `<section class="hs-band"><div class="sechead sec-hamsafar"><h3>हमसफ़र</h3><p>पाठकों की रचनाएं, कार्टून और तस्वीरें, जो देशकाल को भेजी गयीं</p></div>
      <div class="hs-grid n${recent.length}">${recent.map(card).join("")}</div>
      <p class="hs-more"><a href="/hamsafar/">सारी रचनाएं →</a><a class="hs-btn sm" href="/bhejiye/">अपनी रचना भेजिए</a></p></section>`;
  }

  /* न्योते का पन्ना */
  function invitePage() {
    const kinds = [
      ["लेख और रिपोर्ताज", "ज़मीन से रिपोर्ट, विश्लेषण, संस्मरण। 600 से 1,500 शब्द।", `<path d="M14 8h28l10 10v38H14z"/><path d="M42 8v10h10"/><path d="M22 28h22M22 36h22M22 44h14"/>`],
      ["कविता और कहानी", "जो इस वक़्त की धड़कन पकड़े। कविता एक से तीन, कहानी 3,000 शब्द तक।", `<path d="M46 10c-14 4-26 18-30 40l6-2c2-8 6-14 12-18"/><path d="M16 50l-4 6"/><path d="M28 30c6 0 12-2 18-8"/>`],
      ["कार्टून", "एक पैनल या स्ट्रिप। JPG या PNG, कम से कम 1600 पिक्सल चौड़ा।", `<rect x="10" y="12" width="44" height="32" rx="3"/><path d="M20 52l6-8h8"/><circle cx="25" cy="27" r="4"/><path d="M33 34c4-6 10-6 14 0"/>`],
      ["तस्वीरें", "एक तस्वीर या फ़ोटो-निबंध, दस तक। हर तस्वीर के साथ एक-दो पंक्ति।", `<rect x="8" y="18" width="48" height="32" rx="4"/><path d="M22 18l4-6h12l4 6"/><circle cx="32" cy="34" r="9"/>`]
    ];
    const checks = [
      "रचना आपकी अपनी हो। पहले कहीं छपी हो, तो बता दीजिए कहां और कब।",
      "तथ्य और आंकड़े हों, तो उनके स्रोत भी साथ भेजिए।",
      "तस्वीर में पहचाने जा सकने वाले लोगों की सहमति ली गयी हो, ख़ासकर बच्चों की, और मुश्किल हालात में घिरे लोगों की।",
      "हिंदी, उर्दू या अंग्रेज़ी, किसी भी ज़बान में भेजिए।",
      "एक ईमेल में एक रचना।"
    ];
    const steps = [
      ["पढ़ते हैं", "हर रचना पूरे ध्यान से पढ़ी जाती है, किसी भी नाम या पहचान से पहले।"],
      ["जांचते हैं", "मौलिकता, तथ्य और स्रोत। कहीं और छपी चीज़ हम अपनी कहकर नहीं छापते।"],
      ["छापते हैं", "अपने ख़ास पन्ने पर, आपके नाम और परिचय के साथ। फिर ई-पेपर, न्यूज़लेटर और सोशल मीडिया तक। लिंक आपको भेजते हैं।"],
      ["या लौटाते हैं", "विनम्रता से, एक चिट्ठी के साथ। अगली रचना का इंतज़ार फिर भी रहेगा।"]
    ];
    const recent = ALL.slice(0, 3);
    const body = `<div class="hsi">
  <section class="hsi-hero">
    <div class="hsi-ht">
      <p class="hs-k">हमसफ़र · पाठकों के लिए न्योता</p>
      <h1>यह पगडंडी आपके क़दमों से भी बनेगी</h1>
      <p class="hsi-lede">आपने कुछ लिखा है, कोई कार्टून बनाया है, या किसी लम्हे को तस्वीर में थाम लिया है, जो इस वक़्त को समझने में मदद करता है? उसे देशकाल को भेजिए। अच्छी रचना हम पूरे सम्मान और सलीक़े से छापते हैं, आपके नाम के साथ।</p>
      <div class="hsi-acts"><a class="hs-btn" href="${SEND}">रचना भेजिए</a><a class="hs-btn ghost" href="/niti/">पहले संपादकीय नीति पढ़ें</a></div>
    </div>
    <div class="hsi-env" aria-hidden="true">
      <div class="env"><span class="env-flap"></span>
        <span class="hs-stamp big"><span class="hs-st-in"><i></i><b>आपकी रचना</b><small>डाक मुफ़्त</small></span></span>
        <span class="hs-postmark"><svg viewBox="0 0 100 100"><defs><path id="hspm2" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="27"/><text><textPath href="#hspm2">देशकाल · पाठकों की डाक · देशकाल ·</textPath></text></svg></span>
        <span class="env-to"><i>सेवा में,</i><i>संपादक, देशकाल</i><i class="m">${MAIL}</i></span>
        <span class="env-from">भेजने वाला: आप</span>
      </div>
    </div>
  </section>

  <section class="hsi-kinds"><h2 class="hsi-h">क्या भेज सकते हैं</h2>
    <div class="hsi-kg">${kinds.map(([t, d, ic], i) => `<div class="hsi-kind"><span class="hsi-kn">${deva(i + 1)}</span><svg viewBox="0 0 64 64" aria-hidden="true">${ic}</svg><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
  </section>

  <section class="hsi-niti">
    <div class="hsi-niti-card">
      <p class="hs-k">भेजने से पहले, एक गुज़ारिश</p>
      <h2>देशकाल की संपादकीय नीति एक बार ज़रूर पढ़ लीजिए</h2>
      <p>इससे अंदाज़ा हो जाएगा कि हम किन आवाज़ों को आगे रखते हैं, और किन चीज़ों से दूर रहते हैं। आपका और हमारा, दोनों का वक़्त बचेगा।</p>
      <a class="hs-btn" href="/niti/">संपादकीय नीति पढ़ें →</a>
    </div>
    <ul class="hsi-checks">${checks.map(c => `<li>${c}</li>`).join("")}</ul>
  </section>

  <section class="hsi-how"><h2 class="hsi-h">कैसे भेजें</h2>
    <div class="hsi-letter">
      <div class="hl-row"><span>पता</span><b class="hl-mail">${MAIL}</b></div>
      <div class="hl-row"><span>विषय</span><b>रचना: आपकी रचना का शीर्षक</b></div>
      <div class="hl-row top"><span>साथ में</span><ol>
        <li>रचना, ईमेल में ही, या .docx, .txt, .pdf फ़ाइल में</li>
        <li>आपका नाम, जैसा छपना चाहिए</li>
        <li>शहर या गांव</li>
        <li>अपने बारे में एक-दो पंक्ति, और अपनी एक साफ़ तस्वीर, जो रचना के साथ छपेगी</li>
        <li>कार्टून और तस्वीरें JPG या PNG में, पूरे आकार में</li>
      </ol></div>
      <p class="hl-tip">नीचे का बटन दबाते ही एक तैयार ईमेल खुलेगा, जिसमें बस ख़ाली जगहें भरनी हैं।</p>
      <a class="hs-btn big" href="${SEND}">ईमेल खोलिए, रचना भेजिए</a>
    </div>
  </section>

  <section class="hsi-steps"><h2 class="hsi-h">फिर क्या होता है</h2>
    <ol class="hsi-tl">${steps.map(([t, d], i) => `<li><span class="hsi-dot">${deva(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol>
    <p class="hsi-week">हर रचना का जवाब, आम तौर पर सात दिन के भीतर। छापने से पहले भाषा और लंबाई में हल्का संपादन हो सकता है, आपकी बात और आवाज़ बदले बिना।</p>
  </section>

  <section class="hsi-note">
    <div class="hsi-chitthi">
      <p class="hs-k">एक विनम्र बात</p>
      <p>देशकाल मूल रूप से एक पीपुल्स मीडिया एग्रीगेटर है। हमारा रोज़ का काम है दुनिया भर की ज़रूरी टिप्पणियां चुनना, और उनका सार अपनी ज़बान में आप तक लाना। मौलिक रचनाओं का यह पन्ना, हमसफ़र, उसी काम में जोड़ी गयी एक अतिरिक्त सुविधा है, उन आवाज़ों के लिए जिन्हें अक्सर अपनी जगह नहीं मिलती।</p>
      <p>इसीलिए एक बात पहले कह देना हमें ज़रूरी लगता है। अभी हम किसी रचना के लिए पारिश्रमिक नहीं दे पाते। जो दे सकते हैं, वह है आपकी रचना के लिए पूरा सम्मान, सधा हुआ संपादन, एक ख़ूबसूरत पन्ना, आपका नाम, और पाठकों तक उसकी पहुंच। उम्मीद है, आप हमारी इस सीमा को समझेंगे।</p>
      <p class="hsi-sign">आपका,<br><b>देशकाल</b></p>
    </div>
  </section>

  <section class="hsi-rights"><h2 class="hsi-h">हक़ और निजता</h2>
    <div class="hsi-rg">
      <div><h3>रचना आपकी</h3><p>कॉपीराइट आपके पास ही रहेगा। आप उसे कहीं और भी छपवा सकते हैं।</p></div>
      <div><h3>छापने की इजाज़त</h3><p>भेजकर आप देशकाल को उसे वेबसाइट, ई-पेपर, न्यूज़लेटर और सोशल मीडिया पर छापने, और अंग्रेज़ी-उर्दू में अनुवाद करने की इजाज़त देते हैं।</p></div>
      <div><h3>आपका पता, आपका</h3><p>ईमेल, फ़ोन या पता कभी नहीं छपता। सिर्फ़ नाम, शहर, आपका परिचय और आपकी तस्वीर।</p></div>
      <div><h3>हटवाना हो तो</h3><p>छपी रचना हटवानी हो, तो एक ईमेल काफ़ी है।</p></div>
    </div>
  </section>

  ${recent.length ? `<section class="hsi-recent"><h2 class="hsi-h">हमसफ़र में हाल में</h2><div class="hs-grid n${recent.length}">${recent.map(card).join("")}</div><p class="hs-more"><a href="/hamsafar/">सारी रचनाएं →</a></p></section>` : ""}

  <section class="hsi-end"><p>आपकी रचना का इंतज़ार है।</p><a class="hs-btn big" href="${SEND}">रचना भेजिए</a><p class="hsi-mail">${MAIL}</p></section>
</div>`;
    return layout({ title: "रचना भेजिए", desc: "अपना लेख, कविता, कहानी, रिपोर्ताज, कार्टून या तस्वीरें देशकाल को भेजिए। अच्छी रचनाएं हमसफ़र में, आपके नाम के साथ, पूरे सलीक़े से छपती हैं।", url: "/bhejiye/", body, image: "/og-bhejiye.png" });
  }

  /* सारी रचनाएं */
  function galleryPage() {
    const body = `<section class="hs-gal"><p class="hs-k">पाठकों की ओर से</p><h1>हमसफ़र</h1>
      <p class="hs-gal-i">ये रचनाएं देशकाल के पाठकों ने भेजी हैं: लेख, कविताएं, कहानियां, कार्टून और तस्वीरें। हर रचना पढ़कर, जांचकर, उनके नाम के साथ छापी गयी है।</p>
      ${ALL.length ? `<div class="hs-grid all">${ALL.map(card).join("")}</div>` : `<p class="hs-first">पहली रचना आपकी हो सकती है।</p>`}
      <p class="hs-more"><a class="hs-btn" href="/bhejiye/">अपनी रचना भेजिए</a></p></section>`;
    return layout({ title: "हमसफ़र: पाठकों की रचनाएं", desc: "देशकाल के पाठकों के भेजे लेख, कविताएं, कहानियां, कार्टून और तस्वीरें।", url: "/hamsafar/", body });
  }

  /* एक रचना का पन्ना */
  function workPage(w) {
    const imgs = w.images || [], body = w.body || [];
    const fig = (im, cls = "") => `<figure class="hw-fig ${cls}"><img src="${esc(im.src)}" alt="${esc(im.alt || im.cap || w.h)}"${im.w ? ` width="${im.w}" height="${im.h}"` : ""} loading="lazy">${im.cap ? `<figcaption>${esc(im.cap)}</figcaption>` : ""}</figure>`;
    let main = "";
    if (w.kind === "cartoon") {
      main = `<figure class="toon-board big hw-toon"><a class="toon-frame" href="${esc(imgs[0].src)}" target="_blank" rel="noopener"><span class="toon-tape l"></span><span class="toon-tape r"></span><img src="${esc(imgs[0].src)}" alt="${esc(imgs[0].alt || w.h)}"${imgs[0].w ? ` width="${imgs[0].w}" height="${imgs[0].h}"` : ""}></a><figcaption><span class="toon-sig">${esc(w.by)}</span><span>${esc(imgs[0].cap || "")}</span></figcaption></figure>
        ${body.length ? `<div class="hw-body">${body.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}`;
    } else if (w.kind === "photo") {
      main = `${body.length ? `<div class="hw-body hw-intro">${body.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}<div class="hw-essay">${imgs.map((im, i) => fig(im, i === 0 ? "first" : "")).join("")}</div>`;
    } else if (w.kind === "kavita") {
      main = `${imgs[0] ? fig(imgs[0], "hw-cover") : ""}<div class="hw-poem">${body.map(s => `<p>${esc(s)}</p>`).join("")}</div>`;
    } else {
      const at = Math.max(1, Math.round(body.length * 0.4));
      const paras = body.map((p, i) => `<p>${esc(p)}</p>${w.pull && i === at - 1 && body.length > 3 ? `<blockquote class="hw-pull">${esc(w.pull)}</blockquote>` : ""}${imgs[1] && i === Math.min(body.length - 2, at + 1) ? fig(imgs[1]) : ""}`).join("");
      main = `${imgs[0] ? fig(imgs[0], "hw-cover") : ""}<div class="hw-body">${paras}<span class="hw-end" aria-hidden="true"></span></div>${imgs.slice(2).map(im => fig(im)).join("")}`;
    }
    const others = ALL.filter(x => x.id !== w.id).slice(0, 3);
    const pic = w.photo && !(imgs[0] && w.kind !== "kavita");
    const page = `<article class="hw k-${w.kind}">
      <a class="back" href="/hamsafar/">← हमसफ़र</a>
      <header class="hw-head${pic ? " has-pic" : ""}">
        ${pic ? `<figure class="hw-pic"><img src="${esc(w.photo)}" alt="${esc(w.by)}"><figcaption>${esc(w.by)}</figcaption>${stamp(w)}</figure>` : stamp(w, true)}
        <p class="hs-k">हमसफ़र ${deva(w.no)} · ${KIND[w.kind]}${w.cat ? " · " + esc(w.cat) : ""}</p>
        <h1>${esc(w.h)}</h1>${w.dek ? `<p class="hw-dek">${esc(w.dek)}</p>` : ""}
        <p class="hw-by">${av(w)}<span><b>${esc(w.by)}</b><small>${w.place ? esc(w.place) + " · " : ""}${dayLabel(w.date)}</small></span></p>
      </header>
      ${main}
      ${w.note ? `<aside class="hw-ed"><small>संपादक की बात</small><p>${esc(w.note)}</p></aside>` : ""}
      <aside class="hw-author">${av(w, " big")}<div><small>रचनाकार</small><h3>${esc(w.by)}</h3>${w.bio ? `<p>${esc(w.bio)}</p>` : ""}</div></aside>
      ${share(url(w), w.h)}
      <p class="fine">यह रचना ${esc(w.by)} ने देशकाल को भेजी है। इसके सारे अधिकार उन्हीं के हैं।${w.tr ? " " + esc(w.tr) : ""}${w.prev ? " " + esc(w.prev) : ""}</p>
      <a class="hw-invite" href="/bhejiye/"><span class="hs-k">आप भी हमसफ़र बनिए</span><b>अपनी रचना देशकाल को भेजिए →</b></a>
      ${others.length ? `<div class="hw-others"><h5>हमसफ़र में और</h5><div class="hs-grid n${others.length}">${others.map(card).join("")}</div></div>` : ""}
    </article>`;
    const ld = { "@context": "https://schema.org", "@type": w.kind === "photo" || w.kind === "cartoon" ? "CreativeWork" : "Article", headline: w.h, description: w.dek || "", datePublished: w.date, inLanguage: w.lang || "hi", author: { "@type": "Person", name: w.by }, publisher: { "@type": "Organization", name: "देशकाल" } };
    return layout({ title: `${w.h}: ${w.by}`, desc: w.dek || `${w.by} की ${KIND[w.kind]}, हमसफ़र में`, url: url(w), body: page + `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`, image: imgs[0] && /\.(jpe?g|png)$/i.test(imgs[0].src) ? imgs[0].src : "/og-bhejiye.png", published: w.date });
  }

  return { ALL, band, invitePage, galleryPage, workPage, url };
};
