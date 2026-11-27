/* विज्ञप्ति: किसी संस्था/आयोजक की ओर से आयी सूचना का अपना पन्ना (data/vijnipti/<id>.json)
   तीन भाषाएं फ़ाइल के भीतर (h, h2, dek, body; en/ur भी उसी फ़ाइल में)।
   अपना पन्ना: /vijnipti/<id>/ · /en/vijnipti/<id>/ · /ur/vijnipti/<id>/
   होमपेज पर "विज्ञापन" की तरह एक न्योता-पट्टी। */
const fs = require("fs"), path = require("path");

function load() {
  const dir = "data/vijnipti";
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => {
    const w = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (!w.id || !w.date || !w.h || !w.h2 || !w.dek || !w.body) throw new Error(`vijnipti/${f}: id, date, h, h2, dek, body ज़रूरी हैं`);
    return w;
  }).sort((a, b) => (b.pub || b.date).localeCompare(a.pub || a.date));
}

module.exports = function (H) {
  const { layout, esc, dayLabel, SITE, LATEST, supportEnd } = H;
  const ALL = load().filter(w => w.date <= LATEST && w.active !== false);
  const P = lg => (lg === "hi" ? "" : "/" + lg);
  const url = (w, lg = "hi") => `${P(lg)}/vijnipti/${w.id}/`;
  const txt = (o, lg) => (o && (o[lg] || o.hi)) || "";

  const T = {
    hi: {
      tag: "विज्ञप्ति", back: "← मुखपृष्ठ", glance: "सम्मान, एक नज़र में",
      fieldsK: "किन विषयों की कृति", awardK: "सम्मान में", judgesK: "निर्णायक",
      judges: "तीन", deadlineK: "अंतिम तिथि", jump: "प्रविष्टि कहां भेजें ↓",
      sendK: "नामांकन", phone: "मोबाइल", share: "आगे भेजिए", copy: "लिंक कॉपी",
      also: "यह विज्ञप्ति इन भाषाओं में भी:", officeK: "विज्ञप्ति कार्यालय",
      tr: "", award: "₹11,000, प्रशस्ति पत्र और शॉल",
      readAll: "पूरी विज्ञप्ति पढ़ें", open: "विज्ञप्ति खोलिए"
    },
    en: {
      tag: "Press release", back: "← Home", glance: "The award at a glance",
      fieldsK: "What the work can be about", awardK: "The award carries", judgesK: "Judges",
      judges: "Three", deadlineK: "Deadline", jump: "Where to send entries ↓",
      sendK: "Nomination", phone: "Mobile", share: "Share", copy: "Copy link",
      also: "This release is also in:", officeK: "Release office",
      tr: "Translated from Hindi by the Deshkaal desk.",
      award: "₹11,000, a citation and a shawl",
      readAll: "Read the full release", open: "Open the release"
    },
    ur: {
      tag: "اعلان", back: "→ سرورق", glance: "اعزاز، ایک نظر میں",
      fieldsK: "کس موضوع کی تصنیف", awardK: "اعزاز میں", judgesK: "منصفین",
      judges: "تین", deadlineK: "آخری تاریخ", jump: "اندراجات کہاں بھیجیں ↓",
      sendK: "نامزدگی", phone: "موبائل", share: "آگے بھیجیے", copy: "لنک کاپی",
      also: "یہ اعلان ان زبانوں میں بھی:", officeK: "اعلان کا دفتر",
      tr: "ہندی سے ترجمہ: دیش کال ڈیسک",
      award: "11,000 روپے، سندِ تعریف اور شال",
      readAll: "پورا اعلان پڑھیں", open: "اعلان کھولیے"
    }
  };
  const LN = { hi: "हिंदी", en: "English", ur: "اردو" };

  const share = (w, lg) => {
    const X = T[lg], u = encodeURIComponent(SITE + url(w, lg)), t = encodeURIComponent(txt(w.h, lg));
    return `<div class="share" data-url="${SITE}${url(w, lg)}" data-title="${esc(txt(w.h, lg))}"><span class="share-l">${X.share}</span>
      <a class="sh" href="https://wa.me/?text=${t}%0A${u}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="sh" href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener">Telegram</a>
      <a class="sh" href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener">X</a>
      <button class="sh sh-copy" type="button">${X.copy}</button></div>`;
  };

  /* होमपेज की न्योता-पट्टी ("विज्ञापन") */
  function promo(lg = "hi") {
    const w = ALL[0];
    if (!w) return "";
    const X = T[lg] || T.hi;
    return `<a class="vjpromo" href="${url(w, lg)}" data-id="${esc(w.id)}">
  <span class="vjpromo-ph"><img src="${esc(w.photoSquare || w.photo)}" alt="${esc(txt(w.photoCap, lg))}" width="220" height="220" loading="lazy"><i>${esc(X.tag)}</i></span>
  <span class="vjpromo-tx">
    <span class="vjpromo-k">${esc(X.tag)} <b aria-hidden="true">·</b> ${lg === "en" ? "A national award" : lg === "ur" ? "قومی اعزاز" : "राष्ट्रीय सम्मान"}</span>
    <b class="vjpromo-h">${esc(txt(w.h, lg))}<span class="vjpromo-h2">: ${esc(txt(w.h2, lg))}</span></b>
    <span class="vjpromo-l">${esc(txt(w.promoLine, lg))}</span>
  </span>
  <span class="vjpromo-cta">${esc(X.readAll)} <i aria-hidden="true">→</i></span>
</a>`;
  }

  function page(w, lg = "hi") {
    const X = T[lg] || T.hi;
    const body = (w.body && (w.body[lg] || w.body.hi)) || [];
    const facts = (w.facts || []).map(f => `<div class="vjp-fact"><dt>${esc(typeof f.n === "string" ? f.n : txt(f.n, lg))}</dt><dd>${esc(txt(f.l, lg))}</dd></div>`).join("");
    const fields = ((w.fields && (w.fields[lg] || w.fields.hi)) || []).map(f => `<li>${esc(f)}</li>`).join("");
    const whoRows = ((w.who && w.who.rows) || []).map(r => `<div class="vjp-wrow"><dt>${esc(txt(r.k, lg))}</dt><dd>${((r.v && (r.v[lg] || r.v.hi)) || []).map(v => `<span>${esc(v)}</span>`).join("")}</dd></div>`).join("");
    const past = (w.past && w.past.names || []).map((n, i) => `<li><span class="vjp-pn" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><b>${esc(txt(n, lg))}</b></li>`).join("");
    const wins = (w.windows && w.windows.rows || []).map(r => `<div class="vjp-wincard"><b>${esc(r.y)}</b><i>${esc(txt(w.windows.card, lg))}</i><p>${esc(txt(r.r, lg))}</p></div>`).join("");
    const board = (w.board && w.board.rows || []).map(r => `<li><b>${esc(txt(r.name, lg))}</b><span>${esc(txt(r.place, lg))}</span><i>${esc(txt(r.role, lg))}</i></li>`).join("");
    const photoCap = txt(w.photoCap, lg);

    /* पहला पैरा बड़े अक्षर (ड्रॉप-कैप) के साथ, बीच में उद्धरण */
    const pullAfter = Math.min(2, body.length - 1);
    let prose = "";
    body.forEach((p, i) => {
      prose += `<p${i === 0 ? ' class="vjp-drop"' : ""}>${esc(p)}</p>`;
      if (i === pullAfter - 1) prose += `<blockquote class="vjp-pull"><p>${esc(txt(w.pull, lg))}</p><cite>${esc(txt(w.pullBy, lg))}</cite></blockquote>`;
    });

    const alt = { hi: url(w, "hi"), en: url(w, "en"), ur: url(w, "ur") };
    const html = `<article class="vjp" data-id="${esc(w.id)}">
  <a class="back" href="${P(lg)}/">${X.back}</a>
  <header class="vjp-hero">
    <div class="vjp-grid">
      <div class="vjp-head">
        <div class="vjp-krow">
          <span class="vjp-tag">${esc(X.tag)}</span>
          <span class="vjp-date">${esc(txt(w.kicker, lg))} · ${esc(txt(w.dateLabel, lg))}</span>
        </div>
        <h1 class="vjp-h">${esc(txt(w.h, lg))}</h1>
        <p class="vjp-h2">${esc(txt(w.h2, lg))}</p>
        <p class="vjp-dek">${esc(txt(w.dek, lg))}</p>
        <p class="vjp-by">${esc(txt(w.by, lg))}</p>
      </div>
      <figure class="vjp-port">
        <span class="vjp-stamp" aria-hidden="true"><b>${lg === "en" ? "MEMORIAL" : lg === "ur" ? "یادگار" : "स्मृति"}<br>${lg === "en" ? "AWARD" : lg === "ur" ? "اعزاز" : "सम्मान"}<small>2026</small></b></span>
        <img src="${esc(w.photo)}" alt="${esc(photoCap)}" width="${w.photoW || 1100}" height="${w.photoH || 1466}">
        ${photoCap ? `<figcaption>${esc(photoCap)}</figcaption>` : ""}
      </figure>
    </div>
    <div class="vjp-facts">${facts}</div>
  </header>

  <div class="vjp-flow">
    <div class="vjp-txt">${prose}</div>
    <aside class="vjp-side" aria-label="${esc(X.glance)}">
      <div class="vjp-card">
        <p class="vjp-ck">${esc(X.glance)}</p>
        <p class="vjp-cl">${esc(X.fieldsK)}</p>
        <ul class="vjp-chips">${fields}</ul>
        <dl class="vjp-mini">
          <div><dt>${esc(X.awardK)}</dt><dd>${esc(X.award)}</dd></div>
          <div><dt>${esc(X.judgesK)}</dt><dd>${esc(X.judges)}</dd></div>
          <div><dt>${esc(X.deadlineK)}</dt><dd>${esc(txt(w.send && w.send.deadline, lg))}</dd></div>
        </dl>
        <a class="vjp-jump" href="#bhejein">${esc(X.jump)}</a>
      </div>
    </aside>
  </div>

  <section class="vjp-who" aria-labelledby="vjp-who-t">
    <p class="vjp-sk">${esc(txt(w.who.k, lg))}</p>
    <h2 class="vjp-sect" id="vjp-who-t">${esc(txt(w.who.title, lg))}</h2>
    <dl class="vjp-wgrid">${whoRows}</dl>
  </section>

  <section class="vjp-past" aria-labelledby="vjp-past-t">
    <p class="vjp-sk">${esc(txt(w.past.k, lg))}</p>
    <h2 class="vjp-sect" id="vjp-past-t">${esc(txt(w.past.title, lg))}</h2>
    <ol class="vjp-plist">${past}</ol>
  </section>

  <section class="vjp-win" aria-labelledby="vjp-win-t">
    <p class="vjp-sk">${esc(txt(w.windows.k, lg))}</p>
    <h2 class="vjp-sect" id="vjp-win-t">${esc(txt(w.windows.title, lg))}</h2>
    <div class="vjp-wins">${wins}</div>
    <p class="vjp-wnote">${esc(txt(w.windows.note, lg))}</p>
  </section>

  <section class="vjp-send" id="bhejein" aria-labelledby="vjp-send-t">
    <div class="vjp-send-main">
      <p class="vjp-send-k">${esc(X.sendK)}</p>
      <h2 class="vjp-send-t" id="vjp-send-t">${esc(txt(w.send.title, lg))}</h2>
      <p class="vjp-send-name">${esc(txt(w.send.name, lg))} <span>${esc(txt(w.send.role, lg))}</span></p>
      <p class="vjp-send-addr">${(w.send.lines[lg] || w.send.lines.hi).map(l => esc(l)).join("<br>")}</p>
      <p class="vjp-send-row"><b>${esc(X.phone)}</b> <a href="tel:${esc(w.send.phone.replace(/[^+0-9]/g, ""))}" dir="ltr">${esc(w.send.phone)}</a></p>
      <p class="vjp-send-dead"><b>${esc(txt(w.send.deadlineLabel, lg))}</b> ${esc(txt(w.send.deadline, lg))}</p>
    </div>
    <div class="vjp-sign">
      <p class="vjp-sign-role">${esc(txt(w.sign.role, lg))}</p>
      <p class="vjp-sign-name">${esc(txt(w.sign.name, lg))}</p>
      <p class="vjp-sign-org">${esc(txt(w.sign.org, lg))}</p>
      <p class="vjp-sign-addr">${(w.sign.lines[lg] || w.sign.lines.hi).map(l => esc(l)).join("<br>")}</p>
      <p class="vjp-sign-ph">${esc(X.phone)}: <span dir="ltr">${esc(w.sign.phone)}</span></p>
    </div>
  </section>

  <section class="vjp-board" aria-labelledby="vjp-board-t">
    <p class="vjp-sk">${esc(txt(w.board.k, lg))}</p>
    <h2 class="vjp-sect" id="vjp-board-t">${esc(txt(w.board.title, lg))}</h2>
    <ul class="vjp-rows">${board}</ul>
  </section>

  ${X.tr ? `<p class="vjp-tr">${esc(X.tr)}</p>` : ""}
  <p class="vjp-note">${esc(txt(w.note, lg))}</p>
  ${supportEnd ? supportEnd() : ""}
  ${share(w, lg)}
  <p class="vjp-also">${X.also} ${Object.keys(alt).filter(l => l !== lg).map(l => `<a href="${alt[l]}" lang="${l}">${LN[l]}</a>`).join(" · ")}</p>
  <p class="vjp-back"><a href="${P(lg)}/">${X.back}</a></p>
</article>`;

    return layout({
      title: `${txt(w.h, lg)}: ${txt(w.h2, lg)}`,
      desc: txt(w.dek, lg),
      url: url(w, lg), body: html, tab: "home", catOn: "सब",
      image: fs.existsSync(path.join("public", "og", w.id + ".png")) ? `/og/${w.id}.png` : w.photo,
      published: w.date, alt
    });
  }

  return { ALL, promo, page };
};
