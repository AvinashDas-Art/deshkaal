/* Build the sitemap from actual generated, indexable, self-canonical pages. */
const fs = require('node:fs'), path = require('node:path');
const xml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function pagesIn(root, site) {
  const pages=[];
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name);
      if(entry.isDirectory()){walk(file);continue}
      if(entry.name!=='index.html')continue;
      const html=fs.readFileSync(file,'utf8');
      const url=site+'/'+path.relative(root,file).split(path.sep).join('/').replace(/index\.html$/,'');
      const canonical=html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
      const robots=html.match(/<meta name="robots" content="([^"]+)"/i)?.[1]||'';
      const indexable=!/(?:^|[\s,])noindex(?:$|[\s,])/i.test(robots);
      if(indexable&&canonical!==url)throw Error(`Wrong canonical for ${url}: ${canonical}`);
      const published=html.match(/<meta property="article:published_time" content="(\d{4}-\d{2}-\d{2})/i)?.[1];
      pages.push({url,html,indexable,published});
    }
  }
  walk(root);return pages.sort((a,b)=>a.url.localeCompare(b.url));
}
function sitemap(root,site) {
  const pages=pagesIn(root,site).filter(p=>p.indexable);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p=>`<url><loc>${xml(p.url)}</loc>${p.published?`<lastmod>${p.published}</lastmod>`:''}</url>`).join('\n')}\n</urlset>\n`;
}
module.exports={pagesIn,sitemap};
