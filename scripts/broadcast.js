// देशकाल: नया अंक चढ़ने के बाद Telegram चैनल और ईमेल न्यूज़लेटर भेजना.
// GitHub Actions से चलता है. जो secret मौजूद नहीं, वो हिस्सा चुपचाप छोड़ दिया जाता है.
const fs = require("fs"), path = require("path");
const SITE = "https://deshkaal.xyz";
const env = process.env;
const files = fs.readdirSync("data/days").filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
const file = files[files.length - 1], day = file.slice(0, 10);
const items = JSON.parse(fs.readFileSync(path.join("data/days", file), "utf8"));
const news = items.filter(a => a.cat !== "साहित्य"), lit = items.filter(a => a.cat === "साहित्य");
const url = a => `${SITE}/lekh/${a.id}/`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const M = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
const d = new Date(day + "T00:00:00Z"), label = `${d.getUTCDate()} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

async function telegram() {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return console.log("Telegram: secret नहीं, छोड़ा");
  const lead = news[0];
  const lines = [`<b>देशकाल · ${label}</b>`, "ज़रूरी ख़बरों तक जाती एक पगडंडी", "",
    `<b>आज की बड़ी बहस</b>`, `<a href="${url(lead)}">${esc(lead.h)}</a>`, esc(lead.dek), "", `<i>आज का सवाल: ${esc(lead.sawal)}</i>`, "",
    `<b>और ज़रूरी टिप्पणियां</b>`, ...news.slice(1, 9).map(a => `• <a href="${url(a)}">${esc(a.h)}</a>`), "",
    ...(lit.length ? [`<b>साहित्य</b>`, ...lit.map(a => `• <a href="${url(a)}">${esc(a.h)}</a>`), ""] : []),
    `पूरा अंक: ${SITE}`];
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: lines.join("\n"), parse_mode: "HTML", link_preview_options: { url: url(lead), prefer_large_media: true } })
  });
  console.log("Telegram:", r.status, r.ok ? "भेजा" : await r.text());
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
<div style="font-size:13px;opacity:.9">आज की बड़ी बहस · ${esc(lead.cat)}</div>
<a href="${url(lead)}" style="display:block;color:#fff;text-decoration:none;font-size:28px;line-height:1.3;font-weight:800;margin:6px 0">${esc(lead.h)}</a>
<div style="font-size:16px;line-height:1.7">${esc(lead.dek)}</div>
<div style="margin-top:12px;font-size:16px"><i>आज का सवाल: ${esc(lead.sawal)}</i></div></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${news.slice(1).map(row).join("")}</table>
${lit.length ? `<div style="font-size:26px;font-weight:800;margin:26px 0 4px">साहित्य</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${lit.map(row).join("")}</table>` : ""}
<p style="font-size:15px;margin-top:26px"><a href="${SITE}" style="color:#2E3F8F">पूरा अंक deshkaal.xyz पर पढ़िए</a></p>
<p style="color:#555963;font-size:13px;line-height:1.7">ये सार देशकाल का अपना लेखन हैं, मूल लेखों के लिंक हर पन्ने पर हैं।<br>
<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#555963">न्यूज़लेटर बंद करें</a></p></div></body></html>`;
  const H = { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" };
  const c = await fetch("https://api.resend.com/broadcasts", { method: "POST", headers: H, body: JSON.stringify({
    segment_id: env.RESEND_SEGMENT_ID || "e42dda3d-4db2-43ff-8c3d-15458393f636", from: env.MAIL_FROM || "देशकाल <patra@deshkaal.xyz>", reply_to: env.MAIL_REPLY_TO || "sampark@deshkaal.xyz",
    subject: `देशकाल · ${label}: ${lead.h}`, html, name: `देशकाल ${day}` }) });
  const cj = await c.json(); if (!c.ok) return console.log("न्यूज़लेटर बनाने में दिक़्क़त:", JSON.stringify(cj));
  const s = await fetch(`https://api.resend.com/broadcasts/${cj.id}/send`, { method: "POST", headers: H, body: "{}" });
  console.log("न्यूज़लेटर:", s.status, s.ok ? "भेजा" : await s.text());
}
(async () => { await telegram(); await newsletter(); })().catch(e => { console.error(e); process.exit(1); });
