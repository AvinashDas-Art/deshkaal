const fs=require('node:fs'),assert=require('node:assert/strict');
const {pagesIn}=require('../src/seo');
const site='https://deshkaal.xyz',pages=pagesIn('dist',site),byURL=new Map(pages.map(p=>[p.url,p]));
const alternates=p=>[...p.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m=>({lang:m[1],url:m[2]}));
for(const p of pages){
  assert(!/\/(en|ur)\/(en|ur)\//.test(p.url));
  const og=p.html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if(p.indexable)assert.equal(og,p.url,'OG URL mismatch '+p.url);
  for(const a of alternates(p)){
    const target=byURL.get(a.url);assert(target,'Missing alternate '+a.url);
    assert(target.indexable,'Noindex alternate '+a.url);
    assert.equal(target.html.match(/<html lang="([^"]+)"/)?.[1],a.lang);
    assert(alternates(target).some(x=>x.url===p.url),'Non-reciprocal hreflang '+p.url+' -> '+a.url);
  }
}
const map=fs.readFileSync('dist/sitemap.xml','utf8');
const urls=[...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length);
assert.deepEqual([...urls].sort(),pages.filter(p=>p.indexable).map(p=>p.url).sort());
for(const lang of ['hi','en','ur']){
  const prefix=lang==='hi'?'':'/'+lang;
  for(const path of ['/live/','/cartoon/2026-10-13/','/niti/','/nijta/','/judiye/','/hamsafar/','/shreni/desh/']){
    const p=byURL.get(site+prefix+path);assert(p?.indexable,'Public translated page not indexable '+prefix+path);
  }
  assert(!byURL.get(site+prefix+'/mera/').indexable);
}
assert(!byURL.get(site+'/akhbar/').indexable);
assert(fs.existsSync('dist/404.html'));
assert(fs.readFileSync('dist/_redirects','utf8').includes('/en/en/* /en/:splat 301'));
console.log(JSON.stringify({pages:pages.length,indexable:urls.length,hreflang:'reciprocal and valid',canonical:'verified',sitemap:'complete'}));
