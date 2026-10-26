/* हर बने हुए पन्ने की हर अंदरूनी कड़ी जांचता है: कहीं ऐसा पता तो नहीं जिसका पन्ना (या तस्वीर) मौजूद नहीं?
   यह 25 अक्टूबर 2026 की Search Console शिकायत का पहरा है: श्रेणी का slug ख़ाली होने से 213 पन्नों पर
   /shreni/undefined/ की कड़ी छप गई थी, और अंग्रेज़ी-उर्दू में कार्टूनिस्ट के पन्ने बने ही नहीं थे —
   Google ने सबको "Not found (404)" गिना। चलाएं: node build.js && node scripts/test-links.js */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');

const ROOT = 'dist', SITE = 'https://deshkaal.xyz';
const HOSTS = new Set(['deshkaal.xyz', 'www.deshkaal.xyz']);
const ATTR = /(?:href|src)\s*=\s*"([^"]*)"/gi;
const SKIP_PREFIX = ['/api/', '/k/', '/cdn-cgi/'];

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else files.push(p);
  }
})(ROOT);

const exists = new Map();
function fileExists(p) {
  if (!exists.has(p)) exists.set(p, fs.existsSync(path.join(ROOT, p.slice(1))));
  return exists.get(p);
}
/* Cloudflare Pages: /x/ → x/index.html, /x → x या x/index.html या x.html */
function targetExists(p) {
  if (p.endsWith('/')) return fileExists(p + 'index.html');
  return fileExists(p) || fileExists(p + '/index.html') || fileExists(p + '.html');
}
function resolve(link, pageUrl) {
  if (!link || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(link) || link.startsWith('//')) return null;
  let u;
  try { u = new URL(link, SITE + pageUrl); } catch { return null; }
  if (!HOSTS.has(u.hostname)) return null;
  const p = decodeURIComponent(u.pathname);
  if (SKIP_PREFIX.some(s => p.startsWith(s))) return null;
  return p;
}

const broken = new Map();      /* पता → पहला पन्ना */
const nameless = [];           /* ".../undefined/..." जैसी कड़ियां */
for (const f of files) {
  if (!f.endsWith('.html')) continue;
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const pageUrl = '/' + rel.replace(/index\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(ATTR)) {
    const p = resolve(m[1].trim(), pageUrl);
    if (!p) continue;
    if (/(?:^|\/)undefined(?:\/|$|\.)/.test(p) && !nameless.includes(p)) nameless.push(p);
    if (!targetExists(p) && !broken.has(p)) broken.set(p, '/' + rel);
  }
}

if (nameless.length) console.error('बिना नाम वाली कड़ियां (undefined):\n  ' + nameless.join('\n  '));
if (broken.size) {
  console.error(`टूटी अंदरूनी कड़ियां: ${broken.size}`);
  for (const [p, page] of [...broken].sort()) console.error(`  ${p}   ← ${page}`);
}
assert.deepEqual(nameless, [], 'किसी श्रेणी/पन्ने का नाम ख़ाली (undefined) है — build.js में SLUG देखें');
assert.equal(broken.size, 0, 'टूटी अंदरूनी कड़ियां — ऊपर की सूची देखें');

const html = files.filter(f => f.endsWith('.html')).length;
console.log(JSON.stringify({ pages: html, internalLinks: 'सब मौजूद', broken: 0 }));
