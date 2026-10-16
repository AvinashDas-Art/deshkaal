// देशकाल: स्थिर साइट बनाने वाली स्क्रिप्ट। चलाएं: node build.js  (कोई बाहरी पैकेज ज़रूरी नहीं)
// data/days/*.json पढ़ कर dist/ में पूरी साइट लिखती है।
const fs = require("fs"), path = require("path");
const SITE = "https://deshkaal.xyz";
const { CATN, MONTHS: MON, DAYS: WD, LANGNAME, S } = require("./src/i18n.js");
const LANGS = ["hi", "en", "ur"];
const BRAND = { hi: "देशकाल", en: "Deshkaal", ur: "دیش کال" };
/* मास्टहेड हर भाषा की अपनी लिपि में, एक ही ब्रश वाले मिज़ाज में */
const MAST = { hi: "देशकाल", en: "DESHKAAL", ur: "دیش کال" };
const LOCALE = { hi: "hi_IN", en: "en_IN", ur: "ur_IN" };
/* जो भाषा अभी बन रही है */
let LG = "hi", T = S.hi, PRE = "";
const setLang = l => { LG = l; T = S[l]; PRE = l === "hi" ? "" : "/" + l; };
const cn = c => CATN[LG][c] || c;
const TAGLINE = S.hi.tagline;
/* चैनलों के लिंक: ख़ाली हों तो बटन "जल्द" दिखाते हैं */
const CHANNELS = { whatsapp: "https://whatsapp.com/channel/0029Vb8hHGPBadmUpTWYYI1W", telegram: "https://t.me/deshkaal" };
const CATS = ["देश","दुनिया","समाज","अर्थ","पर्यावरण","स्त्री","संस्कृति","साहित्य"];
const SLUG = {"देश":"desh","दुनिया":"duniya","समाज":"samaj","अर्थ":"arth","पर्यावरण":"paryavaran","स्त्री":"stri","संस्कृति":"sanskriti","साहित्य":"sahitya"};

