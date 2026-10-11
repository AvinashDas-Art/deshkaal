/* देशकाल: पाठक की सुविधाएं (रंग, अक्षर, सहेजना, सुनना, आर्काइव खोज, ऐप) */
const root=document.documentElement;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const J=(k,d)=>{try{return JSON.parse(store.get(k))??d}catch(e){return d}};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const LG=document.documentElement.lang||"hi", PRE=LG==="hi"?"":"/"+LG;
const TX={hi:{modes:["अपने आप","दिन","सीपिया","रात"],col:"रंग: ",listen:"▶ सुनें",stop:"■ रोकें",nolisten:"इस ब्राउज़र में सुनना उपलब्ध नहीं",saved:"✓ सहेजा गया",save:"+ सहेजें",hi:"नमस्ते, ",signin:"साइन इन",copied:"कॉपी हो गया",copy:"लिंक कॉपी",count:n=>`${n} टिप्पणियां`,none:"इस खोज से कोई टिप्पणी नहीं मिली। कोई और शब्द आज़माइए।",last:n=>`${n}, आप पिछली बार ये पढ़ रहे थे:`,mine:"मेरा देशकाल",mineP:"लेख सहेजने और अपना पहला पन्ना सजाने के लिए जुड़िए।",join:"जुड़ें",whose:n=>`${n} का देशकाल`,fav:"पसंद की श्रेणियां",savedH:"सहेजे गये लेख",noSaved:'अभी कोई लेख नहीं सहेजा। किसी भी लेख पर "+ सहेजें" दबाइए।',out:"साइन आउट",speech:"hi-IN"},
 en:{modes:["auto","day","sepia","night"],col:"Colour: ",listen:"▶ Listen",stop:"■ Stop",nolisten:"Listening is not available in this browser",saved:"✓ Saved",save:"+ Save",hi:"Hello, ",signin:"Sign in",copied:"Copied",copy:"Copy link",count:n=>`${n} pieces`,none:"Nothing found. Try another word.",last:n=>`${n}, you were last reading:`,mine:"My Deshkaal",mineP:"Join to save pieces and arrange your own front page.",join:"Join",whose:n=>`${n}'s Deshkaal`,fav:"Favourite sections",savedH:"Saved pieces",noSaved:'Nothing saved yet. Press "+ Save" on any piece.',out:"Sign out",speech:"en-IN"},
 ur:{modes:["خود بخود","دن","سیپیا","رات"],col:"رنگ: ",listen:"▶ سنیں",stop:"■ روکیں",nolisten:"اس براؤزر میں سننا دستیاب نہیں",saved:"✓ محفوظ",save:"+ محفوظ کریں",hi:"آداب، ",signin:"سائن اِن",copied:"کاپی ہو گیا",copy:"لنک کاپی",count:n=>`${n} تبصرے`,none:"اس تلاش سے کچھ نہیں ملا۔ کوئی اور لفظ آزمائیے۔",last:n=>`${n}، آپ پچھلی بار یہ پڑھ رہے تھے:`,mine:"میرا دیش کال",mineP:"مضامین محفوظ کرنے اور اپنا پہلا صفحہ سجانے کے لیے جڑیے۔",join:"جڑیں",whose:n=>`${n} کا دیش کال`,fav:"پسند کے زمرے",savedH:"محفوظ مضامین",noSaved:'ابھی کچھ محفوظ نہیں۔ کسی بھی مضمون پر "+ محفوظ کریں" دبائیے۔',out:"سائن آؤٹ",speech:"ur-PK"}}[LG]||{};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* रंग और अक्षर */
