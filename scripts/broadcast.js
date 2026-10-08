// देशकाल: नया अंक चढ़ने के बाद Telegram चैनल और ईमेल न्यूज़लेटर भेजना.
// GitHub Actions से चलता है. जो secret मौजूद नहीं, वो हिस्सा चुपचाप छोड़ दिया जाता है.
const fs = require("fs"), path = require("path");
const SITE = "https://deshkaal.xyz";
const env = process.env;
const files = fs.readdirSync("data/days").filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
const file = files[files.length - 1], day = file.slice(0, 10);
const items = JSON.parse(fs.readFileSync(path.join("data/days", file), "utf8"));
/* खंडों के हिसाब से: आमुख पहले, फिर नुक़्ता-ए-नज़र, कल का कच्चा चिट्ठा, गांव-जवार; पुराने अंकों में sec नहीं था */
const secOf = (a, i) => a.sec || (a.cat === "साहित्य" ? "sahitya" : a.yt ? "video" : a.pub === "PARI" ? "pari" : i === 0 ? "amukh" : "vichar");
items.forEach((a, i) => { a.sec = secOf(a, i); });
const ORDER = ["amukh", "vichar", "khabar", "pari"];
const news = ORDER.flatMap(k => items.filter(a => a.sec === k)), lit = items.filter(a => a.sec === "sahitya"), vid = items.find(a => a.sec === "video");
/* Resend एक सेकंड में दो से ज़्यादा अनुरोध नहीं लेता: रुककर दोबारा कोशिश */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function post(u, opt, tries = 4) {
  for (let i = 0; i < tries; i++) { const r = await fetch(u, opt); if (r.status !== 429 && r.status < 500) return r; console.log("दोबारा कोशिश:", u, r.status); await sleep(2000 * (i + 1)); }
  return fetch(u, opt);
}
const url = a => `${SITE}/lekh/${a.id}/`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const M = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
const d = new Date(day + "T00:00:00Z"), label = `${d.getUTCDate()} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

const short = a => `${SITE}/k/${a.id.slice(2).replace(/-/g, "")}`;
const cut = (t, n) => t.length > n ? t.slice(0, n - 1).trim() + "…" : t;

async function telegram() {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return console.log("Telegram: secret नहीं, छोड़ा");
  const lead = news[0];
  // छिपे लिंक Telegram पर "Open this link?" पूछते हैं, इसलिए हर लेख एक बटन है: एक टैप, सीधे साइट.
  const text = [`<b>देशकाल · ${label}</b>`, "<i>ज़रूरी ख़बरों तक जाती एक पगडंडी</i>", "",
    `<b>आज की बड़ी बहस</b>`, `<b>${esc(lead.h)}</b>`, esc(lead.dek), "", `<i>आज का सवाल: ${esc(lead.sawal)}</i>`, "",
    "नीचे किसी भी शीर्षक को छू कर पूरा सार पढ़िए।"].join("\n");
  const btn = (a, pre = "") => [{ text: cut(pre + a.h, 60), url: url(a) }];
  const keyboard = [btn(lead, "▶ "), ...news.slice(1, 10).map(a => btn(a)), ...lit.slice(0, 3).map(a => btn(a, "साहित्य · ")), [{ text: "पूरा अंक देखें", url: SITE }]];
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML", link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: keyboard } })
  });
  console.log("Telegram:", r.status, r.ok ? "भेजा" : await r.text());
}

/* WhatsApp चैनल अपने आप पोस्ट नहीं होने देता, इसलिए रोज़ एक तैयार संदेश sampark@ पर आता है: कॉपी कर के चैनल में चिपकाइए. */
async function whatsappDraft() {
  if (!env.RESEND_API_KEY) return console.log("WhatsApp मसौदा: secret नहीं, छोड़ा");
  const lead = news[0];
  const msg = [`*देशकाल · ${label}*`, "_ज़रूरी ख़बरों तक जाती एक पगडंडी_", "",
    `*आमुख*`, `*${lead.h}*`, lead.dek, short(lead), "", `_आज का सवाल: ${lead.sawal}_`, "",
    `*नुक़्ता-ए-नज़र*`, ...news.filter(a => a.sec === "vichar").slice(0, 6).flatMap(a => [`▪️ ${a.h}`, short(a)]), "",
    ...(news.some(a => a.sec === "khabar") ? [`*कल का कच्चा चिट्ठा*`, ...news.filter(a => a.sec === "khabar").slice(0, 6).flatMap(a => [`▪️ ${a.h}`, short(a)]), ""] : []),
    ...(news.some(a => a.sec === "pari") ? [`*गांव-जवार*`, ...news.filter(a => a.sec === "pari").flatMap(a => [`▪️ ${a.h}`, short(a)]), ""] : []),
    ...(vid ? [`*रोशनदान*`, `▪️ ${vid.h}`, short(vid), ""] : []),
    ...(lit.length ? [`*सुख़न-सराय*`, ...lit.slice(0, 3).flatMap(a => [`▪️ ${a.h}`, short(a)]), ""] : []),
    `पूरा अंक: ${SITE}`].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px"><p style="color:#555">नीचे का संदेश पूरा कॉपी कर के WhatsApp चैनल में चिपकाइए। सितारे (*) WhatsApp में मोटे अक्षर बन जाएंगे।</p>
<pre style="white-space:pre-wrap;font-family:inherit;font-size:16px;line-height:1.6;background:#F1F2EE;padding:18px;border:1px solid #CFD2C8">${esc(msg)}</pre></div>`;
  const r = await post("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM || "देशकाल <patra@deshkaal.xyz>", to: [env.ADMIN_EMAIL || "sampark@deshkaal.xyz"], subject: `WhatsApp के लिए तैयार: देशकाल · ${label}`, html, text: msg }) });
  console.log("WhatsApp मसौदा:", r.status, r.ok ? "भेजा" : await r.text()); if (!r.ok) process.exitCode = 1;
}

