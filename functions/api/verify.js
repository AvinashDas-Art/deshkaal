// साइन इन लिंक की पुष्टि
import { token } from "./_lib.js";
export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get("t") || "";
  const bad = () => Response.redirect(new URL("/mera/?link=expired", request.url), 302);
  if (!env.DB || !t) return bad();
  const row = await env.DB.prepare("SELECT email,name FROM tokens WHERE token=? AND exp>?").bind(t, Date.now()).first();
  if (!row) return bad();
  await env.DB.prepare("DELETE FROM tokens WHERE token=?").bind(t).run();
  await env.DB.prepare("INSERT INTO users(email,name,created) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name").bind(row.email, row.name, Date.now()).run();
  const sid = token(), days = 180;
  await env.DB.prepare("INSERT INTO sessions(sid,email,exp) VALUES(?,?,?)").bind(sid, row.email, Date.now() + days * 864e5).run();
  return new Response(null, { status: 302, headers: { location: "/mera/?welcome=1", "set-cookie": `dk_sid=${sid}; Path=/; Max-Age=${days * 86400}; HttpOnly; Secure; SameSite=Lax` } });
}