const MODES=[["auto",TX.modes[0]],["day",TX.modes[1]],["sepia",TX.modes[2]],["night",TX.modes[3]]];
let mode=store.get("dk-mode")||"auto", zi=+(store.get("dk-zoom")||3);
const ZOOM=[.8,.88,.94,1,1.08,1.16,1.25,1.35];if(!(zi>=0&&zi<ZOOM.length))zi=3;
function applyMode(){
  root.removeAttribute("data-theme");root.removeAttribute("data-paper");
  if(mode==="day")root.dataset.theme="light";
  if(mode==="sepia"){root.dataset.theme="light";root.dataset.paper="sepia"}
  if(mode==="night")root.dataset.theme="dark";
  const t=$("#theme");if(t)t.textContent=TX.col+MODES.find(m=>m[0]===mode)[1];
  if(typeof drawAll==="function")drawAll();
}
function applySize(){const m=$("main"),hd=$(".masthead"),z=ZOOM[zi];[m,hd].forEach(e=>{if(e)e.style.zoom=z===1?"":z});const b=$("#bigger"),sm=$("#smaller");if(b)b.disabled=zi===ZOOM.length-1;if(sm)sm.disabled=zi===0;if(typeof drawAll==="function")drawAll()}
$("#theme").onclick=()=>{const i=MODES.findIndex(m=>m[0]===mode);mode=MODES[(i+1)%MODES.length][0];store.set("dk-mode",mode);applyMode()};
$("#bigger").onclick=()=>{zi=Math.min(ZOOM.length-1,zi+1);store.set("dk-zoom",zi);applySize()};
$("#smaller").onclick=()=>{zi=Math.max(0,zi-1);store.set("dk-zoom",zi);applySize()};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>typeof drawAll==="function"&&drawAll());

/* सुनना */
let speaking=false;
function listen(a,btn){
  const ss=window.speechSynthesis;
  if(!ss){btn.textContent=TX.nolisten;return}
  if(speaking){ss.cancel();speaking=false;btn.textContent=TX.listen;return}
  const u=new SpeechSynthesisUtterance([a.h,a.dek,...a.body].join("। "));
  u.lang=TX.speech;u.rate=.95;const hv=ss.getVoices().find(v=>v.lang&&v.lang.startsWith(TX.speech.slice(0,2)));if(hv)u.voice=hv;
  u.onend=()=>{speaking=false;btn.textContent=TX.listen};
  ss.cancel();ss.speak(u);speaking=true;btn.textContent=TX.stop;
}
const ART=$("#article-data")?JSON.parse($("#article-data").textContent):null;
if(ART){const b=$("#listen");if(b)b.onclick=()=>listen(ART,b);store.set("dk-last",JSON.stringify({id:ART.id,h:ART.h}))}

/* जुड़ना, सहेजना */
let user=J("dk-user",null), saved=J("dk-saved2",[]), favs=J("dk-fav",[]);
const ov=$("#ov");
function setWho(){$("#who").textContent=user?(TX.hi+user.name.split(" ")[0]):TX.signin}
function openSheet(){ov.hidden=false;$("#si-name").focus()}
function closeSheet(){ov.hidden=true}
$("#who").onclick=()=>{user?location.href="/mera/":openSheet()};
$("#si-x").onclick=closeSheet;
ov.addEventListener("click",e=>{if(e.target===ov)closeSheet()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)closeSheet()});
const note=$("#sif .note");
$("#sif").onsubmit=async e=>{e.preventDefault();
  const name=$("#si-name").value.trim()||"पाठक", email=$("#si-mail").value.trim();
  const btn=$("#sif .btn");btn.disabled=true;note.textContent="भेजा जा रहा है…";
  try{const r=await fetch("/api/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,email})});const d=await r.json().catch(()=>({}));
    if(r.ok){note.textContent=d.msg;btn.disabled=false;return}
    if(!d.offline){note.textContent=d.msg||"कुछ गड़बड़ हुई, थोड़ी देर बाद फिर कोशिश कीजिए।";btn.disabled=false;return}
  }catch(err){}
  /* सर्वर तैयार न हो तो इसी फ़ोन/कंप्यूटर पर */
  user={name,email,local:true};store.set("dk-user",JSON.stringify(user));btn.disabled=false;closeSheet();setWho();paintSaves();renderMine();renderLast()};
async function syncUp(){if(user&&!user.local){try{await fetch("/api/me",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({saved,favs})})}catch(e){}}}
async function syncDown(){try{const r=await fetch("/api/me",{credentials:"same-origin"});if(!r.ok)return;const d=await r.json();
  user={name:d.name,email:d.email};store.set("dk-user",JSON.stringify(user));
  const merged=[...d.saved];saved.forEach(x=>{if(!merged.some(y=>y.id===x.id))merged.push(x)});saved=merged;store.set("dk-saved2",JSON.stringify(saved));
  favs=d.favs.length?d.favs:favs;store.set("dk-fav",JSON.stringify(favs));
  setWho();paintSaves();renderMine();renderLast();if(merged.length!==d.saved.length)syncUp()}catch(e){}}
