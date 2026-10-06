// देशकाल: तीन भाषाओं के इंटरफ़ेस शब्द (build.js इस्तेमाल करता है)
// सामग्री का अनुवाद data/i18n/<lang>/<दिन>.json में रहता है; यहां सिर्फ़ बटन, शीर्षक, नेविगेशन वग़ैरह।
const CATN = {
  hi: { "देश": "देश", "दुनिया": "दुनिया", "समाज": "समाज", "अर्थ": "अर्थ", "पर्यावरण": "पर्यावरण", "स्त्री": "स्त्री", "संस्कृति": "संस्कृति", "साहित्य": "साहित्य" },
  en: { "देश": "Nation", "दुनिया": "World", "समाज": "Society", "अर्थ": "Economy", "पर्यावरण": "Environment", "स्त्री": "Women", "संस्कृति": "Culture", "साहित्य": "Literature" },
  ur: { "देश": "ملک", "दुनिया": "دنیا", "समाज": "سماج", "अर्थ": "معیشت", "पर्यावरण": "ماحول", "स्त्री": "عورت", "संस्कृति": "ثقافت", "साहित्य": "ادب" }
};
const MONTHS = {
  hi: ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  ur: ["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"]
};
const DAYS = {
  hi: ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],
  en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  ur: ["اتوار","پیر","منگل","بدھ","جمعرات","جمعہ","ہفتہ"]
};
const LANGNAME = { hi: "हिंदी", en: "English", ur: "اردو" };
const S = {
  hi: {
    tagline: "ज़रूरी ख़बरों तक जाती एक पगडंडी", daily: "हर सुबह 7 बजे, नयी टिप्पणियां",
    smaller: "अक्षर छोटे करें", bigger: "अक्षर बड़े करें", theme: "रंग: अपने आप", signin: "साइन इन",
    all: "सब", archive: "आर्काइव", cats: "श्रेणियां",
    foot: "यहां छपे सार देशकाल का अपना लेखन हैं। मूल लेख और उनके अधिकार मूल लेखकों और प्रकाशकों के हैं, हर पन्ने पर उनका लिंक दिया गया है। हम सिर्फ़ वही लेख चुनते हैं जो बिना सब्सक्रिप्शन के पढ़े जा सकते हैं।",
    policy: "हमारी संपादकीय नीति", privacy: "निजता नीति",
    tabHome: ["घर", "पहला पन्ना"], tabLit: ["सा", "साहित्य"], tabArch: ["पु", "आर्काइव"], tabMine: ["मैं", "मेरा देशकाल"],
    sheetT: "देशकाल से जुड़िए", sheet: ["लेख सहेजिए, बाद में फ़ुर्सत से पढ़िए", "जहां पढ़ना छोड़ा, वहीं से फिर शुरू", "अपनी पसंद की श्रेणियों से सजा अपना पहला पन्ना", "रविवार विशेष एक दिन पहले, शनिवार शाम", "हर लेख पर पाठकों की बातचीत में हिस्सा", "सुनने की अपनी सूची, सफ़र के लिए"],
    name: "नाम", email: "ईमेल", noPass: "पासवर्ड की ज़रूरत नहीं। आपके ईमेल पर साइन इन का एक लिंक आएगा।", join: "जुड़ें", notNow: "अभी नहीं",
    read: n => `पढ़ें ${n} मिनट`, listen: n => `सुनें ${n} मिनट`, listenBtn: n => `▶ सुनें · ${n} मिनट`, save: "+ सहेजें",
    from: p => `${p} से`, orig: "मूल", question: "आज का सवाल", readFull: "पूरा सार पढ़ें →", bigDebate: "आज की बड़ी बहस", latest: "ताज़ा",
    litHead: "साहित्य", litSub: "कविता, कहानी, आलोचना और संस्मरण की दुनिया से, हर रोज़", moreToday: "आज की और टिप्पणियां",
    homeDesc: (d, n) => `${d}: दुनिया भर की ${n} ज़रूरी टिप्पणियां, सहज हिंदी में।`,
    catEmpty: c => `“${c}” श्रेणी में अभी कोई टिप्पणी नहीं है। कल सुबह 7 बजे फिर देखिए।`, catDesc: c => `${c}: देशकाल पर चुनी गयी टिप्पणियों के सार।`,
    share: "साझा कीजिए", shareNative: "साझा करें", copy: "लिंक कॉपी",
    back: "← देशकाल के पहले पन्ने पर", collage: "कोलाज: देशकाल", photo: "तस्वीर", painting: "पेंटिंग", collageOf: h => `${h} के लिए कोलाज`,
    nazar: "देशकाल की नज़र", think: "सोचने के लिए", ref: "संदर्भ",
    cta: "पूरा लेख पढ़ने के लिए यहां क्लिक करें", ctaSub: (p, l) => `${p} पर, ${l} में · मुफ़्त`,
    fine: p => `ये सार देशकाल का अपना लेखन है। मूल लेख के सारे अधिकार ${p} के पास हैं।`, next: "आगे पढ़ें",
    archIntro: "देशकाल पर छपी हर टिप्पणी यहां तारीख़ के हिसाब से जमा होती है।", archSearch: "लेखक, विषय या शब्द खोजें", count: n => `${n} टिप्पणियां`,
    archDesc: "देशकाल पर छपी सारी टिप्पणियां, तारीख़ के हिसाब से।", mine: "मेरा देशकाल", mineDesc: "सहेजे गये लेख और पसंद की श्रेणियां।",
    sunT: "रविवार विशेष", sunP: "हफ़्ते की पांच सबसे ज़रूरी टिप्पणियां, गहरे संदर्भ के साथ, हर रविवार।", sunChip: "हर रविवार सुबह",
    mailT: "हर सुबह आपके पास", mailP: "सुबह 7 बजे की सारी टिप्पणियां, सीधे आपके ईमेल इनबॉक्स में।",
    chanT: "चैनल पर भी", chanP: "हर सुबह की टिप्पणियां सीधे आपके फ़ोन पर। चैनल से जुड़िए।", chanJoin: l => `${l} पर जुड़ें`, soon: "जल्द",
    appT: "देशकाल को फ़ोन पर ऐप की तरह रखिए", app1: 'Android: Chrome में ऊपर ⋮ मेन्यू, फिर "होम स्क्रीन में जोड़ें"', app2: 'iPhone: Safari में शेयर बटन, फिर "Add to Home Screen"', appBtn: "होम स्क्रीन पर जोड़ें",
    langLabel: "भाषा", noTr: "", feedDesc: "ज़रूरी ख़बरों तक जाती एक पगडंडी"
  },
  en: {
    tagline: "A footpath to the news that matters", daily: "New commentary every morning at 7",
    smaller: "Smaller text", bigger: "Larger text", theme: "Colour: auto", signin: "Sign in",
    all: "All", archive: "Archive", cats: "Sections",
    foot: "The summaries here are Deshkaal's own writing. The original articles and their rights belong to their authors and publishers; every page links to them. We only choose pieces that can be read without a subscription.",
    policy: "Editorial policy (Hindi)", privacy: "Privacy (Hindi)",
    tabHome: ["Home", "Front page"], tabLit: ["Lit", "Literature"], tabArch: ["Arc", "Archive"], tabMine: ["Me", "My Deshkaal"],
    sheetT: "Join Deshkaal", sheet: ["Save pieces and read them later", "Pick up where you left off", "A front page arranged by the sections you like", "The Sunday special a day early, on Saturday evening", "Join readers' conversations on each piece", "Your own listening list, for the commute"],
    name: "Name", email: "Email", noPass: "No password needed. A sign-in link will come to your email.", join: "Join", notNow: "Not now",
    read: n => `${n} min read`, listen: n => `${n} min listen`, listenBtn: n => `▶ Listen · ${n} min`, save: "+ Save",
    from: p => `From ${p}`, orig: "Original", question: "Today's question", readFull: "Read the full summary →", bigDebate: "Today's big debate", latest: "Latest",
    litHead: "Literature", litSub: "From the world of poetry, fiction, criticism and memoir, every day", moreToday: "More commentary today",
    homeDesc: (d, n) => `${d}: ${n} essential opinion pieces from around the world, in plain English.`,
    catEmpty: c => `Nothing in “${c}” yet. Come back tomorrow at 7 am.`, catDesc: c => `${c}: summaries of commentary chosen by Deshkaal.`,
    share: "Share", shareNative: "Share", copy: "Copy link",
    back: "← Deshkaal front page", collage: "Collage: Deshkaal", photo: "Photo", painting: "Painting", collageOf: h => `Collage for ${h}`,
    nazar: "Deshkaal's view", think: "To think about", ref: "Context",
    cta: "Click here to read the full article", ctaSub: (p, l) => `On ${p}, in ${l} · free`,
    fine: p => `This summary is Deshkaal's own writing. All rights to the original article belong to ${p}.`, next: "Read next",
    archIntro: "Every piece published on Deshkaal, by date.", archSearch: "Search by writer, subject or word", count: n => `${n} pieces`,
    archDesc: "Everything published on Deshkaal, by date.", mine: "My Deshkaal", mineDesc: "Saved pieces and favourite sections.",
    sunT: "Sunday special", sunP: "The five most important pieces of the week, with deeper context, every Sunday.", sunChip: "Every Sunday morning",
    mailT: "Every morning, in your inbox", mailP: "All of the morning's commentary at 7 am, straight to your email (in Hindi).",
    chanT: "On our channels", chanP: "Every morning's commentary on your phone. Join the channel.", chanJoin: l => `Join on ${l}`, soon: "soon",
    appT: "Keep Deshkaal on your phone like an app", app1: 'Android: Chrome menu ⋮, then "Add to Home screen"', app2: 'iPhone: Safari share button, then "Add to Home Screen"', appBtn: "Add to Home screen",
    langLabel: "Language", noTr: "This page is not yet available in English.", feedDesc: "A footpath to the news that matters"
  },
  ur: {
    tagline: "ضروری خبروں تک جاتی ایک پگڈنڈی", daily: "ہر صبح 7 بجے، نئے تبصرے",
    smaller: "حروف چھوٹے کریں", bigger: "حروف بڑے کریں", theme: "رنگ: خود بخود", signin: "سائن اِن",
    all: "سب", archive: "آرکائیو", cats: "زمرے",
    foot: "یہاں شائع خلاصے دیش کال کی اپنی تحریر ہیں۔ اصل مضامین اور ان کے حقوق ان کے لکھنے والوں اور ناشروں کے ہیں، ہر صفحے پر ان کا لنک دیا گیا ہے۔ ہم صرف وہی مضامین چنتے ہیں جو بغیر سبسکرپشن کے پڑھے جا سکتے ہیں۔",
    policy: "ادارتی پالیسی (ہندی)", privacy: "رازداری (ہندی)",
    tabHome: ["گھر", "پہلا صفحہ"], tabLit: ["اد", "ادب"], tabArch: ["آر", "آرکائیو"], tabMine: ["میں", "میرا دیش کال"],
    sheetT: "دیش کال سے جڑیے", sheet: ["مضامین محفوظ کیجیے، بعد میں فرصت سے پڑھیے", "جہاں پڑھنا چھوڑا، وہیں سے پھر شروع", "اپنی پسند کے زمروں سے سجا اپنا پہلا صفحہ", "اتوار خاص ایک دن پہلے، ہفتے کی شام", "ہر مضمون پر قارئین کی گفتگو میں حصہ", "سننے کی اپنی فہرست، سفر کے لیے"],
    name: "نام", email: "ای میل", noPass: "پاس ورڈ کی ضرورت نہیں۔ آپ کے ای میل پر سائن اِن کا ایک لنک آئے گا۔", join: "جڑیں", notNow: "ابھی نہیں",
    read: n => `پڑھیں ${n} منٹ`, listen: n => `سنیں ${n} منٹ`, listenBtn: n => `▶ سنیں · ${n} منٹ`, save: "+ محفوظ کریں",
    from: p => `${p} سے`, orig: "اصل", question: "آج کا سوال", readFull: "پورا خلاصہ پڑھیں ←", bigDebate: "آج کی بڑی بحث", latest: "تازہ",
    litHead: "ادب", litSub: "شاعری، کہانی، تنقید اور یادداشتوں کی دنیا سے، ہر روز", moreToday: "آج کے اور تبصرے",
    homeDesc: (d, n) => `${d}: دنیا بھر کے ${n} ضروری تبصرے، آسان اردو میں۔`,
    catEmpty: c => `”${c}“ میں ابھی کچھ نہیں۔ کل صبح 7 بجے پھر دیکھیے۔`, catDesc: c => `${c}: دیش کال کے چنے ہوئے تبصروں کے خلاصے۔`,
    share: "شیئر کیجیے", shareNative: "شیئر کریں", copy: "لنک کاپی",
    back: "→ دیش کال کے پہلے صفحے پر", collage: "کولاژ: دیش کال", photo: "تصویر", painting: "پینٹنگ", collageOf: h => `${h} کے لیے کولاژ`,
    nazar: "دیش کال کی نظر", think: "سوچنے کے لیے", ref: "حوالہ",
    cta: "پورا مضمون پڑھنے کے لیے یہاں کلک کریں", ctaSub: (p, l) => `${p} پر، ${l} میں · مفت`,
    fine: p => `یہ خلاصہ دیش کال کی اپنی تحریر ہے۔ اصل مضمون کے سارے حقوق ${p} کے پاس ہیں۔`, next: "آگے پڑھیں",
    archIntro: "دیش کال پر شائع ہر تبصرہ یہاں تاریخ کے حساب سے جمع ہوتا ہے۔", archSearch: "لکھنے والا، موضوع یا لفظ تلاش کریں", count: n => `${n} تبصرے`,
    archDesc: "دیش کال پر شائع سارے تبصرے، تاریخ کے حساب سے۔", mine: "میرا دیش کال", mineDesc: "محفوظ کیے گئے مضامین اور پسند کے زمرے۔",
    sunT: "اتوار خاص", sunP: "ہفتے کے پانچ سب سے ضروری تبصرے، گہرے حوالے کے ساتھ، ہر اتوار۔", sunChip: "ہر اتوار صبح",
    mailT: "ہر صبح آپ کے پاس", mailP: "صبح 7 بجے کے سارے تبصرے، سیدھے آپ کے ای میل میں (ہندی میں)۔",
    chanT: "چینل پر بھی", chanP: "ہر صبح کے تبصرے سیدھے آپ کے فون پر۔ چینل سے جڑیے۔", chanJoin: l => `${l} پر جڑیں`, soon: "جلد",
    appT: "دیش کال کو فون پر ایپ کی طرح رکھیے", app1: 'Android: Chrome میں اوپر ⋮ مینو، پھر "Add to Home screen"', app2: 'iPhone: Safari میں شیئر بٹن، پھر "Add to Home Screen"', appBtn: "ہوم اسکرین پر جوڑیں",
    langLabel: "زبان", noTr: "یہ صفحہ ابھی اردو میں دستیاب نہیں۔", feedDesc: "ضروری خبروں تک جاتی ایک پگڈنڈی"
  }
};
module.exports = { CATN, MONTHS, DAYS, LANGNAME, S };
