// IndexNow: नये/बदले पन्नों की सूची Bing, Yandex वग़ैरह को तुरंत भेजना (GitHub Actions से, हर पुश पर)।
const fs = require("fs");
const KEY = "59c9b6d9a2ba850dff1c5796c05f69d1", HOST = "deshkaal.xyz";
const urls = fs.readFileSync("dist/indexnow-urls.txt", "utf8").split("\n").filter(Boolean).slice(0, 10000);
if (!urls.length) { console.log("IndexNow: कोई नया पन्ना नहीं"); process.exit(0); }
fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }) })
  .then(r => console.log("IndexNow:", r.status, urls.length, "पन्ने")).catch(e => { console.error(e); process.exit(1); });
