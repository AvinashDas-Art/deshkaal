/* नेता-स्वर: रैली के भाषणों की पट्टी (data/days/<दिन>.json की "voices")
   हर कार्ड में पुरालेखीय तस्वीर, नाम, दल और उस दिन का सबसे तेज़ वाक्य। */
module.exports = function (H) {
  const { esc, href } = H;
  const T = {
    hi: { k: "रामलीला मैदान · 1 नवंबर 2026", h: "नेता-स्वर", sub: "आठ आवाज़ें, एक मंच। रैली में सबने अपनी बात कही, मगर हर एक का सुर अलग था। तस्वीर पर क्लिक करके पूरा भाषण पढ़िए।", read: "पूरा पढ़िए", all: "सारे भाषण" },
    en: { k: "Ramlila Maidan · 1 November 2026", h: "Voices from the stage", sub: "Eight voices, one stage. Everyone at the rally made their case, but no two made it the same way. Click a face to read the full speech.", read: "Read on", all: "All the speeches" },
    ur: { k: "رام لیلا میدان · 1 نومبر 2026", h: "اسٹیج کی آوازیں", sub: "آٹھ آوازیں، ایک اسٹیج۔ ریلی میں سب نے اپنی بات کہی، مگر ہر ایک کا لہجہ الگ تھا۔ تصویر پر کلک کر کے پوری تقریر پڑھیں۔", read: "پوری پڑھیں", all: "ساری تقریریں" }
  };
  return function (LG, today, PRE) {
    const v = today && today.voices;
    if (!Array.isArray(v) || !v.length) return "";
    const X = T[LG] || T.hi;
    return `<section class="voices" aria-label="${esc(X.h)}">
  <div class="vb-head"><p class="vb-k">${esc(X.k)}</p><h2>${esc(X.h)}</h2><p class="vb-sub">${esc(X.sub)}</p></div>
  <div class="vb-grid">${v.map((x, i) => `<article class="vb-card">
    <a class="vb-face" href="${href({ id: x.id })}"><img src="${esc(x.photo)}" width="320" height="400" loading="${i < 4 ? "eager" : "lazy"}" alt="${esc(x.name)}"><span class="vb-n">${String(i + 1).padStart(2, "0")}</span></a>
    <div class="vb-txt"><p class="vb-name">${esc(x.name)}</p><p class="vb-role">${esc(x.role)}</p><blockquote>${esc(x.quote)}</blockquote><a class="vb-read" href="${href({ id: x.id })}">${esc(X.read)} →</a></div>
  </article>`).join("")}</div>
  <a class="vb-all" href="${PRE}/morcha/">${esc(X.all)} →</a></section>`;
  };
};
