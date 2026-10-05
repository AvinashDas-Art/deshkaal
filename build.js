// देशकाल: स्थिर साइट बनाने वाली स्क्रिप्ट। चलाएं: node build.js  (कोई बाहरी पैकेज ज़रूरी नहीं)
// data/days/*.json पढ़ कर dist/ में पूरी साइट लिखती है।
const fs = require("fs"), path = require("path");
const SITE = "https://deshkaal.xyz";
const TAGLINE = "ख़बरों का शोर नहीं, अवाम के सवालों की आवाज़";
const CATS = ["देश","दुनिया","समाज","अर्थ","पर्यावरण","स्त्री","संस्कृति","साहित्य"];
const SLUG = {"देश":"desh","दुनिया":"duniya","समाज":"samaj","अर्थ":"arth","पर्यावरण":"paryavaran","स्त्री":"stri","संस्कृति":"sanskriti","साहित्य":"sahitya"};
const MONTHS = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
const DAYS = ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"];

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dayLabel = d => { const t = new Date(d + "T00:00:00Z"); return `${DAYS[t.getUTCDay()]}, ${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}`; };
const words = a => [a.h, a.dek, ...a.body, ...a.nazar].join(" ").split(/\s+/).length;
const readMin = a => Math.max(1, Math.round(words(a) / 200));
const listenMin = a => Math.max(1, Math.round(words(a) / 130));
const href = a => `/lekh/${a.id}/`;
const art = (a, cls = "") => `<canvas class="art ${cls}" data-id="${esc(a.id)}" data-motif="${esc(a.motif)}" data-seed="${a.seed}" data-h="${esc(a.h)}" data-cat="${esc(a.cat)}" role="img" aria-label="${esc(a.h)} के लिए कोलाज"></canvas>`;
const saveBtn = a => `<button class="save" data-save="${esc(a.id)}" data-h="${esc(a.h)}" aria-pressed="false">+ सहेजें</button>`;

/* ---------- data ---------- */
const dayFiles = fs.readdirSync("data/days").filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
const days = dayFiles.map(f => ({ date: f.slice(0, 10), items: JSON.parse(fs.readFileSync(path.join("data/days", f), "utf8")) }));
const all = days.flatMap(d => d.items);
if (!days.length) throw new Error("data/days में कोई दिन नहीं मिला");
const today = days[0];

