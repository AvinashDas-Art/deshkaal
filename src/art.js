
/* --- generative art --- */
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function paintMotif(g,a,W,H,R,bg,neel,haldi,soft,ink,nsoft){
  g.fillStyle=bg; g.fillRect(0,0,W,H);
  if(a.motif==="list"){
    g.fillStyle=nsoft;g.fillRect(W*.08,H*.1,W*.84,H*.8);
    const rows=11,cols=3,cw=W*.84/cols,rh=H*.8/rows;
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
      const x=W*.08+j*cw+cw*.1,y=H*.1+i*rh+rh*.3,w=cw*(.4+R()*.45);
      g.fillStyle=neel;g.globalAlpha=.75;g.fillRect(x,y,w,rh*.32);g.globalAlpha=1;
      if(R()<.22){g.strokeStyle=haldi;g.lineWidth=Math.max(2,rh*.14);g.beginPath();g.moveTo(x-4,y+rh*.16);g.lineTo(x+w+4,y+rh*.16);g.stroke()}
    }
  }
  if(a.motif==="arc"){
    const cx=W/2,cy=H*.9,max=Math.min(W*.45,H*.8);
    for(let ring=0;ring<7;ring++){const rad=max*(.35+ring*.1),n=10+ring*5;
      for(let k=0;k<=n;k++){const t=Math.PI+Math.PI*k/n,x=cx+Math.cos(t)*rad,y=cy+Math.sin(t)*rad,s=max*.028;
        g.beginPath();g.arc(x,y,s,0,7);const e=R()<.3;
        if(e){g.strokeStyle=neel;g.lineWidth=1.5;g.stroke()}else{g.fillStyle=k<n*.62?neel:haldi;g.fill()}}}
  }
  if(a.motif==="scales"){
    g.fillStyle=soft;g.beginPath();g.arc(W*.68,H*.42,Math.min(W,H)*.3,0,7);g.fill();
    g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(W*.5,H*.18);g.lineTo(W*.5,H*.82);g.moveTo(W*.26,H*.3);g.lineTo(W*.74,H*.24);g.stroke();
    g.fillStyle=neel;g.beginPath();g.arc(W*.26,H*.48,W*.1,0,Math.PI);g.fill();
    g.fillStyle=haldi;g.beginPath();g.arc(W*.74,H*.4,W*.1,0,Math.PI);g.fill();
    g.fillStyle=ink;g.fillRect(W*.4,H*.82,W*.2,4);
  }
  if(a.motif==="tents"){
    g.fillStyle=soft;g.fillRect(0,H*.62,W,H*.38);
    for(let i=0;i<26;i++){const x=R()*W,y=H*(.35+R()*.5),s=W*(.04+R()*.07);
      g.fillStyle=R()<.7?neel:haldi;g.globalAlpha=.55+R()*.45;g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y+s*.4);g.lineTo(x-s,y+s*.4);g.closePath();g.fill();}
    g.globalAlpha=1;g.fillStyle=haldi;g.beginPath();g.arc(W*.82,H*.2,Math.min(W,H)*.08,0,7);g.fill();
  }
  if(a.motif==="coins"){
    for(let s=0;s<5;s++){const x=W*(.18+s*.16),n=3+Math.floor(R()*9)+s*2;
      for(let k=0;k<n;k++){const y=H*.85-k*H*.055;g.fillStyle=k%2?neel:haldi;g.globalAlpha=.9;
        g.beginPath();g.ellipse(x,y,W*.065,H*.03,0,0,7);g.fill();}}
    g.globalAlpha=1;g.strokeStyle=ink;g.lineWidth=2;g.beginPath();g.moveTo(W*.05,H*.86+H*.04);g.lineTo(W*.95,H*.86+H*.04);g.stroke();
  }
  if(a.motif==="rings"){
    const cx=W*(.35+R()*.3),cy=H*.5,m=Math.min(W,H);
    for(let k=9;k>0;k--){g.beginPath();g.arc(cx,cy,m*.05*k,0,7);g.strokeStyle=k%3?neel:haldi;g.globalAlpha=.25+k*.07;g.lineWidth=k%3?2:5;g.stroke()}
    g.globalAlpha=1;g.fillStyle=haldi;g.beginPath();g.arc(cx,cy,m*.06,0,7);g.fill();
    for(let i=0;i<18;i++){g.fillStyle=neel;g.globalAlpha=.6;g.beginPath();g.arc(R()*W,R()*H,2+R()*3,0,7);g.fill()}g.globalAlpha=1;
  }
  if(a.motif==="book"){
    const cx=W/2,top=H*.22,bw=W*.36,bh=H*.56;
    g.fillStyle=nsoft;g.beginPath();g.moveTo(cx,top+10);g.lineTo(cx-bw,top);g.lineTo(cx-bw,top+bh);g.lineTo(cx,top+bh+10);g.closePath();g.fill();
    g.fillStyle=soft;g.beginPath();g.moveTo(cx,top+10);g.lineTo(cx+bw,top);g.lineTo(cx+bw,top+bh);g.lineTo(cx,top+bh+10);g.closePath();g.fill();
    for(let i=0;i<9;i++){const y=top+bh*.12+i*bh*.09;
      g.fillStyle=neel;g.globalAlpha=.7;g.fillRect(cx-bw*.86,y,bw*(.5+R()*.28),3);
      if(R()<.55){g.fillStyle=haldi;g.globalAlpha=.9;g.fillRect(cx+bw*.12,y,bw*(.4+R()*.38),3)}}
    g.globalAlpha=1;g.strokeStyle=ink;g.lineWidth=2;g.beginPath();g.moveTo(cx,top+10);g.lineTo(cx,top+bh+10);g.stroke();
  }
  if(a.motif==="soil"){
    const bands=[soft,haldi,nsoft,neel];
    for(let i=0;i<4;i++){g.fillStyle=bands[i];g.globalAlpha=i===3?.55:.85;g.fillRect(0,H*(.42+i*.145),W,H*.15)}
    g.globalAlpha=1;
    for(let i=0;i<70;i++){g.fillStyle=R()<.5?ink:bg;g.globalAlpha=.35;g.beginPath();g.arc(R()*W,H*(.45+R()*.55),1+R()*2.5,0,7);g.fill()}
    g.globalAlpha=1;g.strokeStyle=neel;g.lineWidth=3;
    for(let p=0;p<3;p++){const x=W*(.25+p*.25),h=H*(.14+R()*.12);g.beginPath();g.moveTo(x,H*.42);g.lineTo(x,H*.42-h);g.stroke();
      g.fillStyle=neel;g.beginPath();g.ellipse(x-10,H*.42-h*.7,10,4,-.5,0,7);g.fill();g.beginPath();g.ellipse(x+10,H*.42-h*.9,10,4,.5,0,7);g.fill()}
  }
  if(a.motif==="mountain"){
    const peaks=[[.12,.3,neel,.9],[.42,.18,ink,.85],[.75,.28,neel,.7]];
    peaks.forEach(([px,py,c,al])=>{g.fillStyle=c;g.globalAlpha=al;g.beginPath();g.moveTo(W*(px-.32),H*.78);g.lineTo(W*px,H*py);g.lineTo(W*(px+.32),H*.78);g.closePath();g.fill();
      g.fillStyle=bg;g.globalAlpha=.9;g.beginPath();g.moveTo(W*px,H*py);g.lineTo(W*(px-.05),H*(py+.1));g.lineTo(W*(px+.05),H*(py+.1));g.closePath();g.fill()});
    g.globalAlpha=1;g.strokeStyle=haldi;g.lineWidth=4;
    for(let r=0;r<3;r++){g.beginPath();for(let x=0;x<=W;x+=8){const y=H*(.84+r*.06)+Math.sin(x/30+r)*5;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
  }
  if(a.motif==="marks"){
    const sym=["।","?",",","…","(",")","؟","!"];g.textAlign="center";g.textBaseline="middle";
    for(let i=0;i<14;i++){const s=sym[Math.floor(R()*sym.length)];g.font=`${Math.round(H*(.12+R()*.2))}px "Laila", serif`;
      g.fillStyle=s==="?"?haldi:neel;g.globalAlpha=s==="?"?.95:.45+R()*.4;g.fillText(s,W*(.08+R()*.84),H*(.15+R()*.7))}
    g.globalAlpha=1;g.font=`${Math.round(H*.55)}px "Laila", serif`;g.fillStyle=haldi;g.fillText("?",W*.5,H*.5);
    g.strokeStyle=ink;g.lineWidth=5;g.beginPath();g.moveTo(W*.38,H*.3);g.lineTo(W*.62,H*.72);g.stroke();
  }
  if(a.motif==="waves"){
    for(let r=0;r<12;r++){g.beginPath();const amp=H*(.03+R()*.06),f=20+R()*30;
      for(let x=0;x<=W;x+=6){const y=H*(.12+r*.07)+Math.sin(x/f+r)*amp;x?g.lineTo(x,y):g.moveTo(x,y)}
      g.strokeStyle=r%4===0?haldi:neel;g.globalAlpha=r%4===0?.9:.5;g.lineWidth=r%4===0?4:2;g.stroke()}
    g.globalAlpha=1;
  }

}
const STOP=["है","का","की","के","में","एक","और","से","को","पर","फिर","भी","क्यों","कौन","नहीं","अब","जब","तो","ये","वो","उनका","इन्हें","करने","जिस","दो","कोशिश","सिर्फ़","लगभग","बाद","तीन","साल","पहले","किसके","किसका","इसके","उसके","भरेगा","होने"];
/* collage: torn paper pieces, halftone print, our own headline fragments, tape */
function torn(g,x,y,w,h,R,j){j=j||3;g.beginPath();
  const st=7;let first=true;const pt=(px,py)=>{first?g.moveTo(px,py):g.lineTo(px,py);first=false};
  for(let t=0;t<=w;t+=st)pt(x+t,y+(R()-.5)*j*2);
  for(let t=0;t<=h;t+=st)pt(x+w+(R()-.5)*j*2,y+t);
  for(let t=w;t>=0;t-=st)pt(x+t,y+h+(R()-.5)*j*2);
  for(let t=h;t>=0;t-=st)pt(x+(R()-.5)*j*2,y+t);g.closePath()}
function draw(c){
  const ds=c.dataset; if(!ds.motif)return; const a={id:ds.id,motif:ds.motif,seed:+ds.seed,h:ds.h||"",cat:ds.cat||""};
  const r=c.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2);
  const W=Math.max(1,Math.round(r.width)), H=Math.max(1,Math.round(r.height));
  c.width=W*d;c.height=H*d;const g=c.getContext("2d");g.scale(d,d);
  const cs=getComputedStyle(root),v=n=>cs.getPropertyValue(n).trim();
  const paper=v("--paper"),bg=v("--paper-2"),neel=v("--neel"),haldi=v("--haldi"),soft=v("--haldi-soft"),ink=v("--ink"),nsoft=v("--neel-soft"),lal=v("--lal");
  const R=rng(a.seed*7+3), small=W<200;
  /* ground: newsprint with specks */
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  for(let i=0;i<W*H/900;i++){g.fillStyle=ink;g.globalAlpha=.05+R()*.06;g.fillRect(R()*W,R()*H,1.2,1.2)}g.globalAlpha=1;
  /* piece B: halftone "print" panel */
  const bx=W*(.5+R()*.08),by=H*(.05+R()*.06),bw=W*.44,bh=H*(.5+R()*.2);
  g.save();g.translate(bx+bw/2,by+bh/2);g.rotate((R()*5+1)*Math.PI/180);g.translate(-bw/2,-bh/2);
  torn(g,0,0,bw,bh,R,2.5);g.fillStyle=soft;g.fill();g.clip();
  const step=Math.max(5,Math.round(W/70)),fx=R()*6.28,fy=R()*6.28;
  for(let y=0;y<bh;y+=step)for(let x=0;x<bw;x+=step){
    const t=.5+.5*Math.sin(x/bw*3+fx)*Math.cos(y/bh*2.4+fy);g.fillStyle=neel;g.globalAlpha=.85;
    g.beginPath();g.arc(x+step/2,y+step/2,step*.48*t,0,7);g.fill()}
  g.restore();g.globalAlpha=1;
  /* piece A: the motif, on torn paper with a soft drop */
  const ax=W*.05,ay=H*(.12+R()*.06),aw=W*.6,ah=H*.74,rot=(-1-R()*3)*Math.PI/180;
  g.save();g.translate(ax+aw/2,ay+ah/2);g.rotate(rot);g.translate(-aw/2,-ah/2);
  g.save();g.translate(3,4);torn(g,0,0,aw,ah,R);g.fillStyle=ink;g.globalAlpha=.16;g.fill();g.restore();g.globalAlpha=1;
  torn(g,0,0,aw,ah,R);g.fillStyle=paper;g.fill();g.clip();
  paintMotif(g,a,aw,ah,rng(a.seed),paper,neel,haldi,soft,ink,nsoft);
  g.restore();
  /* red stamp */
  if(R()<.6){g.fillStyle=lal;g.globalAlpha=.9;g.beginPath();g.arc(W*(.6+R()*.1),H*(.62+R()*.1),Math.min(W,H)*(.07+R()*.05),0,7);g.fill();g.globalAlpha=1}
  /* our own headline fragments as cut-out strips */
  if(!small){
    const ws=a.h.replace(/[,:?।]/g,"").split(/\s+/).filter(w=>w.length>2&&!STOP.includes(w));
    const pick=[];if(!ws.length)ws.push(a.cat);const n=Math.min(2,ws.length);while(pick.length<n){const w=ws[Math.floor(R()*ws.length)];if(!pick.includes(w))pick.push(w)}
    const fonts=['"Yatra One", serif','"Laila", serif','"Noto Sans Devanagari", sans-serif'];
    pick.forEach((w,i)=>{const fs=Math.round(H*(i?.085:.12));g.font=`${i?500:400} ${fs}px ${fonts[(i+Math.floor(R()*3))%3]}`;
      const tw=g.measureText(w).width,px=W*(.5+R()*.12),py=H*(.7+i*.15);
      g.save();g.translate(px,py);g.rotate((R()-.5)*.12);
      torn(g,-10,-fs*.95,tw+20,fs*1.35,R,1.5);g.fillStyle=i?ink:paper;g.fill();
      g.fillStyle=i?paper:ink;g.textBaseline="alphabetic";g.fillText(w,0,0);g.restore()});
  }
  /* tape */
  [[ax+aw*.1,ay-6,-8],[ax+aw*.86,ay+ah-10,10]].forEach(([x,y,deg])=>{g.save();g.translate(x,y);g.rotate(deg*Math.PI/180);g.fillStyle=haldi;g.globalAlpha=.38;g.fillRect(-W*.05,-8,W*.1,16);g.restore()});
  g.globalAlpha=1;
}
function drawAll(){document.querySelectorAll("canvas.art").forEach(draw)}
addEventListener("resize",()=>{clearTimeout(window.__t);window.__t=setTimeout(drawAll,120)});

