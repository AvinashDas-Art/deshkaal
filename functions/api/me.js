// साइन इन पाठक: नाम, सहेजे लेख, पसंद की श्रेणियां
import { json, currentUser } from "./_lib.js";
export async function onRequestGet({ request, env }) {
  const u = await currentUser(env, request);
  if (!u) return json({ ok: false }, 401);
  return json({ ok: true, name: u.name, email: u.email, saved: JSON.parse(u.saved || "[]"), favs: JSON.parse(u.favs || "[]") });
}
export async function onRequestPost({ request, env }) {
  const u = await currentUser(env, request);
  if (!u) return json({ ok: false }, 401);
  let b = {}; try { b = await request.json(); } catch {}
  const saved = Array.isArray(b.saved) ? b.saved.slice(0, 500).map(x => ({ id: String(x.id).slice(0, 40), h: String(x.h).slice(0, 200) })) : JSON.parse(u.saved || "[]");
  const favs = Array.isArray(b.favs) ? b.favs.slice(0, 20).map(String) : JSON.parse(u.favs || "[]");
  await env.DB.prepare("UPDATE users SET saved=?, favs=? WHERE email=?").bind(JSON.stringify(saved), JSON.stringify(favs), u.email).run();
  return json({ ok: true });
}