const CHAN_ICON = {
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.5-.3Z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.5c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13.2l-4.8-1.5c-1-.3-1.1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"/></svg>' };
const chanBtn = (k, label) => CHANNELS[k]
  ? `<a class="chip chan chan-${k}" href="${CHANNELS[k]}" target="_blank" rel="noopener">${CHAN_ICON[k]}${T.chanJoin(label)}</a>`
  : `<span class="chip">${label} · ${T.soon}</span>`;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dayLabel = d => { const t = new Date(d + "T00:00:00Z"); return `${WD[LG][t.getUTCDay()]}, ${t.getUTCDate()} ${MON[LG][t.getUTCMonth()]} ${t.getUTCFullYear()}`; };
const words = a => [a.h, a.dek, ...a.body, ...a.nazar].join(" ").split(/\s+/).length;
const readMin = a => Math.max(1, Math.round(words(a) / 200));
const listenMin = a => Math.max(1, Math.round(words(a) / 130));
const href = a => `${PRE}/lekh/${a.id}/`;
const hrefL = (a, l) => `${l === "hi" ? "" : "/" + l}/lekh/${a.id}/`;
const languageURLs = (url, langs = LANGS) => {
  const base = url.replace(/^\/(en|ur)(?=\/)/, "");
  return Object.fromEntries(langs.map(l => [l, (l === "hi" ? "" : "/" + l) + base]));
};
/* पेंटिंग वग़ैरह GitHub पर public/media/<id>.jpg में उतर आती हैं; हों तो वही, वरना मूल पता */
const imgSrc = a => fs.existsSync(path.join("public", "media", a.id + ".jpg")) ? `/media/${a.id}.jpg` : (a.photo ? a.photo.src : "");
const art = (a, cls = "", word = "") => `<canvas class="art ${cls}" data-id="${esc(a.id)}" data-motif="${esc(a.motif)}" data-seed="${a.seed}" data-h="${esc(a.h)}" data-cat="${esc(a.cat)}" data-catl="${esc(cn(a.cat))}"${a.photo ? ` data-photo="${esc(imgSrc(a))}" data-kind="${esc(a.photo.kind || "photo")}"` : ""}${word ? ` data-word="${esc(word)}"` : ""} role="img" aria-label="${esc(T.collageOf(word || a.h))}"></canvas>`;
const credit = a => a.photo ? `<span class="credit">${a.photo.note ? esc(a.photo.note) + " · " : ""}${a.photo.kind === "painting" ? T.painting : T.photo}: <a href="${esc(a.photo.page)}" target="_blank" rel="noopener">${esc(a.photo.credit)}</a></span>` : "";
const saveBtn = a => `<button class="save" data-save="${esc(a.id)}" data-h="${esc(a.h)}" aria-pressed="false">${T.save}</button>`;

/* ---------- data ---------- */
const dayFiles = fs.readdirSync("data/days").filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
const DAYS_HI = dayFiles.map(f => ({ date: f.slice(0, 10), items: JSON.parse(fs.readFileSync(path.join("data/days", f), "utf8")) }));
if (!DAYS_HI.length) throw new Error("data/days में कोई दिन नहीं मिला");
require("./src/validate-days.js").validateDays(DAYS_HI);
/* हर टिप्पणी का खंड (sec): amukh आमुख, vichar संपादकीय टिप्पणियां, khabar कल की ख़बरें, pari देहात की ख़बरें, video रोशनदान, sahitya साहित्य. */
const { normalizeSection, isRuralReport } = require("./src/sections.js");
DAYS_HI.forEach(d => d.items.forEach((a, i) => {
  a.sec = normalizeSection(a, i);
}));
/* विशेष खंड "सड़क की संसद" (sec: morcha): data/special.json से चालू/बंद */
const SPECIAL = fs.existsSync("data/special.json") ? JSON.parse(fs.readFileSync("data/special.json", "utf8")) : { active: false };

const CREDIT_TR = {
  en: { "पब्लिक शेयरिंग से प्राप्त तस्वीर; मूल फ़ोटो क्रेडिट की पुष्टि बाक़ी": "Photo received via public sharing; original photo credit yet to be confirmed", "AI आर्ट: के शरद हक्सर": "AI art: K Sharad Haksar", "PTI · The Leaflet के लेख से": "PTI · from The Leaflet article", "The New York Times के इंटरव्यू से": "From a New York Times interview", "रागमाला चित्रकार, LACMA / Wikimedia Commons": "Ragamala painter, LACMA / Wikimedia Commons", "राजा रवि वर्मा / Wikimedia Commons": "Raja Ravi Varma / Wikimedia Commons" },
  ur: { "पब्लिक शेयरिंग से प्राप्त तस्वीर; मूल फ़ोटो क्रेडिट की पुष्टि बाक़ी": "پبلک شیئرنگ سے ملی تصویر؛ اصل فوٹو کریڈٹ کی تصدیق باقی", "AI आर्ट: के शरद हक्सर": "اے آئی آرٹ: کے شرد ہکسر", "PTI · The Leaflet के लेख से": "پی ٹی آئی · دی لیفلیٹ کے مضمون سے", "The New York Times के इंटरव्यू से": "نیویارک ٹائمز کے انٹرویو سے", "रागमाला चित्रकार, LACMA / Wikimedia Commons": "راگ مالا مصور، LACMA / Wikimedia Commons", "राजा रवि वर्मा / Wikimedia Commons": "راجہ روی ورما / Wikimedia Commons" }
};
function daysFor(l) {
  if (l === "hi") return DAYS_HI;
  return DAYS_HI.map(d => {
    const f = path.join("data/i18n", l, d.date + ".json");
    if (!fs.existsSync(f)) return null;
    const tr = Object.fromEntries(JSON.parse(fs.readFileSync(f, "utf8")).map(x => [x.id, x]));
    const items = d.items.filter(a => tr[a.id]).map(a => { const t = tr[a.id], m = { ...a, ...t, sec: a.sec, pub: t.pub || a.pub };
      if (a.photo) m.photo = { ...a.photo, note: t.photo_note || "", credit: t.photo_credit || (CREDIT_TR[l] || {})[a.photo.credit] || a.photo.credit };
      if (a.chart && t.chart) m.chart = { ...a.chart, ...t.chart };
      return m; });
    return items.length ? { date: d.date, items } : null;
  }).filter(Boolean);
}
const HAS = Object.fromEntries(LANGS.map(l => [l, new Set(daysFor(l).flatMap(d => d.items.map(a => a.id)))]));
let days = DAYS_HI, all = days.flatMap(d => d.items), today = days[0];

/* ---------- layout ---------- */

const RZP_BUTTON_ID = "pl_TodhL5zlUXHmtl";
const RZP_BUTTON_SCRIPT = `<form class="razorpay-payment-button"><script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment_button_id="${RZP_BUTTON_ID}" async> </script></form>`;
const supportRibbon = () => `<div class="support-ribbon" role="complementary" aria-label="${LG === "en" ? "Reader support" : LG === "ur" ? "قارئین کا تعاون" : "पाठक-सहयोग"}">
  <button class="support-ribbon-link" type="button" aria-label="${LG === "en" ? "A little support | Keep the footpath open" : LG === "ur" ? "تھوڑا سا ساتھ | یہ پگڈنڈی چلتی رہے" : "थोड़ा-सा साथ | यह पगडंडी चलती रहे"}"><b>${LG === "en" ? "A little support" : LG === "ur" ? "تھوڑا سا ساتھ" : "थोड़ा-सा साथ"}</b><span aria-hidden="true"> | </span><small>${LG === "en" ? "Keep the footpath open" : LG === "ur" ? "یہ پگڈنڈی چلتی رہے" : "यह पगडंडी चलती रहे"}</small></button>${RZP_BUTTON_SCRIPT}
</div>`;
const supportEnd = () => `<section class="article-support" aria-label="${LG === "en" ? "Reader support" : LG === "ur" ? "قارئین کا تعاون" : "पाठक-सहयोग"}">
  <div><b>${LG === "en" ? "If this work matters to you..." : LG === "ur" ? "اگر یہ کام آپ کے لیے اہم ہے..." : "अगर यह काम आपके लिए मायने रखता है..."}</b><p>${LG === "en" ? "Support Deshkaal with an amount of your choice. One-time and voluntary. Reading remains free." : LG === "ur" ? "اپنی پسند کی رقم سے دیش کال کا ساتھ دیجیے۔ یہ ایک بار کا رضاکارانہ تعاون ہے۔ پڑھنا مفت رہے گا۔" : "अपनी पसंद की राशि से देशकाल का साथ दीजिए। यह एकमुश्त, स्वैच्छिक सहयोग है। पढ़ना मुफ़्त रहेगा।"}</p></div>${RZP_BUTTON_SCRIPT}
</section>`;
function layout({ title, desc, url, body, tab = "", catOn = "", extraHead = "", image = "/og.png", published = "", alt = null, noindex = false }) {
  const B = BRAND[LG];
  const full = title ? `${title} · ${B}` : `${B}${LG === "en" ? "" : " (Deshkaal)"} · ${T.tagline}`;
  // Callers pass an already localized URL. Never prefix the language twice.
  if (!alt) alt = { [LG]: url };
  if (noindex) extraHead += '<meta name="robots" content="noindex,follow">';
  const pageIn = l => (alt && alt[l]) || (l === "hi" ? "/" : `/${l}/`);
  const hreflang = !noindex && Object.keys(alt).length > 1 ? LANGS.filter(l => alt[l]).map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}${alt[l]}">`).join("") : "";
  const fonts = LG === "ur"
    ? "family=Yatra+One&family=Lalezar&family=Noto+Nastaliq+Urdu:wght@400;600&family=Noto+Naskh+Arabic:wght@400;600&family=Teko:wght@500;600"
    : "family=Yatra+One&family=Kalam:wght@400;700&family=Laila:wght@300;500;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Devanagari:wght@400;500" + (LG === "en" ? "&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Fraunces:opsz,wght@9..144,500;9..144,600" : "");
  return `<!doctype html>
<html lang="${LG}"${LG === "ur" ? ' dir="rtl"' : ""}>
<head>
<meta charset="utf-8">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2318826122398822" crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">${hreflang}
<meta property="og:type" content="${title ? "article" : "website"}">
<meta property="og:site_name" content="${B}">
<meta property="og:title" content="${esc(title || B)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${SITE}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title || B)}">
<meta property="og:locale" content="${LOCALE[LG]}">
<meta name="twitter:title" content="${esc(title || B)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}${image}">${published ? `
<meta property="article:published_time" content="${published}T06:00:00+05:30">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F1F2EE">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png"><link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="देशकाल">
<link rel="alternate" type="application/rss+xml" title="देशकाल" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=swap">
<link rel="stylesheet" href="/styles.css?v=${AV}">
${extraHead}
${["/", "/en/", "/ur/"].includes(url) ? `<script type="application/ld+json">${JSON.stringify([
  { "@context": "https://schema.org", "@type": "WebSite", "name": "देशकाल", "alternateName": ["Deshkaal", "deshkaal.xyz", "دیش کال", "Desh Kaal"], "url": SITE + "/", "inLanguage": ["hi", "en", "ur"],
    "potentialAction": { "@type": "SearchAction", "target": SITE + "/?khoj={search_term_string}", "query-input": "required name=search_term_string" } },
  { "@context": "https://schema.org", "@type": "NewsMediaOrganization", "name": "देशकाल", "alternateName": "Deshkaal", "url": SITE + "/", "logo": SITE + "/icons/icon-512.png",
    "description": "ज़रूरी ख़बरों तक जाती एक पगडंडी: दुनिया भर की ज़रूरी संपादकीय टिप्पणियां, सहज हिंदुस्तानी में, रोज़ सुबह।", "email": "sampark@deshkaal.xyz",
    "sameAs": ["https://t.me/deshkaal", "https://whatsapp.com/channel/0029Vb8hHGPBadmUpTWYYI1W", "https://www.facebook.com/1042770568927482", "https://deshkaalxyz.substack.com"] }
]).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="brush" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.11" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
<div class="wrap" id="top">
  <div class="strip">
    <span class="date">${dayLabel(today.date)} · ${T.daily}</span>
    <div class="controls">
      ${LIVE_ON ? `<a class="livepill" href="/live/" title="${T.liveWall}"><i aria-hidden="true"></i><span>${T.liveShort}</span></a>` : ""}
      ${SHOW_PAPER ? `<a class="paper" href="/akhbar/" title="${T.paper}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h13v13a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v9a2 2 0 0 1-2 2"/><path d="M7 9h7M7 12.5h7M7 16h4"/></svg><span>${T.paper}</span></a>` : ""}
      <details class="langs"><summary aria-label="${T.langLabel}">${LANGNAME[LG]}</summary><div class="lmenu">${LANGS.map(l => `<a href="${pageIn(l)}" lang="${l}"${l === LG ? ' aria-current="true"' : ""}>${LANGNAME[l]}</a>`).join("")}</div></details>
      <button class="ctl" id="smaller" aria-label="${T.smaller}">${LG === "hi" ? "अ" : LG === "ur" ? "ا" : "A"}−</button>
      <button class="ctl" id="bigger" aria-label="${T.bigger}">${LG === "hi" ? "अ" : LG === "ur" ? "ا" : "A"}+</button>
      <button class="ctl" id="theme">${T.theme}</button>
      <button class="ctl" id="who">${T.signin}</button>
      <button class="sic" id="sopen" type="button" aria-haspopup="dialog" aria-label="${SR[LG].t}" title="${SR[LG].t}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="6.2" stroke="currentColor" stroke-width="2.2"/><path d="M7.4 8.4a3.2 3.2 0 0 1 2.6-1.6" stroke="currentColor" stroke-width="1.6" opacity=".55"/><path d="M14.7 14.7 20.5 20.5" stroke="#CF3A2E" stroke-width="3.4"/></svg></button>
      ${supportRibbon()}
    </div>
  </div>
  <header class="masthead">
    <${title ? "p" : "h1"} class="mh"><a href="${PRE}/" class="mast" aria-label="${B}"><span class="w">${MAST[LG]}</span></a></${title ? "p" : "h1"}>
    <p class="tag">${T.tagline}</p>
    <nav class="cats" aria-label="${T.cats}">
      <a href="${PRE}/" class="${catOn === "सब" ? "on" : ""}">${T.all}</a>${CATS.map(c => `<a href="${PRE}/shreni/${SLUG[c]}/" class="${catOn === c ? "on" : ""}">${cn(c)}</a>`).join("")}<a href="${PRE}/hamsafar/" class="arch ${tab === "hamsafar" ? "on" : ""}">${LG === "ur" ? "ہم سفر" : LG === "en" ? "Hamsafar" : "हमसफ़र"}</a><a href="${PRE}/purane/" class="arch ${tab === "purane" ? "on" : ""}">${T.archive}</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer>
    <a class="mast small totop-mast" href="#top" aria-label="${LG === "en" ? "Back to top" : LG === "ur" ? "اوپر جائیں" : "सबसे ऊपर जाएं"}"><span class="w">${MAST[LG]}</span></a>
    <span>${T.foot}</span>
    <span><a href="/bhejiye/" style="color:var(--geru)">${LG === "ur" ? "تحریر بھیجیے" : LG === "en" ? "Send your work" : "रचना भेजिए"}</a> · <a href="/hamsafar/" style="color:var(--geru)">${LG === "ur" ? "ہم سفر" : LG === "en" ? "Hamsafar" : "हमसफ़र"}</a> · <a href="/niti/" style="color:var(--geru)">${T.policy}</a> · <a href="/nijta/" style="color:var(--geru)">${T.privacy}</a> · <a href="${PRE}/purane/" style="color:var(--geru)">${T.archive}</a> · ${LANGS.filter(l => l !== LG).map(l => `<a href="${pageIn(l)}" lang="${l}" style="color:var(--geru)">${LANGNAME[l]}</a>`).join(" · ")}</span>
  </footer>
  <p class="ginti" id="ginti" hidden></p>
</div>
<nav class="tabbar" aria-label="${B}">
  <a href="${PRE}/" class="${tab === "home" ? "on" : ""}"><b>${T.tabHome[0]}</b>${T.tabHome[1]}</a>
  <a href="${PRE}/shreni/sahitya/" class="${catOn === "साहित्य" ? "on" : ""}"><b>${T.tabLit[0]}</b>${T.tabLit[1]}</a>
  <a href="${PRE}/purane/" class="${tab === "purane" ? "on" : ""}"><b>${T.tabArch[0]}</b>${T.tabArch[1]}</a>
  <a href="${PRE}/mera/" class="${tab === "mera" ? "on" : ""}"><b>${T.tabMine[0]}</b>${T.tabMine[1]}</a>
</nav>
<div class="overlay" id="ov" hidden>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t">
    <h3 id="sh-t">${T.sheetT}</h3>
    <ul>${T.sheet.map(x => `<li>${x}</li>`).join("")}</ul>
    <form id="sif">
      <label for="si-name">${T.name}</label><input id="si-name" type="text" required autocomplete="name">
      <label for="si-mail">${T.email}</label><input id="si-mail" type="email" required autocomplete="email">
      <p class="note">${T.noPass}</p>
      <div class="acts"><button class="btn" type="submit">${T.join}</button><button class="ghost" type="button" id="si-x">${T.notNow}</button></div>
    </form>
  </div>
</div>
<div class="sov" id="sov" hidden>
  <div class="sbox" role="dialog" aria-modal="true" aria-label="${SR[LG].t}">
    <div class="sin"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><input id="sq" type="search" aria-label="${SR[LG].ph}" aria-controls="sres" placeholder="${SR[LG].ph}" autocomplete="off" enterkeyhint="search"><button type="button" class="sx" id="sclose" aria-label="${SR[LG].close}">✕</button></div>
    <div class="shint" id="shint">${SR[LG].hint}</div>
    <ol class="sres" id="sres" aria-live="polite" aria-busy="false"></ol>
  </div>
</div>
<a class="totop" href="#top" id="totop" aria-label="${LG === "en" ? "Back to top" : LG === "ur" ? "اوپر جائیں" : "सबसे ऊपर जाएं"}" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11.5 12 5.5l6 6"/></svg><span>${LG === "en" ? "Top" : LG === "ur" ? "اوپر" : "ऊपर"}</span></a>
<script src="/art.js?v=${AV}"></script>
<script src="/client.js?v=${AV}"></script>
</body>
</html>`;
}

const AV = require("crypto").createHash("md5").update(["src/styles.css", "src/client.js", "src/art.js", "src/akhbar.css"].map(f => fs.readFileSync(f, "utf8")).join("")).digest("hex").slice(0, 8);
const SHOW_PAPER = true;
const SR = {
  hi: { ph: "कोई ख़बर, लेखक, जगह या मुद्दा खोजिए", t: "खोज", close: "बंद करें", hint: "जैसे: मज़दूर, बिहार, PARI, ग़ज़ा, किसान" },
  en: { ph: "Search a story, writer, place or issue", t: "Search", close: "Close", hint: "For example: workers, Bihar, PARI, Gaza, farmers" },
  ur: { ph: "کوئی خبر، مصنف، جگہ یا مسئلہ تلاش کیجیے", t: "تلاش", close: "بند کریں", hint: "جیسے: مزدور، بہار، غزہ، کسان" }
};
const searchText = a => [...(a.body || []), ...(a.nazar || []), a.sawal || "", ...(a.ref || []).flat(), a.place || "", a.note || ""].join(" ");
const searchIndex = () => JSON.stringify([
  ...all.map(a => ({ u: href(a), h: a.h, d: a.dek || "", c: cn(a.cat), k: a.cat, p: a.pub || "", b: a.by || "", t: a.date || "", day: a.day || "", x: searchText(a) })),
  ...HS.ALL.filter(HS.has(LG)).map(w => {
    const a = LG === "hi" ? w : { ...w, ...w[LG] };
    return { u: HS.url(w, LG), h: a.h, d: a.dek || a.pull || "", c: { hi: "हमसफ़र", en: "Hamsafar", ur: "ہم سفر" }[LG], k: "साहित्य", p: BRAND[LG], b: a.by || "", t: w.date, day: w.date, x: searchText(a) };
  })
]);

/* ---------- pieces ---------- */
const card = a => `<article class="card"><a href="${href(a)}">${art(a)}<div class="ct"><p class="kicker">${cn(a.cat)}</p><h3>${esc(a.h)}</h3><p class="dek">${esc(a.dek)}</p></div></a><p class="src">${esc(a.pub)} · ${T.read(readMin(a))} · ${saveBtn(a)}</p></article>`;
const lit = a => `<article class="lit"><a href="${href(a)}">${art(a)}<div class="in"><p class="kicker">${esc(T.from(a.pub))}</p><h3>${esc(a.h)}</h3><p class="dek">${esc(a.dek)}</p></div></a><p class="src">${esc(a.by)} · ${saveBtn(a)}</p></article>`;
const lead = (L, kick) => `<section class="lead"><a href="${href(L)}" tabindex="-1">${art(L)}</a>
  <div><p class="kicker">${kick} · ${cn(L.cat)}</p><a href="${href(L)}"><h2>${esc(L.h)}</h2></a><p class="dek">${esc(L.dek)}</p>
    <div class="row"><span>${T.orig}: ${esc(L.by)} · ${esc(L.pub)} · ${esc(L.date)}</span><span>${T.read(readMin(L))} · ${T.listen(listenMin(L))}</span>${saveBtn(L)}</div>
    <div class="sawal"><small>${T.question}</small><p>${esc(L.sawal)}</p></div></div></section>`;

const heroSize = h => { const n = [...new Intl.Segmenter("hi", { granularity: "grapheme" }).segment(String(h || ""))].length; return n <= 24 ? "h-s" : n <= 34 ? "h-m" : n <= 46 ? "h-l" : "h-xl"; };
function splitHead(h) {
  let i = h.indexOf(":"); if (i < 0) i = h.indexOf(","); if (i < 0) i = h.indexOf("،");
  if (i > 0 && i < h.length - 4) return [h.slice(0, h[i] === ":" ? i : i + 1).trim(), h.slice(i + 1).trim()];
  const w = h.split(" "); return [w.slice(0, 2).join(" "), w.slice(2).join(" ")];
}
const heroText = (L, kick) => { const [a1, a2] = splitHead(L.h); return `
    <p class="kicker">${kick} · ${cn(L.cat)}</p>
    <a href="${href(L)}"><h2 class="hero-h"><span class="acc">${esc(a1)}</span> ${esc(a2)}</h2></a>`; };
const ankBlock = L => L.ank && L.ank.length ? `<div class="ank">${L.ank.slice(0, 2).map(([n, t]) => `<div><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>` : "";
const heroFoot = L => `<p class="dek">${esc(L.dek)}</p>
    <div class="hero-foot">
      <div class="hero-open"><p>${esc(L.body[0])}</p><a class="hero-more" href="${href(L)}">${T.readFull}</a></div>
      <aside class="sawal"><small>${T.question}</small><p>${esc(L.sawal)}</p></aside>
    </div>
    <div class="row"><span>${T.orig}: ${esc(L.by)} · ${esc(L.pub)} · ${esc(L.date)}</span><span>${T.read(readMin(L))} · ${T.listen(listenMin(L))}</span>${saveBtn(L)}</div>`;
function chartSVG(c) {
  const W = 640, H = 420, pad = 56, base = H - 64, max = Math.max(...c.bars.map(b => b[1])) * 1.12, bw = (W - pad * 2) / c.bars.length;
  const bars = c.bars.map(([lab, v], k) => { const h = (v / max) * (base - 40), x = pad + k * bw + bw * .14, w = bw * .72, last = k === c.bars.length - 1;
    return `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" class="${last ? "bar-hi" : "bar"}"/><text x="${x + w / 2}" y="${base - h - 14}" class="bar-v">${v}</text><text x="${x + w / 2}" y="${base + 34}" class="bar-l">${esc(lab)}</text>`; }).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}"><line x1="${pad - 10}" y1="${base}" x2="${W - pad + 10}" y2="${base}" class="axis"/>${bars}</svg>`;
}
const dayNo = d => Math.floor(Date.parse(d + "T00:00:00Z") / 864e5);
const heroPick = d => { const t = new Date(d + "T00:00:00Z"); if (t.getUTCDay() === 0) return 0; const n = dayNo(d); return [1, 2, 3, 4, 5, 6][(n + Math.floor(n / 7)) % 6]; };
/* ख़बरों की प्रस्तुति: तारीख़ से तय, लगातार दो दिन अलग (वर्ग gv0-3 ग्रिड के लिए, kv0-3 ख़बर-सूची के लिए) */
const presPick = (d, n) => { const k = dayNo(d); const gv = (k + Math.floor(k / 4)) % 4, kv = (k + Math.floor(k / 5)) % 4;
  const ok = (v, c) => v === 1 && !(c >= 6 && c % 3 === 0) ? 2 : v;
  return { vichar: ok(gv, n.vichar), pari: ok((gv + 2) % 4, n.pari), khabar: kv }; };
function hero(L, kick = T.bigDebate) {
  const type = LG === "ur" && L.hero === "shabd" ? "poster" : (L.hero || "poster");
  if (type === "shabd" && L.shabd) return `<section class="hero hero-shabd">
    <a class="shabd-art" href="${href(L)}" tabindex="-1">${art(L, "", L.shabd)}</a>
    <div class="shabd-grid"><div>${heroText(L, kick)}${ankBlock(L)}</div><div>${heroFoot(L)}</div></div></section>`;
  if (type === "ank" && L.chart) return `<section class="hero hero-ank">
    <div class="ank-text">${heroText(L, kick)}${heroFoot(L)}</div>
    <figure class="ank-chart"><figcaption><b>${esc(L.chart.title)}</b><span>${esc(L.chart.unit)}</span></figcaption>${chartSVG(L.chart)}<p class="ank-note">${esc(L.chart.note || "")}</p></figure></section>`;
  /* हर दिन नया आमुख: रविवार को रविवारी रूप, बाक़ी दिन छह रूपों में तारीख़ के हिसाब से घूमता है; लगातार दो दिन एक-सा नहीं */
  const wd = process.env.HERO_DAY !== undefined ? +process.env.HERO_DAY : heroPick(L.day || today.date);
  const A = (cls) => `<a class="${cls}" href="${href(L)}" tabindex="-1">${art(L)}</a>`;
  const cr = L.photo ? `<span class="hero-credit">${credit(L)}</span>` : "";
  if (wd === 0) return `<section class="hero hero-ravi"><div class="hrv-cover">${A("hrv-art")}<span class="hrv-shade" aria-hidden="true"></span><span class="hrv-stamp" aria-hidden="true">${T.sunday}</span><div class="hrv-title">${heroText(L, kick)}</div></div>${cr}
    <div class="hrv-read">${ankBlock(L)}${heroFoot(L)}</div></section>`;
  if (wd === 2) return `<section class="hero hero-banner"><div class="hb-top">${heroText(L, kick)}</div><div class="hb-strip">${A("hb-art")}${ankBlock(L)}</div>${cr}<div class="hb-foot">${heroFoot(L)}</div></section>`;
  if (wd === 3) return `<section class="hero hero-sun">${A("hs-art")}<div class="hero-text">${heroText(L, kick)}${ankBlock(L)}${heroFoot(L)}${cr}</div></section>`;
  if (wd === 4) return `<section class="hero hero-ink"><div class="hero-text">${heroText(L, kick)}${ankBlock(L)}${heroFoot(L)}</div><div class="hi-side">${A("hi-art")}${cr}</div></section>`;
  if (wd === 5) return `<section class="hero hero-q"><div class="hq-top">${A("hq-art")}<div class="hq-q"><small>${T.question}</small><p>${esc(L.sawal)}</p></div></div>${cr}
    <div class="hq-body"><div>${heroText(L, kick)}${ankBlock(L)}</div><div>${heroFoot(L)}</div></div></section>`;
  if (wd === 6) return `<section class="hero hero-red"><div class="hr-block">${heroText(L, kick)}${ankBlock(L)}</div>${A("hr-art")}<div class="hr-foot">${cr}${heroFoot(L)}</div></section>`;
  return `<section class="hero">
  <a class="hero-art" href="${href(L)}" tabindex="-1">${art(L)}</a><span class="hero-slash" aria-hidden="true"></span>${L.photo ? `<span class="hero-credit">${credit(L)}</span>` : ""}
  <div class="hero-text">${heroText(L, kick)}${ankBlock(L)}${heroFoot(L)}</div></section>`;
}

const CARTOONS = (fs.existsSync("data/cartoons") ? fs.readdirSync("data/cartoons").filter(f => f.endsWith(".json")).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse() : []).map(f => JSON.parse(fs.readFileSync(path.join("data/cartoons", f), "utf8")));
const TOON = { hi: ["तिरछी नज़र", "का कार्टून", "कार्टून बड़ा देखें"], en: ["Sideways Glance", "'s cartoon", "See it large"], ur: ["ترچھی نظر", " کا کارٹون", "کارٹون بڑا دیکھیں"] };
const LATEST_DAY = DAYS_HI.map(d => d.date).sort().pop();
const PUB_TOONS = CARTOONS.filter(c => c.date <= LATEST_DAY);
const ARTIST_UR = { "Rajendra Dhodapkar": "راجندر دھوڑپکر" };
const toonL = c => { if (LG === "hi") return c; const f = path.join("data/i18n", LG, "cartoon-" + c.date + ".json"); const t = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {}; const ar = LG === "ur" ? (ARTIST_UR[c.artist_en] || c.artist_en || c.artist) : (c.artist_en || c.artist); return { ...c, ...t, artist: ar, chutki: t.chutki || null }; };
const TC = { hi: { read: "पूरी चुटकी पढ़ें →", fine: a => `कार्टून के सारे अधिकार ${a} के हैं। देशकाल पर उनकी अनुमति से।`, k: "देशकाल की चुटकी", between: "रेखाओं<br>के बीच", on: a => `${a} के कार्टून पर`, more: "और कार्टून", of: a => `${a} का कार्टून` }, en: { read: "Read the full note →", fine: a => `All rights in the cartoon belong to ${a}. On Deshkaal with his permission.`, k: "Deshkaal's note", between: "Between<br>the lines", on: a => `On ${a}'s cartoon`, more: "More cartoons", of: a => `${a}'s cartoon` }, ur: { read: "پوری چٹکی پڑھیں ←", fine: a => `کارٹون کے سارے حقوق ${a} کے پاس ہیں۔ دیشکال پر ان کی اجازت سے۔`, k: "دیشکال کی چٹکی", between: "لکیروں<br>کے بیچ", on: a => `${a} کے کارٹون پر`, more: "اور کارٹون", of: a => `${a} کا کارٹون` } };
const toonFor = date => PUB_TOONS.find(c => c.date === date);
const toonBand = c0 => { const c = toonL(c0), K = TC[LG]; return `<section class="toon">
  <div class="toon-head"><h3>${TOON[LG][0]}</h3><p><b>${esc(c.artist)}</b>${TOON[LG][1]}</p>${c.chutki ? `<p class="toon-tease">${esc(c.chutki[0].split(LG === "ur" ? "۔" : LG === "en" ? ". " : "।")[0])}${LG === "ur" ? "۔" : LG === "en" ? "." : "।"}</p><a class="toon-read" href="${PRE}/cartoon/${c.date}/">${K.read}</a>` : ""}</div>
  <figure class="toon-board"><a class="toon-frame" href="${PRE}/cartoon/${c.date}/" aria-label="${TOON[LG][2]}"><span class="toon-tape l" aria-hidden="true"></span><span class="toon-tape r" aria-hidden="true"></span><img src="${c.img}" width="${c.w}" height="${c.h}" alt="${esc(c.alt)}" loading="lazy"></a>
  <figcaption><span class="toon-sig">${esc(c.artist)}</span><span>${dayLabel(c.date)}</span></figcaption></figure></section>`; };

function cartoonPage(c0) {
  const c = toonL(c0), K = TC[LG], others = PUB_TOONS.filter(x => x !== c0).slice(0, 8).map(toonL), u = encodeURIComponent(`${SITE}${PRE}/cartoon/${c.date}/`), t = encodeURIComponent(`${TOON[LG][0]}: ${K.of(c.artist)}`);
  const body = `<section class="toon-page"><a class="back" href="${PRE}/">${T.back}</a>
    <p class="kicker" style="margin-top:22px">${TOON[LG][0]} · ${dayLabel(c.date)}</p><h1>${esc(K.of(c.artist))}</h1>
    <figure class="toon-board big"><a class="toon-frame" href="${c.img}" target="_blank" rel="noopener"><span class="toon-tape l"></span><span class="toon-tape r"></span><img src="${c.img}" width="${c.w}" height="${c.h}" alt="${esc(c.alt)}"></a><figcaption><span class="toon-sig">${esc(c.artist)}</span><span>${esc(c.subject || "")}</span></figcaption></figure>
    <div class="share" data-url="${SITE}${PRE}/cartoon/${c.date}/" data-title="${TOON[LG][0]}"><span class="share-l">${T.share}</span><a class="sh" href="https://wa.me/?text=${t}%0A${u}" target="_blank" rel="noopener">WhatsApp</a><a class="sh" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener">Telegram</a><a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener">X</a><a class="sh" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">Facebook</a></div>
    ${c.chutki ? `<aside class="toon-chutki"><div class="tc-side"><span class="tc-k">${K.k}</span><h3>${K.between}</h3><svg class="tc-squiggle" viewBox="0 0 160 14" aria-hidden="true"><path d="M2 8 C 22 1, 32 13, 52 7 S 82 1, 102 8 S 132 13, 158 5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><p class="tc-note">${esc(K.on(c.artist))}</p></div><div class="tc-text">${c.chutki.map(p => `<p>${esc(p)}</p>`).join("")}</div></aside>` : ""}
    <p class="fine">${esc(K.fine(c.artist))}</p>
    ${others.length ? `<h3 class="toon-more">${K.more}</h3><div class="toon-grid">${others.map(o => `<a href="${PRE}/cartoon/${o.date}/"><img src="${o.img}" alt="${esc(o.alt)}" loading="lazy"><span>${dayLabel(o.date)}</span></a>`).join("")}</div>` : ""}</section>`;
  const available = LANGS.filter(l => l === "hi" || fs.existsSync(path.join("data/i18n", l, "cartoon-" + c.date + ".json")));
  return layout({ title: `${TOON[LG][0]}: ${K.of(c.artist)}, ${dayLabel(c.date)}`, desc: c.alt, url: `${PRE}/cartoon/${c.date}/`, body, image: c.img, published: c.date, alt: languageURLs(`/cartoon/${c.date}/`, available), noindex: !available.includes(LG) });
}

const connect = () => `<section class="band">
  <div><h4>${T.sunT}</h4><p>${T.sunP}</p><div class="act"><span class="chip">${T.sunChip}</span></div></div>
  <div><h4>${T.mailT}</h4><p>${T.mailP}</p><div class="act"><form class="sub" id="subf"><input id="email" type="email" required placeholder="aapka@email.com" aria-label="${T.email}"><button class="btn">${T.join}</button></form></div><p class="note" id="subnote"></p></div>
  <div><h4>${T.chanT}</h4><p>${T.chanP}</p><div class="act">${chanBtn("whatsapp","WhatsApp")}${chanBtn("telegram","Telegram")}</div></div>
</section>
<section class="appband"><svg class="appicon" viewBox="0 0 72 72" aria-hidden="true"><rect width="72" height="72" rx="18" class="ai-bg"/><circle cx="36" cy="36" r="23" class="ai-sun"/><text x="36" y="36" text-anchor="middle" dominant-baseline="central" class="ai-t">दे</text></svg>
  <div><h4>${T.appT}</h4>
  <ol><li>${T.app1}</li><li>${T.app2}</li></ol>
  <button class="btn" id="install" hidden style="margin-top:10px">${T.appBtn}</button></div></section>`;

function morchaSet(ds, upto) {
  if (!SPECIAL.active) return null;
  const d = ds.find(x => x.date <= upto && x.date >= (SPECIAL.since || "") && x.items.some(a => a.sec === "morcha"));
  if (!d) return null;
  const its = d.items.filter(a => a.sec === "morcha"), lead = its.find(a => a.lead) || its[0], rest = its.filter(a => a !== lead);
  return { day: d.date, lead, six: rest.slice(0, 6), more: rest.slice(6) };
}
const morchaAll = () => all.filter(a => a.sec === "morcha");
function morchaBand(M) {
  const voice = (a, i) => `<article class="mv"><span class="mv-n">${i + 1}</span><a href="${href(a)}"><p class="mv-by">${esc(a.by)}<small>${esc(a.pub)}</small></p><h4>${esc(a.h)}</h4><p class="dek">${esc(a.dek)}</p></a><p class="src">${esc(a.date)} · ${T.read(readMin(a))} · ${saveBtn(a)}</p></article>`;
  const n = morchaAll().length;
  return `<div class="morcha"><div class="sechead sec-morcha"><h3>${T.sec.morcha[0]}</h3><p>${T.sec.morcha[1]}</p></div>
  <div class="mvgrid">${M.six.map(voice).join("")}</div>
  ${M.more.length ? `<div class="mvmore"><h5>${T.morchaMore}</h5>${M.more.map(a => `<a href="${href(a)}"><b>${esc(a.by)}</b> · ${esc(a.h)}</a>`).join("")}</div>` : ""}
  <a class="mvall" href="${PRE}/morcha/">${T.morchaAll(n)}</a></div>`;
}
function morchaPage() {
  const list = morchaAll(), groups = [...new Set(list.map(a => a.day))];
  const body = `<section class="page2 morcha-page"><p class="kicker">${T.special}</p><h2>${T.sec.morcha[0]}</h2><p class="mp-intro">${T.morchaIntro}</p>
    ${groups.map(g => `<div class="aday"><h4>${dayLabel(g)}</h4>${list.filter(a => a.day === g).map(a => `<div class="arow"><span class="k">${a.lead ? T.sec.amukh[0] : esc(a.pub)}</span><a href="${href(a)}"><h4>${esc(a.h)}</h4><span class="src" style="display:block;margin-top:4px">${esc(a.by)} · ${esc(a.pub)} · ${esc(a.date)}</span></a></div>`).join("")}</div>`).join("")}</section>`;
  return layout({ title: T.sec.morcha[0], desc: T.sec.morcha[1], url: PRE + "/morcha/", body, alt: { hi: "/morcha/", en: "/en/morcha/", ur: "/ur/morcha/" } });
}

const LIVE_DAYS = fs.existsSync("data/live") ? fs.readdirSync("data/live").filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse().map(f => ({ date: f.slice(0, 10), ...JSON.parse(fs.readFileSync(path.join("data/live", f), "utf8")) })) : [];
const LIVE_ON = SPECIAL.active && LIVE_DAYS.length > 0;
const IST_TODAY = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const PAHAR = { hi: ["रात", "सुबह", "दोपहर", "शाम", "रात"], en: ["am", "am", "pm", "pm", "pm"], ur: ["رات", "صبح", "دوپہر", "شام", "رات"] };
const clockParts = (t, lg = LG) => { const m = /T?(\d{2}):(\d{2})/.exec((t || "").slice(10)) || /(\d{2}):(\d{2})/.exec(t || ""); if (!m) return null;
  const H = +m[1], h = H % 12 || 12, i = H < 4 ? 0 : H < 12 ? 1 : H < 16 ? 2 : H < 19 ? 3 : 4; return { hm: `${h}:${m[2]}`, p: PAHAR[lg][i] }; };
const clock = (t, lg = LG) => { const c = clockParts(t, lg); return !c ? "" : lg === "en" ? `${c.hm} ${c.p}` : `${c.p} ${c.hm}`; };
const clockTag = (t, extra = "") => { const c = clockParts(t); return c ? `<time datetime="${esc(t)}">${extra}<b>${c.hm}</b><small>${c.p}</small></time>` : ""; };
const LIVE_TODAY = () => LIVE_DAYS.find(d => d.date === IST_TODAY);
const lastUpdate = () => [SPECIAL.updated || "", (LIVE_TODAY() || {}).updated || ""].filter(Boolean).sort().pop() || "";
const LV = {
  hi: { play: "चलाएं", badge: "लाइव", yt: "YouTube पर", unv: "अपुष्ट", F: [["all", "सब"], ["video", "देखिए"], ["reel", "रील्स"], ["update", "पल-पल"], ["post", "सोशल मीडिया"], ["news", "ख़बरें"]], kick: d => `लाइव · ${d}`, title: "सड़क की संसद", sub: "वोट चोरी के ख़िलाफ़ आंदोलन, पल-पल। अख़बारों, चैनलों और सोशल मीडिया से छांटकर, जांचकर, एक दीवार पर।", last: "आख़िरी अपडेट", newBtn: "नये अपडेट आये हैं, देखिए ↻", analysis: "विश्लेषण पढ़िए →", pinK: "आज की बड़ी बात", full: n => `${n} पर पूरी पोस्ट →`, reelAria: "रील चलाएं", views: n => `${n} बार देखी गयी`, igOn: "Instagram पर →", filt: "छांटिए", r3k: "चलती तस्वीरें, सीधे लाइव", r3b: "सड़क से आती लाइव स्ट्रीम एक साथ, एक स्क्रीन पर: r3con.net", r3s: "YouTube, Instagram और X की सार्वजनिक लाइव स्ट्रीम दिखाने वाला खुला बोर्ड · देशकाल से अलग, बाहरी साइट · यहीं खुलेगा", updH: "पल-पल", reelsH: "रील्स", reelsSub: "आंदोलन पर बन रही रीलें, सरहद के इस पार और उस पार से", newsH: "ख़बरें", xH: "X पर", xN: n => `${n} पोस्ट, नीचे सरकाइए`, empty: "आज की दीवार अभी ख़ाली है।", emptyP: "पहला अपडेट सुबह 9:37 पर आएगा, फिर हर घंटे।", prev: "पिछले दिनों की दीवार:", none: "अभी कोई नहीं", today: "आज की दीवार →", note: "यह दीवार देशकाल हर कुछ घंटे में ताज़ा करता है। हर चीज़ अपने मूल स्रोत से जुड़ी है; जो बात सिर्फ़ एक पक्ष या एक स्रोत से आयी है, उस पर \"अपुष्ट\" लिखा है। वीडियो और पोस्ट उनके बनाने वालों के हैं।", tAll: "लाइव: सड़क की संसद", tDay: d => `सड़क की संसद: ${d} की दीवार`, desc: "वोट चोरी के ख़िलाफ़ आंदोलन पर पल-पल की ख़बर, वीडियो और सोशल मीडिया, एक जगह।" },
  en: { play: "Play", badge: "LIVE", yt: "On YouTube", unv: "Unverified", F: [["all", "All"], ["video", "Watch"], ["reel", "Reels"], ["update", "Minute by minute"], ["post", "Social media"], ["news", "News"]], kick: d => `Live · ${d}`, title: "Parliament of the Street", sub: "The movement against vote theft, minute by minute. Picked and checked from newspapers, channels and social media, on one wall.", last: "Last update", newBtn: "New updates are in, see them ↻", analysis: "Read the analysis →", pinK: "Top story today", full: n => `Full post on ${n} →`, reelAria: "Play reel", views: n => `${n} views`, igOn: "On Instagram →", filt: "Filter", r3k: "Moving pictures, live", r3b: "Live streams from the street, together on one screen: r3con.net", r3s: "An open board showing public live streams from YouTube, Instagram and X · separate from Deshkaal, an outside site · opens here", updH: "Minute by minute", reelsH: "Reels", reelsSub: "Reels being made on the movement, from both sides of the border", newsH: "News", xH: "On X", xN: n => `${n} posts, scroll down`, empty: "Today's wall is still empty.", emptyP: "The first update will come at 9:37 am, then every hour.", prev: "Walls of earlier days:", none: "None yet", today: "Today's wall →", note: "Deshkaal refreshes this wall every few hours. Everything is linked to its original source; anything that has come from only one side or one source is marked \"Unverified\". Videos and posts belong to their makers.", tAll: "Live: Parliament of the Street", tDay: d => `Parliament of the Street: wall of ${d}`, desc: "Minute-by-minute news, video and social media on the movement against vote theft, in one place." },
  ur: { play: "چلائیے", badge: "لائیو", yt: "یوٹیوب پر", unv: "غیر مصدقہ", F: [["all", "سب"], ["video", "دیکھیے"], ["reel", "ریلز"], ["update", "لمحہ بہ لمحہ"], ["post", "سوشل میڈیا"], ["news", "خبریں"]], kick: d => `لائیو · ${d}`, title: "سڑک کی سنسد", sub: "ووٹ چوری کے خلاف تحریک، لمحہ بہ لمحہ۔ اخباروں، چینلوں اور سوشل میڈیا سے چھانٹ کر، جانچ کر، ایک دیوار پر۔", last: "آخری اپ ڈیٹ", newBtn: "نئے اپ ڈیٹ آئے ہیں، دیکھیے ↻", analysis: "تجزیہ پڑھیے →", pinK: "آج کی سب سے بڑی بات", full: n => `${n} پر پوری پوسٹ →`, reelAria: "ریل چلائیے", views: n => `${n} بار دیکھی گئی`, igOn: "انسٹاگرام پر →", filt: "چھانٹیے", r3k: "چلتی تصویریں، سیدھے لائیو", r3b: "سڑک سے آتی لائیو اسٹریمیں ایک ساتھ، ایک اسکرین پر: r3con.net", r3s: "یوٹیوب، انسٹاگرام اور ایکس کی عوامی لائیو اسٹریم دکھانے والا کھلا بورڈ · دیشکال سے الگ، بیرونی سائٹ · یہیں کھلے گا", updH: "لمحہ بہ لمحہ", reelsH: "ریلز", reelsSub: "تحریک پر بن رہی ریلیں، سرحد کے اِس پار اور اُس پار سے", newsH: "خبریں", xH: "ایکس پر", xN: n => `${n} پوسٹ، نیچے سرکائیے`, empty: "آج کی دیوار ابھی خالی ہے۔", emptyP: "پہلا اپ ڈیٹ صبح 9:37 پر آئے گا، پھر ہر گھنٹے۔", prev: "پچھلے دنوں کی دیوار:", none: "ابھی کوئی نہیں", today: "آج کی دیوار →", note: "یہ دیوار دیشکال ہر کچھ گھنٹے میں تازہ کرتا ہے۔ ہر چیز اپنے اصل ماخذ سے جڑی ہے؛ جو بات صرف ایک فریق یا ایک ماخذ سے آئی ہے، اس پر \"غیر مصدقہ\" لکھا ہے۔ ویڈیو اور پوسٹ ان کے بنانے والوں کی ہیں۔", tAll: "لائیو: سڑک کی سنسد", tDay: d => `سڑک کی سنسد: ${d} کی دیوار`, desc: "ووٹ چوری کے خلاف تحریک پر لمحہ بہ لمحہ خبر، ویڈیو اور سوشل میڈیا، ایک جگہ۔" }
};
function liveL(day) {
  if (LG === "hi") return day;
  const f = path.join("data/i18n", LG, "live-" + day.date + ".json");
  if (!fs.existsSync(f)) return day;
  const t = JSON.parse(fs.readFileSync(f, "utf8"));
  return { ...day, pin: day.pin && t.pin ? { ...day.pin, ...t.pin } : day.pin,
    counters: (day.counters || []).map((c, i) => ({ ...c, ...((t.counters || [])[i] || {}) })),
    items: (day.items || []).map((x, i) => { const m = { ...x, ...((t.items || [])[i] || {}) }; if (m.views) m.views = String(m.views).replace(/लाख/g, LG === "ur" ? "لاکھ" : "lakh").replace(/हज़ार/g, LG === "ur" ? "ہزار" : "thousand").replace(/करोड़/g, LG === "ur" ? "کروڑ" : "crore"); return m; }) };
}
function livePage(latest, url) {
  const V = LV[LG]; latest = liveL(latest);
  const all = (latest.items || []).map(x => ({ ...x, day: latest.date })).sort((a, b) => (b.t || "").localeCompare(a.t || ""));
  const updated = latest.updated || (all[0] || {}).t || "";
  const hm = t => (t || "").slice(11, 16), dd = t => { const d = (t || "").slice(0, 10); return d === latest.date ? "" : dayLabel(d).split(", ")[1] + " · "; };
  const when = t => clockTag(t, dd(t) ? `<i>${dd(t)}</i>` : "");
  const unv = x => x.verified === false ? `<span class="lv-unv">${V.unv}</span>` : "";
  const vids = all.filter(x => x.kind === "video" && x.yt), reels = all.filter(x => x.kind === "reel" && x.code), ups = all.filter(x => x.kind === "update"), wall = all.filter(x => x.kind === "post" || x.kind === "news");
  const vid = (x, i) => `<article class="lv-vid${i === 0 ? " big" : ""}" data-k="video"><button class="ytlite" type="button" data-yt="${esc(x.yt)}" aria-label="${V.play}: ${esc(x.text)}"><img src="https://i.ytimg.com/vi/${esc(x.yt)}/hqdefault.jpg" alt="" loading="lazy"><span class="play" aria-hidden="true"></span>${x.live ? `<span class="lv-badge">${V.badge}</span>` : ""}</button><p>${esc(x.text)}</p><small>${esc(x.src)} · ${when(x.t)} · <a href="${esc(x.url)}" target="_blank" rel="noopener">${V.yt}</a></small></article>`;
  const up = x => `<li data-k="update">${when(x.t)}<div><p>${esc(x.text)} ${unv(x)}</p><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.src)}</a></div></li>`;
  const card = x => x.kind === "post"
    ? `<article class="lv-post" data-k="post"><div class="lv-ph"><span class="lv-net">${esc(x.net || "X")}</span><b>${esc(x.by || "")}</b><span>${esc(x.handle || "")}</span></div><p>${esc(x.text)}</p><div class="lv-ft">${when(x.t)} · <a href="${esc(x.url)}" target="_blank" rel="noopener">${V.full(esc(x.net || "X"))}</a></div></article>`
    : `<article class="lv-news" data-k="news"><span class="lv-src">${esc(x.src)}</span><h4><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.h || x.text)}</a></h4><div class="lv-ft">${when(x.t)}</div></article>`;
  const reel = x => `<article class="lv-reel" data-k="reel"><button class="lv-rplay" type="button" data-ig="${esc(x.code)}" aria-label="${V.reelAria}: ${esc(x.text)}"><span class="lv-rnet">Reels</span><span class="lv-rtext">${esc(x.text)}</span><span class="lv-rgo" aria-hidden="true"></span>${x.views ? `<span class="lv-rviews">${V.views(esc(x.views))}</span>` : ""}</button><p><b>${esc(x.by)}</b> ${esc(x.handle || "")}</p><a href="${esc(x.url)}" target="_blank" rel="noopener">${V.igOn}</a></article>`;
  const F = V.F;
  const body = `<section class="live" id="live" data-updated="${esc(updated)}">
  <header class="lv-top"><div class="lv-title"><p class="lv-kick"><span class="lv-dot" aria-hidden="true"></span>${V.kick(dayLabel(latest.date))}</p><h2>${V.title}</h2><p class="lv-sub">${V.sub}</p></div>
    <div class="lv-meta"><span>${V.last}</span><b>${clock(updated)}</b><button class="lv-new" id="lvnew" type="button" hidden>${V.newBtn}</button><a href="${PRE}/morcha/">${V.analysis}</a></div></header>
  ${latest.counters && latest.counters.length ? `<div class="lv-count">${latest.counters.map(c => `<a href="${esc(c.url)}" target="_blank" rel="noopener"><b>${esc(c.n)}</b><span>${esc(c.label)}</span><small>${esc(c.src)}</small></a>`).join("")}</div>` : ""}
  ${latest.pin ? `<aside class="lv-pin"><span class="lv-pin-k">${esc(latest.pin.k || V.pinK)}</span><h3><a href="${esc(latest.pin.url)}" target="_blank" rel="noopener">${esc(latest.pin.h)}</a></h3><p>${esc(latest.pin.text)}</p><small>${esc(latest.pin.src)}</small></aside>` : ""}
  ${all.length ? `  <nav class="lv-filter" aria-label="${V.filt}">${F.map(([k, l], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${l}</button>`).join("")}</nav>
  <a class="lv-r3 r3open" href="https://r3con.net/" target="_blank" rel="noopener"><span class="lv-r3-k">${V.r3k}</span><b>${V.r3b}</b><small>${V.r3s}</small></a>
  <div class="lv-main">
    <div class="lv-vids" data-k="video">${vids.map(vid).join("")}</div>
    <aside class="lv-time" data-k="update"><h3>${V.updH}</h3><ol>${ups.map(up).join("")}</ol></aside>
  </div>
  ${reels.length ? `<section class="lv-reels" data-k="reel"><h3>${V.reelsH} <small>${V.reelsSub}</small></h3><div class="lv-rrow">${reels.map(reel).join("")}</div></section>` : ""}
  <div class="lv-wall"><div class="lv-newsfeed"><h3>${V.newsH}</h3><div class="lv-ncols">${wall.filter(x => x.kind === "news").map(card).join("")}</div></div>
    <aside class="lv-xfeed"><h3>${V.xH} <small>${V.xN(wall.filter(x => x.kind === "post").length)}</small></h3><div class="lv-xbox"><div class="lv-xlist">${wall.filter(x => x.kind === "post").map(card).join("")}</div></div></aside></div>
