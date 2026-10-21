# स्रोत (Sources)

Only free-to-read pieces. Several of these sites mix free and paid articles (The Hindu, Frontline, The Caravan, Newslaundry, The Quint): use a piece only if the full text opens without login or payment. If a site starts showing a paywall on everything, skip it that day.

What opens from the run's tools (checked 8 Oct 2026): The Wire article pages open on `m.thewire.in/article/...` (the main site and its listings are JavaScript). Scroll's opinion feed opens: https://feeds.scroll.in/feeds/categories/75/full/dailyhunt.rss. Al Jazeera opinion listing opens: https://www.aljazeera.com/opinion/. Blocked for the tools: indianexpress.com, thehindu.com (and Frontline), telegraphindia.com; for these use WebSearch to find the piece; if the article page itself is blocked, do not stop: follow the fallback below. For The Indian Express, The New Indian Express and Mint the same morning's ePaper is on the owner's Mac for reading, see rule 2b in `AUTOMATION.md`.

How to use the list: every day spread the news pieces across the groups below, so that the issue carries independent Indian journalism, rural India, anti-caste and minority voices, environment, South Asia and the Global South together. **No more than 2 pieces from any one source in a day.** Hindi editions count as the same source as their English parent. When a homepage does not open with WebFetch, use WebSearch (`site:<domain>` plus this week's topics) and fetch the article page directly.

**When a site is blocked (403, DNS error, time-out, robots refusal), do not stop** (same rule as the standing rules at the top of `AUTOMATION.md`). Gather the piece in this order:
1. Approved RSS/Atom feeds: those listed here, the site's own `/feed` or `/rss`, Substack `/feed`. A full-text feed counts as having read the article.
2. Another readable copy of the same piece: the mobile/AMP version (`m.`, `/amp`), a syndicated copy on another site, the same outlet's Hindi/English edition.
3. WebSearch result text and snippets: to find the piece and confirm its title, author, date, URL and stated figures.
Snippets alone are never enough for a full summary, `nazar` or `ank`: never write an analysis or a summary by guessing from a snippet. A piece reachable only through snippets may be used only for a short item (a `khabar` or live-wall line), or replaced by another piece. Note the blocked site and the route used in the report.

## भारतीय स्वतंत्र पत्रकारिता, संविधान और नागरिक अधिकार
- The Wire: https://thewire.in/ (opinion: https://thewire.in/category/opinion/all; often needs WebSearch)
- The Wire Hindi: https://thewirehindi.com/
- Scroll.in: https://scroll.in/
- The Caravan: https://caravanmagazine.in/ (owner-approved for `amukh`, `vichar` and `morcha` analysis; much is paywalled, so only pieces whose full text opens without login or payment)
- कारवां हिंदी (The Caravan Hindi): https://hindi.caravanmagazine.in/ (same as The Caravan, and the same source for the 2-a-day limit; free pieces only)
  - **How to check both Caravan sites (tested 11 Oct 2026):** there is **no RSS feed** (`/feed`, `/rss` and `/sitemap.xml` all return 404); find new pieces from the links on the homepage. Open pages with **`curl -sL` in Bash, not WebFetch** (WebFetch cannot resolve these domains from the run). In every article page, check the `"isAccessibleForFree"` value in its JSON-LD: take the piece **only if it is `"True"`** (fully free and open). **Never take a `"False"` piece** (paywalled), even if its full text happens to be present in the page source. On 11 Oct 2026 all 28 pieces checked (14 on each site) were `"False"`, so expect most days to have none.
- The Credible News (द क्रेडिबल न्यूज़, owner's addition, 22 Oct 2026): https://thecrediblenews.in (Hindi, with an English edition at https://thecrediblenews.in/en/). Free to read. Sections: Politics, Economy, Crime, International, Sports, Entertainment; content types: Editorial https://thecrediblenews.in/type/editorial, Opinion https://thecrediblenews.in/type/opinion, Special Report/Feature https://thecrediblenews.in/type/feature, all pieces https://thecrediblenews.in/type/article. **No RSS feed** (the site advertises none; `/feed`, `/rss.xml` and `/sitemap.xml` are not usable from the run). Find new pieces from the homepage links and the type pages above (WebFetch worked on 22 Oct 2026; if it is blocked, WebSearch `site:thecrediblenews.in` plus the day's topic). Article pages look like `https://thecrediblenews.in/article/<slug>`. Take analysis (Editorial, Opinion, Special Report) for `amukh`, `vichar` and, while the special section is on, `morcha`; take its news items for `khabar`. Same rules as any source: no more than 2 pieces a day, never one already on the site (match `url`).
- Newslaundry: https://www.newslaundry.com/ (subscriber-only pieces are marked; skip those)
- Newslaundry Hindi: https://hindi.newslaundry.com/
- Article 14: https://article-14.com/
- The Quint: https://www.thequint.com/
- Frontline: https://frontline.thehindu.com/ (mostly subscription; only free pieces)
- The Hindu: https://www.thehindu.com/ (editorials and op-eds, if free to read)

## ग्रामीण भारत, किसान, मज़दूर और जन-आंदोलन
- **PARI, People's Archive of Rural India (पिछले 3 महीने की हर रिपोर्ट, अपने खंड गांव-जवार में)**: https://ruralindiaonline.org
  - Listing: the homepage and /articles are rendered by JavaScript, so WebFetch sees no list. Find new stories with WebSearch (`site:ruralindiaonline.org/article` plus this week's topics) or the X account @PARInetwork; if a browser is available, https://ruralindiaonline.org/articles lists the newest with dates.
  - Article pages (`https://ruralindiaonline.org/article/<slug>`) DO open with WebFetch. Free to read, many in Hindi too.
  - **Every PARI story of the last 3 months** goes into the issue (section `pari`), newest first, up to 4 a day, never one already on the site. **Never anything older than 3 months.** Keep the PARI `date` exactly as published. Credit the reporter in `by`, `pub` = "PARI".
- NewsClick: https://www.newsclick.in/
- NewsClick Hindi: https://hindi.newsclick.in/
- Gaon Connection: https://www.gaonconnection.com/
- Himal Southasian (दक्षिण एशिया): ग्रामीण समाज, खेती, पहाड़, सीमांत गांव और बस्तियों पर रिपोर्ट और विश्लेषण; पूरा पाठ खुला हो तभी। https://www.himalmag.com/
- Prachatai English (थाईलैंड): ज़मीन, जंगल, किसान, मछुआरे और गांव-समुदाय के अधिकारों पर रिपोर्ट। https://prachataienglish.com/ (RSS: https://prachataienglish.com/rss.xml)। केवल देहात और श्रम से जुड़े लेख; राजधानी की राजनीति नहीं।
- Mongabay India, The Third Pole, Gaon Connection, Rural Voice, Village Square, Citizen Matters (ग्रामीण-शहरी सीमा), Scroll की ग्रामीण रिपोर्टें, The Hindu का Rural Affairs और Himal जैसी दक्षिण एशिया की पत्रिकाएं: विषय के आधार पर। नेपाल, बांग्लादेश, श्रीलंका, पाकिस्तान और अन्य देशों की ग्रामीण पत्रकारिता भी शामिल हो सकती है; `pub` में असली प्रकाशक और `cat` में समाज/पर्यावरण/अर्थ जैसी सही श्रेणी रखें।
- PARI का पन्ना (ruralindiaonline.org) जावास्क्रिप्ट से बनता है और अक्सर पढ़ने में नहीं आता; लेख का सीधा लिंक या खोज से निकला पन्ना ही इस्तेमाल करें।
- ChalChitra Abhiyaan: https://chalchitraabhiyaan.com/ (video reports; summarise only if there is a written description or transcript)
- BehanBox: https://behanbox.com/ (gender and work)

## जाति-विरोधी विमर्श, बहुजन आवाज़ें और सामाजिक न्याय
- Dalit Camera: https://www.dalitcamera.com/ (mostly video; use written pieces only)
- The Mooknayak: https://themooknayak.com/
- Round Table India: https://roundtableindia.co.in/
- Forward Press: https://www.forwardpress.in/
- Velivada: https://velivada.com/
- TwoCircles.net: https://twocircles.net/
- Maktoob Media: https://maktoobmedia.com/

## तथ्य-जांच, सद्भाव और अफ़वाह-रोधी पहल
- Alt News: https://www.altnews.in/
- Alt News Hindi: https://hindi.altnews.in/
- Sabrang India: https://sabrangindia.in/
- Boom Live: https://www.boomlive.in/
- Janchowk: https://janchowk.com/
Fact-checks are useful when a rumour is driving hate against a community or misleading people on a public issue: summarise what was claimed, what is true, and why it matters.

## पर्यावरण, जल-जंगल-ज़मीन और जलवायु न्याय
- Down To Earth: https://www.downtoearth.org.in/
- Down To Earth Hindi: https://downtoearth.org.in/hindi
- Mongabay India: https://india.mongabay.com/
- Mongabay Hindi: https://hindi.mongabay.com/
- The Third Pole: https://www.thethirdpole.net/
- Dialogue Earth: https://dialogue.earth/

## दक्षिण एशिया, सीमा-पार अमन और क्षेत्रीय विमर्श
- Himal Southasian: https://www.himalmag.com/
- South Asians for Human Rights (SAHR): https://www.southasianrights.org/
- The Friday Times: https://thefridaytimes.com/
- Dawn: https://www.dawn.com/ (opinion and editorials: https://www.dawn.com/opinion)
- The Daily Star (Bangladesh): https://www.thedailystar.net/
- Colombo Telegraph: https://www.colombotelegraph.com/

## ग्लोबल साउथ, वैश्विक नागरिक अधिकार और स्वतंत्र विश्लेषण
- Democracy Now!: https://www.democracynow.org/
- Jacobin: https://jacobin.com/
- The Intercept: https://theintercept.com/
- openDemocracy: https://www.opendemocracy.net/
- Global Voices: https://globalvoices.org/
- Al Jazeera (opinion and in-depth): https://www.aljazeera.com/opinion/
- The Guardian (world and opinion): https://www.theguardian.com/ (the run's tools have sometimes been blocked here; try once, then use the fallback below)
- Rest of World: https://restofworld.org/
- Mada Masr: https://www.madamasr.com/
- Africa Is a Country: https://africasacountry.com/

## Substack (स्वतंत्र लेखकों के न्यूज़लेटर)
Many fine independent writers publish on Substack (for example Dilip Khan / दिलीप ख़ान). Use Substack posts for `vichar` and, for a major long essay by a writer of `WRITERS.md` stature, for `amukh`.
- Finding posts: WebSearch `site:substack.com` plus the writer's name or the day's subject (in Hindi and English). Every Substack has a feed at `https://<name>.substack.com/feed` (or `<custom-domain>/feed`) that lists the newest posts with dates; WebFetch it, then fetch the post.
- Free posts only. Skip anything that shows "This post is for paid subscribers" or cuts off for non-subscribers.
- `pub` = the newsletter's name (e.g. "Dilip Khan · Substack"), `by` = the writer. Same rules as any source: last 72 hours, fits `EDITORIAL.md`, no party propaganda, no rumour.
- Known newsletters (check these first, every day; add good new ones here):
  - Dilip Khan / दिलीप ख़ान: https://dilipkhan.substack.com (feed: https://dilipkhan.substack.com/feed; profile: https://substack.com/@dilipkhan)
  - VVP Sharma (owner's standing pick, added 13 Oct 2026): https://vvpsharma.substack.com (feed: https://vvpsharma.substack.com/feed). The owner wants his pieces in Deshkaal regularly: check the feed every day and publish each new free post of his (within the 72-hour rule, and the usual `EDITORIAL.md` fit) as `vichar`, or `amukh` for a major long essay. `by` = VVP Sharma, `pub` = "VVP Sharma · Substack". If a post is not in Hindi, write the summary in Hindi as for any other source. Do not skip him for lack of space: he takes one `vichar` slot on any day he has a new free post.

## और भी (जब ऊपर से कम पड़े)
- समकालीन जनमत: https://samkaleenjanmat.in (slow; retry once)
- Feminism in India: https://feminisminindia.com
- Common Dreams: https://www.commondreams.org
- People's Dispatch: https://peoplesdispatch.org

## दुनिया पर नज़र
Besides the list, keep a sharp watch on the world every day: before choosing, scan the day's biggest world developments (wars and ceasefires, elections, coups, climate disasters, migration, labour and protest movements, big rulings). If something major happened, the issue must carry at least one strong piece of analysis on it from the sources above (or another free, credible, independent outlet if none of them has covered it yet).

## साहित्य (3-4 pieces daily; try every source, use what opens)
- सम्मुख: https://sammukh.com (homepage lists newest posts; reliable)
- हिंदवी (बेला): https://www.hindwi.org (use the HOMEPAGE, it lists the latest बेला posts with links; /blog returns errors)
- समालोचन: https://samalochan.com (often times out for the run's tools; try once, then try a WebSearch for "समालोचन" + this week)
- जानकीपुल: https://jankipul.com (often times out; try https://jankipul.com/feed once, then WebSearch)
Prefer essays, criticism, memoir and reviews. Poems and stories: describe and link, never reproduce. Skip deeply personal trauma writing unless the author frames it publicly.


## गांव-जवार: ग्रामीण पत्रकारिता
यह खंड किसी एक प्रकाशन का नहीं है। खेत, जंगल, बस्ती, जल-जंगल-ज़मीन, ग्रामीण श्रम, सार्वजनिक सेवाओं और ग्रामीण जीवन पर ठोस रिपोर्ट या विश्लेषण चुनें। `sec: "pari"` और प्रकाशक का असली नाम रखें। साहित्य या असंबद्ध विचार यहां नहीं आएंगे। PARI का तीन महीने वाला नियम बना रहेगा; दूसरे स्रोतों के लिए सामान्य ताज़गी और प्रति स्रोत दो लेख की सीमा है।
- ख़बर लहरिया: https://khabarlahariya.org/
- Gaon Connection, Down To Earth, Mongabay India/Hindi, BehanBox, Dialogue Earth, The Third Pole, NewsClick, Article 14 और The Mooknayak: विषय और रिपोर्टिंग के आधार पर।
- ChalChitra Abhiyaan: लिखित विवरण या प्रतिलेख पढ़ें; वीडियो video खंड में।

## मालिक की विस्तारित स्रोत सूची (12 अक्टूबर 2026)
ऊपर की सूची के अलावा: express.pk, wenews.pk, karvaanindia.com, satyahindi.com, thefederal.com, hindi.theprint.in, theprint.in, aajtak.in, amarujala.com, aninews.in, barandbench.com, bbc.com, bhaskar.com, deccanherald.com, dw.com, hindustantimes.com, inquilab.com, jansatta.com, livelaw.in, navjivanindia.com, ndtv.com, onmanorama.com, outlookindia.com, qaumiawaz.com, siasat.com, thenewsminute.com, timesnowhindi.com, tribuneindia.com।
सूची में होना हर लेख की मंज़ूरी नहीं है। समाचार और लाइव सूचना को विश्लेषण से अलग रखें। पूरा तर्क पढ़े बिना सार न लिखें। तारीख़, लेखक, खुले पाठ और नीति की जांच करें। आरोप स्रोत के नाम से लिखें।
Instagram सार्वजनिक पोस्ट और सत्यापित रील की खोज के लिए है। commons.wikimedia.org, upload.wikimedia.org, unsplash.com और images.unsplash.com तस्वीर और लाइसेंस के स्रोत हैं; i.ytimg.com वीडियो थंबनेल है। इन्हें ख़बर का स्वतंत्र प्रमाण न गिनें। feeds.scroll.in RSS है, अलग प्रकाशन नहीं। karvaanindia.com को The Caravan का डोमेन न मानें; प्रकाशक की पहचान जांचें।
