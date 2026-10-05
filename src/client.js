/* देशकाल: पाठक की सुविधाएं (रंग, अक्षर, सहेजना, सुनना, आर्काइव खोज, ऐप) */
const root=document.documentElement;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const J=(k,d)=>{try{return JSON.parse(store.get(k))??d}catch(e){return d}};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* रंग और अक्षर */
const MODES=[["auto","अपने आप"],["day","दिन"],["sepia","सीपिया"],["night","रात"]];
let mode=store.get("dk-mode")||"auto", size=+(store.get("dk-size2")||22);
function applyMode(){
  root.removeAttribute("data-theme");root.removeAttribute("data-paper");
  if(mode==="day")root.dataset.theme="light";
  if(mode==="sepia"){root.dataset.theme="light";root.dataset.paper="sepia"}
  if(mode==="night")root.dataset.theme="dark";
  const t=$("#theme");if(t)t.textContent="रंग: "+MODES.find(m=>m[0]===mode)[1];
  if(typeof drawAll==="function")drawAll();
}
function applySize(){root.style.setProperty("--read",size+"px")}
$("#theme").onclick=()=>{const i=MODES.findIndex(m=>m[0]===mode);mode=MODES[(i+1)%MODES.length][0];store.set("dk-mode",mode);applyMode()};
$("#bigger").onclick=()=>{size=Math.min(28,size+1);store.set("dk-size2",size);applySize()};
$("#smaller").onclick=()=>{size=Math.max(16,size-1);store.set("dk-size2",size);applySize()};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>typeof drawAll==="function"&&drawAll());

/* सुनना */
let speaking=false;
function listen(a,btn){
  const ss=window.speechSynthesis;
  if(!ss){btn.textContent="इस ब्राउज़र में सुनना उपलब्ध नहीं";return}
  if(speaking){ss.cancel();speaking=false;btn.textContent="▶ सुनें";return}
  const u=new SpeechSynthesisUtterance([a.h,a.dek,...a.body].join("। "));
  u.lang="hi-IN";u.rate=.95;const hv=ss.getVoices().find(v=>v.lang&&v.lang.startsWith("hi"));if(hv)u.voice=hv;
  u.onend=()=>{speaking=false;btn.textContent="▶ सुनें"};
  ss.cancel();ss.speak(u);speaking=true;btn.textContent="■ रोकें";
}
const ART=$("#article-data")?JSON.parse($("#article-data").textContent):null;
if(ART){const b=$("#listen");if(b)b.onclick=()=>listen(ART,b);store.set("dk-last",JSON.stringify({id:ART.id,h:ART.h}))}

/* जुड़ना, सहेजना */
let user=J("dk-user",null), saved=J("dk-saved2",[]), favs=J("dk-fav",[]);
const ov=$("#ov");
function setWho(){$("#who").textContent=user?("नमस्ते, "+user.name.split(" ")[0]):"साइन इन"}
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
function paintSaves(){$$("[data-save]").forEach(b=>{const on=saved.some(x=>x.id===b.dataset.save);b.setAttribute("aria-pressed",on);b.textContent=on?"✓ सहेजा गया":"+ सहेजें"})}
document.addEventListener("click",e=>{const b=e.target.closest("[data-save]");if(!b)return;e.preventDefault();
  if(!user){openSheet();return}
  const id=b.dataset.save;saved=saved.some(x=>x.id===id)?saved.filter(x=>x.id!==id):[{id,h:b.dataset.h},...saved];
  store.set("dk-saved2",JSON.stringify(saved));paintSaves();syncUp()});
function renderLast(){const el=$("#lastread");if(!el)return;const l=J("dk-last",null);
  if(user&&l){el.hidden=false;el.innerHTML=`<span>${esc(user.name.split(" ")[0])}, आप पिछली बार ये पढ़ रहे थे:</span><a href="/lekh/${esc(l.id)}/">${esc(l.h)}</a>`}}
