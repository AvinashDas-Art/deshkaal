// न्यूज़लेटर: ईमेल जोड़ना
import { json, okEmail, sendMail, mailShell } from "./_lib.js";
export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch {}
  const email = String(b.email || "").trim().toLowerCase();
  if (!okEmail(email)) return json({ ok: false, msg: "ईमेल पता सही नहीं लग रहा। एक बार देख लीजिए।" }, 400);
  if (!env.DB) return json({ ok: false, msg: "न्यूज़लेटर कुछ ही दिनों में शुरू होगा।" }, 503);
  await env.DB.prepare("INSERT OR IGNORE INTO subscribers(email,created,source) VALUES(?,?,?)").bind(email, Date.now(), "site").run();
  if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
    await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false })
    }).catch(() => {});
    try { await sendMail(env, { to: email, subject: "देशकाल में आपका स्वागत है", html: mailShell("स्वागत है", `<p style="font-size:17px;line-height:1.8">कल सुबह 7 बजे से देशकाल की टिप्पणियां सीधे आपके इनबॉक्स में आएंगी। हर रविवार, हफ़्ते की पांच सबसे ज़रूरी टिप्पणियां भी।</p>`) }); } catch {}
  }
  return json({ ok: true, msg: "शुक्रिया। कल सुबह से देशकाल आपके इनबॉक्स में होगा।" });
}
