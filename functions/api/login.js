// साइन इन: ईमेल पर लिंक भेजना (पासवर्ड नहीं)
import { json, okEmail, token, sendMail, mailShell } from "./_lib.js";
export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch {}
  const email = String(b.email || "").trim().toLowerCase(), name = String(b.name || "").trim().slice(0, 60) || "पाठक";
  if (!okEmail(email)) return json({ ok: false, msg: "ईमेल पता सही नहीं लग रहा। एक बार देख लीजिए।" }, 400);
  if (!env.DB || !env.RESEND_API_KEY) return json({ ok: false, offline: true }, 503);
  const t = token();
  await env.DB.prepare("INSERT INTO tokens(token,email,name,exp) VALUES(?,?,?,?)").bind(t, email, name, Date.now() + 30 * 60e3).run();
  const link = `${new URL(request.url).origin}/api/verify?t=${t}`;
  await sendMail(env, { to: email, subject: "देशकाल: साइन इन का लिंक", html: mailShell(`नमस्ते ${name}`, `<p style="font-size:17px;line-height:1.8">देशकाल में साइन इन करने के लिए नीचे का बटन दबाइए। ये लिंक 30 मिनट तक काम करेगा।</p><p><a href="${link}" style="display:inline-block;background:#2E3F8F;color:#fff;text-decoration:none;padding:12px 22px;font-size:17px">साइन इन करें</a></p><p style="color:#555963;font-size:14px;line-height:1.7">बटन न चले, तो ये पता कॉपी कर के ब्राउज़र में खोलिए:<br><a href="${link}" style="color:#2E3F8F;word-break:break-all">${link}</a></p><p style="color:#555963;font-size:14px">अगर आपने ये नहीं मांगा था, तो इस ईमेल को अनदेखा कर दीजिए।</p>`) });
  return json({ ok: true, msg: `${email} पर साइन इन का लिंक भेज दिया है। ईमेल खोल कर लिंक दबाइए।` });
}
