// Rebuilds studios/index.json, the manifest that studio-downloads.html reads.
//
// Everything measurable is derived from the pack files themselves, so gear counts, file sizes and
// the room-layout flag can never drift from what people actually download. The descriptive fields
// are yours: city, note, added and builtIn are read back out of the existing manifest and written
// through untouched, so re-running this after adding a pack never clobbers what you typed.
//
// A new pack appears with "city": "TODO". Fill that in, then re-run or just leave it; the script
// tells you which entries still need attention.
//
// Usage: node tools/build-manifest.mjs

import fs from 'node:fs'
import path from 'node:path'

const DIR = 'studios'
const MANIFEST = path.join(DIR, 'index.json')
const MANUAL = ['city', 'note', 'added', 'builtIn']

const today = new Date().toISOString().slice(0, 10)

const previous = new Map()
if (fs.existsSync(MANIFEST)) {
  for (const entry of JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).studios) {
    previous.set(entry.id, entry)
  }
}

// Search should answer "who has an LA-2A?", so every manufacturer and model in the pack goes into
// one lowercased blob. Deduped, it costs about a kilobyte per studio.
const gearKeywords = (studio) => {
  const words = new Set()
  for (const list of [studio.mics, studio.outboardGear, studio.preamps]) {
    for (const item of list ?? []) {
      if (item.manufacturer) words.add(item.manufacturer.toLowerCase())
      words.add(item.name.toLowerCase())
    }
  }
  return [...words].sort().join(' ')
}

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.json') && f !== 'index.json')
  .sort()

const studios = files.map((file) => {
  const full = path.join(DIR, file)
  const pack = JSON.parse(fs.readFileSync(full, 'utf8'))
  const id = file.replace(/\.json$/, '')
  const carried = previous.get(id) ?? {}

  // A pack can hold more than one room. Count across all of them and name the entry after the
  // first, which is what the archive lists.
  const totals = pack.studios.reduce(
    (acc, s) => ({
      mics: acc.mics + (s.mics?.length ?? 0),
      outboard: acc.outboard + (s.outboardGear?.length ?? 0),
      preamps: acc.preamps + (s.preamps?.length ?? 0)
    }),
    { mics: 0, outboard: 0, preamps: 0 }
  )

  return {
    id,
    name: pack.studios[0].name,
    city: carried.city ?? 'TODO',
    note: carried.note ?? '',
    builtIn: carried.builtIn ?? false,
    added: carried.added ?? today,
    file: full,
    bytes: fs.statSync(full).size,
    counts: totals,
    roomLayout: pack.studios.some((s) => s.roomLayoutFile),
    gear: pack.studios.map(gearKeywords).join(' ')
  }
})

fs.writeFileSync(MANIFEST, JSON.stringify({ generatedAt: today, studios }, null, 2) + '\n')

const todo = studios.filter((s) => s.city === 'TODO').map((s) => s.id)
console.log(`Wrote ${MANIFEST}: ${studios.length} studios, ${(fs.statSync(MANIFEST).size / 1024).toFixed(1)} KB`)
if (todo.length) console.log(`Needs a city: ${todo.join(', ')}`)