function paintSaves(){$$("[data-save]").forEach(b=>{const on=saved.some(x=>x.id===b.dataset.save);b.setAttribute("aria-pressed",on);b.textContent=on?TX.saved:TX.save})}
document.addEventListener("click",e=>{const b=e.target.closest("[data-save]");if(!b)return;e.preventDefault();
  if(!user){openSheet();return}
  const id=b.dataset.save;saved=saved.some(x=>x.id===id)?saved.filter(x=>x.id!==id):[{id,h:b.dataset.h},...saved];
  store.set("dk-saved2",JSON.stringify(saved));paintSaves();syncUp()});
function renderLast(){const el=$("#lastread");if(!el)return;const l=J("dk-last",null);
  if(user&&l){el.hidden=false;el.innerHTML=`<span>${esc(TX.last(user.name.split(" ")[0]))}</span><a href="${PRE}/lekh/${esc(l.id)}/">${esc(l.h)}</a>`}}
function renderMine(){const el=$("#mine");if(!el)return;
  if(!user){el.innerHTML=`<h2>${TX.mine}</h2><p style="color:var(--ink-2)">${TX.mineP}</p><button class="btn" id="join">${TX.join}</button>`;$("#join").onclick=openSheet;return}
  const cats=JSON.parse(el.dataset.cats),catn=JSON.parse(el.dataset.catn||el.dataset.cats);
  el.innerHTML=`<h2>${esc(TX.whose(user.name))}</h2>
    <h4>${TX.fav}</h4><div class="favs">${cats.map((c,i)=>`<label><input type="checkbox" data-fav="${c}" ${favs.includes(c)?"checked":""}>${catn[i]}</label>`).join("")}</div>
    <h4>${TX.savedH}</h4>${saved.length?`<div class="more" style="border:0;margin:0;padding:0">${saved.map(a=>`<a href="${PRE}/lekh/${esc(a.id)}/">${esc(a.h)}</a>`).join("")}</div>`:`<p style="color:var(--ink-2)">${TX.noSaved}</p>`}
    <div class="acts" style="margin-top:28px"><button class="ghost" id="out">${TX.out}</button></div>`;
  $$("[data-fav]").forEach(c=>c.onchange=()=>{favs=$$("[data-fav]:checked").map(x=>x.dataset.fav);store.set("dk-fav",JSON.stringify(favs));syncUp()});
  $("#out").onclick=async()=>{try{await fetch("/api/logout",{method:"POST"})}catch(e){}user=null;store.set("dk-user","null");setWho();renderMine()};
}

/* आर्काइव में खोज */
const aq=$("#aq");
if(aq){let acat="सब";
  const run=()=>{const q=aq.value.trim();let n=0;
    $$(".arow").forEach(r=>{const ok=(acat==="सब"||r.dataset.cat===acat)&&(!q||r.textContent.includes(q));r.hidden=!ok;if(ok)n++});
    $$(".aday").forEach(d=>{d.hidden=!d.querySelector(".arow:not([hidden])")});
    $("#acount").textContent=n?TX.count(n):TX.none};
  aq.oninput=run;$$("[data-ac]").forEach(b=>b.onclick=()=>{acat=b.dataset.ac;$$("[data-ac]").forEach(x=>x.setAttribute("aria-pressed",x===b));run()});run()}

