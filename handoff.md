# Handoff: setup-sheet-helper-site

Companion site for **Setup Sheet Helper**, a macOS desktop app for planning recording studio
session setup sheets. This repo is the marketing page plus a **Studio Downloads** archive where
engineers download a studio's gear lists and import them into the app.

Everything below is current as of 2026-09-07. Nothing is in flight; the repo is clean and pushed.

---

## The repo in one screen

- Plain HTML/CSS/JS. **No build step, no framework, no package.json.** GitHub Pages serves the
  `main` branch root.
- Live at **https://setupsheethelper.julianro.se** (CNAME). The `naliuj.github.io` address is dead
  and should never be reintroduced.
- App source lives separately at `~/WebstormProjects/SetupSheetHelper` (public:
  `github.com/naliuj/SetupSheetHelper`). You will occasionally need to look at it to keep copy
  honest, but you are not expected to change it.

```
index.html              Landing page
studio-downloads.html   The archive
styles.css              Every style for both pages
script.js               Shared: nav toggle, scroll reveal, lightbox, contact form, download buttons
studio-downloads.js     Archive-only: manifest fetch, search, filter, multi-select, combined download
studios/*.json          Downloadable studio packs (verbatim app exports)
studios/index.json      Generated manifest that drives the archive
tools/build-manifest.mjs   Rebuilds studios/index.json
tools/bump-assets.mjs      Restamps ?v= cache-busting hashes
sitemap.xml, llms.txt, robots.txt, CNAME, README.md
assets/                 Icons, screenshots, og-image
```

## Two commands you must run by hand

There is no build, so nothing runs these for you. Both are idempotent.

```bash
node tools/bump-assets.mjs     # after editing styles.css or ANY .js
node tools/build-manifest.mjs  # after adding/replacing anything in studios/
```

**`bump-assets.mjs` matters more than it looks.** GitHub Pages serves assets with
`cache-control: max-age=600` and no fingerprint in the filename, so after a push the browser shows
new markup against an old stylesheet. That looks *exactly* like broken CSS. It fooled us three
times in one session: a selection bar that would not hide, a checkbox that stayed grey, and a whole
page section rendering unstyled. Asset links now carry a content hash (`styles.css?v=31649da7`)
which changes when, and only when, that file changes.

**Corollary for local previewing:** `python3 -m http.server` caches hard too. If a CSS change
seems not to apply, you are almost certainly looking at a cached file. Serve on a *fresh port*
rather than debugging phantom CSS.

## House rules for this repo

These are settled decisions, not preferences to relitigate.

- **No em-dashes in any user-facing copy.** Commit `d81f2e2` removed them site-wide deliberately.
  Use periods, commas, semicolons. (Code comments are exempt.)
- **Design tokens are copied from the app's own `global.css`** so the site reads as an extension of
  the app, not a separate marketing aesthetic. Dark by default with a light theme:
  `--color-bg #14161a`, `--color-surface #1c1f25`, `--color-surface-alt #232830`,
  `--color-border #313742`, `--color-text #eef1f5`, `--color-text-dim #939ba7`,
  `--color-accent #3d9bff`, `--color-on-accent #04203f`, `--radius: 2px`.
- **Hover changes border colour, never fill.** This is the app's convention and the site follows it
  everywhere (`.btn`, `.feature-card`, `.callout-card`, `.chip`).
- **`color-scheme: dark` on `:root` is load-bearing.** Without it browsers draw native controls in
  their light theme on a dark page: white checkboxes, white select popups, light scrollbars. A
  `<select>`'s popup is drawn by the browser where CSS cannot reach it at all.
- Breakpoints are **860px** and **620px**. The nav collapses to a hamburger at 620.
- Commit style: imperative, sentence case, no `feat:`-style prefix. Body explains *why*, not what.
  End with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## How the Studio Downloads page works

`studio-downloads.js` fetches `studios/index.json` and renders from it. The manifest exists so the
page never has to download every pack just to show counts and sizes.

Each entry has **derived** fields the tool computes (`bytes`, `counts`, `roomLayout`, `gear`,
`file`, `name`) and **hand-written** fields it preserves across runs (`city`, `note`, `added`).
A new pack appears with `"city": "TODO"` and the script tells you which entries still need one.