` : ""}
  ${!all.length ? `<div class="lv-empty"><b>${V.empty}</b><p>${V.emptyP}</p></div>` : ""}
  <nav class="lv-days"><span>${V.prev}</span>${LIVE_DAYS.filter(d => d.date !== latest.date).map(d => `<a href="${PRE}/live/${d.date}/">${dayLabel(d.date)}</a>`).join("") || `<em>${V.none}</em>`}${url !== "/live/" ? `<a href="${PRE}/live/">${V.today}</a>` : ""}</nav>
  <p class="lv-note">${V.note}</p>
</section>`;
  const available = LANGS.filter(l => l === "hi" || !(latest.items || []).length || fs.existsSync(path.join("data/i18n", l, "live-" + latest.date + ".json")));
  return layout({ title: url === "/live/" ? V.tAll : V.tDay(dayLabel(latest.date)), desc: V.desc, url: PRE + url, body, alt: languageURLs(url, available), noindex: !available.includes(LG) });
}

function liveTeaser() {
  if (!LIVE_ON || LG !== "hi") return "";
  const d = LIVE_DAYS.find(x => x.date === IST_TODAY) || LIVE_DAYS[0];
  const its = (d.items || []).slice().sort((a, b) => (b.t || "").localeCompare(a.t || ""));
  const ups = its.filter(x => x.kind === "update").slice(0, 4), nV = its.filter(x => x.kind === "video" || x.kind === "reel").length, nP = its.filter(x => x.kind === "post" || x.kind === "news").length;
  return `<section class="lvt"><div class="lvt-head"><p class="lvt-k"><i aria-hidden="true"></i>लाइव दीवार${lastUpdate() ? ` · अपडेट ${clock(lastUpdate())}` : ""}</p><h3>आंदोलन, पल-पल</h3>
    <div class="lvt-btns"><a class="lvt-go" href="/live/">लाइव दीवार खोलिए →</a><a class="lvt-r3 r3open" href="https://r3con.net/" target="_blank" rel="noopener">▶ चलती तस्वीरें: r3con</a></div></div>
    ${ups.length ? `<ol class="lvt-list">${ups.map(x => `<li>${clockTag(x.t)}<span>${esc(x.text)}${x.verified === false ? ` <em>अपुष्ट</em>` : ""}</span></li>`).join("")}</ol>` : (d.counters || []).length ? `<div class="lvt-count">${d.counters.slice(0, 3).map(c => `<div><b>${esc(c.n)}</b><span>${esc(c.label)}</span></div>`).join("")}</div>` : ""}</section>`;
}