/* न्यूज़लेटर (सेवा जुड़ने तक) */
const sf=$("#subf");if(sf)sf.onsubmit=async e=>{e.preventDefault();const n=$("#subnote");n.textContent="जोड़ा जा रहा है…";
  try{const r=await fetch("/api/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:$("#email").value,source:sf.dataset.source||"site"})});const d=await r.json();n.textContent=d.msg||"शुक्रिया।";if(r.ok)sf.reset()}
  catch(err){n.textContent="अभी जुड़ नहीं पाये, थोड़ी देर बाद फिर कोशिश कीजिए।"}};

/* ऐप की तरह */
let deferredInstall=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;const b=$("#install");if(b)b.hidden=false});
const ib=$("#install");if(ib)ib.onclick=()=>{deferredInstall&&deferredInstall.prompt()};
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

/* साझा करना */
$$(".share").forEach(box=>{const url=box.dataset.url,title=box.dataset.title;const nb=box.querySelector(".sh-native");
  if(navigator.share&&matchMedia("(pointer:coarse)").matches){nb.hidden=false;nb.onclick=()=>navigator.share({title,text:title,url}).catch(()=>{})}
  const cb=box.querySelector(".sh-copy");cb.onclick=async()=>{try{await navigator.clipboard.writeText(url);cb.textContent=TX.copied}catch(e){prompt("लिंक कॉपी कीजिए",url)}setTimeout(()=>cb.textContent=TX.copy,2000)}});
setWho();paintSaves();renderLast();renderMine();applySize();applyMode();syncDown();
if(/link=expired/.test(location.search)){const m=$("#mine");if(m)m.insertAdjacentHTML("afterbegin",`<p class="note">ये लिंक पुराना हो गया है। फिर से साइन इन कीजिए।</p>`)}
document.fonts&&document.fonts.ready.then(()=>typeof drawAll==="function"&&drawAll());
/* भाषा मेन्यू: बाहर क्लिक पर बंद */
document.addEventListener("click",e=>{const d=$(".langs");if(d&&d.open&&!d.contains(e.target))d.open=false});

