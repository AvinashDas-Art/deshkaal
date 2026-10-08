// देशकाल: आज के अख़बार की PDF. GitHub Actions में चलता है: dist/ को localhost:8080 पर परोसा गया हो.
// हर पन्ना एक काग़ज़: चौड़ाई 1240px, ऊंचाई सबसे लंबे पन्ने जितनी.
const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const day = process.argv[2]; if (!day) throw new Error("दिन दीजिए: node scripts/akhbar-pdf.js YYYY-MM-DD");
  const b = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {}); const p = await b.newPage({ viewport: { width: 1240, height: 1600 } });
  await p.goto(`http://localhost:8080/akhbar/${day}/`, { waitUntil: "load", timeout: 90000 });
  await p.emulateMedia({ media: "print" });
  await p.evaluate(async () => { await document.fonts.ready; await Promise.race([Promise.all([...document.images].map(i => { i.loading = "eager"; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); })), new Promise(r => setTimeout(r, 25000))]); });
  const h = await p.evaluate(() => Math.max(...[...document.querySelectorAll(".sheet")].map(s => s.getBoundingClientRect().height)));
  fs.mkdirSync("public/akhbar", { recursive: true });
  await p.pdf({ path: `public/akhbar/${day}.pdf`, width: "1240px", height: Math.ceil(h + 4) + "px", printBackground: true, preferCSSPageSize: false, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  console.log("PDF बनी:", day, Math.round(fs.statSync(`public/akhbar/${day}.pdf`).size / 1024), "KB");
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