`gear` is a lowercased, deduped blob of every manufacturer and model in the pack, roughly 1 KB per
studio, so search can answer "who has an LA-2A?".

Search compares both the raw string **and** a punctuation-stripped copy of both sides. That is
because the real catalogue spells a mic `SM-57` while people type `sm57` or `sm 57`. Do not
"simplify" that back to a plain `includes`.

**Multi-select and the combined download.** A studio export is `{ version, studios: [...] }` and the
app's importer just walks that array, so a combined file is the selected packs' `studios` arrays
concatenated under one version (the highest, if they ever diverge). Selection is held in a `Set` by
id so it survives re-render when the search or filter changes; ticked-but-hidden rows stay counted
and the action bar says so.

`.selection-bar[hidden] { display: none }` in `styles.css` is **load-bearing**: the `display: flex`
below it otherwise outranks the `hidden` attribute's UA style and the bar shows with nothing
selected.

## Current content

**One pack: `studios/the-record-co-studio-a.json`** (The Record Co Studio A, Boston. 87 mics,
14 outboard, 12 preamps, floor plan. 240 KB.)

Berklee's seven rooms were removed on 2026-09-07: they already ship inside the app, so publishing
them here only offered people a download of what they already had. That also retired the
`builtIn` flag and its "Ships with the app" tag. Anything published here from now on is by
definition not shipping with the app, so the flag could never be true again.

Its `note` field is deliberately **empty**. Berklee's entries used it for "Berklee College of
Music" and it feeds search. Julian has not said what he wants there for The Record Co, and I did
not want to invent an address or neighbourhood. **Worth asking him.**

## To add a studio pack

1. Julian exports it from the app: Settings, Import/Export, Export studios. He will hand you a
   `.json`. Do not try to generate one yourself.
2. Drop it in `studios/` named as a slug of the studio name
   (`the-record-co-studio-a.json`).
3. `node tools/build-manifest.mjs`, then fill in `city` (and `note` if he gives you one) in
   `studios/index.json` and re-run to confirm.
4. Preview, then commit and push.

## What was built recently (for context, all shipped)

Newest first:

- `1a94a4b` Content-hashed asset links + `tools/bump-assets.mjs`; README live URL corrected.
- `4ac21d8` "Don't build your room from scratch" callout band on `index.html` between the showcase
  and the contact form, linking to the archive. The nav link alone did not explain what was on the
  other side of it.
- `a59956b` Berklee packs out, The Record Co in; `builtIn` retired; punctuation-insensitive search.
- `d3b120a` `color-scheme: dark`.
- `3d9a459` Hand-styled checkbox matching `.chip` / `.btn-primary`.
- `70f858c` The Studio Downloads page itself, plus null guards in `script.js` (it previously
  assumed the lightbox and contact form existed and threw on any page without them, silently
  killing every block below including the nav).

## Verification expectations

There are no tests. Verify in a browser and say plainly what you did *not* check.

1. Serve locally (**fresh port** if you changed CSS) and load both pages.
2. Console must be clean.
3. On the archive: search by name, city and gear; chips filter; city headings appear only when
   unfiltered; the no-match state renders; a download returns valid JSON.
4. Resize through 860px and 620px. No horizontal overflow at 375px.
5. `index.html` still works: reveal animations, lightbox, contact form, nav toggle.
6. `node -e` over `studios/index.json`: every `file` resolves, every `bytes` matches the file on
   disk, everything parses.

**Known preview-tool trap:** the in-app browser pane sometimes goes hidden, which stops the page
rendering. `innerWidth` reads 0, `getBoundingClientRect` returns zeros, and `IntersectionObserver`
never fires, so scroll-reveal elements stay at `opacity: 0`. That is the tool, not the page. Check
`tabs_context` for "The Browser pane is currently hidden" before believing a zero measurement.

## Open, small

- The Record Co's `note` field (above).
- The archive has one studio, so the city grouping and chips look thin. That is fine and by design;
  it grows as Julian collects packs.
- `studio-downloads.html` invites submissions via the contact form. Nothing automates that.