async function newsletter() {
  if (!env.RESEND_API_KEY) return console.log("न्यूज़लेटर: secret नहीं, छोड़ा");
  const row = a => `<tr><td style="padding:16px 0;border-top:1px solid #CFD2C8">
    <div style="font-size:13px;color:#B27D1E;font-weight:600">${esc(a.cat)} · ${esc(a.pub)}</div>
    <a href="${url(a)}" style="display:block;font-size:21px;line-height:1.4;color:#1F2126;text-decoration:none;font-weight:700;margin:4px 0">${esc(a.h)}</a>
    <div style="font-size:16px;line-height:1.7;color:#555963">${esc(a.dek)}</div></td></tr>`;
  const lead = news[0];
  const html = `<!doctype html><html lang="hi"><body style="margin:0;background:#F1F2EE;font-family:'Noto Sans Devanagari',Arial,sans-serif;color:#1F2126">
<div style="max-width:620px;margin:0 auto;padding:26px 20px">
<div style="font-size:42px;font-weight:800">देश<span style="color:#CF3A2E">काल</span></div>
<div style="color:#555963;font-size:15px">ज़रूरी ख़बरों तक जाती एक पगडंडी · ${label}</div>
<div style="background:#CF3A2E;color:#fff;padding:20px 22px;margin:22px 0">
<div style="font-size:13px;opacity:.9">आमुख · ${esc(lead.by)}</div>
<a href="${url(lead)}" style="display:block;color:#fff;text-decoration:none;font-size:28px;line-height:1.3;font-weight:800;margin:6px 0">${esc(lead.h)}</a>
<div style="font-size:16px;line-height:1.7">${esc(lead.dek)}</div>
<div style="margin-top:12px;font-size:16px"><i>आज का सवाल: ${esc(lead.sawal)}</i></div></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${news.slice(1).map(row).join("")}</table>
${lit.length ? `<div style="font-size:26px;font-weight:800;margin:26px 0 4px">सुख़न-सराय</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${lit.map(row).join("")}</table>` : ""}
<p style="font-size:15px;margin-top:26px"><a href="${SITE}" style="color:#2E3F8F">पूरा अंक deshkaal.xyz पर पढ़िए</a></p>
<p style="color:#555963;font-size:13px;line-height:1.7">ये सार देशकाल का अपना लेखन हैं, मूल लेखों के लिंक हर पन्ने पर हैं।<br>
<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#555963">न्यूज़लेटर बंद करें</a></p></div></body></html>`;
  const H = { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" };
  const c = await post("https://api.resend.com/broadcasts", { method: "POST", headers: H, body: JSON.stringify({
    segment_id: env.RESEND_SEGMENT_ID || "e42dda3d-4db2-43ff-8c3d-15458393f636", from: env.MAIL_FROM || "देशकाल <patra@deshkaal.xyz>", reply_to: env.MAIL_REPLY_TO || "sampark@deshkaal.xyz",
    subject: `देशकाल · ${label}: ${lead.h}`, html, name: `देशकाल ${day}` }) });
  const cj = await c.json(); if (!c.ok) return console.log("न्यूज़लेटर बनाने में दिक़्क़त:", JSON.stringify(cj));
  await sleep(1200); const s = await post(`https://api.resend.com/broadcasts/${cj.id}/send`, { method: "POST", headers: H, body: "{}" });
  console.log("न्यूज़लेटर:", s.status, s.ok ? "भेजा" : await s.text());
}
const ONLY = env.ONLY || "";
(async () => { if (!ONLY || ONLY === "telegram") await telegram(); if (!ONLY || ONLY === "newsletter") await newsletter(); await sleep(1500); if (!ONLY || ONLY === "whatsapp") await whatsappDraft(); })().catch(e => { console.error(e); process.exit(1); });
