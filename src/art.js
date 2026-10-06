
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
/* each category has its own ink; light and dark versions */
const CATCOL={"देश":[["#B23A2E","#F2D8D2"],["#E8796C","#3B2421"]],"दुनिया":[["#2E3F8F","#DDE1F0"],["#9AA8EA","#262C45"]],"समाज":[["#A2650E","#F2E2C4"],["#DDA94F","#3A2E1C"]],"अर्थ":[["#2D6A4F","#D6EADF"],["#7CC4A0","#1D3329"]],"पर्यावरण":[["#5B7A1E","#E3ECCB"],["#A9C766","#2A331A"]],"स्त्री":[["#9A2F67","#F1D6E4"],["#E07DB0","#3A1F2E"]],"संस्कृति":[["#5A3E91","#E3DCF2"],["#B39AE6","#2C2440"]],"साहित्य":[["#6E4423","#EDDFD0"],["#D2A27A","#33261C"]]};
function pickWords(a,R,n){const ws=a.h.replace(/[,:?।]/g,"").split(/\s+/).filter(w=>w.length>2&&!STOP.includes(w));if(!ws.length)ws.push(a.cat);
  const out=[];n=Math.min(n,ws.length);let guard=0;while(out.length<n&&guard++<50){const w=ws[Math.floor(R()*ws.length)];if(!out.includes(w))out.push(w)}return out}
function strip(g,R,w,x,y,fs,font,fill,txt){g.font=`${fs}px ${font}`;const tw=g.measureText(w).width;
  g.save();g.translate(x,y);g.rotate((R()-.5)*.1);torn(g,-fs*.25,-fs*.95,tw+fs*.5,fs*1.35,R,1.5);g.fillStyle=fill;g.fill();
  g.fillStyle=txt;g.textBaseline="alphabetic";g.fillText(w,0,0);g.restore()}
function tape(g,x,y,deg,len,col){g.save();g.translate(x,y);g.rotate(deg*Math.PI/180);g.fillStyle=col;g.globalAlpha=.4;g.fillRect(-len/2,-8,len,16);g.restore();g.globalAlpha=1}
function halftone(g,x,y,w,h,step,col,R,alpha){const fx=R()*6.28,fy=R()*6.28;g.fillStyle=col;g.globalAlpha=alpha||.85;
  for(let yy=0;yy<h;yy+=step)for(let xx=0;xx<w;xx+=step){const t=.5+.5*Math.sin(xx/w*3+fx)*Math.cos(yy/h*2.4+fy);g.beginPath();g.arc(x+xx+step/2,y+yy+step/2,step*.48*t,0,7);g.fill()}g.globalAlpha=1}
const PHOTOS={};
function getPhoto(src){if(!src)return null;let im=PHOTOS[src];if(im)return im.complete&&im.naturalWidth?im:null;
  im=new Image();im.crossOrigin="anonymous";im.decoding="async";im.onload=()=>drawAll();im.src=src;PHOTOS[src]=im;return null}
/* fill a w×h region (already translated/clipped) with the photo, toned to the category colour; falls back to the drawn motif */
function fillPiece(g,a,w,h,C,R){const im=getPhoto(a.photo);
  if(!im){paintMotif(g,a,w,h,rng(a.seed),C.paper,C.main,C.accent,C.soft,C.ink,C.soft);return}
  const s=Math.max(w/im.naturalWidth,h/im.naturalHeight),iw=im.naturalWidth*s,ih=im.naturalHeight*s;
  g.save();
  if(a.kind==="painting"){ /* पेंटिंग अपने रंगों में, बस श्रेणी के रंग की हल्की परत */
    g.filter="saturate(1.05) contrast(1.05)";g.drawImage(im,(w-iw)/2,(h-ih)*.42,iw,ih);g.filter="none";
    g.globalCompositeOperation="multiply";g.globalAlpha=.12;g.fillStyle=C.main;g.fillRect(0,0,w,h);g.restore();return}
  g.filter="grayscale(1) contrast(1.15) brightness(1.04)";g.drawImage(im,(w-iw)/2,(h-ih)*.42,iw,ih);g.filter="none";
  g.globalCompositeOperation="color";g.globalAlpha=.42;g.fillStyle=C.main;g.fillRect(0,0,w,h);g.restore()}
function motifPiece(g,a,x,y,w,h,rot,R,c){g.save();g.translate(x+w/2,y+h/2);g.rotate(rot);g.translate(-w/2,-h/2);
  g.save();g.translate(3,4);torn(g,0,0,w,h,R);g.fillStyle=c.ink;g.globalAlpha=.16;g.fill();g.restore();g.globalAlpha=1;
  torn(g,0,0,w,h,R);g.fillStyle=c.paper;g.fill();g.clip();fillPiece(g,a,w,h,c,R);g.restore()}