/* ---------- pages ---------- */
function homePage() {
  const by = k => today.items.filter(a => a.sec === k);
  const M = morchaSet(days, today.date), vis = by("amukh").filter(a => a.visesh), amukh = by("amukh").filter(a => !a.visesh)[0];
  const L = M ? M.lead : amukh || today.items.find(a => a.sec !== "sahitya");
  const vichar = M && amukh ? [amukh, ...by("vichar")] : by("vichar"), khabar = by("khabar"), lits = by("sahitya");
  
  /* गांव-जवार: PARI, ख़बर लहरिया और अन्य ग्रामीण पत्रकारिता (sec "pari") */
  const pari = today.items.filter(a => isRuralReport(a));
  
  const vid = all.find(a => a.sec === "video");
  const PV = presPick(today.date, { vichar: vichar.length, pari: pari.length });
  const head = k => `<div class="sechead sec-${k}"><h3>${T.sec[k][0]}</h3><p>${T.sec[k][1]}</p></div>`;
  const kRow = a => `<article><a href="${href(a)}"><p class="kicker">${cn(a.cat)} · ${esc(a.pub)}</p><h4>${esc(a.h)}</h4><p class="dek">${esc(a.dek)}</p></a><p class="src">${esc(a.by)} · ${esc(a.date)} · ${saveBtn(a)}</p></article>`;
  const NT = fs.existsSync("data/notice.json") ? JSON.parse(fs.readFileSync("data/notice.json", "utf8")) : null;
  const notice = NT && NT.date === IST_TODAY && NT[LG] ? `<aside class="notice" data-date="${NT.date}"><span class="nt-k">${LG === "en" ? "A note" : LG === "ur" ? "ایک گزارش" : "एक गुज़ारिश"}</span><p>${esc(NT[LG])}</p></aside>` : "";
  const body = `${notice}<div class="lastread" id="lastread" hidden></div>${M ? `<section class="special"><div class="morcha-rib"><span class="mr-tag">${T.special}</span><b>${T.sec.morcha[0]}</b><span class="mr-live"><i></i>${T.live}${lastUpdate() ? " · " + T.updatedAt(clock(lastUpdate())) : ""}</span>${LIVE_ON ? `<a class="mr-wall" href="/live/">${T.liveWall}</a>` : ""}</div>` : ""}${hero(L, (M ? T.sec.morcha[0] : T.sec.amukh[0]) + (L.by ? " · " + esc(L.by) : ""))}
  ${M ? liveTeaser() + morchaBand(M) + "</section>" : liveTeaser()}
  ${vis.length ? `<section class="visesh-band"><div class="sechead sec-visesh"><h3>${LG === "en" ? "Special feature" : LG === "ur" ? "خصوصی تحریر" : "विशेष आलेख"}</h3><p>${LG === "en" ? "One piece worth a pause" : LG === "ur" ? "ایک تحریر جو ٹھہر کر پڑھنے کی ہے" : "एक टिप्पणी, जो ठहरकर पढ़ने लायक़ है"}</p></div>${vis.map(a => `<article class="visesh"><a href="${href(a)}">${art(a)}<div class="in"><p class="kicker">${cn(a.cat)} · ${esc(a.by)}</p><h3>${esc(a.h)}</h3><p class="dek">${esc(a.dek)}</p><span class="vmore">${LG === "en" ? "Read the piece →" : LG === "ur" ? "پوری تحریر پڑھیں ←" : "पूरा आलेख पढ़ें →"}</span></div></a></article>`).join("")}</section>` : ""}
  ${vichar.length ? `<section class="vichar">${head("vichar")}<div class="grid g3 gv${PV.vichar}">${vichar.map(card).join("")}</div></section>` : ""}
  ${khabar.length ? `<section class="khabar">${head("khabar")}<div class="clist kv${PV.khabar}">${khabar.map(kRow).join("")}</div></section>` : ""}
  ${pari.length ? `<section class="pariband">${head("pari")}<div class="grid g3 gv${PV.pari}">${pari.map(card).join("")}</div></section>` : ""}
  ${vid ? videoBand(vid) : ""}
  ${lits.length ? `<section class="litband">${head("sahitya")}<div class="litgrid">${lits.map(lit).join("")}</div></section>` : ""}
  ${toonFor(today.date) ? toonBand(toonFor(today.date)) : ""}
  ${HS.band(LG)}
  ${connect()}`;
  return layout({ title: "", desc: T.homeDesc(dayLabel(today.date), today.items.length), url: PRE + "/", body, tab: "home", catOn: "सब", alt: { hi: "/", en: "/en/", ur: "/ur/" } });
}

