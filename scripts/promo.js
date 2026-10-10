// एक बार का प्रचार: data/promo/<नाम>.json की तस्वीर और कैप्शन Facebook पेज, Instagram और Telegram चैनल पर.
// node scripts/promo.js <नाम>     जो जा चुका, वो data/promo/<नाम>.done.json में दर्ज, दोबारा नहीं जाता.
const fs = require("fs"), env = process.env, G = "https://graph.facebook.com/v21.0";
const name = process.argv[2]; if (!name) throw new Error("नाम दीजिए");
const P = JSON.parse(fs.readFileSync(`data/promo/${name}.json`, "utf8"));
const doneF = `data/promo/${name}.done.json`, done = fs.existsSync(doneF) ? JSON.parse(fs.readFileSync(doneF, "utf8")) : {};
const save = () => fs.writeFileSync(doneF, JSON.stringify(done, null, 1));
async function api(p, params, tok) {
  const r = await fetch(G + p, { method: "POST", body: new URLSearchParams({ ...params, access_token: tok }) });
  const j = await r.json(); if (!r.ok || j.error) throw new Error(`${p}: ${JSON.stringify(j.error || j)}`); return j;
}
(async () => {
  let page = env.FB_PAGE_TOKEN;
  if (env.FB_PAGE_ID && page) {
    try { const j = await (await fetch(`${G}/${env.FB_PAGE_ID}?fields=access_token&access_token=${encodeURIComponent(page)}`)).json(); if (j.access_token) page = j.access_token; } catch (e) {}
    if (!done.fb) { try { const r = await api(`/${env.FB_PAGE_ID}/photos`, { url: P.image, caption: P.fb }, page); done.fb = r.post_id || r.id; save(); console.log("Facebook:", done.fb); } catch (e) { console.log("Facebook में दिक़्क़त:", e.message); process.exitCode = 1; } }
    if (env.IG_USER_ID && !done.ig) {
      try {
        const tok = env.IG_TOKEN || page;
        const c = await api(`/${env.IG_USER_ID}/media`, { image_url: P.image, caption: P.ig }, tok);
        for (let i = 0; i < 20; i++) { const s = await (await fetch(`${G}/${c.id}?fields=status_code&access_token=${encodeURIComponent(tok)}`)).json(); if (s.status_code === "FINISHED") break; if (s.status_code === "ERROR") throw new Error("Instagram ने तस्वीर नहीं ली"); await new Promise(r => setTimeout(r, 4000)); }
        const r = await api(`/${env.IG_USER_ID}/media_publish`, { creation_id: c.id }, tok); done.ig = r.id; save(); console.log("Instagram:", done.ig);
      } catch (e) { console.log("Instagram में दिक़्क़त:", e.message); process.exitCode = 1; }
    }
  }
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && !done.tg) {
    const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, photo: P.image, caption: P.tg, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: P.button || "खोलिए", url: P.link }]] } }) });
    const j = await r.json(); if (j.ok) { done.tg = j.result.message_id; save(); console.log("Telegram:", done.tg); } else { console.log("Telegram में दिक़्क़त:", JSON.stringify(j)); process.exitCode = 1; }
  }
})();
