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
    hi: { tag: "विशेष", forSrc: "The Hindu के लिए", by: "लिखा", tr: "हिंदी अनुवाद: देशकाल", orig: "मूल", read: "पूरा पढ़िए", share: "आगे भेजिए", copy: "लिंक कॉपी", also: "यह प्रस्तुति इन भाषाओं में भी:", back: "← मुखपृष्ठ", creditNote: "अनुमति के साथ", viewTitle: "देशकाल की नज़र", thinkTitle: "सोचने के लिए", originalLink: "मूल लेख पढ़ने के लिए यहां क्लिक करें", rights: "इस लेख के सारे अधिकार द हिंदू के पास हैं।" },
    en: { tag: "Special", forSrc: "for The Hindu", by: "By", tr: "English translation: Deshkaal desk", orig: "Original", read: "Read the whole piece", share: "Share", copy: "Copy link", also: "This piece is also in:", back: "← Home", creditNote: "With permission", viewTitle: "Deshkaal’s view", thinkTitle: "A question to consider", originalLink: "Click here to read the original article", rights: "All rights to this article belong to The Hindu." },
    ur: { tag: "خصوصی", forSrc: "The Hindu کے لیے", by: "قلم", tr: "اردو ترجمہ: دیش کال ڈیسک", orig: "اصل", read: "پوری تحریر پڑھیں", share: "آگے بھیجیے", copy: "لنک کاپی", also: "یہ تحریر ان زبانوں میں بھی:", back: "→ سرورق", creditNote: "اجازت کے ساتھ", viewTitle: "دیش کال کی نظر", thinkTitle: "سوچنے کے لیے", originalLink: "اصل مضمون پڑھنے کے لیے یہاں کلک کریں", rights: "اس مضمون کے تمام حقوق دی ہندو کے پاس ہیں۔" },
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
        <p class="vh-by"><strong>${esc(t.by || w.by)}</strong>${(t.place || w.place) ? `<span>·</span>${esc(t.place || w.place)}` : ""}${w.src ? `<span>·</span>${esc(X.forSrc)}` : ""}</p>
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


  /* Sundeep Dougal's accompanying note and interview guide */
  const noteSection = (w, lg) => {
    if (!w.sundeep && !w.nytCommentary) return "";
    const labels = {
      hi: { comment: "संदीप डूगल की टिप्पणी", interview: "इंटरव्यू के वे हिस्से, जो संदीप को याद रहे", watch: "पूरा 12 मिनट का इंटरव्यू देखें", ps: "बाद में जोड़ा गया नोट", nyt: "द न्यू यॉर्क टाइम्स की रिपोर्ट पर एक और टिप्पणी", page: "रिपोर्ट के पन्ने की झलक", source: "NYT में पूरी रिपोर्ट पढ़ें" },
      en: { comment: "A note by Sundeep Dougal", interview: "Passages from the interview that stayed with Sundeep", watch: "Watch the full 12-minute interview", ps: "Postscript", nyt: "Another note on The New York Times report", page: "A page from the report", source: "Read the full NYT report" },
      ur: { comment: "سندیپ ڈوگل کی رائے", interview: "انٹرویو کے وہ حصے جو سندیپ کو یاد رہے", watch: "پورا 12 منٹ کا انٹرویو دیکھیے", ps: "بعد میں شامل کیا گیا نوٹ", nyt: "نیویارک ٹائمز کی رپورٹ پر ایک اور رائے", page: "رپورٹ کے صفحے کی جھلک", source: "NYT کی پوری رپورٹ پڑھیے" }
    };
    const X = labels[lg] || labels.hi, s = w.sundeep, n = w.nytCommentary, p = x => `<p>${esc(x)}</p>`;
    let interview = "";
    if (s) {
      let current = null; const sections = [];
      s.interviewNotes.forEach(x => {
        const m = x.match(/^(\d{2}:\d{2}–\d{2}:\d{2})\s*[–-]\s*(.*)$/);
        if (m) { current = { time: m[1], title: m[2], body: [] }; sections.push(current); }
        else if (current) current.body.push(x);
        else sections.push({ body: [x] });
      });
      interview = `<details class="sd-fold"><summary>${X.interview}</summary><div class="sd-timeline">${sections.map(x => x.time
        ? `<section><time>${esc(x.time)}</time><div><h3>${esc(x.title)}</h3>${x.body.map(p).join("")}</div></section>`
        : x.body.map(p).join("")).join("")}</div></details>`;
    }
    const note = s ? `<section class="sd-notes" aria-label="${X.comment}"><article class="sd-comment" lang="en">
      <header><p class="sd-eyebrow">Sundeep Dougal</p><h2>${X.comment}</h2></header>
      ${s.opening.map(p).join("")}${p(s.interviewLead)}${interview}${s.closing.map(p).join("")}
      ${s.postscript.length ? `<details class="sd-fold sd-post"><summary>${X.ps}</summary><div>${s.postscript.map(p).join("")}</div></details>` : ""}
      <details class="sd-fold sd-video"><summary>${X.watch}</summary><div class="sd-player"><iframe src="https://www.youtube-nocookie.com/embed/4OyfGrQqJW4" title="Interview with Neha Bora" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p><a href="https://youtu.be/4OyfGrQqJW4" target="_blank" rel="noopener">Open the interview on YouTube ↗</a></p></details>
    </article></section>` : "";
    const nyt = n ? `<section class="sd-nyt" lang="en" aria-label="${X.nyt}"><div class="sd-nyt-copy">
      <p class="sd-eyebrow">Sundeep Dougal · The New York Times</p><h2>${X.nyt}</h2><p>${esc(n.note)}</p><blockquote>${esc(n.quote)}</blockquote>
      <p class="sd-nyt-credit">${esc(n.credit)}</p><a class="sd-nyt-link" href="${esc(n.article)}" target="_blank" rel="noopener">${X.source} <span aria-hidden="true">↗</span></a>
    </div><figure><a href="${esc(n.article)}" target="_blank" rel="noopener"><img src="${esc(n.image)}" alt="${esc(X.page)}: ${esc(n.title)}" loading="lazy"></a><figcaption>${esc(n.title)}<br>${esc(X.page)} · ${esc(n.credit)}</figcaption></figure></section>` : "";
    return `<style>
      .sd-notes{margin:36px 0 24px;display:grid;gap:18px;color:var(--ink)}
      .sd-comment,.sd-nyt{background:var(--paper-2);border:1px solid var(--rule);border-radius:22px;padding:clamp(20px,4vw,42px);box-shadow:0 14px 34px rgba(31,33,38,.07)}
      .sd-comment{max-width:920px;margin-inline:auto;font-family:"Source Serif 4",Georgia,serif;line-height:1.72}
      .sd-comment header{border-bottom:1px solid var(--rule);padding-bottom:14px;margin-bottom:20px}
      .sd-eyebrow{font:600 12px/1.4 var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--geru);margin:0 0 8px}
      .sd-comment h2,.sd-nyt h2{font:600 clamp(24px,3vw,34px)/1.2 var(--f-head);margin:0;color:var(--ink)}
      .sd-comment>p{font-size:clamp(16px,1.55vw,19px);margin:0 0 15px}
      .sd-fold{border-top:1px solid var(--rule);margin:20px 0 0;font-family:var(--f-ui)}
      .sd-fold summary{list-style:none;cursor:pointer;padding:16px 4px;color:var(--neel);font-weight:600}
      .sd-fold summary::-webkit-details-marker{display:none}
      .sd-fold summary:after{content:"+";float:right;font-size:21px;line-height:1}
      .sd-fold[open] summary:after{content:"−"}
      .sd-fold summary:focus-visible{outline:2px solid var(--neel);outline-offset:3px}
      .sd-timeline{padding:4px 8px 12px;border-left:2px solid var(--geru);margin-left:7px}
      .sd-timeline section{display:grid;grid-template-columns:100px 1fr;gap:14px;margin:0 0 18px}
      .sd-timeline time{font-size:13px;font-weight:700;color:var(--geru);padding-top:5px}
      .sd-timeline h3{font:600 17px/1.4 var(--f-ui);margin:0 0 4px}
      .sd-timeline p,.sd-fold>div>p{font:16px/1.7 "Source Serif 4",Georgia,serif;margin:0 0 12px}
      .sd-post>div{padding:0 8px 10px}
      .sd-player{position:relative;aspect-ratio:16/9;background:#111;border-radius:14px;overflow:hidden}
      .sd-player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
      .sd-video>p{font:14px var(--f-ui);margin:10px 0}
      .sd-video>p a,.sd-nyt-link{color:var(--geru);font-weight:700;text-decoration:underline;text-underline-offset:3px}
      .sd-nyt{display:grid;grid-template-columns:minmax(0,1fr) minmax(230px,.72fr);gap:clamp(20px,4vw,42px);align-items:center;max-width:1080px;margin:0 auto;direction:ltr}
      .sd-nyt-copy{font-family:"Source Serif 4",Georgia,serif;line-height:1.65}
      .sd-nyt-copy>p{font-size:17px}
      .sd-nyt blockquote{border-left:3px solid var(--geru);padding:4px 0 4px 16px;margin:20px 0;color:var(--ink-2);font-style:italic}
      .sd-nyt-credit{font:13px var(--f-ui);color:var(--ink-2)}
      .sd-nyt-link{display:inline-flex;gap:7px;font:600 14px var(--f-ui)}
      .sd-nyt figure{margin:0}.sd-nyt figure a{display:block}
      .sd-nyt img{display:block;width:100%;height:auto;border:1px solid var(--rule);border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,.14)}
      .sd-nyt figcaption{font:12px/1.5 var(--f-ui);color:var(--ink-2);margin-top:8px}
      @media(max-width:700px){.sd-nyt{grid-template-columns:1fr}.sd-nyt figure{max-width:520px}.sd-timeline section{grid-template-columns:1fr;gap:2px}.sd-timeline{margin-left:0}.sd-comment,.sd-nyt{border-radius:16px}}
    </style>${note}${nyt}`;
  };

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
    <p class="vh-by"><strong>${esc(t.by || w.by)}</strong>${(t.place || w.place) ? `<span>·</span>${esc(t.place || w.place)}` : ""}${w.src ? `<span>·</span>${esc(X.forSrc)}` : ""}</p>
  </header>
  ${img}
  <div class="vh-txt">
    ${t.pull ? `<blockquote class="vh-q vh-q-lead">${esc(t.pull)}</blockquote>` : ""}
    ${(t.body || []).map(para).join("")}
    ${(t.nazar || w.nazar || []).length ? `<aside class="vh-editorial"><p class="vh-section-k">${X.viewTitle}</p><h2>${lg === "hi" ? "आंदोलन का चेहरा, उसके पीछे की मेहनत" : lg === "en" ? "The face of a movement, and the work behind it" : "تحریک کا چہرہ، اور اس کے پیچھے کی محنت"}</h2>${(t.nazar || w.nazar).map(p => `<p>${esc(p)}</p>`).join("")}</aside>` : ""}
    ${(t.sawal || w.sawal) ? `<aside class="vh-sawal"><span>${X.thinkTitle}</span><p>${esc(t.sawal || w.sawal)}</p></aside>` : ""}
    ${w.srcUrl ? `<a class="vh-original" href="${esc(w.srcUrl)}" target="_blank" rel="noopener"><span>${esc(w.src || "")}${w.srcDate ? ` · ${esc(w.srcDate)}` : ""}</span><strong>${X.originalLink}</strong><i aria-hidden="true">↗</i></a>` : ""}
    <p class="vh-rights">${X.rights}</p>
    ${noteSection(w, lg)}
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
