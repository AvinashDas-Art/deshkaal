// देशकाल: साझा मदद (Pages Functions)
export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
export const okEmail = e => typeof e === "string" && /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(e.trim());
export const token = (n = 32) => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, "0")).join("");
export const cookie = (req, name) => (req.headers.get("cookie") || "").split(/;\s*/).map(c => c.split("=")).find(([k]) => k === name)?.[1];
export const FROM = env => env.MAIL_FROM || "देशकाल <patra@deshkaal.xyz>";
export const REPLY = env => env.MAIL_REPLY_TO || "sampark@deshkaal.xyz";

export async function sendMail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) throw new Error("mail-off");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FROM(env), reply_to: REPLY(env), to: [to], subject, html })
  });
  if (!r.ok) throw new Error("mail-failed " + r.status);
}
export async function currentUser(env, request) {
  const sid = cookie(request, "dk_sid");
  if (!sid || !env.DB) return null;
  const s = await env.DB.prepare("SELECT email FROM sessions WHERE sid=? AND exp>?").bind(sid, Date.now()).first();
  if (!s) return null;
  return env.DB.prepare("SELECT email,name,saved,favs FROM users WHERE email=?").bind(s.email).first();
}
export const mailShell = (title, inner) => `<!doctype html><html lang="hi"><body style="margin:0;background:#F1F2EE;font-family:'Noto Sans Devanagari',Arial,sans-serif;color:#1F2126">
<div style="max-width:600px;margin:0 auto;padding:28px 22px">
<div style="font-size:40px;font-weight:700;letter-spacing:.5px">देश<span style="color:#CF3A2E">काल</span></div>
<div style="color:#555963;font-size:15px;margin-bottom:22px">ज़रूरी ख़बरों तक जाती एक पगडंडी</div>
<h1 style="font-size:24px;margin:0 0 14px">${title}</h1>${inner}
<p style="color:#555963;font-size:13px;margin-top:30px">देशकाल · deshkaal.xyz</p></div></body></html>`;