function draw(c){
  const ds=c.dataset; if(!ds.motif)return; const a={id:ds.id,motif:ds.motif,seed:+ds.seed,h:ds.h||"",cat:ds.cat||"",photo:ds.photo||"",kind:ds.kind||"photo",word:ds.word||""};
  const r=c.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2);
  const W=Math.max(1,Math.round(r.width)), H=Math.max(1,Math.round(r.height));
  c.width=W*d;c.height=H*d;const g=c.getContext("2d");g.scale(d,d);
  const cs=getComputedStyle(root),v=n=>cs.getPropertyValue(n).trim();
  const paper=v("--paper"),bg=v("--paper-2"),ink=v("--ink"),lal=v("--lal"),haldi=v("--haldi");
  const dark=cs.colorScheme.includes("dark")||root.dataset.theme==="dark"||(!root.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
  const pal=(CATCOL[a.cat]||CATCOL["दुनिया"])[dark?1:0];
  const C={paper,ink,main:pal[0],soft:pal[1],accent:a.cat==="समाज"?lal:haldi};
  const R=rng(a.seed*7+3), small=W<200, m=Math.min(W,H);
  const pos=parseInt((a.id||"").slice(-2),10);const variant=a.word?(a.photo?0:1):(Number.isFinite(pos)?(pos*5+1)%6:Math.abs(a.seed)%6);
  const F1='"Yatra One", serif',F2='"Laila", serif',F3='"Noto Sans Devanagari", sans-serif';
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  for(let i=0;i<W*H/900;i++){g.fillStyle=ink;g.globalAlpha=.05+R()*.06;g.fillRect(R()*W,R()*H,1.2,1.2)}g.globalAlpha=1;
  const step=Math.max(5,Math.round(W/70));
  if(variant===0){ /* torn motif + halftone panel */
    const bx=W*(.5+R()*.08),by=H*(.05+R()*.06),bw=W*.44,bh=H*(.5+R()*.2);
    g.save();g.translate(bx+bw/2,by+bh/2);g.rotate((R()*5+1)*Math.PI/180);g.translate(-bw/2,-bh/2);torn(g,0,0,bw,bh,R,2.5);g.fillStyle=C.soft;g.fill();g.clip();halftone(g,0,0,bw,bh,step,C.main,R);g.restore();
    const ax=W*.05,ay=H*(.12+R()*.06),aw=W*.6,ah=H*.74;motifPiece(g,a,ax,ay,aw,ah,(-1-R()*3)*Math.PI/180,R,C);
    tape(g,ax+aw*.1,ay-6,-8,W*.1,haldi);
    if(!small)pickWords(a,R,2).forEach((w,i)=>strip(g,R,w,W*(.5+R()*.1),H*(.72+i*.15),Math.round(H*(i?.085:.12)),i?F3:F1,i?ink:paper,i?paper:ink));
  }else if(variant===1){ /* poster: colour field, circular cut-out */
    g.fillStyle=C.main;g.fillRect(0,0,W,H);halftone(g,W*.45,0,W*.55,H,step,C.soft,R,.35);
    const cx=W*(.36+R()*.06),cy=H*.5,rr=m*.38;
    g.save();g.beginPath();g.arc(cx,cy,rr,0,7);g.fillStyle=paper;g.fill();g.clip();g.translate(cx-rr,cy-rr);fillPiece(g,a,rr*2,rr*2,C,R);g.restore();
    g.strokeStyle=paper;g.lineWidth=Math.max(3,m*.02);g.beginPath();g.arc(cx,cy,rr+m*.03,0,7);g.stroke();
    if(!small){const w=pickWords(a,R,1)[0];g.font=`${Math.round(H*.2)}px ${F1}`;g.fillStyle=paper;g.textBaseline="alphabetic";g.save();g.translate(W*.55,H*.88);g.rotate(-.04);g.fillText(w,0,0);g.restore()}
  }else if(variant===2){ /* split: category block with oversized word */
    g.fillStyle=C.main;g.fillRect(0,0,W*.42,H);
    g.save();g.beginPath();g.rect(0,0,W*.42,H);g.clip();g.font=`${Math.round(H*.62)}px ${F1}`;g.fillStyle=C.soft;g.globalAlpha=.9;g.textBaseline="alphabetic";g.fillText(a.cat,-W*.04,H*.98);g.restore();g.globalAlpha=1;
    motifPiece(g,a,W*.34,H*.12,W*.6,H*.72,(1+R()*2.5)*Math.PI/180,R,C);
    tape(g,W*.36,H*.14,-30,W*.09,haldi);tape(g,W*.92,H*.8,-28,W*.09,haldi);
    if(!small)strip(g,R,pickWords(a,R,1)[0],W*.06,H*.18,Math.round(H*.1),F2,paper,ink);
  }else if(variant===3){ /* triptych: three torn strips of one picture */
    g.fillStyle=C.soft;g.fillRect(0,0,W,H);
    const off=document.createElement("canvas");off.width=W*d;off.height=H*d;const og=off.getContext("2d");og.scale(d,d);fillPiece(og,a,W,H,C,R);
    const sw=W*.29;[0,1,2].forEach(k=>{const x=W*(.04+k*.32),y=H*(.08+(k%2)*.06),hh=H*.8;
      g.save();g.translate(x+sw/2,y+hh/2);g.rotate((R()-.5)*.06);g.translate(-sw/2,-hh/2);
      g.save();g.translate(3,4);torn(g,0,0,sw,hh,R);g.fillStyle=ink;g.globalAlpha=.15;g.fill();g.restore();g.globalAlpha=1;
      torn(g,0,0,sw,hh,R);g.clip();g.drawImage(off,(x-W*.02)*d,y*d,sw*d,hh*d,0,0,sw,hh);g.restore();
      tape(g,x+sw/2,y-4,(R()-.5)*20,sw*.4,haldi)});
    if(!small)strip(g,R,pickWords(a,R,1)[0],W*.58,H*.9,Math.round(H*.11),F1,ink,paper);
  }else if(variant===4){ /* newsprint: ruled columns, round photo, stamp */
    g.strokeStyle=ink;g.globalAlpha=.18;g.lineWidth=1.5;
    for(let col=0;col<4;col++)for(let y=H*.1;y<H*.92;y+=Math.max(7,H/28)){const x=W*(.05+col*.235),w=W*.2*(R()<.12?.5:1);g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke()}
    g.globalAlpha=1;const cx=W*(.55+R()*.15),cy=H*.48,rr=m*.36;
    g.save();g.beginPath();g.arc(cx,cy,rr,0,7);g.fillStyle=paper;g.fill();g.clip();g.translate(cx-rr,cy-rr);fillPiece(g,a,rr*2,rr*2,C,R);g.restore();
    g.strokeStyle=C.main;g.lineWidth=Math.max(4,m*.035);g.beginPath();g.arc(cx,cy,rr,0,7);g.stroke();
    g.save();g.translate(W*.2,H*.72);g.rotate(-.18);g.strokeStyle=lal;g.lineWidth=3;g.strokeRect(-W*.12,-H*.1,W*.24,H*.2);
    if(!small){g.font=`${Math.round(H*.09)}px ${F3}`;g.fillStyle=lal;g.textAlign="center";g.textBaseline="middle";g.fillText(a.cat,0,0)}g.restore();g.textAlign="start";
  }else{ /* frame: thick stamp border, word overprinted */
    g.fillStyle=C.soft;g.fillRect(0,0,W,H);
    g.save();g.translate(W/2,H/2);g.rotate((R()-.5)*.08);const fw=W*.74,fh=H*.74;
    g.fillStyle=paper;g.fillRect(-fw/2,-fh/2,fw,fh);g.save();g.beginPath();g.rect(-fw/2,-fh/2,fw,fh);g.clip();g.translate(-fw/2,-fh/2);fillPiece(g,a,fw,fh,C,R);g.restore();
    g.strokeStyle=C.main;g.lineWidth=Math.max(6,m*.05);g.strokeRect(-fw/2,-fh/2,fw,fh);g.restore();
    halftone(g,0,H*.78,W,H*.22,step,C.main,R,.5);
    if(!small){const w=pickWords(a,R,1)[0];g.font=`${Math.round(H*.18)}px ${F1}`;g.fillStyle=C.main;g.globalAlpha=.92;g.textBaseline="alphabetic";g.fillText(w,W*.08,H*.9);g.globalAlpha=1}
  }
  if(a.word){ /* शब्द-चित्र: collage shows only through the letters */
    let fs=H*1.02;g.font=`${fs}px ${F1}`;let tw=g.measureText(a.word).width;if(tw>W*.96){fs*=W*.96/tw;g.font=`${fs}px ${F1}`;tw=g.measureText(a.word).width}
    g.globalCompositeOperation="destination-in";g.fillStyle="#000";g.textBaseline="alphabetic";g.fillText(a.word,(W-tw)/2,H*.5+fs*.36);
    g.globalCompositeOperation="destination-over";g.fillStyle=paper;g.fillRect(0,0,W,H);g.globalCompositeOperation="source-over";return}
  if(variant!==1&&variant!==4&&R()<.45){g.fillStyle=lal;g.globalAlpha=.9;g.beginPath();g.arc(W*(.62+R()*.2),H*(.18+R()*.15),m*(.06+R()*.04),0,7);g.fill();g.globalAlpha=1}
}
function drawAll(){document.querySelectorAll("canvas.art").forEach(draw)}
addEventListener("resize",()=>{clearTimeout(window.__t);window.__t=setTimeout(drawAll,120)});