const isVid = a => !!(a.yt || a.ia);
const ytThumb = a => a.poster || (a.ia ? `https://archive.org/services/img/${a.ia}` : `https://i.ytimg.com/vi/${a.yt}/hqdefault.jpg`);
const vidOpen = a => a.ia ? `https://archive.org/details/${a.ia}` : `https://www.youtube.com/watch?v=${a.yt}`;
const videoBand = a => `<section class="ytband"><div class="sechead"><h3>${T.sec.video[0]}</h3><p>${T.sec.video[1]}</p></div>
  <a class="ytcard" href="${href(a)}"><span class="ytthumb"><img src="${ytThumb(a)}" alt="" loading="lazy" width="480" height="360"><span class="play" aria-hidden="true"></span>${a.dur ? `<span class="dur">${esc(a.dur)}</span>` : ""}</span>
  <span class="yttext"><span class="kicker">${cn(a.cat)} · ${esc(a.by)}</span><span class="yth">${esc(a.h)}</span><span class="dek">${esc(a.dek)}</span><span class="ytmore">${T.watchRead}</span></span></a></section>`;
const ytEmbed = a => `<figure class="ytembed"><button class="ytlite" type="button" ${a.ia ? `data-ia="${esc(a.ia)}"` : `data-yt="${esc(a.yt)}"`} aria-label="${T.watch}: ${esc(a.h)}"><img src="${ytThumb(a)}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span></button><figcaption class="cap">${esc(a.by)} · ${esc(a.pub)}${a.dur ? " · " + esc(a.dur) : ""} · <a href="${esc(vidOpen(a))}" target="_blank" rel="noopener">${a.ia ? T.ytOpen.replace("YouTube", "Internet Archive") : T.ytOpen}</a></figcaption></figure>`;
function catPage(c) {
  const list = all.filter(a => a.cat === c);
  let body;
  if (!list.length) body = `<p class="empty">${T.catEmpty(cn(c))}</p>`;
  else { const [L, ...rest] = list; body = hero(L, T.latest) + (rest.length ? `<section class="grid">${rest.map(card).join("")}</section>` : ""); }
  const u = l => `${l === "hi" ? "" : "/" + l}/shreni/${SLUG[c]}/`;
  return layout({ title: cn(c), desc: T.catDesc(cn(c)), url: u(LG), body, catOn: c, alt: { hi: u("hi"), en: u("en"), ur: u("ur") } });
}
const shareBlock = a => { const u = encodeURIComponent(SITE + href(a)), t = encodeURIComponent(a.h);
  return `<div class="share" data-url="${SITE}${href(a)}" data-title="${esc(a.h)}"><span class="share-l">${T.share}</span>
    <button class="sh sh-native" type="button" hidden>${T.shareNative}</button>
    <a class="sh" href="https://wa.me/?text=${t}%0A${u}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="sh" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener">Telegram</a>
    <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener">X</a>
    <a class="sh" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">Facebook</a>
    <a class="sh" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener">LinkedIn</a>
    <button class="sh sh-copy" type="button">${T.copy}</button></div>`; };
