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

document.querySelectorAll('.hero-image img, .showcase-image img').forEach((img) => {
  img.addEventListener('click', () => openLightbox(img))
})

lightboxClose.addEventListener('click', closeLightbox)
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox()
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox()
})
