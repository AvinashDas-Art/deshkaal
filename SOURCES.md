# स्रोत (Sources)

Only free-to-read pieces. Several of these sites mix free and paid articles (The Hindu, Frontline, The Caravan, Newslaundry, The Quint): use a piece only if the full text opens without login or payment. If a site starts showing a paywall on everything, skip it that day.

What opens from the run's tools (checked 8 Oct 2026): The Wire article pages open on `m.thewire.in/article/...` (the main site and its listings are JavaScript). Scroll's opinion feed opens: https://feeds.scroll.in/feeds/categories/75/full/dailyhunt.rss. Al Jazeera opinion listing opens: https://www.aljazeera.com/opinion/. Blocked for the tools: indianexpress.com, thehindu.com (and Frontline), telegraphindia.com; for these use WebSearch to find the piece, and if the article page itself is blocked, skip it.

How to use the list: every day spread the news pieces across the groups below, so that the issue carries independent Indian journalism, rural India, anti-caste and minority voices, environment, South Asia and the Global South together. **No more than 2 pieces from any one source in a day.** Hindi editions count as the same source as their English parent. When a homepage does not open with WebFetch, use WebSearch (`site:<domain>` plus this week's topics) and fetch the article page directly.

## भारतीय स्वतंत्र पत्रकारिता, संविधान और नागरिक अधिकार
- The Wire: https://thewire.in/ (opinion: https://thewire.in/category/opinion/all; often needs WebSearch)
- The Wire Hindi: https://thewirehindi.com/
- Scroll.in: https://scroll.in/
- The Caravan: https://caravanmagazine.in/ (much is paywalled; only free pieces)
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
- The Guardian (world and opinion): https://www.theguardian.com/ (the run's tools have sometimes been blocked here; try once, then skip)
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