/* ---------- layout ---------- */
function layout({ title, desc, url, body, tab = "", catOn = "", extraHead = "" }) {
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
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F1F2EE">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/icon-192.png">
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
    <span><a href="/niti/" style="color:var(--geru)">हमारी संपादकीय नीति</a> · <a href="/purane/" style="color:var(--geru)">आर्काइव</a> · <a href="/feed.xml" style="color:var(--geru)">RSS</a></span>
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
      <p class="note">अभी ये जानकारी सिर्फ़ आपके इसी फ़ोन या कंप्यूटर में रहती है।</p>
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
  if (i > 0 && i < h.length - 4) return [h.slice(0, i + 1), h.slice(i + 1).trim()];
  const w = h.split(" "); return [w.slice(0, 2).join(" "), w.slice(2).join(" ")];
}
const hero = L => { const [a1, a2] = splitHead(L.h); return `<section class="hero">
  <a class="hero-art" href="${href(L)}" tabindex="-1">${art(L)}</a><span class="hero-slash" aria-hidden="true"></span>
  <div class="hero-text">
    <p class="kicker">आज की बड़ी बहस · ${L.cat}</p>
    <a href="${href(L)}"><h2 class="hero-h"><span class="acc">${esc(a1)}</span> ${esc(a2)}</h2></a>
    ${L.ank && L.ank.length ? `<div class="ank">${L.ank.slice(0, 2).map(([n, t]) => `<div><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>` : ""}
    <p class="dek">${esc(L.dek)}</p>
    <div class="hero-foot">
      <div class="hero-open"><p>${esc(L.body[0])}</p><a class="hero-more" href="${href(L)}">पूरा सार पढ़ें →</a></div>
      <aside class="sawal"><small>आज का सवाल</small><p>${esc(L.sawal)}</p></aside>
    </div>
    <div class="row"><span>मूल: ${esc(L.by)} · ${esc(L.pub)} · ${esc(L.date)}</span><span>पढ़ें ${readMin(L)} मिनट · सुनें ${listenMin(L)} मिनट</span>${saveBtn(L)}</div>
  </div></section>`; };
const connect = `<section class="band">
  <div><h4>रविवार विशेष</h4><p>हफ़्ते की पांच सबसे ज़रूरी टिप्पणियां, गहरे संदर्भ के साथ, हर रविवार।</p><div class="act"><span class="chip">हर रविवार सुबह</span></div></div>
  <div><h4>हर सुबह आपके पास</h4><p>सुबह 7 बजे की सारी टिप्पणियां, सीधे आपके ईमेल इनबॉक्स में।</p><div class="act"><form class="sub" id="subf"><input id="email" type="email" required placeholder="aapka@email.com" aria-label="ईमेल"><button class="btn">जुड़ें</button></form></div><p class="note" id="subnote"></p></div>
  <div><h4>चैनल पर भी</h4><p>नयी टिप्पणियां WhatsApp और Telegram पर भी, अपने आप, हर सुबह।</p><div class="act"><span class="chip">WhatsApp · जल्द</span><span class="chip">Telegram · जल्द</span></div></div>
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
  else { const [L, ...rest] = list; body = lead(L, "ताज़ा") + (rest.length ? `<section class="grid">${rest.map(card).join("")}</section>` : ""); }
  return layout({ title: c, desc: `${c}: देशकाल पर चुनी गयी टिप्पणियों के सार।`, url: `/shreni/${SLUG[c]}/`, body, tab: c === "साहित्य" ? "" : "", catOn: c });
}
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
    <figure class="figure" style="margin-inline:0">${art(a)}<figcaption class="cap">कोलाज: देशकाल</figcaption></figure>
    <div class="body">${a.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
    <aside class="box"><h5>देशकाल की नज़र</h5>${a.nazar.map(p => `<p>${esc(p)}</p>`).join("")}</aside>
    <aside class="sawal"><small>सोचने के लिए</small><p>${esc(a.sawal)}</p></aside>
    <aside class="box ref"><h5>संदर्भ</h5><dl>${a.ref.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl></aside>
    <a class="cta" href="${esc(a.url)}" target="_blank" rel="noopener"><strong>पूरा लेख पढ़ने के लिए यहां क्लिक करें</strong><span>${esc(a.pub)} पर, ${esc(a.lang)} में · मुफ़्त</span></a>
    <p class="fine">ये सार देशकाल का अपना लेखन है। मूल लेख के सारे अधिकार ${esc(a.pub)} के पास हैं।</p>
    <div class="more"><h6>आगे पढ़ें</h6>${others.map(o => `<a href="${href(o)}">${esc(o.h)}</a>`).join("")}</div>
  </article>
  <script type="application/json" id="article-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  return layout({ title: a.h, desc: a.dek, url: href(a), body, catOn: a.cat });
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
function minePage() {
  return layout({ title: "मेरा देशकाल", desc: "सहेजे गये लेख और पसंद की श्रेणियां।", url: "/mera/", body: `<section class="page2" id="mine" data-cats='${JSON.stringify(CATS)}'></section>`, tab: "mera" });
}
function policyPage() {
  const md = fs.readFileSync("EDITORIAL.md", "utf8");
  const html = md.split(/\n\n+/).map(b => {
    if (b.startsWith("# ")) return "";
    if (b.startsWith("## ")) return `<h4>${esc(b.slice(3))}</h4>`;
    if (/^- /m.test(b)) return `<ul>${b.split("\n").filter(l => l.startsWith("- ")).map(l => `<li>${esc(l.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${esc(b)}</p>`;
  }).join("");
  return layout({ title: "संपादकीय नीति", desc: "देशकाल किन टिप्पणियों को चुनता है और क्यों।", url: "/niti/", body: `<section class="page2 policy"><h2>हमारी संपादकीय नीति</h2>${html}</section>` });
}
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
out("feed.xml", feed());
out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/purane/", "/niti/", ...CATS.map(c => `/shreni/${SLUG[c]}/`), ...all.map(href)].map(u => `<url><loc>${SITE}${u}</loc></url>`).join("")}</urlset>`);
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
