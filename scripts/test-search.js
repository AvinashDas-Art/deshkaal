/* Run after node build.js. Exercises search events without a browser dependency. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const client=fs.readFileSync('src/client.js','utf8');
const normLine=client.split('\n').find(l=>l.startsWith('const searchNorm='));
const overlay=client.slice(client.indexOf('/* खोज: पूरा लेख'),client.indexOf('/* रोशनदान:'));
const escapeLine=client.split('\n').find(l=>l.startsWith('const esc='));
const pause=()=>new Promise(r=>setTimeout(r,160));
function harness(fetcher,lang='hi',query=''){
  let doc;
  class Element{
    constructor(){this.listeners={};this.hidden=false;this.value='';this.attrs={};this.innerHTML='';this.tagName='INPUT'}
    addEventListener(k,f){this.listeners[k]=f}
    setAttribute(k,v){this.attrs[k]=v}
    focus(){doc.activeElement=this}
    querySelectorAll(s){if(s==='a')return [...this.innerHTML.matchAll(/<a href="([^"]+)"/g)].map(m=>{const e=new Element();e.getAttribute=()=>m[1];return e});return []}
    querySelector(s){return this.querySelectorAll(s)[0]||null}
    fire(k,e={}){return this.listeners[k]?.({preventDefault(){},...e})}
  }
  const el=Object.fromEntries(['sov','sq','sres','shint','sopen','sclose'].map(k=>[k,new Element()]));el.sov.hidden=true;
  doc=new Element();doc.activeElement=el.sopen;doc.body={classList:{add(){},remove(){}}};
  const location={href:'https://deshkaal.xyz/'+(lang==='hi'?'':lang+'/')+query,get search(){return new URL(this.href,'https://deshkaal.xyz').search}};
  const history={replaceState(a,b,url){location.href=String(url)}};
  const context=vm.createContext({$:s=>el[s.slice(1)],document:doc,LG:lang,PRE:lang==='hi'?'':'/'+lang,location,history,URL,URLSearchParams,fetch:fetcher,AbortController,setTimeout,clearTimeout});
  vm.runInContext(normLine+'\n'+escapeLine+'\n'+overlay,context);
  return {el,doc,location,async search(q){if(el.sov.hidden)el.sopen.fire('click');el.sq.value=q;el.sq.fire('input');await pause()},norm:s=>vm.runInContext('searchNorm('+JSON.stringify(s)+')',context)};
}
const record=(h,x='',n=0)=>({u:'/lekh/test-'+n+'/',h,d:'',c:'देश',k:'देश',p:'PARI',b:'लेखक',t:'13 अक्टूबर 2026',day:'2026-10-13',x});
const response=d=>({ok:true,json:async()=>d});
(async()=>{
  for(const lang of ['hi','en','ur']){
    const prefix=lang==='hi'?'':lang+'/';
    const index=JSON.parse(fs.readFileSync('dist/'+prefix+'khoj.json'));
    assert(index.length);assert.equal(new Set(index.map(a=>a.u)).size,index.length);
    for(const a of index)assert(fs.existsSync('dist'+a.u+'index.html'),'Broken search link '+a.u);
    for(const a of index.filter(a=>a.u.includes('/lekh/'))){
      const article=JSON.parse(fs.readFileSync('data/'+(lang==='hi'?'days/':'i18n/'+lang+'/')+a.day+'.json')).find(x=>a.u.endsWith('/'+x.id+'/'));
      for(const p of [...article.body,...(article.nazar||[])])assert(a.x.includes(p),'Missing full text '+a.u);
    }
    assert(index.some(a=>a.u.includes('/hamsafar/')),'Hamsafar missing');
  }
  const h=harness(async()=>response([record('ख़बर राहुल','अंत में मौजूद शब्द लोकतंत्र'),record('ग़ज़ा', '',1),record('हमसफ़र','',2)]));
  assert.equal(h.norm('ख़बर'),h.norm('खबर'));assert.equal(h.norm('क़ानून'),h.norm('कानून'));assert.equal(h.norm('PARI'),h.norm('pari'));
  await h.search('खबर');assert(h.el.sres.innerHTML.includes('ख़बर राहुल'));
  await h.search('राहुल लोकतंत्र');assert(h.el.sres.innerHTML.includes('/lekh/test-0/'));assert(new URL(h.location.href).searchParams.get('khoj')==='राहुल लोकतंत्र');
  await h.search('गजा');assert(h.el.sres.innerHTML.includes('ग़ज़ा'));
  await h.search('!!!');assert.equal(h.el.sres.innerHTML,'');assert.equal(h.el.shint.hidden,false);
  await h.search('unknown-word');assert(!h.el.sres.querySelector('a'));
  const many=harness(async()=>response(Array.from({length:85},(_,i)=>record('भारत '+i,'',i))));
  await many.search('भारत');assert.equal(many.el.sres.querySelectorAll('a').length,40);
  const more={closest:s=>s==='[data-search-more]'?{}:null};many.el.sres.fire('click',{target:more});assert.equal(many.el.sres.querySelectorAll('a').length,80);
  many.el.sres.fire('click',{target:more});assert.equal(many.el.sres.querySelectorAll('a').length,85);
  let calls=0;const bad=harness(async()=>{calls++;if(calls===1)return {ok:false,status:503};return response([record('भारत')])});
  await bad.search('भारत');assert(bad.el.sres.innerHTML.includes('data-search-retry'));await pause();assert.equal(calls,1,'Failure retries infinitely');
  await bad.el.sres.fire('click',{target:{closest:s=>s==='[data-search-retry]'?{}:null}});await pause();assert.equal(calls,2);assert(bad.el.sres.querySelector('a'));
  let resolve;const slow=harness(()=>new Promise(r=>resolve=r));await slow.search('पुराना');slow.el.sq.value='नया';slow.el.sq.fire('input');resolve(response([record('नया')]));await pause();assert(slow.el.sres.innerHTML.includes('नया'));assert(!slow.el.sres.innerHTML.includes('पुराना'));
  const enter=harness(async()=>response([record('भारत'),record('राहुल','',1)]));await enter.search('भारत');enter.el.sq.value='राहुल';enter.el.sq.fire('input');await enter.el.sq.fire('keydown',{key:'Enter'});assert.equal(enter.location.href,'/lekh/test-1/');
  const safety=harness(async()=>response([record('HTML <img src=x onerror=alert(1)> & amp')]));await safety.search('amp');assert(!safety.el.sres.innerHTML.includes('<img'));assert(safety.el.sres.innerHTML.includes('&amp;'));assert.equal((safety.el.sres.innerHTML.match(/<mark>/g)||[]).length,(safety.el.sres.innerHTML.match(/<\/mark>/g)||[]).length);
  const direct=harness(async()=>response([record('भारत')]),'en','?khoj=भारत');await pause();assert.equal(direct.el.sov.hidden,false);assert(direct.el.sres.querySelector('a'));
  h.el.sclose.fire('click');assert(h.el.sov.hidden);assert(!new URL(h.location.href).searchParams.has('khoj'));assert.equal(h.doc.activeElement,h.el.sopen);
  console.log('Search checks passed: full text and links in 3 languages, spelling, multiword, pagination, retry, stale requests, Enter, escaping, URL and focus.');
})().catch(e=>{console.error(e);process.exitCode=1});
