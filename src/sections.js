// One section assignment shared by the homepage and newspaper.
const SECS = new Set(["morcha", "amukh", "vichar", "khabar", "pari", "video", "sahitya", "hidden"]);
const RURAL_PUBS = new Set(["PARI", "खबर लहरिया"]);
const LITERARY_PUBS = /हिन्दवी|हिंदवी|hindwi|सम्मुख|समालोचन|जानकीपुल/i;
const publisher = a => String(a.pub || "").normalize("NFC").trim();
function isRuralReport(a) {
  return (a.sec === "pari" || RURAL_PUBS.has(publisher(a))) &&
    !LITERARY_PUBS.test(publisher(a)) && !/hindwi\.org/i.test(a.url || "") && a.cat !== "साहित्य" &&
    !["sahitya", "hidden", "video", "morcha"].includes(a.sec) && !a.yt && !a.ia;
}
function normalizeSection(a, i = 0) {
  if (isRuralReport(a)) return "pari";
  if (a.sec === "pari") return a.cat === "साहित्य" ? "sahitya" : "vichar";
  if (SECS.has(a.sec)) return a.sec;
  return a.cat === "साहित्य" ? "sahitya" : (a.yt || a.ia) ? "video" : i === 0 ? "amukh" : "vichar";
}
module.exports = { normalizeSection, isRuralReport };
