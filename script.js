// Mobile nav toggle
const navToggle = document.getElementById('navToggle')
const navLinks = document.getElementById('navLinks')

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open')
  navToggle.setAttribute('aria-expanded', String(open))
})

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open')
    navToggle.setAttribute('aria-expanded', 'false')
  })
})

// Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 }
)

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))

// Clicking a hero/showcase screenshot opens the lightbox at full size.
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightboxImg')
const lightboxClose = document.getElementById('lightboxClose')

function openLightbox(img) {
  lightboxImg.src = img.src
  lightboxImg.alt = img.alt
  lightbox.classList.add('is-open')
}

function closeLightbox() {
  lightbox.classList.remove('is-open')
  lightboxImg.src = ''
}

document.querySelectorAll('.hero-image:not(.hero-icon) img, .showcase-image img').forEach((img) => {
  img.addEventListener('click', () => openLightbox(img))
})

lightboxClose.addEventListener('click', closeLightbox)
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox()
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox()
})

// The contact form posts to Formspree directly (no CSP restriction on this static site, unlike
// the app's own copy of this form) and shows an inline status instead of navigating away.
const contactForm = document.getElementById('contactForm')
const contactSubmit = document.getElementById('contactSubmit')
const contactStatus = document.getElementById('contactStatus')

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  contactSubmit.disabled = true
  contactSubmit.textContent = 'Sending…'
  contactStatus.textContent = ''
  contactStatus.className = 'form-status'

  const formData = new FormData(contactForm)
  try {
    const response = await fetch('https://formspree.io/f/xreneagj', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    })
    if (response.ok) {
      contactForm.reset()
      contactStatus.textContent = 'Thanks! Your message was sent.'
      contactStatus.className = 'form-status success'
    } else {
      const body = await response.json().catch(() => null)
      const detail = body?.errors?.map((err) => err.message).join(', ')
      contactStatus.textContent = detail || 'Something went wrong. Please try again.'
      contactStatus.className = 'form-status error'
    }
  } catch {
    contactStatus.textContent = 'Network error. Please try again.'
    contactStatus.className = 'form-status error'
  } finally {
    contactSubmit.disabled = false
    contactSubmit.textContent = 'Send'
  }
})

// Point the two download buttons straight at the latest release's .dmg files, so non-technical
// visitors get a direct download instead of the releases page full of assets. The .dmg filenames
// carry the version, so we can't hardcode a stable URL. Instead, we look up the latest release via
// the GitHub API and pick the arm64 / x64 .dmg. Each button already has the releases page as its
// href in the HTML, so if this lookup fails (offline, rate-limited) clicking still works.
const RELEASES_REPO = 'naliuj/SetupSheetHelper'

async function wireDownloadButtons() {
  const arm = document.getElementById('dlArm')
  const intel = document.getElementById('dlIntel')
  if (!arm || !intel) return
  try {
    const res = await fetch(`https://api.github.com/repos/${RELEASES_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) return // leave the releases-page fallback href in place
    const data = await res.json()
    const assets = data.assets || []
    const find = (suffix) => assets.find((a) => a.name.endsWith(suffix))
    const armDmg = find('-arm64.dmg')
    const intelDmg = find('-x64.dmg')
    if (armDmg) arm.href = armDmg.browser_download_url
    if (intelDmg) intel.href = intelDmg.browser_download_url
  } catch {
    // On a network or API error, the buttons keep their releases-page fallback.
  }
}

wireDownloadButtons()