function renderMine(){const el=$("#mine");if(!el)return;
  if(!user){el.innerHTML=`<h2>मेरा देशकाल</h2><p style="color:var(--ink-2)">लेख सहेजने और अपना पहला पन्ना सजाने के लिए जुड़िए।</p><button class="btn" id="join">जुड़ें</button>`;$("#join").onclick=openSheet;return}
  const cats=JSON.parse(el.dataset.cats);
  el.innerHTML=`<h2>${esc(user.name)} का देशकाल</h2>
    <h4>पसंद की श्रेणियां</h4><div class="favs">${cats.map(c=>`<label><input type="checkbox" data-fav="${c}" ${favs.includes(c)?"checked":""}>${c}</label>`).join("")}</div>
    <h4>सहेजे गये लेख</h4>${saved.length?`<div class="more" style="border:0;margin:0;padding:0">${saved.map(a=>`<a href="/lekh/${esc(a.id)}/">${esc(a.h)}</a>`).join("")}</div>`:`<p style="color:var(--ink-2)">अभी कोई लेख नहीं सहेजा। किसी भी लेख पर "+ सहेजें" दबाइए।</p>`}
    <div class="acts" style="margin-top:28px"><button class="ghost" id="out">साइन आउट</button></div>`;
  $$("[data-fav]").forEach(c=>c.onchange=()=>{favs=$$("[data-fav]:checked").map(x=>x.dataset.fav);store.set("dk-fav",JSON.stringify(favs));syncUp()});
  $("#out").onclick=async()=>{try{await fetch("/api/logout",{method:"POST"})}catch(e){}user=null;store.set("dk-user","null");setWho();renderMine()};
}

/* आर्काइव में खोज */
const aq=$("#aq");
if(aq){let acat="सब";
  const run=()=>{const q=aq.value.trim();let n=0;
    $$(".arow").forEach(r=>{const ok=(acat==="सब"||r.dataset.cat===acat)&&(!q||r.textContent.includes(q));r.hidden=!ok;if(ok)n++});
    $$(".aday").forEach(d=>{d.hidden=!d.querySelector(".arow:not([hidden])")});
    $("#acount").textContent=n?`${n} टिप्पणियां`:"इस खोज से कोई टिप्पणी नहीं मिली। कोई और शब्द आज़माइए।"};
  aq.oninput=run;$$("[data-ac]").forEach(b=>b.onclick=()=>{acat=b.dataset.ac;$$("[data-ac]").forEach(x=>x.setAttribute("aria-pressed",x===b));run()});run()}

/* न्यूज़लेटर (सेवा जुड़ने तक) */
const sf=$("#subf");if(sf)sf.onsubmit=async e=>{e.preventDefault();const n=$("#subnote");n.textContent="जोड़ा जा रहा है…";
  try{const r=await fetch("/api/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:$("#email").value})});const d=await r.json();n.textContent=d.msg||"शुक्रिया।";if(r.ok)sf.reset()}
  catch(err){n.textContent="अभी जुड़ नहीं पाये, थोड़ी देर बाद फिर कोशिश कीजिए।"}};

/* ऐप की तरह */
let deferredInstall=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;const b=$("#install");if(b)b.hidden=false});
const ib=$("#install");if(ib)ib.onclick=()=>{deferredInstall&&deferredInstall.prompt()};
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

/* साझा करना */
$$(".share").forEach(box=>{const url=box.dataset.url,title=box.dataset.title;const nb=box.querySelector(".sh-native");
  if(navigator.share&&matchMedia("(pointer:coarse)").matches){nb.hidden=false;nb.onclick=()=>navigator.share({title,text:title,url}).catch(()=>{})}
  const cb=box.querySelector(".sh-copy");cb.onclick=async()=>{try{await navigator.clipboard.writeText(url);cb.textContent="कॉपी हो गया"}catch(e){prompt("लिंक कॉपी कीजिए",url)}setTimeout(()=>cb.textContent="लिंक कॉपी",2000)}});
setWho();paintSaves();renderLast();renderMine();applySize();applyMode();syncDown();
if(/link=expired/.test(location.search)){const m=$("#mine");if(m)m.insertAdjacentHTML("afterbegin",`<p class="note">ये लिंक पुराना हो गया है। फिर से साइन इन कीजिए।</p>`)}
document.fonts&&document.fonts.ready.then(()=>typeof drawAll==="function"&&drawAll());
