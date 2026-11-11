/* विशेष: सोनिया गांधी की किताब 'बिलॉन्गिंग' (data/sonia.json)
   होमपेज पर सबसे ऊपर एक गहरे रंग की पट्टी, और अपना पूरा पन्ना: /belonging/ · /en/belonging/ · /ur/belonging/ */
const fs = require("fs");

function load() {
  try { return JSON.parse(fs.readFileSync("data/sonia.json", "utf8")); } catch { return null; }
}

module.exports = function (H) {
  const { layout, esc, SITE, LATEST } = H;
  const D = load();
  if (!D) return { band: () => "", page: () => null, URL: () => "/belonging/" };

  const P = lg => (lg === "hi" ? "" : "/" + lg);
  const URL = lg => `${P(lg)}/belonging/`;
  const loc = lg => (lg === "hi" ? D : { ...D, ...(D[lg] || {}) });
  const active = D.active !== false && (!D.date || D.date <= (LATEST || "9999"));

  const T = {
    hi: {
      date: "11 नवंबर 2026", book: "किताब", read: "पूरा विशेष पढ़ें",
      from: "किताब के पन्नों से", inside: "किताब में क्या-क्या", fight: "राजनीति की जंग",
      all: "सब कुछ, एक जगह", buy: "किताब कहां मिलेगी", price: "क़ीमत", pages: "पन्ने",
      pub: "प्रकाशक", credits: "तस्वीरें: हार्पर कॉलिन्स, PTI, हिंदुस्तान टाइम्स/Getty, इंडियन एक्सप्रेस, तेलंगाना टुडे, और किताब के पन्ने।",
      open: "लेख खोलिए", back: "← देशकाल"
    },
    en: {
      date: "11 November 2026", book: "The book", read: "Read the full special",
      from: "From the book", inside: "What is inside", fight: "The political fight",
      all: "Everything, in one place", buy: "Where to find it", price: "Price", pages: "Pages",
      pub: "Publisher", credits: "Photographs: HarperCollins, PTI, Hindustan Times/Getty, The Indian Express, Telangana Today, and pages from the book.",
      open: "Open the piece", back: "← Deshkaal"
    },
    ur: {
      date: "11 نومبر 2026", book: "کتاب", read: "پوری خصوصی تحریر پڑھیں",
      from: "کتاب کے صفحات سے", inside: "کتاب میں کیا ہے", fight: "سیاست کی جنگ",
      all: "سب کچھ ایک جگہ", buy: "کتاب کہاں ملے گی", price: "قیمت", pages: "صفحات",
      pub: "ناشر", credits: "تصاویر: ہارپر کولنز، پی ٹی آئی، ہندوستان ٹائمز/Getty، انڈین ایکسپریس، تلنگانہ ٹوڈے، اور کتاب کے صفحات۔",
      open: "تحریر کھولیں", back: "← دیش کال"
    }
  };

  const quote = (q, lg) => `<blockquote class="sg-quote"><p>“${esc(q.t)}”</p><cite>${esc(q.w)}</cite></blockquote>`;

  /* ---------- होमपेज की पट्टी ---------- */
  function band(lg = "hi") {
    if (!active) return "";
    const X = T[lg] || T.hi, t = loc(lg);
    const photos = (D.photos || []).slice(1, 5);
    const strip = photos.map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p[lg] || p.hi)}" loading="lazy" width="420" height="280"><figcaption>${esc(p[lg] || p.hi)}</figcaption></figure>`).join("");
    return `<section class="sg-band" data-id="${esc(D.id)}">
  <div class="sg-top">
    <div class="sg-copy">
      <p class="sg-k"><span class="sg-tag">${esc(t.tag || D.tag)}</span><span class="sg-when">${X.date} · ${X.book}</span></p>
      <h2 class="sg-h"><a href="${URL(lg)}">${esc(t.h)}</a></h2>
      <p class="sg-dek">${esc(t.dek)}</p>
      <p class="sg-meta">${esc(t.meta)}</p>
      <a class="sg-cta" href="${URL(lg)}">${esc(t.cta || X.read)} <span aria-hidden="true">→</span></a>
    </div>
    <figure class="sg-cover">
      <img src="${esc(D.buy.cover)}" alt="${esc(t.h)}" width="590" height="956">
      <figcaption>${esc((D.photos[0] && (D.photos[0][lg] || D.photos[0].hi)) || "")}</figcaption>
    </figure>
  </div>
  <div class="sg-strip">
    <p class="sg-strip-k">${esc(X.from)}</p>
    <div class="sg-strip-g">${strip}</div>
  </div>
</section>`;
  }

  /* ---------- पूरा पन्ना ---------- */
  function page(lg = "hi") {
    if (!active) return null;
    const X = T[lg] || T.hi, t = loc(lg);
    const photos = (D.photos || []).slice(1).map((p) => `<figure><img src="${esc(p.src)}" alt="${esc(p[lg] || p.hi)}" loading="lazy"><figcaption>${esc(p[lg] || p.hi)}${p.credit ? ` <span class="sg-credit">${esc(p.credit)}</span>` : ""}</figcaption></figure>`).join("");
    const facts = (t.facts || D.facts || []).map(f => `<li>${esc(f)}</li>`).join("");
    const quotes = (t.quotes || D.quotes || []).map(q => quote({ t: q.t || q.hi, w: q.w || q.who_hi }, lg)).join("");
    const cards = (D.cards || []).map(c => {
      const h = c[lg] || c.h || c.en || "";
      return `<li><a href="${esc(c.url)}" target="_blank" rel="noopener"><span class="sg-card-h">${esc(h)}</span><span class="sg-card-m">${esc(c.pub)} · ${esc(c.date)}</span><span class="sg-card-o" aria-hidden="true">↗</span></a></li>`;
    }).join("");
    const body = `<article class="sg-page">
  <a class="back" href="${P(lg)}/">${X.back}</a>
  <header class="sg-hero">
    <div class="sg-hero-copy">
      <p class="sg-k"><span class="sg-tag">${esc(t.tag || D.tag)}</span><span class="sg-when">${X.date} · ${X.book}</span></p>
      <h1 class="sg-hh">${esc(t.h)}</h1>
      <p class="sg-dek">${esc(t.dek)}</p>
      <p class="sg-meta">${esc(t.meta)}</p>
    </div>
    <figure class="sg-cover"><img src="${esc(D.buy.cover)}" alt="${esc(t.h)}" width="590" height="956"><figcaption>${esc(X.from)}</figcaption></figure>
  </header>
  <div class="sg-intro">${(t.intro || D.intro || []).map(p => `<p>${esc(p)}</p>`).join("")}</div>
  <section class="sg-facts"><h2>${esc(X.inside)}</h2><ol>${facts}</ol></section>
  <section class="sg-quotes">${quotes}</section>
  <section class="sg-gallery"><h2>${esc(X.from)}</h2><div class="sg-g-grid">${photos}</div></section>
  <section class="sg-cards"><h2>${esc(X.all)}</h2><ol>${cards}</ol></section>
  <aside class="sg-buy"><h2>${esc(X.buy)}</h2><p><b>${esc(D.buy.pub)}</b> · ${X.pages}: ${esc(D.buy.pages)} · ${X.price}: ${esc(D.buy.price)}</p><p><a class="sg-buy-l" href="${esc(D.buy.url)}" target="_blank" rel="noopener">harpercollins.co.in ↗</a></p><p class="sg-fine">${esc(X.credits)}</p></aside>
</article>`;
    return layout({
      title: t.h,
      desc: t.dek,
      url: URL(lg),
      body,
      tab: "home",
      catOn: "सब",
      image: D.buy.cover,
      alt: { hi: "/belonging/", en: "/en/belonging/", ur: "/ur/belonging/" }
    });
  }

  return { band, page, URL };
};
