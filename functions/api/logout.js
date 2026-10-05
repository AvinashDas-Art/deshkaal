import { json, cookie } from "./_lib.js";
export async function onRequestPost({ request, env }) {
  const sid = cookie(request, "dk_sid");
  if (sid && env.DB) await env.DB.prepare("DELETE FROM sessions WHERE sid=?").bind(sid).run();
  return json({ ok: true }, 200, { "set-cookie": "dk_sid=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax" });
}
