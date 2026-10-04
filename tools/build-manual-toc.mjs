// Rewrites the contents column on every manual page from the PARTS list below, so adding a part or
// a section never means hand-editing fourteen copies of the same list.
//
// Each manual page carries a <!-- manual-toc --> ... <!-- /manual-toc --> block. This script
// replaces what's between the markers with: every part (a link when its page exists, plain text
// marked "coming soon" when it doesn't), the current page marked aria-current, and under it that
// page's own sections, taken from its <h2 id="..."> headings.
//
// The contents page (manual.html) gets the same parts as cards between
// <!-- manual-parts --> ... <!-- /manual-parts -->.
//
// Usage: node tools/build-manual-toc.mjs   (after adding a manual page or an h2 to one)

import fs from 'node:fs'

const PARTS = [
  { file: 'manual-quick-start.html', title: 'Start here', blurb: 'From a fresh install to a printed setup sheet in five minutes.' },
  { file: 'manual-table-mode.html', title: 'Building the setup sheet', blurb: 'Sources, gear pickers, numbering, colors and undo in Table Mode.' },
  { file: 'manual-exporting.html', title: 'Printing and exporting', blurb: 'PDF and spreadsheet exports, black-and-white printing and PDF styles.' },
  { file: 'manual-layout-mode.html', title: 'The floor plan', blurb: 'Room layouts, placing instruments, notes, snapping and zoom in Layout Mode.' },
  { file: 'manual-markup.html', title: 'Drawing on the plan', blurb: 'Markup with a pen, mouse or drawing tablet.' },
  { file: 'manual-studios.html', title: 'Setting up your studio', blurb: 'Studios, gear inventories, spreadsheet import and the online library.' },
  { file: 'manual-power-features.html', title: 'Working faster', blurb: 'Presets, templates, stereo pairs, Split View and the pop-out window.' },
  { file: 'manual-organizing.html', title: 'Organizing your work', blurb: 'The home screen, folders and the managers.' },
  { file: 'manual-berklee.html', title: 'Berklee features', blurb: 'Berklee rooms, building gear and the faculty reserve.' },
  { file: 'manual-settings.html', title: 'Settings reference', blurb: 'Every Settings tab, one section each.' },
  { file: 'manual-sharing.html', title: 'Sharing and backups', blurb: 'Exporting and importing studios and setups.' },
  { file: 'manual-shortcuts.html', title: 'Keyboard shortcuts', blurb: 'Every default shortcut on one page.' },
  { file: 'manual-help.html', title: 'Updates, help and troubleshooting', blurb: 'Updates, feedback, common questions and a glossary.' }
]

const exists = (file) => fs.existsSync(file)
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function sectionsOf(html) {
  return [...html.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map(([, id, text]) => ({
    id,
    text: text.replace(/<[^>]+>/g, '').trim()
  }))
}

function tocFor(currentFile, html) {
  const items = PARTS.map((part, i) => {
    const label = `${i + 1}. ${escape(part.title)}`
    if (!exists(part.file)) return `      <li><span title="Coming soon">${label}</span></li>`
    if (part.file !== currentFile) return `      <li><a href="${part.file}">${label}</a></li>`
    const sections = sectionsOf(html)
      .map((s) => `          <li><a href="#${s.id}">${s.text}</a></li>`)
      .join('\n')
    return [
      `      <li><a href="${part.file}" aria-current="page">${label}</a>`,
      sections ? `        <ol class="manual-toc-sections">\n${sections}\n        </ol>` : null,
      '      </li>'
    ]
      .filter(Boolean)
      .join('\n')
  })
  return [
    '<details class="manual-toc" open>',
    '    <summary>Contents</summary>',
    '    <p class="manual-toc-title"><a href="manual.html">Manual</a></p>',
    '    <ol>',
    ...items,
    '    </ol>',
    '  </details>'
  ].join('\n')
}

function partsList() {
  const items = PARTS.map((part, i) => {
    const inner = `<strong>${i + 1}. ${escape(part.title)}</strong><small>${escape(part.blurb)}</small>`
    return exists(part.file)
      ? `      <li><a href="${part.file}">${inner}</a></li>`
      : `      <li><div class="is-soon">${inner.replace('</small>', ' Coming soon.</small>')}</div></li>`
  })
  return ['<ol class="manual-parts">', ...items, '    </ol>'].join('\n')
}

function replaceBlock(html, name, content) {
  const re = new RegExp(`(<!-- ${name} -->)[\\s\\S]*?(<!-- /${name} -->)`)
  if (!re.test(html)) return html
  return html.replace(re, `$1\n  ${content}\n  $2`)
}

let changed = 0
for (const file of ['manual.html', ...PARTS.map((p) => p.file)].filter(exists)) {
  const before = fs.readFileSync(file, 'utf8')
  let after = replaceBlock(before, 'manual-toc', tocFor(file, before))
  if (file === 'manual.html') after = replaceBlock(after, 'manual-parts', partsList())
  if (after !== before) {
    fs.writeFileSync(file, after)
    changed++
    console.log(`updated ${file}`)
  }
}
console.log(changed ? `${changed} page(s) updated` : 'manual contents already up to date')
