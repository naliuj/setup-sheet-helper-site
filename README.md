# setup-sheet-helper-site

Landing page for [Setup Sheet Helper](https://github.com/naliuj/SetupSheetHelper), a desktop app
for planning and printing recording studio session setup sheets.

Live at: https://setupsheethelper.julianro.se/

Plain HTML/CSS/JS, no build step, deployed via GitHub Pages from the `main` branch root.

Two things to run by hand before committing, when they apply:

- **Edited `styles.css` or any `.js`?** `node tools/bump-assets.mjs` restamps the `?v=` hash on
  every page's asset links. Pages will otherwise keep loading the browser's cached copy for up to
  ten minutes after a deploy, which looks exactly like broken CSS.
- **Added or replaced a studio pack in `studios/`?** `node tools/build-manifest.mjs` rebuilds
  `studios/index.json`, which drives the downloads page. It preserves the hand-written `city`,
  `note` and `added` fields and derives everything else from the pack itself.
