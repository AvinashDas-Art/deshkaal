/* विशेष: एक लंबी, पूरी पढ़ने वाली प्रस्तुति (data/vishesh/<id>.json)
   तीन भाषाएं फ़ाइल के भीतर (h, dek, pull, body; en{}, ur{})।
   होमपेज पर बड़ी पट्टी, और अपना पूरा पन्ना: /vishesh/<id>/ · /en/vishesh/<id>/ · /ur/vishesh/<id>/ */
const fs = require("fs"), path = require("path");

function load() {
  const dir = "data/vishesh";
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => {
    const w = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (!w.id || !w.date || !w.h || !Array.isArray(w.body) || !w.body.length) throw new Error(`vishesh/${f}: id, date, h, body ज़रूरी हैं`);
    return w;
  }).sort((a, b) => (b.pub || b.date).localeCompare(a.pub || a.date));
}

module.exports = function (H) {
  const { layout, esc, dayLabel, SITE, LATEST, supportEnd } = H;
  const ALL = load().filter(w => w.date <= LATEST && w.active !== false);
  const P = lg => (lg === "hi" ? "" : "/" + lg);
  const url = (w, lg = "hi") => `${P(lg)}/vishesh/${w.id}/`;
  const loc = (w, lg) => (lg === "hi" || !w[lg] ? w : { ...w, ...w[lg] });

  const T = {
    hi: { tag: "विशेष", forSrc: "The Hindu के लिए", by: "लिखा", tr: "हिंदी अनुवाद: देशकाल", orig: "मूल", read: "पूरा पढ़िए", share: "आगे भेजिए", copy: "लिंक कॉपी", also: "यह प्रस्तुति इन भाषाओं में भी:", back: "← मुखपृष्ठ", creditNote: "अनुमति के साथ", viewTitle: "देशकाल की नज़र", thinkTitle: "सोचने के लिए", originalLink: "मूल लेख पढ़ने के लिए यहां क्लिक करें", rights: "इस लेख के सारे अधिकार द हिंदू के पास हैं।", booksK: "उनकी किताबें, हिंदी में", allBooks: "सारी हिंदी किताबें →", buy: "अमेज़न पर ख़रीदें →", midK: "इसी लेखक की किताब", authorK: "लेखक परिचय", aboutAuthor: "परिचय और किताबें ↓", noteK: "संपादक की बात", qTitle: "इस पूरे मामले में उठते सवाल", watch: "पूरा वीडियो देखिए", watchNow: "वीडियो देखिए", live: "ताज़ा", sayK: "नेहा बोरा ने क्या कहा", dlVideo: "वीडियो डाउनलोड करें ↓", collageK: "नेहा बोरा, देशकाल के पन्नों में", refsK: "ख़बरों में यह मामला" },
    en: { tag: "Special", forSrc: "for The Hindu", by: "By", tr: "English translation: Deshkaal desk", orig: "Original", read: "Read the whole piece", share: "Share", copy: "Copy link", also: "This piece is also in:", back: "← Home", creditNote: "With permission", viewTitle: "Deshkaal’s view", thinkTitle: "A question to consider", originalLink: "Click here to read the original article", rights: "All rights to this article belong to The Hindu.", booksK: "His books, in Hindi", allBooks: "All Hindi books →", buy: "Buy on Amazon →", midK: "A book by the same author", authorK: "About the author", aboutAuthor: "About him and his books ↓", noteK: "Editor's note", qTitle: "Questions this episode raises", watch: "Watch the full video", watchNow: "Watch the video", live: "Just in", sayK: "What Neha Bora said", dlVideo: "Download the video ↓", collageK: "Neha Bora, across Deshkaal’s pages", refsK: "How the story was reported" },
    ur: { tag: "خصوصی", forSrc: "The Hindu کے لیے", by: "قلم", tr: "اردو ترجمہ: دیش کال ڈیسک", orig: "اصل", read: "پوری تحریر پڑھیں", share: "آگے بھیجیے", copy: "لنک کاپی", also: "یہ تحریر ان زبانوں میں بھی:", back: "→ سرورق", creditNote: "اجازت کے ساتھ", viewTitle: "دیش کال کی نظر", thinkTitle: "سوچنے کے لیے", originalLink: "اصل مضمون پڑھنے کے لیے یہاں کلک کریں", rights: "اس مضمون کے تمام حقوق دی ہندو کے پاس ہیں۔", booksK: "ان کی کتابیں، ہندی میں", allBooks: "ساری ہندی کتابیں ←", buy: "ایمیزون پر خریدیں ←", midK: "اسی مصنف کی کتاب", authorK: "مصنف کا تعارف", aboutAuthor: "تعارف اور کتابیں ↓", noteK: "مدیر کی بات", qTitle: "اس پورے معاملے میں اٹھتے سوال", watch: "پوری ویڈیو دیکھیں", watchNow: "ویڈیو دیکھیں", live: "تازہ", sayK: "نیہا بورا نے کیا کہا", dlVideo: "ویڈیو ڈاؤن لوڈ کریں ↓", collageK: "نیہا بورا، دیش کال کے صفحوں میں", refsK: "خبروں میں یہ معاملہ" },
  };
  const LN = { hi: "हिंदी", en: "English", ur: "اردو" };
  const D = { hi: "अनुवाद", en: "Translated", ur: "ترجمہ" };


  /* विशेष हमसफ़र: लेखक-परिचय और किताबों की पट्टी (w.author, w.books) */
  const pick = (o, lg) => (o && (o[lg] || o.hi)) || {};
  const tagOf = (w, t, X) => t.tag || w.tag || X.tag;
  const bookTile = (b, lg, X, cls = "") => { const k = pick(b, lg); return `<a class="vh-book${cls}" style="--bk:${esc(b.c || "#2E3F8F")}" href="${esc(b.url)}" target="_blank" rel="noopener"><b>${esc(k.t)}</b><small>${esc(k.s || "")}</small><i>${X.buy}</i></a>`; };
  const booksStrip = (w, lg, X) => (w.books && w.books.length) ? `<div class="vh-books"><div class="vh-books-h"><span>${X.booksK}</span>${w.allBooksUrl ? `<a href="${esc(w.allBooksUrl)}" target="_blank" rel="noopener">${X.allBooks}</a>` : ""}</div><div class="vh-books-grid">${w.books.map(b => bookTile(b, lg, X)).join("")}</div></div>` : "";
  const midBook = (w, lg, X) => { const b = (w.books || [])[w.midBook || 0]; if (!b) return ""; const k = pick(b, lg); return `<aside class="vh-mid" style="--bk:${esc(b.c || "#2E3F8F")}"><div class="vh-mid-t"><b>${esc(k.t)}</b></div><div class="vh-mid-b"><small>${X.midK}</small><strong>${esc(k.t)}</strong><p>${esc(k.s || "")}</p><a href="${esc(b.url)}" target="_blank" rel="noopener">${X.buy}</a></div></aside>`; };
  const authorStrip = (w, lg, X) => { if (!w.author) return ""; const a = pick(w.author, lg); return `<div class="vh-auth"><img src="${esc(w.author.photo)}" alt="${esc(a.name)}" width="64" height="64" loading="lazy"><div><strong>${esc(a.name)}</strong><span>${esc(a.role || "")}</span><a href="#parichay">${X.aboutAuthor}</a></div></div>`; };
  const authorBox = (w, lg, X) => { if (!w.author) return ""; const a = pick(w.author, lg); return `<section class="vh-about" id="parichay"><p class="vh-section-k">${X.authorK}</p><div class="vh-about-r"><img src="${esc(w.author.photo)}" alt="${esc(a.name)}" width="220" height="220" loading="lazy"><div><h2>${esc(a.name)}</h2>${(a.bio || []).map(p => `<p>${esc(p)}</p>`).join("")}${w.author.site ? `<p class="vh-about-site"><a href="${esc(w.author.site)}" target="_blank" rel="noopener">${esc(w.author.site.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a></p>` : ""}</div></div>${booksStrip(w, lg, X)}</section>`; };
  const para = p => /^## /.test(p) ? `<h2 class="vh-sub">${esc(p.slice(3))}</h2>` : `<p>${esc(p)}</p>`;


  /* कोलाज: w.collage = [{src, alt, pos}] की तस्वीरें, लहराते झंडे की तरह; w.collageCap हर भाषा में */
  const collage = (w, cls = "", count = 0) => {
    const base = w.collage || [];
    if (!base.length) return "";
    const c = count ? Array.from({ length: count }, (_, k) => base[k % base.length]) : base;
    return `<div class="nbc ${cls}" aria-hidden="true">${c.map((x, i) => `<figure style="--i:${i};--c:${i % 8};--r:${(((i * 37) % 7) - 3) * 0.9}deg;--lift:${((i * 53) % 5) * 5}px"><img src="${esc(x.src)}" alt="" width="240" height="300" loading="${cls.includes("nbc-hero") && i < 5 ? "eager" : "lazy"}" decoding="async"${x.pos ? ` style="object-position:${esc(x.pos)}"` : ""}></figure>`).join("")}</div>`;
  };
  /* अपना वीडियो (mp4) या YouTube */
  const videoTag = (w, t, attrs = "") => {
    const v = w.video || {};
    if (v.src) return `<video class="nb-video" controls playsinline preload="${v.preload || "metadata"}"${v.poster ? ` poster="${esc(v.poster)}"` : ""} ${attrs}><source src="${esc(v.src)}" type="video/mp4">${(v.tracks || []).map(k => `<track kind="subtitles" srclang="${esc(k.lang)}" label="${esc(k.label)}" src="${esc(k.src)}"${k.default ? " default" : ""}>`).join("")}</video>`;
    if (v.id) return `<div class="vh-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(t.videoTitle || t.h)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
    return "";
  };

  const share = (w, lg) => {
    const X = T[lg], u = encodeURIComponent(SITE + url(w, lg)), t = encodeURIComponent(loc(w, lg).h);
    return `<div class="share" data-url="${SITE}${url(w, lg)}" data-title="${esc(loc(w, lg).h)}"><span class="share-l">${X.share}</span>
      <a class="sh" href="https://wa.me/?text=${t}%0A${u}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="sh" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener">Telegram</a>
      <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener">X</a></div>`;
  };

  /* होमपेज की बड़ी पट्टी */
  function band(lg = "hi") {
    const w = ALL.find(x => x.homeFeature !== false && (Date.parse(LATEST) - Date.parse(x.date)) / 864e5 <= 6);
    if (!w) return "";
    const X = T[lg] || T.hi, t = loc(w, lg);

    const points = t.homePoints || w.homePoints || [];
    const related = w.homeLinks || [];

    const bandImg = w.bandPhoto || w.photo, img = bandImg ? `<img src="${esc(bandImg)}"${w.bandPos ? ` style="object-position:${esc(w.bandPos)}"` : ""} alt="${esc(w.photoAlt || t.h)}" width="320" height="400" loading="lazy" onerror="this.hidden=true;this.parentNode.classList.add(&quot;vh-art-missing&quot;)" />` : "";
    return `<section class="vh-band" data-id="${esc(w.id)}">
  <div class="vh-wrap">
    <div class="vh-top">
      <div class="vh-heading">
        <p class="vh-k"><span class="vh-tag">${esc(tagOf(w, t, X))}</span> ${esc(w.src || "")}${w.srcDate ? ` · ${esc(w.srcDate)}` : ""}</p>
        <h2 class="vh-h"><a href="${url(w, lg)}">${esc(t.h)}</a></h2>
        <p class="vh-by"><strong>${esc(t.by || w.by)}</strong>${(t.place || w.place) ? `<span>·</span>${esc(t.place || w.place)}` : ""}${w.src === "The Hindu" ? `<span>·</span>${esc(X.forSrc)}` : ""}</p>
      </div>
      ${img ? `<figure class="vh-art">${img}${w.photoCap ? `<figcaption>${esc(w.photoCap)}</figcaption>` : ""}</figure>` : ""}
    </div>
    ${points.length ? `<div class="vh-bottom">
      <div class="vh-points">${points.slice(0, 3).map((p, i) => `<div class="vh-point"><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(p)}</p></div>`).join("")}</div>
      <a class="vh-cta" href="${url(w, lg)}">${X.read} <span aria-hidden="true">→</span></a>
    </div>` : `<a class="vh-cta" href="${url(w, lg)}">${X.read} <span aria-hidden="true">→</span></a>`}
    ${booksStrip(w, lg, X)}
    ${related.length ? `<nav class="vh-related" aria-label="${lg==="en"?"More on Neha Bora":lg==="ur"?"نیہا بورا پر مزید":"नेहा बोरा पर और पढ़ें"}">
      <span>${lg==="en"?"MORE ON NEHA BORA":lg==="ur"?"مزید مطالعہ":"इस विशेष में"}</span>
      ${related.map(x=>`<a href="${url({id:x.id},lg)}">${esc(x[lg]||x.hi||x.id)} <i aria-hidden="true">↗</i></a>`).join("")}
    </nav>`:""}
  </div>
</section>`;
  }


  /* मुखपृष्ठ की ताज़ा बड़ी हेडलाइन: लहराता कोलाज + वीडियो (w.lead = true, w.leadUntil = "YYYY-MM-DD") */
  function lead(lg = "hi") {
    const w = ALL.find(x => x.lead && (!x.leadUntil || LATEST <= x.leadUntil));
    if (!w) return "";
    const X = T[lg] || T.hi, t = loc(w, lg), v = w.video || {};
    const pts = (t.homePoints || w.homePoints || []).slice(0, 3);
    return `<section class="nbl" data-id="${esc(w.id)}" aria-labelledby="nbl-h">
  <div class="nbl-flag">${collage(w, "nbc-hero", 18)}</div><span class="nbl-shade" aria-hidden="true"></span>
  <div class="nbl-in">
    <div class="nbl-txt">
      <p class="nbl-k"><span class="vh-tag">${X.live}</span> ${esc(t.leadKicker || "")}</p>
      <h2 id="nbl-h" class="nbl-h"><a href="${url(w, lg)}">${t.leadA ? `<span class="a">${esc(t.leadA)}</span> ` : ""}${esc(t.leadB || t.h)}</a></h2>
      <p class="nbl-dek">${esc(t.dek || "")}</p>
      ${pts.length ? `<ul class="nbl-pts">${pts.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      <a class="nbl-cta" href="${url(w, lg)}">${X.read} <span aria-hidden="true">→</span></a>
    </div>
    ${v.src ? `<figure class="nbl-vid"><div class="nbl-vf">${videoTag(w, t, "")}</div><figcaption>${esc(t.leadVideoCap || "")}</figcaption></figure>` : ""}
  </div>
</section>`;
  }

  /* पूरा पन्ना */
  function page(w, lg = "hi") {
    const X = T[lg] || T.hi, t = loc(w, lg);
    const pageSrc = t.src || w.src || "";
    const pageSrcDate = t.srcDate || w.srcDate || "";
    const pageSrcUrl = t.srcUrl || w.srcUrl || "";
    const sourceFor = t.sourceFor || (pageSrc === "The Hindu" ? X.forSrc : pageSrc ? pageSrc : "");
    const rightsText = w.rights ? (w.rights[lg] ?? w.rights.hi ?? "") : X.rights;
    const translationNote = t.translationNote || (pageSrc === "The Hindu" ? X.tr : "");

    const alt = { hi: url(w, "hi"), en: url(w, "en"), ur: url(w, "ur") };
    const img = w.photo ? `<figure class="vh-cover"><img src="${esc(w.photo)}" alt="${esc(t.photoAlt || w.photoAlt || t.h)}" width="1200" height="840" onerror="this.hidden=true;this.parentNode.classList.add(&quot;vh-art-missing&quot;)">${(t.photoCap || w.photoCap) ? `<figcaption>${esc(t.photoCap || w.photoCap)}</figcaption>` : ""}</figure>` : "";
    const credit = pageSrc ? `<p class="vh-credit">${X.orig}: <a href="${esc(pageSrcUrl || "#")}" target="_blank" rel="noopener">${esc(pageSrc)}</a>${pageSrcDate ? `, ${esc(pageSrcDate)}` : ""}${translationNote ? ` · ${esc(translationNote)}` : ""}${w.mirror ? ` · <a href="${esc(w.mirror.url)}" target="_blank" rel="noopener">${esc(w.mirror.label)}</a>` : ""}</p>` : "";
    const vLabel = t.videoLabel || (lg === "en" ? "Watch the interview" : lg === "ur" ? "انٹرویو دیکھیے" : "इंटरव्यू देखिए");
    const vidBlock = w.video && (w.video.id || w.video.src) ? `<section class="vh-video${w.video.src ? " vh-video-own" : ""}" id="video"><p class="vh-section-k">${esc(vLabel)}</p>${w.video.src ? `<div class="nb-vframe">${videoTag(w, t)}</div><p class="vh-video-link">${t.videoCap ? `<span>${esc(t.videoCap)}</span> ` : ""}<a href="${esc(w.video.src)}" download>${X.dlVideo}</a></p>` : `${videoTag(w, t)}<p class="vh-video-link"><a href="https://youtu.be/${esc(w.video.id)}" target="_blank" rel="noopener">${lg === "en" ? "Open on YouTube ↗" : lg === "ur" ? "یوٹیوب پر دیکھیں ↗" : "यूट्यूब पर देखें ↗"}</a></p>`}</section>` : "";
    const collageBlock = w.collage ? `<figure class="nbc-wrap"><div class="nbc-page-in">${collage(w, "nbc-page")}</div><figcaption>${esc(t.collageCap || X.collageK)}</figcaption></figure>` : "";
    const refsBlock = (t.refs || w.refs || []).length ? `<aside class="vh-refs"><p class="vh-section-k">${X.refsK}</p><ul>${(t.refs || w.refs).map(r => `<li><a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.t)}</a><span>${esc(r.s || "")}</span></li>`).join("")}</ul></aside>` : "";
    const qBlock = (t.questions || w.questions || []).length ? `<aside class="vh-qs"><p class="vh-section-k">${X.qTitle}</p><ol>${(t.questions || w.questions).map(q => `<li>${esc(q)}</li>`).join("")}</ol></aside>` : "";
    const body = `<article class="vh-page" data-id="${esc(w.id)}">
  <header class="vh-hero">
    <p class="vh-k"><span class="vh-tag">${esc(tagOf(w, t, X))}</span> ${esc(pageSrc)}${pageSrcDate ? ` · ${esc(pageSrcDate)}` : ""}</p>
    <h1 class="vh-title">${esc(t.h)}</h1>
    <p class="vh-dek">${esc(t.dek || "")}</p>
    ${w.author ? "" : `<p class="vh-by"><strong>${esc(t.by || w.by)}</strong>${(t.place || w.place) ? `<span>·</span>${esc(t.place || w.place)}` : ""}${sourceFor && w.src === "The Hindu" ? `<span>·</span>${esc(sourceFor)}` : ""}</p>`}
    ${authorStrip(w, lg, X)}
    ${t.note ? `<p class="vh-note"><b>${X.noteK}</b>${esc(t.note)}</p>` : ""}
  </header>
  ${collageBlock || img}
  <div class="vh-txt">
    ${w.video && w.video.top ? vidBlock : ""}
    ${t.pull ? `<blockquote class="vh-q vh-q-lead">${esc(t.pull)}</blockquote>` : ""}
    ${(t.body || []).map((p, i, arr) => para(p) + (w.books && i === Math.floor((arr.length - 1) / 2) ? midBook(w, lg, X) : "")).join("")}
    ${w.video && !w.video.top ? vidBlock : ""}
    ${(t.nazar || w.nazar || []).length ? `<aside class="vh-editorial"><p class="vh-section-k">${X.viewTitle}</p><h2>${t.nazarTitle || w.nazarTitle || (lg === "hi" ? "आंदोलन का चेहरा, उसके पीछे की मेहनत" : lg === "en" ? "The face of a movement, and the work behind it" : "تحریک کا چہرہ، اور اس کے پیچھے کی محنت")}</h2>${(t.nazar || w.nazar).map(p => `<p>${esc(p)}</p>`).join("")}</aside>` : ""}
    ${qBlock}
    ${(t.sawal || w.sawal) ? `<aside class="vh-sawal"><span>${X.thinkTitle}</span><p>${esc(t.sawal || w.sawal)}</p></aside>` : ""}
    ${refsBlock}
    ${authorBox(w, lg, X)}
    ${w.firstPub ? `<p class="vh-first">${esc(w.firstPub[lg] || w.firstPub.hi)}</p>` : ""}
    ${pageSrcUrl ? `<a class="vh-original" href="${esc(pageSrcUrl)}" target="_blank" rel="noopener"><span>${esc(pageSrc)}${pageSrcDate ? ` · ${esc(pageSrcDate)}` : ""}</span><strong>${X.originalLink}</strong><i aria-hidden="true">↗</i></a>` : ""}
    ${rightsText ? `<p class="vh-rights">${esc(rightsText)}</p>` : ""}

    ${supportEnd ? supportEnd() : ""}
    ${share(w, lg)}
    ${Object.keys(alt).filter(l => l !== lg && l !== "hi" || (l === "hi" && lg !== "hi")).length ? `<p class="vh-also">${X.also} ${Object.keys(alt).filter(l => l !== lg).map(l => `<a href="${alt[l]}" lang="${l}">${LN[l]}</a>`).join(" · ")}</p>` : ""}
    <p class="vh-back"><a href="${P(lg)}/">${X.back}</a></p>
  </div>
</article>`;
    return layout({ title: t.h, desc: t.dek || "", url: url(w, lg), body, tab: "home", catOn: "सब", image: w.og || w.photo || "/og.png", published: w.date, alt });
  }

  return { ALL, band, page, lead };
};
