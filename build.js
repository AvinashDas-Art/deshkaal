// देशकाल: स्थिर साइट बनाने वाली स्क्रिप्ट। चलाएं: node build.js  (कोई बाहरी पैकेज ज़रूरी नहीं)
// data/days/*.json पढ़ कर dist/ में पूरी साइट लिखती है।
const fs = require("fs"), path = require("path");
const SITE = "https://deshkaal.xyz";
const TAGLINE = "ज़रूरी ख़बरों तक जाती एक पगडंडी";
/* चैनलों के लिंक: ख़ाली हों तो बटन "जल्द" दिखाते हैं */
const CHANNELS = { whatsapp: "https://whatsapp.com/channel/0029Vb8hHGPBadmUpTWYYI1W", telegram: "https://t.me/deshkaal" };
const CATS = ["देश","दुनिया","समाज","अर्थ","पर्यावरण","स्त्री","संस्कृति","साहित्य"];
const SLUG = {"देश":"desh","दुनिया":"duniya","समाज":"samaj","अर्थ":"arth","पर्यावरण":"paryavaran","स्त्री":"stri","संस्कृति":"sanskriti","साहित्य":"sahitya"};
const MONTHS = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
const DAYS = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];

const CHAN_ICON = {
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.5-.3Z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.5c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13.2l-4.8-1.5c-1-.3-1.1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"/></svg>' };
const chanBtn = (k, label) => CHANNELS[k]
  ? `<a class="chip chan chan-${k}" href="${CHANNELS[k]}" target="_blank" rel="noopener">${CHAN_ICON[k]}${label} पर जुड़ें</a>`
  : `<span class="chip">${label} · जल्द</span>`;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dayLabel = d => { const t = new Date(d + "T00:00:00Z"); return `${DAYS[t.getUTCDay()]}, ${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}`; };
const words = a => [a.h, a.dek, ...a.body, ...a.nazar].join(" ").split(/\s+/).length;
const readMin = a => Math.max(1, Math.round(words(a) / 200));
const listenMin = a => Math.max(1, Math.round(words(a) / 130));
const href = a => `/lekh/${a.id}/`;
const art = (a, cls = "", word = "") => `<canvas class="art ${cls}" data-id="${esc(a.id)}" data-motif="${esc(a.motif)}" data-seed="${a.seed}" data-h="${esc(a.h)}" data-cat="${esc(a.cat)}"${a.photo ? ` data-photo="${esc(a.photo.src)}" data-kind="${esc(a.photo.kind || "photo")}"` : ""}${word ? ` data-word="${esc(word)}"` : ""} role="img" aria-label="${esc(word || a.h)} के लिए कोलाज"></canvas>`;
const credit = a => a.photo ? `<span class="credit">${a.photo.note ? esc(a.photo.note) + " · " : ""}${a.photo.kind === "painting" ? "पेंटिंग" : "तस्वीर"}: <a href="${esc(a.photo.page)}" target="_blank" rel="noopener">${esc(a.photo.credit)}</a></span>` : "";
const saveBtn = a => `<button class="save" data-save="${esc(a.id)}" data-h="${esc(a.h)}" aria-pressed="false">+ सहेजें</button>`;

/* ---------- data ---------- */
const dayFiles = fs.readdirSync("data/days").filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
const days = dayFiles.map(f => ({ date: f.slice(0, 10), items: JSON.parse(fs.readFileSync(path.join("data/days", f), "utf8")) }));
const all = days.flatMap(d => d.items);
if (!days.length) throw new Error("data/days में कोई दिन नहीं मिला");
const today = days[0];

/* ---------- layout ---------- */
function layout({ title, desc, url, body, tab = "", catOn = "", extraHead = "", image = "/og.png", published = "" }) {
  const full = title ? `${title} · देशकाल` : `देशकाल · ${TAGLINE}`;
  return `<!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="${title ? "article" : "website"}">
<meta property="og:site_name" content="देशकाल">
<meta property="og:title" content="${esc(title || "देशकाल")}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${SITE}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title || "देशकाल")}">
<meta property="og:locale" content="hi_IN">
<meta name="twitter:title" content="${esc(title || "देशकाल")}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}${image}">${published ? `
<meta property="article:published_time" content="${published}T07:00:00+05:30">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F1F2EE">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png"><link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="देशकाल">
<link rel="alternate" type="application/rss+xml" title="देशकाल" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Yatra+One&family=Kalam:wght@400;700&family=Laila:wght@300;500;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Devanagari:wght@400;500&display=swap">
<link rel="stylesheet" href="/styles.css">
${extraHead}
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="brush" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.11" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
<div class="wrap">
  <div class="strip">
    <span class="date">${dayLabel(today.date)} · हर सुबह 7 बजे, नयी टिप्पणियां</span>
    <div class="controls">
      <button class="ctl" id="smaller" aria-label="अक्षर छोटे करें">अ−</button>
      <button class="ctl" id="bigger" aria-label="अक्षर बड़े करें">अ+</button>
      <button class="ctl" id="theme">रंग: अपने आप</button>
      <button class="ctl" id="who">साइन इन</button>
    </div>
  </div>
  <header class="masthead">
    <${title ? "p" : "h1"} class="mh"><a href="/" class="mast" aria-label="देशकाल"><span class="w">देशकाल</span></a></${title ? "p" : "h1"}>
    <p class="tag">${TAGLINE}</p>
    <nav class="cats" aria-label="श्रेणियां">
      <a href="/" class="${catOn === "सब" ? "on" : ""}">सब</a>${CATS.map(c => `<a href="/shreni/${SLUG[c]}/" class="${catOn === c ? "on" : ""}">${c}</a>`).join("")}<a href="/purane/" class="arch ${tab === "purane" ? "on" : ""}">आर्काइव</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer>
    <span class="mast small" aria-label="देशकाल"><span class="w">देशकाल</span></span>
    <span>यहां छपे सार देशकाल का अपना लेखन हैं। मूल लेख और उनके अधिकार मूल लेखकों और प्रकाशकों के हैं, हर पन्ने पर उनका लिंक दिया गया है। हम सिर्फ़ वही लेख चुनते हैं जो बिना सब्सक्रिप्शन के पढ़े जा सकते हैं।</span>
    <span><a href="/niti/" style="color:var(--geru)">हमारी संपादकीय नीति</a> · <a href="/nijta/" style="color:var(--geru)">निजता नीति</a> · <a href="/purane/" style="color:var(--geru)">आर्काइव</a></span>
  </footer>
</div>
<nav class="tabbar" aria-label="ऐप नेविगेशन">
  <a href="/" class="${tab === "home" ? "on" : ""}"><b>घर</b>पहला पन्ना</a>
  <a href="/shreni/sahitya/" class="${catOn === "साहित्य" ? "on" : ""}"><b>सा</b>साहित्य</a>
  <a href="/purane/" class="${tab === "purane" ? "on" : ""}"><b>पु</b>आर्काइव</a>
  <a href="/mera/" class="${tab === "mera" ? "on" : ""}"><b>मैं</b>मेरा देशकाल</a>
</nav>
<div class="overlay" id="ov" hidden>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t">
    <h3 id="sh-t">देशकाल से जुड़िए</h3>
    <ul>
      <li>लेख सहेजिए, बाद में फ़ुर्सत से पढ़िए</li>
      <li>जहां पढ़ना छोड़ा, वहीं से फिर शुरू</li>
      <li>अपनी पसंद की श्रेणियों से सजा अपना पहला पन्ना</li>
      <li>रविवार विशेष एक दिन पहले, शनिवार शाम</li>
      <li>हर लेख पर पाठकों की बातचीत में हिस्सा</li>
      <li>सुनने की अपनी सूची, सफ़र के लिए</li>
    </ul>
    <form id="sif">
      <label for="si-name">नाम</label><input id="si-name" type="text" required autocomplete="name">
      <label for="si-mail">ईमेल</label><input id="si-mail" type="email" required autocomplete="email">
      <p class="note">पासवर्ड की ज़रूरत नहीं। आपके ईमेल पर साइन इन का एक लिंक आएगा।</p>
      <div class="acts"><button class="btn" type="submit">जुड़ें</button><button class="ghost" type="button" id="si-x">अभी नहीं</button></div>
    </form>
  </div>
</div>
<script src="/art.js"></script>
<script src="/client.js"></script>
</body>
</html>`;
}

/* ---------- pieces ---------- */
const card = a => `<article class="card"><a href="${href(a)}">${art(a)}<div class="ct"><p class="kicker">${a.cat}</p><h3>${esc(a.h)}</h3><p class="dek">${esc(a.dek)}</p></div></a><p class="src">${esc(a.pub)} · पढ़ें ${readMin(a)} मिनट · ${saveBtn(a)}</p></article>`;
const lit = a => `<article class="lit"><a href="${href(a)}">${art(a)}<div class="in"><p class="kicker">${esc(a.pub)} से</p><h3>${esc(a.h)}</h3><p class="dek">${esc(a.dek)}</p></div></a><p class="src">${esc(a.by)} · ${saveBtn(a)}</p></article>`;
const lead = (L, kick) => `<section class="lead"><a href="${href(L)}" tabindex="-1">${art(L)}</a>
  <div><p class="kicker">${kick} · ${L.cat}</p><a href="${href(L)}"><h2>${esc(L.h)}</h2></a><p class="dek">${esc(L.dek)}</p>
    <div class="row"><span>मूल: ${esc(L.by)} · ${esc(L.pub)} · ${esc(L.date)}</span><span>पढ़ें ${readMin(L)} मिनट · सुनें ${listenMin(L)} मिनट</span>${saveBtn(L)}</div>
    <div class="sawal"><small>आज का सवाल</small><p>${esc(L.sawal)}</p></div></div></section>`;
/* poster-style hero: split headline, diagonal art panel, big figures, drop-cap opening */
function splitHead(h) {
  let i = h.indexOf(":"); if (i < 0) i = h.indexOf(",");
  /* Teko में कोलन बहुत छोटा दिखता है; लाल-काले रंग का बंटवारा ही विराम का काम करता है, इसलिए कोलन हटा देते हैं */
  if (i > 0 && i < h.length - 4) return [h.slice(0, h[i] === ":" ? i : i + 1).trim(), h.slice(i + 1).trim()];
  const w = h.split(" "); return [w.slice(0, 2).join(" "), w.slice(2).join(" ")];
}
const heroText = (L, kick) => { const [a1, a2] = splitHead(L.h); return `
    <p class="kicker">${kick} · ${L.cat}</p>
    <a href="${href(L)}"><h2 class="hero-h"><span class="acc">${esc(a1)}</span> ${esc(a2)}</h2></a>`; };
const ankBlock = L => L.ank && L.ank.length ? `<div class="ank">${L.ank.slice(0, 2).map(([n, t]) => `<div><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>` : "";
const heroFoot = L => `<p class="dek">${esc(L.dek)}</p>
    <div class="hero-foot">
      <div class="hero-open"><p>${esc(L.body[0])}</p><a class="hero-more" href="${href(L)}">पूरा सार पढ़ें →</a></div>
      <aside class="sawal"><small>आज का सवाल</small><p>${esc(L.sawal)}</p></aside>
    </div>
    <div class="row"><span>मूल: ${esc(L.by)} · ${esc(L.pub)} · ${esc(L.date)}</span><span>पढ़ें ${readMin(L)} मिनट · सुनें ${listenMin(L)} मिनट</span>${saveBtn(L)}</div>`;
function chartSVG(c) {
  const W = 640, H = 420, pad = 56, base = H - 64, max = Math.max(...c.bars.map(b => b[1])) * 1.12, bw = (W - pad * 2) / c.bars.length;
  const bars = c.bars.map(([lab, v], k) => { const h = (v / max) * (base - 40), x = pad + k * bw + bw * .14, w = bw * .72, last = k === c.bars.length - 1;
    return `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" class="${last ? "bar-hi" : "bar"}"/><text x="${x + w / 2}" y="${base - h - 14}" class="bar-v">${v}</text><text x="${x + w / 2}" y="${base + 34}" class="bar-l">${esc(lab)}</text>`; }).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}"><line x1="${pad - 10}" y1="${base}" x2="${W - pad + 10}" y2="${base}" class="axis"/>${bars}</svg>`;
}
function hero(L, kick = "आज की बड़ी बहस") {
  const type = L.hero || "poster";
  if (type === "shabd" && L.shabd) return `<section class="hero hero-shabd">
    <a class="shabd-art" href="${href(L)}" tabindex="-1">${art(L, "", L.shabd)}</a>
    <div class="shabd-grid"><div>${heroText(L, kick)}${ankBlock(L)}</div><div>${heroFoot(L)}</div></div></section>`;
  if (type === "ank" && L.chart) return `<section class="hero hero-ank">
    <div class="ank-text">${heroText(L, kick)}${heroFoot(L)}</div>
    <figure class="ank-chart"><figcaption><b>${esc(L.chart.title)}</b><span>${esc(L.chart.unit)}</span></figcaption>${chartSVG(L.chart)}<p class="ank-note">${esc(L.chart.note || "")}</p></figure></section>`;
  return `<section class="hero">
  <a class="hero-art" href="${href(L)}" tabindex="-1">${art(L)}</a><span class="hero-slash" aria-hidden="true"></span>${L.photo ? `<span class="hero-credit">${credit(L)}</span>` : ""}
  <div class="hero-text">${heroText(L, kick)}${ankBlock(L)}${heroFoot(L)}</div></section>`;
}
const connect = `<section class="band">
  <div><h4>रविवार विशेष</h4><p>हफ़्ते की पांच सबसे ज़रूरी टिप्पणियां, गहरे संदर्भ के साथ, हर रविवार।</p><div class="act"><span class="chip">हर रविवार सुबह</span></div></div>
  <div><h4>हर सुबह आपके पास</h4><p>सुबह 7 बजे की सारी टिप्पणियां, सीधे आपके ईमेल इनबॉक्स में।</p><div class="act"><form class="sub" id="subf"><input id="email" type="email" required placeholder="aapka@email.com" aria-label="ईमेल"><button class="btn">जुड़ें</button></form></div><p class="note" id="subnote"></p></div>
  <div><h4>चैनल पर भी</h4><p>हर सुबह की टिप्पणियां सीधे आपके फ़ोन पर। चैनल से जुड़िए।</p><div class="act">${chanBtn("whatsapp","WhatsApp")}${chanBtn("telegram","Telegram")}</div></div>
</section>
<section class="appband"><svg class="appicon" viewBox="0 0 72 72" aria-hidden="true"><rect width="72" height="72" rx="18" class="ai-bg"/><circle cx="36" cy="36" r="23" class="ai-sun"/><text x="36" y="36" text-anchor="middle" dominant-baseline="central" class="ai-t">दे</text></svg>
  <div><h4>देशकाल को फ़ोन पर ऐप की तरह रखिए</h4>
  <ol><li>Android: Chrome में ऊपर ⋮ मेन्यू, फिर "होम स्क्रीन में जोड़ें"</li><li>iPhone: Safari में शेयर बटन, फिर "Add to Home Screen"</li></ol>
  <button class="btn" id="install" hidden style="margin-top:10px">होम स्क्रीन पर जोड़ें</button></div></section>`;

/* ---------- pages ---------- */
function homePage() {
  const news = today.items.filter(a => a.cat !== "साहित्य"), lits = today.items.filter(a => a.cat === "साहित्य");
  const [L, ...rest] = news, top = rest.slice(0, 8), tail = rest.slice(8);
  const body = `<div class="lastread" id="lastread" hidden></div>${hero(L)}
  <section class="grid">${top.map(card).join("")}</section>
  ${lits.length ? `<section class="litband"><div class="sechead"><h3>साहित्य</h3><p>कविता, कहानी, आलोचना और संस्मरण की दुनिया से, हर रोज़</p></div><div class="litgrid">${lits.map(lit).join("")}</div></section>` : ""}
  ${tail.length ? `<section class="more-sec"><h3>आज की और टिप्पणियां</h3><div class="clist">${tail.map(a => `<article><a href="${href(a)}"><p class="kicker">${a.cat} · ${esc(a.pub)}</p><h4>${esc(a.h)}</h4></a><p class="src">${esc(a.by)} · पढ़ें ${readMin(a)} मिनट · ${saveBtn(a)}</p></article>`).join("")}</div></section>` : ""}
  ${connect}`;
  return layout({ title: "", desc: `${dayLabel(today.date)}: दुनिया भर की ${today.items.length} ज़रूरी टिप्पणियां, सहज हिंदी में।`, url: "/", body, tab: "home", catOn: "सब" });
}
function catPage(c) {
  const list = all.filter(a => a.cat === c);
  let body;
  if (!list.length) body = `<p class="empty">“${c}” श्रेणी में अभी कोई टिप्पणी नहीं है। कल सुबह 7 बजे फिर देखिए।</p>`;
  else { const [L, ...rest] = list; body = hero(L, "ताज़ा") + (rest.length ? `<section class="grid">${rest.map(card).join("")}</section>` : ""); }
  return layout({ title: c, desc: `${c}: देशकाल पर चुनी गयी टिप्पणियों के सार।`, url: `/shreni/${SLUG[c]}/`, body, tab: c === "साहित्य" ? "" : "", catOn: c });
}
const shareBlock = a => { const u = encodeURIComponent(SITE + href(a)), t = encodeURIComponent(a.h);
  return `<div class="share" data-url="${SITE}${href(a)}" data-title="${esc(a.h)}"><span class="share-l">साझा कीजिए</span>
    <button class="sh sh-native" type="button" hidden>साझा करें</button>
    <a class="sh" href="https://wa.me/?text=${t}%0A${u}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="sh" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener">Telegram</a>
    <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener">X</a>
    <a class="sh" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">Facebook</a>
    <a class="sh" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener">LinkedIn</a>
    <button class="sh sh-copy" type="button">लिंक कॉपी</button></div>`; };
function articlePage(a) {
  const others = all.filter(x => x.id !== a.id && x.cat === a.cat).concat(today.items.filter(x => x.id !== a.id && x.cat !== a.cat)).slice(0, 6);
  const data = { id: a.id, h: a.h, dek: a.dek, body: a.body };
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.h, description: a.dek, datePublished: a.day, inLanguage: "hi", publisher: { "@type": "Organization", name: "देशकाल" }, isBasedOn: a.url };
  const body = `<article class="read">
    <a class="back" href="/">← देशकाल के पहले पन्ने पर</a>
    <p class="kicker" style="margin-top:22px"><a href="/shreni/${SLUG[a.cat]}/">${a.cat}</a></p>
    <h1>${esc(a.h)}</h1><p class="dek">${esc(a.dek)}</p>
    <div class="meta"><span>मूल: <b>${esc(a.by)}</b>, ${esc(a.pub)}, ${esc(a.date)}</span>
      <span class="tools"><button class="ctl" id="listen">▶ सुनें · ${listenMin(a)} मिनट</button>${saveBtn(a)}</span></div>
    ${shareBlock(a)}
    <figure class="figure" style="margin-inline:0">${art(a)}<figcaption class="cap">कोलाज: देशकाल${a.photo ? " · " + credit(a) : ""}</figcaption></figure>
    <div class="body">${a.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
    <aside class="box"><h5>देशकाल की नज़र</h5>${a.nazar.map(p => `<p>${esc(p)}</p>`).join("")}</aside>
    <aside class="sawal"><small>सोचने के लिए</small><p>${esc(a.sawal)}</p></aside>
    <aside class="box ref"><h5>संदर्भ</h5><dl>${a.ref.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl></aside>
    <a class="cta" href="${esc(a.url)}" target="_blank" rel="noopener"><strong>पूरा लेख पढ़ने के लिए यहां क्लिक करें</strong><span>${esc(a.pub)} पर, ${esc(a.lang)} में · मुफ़्त</span></a>
    <p class="fine">ये सार देशकाल का अपना लेखन है। मूल लेख के सारे अधिकार ${esc(a.pub)} के पास हैं।</p>
    ${shareBlock(a)}
    <div class="more"><h6>आगे पढ़ें</h6>${others.map(o => `<a href="${href(o)}">${esc(o.h)}</a>`).join("")}</div>
  </article>
  <script type="application/json" id="article-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  return layout({ title: a.h, desc: a.dek, url: href(a), body, catOn: a.cat, published: a.day, image: fs.existsSync(path.join("public", "og", a.id + ".png")) ? `/og/${a.id}.png` : "/og.png" });
}
function archivePage() {
  const body = `<section class="page2"><h2>आर्काइव</h2><p style="color:var(--ink-2);margin:0">देशकाल पर छपी हर टिप्पणी यहां तारीख़ के हिसाब से जमा होती है।</p>
    <div class="sub" style="margin-top:20px"><input class="search" id="aq" type="search" placeholder="लेखक, विषय या शब्द खोजें" aria-label="आर्काइव में खोजें"></div>
    <div class="chips">${["सब", ...CATS].map(c => `<button class="chip" data-ac="${c}" aria-pressed="${c === "सब"}">${c}</button>`).join("")}</div>
    <p class="src" id="acount"></p>
    ${days.map(d => `<div class="aday"><h4>${dayLabel(d.date)} · ${d.items.length} टिप्पणियां</h4>${d.items.map(a => `<div class="arow" data-cat="${a.cat}"><span class="k">${a.cat}</span><a href="${href(a)}"><h4>${esc(a.h)}</h4><span class="src" style="display:block;margin-top:4px">${esc(a.by)} · ${esc(a.pub)} · ${esc(a.date)}</span></a></div>`).join("")}</div>`).join("")}
  </section>`;
  return layout({ title: "आर्काइव", desc: "देशकाल पर छपी सारी टिप्पणियां, तारीख़ के हिसाब से।", url: "/purane/", body, tab: "purane" });
}
function joinPage() {
  const news = today.items.filter(a => a.cat !== "साहित्य").slice(0, 3);
  const body = `<section class="page2 join">
  <p class="kicker">न्योता</p>
  <h2>हर सुबह, ज़रूरी ख़बरों तक एक पगडंडी</h2>
  <p class="lede">देशकाल दुनिया भर के अख़बारों, पत्रिकाओं और स्वतंत्र मंचों से रोज़ की सबसे ज़रूरी टिप्पणियां चुनता है और उनका सार आसान हिंदी में लिखता है। अवाम की नज़र से: अल्पसंख्यक, दलित, आदिवासी, औरतें, मेहनतकश। हर सार के आख़िर में मूल लेख का लिंक। कोई विज्ञापन नहीं, कोई शुल्क नहीं।</p>
  <form class="sub big" id="subf" data-source="nyota"><input id="email" type="email" required placeholder="aapka@email.com" aria-label="ईमेल"><button class="btn">हर सुबह ईमेल पर पाएं</button></form>
  <p class="note" id="subnote"></p>
  <p class="small">जब चाहें, हर ईमेल के नीचे एक क्लिक से हट सकते हैं। <a href="/nijta/">निजता नीति</a></p>
  <div class="act chans">${chanBtn("whatsapp","WhatsApp")}${chanBtn("telegram","Telegram")}</div>
  <h4>आज के अंक से</h4>
  <ul class="joinlist">${news.map(a => `<li><a href="${href(a)}"><b>${esc(a.h)}</b><span>${esc(a.dek)}</span></a></li>`).join("")}</ul>
  <p><a class="btn ghost" href="/">पूरा अंक पढ़ें</a></p>
</section>`;
  return layout({ title: "देशकाल से जुड़िए", desc: "हर सुबह 7 बजे ज़रूरी टिप्पणियों का सार, आसान हिंदी में, सीधे आपके ईमेल पर।", url: "/judiye/", body });
}
function minePage() {
  return layout({ title: "मेरा देशकाल", desc: "सहेजे गये लेख और पसंद की श्रेणियां।", url: "/mera/", body: `<section class="page2" id="mine" data-cats='${JSON.stringify(CATS)}'></section>`, tab: "mera" });
}
function mdPage(file, title, desc, url, h2) {
  const md = fs.readFileSync(file, "utf8");
  const html = md.split(/\n\n+/).map(b => {
    if (b.startsWith("# ")) return "";
    if (b.startsWith("## ")) return `<h4>${esc(b.slice(3))}</h4>`;
    if (/^- /m.test(b)) return `<ul>${b.split("\n").filter(l => l.startsWith("- ")).map(l => `<li>${esc(l.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${esc(b)}</p>`;
  }).join("");
  return layout({ title, desc, url, body: `<section class="page2 policy"><h2>${h2}</h2>${html}</section>` });
}
const policyPage = () => mdPage("EDITORIAL.md", "संपादकीय नीति", "देशकाल किन टिप्पणियों को चुनता है और क्यों।", "/niti/", "हमारी संपादकीय नीति");
const privacyPage = () => mdPage("PRIVACY.md", "निजता नीति", "देशकाल आपकी कौन सी जानकारी रखता है, कहां और कैसे हटवाएं।", "/nijta/", "निजता नीति");
function feed() {
  const items = all.slice(0, 40).map(a => `<item><title>${esc(a.h)}</title><link>${SITE}${href(a)}</link><guid>${SITE}${href(a)}</guid><pubDate>${new Date(a.day + "T01:30:00Z").toUTCString()}</pubDate><category>${esc(a.cat)}</category><description>${esc(a.dek)}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>देशकाल</title><link>${SITE}/</link><description>${esc(TAGLINE)}</description><language>hi</language>${items}</channel></rss>`;
}

/* ---------- write ---------- */
fs.rmSync("dist", { recursive: true, force: true });
const out = (p, s) => { const f = path.join("dist", p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
out("index.html", homePage());
CATS.forEach(c => out(`shreni/${SLUG[c]}/index.html`, catPage(c)));
all.forEach(a => out(`lekh/${a.id}/index.html`, articlePage(a)));
out("purane/index.html", archivePage());
out("mera/index.html", minePage());
out("niti/index.html", policyPage());
out("nijta/index.html", privacyPage());
out("judiye/index.html", joinPage());
out("feed.xml", feed());
{ const latest = all.reduce((m, a) => a.day > m ? a.day : m, "2026-10-05");
  const rows = [["/", latest, "daily"], ["/purane/", latest, "daily"], ["/niti/", "2026-10-05", "monthly"], ["/nijta/", "2026-10-06", "yearly"], ["/judiye/", latest, "weekly"],
    ...CATS.map(c => [`/shreni/${SLUG[c]}/`, latest, "daily"]), ...all.map(a => [href(a), a.day, "monthly"])];
  out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.map(([u, d, f]) => `<url><loc>${SITE}${u}</loc><lastmod>${d}</lastmod><changefreq>${f}</changefreq></url>`).join("\n")}\n</urlset>\n`); }
out("styles.css", fs.readFileSync("src/styles.css", "utf8"));
out("art.js", fs.readFileSync("src/art.js", "utf8"));
out("client.js", fs.readFileSync("src/client.js", "utf8"));
(function copyDir(from, to) {
  for (const f of fs.readdirSync(from)) {
    const src = path.join(from, f), dst = path.join(to, f);
    if (fs.statSync(src).isDirectory()) copyDir(src, dst); else { fs.mkdirSync(to, { recursive: true }); fs.copyFileSync(src, dst); }
  }
})("public", "dist");
out("sw.js", fs.readFileSync("public/sw.js", "utf8").replace("__VERSION__", today.date + "-" + all.length));
console.log(`बन गयी: ${days.length} दिन, ${all.length} टिप्पणियां, ${CATS.length} श्रेणियां`);
