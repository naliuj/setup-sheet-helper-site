// Stamps every local CSS/JS reference in the root HTML files with a short hash of that file's
// contents, so a deploy is never seen half-applied.
//
// GitHub Pages serves these with `cache-control: max-age=600` and no fingerprint in the filename,
// so after a push the browser keeps the old stylesheet for up to ten minutes while already showing
// the new markup. That looks exactly like broken CSS, and it has fooled us more than once: a
// selection bar that would not hide, a restyled checkbox that stayed grey, a whole section that
// rendered unstyled.
//
// The hash comes from the file's own bytes, so the URL changes when, and only when, the asset
// changes. Re-running this with nothing edited rewrites nothing.
//
// Usage: node tools/bump-assets.mjs   (run it after editing any CSS or JS, before committing)

import { createHash } from 'node:crypto'
import fs from 'node:fs'

const hashes = new Map()

const hashOf = (file) => {
  if (!hashes.has(file)) {
    hashes.set(file, createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 8))
  }
  return hashes.get(file)
}

const pages = fs.readdirSync('.').filter((f) => f.endsWith('.html'))
let changed = 0

for (const page of pages) {
  const before = fs.readFileSync(page, 'utf8')

  // Local .css/.js references only: an absolute URL or a protocol-relative one is somebody else's
  // cache to manage, and the optional existing ?v= is what gets replaced rather than appended to.
  const after = before.replace(
    /((?:href|src)=")(?!https?:|\/\/)([^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")/g,
    (match, lead, file, tail) => (fs.existsSync(file) ? `${lead}${file}?v=${hashOf(file)}${tail}` : match)
  )

  if (after !== before) {
    fs.writeFileSync(page, after)
    changed++
    console.log(`${page} updated`)
  }
}

console.log(
  changed === 0
    ? `${pages.length} page(s) checked, all already current`
    : `${changed} of ${pages.length} page(s) updated`
)
for (const [file, hash] of hashes) console.log(`  ${file} -> ${hash}`)
