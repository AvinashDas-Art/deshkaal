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
    hi: { tag: "विशेष", by: "लिखा", tr: "हिंदी अनुवाद: देशकाल", orig: "मूल", read: "पूरा पढ़िए", share: "आगे भेजिए", copy: "लिंक कॉपी", also: "यह प्रस्तुति इन भाषाओं में भी:", back: "← मुखपृष्ठ", creditNote: "अनुमति के साथ", viewTitle: "देशकाल की नज़र", thinkTitle: "सोचने के लिए", originalLink: "मूल लेख पढ़ने के लिए यहां क्लिक करें", rights: "इस लेख के सारे अधिकार द हिंदू के पास हैं।" },
    en: { tag: "Special", by: "By", tr: "English translation: Deshkaal desk", orig: "Original", read: "Read the whole piece", share: "Share", copy: "Copy link", also: "This piece is also in:", back: "← Home", creditNote: "With permission", viewTitle: "Deshkaal’s view", thinkTitle: "A question to consider", originalLink: "Click here to read the original article", rights: "All rights to this article belong to The Hindu." },
    ur: { tag: "خصوصی", by: "قلم", tr: "اردو ترجمہ: دیش کال ڈیسک", orig: "اصل", read: "پوری تحریر پڑھیں", share: "آگے بھیجیے", copy: "لنک کاپی", also: "یہ تحریر ان زبانوں میں بھی:", back: "→ سرورق", creditNote: "اجازت کے ساتھ", viewTitle: "دیش کال کی نظر", thinkTitle: "سوچنے کے لیے", originalLink: "اصل مضمون پڑھنے کے لیے یہاں کلک کریں", rights: "اس مضمون کے تمام حقوق دی ہندو کے پاس ہیں۔" },
  };
  const LN = { hi: "हिंदी", en: "English", ur: "اردو" };
  const D = { hi: "अनुवाद", en: "Translated", ur: "ترجمہ" };

  const para = p => /^## /.test(p) ? `<h2 class="vh-sub">${esc(p.slice(3))}</h2>` : `<p>${esc(p)}</p>`;

  const share = (w, lg) => {
    const X = T[lg], u = encodeURIComponent(SITE + url(w, lg)), t = encodeURIComponent(loc(w, lg).h);
    return `<div class="share" data-url="${SITE}${url(w, lg)}" data-title="${esc(loc(w, lg).h)}"><span class="share-l">${X.share}</span>
      <a class="sh" href="https://wa.me/?text=${t}%0A${u}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="sh" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener">Telegram</a>
      <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener">X</a></div>`;
  };

  /* होमपेज की बड़ी पट्टी */
  function band(lg = "hi") {
    const w = ALL.find(x => (Date.parse(LATEST) - Date.parse(x.date)) / 864e5 <= 6);
    if (!w) return "";
    const X = T[lg] || T.hi, t = loc(w, lg);
    const points = t.homePoints || w.homePoints || [];
    const img = w.photo ? `<img src="${esc(w.photo)}" alt="${esc(w.photoAlt || t.h)}" width="320" height="400" loading="lazy" onerror="this.hidden=true;this.parentNode.classList.add(&quot;vh-art-missing&quot;)" />` : "";
    return `<section class="vh-band" data-id="${esc(w.id)}">
  <div class="vh-wrap">
    <div class="vh-top">
      <div class="vh-heading">
        <p class="vh-k"><span class="vh-tag">${X.tag}</span> ${esc(w.src || "")}${w.srcDate ? ` · ${esc(w.srcDate)}` : ""}</p>
        <h2 class="vh-h"><a href="${url(w, lg)}">${esc(t.h)}</a></h2>
        <p class="vh-by">${esc(t.by || w.by)}${w.place ? ` · ${esc(w.place)}` : ""}</p>
      </div>
      ${img ? `<figure class="vh-art">${img}${w.photoCap ? `<figcaption>${esc(w.photoCap)}</figcaption>` : ""}</figure>` : ""}
    </div>
    ${points.length ? `<div class="vh-bottom">
      <div class="vh-points">${points.slice(0, 3).map((p, i) => `<div class="vh-point"><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(p)}</p></div>`).join("")}</div>
      <a class="vh-cta" href="${url(w, lg)}">${X.read} <span aria-hidden="true">→</span></a>
    </div>` : `<a class="vh-cta" href="${url(w, lg)}">${X.read} <span aria-hidden="true">→</span></a>`}
  </div>
</section>`;
  }

  /* पूरा पन्ना */
  function page(w, lg = "hi") {
    const X = T[lg] || T.hi, t = loc(w, lg);
    const alt = { hi: url(w, "hi"), en: url(w, "en"), ur: url(w, "ur") };
    const img = w.photo ? `<figure class="vh-cover"><img src="${esc(w.photo)}" alt="${esc(w.photoAlt || t.h)}" width="1200" height="840" onerror="this.hidden=true;this.parentNode.classList.add(&quot;vh-art-missing&quot;)">${w.photoCap ? `<figcaption>${esc(w.photoCap)}</figcaption>` : ""}</figure>` : "";
    const credit = w.src ? `<p class="vh-credit">${X.orig}: <a href="${esc(w.srcUrl || "#")}" target="_blank" rel="noopener">${esc(w.src)}</a>${w.srcDate ? `, ${esc(w.srcDate)}` : ""} · ${lg === "hi" ? X.tr : X.tr}</p>` : "";
    const body = `<article class="vh-page" data-id="${esc(w.id)}">
  <header class="vh-hero">
    <p class="vh-k"><span class="vh-tag">${X.tag}</span> ${esc(w.src || "")}${w.srcDate ? ` · ${esc(w.srcDate)}` : ""}</p>
    <h1 class="vh-title">${esc(t.h)}</h1>
    <p class="vh-dek">${esc(t.dek || "")}</p>
    <p class="vh-by">${esc(w.by)}${w.place ? ` · ${esc(w.place)}` : ""}</p>
  </header>
  ${img}
  <div class="vh-txt">
    ${t.pull ? `<blockquote class="vh-q vh-q-lead">${esc(t.pull)}</blockquote>` : ""}
    ${(t.body || []).map(para).join("")}
    ${(t.nazar || w.nazar || []).length ? `<aside class="vh-editorial"><p class="vh-section-k">${X.viewTitle}</p><h2>${lg === "hi" ? "आंदोलन का चेहरा, उसके पीछे की मेहनत" : lg === "en" ? "The face of a movement, and the work behind it" : "تحریک کا چہرہ، اور اس کے پیچھے کی محنت"}</h2>${(t.nazar || w.nazar).map(p => `<p>${esc(p)}</p>`).join("")}</aside>` : ""}
    ${(t.sawal || w.sawal) ? `<aside class="vh-sawal"><span>${X.thinkTitle}</span><p>${esc(t.sawal || w.sawal)}</p></aside>` : ""}
    ${w.srcUrl ? `<a class="vh-original" href="${esc(w.srcUrl)}" target="_blank" rel="noopener"><span>${esc(w.src || "")}${w.srcDate ? ` · ${esc(w.srcDate)}` : ""}</span><strong>${X.originalLink}</strong><i aria-hidden="true">↗</i></a>` : ""}
    <p class="vh-rights">${X.rights}</p>
    ${supportEnd ? supportEnd() : ""}
    ${share(w, lg)}
    ${Object.keys(alt).filter(l => l !== lg && l !== "hi" || (l === "hi" && lg !== "hi")).length ? `<p class="vh-also">${X.also} ${Object.keys(alt).filter(l => l !== lg).map(l => `<a href="${alt[l]}" lang="${l}">${LN[l]}</a>`).join(" · ")}</p>` : ""}
    <p class="vh-back"><a href="${P(lg)}/">${X.back}</a></p>
  </div>
</article>`;
    return layout({ title: t.h, desc: t.dek || "", url: url(w, lg), body, tab: "home", catOn: "सब", image: w.photo || "/og.png", published: w.date, alt });
  }

  return { ALL, band, page };
};
