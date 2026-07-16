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

// Lightbox — click a hero/showcase screenshot to view it full size
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

// Contact form — posts to Formspree directly (no CSP restriction on this static site, unlike
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
      contactStatus.textContent = 'Thanks — your message was sent.'
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
