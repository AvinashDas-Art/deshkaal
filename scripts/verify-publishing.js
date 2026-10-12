const fs = require('node:fs');
const assert = require('node:assert/strict');
const { normalizeSection, isRuralReport } = require('../src/sections');
const files = fs.readdirSync('data/days').filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
const ids = new Set();
for (const file of files) {
  const items = JSON.parse(fs.readFileSync('data/days/' + file));
  for (const a of items) {
    assert(!ids.has(a.id), `Duplicate article ID: ${a.id}`); ids.add(a.id);
    assert.equal(a.day, file.slice(0,10), `Wrong day: ${a.id}`);
    assert(Array.isArray(a.body) && Array.isArray(a.nazar), `Missing content: ${a.id}`);
    if (a.sec === 'pari') assert(isRuralReport(a), `Non-rural article in pari: ${a.id}`);
  }
}
assert.equal(normalizeSection({pub:'हिन्दवी',h:'चित्रकूट',cat:'संस्कृति',sec:'sahitya'}), 'sahitya');
assert.equal(normalizeSection({pub:'PARI',sec:'hidden'}), 'hidden');
assert.equal(normalizeSection({pub:'खबर लहरिया',sec:'sahitya'}), 'sahitya');
assert.equal(normalizeSection({pub:'खबर लहरिया',sec:'khabar',cat:'समाज'}), 'pari');
assert.equal(normalizeSection({pub:'Other',sec:'pari'}), 'vichar');
const latest = files.at(-1).slice(0,10);
const items = JSON.parse(fs.readFileSync('data/days/'+latest+'.json')).map((a,i)=>({...a,sec:normalizeSection(a,i)}));
const expected = items.filter(isRuralReport).map(a=>a.id);
function verify(html) {
 const band = html.match(/<section class="pariband">([\s\S]*?)<\/section>/);
 assert(band || !expected.length, 'Missing rural section');
 const actual = [...(band?.[1] || '').matchAll(/data-save="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(actual,expected,'Rural cards do not match committed data');
 if(latest==='2026-10-12') assert.deepEqual(actual,['2026-10-12-27','2026-10-12-28','2026-10-12-25']);
 for(const a of items) if(a.sec!=='hidden') assert(html.includes(`/lekh/${a.id}/`), `Missing homepage article: ${a.id}`);
}
async function main(){
 verify(fs.readFileSync('dist/index.html','utf8'));
 if(process.argv.includes('--live')) {
  const indiaDay = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  assert.equal(latest,indiaDay,'Daily edition is stale or future-dated');
  const res=await fetch('https://deshkaal.xyz/?publishing-check='+Date.now(),{signal:AbortSignal.timeout(30000)});
  assert.equal(res.status,200); verify(await res.text());
  for(const a of items.filter(isRuralReport)) {
   const page=await fetch(`https://deshkaal.xyz/lekh/${a.id}/?publishing-check=${Date.now()}`,{signal:AbortSignal.timeout(30000)});
   assert.equal(page.status,200); const text=await page.text();
   assert(text.includes(`<h1>${a.h}</h1>`) && text.includes(a.pub),`Live identity mismatch: ${a.id}`);
  }
 }
 console.log(JSON.stringify({edition:latest,ruralCards:expected,status:'verified'}));
}
main().catch(e=>{console.error(e);process.exit(1)});
