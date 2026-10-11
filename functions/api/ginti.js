// देशकाल: पाठकों की गिनती (बिना कुकी). हर ब्राउज़र पहली बार आने पर "पाठक", हर दिन पहली बार आने पर "आज का पाठक", हर पन्ना "पढ़ा गया".
// बॉट और प्रिव्यू बनाने वाले गिने नहीं जाते. गिनती 9 अक्टूबर 2026 से.
// गिनती सबकी होती है, पर आंकड़े सिर्फ़ साइन इन पाठकों (असली सेशन, dk_sid) को लौटाये जाते हैं; बाक़ी को पट्टी दिखती ही नहीं.
import { currentUser } from "./_lib.js";
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|monitor|curl|wget|python|node-fetch|playwright/i;
const j = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
async function totals(db) {
  const t = await db.prepare("SELECT COALESCE(SUM(people),0) p, COALESCE(SUM(visitors),0) v, COALESCE(SUM(views),0) w FROM ginti").first();
  const d = await db.prepare("SELECT visitors FROM ginti WHERE day=?").bind(today()).first();
  return { people: t.p, visits: t.v, views: t.w, today: d ? d.visitors : 0 };
}
async function ensure(db) { await db.prepare("CREATE TABLE IF NOT EXISTS ginti(day TEXT PRIMARY KEY, people INTEGER DEFAULT 0, visitors INTEGER DEFAULT 0, views INTEGER DEFAULT 0)").run(); }
export async function onRequestGet({ request, env }) {
  if (!env.DB) return j({ ok: false }, 503);
  if (!(await currentUser(env, request))) return j({ ok: false }, 401);
  await ensure(env.DB);
  return j({ ok: true, ...(await totals(env.DB)) });
}
export async function onRequestPost({ request, env }) {
  if (!env.DB) return j({ ok: false }, 503);
  await ensure(env.DB);
  const ua = request.headers.get("user-agent") || "";
  let b = {}; try { b = await request.json(); } catch {}
  if (ua && !BOT.test(ua)) {
    const p = b.first ? 1 : 0, v = b.newday ? 1 : 0;
    await env.DB.prepare("INSERT INTO ginti(day,people,visitors,views) VALUES(?,?,?,1) ON CONFLICT(day) DO UPDATE SET people=people+?, visitors=visitors+?, views=views+1").bind(today(), p, v, p, v).run();
  }
  if (!(await currentUser(env, request))) return j({ ok: true });
  return j({ ok: true, ...(await totals(env.DB)) });
}
