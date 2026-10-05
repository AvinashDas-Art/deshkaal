# देशकाल

**ज़रूरी ख़बरों तक जाती एक पगडंडी** · https://deshkaal.xyz

A daily Hindi website that summarises left-leaning editorials from around the world, with a link to every original.

- `data/days/YYYY-MM-DD.json`: each day's pieces (the only thing the daily run changes)
- `build.js`: builds the static site into `dist/` (`node build.js`, no packages needed)
- `src/`: styles, collage art, reader features
- `public/`: app manifest, offline worker, icons, share image
- `EDITORIAL.md`, `SOURCES.md`, `AUTOMATION.md`: editorial policy, sources, daily playbook

## Hosting
Cloudflare Pages, connected to this repo. Build command `node build.js`, output directory `dist`.
