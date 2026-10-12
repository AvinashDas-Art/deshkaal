// देशकाल: Facebook पेज और Instagram पर अपने आप पोस्ट (Meta Graph API).
// GitHub Actions से चलता है (.github/workflows/social.yml). secret न हों तो चुपचाप कुछ नहीं करता.
//
//   node scripts/social.js morning      सुबह का पूरा अंक: FB पर तस्वीरों वाली पोस्ट, Instagram पर कैरोसेल
//   node scripts/social.js next       दिन भर, हर बार अगली एक ख़बर: FB पर हर ख़बर, Instagram पर चुनी हुई
//   node scripts/social.js check      कुछ पोस्ट नहीं करता: सिर्फ़ जांचता है कि FB पेज और Instagram के टोकन चल रहे हैं
//   DRY_RUN=1 ...                     कुछ भेजे बिना बताता है कि क्या जाता
//
// ज़रूरी secrets: FB_PAGE_ID, FB_PAGE_TOKEN (पेज का लंबा चलने वाला टोकन), IG_USER_ID (Instagram बिज़नेस खाते की id)
// क्या-क्या जा चुका है, ये data/social/<दिन>.json में दर्ज होता है, ताकि कुछ दोबारा न जाए.
const fs = require("fs"), path = require("path");
const SITE = "https://deshkaal.xyz", G = "https://graph.facebook.com/v21.0";
const env = process.env, DRY = !!env.DRY_RUN;
const IG_SINGLES = +(env.IG_SINGLES || 6);       // Instagram पर दिन में कितनी अलग ख़बरें (कैरोसेल के अलावा)

const M = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
const istDay = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const day = env.DAY || istDay();
const file = path.join("data/days", day + ".json");
const CHECK = process.argv[2] === "check";
if (!CHECK && !fs.existsSync(file)) { console.log("आज का अंक नहीं मिला:", day); process.exit(0); }
const items = CHECK ? [] : JSON.parse(fs.readFileSync(file, "utf8"));
const news = items.filter(a => a.cat !== "साहित्य"), lit = items.filter(a => a.cat === "साहित्य");
const d = new Date(day + "T00:00:00Z"), label = `${d.getUTCDate()} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const url = a => `${SITE}/lekh/${a.id}/`;
const short = a => `${SITE}/k/${a.id.slice(2).replace(/-/g, "")}`;
const img = n => `${SITE}/ig/${n}.jpg`;
const TAG = { "देश": "#भारत", "दुनिया": "#दुनिया", "समाज": "#समाज", "अर्थ": "#अर्थव्यवस्था", "पर्यावरण": "#पर्यावरण", "स्त्री": "#स्त्री", "संस्कृति": "#संस्कृति", "साहित्य": "#साहित्य" };
const tags = a => ["#देशकाल", TAG[a.cat], "#हिंदी", "#ज़रूरी_ख़बरें"].filter(Boolean).join(" ");
const cut = (t, n) => t.length > n ? t.slice(0, n - 1).trim() + "…" : t;

const stateFile = path.join("data/social", day + ".json");
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : { fb: {}, ig: {} };
const save = () => { if (DRY) return; fs.mkdirSync("data/social", { recursive: true }); fs.writeFileSync(stateFile, JSON.stringify(state, null, 1)); };

async function api(p, params = {}, method = "POST") {
  if (DRY && method === "POST") { console.log("  [DRY]", p, Object.keys(params).join(",")); return { id: "dry-" + Math.random().toString(36).slice(2, 8) }; }
  const body = new URLSearchParams({ ...params, access_token: p.startsWith("/" + env.IG_USER_ID) ? (env.IG_TOKEN || env.FB_PAGE_TOKEN) : env.FB_PAGE_TOKEN });
  const r = method === "POST" ? await fetch(G + p, { method, body }) : await fetch(G + p + "?" + body);
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${p}: ${JSON.stringify(j.error || j)}`);
  return j;
}
const fbOn = () => env.FB_PAGE_ID && env.FB_PAGE_TOKEN;
const igOn = () => env.IG_USER_ID && (env.IG_TOKEN || env.FB_PAGE_TOKEN);

/* कैप्शन */
function morningText(forIG) {
  const L = news[0];
  const line = (a, i) => forIG ? `${i}. ${a.h}` : `${i}. ${a.h}\n${short(a)}`;
  return [`देशकाल · ${label}`, "ज़रूरी ख़बरों तक जाती एक पगडंडी", "",
    "आज की बड़ी बहस", L.h, L.dek, "", `आज का सवाल: ${L.sawal}`, "",
    "आज की टिप्पणियां", ...news.slice(1, 10).map((a, i) => line(a, i + 2)), "",
    ...(lit.length ? ["साहित्य", ...lit.slice(0, 3).map(a => forIG ? `· ${a.h}` : `· ${a.h}\n${short(a)}`), ""] : []),
    forIG ? "पूरा अंक deshkaal.xyz पर, लिंक बायो में।" : `पूरा अंक: ${SITE}`,
    "", "#देशकाल #हिंदी #ज़रूरी_ख़बरें #आज_की_ख़बरें"].join("\n");
}
function storyText(a, forIG) {
  const nz = (a.nazar || [])[0] || "";
  return [a.h, "", a.dek, "", ...(nz ? [cut(nz, forIG ? 600 : 400), ""] : []),
    `मूल: ${a.by} · ${a.pub}`, forIG ? `पूरा सार: deshkaal.xyz (लिंक बायो में)` : "", "", tags(a)].filter((x, i, arr) => !(x === "" && arr[i - 1] === "")).join("\n");
}

/* Instagram: कंटेनर बनता है, Meta तस्वीर उठाता है, फिर छपता है */
async function igReady(id) {
  if (DRY) return;
  for (let i = 0; i < 20; i++) {
    const j = await api("/" + id, { fields: "status_code" }, "GET");
    if (j.status_code === "FINISHED") return;
    if (j.status_code === "ERROR") throw new Error("Instagram ने तस्वीर नहीं ली: " + id);
    await new Promise(r => setTimeout(r, 4000));
  }
  throw new Error("Instagram कंटेनर तैयार नहीं हुआ: " + id);
}
async function igPublish(creation) { await igReady(creation); return api(`/${env.IG_USER_ID}/media_publish`, { creation_id: creation }); }

async function morning() {
  const slides = [`${day}-cover`, ...news.slice(0, 8).map(a => a.id), `${day}-end`];
  if (fbOn() && !state.fb.morning) {
    try {
      const ids = [];
      for (const s of slides.slice(0, 9)) ids.push((await api(`/${env.FB_PAGE_ID}/photos`, { url: img(
