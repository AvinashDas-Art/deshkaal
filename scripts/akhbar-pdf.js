// देशकाल: आज के अख़बार की PDF. GitHub Actions में चलता है: dist/ को localhost:8080 पर परोसा गया हो.
// हर पन्ना अपने नाप का एक काग़ज़ (चौड़ाई 1240px, ऊंचाई उस पन्ने जितनी), फिर सब एक PDF में.
const { chromium } = require("playwright");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
(async () => {
  const day = process.argv[2]; if (!day) throw new Error("दिन दीजिए: node scripts/akhbar-pdf.js YYYY-MM-DD");
  const b = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
  const ctx = await b.newContext({ viewport: { width: 1240, height: 1600 }, userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36 deshkaal.xyz" });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:8080/akhbar/${day}/`, { waitUntil: "load", timeout: 90000 });
  await p.emulateMedia({ media: "print" });
  await p.evaluate(async () => { await document.fonts.ready; await Promise.race([Promise.all([...document.images].map(i => { i.loading = "eager"; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); })), new Promise(r => setTimeout(r, 30000))]); });
  const ids = await p.evaluate(() => [...document.querySelectorAll(".sheet")].map(s => s.id));
  const out = await PDFDocument.create();
  for (const id of ids) {
    const h = await p.evaluate(id => { document.querySelectorAll(".sheet").forEach(s => { s.style.display = s.id === id ? "" : "none"; }); return document.getElementById(id).getBoundingClientRect().height; }, id);
    const buf = await p.pdf({ width: "1240px", height: Math.ceil(h + 2) + "px", printBackground: true, preferCSSPageSize: false, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    const src = await PDFDocument.load(buf); const [pg] = await out.copyPages(src, [0]); out.addPage(pg);
  }
  out.setTitle(`देशकाल · ${day}`); out.setAuthor("देशकाल · deshkaal.xyz");
  fs.mkdirSync("public/akhbar", { recursive: true });
  fs.writeFileSync(`public/akhbar/${day}.pdf`, await out.save());
  console.log("PDF बनी:", day, ids.length, "पन्ने,", Math.round(fs.statSync(`public/akhbar/${day}.pdf`).size / 1024), "KB");
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