function articlePage(a) {
  const others = all.filter(x => x.id !== a.id && x.cat === a.cat).concat(today.items.filter(x => x.id !== a.id && x.cat !== a.cat)).slice(0, 6);
  const data = { id: a.id, h: a.h, dek: a.dek, body: a.body };
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.h, description: a.dek, datePublished: a.day, inLanguage: LG, publisher: { "@type": "Organization", name: BRAND[LG] }, isBasedOn: a.url };
  const body = `<article class="read">
    <a class="back" href="${PRE}/">${T.back}</a>
    <p class="kicker" style="margin-top:22px"><a href="${PRE}/shreni/${SLUG[a.cat]}/">${cn(a.cat)}</a></p>
    <h1>${esc(a.h)}</h1><p class="dek">${esc(a.dek)}</p>${isVid(a) ? `<p class="ytnote">${T.ytNote}</p>` : ""}
    <div class="meta"><span>${T.orig}: <b>${esc(a.by)}</b>, ${esc(a.pub)}, ${esc(a.date)}</span>
      <span class="tools"><button class="ctl" id="listen">${T.listenBtn(listenMin(a))}</button>${saveBtn(a)}</span></div>
    ${shareBlock(a)}
    <figure class="figure" style="margin-inline:0">${art(a)}<figcaption class="cap">${T.collage}${a.photo ? " · " + credit(a) : ""}</figcaption></figure>
    ${a.intro && a.intro.length ? `<div class="body intro">${a.intro.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}<div class="body">${a.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
    <aside class="box"><h5>${T.nazar}</h5>${a.nazar.map(p => `<p>${esc(p)}</p>`).join("")}</aside>
    <aside class="sawal"><small>${T.think}</small><p>${esc(a.sawal)}</p></aside>
    ${isVid(a) ? `<h5 class="ythead">${T.watch}</h5>${ytEmbed(a)}` : ""}
    <aside class="box ref"><h5>${T.ref}</h5><dl>${a.ref.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl></aside>
    ${isVid(a) || a.visesh ? "" : `<a class="cta" href="${esc(a.url)}" target="_blank" rel="noopener"><strong>${T.cta}</strong><span>${esc(T.ctaSub(a.pub, a.lang))}</span></a>`}
    ${a.visesh ? "" : `<p class="fine">${esc(T.fine(a.pub))}</p>`}
    ${shareBlock(a)}
    ${supportEnd()}
    <div class="more"><h6>${T.next}</h6>${others.map(o => `<a href="${href(o)}">${esc(o.h)}</a>`).join("")}</div>
  </article>
  <script type="application/json" id="article-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  const alt = Object.fromEntries(LANGS.filter(l => HAS[l].has(a.id)).map(l => [l, hrefL(a, l)]));
  return layout({ title: a.h, desc: a.dek, url: href(a), body, catOn: a.cat, published: a.day, alt, image: fs.existsSync(path.join("public", "og", a.id + ".png")) ? `/og/${a.id}.png` : "/og.png" });
}
function archivePage() {
  const body = `<section class="page2"><h2>${T.archive}</h2><p style="color:var(--ink-2);margin:0">${T.archIntro}</p>
    <div class="sub" style="margin-top:20px"><input class="search" id="aq" type="search" placeholder="${T.archSearch}" aria-label="${T.archSearch}"></div>
    <div class="chips">${["सब", ...CATS].map(c => `<button class="chip" data-ac="${c}" aria-pressed="${c === "सब"}">${c === "सब" ? T.all : cn(c)}</button>`).join("")}</div>
    <p class="src" id="acount"></p>
    ${days.map(d => `<div class="aday"><h4>${dayLabel(d.date)} · ${T.count(d.items.length)}</h4>${d.items.map(a => `<div class="arow" data-cat="${a.cat}"><span class="k">${cn(a.cat)}</span><a href="${href(a)}"><h4>${esc(a.h)}</h4><span class="src" style="display:block;margin-top:4px">${esc(a.by)} · ${esc(a.pub)} · ${esc(a.date)}</span></a></div>`).join("")}</div>`).join("")}
  </section>`;
  return layout({ title: T.archive, desc: T.archDesc, url: PRE + "/purane/", body, tab: "purane", alt: { hi: "/purane/", en: "/en/purane/", ur: "/ur/purane/" } });
}
const JN = {
  hi: { k: "न्योता", h: "हर सुबह, ज़रूरी ख़बरों तक एक पगडंडी", lede: "देशकाल दुनिया भर के अख़बारों, पत्रिकाओं और स्वतंत्र मंचों से रोज़ की सबसे ज़रूरी टिप्पणियां चुनता है और उनका सार आसान हिंदी में लिखता है। अवाम की नज़र से: अल्पसंख्यक, दलित, आदिवासी, औरतें, मेहनतकश। हर सार के आख़िर में मूल लेख का लिंक। कोई विज्ञापन नहीं, कोई शुल्क नहीं।", aria: "ईमेल", btn: "हर सुबह ईमेल पर पाएं", small: "जब चाहें, हर ईमेल के नीचे एक क्लिक से हट सकते हैं।", nijta: "निजता नीति", today: "आज के अंक से", full: "पूरा अंक पढ़ें", title: "देशकाल से जुड़िए", desc: "हर सुबह 6 बजे ज़रूरी टिप्पणियों का सार, आसान हिंदी में, सीधे आपके ईमेल पर।" },
  en: { k: "Invitation", h: "Every morning, a footpath to the news that matters", lede: "Every day Deshkaal picks the most important commentary from newspapers, magazines and independent platforms around the world and writes a summary in plain language. Through the eyes of the people: minorities, Dalits, Adivasis, women, working people. A link to the original at the end of every summary. No advertisements, no fee.", aria: "Email", btn: "Get it by email every morning", small: "You can unsubscribe any time with one click at the bottom of every email.", nijta: "Privacy policy", today: "From today's issue", full: "Read the full issue", title: "Join Deshkaal", desc: "A summary of the important commentary every morning at 6, in plain language, straight to your email." },
  ur: { k: "دعوت", h: "ہر صبح، اہم خبروں تک ایک پگڈنڈی", lede: "دیشکال دنیا بھر کے اخباروں، رسالوں اور آزاد پلیٹ فارموں سے روز کے سب سے اہم تبصرے چنتا ہے اور ان کا خلاصہ آسان زبان میں لکھتا ہے۔ عوام کی نظر سے: اقلیتیں، دلت، آدی واسی، عورتیں، محنت کش۔ ہر خلاصے کے آخر میں اصل مضمون کا لنک۔ کوئی اشتہار نہیں، کوئی فیس نہیں۔", aria: "ای میل", btn: "ہر صبح ای میل پر پائیں", small: "جب چاہیں، ہر ای میل کے نیچے ایک کلک سے ہٹ سکتے ہیں۔", nijta: "پرائیویسی پالیسی", today: "آج کے شمارے سے", full: "پورا شمارہ پڑھیں", title: "دیشکال سے جڑیے", desc: "ہر صبح 6 بجے اہم تبصروں کا خلاصہ، آسان زبان میں، سیدھے آپ کے ای میل پر۔" }
};
function joinPage() {
  const J = JN[LG], news = today.items.filter(a => a.cat !== "साहित्य").slice(0, 3);
  const body = `<section class="page2 join">
  <p class="kicker">${J.k}</p>
  <h2>${J.h}</h2>
  <p class="lede">${J.lede}</p>
  <form class="sub big" id="subf" data-source="nyota"><input id="email" type="email" required placeholder="aapka@email.com" aria-label="${J.aria}"><button class="btn">${J.btn}</button></form>
  <p class="note" id="subnote"></p>
  <p class="small">${J.small} <a href="${PRE}/nijta/">${J.nijta}</a></p>
  <div class="act chans">${chanBtn("whatsapp","WhatsApp")}${chanBtn("telegram","Telegram")}</div>
  <h4>${J.today}</h4>
  <ul class="joinlist">${news.map(a => `<li><a href="${href(a)}"><b>${esc(a.h)}</b><span>${esc(a.dek)}</span></a></li>`).join("")}</ul>
  <p><a class="btn ghost" href="${PRE}/">${J.full}</a></p>
</section>`;
  return layout({ title: J.title, desc: J.desc, url: PRE + "/judiye/", body, alt: languageURLs("/judiye/") });
}
function minePage() {
  return layout({ title: T.mine, desc: T.mineDesc, url: PRE + "/mera/", body: `<section class="page2" id="mine" data-cats='${JSON.stringify(CATS)}' data-catn='${JSON.stringify(CATS.map(cn))}'></section>`, tab: "mera", alt: languageURLs("/mera/"), noindex: true });
}
function mdPage(file, title, desc, url, h2) {
  const lf = LG === "hi" ? file : file.replace(".md", "." + LG + ".md");
  const md = fs.readFileSync(fs.existsSync(lf) ? lf : file, "utf8");
  const html = md.split(/\n\n+/).map(b => {
    if (b.startsWith("# ")) return "";
    if (b.startsWith("## ")) return `<h4>${esc(b.slice(3))}</h4>`;
    if (/^- /m.test(b)) return `<ul>${b.split("\n").filter(l => l.startsWith("- ")).map(l => `<li>${esc(l.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${esc(b)}</p>`;
  }).join("");
  const available = LANGS.filter(l => l === "hi" || fs.existsSync(file.replace(".md", "." + l + ".md")));
  return layout({ title, desc, url: PRE + url, body: `<section class="page2 policy"><h2>${h2}</h2>${html}</section>`, alt: languageURLs(url, available), noindex: !available.includes(LG) });
}
const HS = require("./src/hamsafar.js")({ layout: (...a) => layout(...a), esc, dayLabel: d => dayLabel(d), SITE, LATEST: IST_TODAY });
const PG = {
  hi: { pol: ["संपादकीय नीति", "देशकाल किन टिप्पणियों को चुनता है और क्यों।", "हमारी संपादकीय नीति"], pri: ["निजता नीति", "देशकाल आपकी कौन सी जानकारी रखता है, कहां और कैसे हटवाएं।", "निजता नीति"] },
  en: { pol: ["Editorial policy", "What commentary Deshkaal chooses, and why.", "Our editorial policy"], pri: ["Privacy policy", "What information Deshkaal keeps, where, and how to have it removed.", "Privacy policy"] },
  ur: { pol: ["ادارتی پالیسی", "دیشکال کن تبصروں کو چنتا ہے اور کیوں۔", "ہماری ادارتی پالیسی"], pri: ["پرائیویسی پالیسی", "دیشکال آپ کی کون سی معلومات رکھتا ہے، کہاں، اور کیسے ہٹوائیں۔", "پرائیویسی پالیسی"] }
};
const policyPage = () => mdPage("EDITORIAL.md", ...PG[LG].pol.slice(0, 2), "/niti/", PG[LG].pol[2]);
const privacyPage = () => mdPage("PRIVACY.md", ...PG[LG].pri.slice(0, 2), "/nijta/", PG[LG].pri[2]);
function feed() {
  const items = all.slice(0, 40).map(a => `<item><title>${esc(a.h)}</title><link>${SITE}${href(a)}</link><guid>${SITE}${href(a)}</guid><pubDate>${new Date(a.day + "T01:30:00Z").toUTCString()}</pubDate><category>${esc(a.cat)}</category><description>${esc(a.dek)}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>देशकाल</title><link>${SITE}/</link><description>${esc(TAGLINE)}</description><language>hi</language>${items}</channel></rss>`;
}

/* ---------- आज का अख़बार ---------- */
function akhbarPage(day, issueNo, allDays) {
  const items = day.items, by = k => items.filter(a => a.sec === k);
  const M = morchaSet([day], day.date), amukh = by("amukh")[0];
  const L = M ? M.lead : amukh || items.find(a => a.sec !== "sahitya"), vichar = M && amukh ? [amukh, ...by("vichar")] : by("vichar"), khabar = by("khabar"), lits = by("sahitya"), vid = by("video")[0];
  const pari = items.filter(a => isRuralReport(a));
  const date = dayLabel(day.date), url = `/akhbar/${day.date}/`, wd = date.split(",")[0], dt = date.split(", ")[1] || date;
  const pdf = fs.existsSync(path.join("public", "akhbar", day.date + ".pdf")) ? `/akhbar/${day.date}.pdf` : "";
  const P = (arr) => (arr || []).map(p => `<p>${esc(p)}</p>`).join("");
  const more = a => `${a.nazar && a.nazar.length && a.sec !== "sahitya" ? `<div class="np-nz"><b>देशकाल की नज़र</b>${a.nazar.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}<a class="np-more" href="${esc(a.url || href(a))}">मूल लेख: ${esc(a.pub || "")} →</a>`;
  const img = a => a && a.photo ? `<img class="${a.photo.kind === "painting" ? "paint" : "photo"}" src="${esc(imgSrc(a))}" alt="" loading="lazy">` : "";
  const cap = a => a && a.photo ? `<span class="np-cap">${a.photo.note ? esc(a.photo.note) + " · " : ""}${esc(a.photo.credit)}</span>` : "";
  const by1 = a => `<p class="np-by"><b>${esc(a.by)}</b> · ${esc(a.pub)}</p>`;
  const tile = a => `<span class="np-tile" aria-hidden="true">${esc([...(a.by || "?").trim()][0])}</span>`;
  const run = (n, t) => `<header class="np-run"><a class="np-run-m" href="/">देशकाल</a><h2>${t}</h2><span>${dt} · पन्ना ${n}</span></header>`;
  const folio = (n, t) => `<footer class="np-folio"><span>${t}</span><span>deshkaal.xyz · ज़रूरी ख़बरों तक जाती एक पगडंडी</span><span>${n}</span></footer>`;
  const [h1, h2] = splitHead(L.h);
  const toon = toonFor(day.date);
  const pgM = M && M.six.length ? 2 : 0, pgEd = pgM ? 3 : 2, pgNews = pgEd + 1;
  const promos = [toon && [pgEd, "तिरछी नज़र", { toon: 1, h: toon.artist + " का कार्टून", img: toon.img, href: "#p" + pgEd }], vichar[0] && [pgEd, "नुक़्ता-ए-नज़र", vichar[0]], (pari[0] || khabar[0]) && [pgNews, pari[0] ? "गांव-जवार" : "कल का कच्चा चिट्ठा", pari[0] || khabar[0]], vid && [pgNews, "रोशनदान", vid], lits[0] && [pgNews + 1, "सुख़न-सराय", lits[0]]].filter(Boolean).slice(0, 3);
  const pages = [];
  const mail = "mailto:sampark@deshkaal.xyz?subject=" + encodeURIComponent("देशकाल में विज्ञापन") + "&body=" + encodeURIComponent("नमस्ते, मैं देशकाल के अख़बार में विज्ञापन देना चाहता/चाहती हूं। मेरा नाम, संस्था और फ़ोन:");
  const ADS = {
    coupon: () => `<a class="np-ad coupon" href="${mail}"><span class="cut" aria-hidden="true">✂</span><small>विज्ञापन के लिए</small><b>यह कोना<br>ख़ाली नहीं,<br>आपका है</b><span class="price">₹1,000 से</span><em>sampark@deshkaal.xyz</em></a>`,
    poster: () => `<a class="np-ad poster" href="${mail}"><small>विज्ञापन</small><b>जो पढ़ते हैं,<br>वो यहां मिलते हैं</b><p>किताब, फ़िल्म, नाटक, खादी, खेत की उपज, आपका हुनर: उन पाठकों तक जो सुबह की चाय के साथ पूरा पढ़ते हैं, सिर्फ़ स्क्रॉल नहीं करते।</p><span class="price">₹1,000 से ₹1,00,000 तक</span><em>संपर्क: sampark@deshkaal.xyz</em></a>`,
    stamp: () => `<a class="np-ad stamp" href="${mail}"><span class="seal">ख़ाली<br>जगह</span><b>यहां आपका नाम छपे, तो पढ़ा भी जाए</b><p>एक कोने से पूरे पन्ने तक। बात कीजिए, दाम तय कीजिए।</p><ul class="ladder"><li><span>कोना</span><i></i><b>₹1,000</b></li><li><span>चौथाई पन्ना</span><i></i><b>₹10,000</b></li><li><span>आधा पन्ना</span><i></i><b>₹40,000</b></li><li><span>पहला पन्ना</span><i></i><b>₹1,00,000</b></li></ul><em>sampark@deshkaal.xyz</em></a>`,
    rate: () => `<a class="np-ad rate" href="${mail}"><div class="rate-h"><small>विज्ञापन दर-सूची</small><b>देशकाल में आपकी जगह</b><p>हर सुबह, उन पाठकों के बीच जो ख़बर को सोचकर पढ़ते हैं।</p></div>
      <ol><li><span>कोना</span><b>₹1,000</b><i>एक दिन</i></li><li><span>चौथाई पन्ना</span><b>₹10,000</b><i>एक दिन</i></li><li><span>आधा पन्ना</span><b>₹40,000</b><i>एक दिन</i></li><li class="top"><span>पहला पन्ना, पूरा</span><b>₹1,00,000</b><i>एक दिन</i></li></ol>
      <em>sampark@deshkaal.xyz · विज्ञापन देशकाल की संपादकीय नीति के दायरे में ही छपते हैं</em></a>`
  };
  const pad = (n, cols) => (cols - (n % cols)) % cols;
  pages.push(`<section class="sheet front" id="p1">
    <nav class="np-sky">${promos.map(([n, t, a]) => `<a href="${a.toon ? a.href : href(a)}">${a.toon ? `<img class="paint" src="${a.img}" alt="">` : isVid(a) ? `<img class="photo" src="${esc(ytThumb(a))}" alt="">` : img(a)}<span><small>पन्ना ${n} · ${t}</small>${esc(a.h)}</span></a>`).join("")}</nav>
    <header class="np-mast">
      <h1 class="np-title"><span>देशकाल</span></h1>
      <div class="np-date"><b>${wd}</b><span>${dt}</span><span>वर्ष 1 · अंक ${issueNo}</span></div>
    </header>
    <div class="np-tagbar"><span>ज़रूरी ख़बरों तक जाती एक पगडंडी</span><span>दुनिया भर की संपादकीय टिप्पणियां, सहज हिंदुस्तानी में</span><span>मूल्य: बस थोड़ा-सा ध्यान</span></div>
    <article class="np-poster ${heroSize(L.h)}">
      <figure>${img(L)}<figcaption>${cap(L)}</figcaption></figure>
      <div class="np-poster-t"><p class="np-flag"><b>${M ? "सड़क की संसद · विशेष" : "आमुख"}</b> ${esc(L.by)}</p><h2><a href="${href(L)}"><span class="acc">${esc(h1)}</span> <span class="rest">${esc(h2)}</span></a></h2></div>
    </article>
    <div class="np-leadgrid">
      <div class="np-leadtext"><p class="np-dek">${esc(L.dek)}</p><div class="cols3 dropcap">${by1(L)}${P(L.body)}${more(L)}</div></div>
      <aside class="np-rail">
        ${(L.ank || []).slice(0, 2).map(([n, t]) => `<div class="np-big"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}
        <blockquote class="np-quote"><span class="q">“</span>${esc(L.sawal)}<cite>आज का सवाल</cite></blockquote>
        <div class="np-inside"><h3>अंदर</h3><ol>
          ${pgM ? `<li><b>2</b>सड़क की संसद: ${M.six.length + M.more.length} विश्लेषण, पूरे पाठ के साथ</li>` : ""}<li><b>${pgEd}</b>नुक़्ता-ए-नज़र: देशकाल की राय और ${vichar.length} टिप्पणियां</li>
          <li><b>${pgNews}</b>देश-दुनिया${pari.length ? ", गांव-जवार" : ""}${vid ? ", रोशनदान" : ""}</li>
          ${lits.length ? `<li><b>${pgNews + 1}</b>सुख़न-सराय: साहित्य</li>` : ""}</ol></div>
      </aside>
    </div>
    ${M && M.six.length ? `<section class="np-morcha"><h3><span>सड़क की संसद</span><small>वोट चोरी के ख़िलाफ़ आंदोलन पर सबसे प्रखर और मुखर विश्लेषण · पूरा पाठ पन्ना 2 पर</small></h3>
      <ol>${M.six.map((a, i) => `<li><b>${i + 1}</b><div><p class="np-kick">${esc(a.by)} · ${esc(a.pub)}</p><h4><a href="${href(a)}">${esc(a.h)}</a></h4><p>${esc(a.dek)}</p></div></li>`).join("")}</ol></section>` : ""}
    ${khabar.length ? `<section class="np-digest"><h3><span>कल का कच्चा चिट्ठा</span><small>बीते दिन की वो ख़बरें, जो दबनी नहीं चाहिए · पूरी ख़बरें पन्ना ${pgNews} पर</small></h3>
      <ol>${khabar.map((a, i) => `<li><b>${i + 1}</b><div><p class="np-kick">${cn(a.cat)}</p><h4><a href="${href(a)}">${esc(a.h)}</a></h4><p>${esc(a.dek)}</p></div></li>`).join("")}${pad(khabar.length, 4) ? `<li class="adcell" style="grid-column:span ${pad(khabar.length, 4)}">${pad(khabar.length, 4) > 1 ? ADS.poster() : ADS.coupon()}</li>` : ""}</ol></section>` : ""}
    ${folio(1, "पहला पन्ना")}</section>`);

  if (pgM) pages.push(`<section class="sheet morcha-sheet" id="p2">${run(2, "सड़क की संसद")}
    <p class="np-mintro">चुनाव आयोग की वोट चोरी के ख़िलाफ़ आंदोलन पर देश-दुनिया में छपे सबसे तीखे विश्लेषण, देशकाल के शब्दों में, पूरे के पूरे।</p>
    <div class="np-flow np-mflow">${[...M.six, ...M.more].map((a, i) => `<article class="np-fs"><p class="np-kick"><b class="np-mn">${i + 1}</b>${esc(a.by)} · ${esc(a.pub)} ·${esc(a.date)}</p><h3><a href="${href(a)}">${esc(a.h)}</a></h3><p class="np-dek sm">${esc(a.dek)}</p>${P(a.body)}${more(a)}</article>`).join("")}</div>
    ${folio(2, "सड़क की संसद")}</section>`);

  const [F, ...ops] = vichar;
  pages.push(`<section class="sheet" id="p${pgEd}">${run(pgEd, "नुक़्ता-ए-नज़र")}
    ${toon ? `<section class="np-toon"><div class="np-toon-l"><h3>तिरछी<br>नज़र</h3><p>${esc(toon.artist)}</p></div><a class="np-toon-f" href="/cartoon/${toon.date}/"><img class="paint" src="${toon.img}" alt="${esc(toon.alt)}"></a></section>` : ""}
    <div class="np-edit">
      <aside class="np-rai"><h3>देशकाल की राय</h3><h4>${esc(L.h)}</h4>${P(L.nazar)}<p class="np-ask">${esc(L.sawal)}</p></aside>
      <div class="np-ops">
        ${F ? `<article class="np-feature"><div class="np-fhead">${tile(F)}<div><p class="np-kick">${cn(F.cat)} ·${esc(F.pub)}</p><h3><a href="${href(F)}">${esc(F.h)}</a></h3><p class="np-author">${esc(F.by)}</p></div></div>${F.photo ? `<figure>${img(F)}${cap(F)}</figure>` : ""}<div class="cols2">${P(F.body)}${more(F)}</div></article>` : ""}
        <div class="np-opgrid np-flow">${ops.map((a, i) => `${i === 3 ? `<blockquote class="np-pull">${esc(a.dek)}</blockquote>` : ""}<article class="np-op"><div class="np-fhead">${tile(a)}<div><p class="np-kick">${cn(a.cat)} ·${esc(a.pub)}</p><p class="np-author">${esc(a.by)}</p></div></div><h3><a href="${href(a)}">${esc(a.h)}</a></h3>${P(a.body)}${more(a)}</article>`).join("")}${pad(Math.max(0, ops.length - 3), 3) ? `<div class="adcell" style="grid-column:span ${pad(Math.max(0, ops.length - 3), 3)}">${ADS.stamp()}</div>` : ""}</div>
      </div>
    </div>
    ${folio(pgEd, "संपादकीय")}</section>`);

  if (khabar.length || pari.length || vid) {
    const [T1, ...rest] = khabar;
    pages.push(`<section class="sheet" id="p${pgNews}">${run(pgNews, "देश-दुनिया")}
    ${T1 ? `<article class="np-top np-topwide"><p class="np-kick">${cn(T1.cat)}</p><h3><a href="${href(T1)}">${esc(T1.h)}</a></h3><p class="np-dek sm">${esc(T1.dek)}</p>${T1.photo && T1.photo.src !== (L.photo || {}).src ? `<figure>${img(T1)}${cap(T1)}</figure>` : ""}${by1(T1)}<div class="cols3">${P(T1.body)}${more(T1)}</div></article>${rest.length ? `<div class="np-flow np-nflow">${rest.map((a, i) => `${i === 2 ? `<div class="adcell">${ADS.coupon()}</div>` : ""}<article class="np-story"><p class="np-kick">${cn(a.cat)}</p><h3><a href="${href(a)}">${esc(a.h)}</a></h3>${by1(a)}${P(a.body)}${more(a)}</article>`).join("")}<div class="adcell">${ADS.poster()}</div></div>` : ""}` : ""}
    ${pari.length ? `<section class="np-pari"><h3 class="np-band"><span>गांव-जवार</span><small>देहात की ख़बरें</small></h3><div class="np-pgrid np-flow">${pari.map(a => `<article><figure>${img(a)}</figure><div><h4><a href="${href(a)}">${esc(a.h)}</a></h4>${by1(a)}${P(a.body)}${more(a)}</div></article>`).join("")}</div></section>` : ""}
    ${vid ? `<section class="np-film"><div class="np-film-in"><a class="np-vthumb" href="${href(vid)}"><img src="${esc(ytThumb(vid))}" alt=""><span class="play"></span></a><div><p class="np-flag light"><b>रोशनदान</b> आज की फ़िल्म</p><h3><a href="${href(vid)}">${esc(vid.h)}</a></h3>${by1(vid)}${P(vid.body)}<a class="np-more" href="${href(vid)}">फ़िल्म देखिए →</a></div></div></section>` : ""}
    ${folio(pgNews, "देश-दुनिया")}</section>`);
  }

  if (lits.length) {
    const [H, ...ls] = lits, n = pages.length + 1;
    pages.push(`<section class="sheet lit" id="p${n}">${run(n, "सुख़न-सराय")}
    <article class="np-gallery"><div class="np-plate"><p class="np-kick">${esc(H.pub)}</p><h3><a href="${href(H)}">${esc(H.h)}</a></h3>${by1(H)}${P(H.body)}${more(H)}</div><figure>${img(H)}</figure>${cap(H)}</article>
    <div class="np-litgrid np-flow">${ls.map(a => `<article><figure>${img(a)}</figure><div><p class="np-kick">${esc(a.pub)}</p><h4><a href="${href(a)}">${esc(a.h)}</a></h4>${by1(a)}${P(a.body)}${more(a)}</div></article>`).join("")}${ls.length % 2 ? `<div class="adcell">${ADS.stamp()}</div>` : ""}</div>
    ${ADS.rate()}
    <div class="np-imprint">देशकाल हर सुबह दुनिया भर की ज़रूरी टिप्पणियों का सार सहज हिंदुस्तानी में लाता है। सारे सार देशकाल का अपना लेखन हैं, मूल लेख, लेखक और प्रकाशक का नाम और लिंक हर सार के साथ है। यह अख़बार उसी अंक से अपने आप बनता है।</div>
    ${folio(n, "साहित्य")}</section>`);
  }
  const nav = pages.map((_, i) => `<a href="#p${i + 1}">${i + 1}</a>`).join("");
  const past = allDays.slice(0, 30).map(d => `<a href="/akhbar/${d.date}/"${d.date === day.date ? ' aria-current="true"' : ""}>${dayLabel(d.date)}</a>`).join("");
  const title = `ई-पेपर · ${date} · देशकाल`;
  return `<!doctype html>
<html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc("देशकाल का " + date + " का अंक, अख़बार के रूप में: " + L.h)}">
<link rel="canonical" href="${SITE}${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:image" content="${SITE}${fs.existsSync(path.join("public", "og", L.id + ".png")) ? "/og/" + L.id + ".png" : "/og.png"}"><meta property="og:url" content="${SITE}${url}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Yatra+One&family=Teko:wght@500;600;700&family=Eczar:wght@500;600;700;800&family=Martel:wght@400;600;800&family=Mukta:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/akhbar.css?v=${AV}"></head>
<body class="np">
<div class="np-bar"><a class="np-home" href="/">← देशकाल</a><nav class="np-pages" aria-label="पन्ने"><span>पन्ना</span>${nav}</nav><span class="np-act"><button type="button" id="np-s" aria-label="अक्षर छोटे">अ−</button><button type="button" id="np-b" aria-label="अक्षर बड़े">अ+</button><button type="button" id="np-m">रंग</button>${pdf ? `<a href="${pdf}" download>PDF डाउनलोड</a>` : ""}<button type="button" onclick="window.print()">छापें</button></span></div>
<main class="np-wrap">${pages.join("\n")}</main>
<nav class="np-past" aria-label="पिछले अख़बार"><h3>पिछले अख़बार</h3>${past}</nav>
<script>
(function(){var r=document.documentElement,S={g:function(k){try{return localStorage.getItem(k)}catch(e){return null}},s:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var M=[["auto","अपने आप"],["day","दिन"],["sepia","सीपिया"],["night","रात"]],Z=[.8,.88,.94,1,1.08,1.16,1.25,1.35];
var m=S.g("dk-mode")||"auto",z=+(S.g("dk-zoom")||3);if(!(z>=0&&z<Z.length))z=3;
function am(){var t=m==="auto"?(matchMedia("(prefers-color-scheme: dark)").matches?"night":"day"):m;r.dataset.np=t;document.getElementById("np-m").textContent="रंग: "+M.filter(function(x){return x[0]===m})[0][1]}
function az(){var w=document.querySelector(".np-wrap");w.style.zoom=Z[z]===1?"":Z[z];document.getElementById("np-b").disabled=z===Z.length-1;document.getElementById("np-s").disabled=z===0}
document.getElementById("np-m").onclick=function(){var i=M.findIndex(function(x){return x[0]===m});m=M[(i+1)%M.length][0];S.s("dk-mode",m);am()};
document.getElementById("np-b").onclick=function(){z=Math.min(Z.length-1,z+1);S.s("dk-zoom",z);az()};
document.getElementById("np-s").onclick=function(){z=Math.max(0,z-1);S.s("dk-zoom",z);az()};
am();az();window.addEventListener("beforeprint",function(){r.dataset.np="day"});window.addEventListener("afterprint",am)})();
</script>
</body></html>`;
}

{ const t = DAYS_HI[0].items, c = k => t.filter(a => a.sec === k).length;
  if (c("vichar") && c("vichar") % 3) console.warn(`चेतावनी: नुक़्ता-ए-नज़र में ${c("vichar")} टिप्पणियां, ग्रिड में ख़ाली खाना रहेगा (6 चाहिए)`);
  if (c("khabar") % 2) console.warn(`चेतावनी: कच्चा चिट्ठा में ${c("khabar")} ख़बरें, विषम संख्या से ख़ाली खाना रहेगा`); }

/* ---------- write ---------- */
fs.rmSync("dist", { recursive: true, force: true });
const out = (p, s) => { const f = path.join("dist", p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
for (const l of LANGS) {
  setLang(l); days = daysFor(l); if (!days.length) continue; all = days.flatMap(d => d.items); today = days[0];
  const P = l === "hi" ? "" : l + "/";
  out(P + "index.html", homePage());
  CATS.forEach(c => out(`${P}shreni/${SLUG[c]}/index.html`, catPage(c)));
  all.forEach(a => out(`${P}lekh/${a.id}/index.html`, articlePage(a)));
  out(P + "purane/index.html", archivePage());
  if (morchaAll().length) out(P + "morcha/index.html", morchaPage());
  out(P + "mera/index.html", minePage());
  out(P + "khoj.json", searchIndex());
  if (l !== "hi") { out(`${P}hamsafar/index.html`, HS.galleryPage(l)); HS.ALL.filter(HS.has(l)).forEach(w => out(`${P}hamsafar/${w.id}/index.html`, HS.workPage(w, l))); }
  if (l === "hi" && LIVE_ON) {
    const T0 = LIVE_DAYS.find(d => d.date === IST_TODAY) || { date: IST_TODAY, updated: "", counters: [], items: [] };
    out("live/index.html", livePage(T0, "/live/")); out("live/feed.json", JSON.stringify({ updated: T0.updated || "", day: T0.date }));
    LIVE_DAYS.forEach(d => out(`live/${d.date}/index.html`, livePage(d, `/live/${d.date}/`)));
  }
  if (l === "hi") { out("niti/index.html", policyPage()); out("nijta/index.html", privacyPage()); out("judiye/index.html", joinPage());
    out("bhejiye/index.html", HS.invitePage()); out("hamsafar/index.html", HS.galleryPage()); HS.ALL.forEach(w => out(`hamsafar/${w.id}/index.html`, HS.workPage(w))); }
}

for (const l of ["en", "ur"]) {
  setLang(l); days = DAYS_HI; all = days.flatMap(d => d.items); today = days[0];
  const P = l + "/";
  out(P + "niti/index.html", policyPage()); out(P + "nijta/index.html", privacyPage()); out(P + "judiye/index.html", joinPage()); out(P + "bhejiye/index.html", HS.invitePage(LG));
  PUB_TOONS.forEach(c => out(`${P}cartoon/${c.date}/index.html`, cartoonPage(c)));
  if (LIVE_ON) {
    const T0 = LIVE_DAYS.find(d => d.date === IST_TODAY) || { date: IST_TODAY, updated: "", counters: [], items: [] };
    out(P + "live/index.html", livePage(T0, "/live/"));
    LIVE_DAYS.forEach(d => out(`${P}live/${d.date}/index.html`, livePage(d, `/live/${d.date}/`)));
  }
}
setLang("hi"); days = DAYS_HI; all = days.flatMap(d => d.items); today = days[0];
out("feed.xml", feed());
{ const asc = [...DAYS_HI].sort((a, b) => a.date.localeCompare(b.date)), desc = [...asc].reverse();
  asc.forEach((d, i) => out(`akhbar/${d.date}/index.html`, akhbarPage(d, i + 1, desc)));
  out("akhbar/index.html", akhbarPage(desc[0], asc.length, desc).replace('<link rel="canonical"', `<meta name="robots" content="noindex"><link rel="canonical"`)); }
out("akhbar.css", fs.readFileSync("src/akhbar.css", "utf8"));
PUB_TOONS.forEach(c => out(`cartoon/${c.date}/index.html`, cartoonPage(c)));
PUB_TOONS.forEach(c => { fs.mkdirSync("dist/cartoon", { recursive: true }); fs.copyFileSync(path.join("data/cartoons/img", c.date + ".jpg"), path.join("dist/cartoon", c.date + ".jpg")); });
out("sitemap.xml", require("./src/seo.js").sitemap("dist", SITE));
out("styles.css", fs.readFileSync("src/styles.css", "utf8"));
out("art.js", fs.readFileSync("src/art.js", "utf8"));
out("client.js", fs.readFileSync("src/client.js", "utf8"));
(function copyDir(from, to) {
  for (const f of fs.readdirSync(from)) {
    const src = path.join(from, f), dst = path.join(to, f);
    if (fs.statSync(src).isDirectory()) copyDir(src, dst); else { fs.mkdirSync(to, { recursive: true }); fs.copyFileSync(src, dst); }
  }
})("public", "dist");
out("sw.js", fs.readFileSync("public/sw.js", "utf8").replace("__VERSION__", today.date + "-" + all.length + "-" + require("crypto").createHash("md5").update(["src/styles.css", "src/client.js", "src/art.js"].map(f => fs.readFileSync(f, "utf8")).join("")).digest("hex").slice(0, 8)));
console.log(`बन गयी: ${days.length} दिन, ${all.length} टिप्पणियां, ${CATS.length} श्रेणियां · English ${HAS.en.size}, اردو ${HAS.ur.size}`);

// support ribbon polish

// final Razorpay visual cleanup