/* खोज: ऊपर की पट्टी दबाने या "/" दबाने पर खुलती है; सूचकांक पहली बार खुलने पर लोड */
(function(){
  const ov=$("#sov"),q=$("#sq"),res=$("#sres"),hint=$("#shint"),op=$("#sopen");if(!ov||!q)return;
  const CC={"देश":"#B23A2E","दुनिया":"#2E3F8F","समाज":"#A2650E","अर्थ":"#2D6A4F","पर्यावरण":"#5B7A1E","स्त्री":"#9A2F67","संस्कृति":"#5A3E91","साहित्य":"#6E4423"};
  const NONE={hi:"इससे मिलती कोई टिप्पणी नहीं मिली। कोई और शब्द आज़माइए।",en:"Nothing matches. Try another word.",ur:"اس سے ملتا کچھ نہیں ملا۔ کوئی اور لفظ آزمائیے۔"}[LG];
  const CNT={hi:n=>`${n} टिप्पणियां मिलीं`,en:n=>`${n} ${n===1?"piece":"pieces"} found`,ur:n=>`${n} تبصرے ملے`}[LG];
  let idx=null,loading=null,last=null;
  /* हिंदी में नुक़्ता, चंद्रबिंदु और मात्राओं के छोटे फ़र्क़ से खोज न चूके */
  const norm=s=>String(s).toLowerCase().normalize("NFC").replace(/\u093C/g,"").replace(/\u0901/g,"\u0902").replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g,"").replace(/[ي]/g,"ی").replace(/[ك]/g,"ک").replace(/[^\p{L}\p{N}\p{M}\s]/gu," ");
  const load=()=>loading||(loading=fetch(PRE+"/khoj.json").then(r=>r.json()).then(d=>{idx=d.map(a=>({a,h:norm(a.h),d:norm(a.d+" "+a.c+" "+a.k),m:norm(a.p+" "+a.b),x:norm(a.x)}))}).catch(()=>{loading=null}));
  const mark=(s,ws)=>{let t=esc(s);ws.forEach(w=>{if(w.length<2)return;const re=new RegExp("("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi");t=t.replace(re,"<mark>$1</mark>")});return t};
  function run(){
    const raw=q.value.trim();if(raw===last)return;last=raw;
    if(!raw){res.innerHTML="";hint.hidden=false;return}
    if(!idx){load().then(run);last=null;return}
    const ws=norm(raw).split(/\s+/).filter(Boolean);
    const hits=[];
    for(const r of idx){let sc=0,ok=true;
      for(const w of ws){const s=(r.h.includes(w)?8:0)+(r.d.includes(w)?4:0)+(r.m.includes(w)?5:0)+(r.x.includes(w)?1:0);if(!s){ok=false;break}sc+=s}
      if(ok)hits.push([sc,r.a])}
    hits.sort((x,y)=>y[0]-x[0]);
    hint.hidden=true;
    const vis=raw.split(/\s+/);
    res.innerHTML=hits.length?`<li class="scount">${CNT(hits.length)}</li>`+hits.slice(0,40).map(([,a])=>`<li><a href="${a.u}" style="--kc:${CC[a.k]||"#2E3F8F"}"><span class="r-k">${esc(a.c)}</span><span class="r-h">${mark(a.h,vis)}</span><span class="r-d">${mark(a.d,vis)}</span><span class="r-m">${esc(a.b)} · ${esc(a.p)} · ${esc(a.t)}</span></a></li>`).join(""):`<li class="snone">${NONE}</li>`;
  }
  let tmr;q.addEventListener("input",()=>{clearTimeout(tmr);tmr=setTimeout(run,120)});
  const open=()=>{ov.hidden=false;document.body.classList.add("noscroll");load();setTimeout(()=>q.focus(),30);const u=new URL(location);u.searchParams.set("khoj",q.value||"");history.replaceState(null,"",u)};
  const close=()=>{ov.hidden=true;document.body.classList.remove("noscroll");const u=new URL(location);u.searchParams.delete("khoj");history.replaceState(null,"",u)};
  op&&op.addEventListener("click",open);$("#sclose").addEventListener("click",close);
  ov.addEventListener("click",e=>{if(e.target===ov)close()});
  q.addEventListener("keydown",e=>{if(e.key==="Enter"){const f=res.querySelector("a");if(f)location.href=f.getAttribute("href")}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)close();else if(e.key==="/"&&ov.hidden&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();open()}});
  const p=new URLSearchParams(location.search).get("khoj");if(p!==null){q.value=p;open();run()}
})();

/* रोशनदान: वीडियो इसी पन्ने पर, दबाने पर ही YouTube लोड होता है */
document.addEventListener("click",e=>{const b=e.target.closest(".ytlite");if(!b)return;const f=document.createElement("iframe");
f.src=b.dataset.ia?`https://archive.org/embed/${encodeURIComponent(b.dataset.ia)}?autoplay=1`:`https://www.youtube.com/embed/${encodeURIComponent(b.dataset.yt)}?autoplay=1&playsinline=1&rel=0`;f.referrerPolicy="strict-origin-when-cross-origin";f.setAttribute("frameborder","0");f.allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";f.allowFullscreen=true;f.title=b.getAttribute("aria-label")||"video";b.replaceWith(f)});

/* पाठकों की गिनती: बिना कुकी, सिर्फ़ इस ब्राउज़र की याद (localStorage) से पहली बार और रोज़ की पहली बार तय होती है */
(function(){const el=$("#ginti");if(!el||!window.fetch)return;
  const d=new Date(Date.now()+5.5*3600e3).toISOString().slice(0,10);
  const first=!store.get("dk-seen"),newday=store.get("dk-seen-day")!==d;
  store.set("dk-seen","1");store.set("dk-seen-day",d);
  const L={hi:["अब तक","पाठक","बार पढ़ा गया","आज","पाठक"],en:["So far","readers","pages read","today","readers"],ur:["اب تک","قاری","بار پڑھا گیا","آج","قاری"]}[LG]||["अब तक","पाठक","बार पढ़ा गया","आज","पाठक"];
  const n=x=>Number(x||0).toLocaleString(LG==="en"?"en-IN":LG==="ur"?"ur-IN":"hi-IN");
  fetch("/api/ginti",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({first,newday})}).then(r=>r.ok?r.json():null).then(g=>{if(!g||!g.ok)return;
    el.innerHTML=`<span><b>${n(g.people)}</b> ${L[1]} ${L[0]}</span><i></i><span><b>${n(g.views)}</b> ${L[2]}</span><i></i><span>${L[3]} <b>${n(g.today)}</b> ${L[4]}</span>`;el.hidden=false}).catch(()=>{});
})();
/* लाइव दीवार: छंटाई, और नये अपडेट की सूचना */
(function(){const L=document.getElementById("live");if(!L)return;
const bs=L.querySelectorAll(".lv-filter button");
bs.forEach(b=>b.addEventListener("click",()=>{const f=b.dataset.f;bs.forEach(x=>x.setAttribute("aria-pressed",x===b));
L.dataset.f=f;L.querySelectorAll("[data-k]").forEach(el=>{if(el.classList.contains("lv-vids")||el.classList.contains("lv-time")||el.classList.contains("lv-reels"))return;el.hidden=f!=="all"&&el.dataset.k!==f});}));
const nb=document.getElementById("lvnew");
setInterval(()=>{fetch("/live/feed.json?_="+Date.now(),{cache:"no-store"}).then(r=>r.json()).then(j=>{if(j.updated&&j.updated!==L.dataset.updated)nb.hidden=false}).catch(()=>{})},120000);
nb&&nb.addEventListener("click",()=>location.reload());
L.addEventListener("click",e=>{const b=e.target.closest(".lv-rplay");if(!b)return;const f=document.createElement("iframe");
f.src="https://www.instagram.com/reel/"+b.dataset.ig+"/embed/";f.allow="autoplay; encrypted-media; picture-in-picture";f.allowFullscreen=true;f.loading="lazy";f.className="lv-rframe";f.title="Instagram रील";b.replaceWith(f);});})();
/* r3con: बाहरी लाइव बोर्ड, पन्ने के ऊपर खिड़की में; बंद करने पर पूरी तरह रुक जाता है */
document.addEventListener("click",e=>{const a=e.target.closest(".r3open");if(!a||e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();
let d=document.getElementById("r3dlg");
if(!d){d=document.createElement("dialog");d.id="r3dlg";d.className="r3dlg";d.setAttribute("aria-label","r3con लाइव बोर्ड");
d.innerHTML='<div class="r3bar"><span class="r3t"><i></i>चलती तस्वीरें, लाइव · r3con.net <small>बाहरी साइट, देशकाल से अलग</small></span><a class="r3new" href="https://r3con.net/" target="_blank" rel="noopener">नयी टैब में ↗</a><button class="r3x" type="button" aria-label="बंद करें">✕</button></div><div class="r3body"><iframe title="r3con लाइव बोर्ड" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe><p class="r3fb">न दिखे तो <a href="https://r3con.net/" target="_blank" rel="noopener">नयी टैब में खोलिए ↗</a></p></div>';
document.body.appendChild(d);
const close=()=>{d.querySelector("iframe").src="about:blank";d.close();document.documentElement.classList.remove("r3lock")};
d.querySelector(".r3x").addEventListener("click",close);
d.addEventListener("cancel",ev=>{ev.preventDefault();close()});
d.addEventListener("click",ev=>{if(ev.target===d)close()});}
d.querySelector("iframe").src="https://r3con.net/";
document.documentElement.classList.add("r3lock");d.showModal();});
