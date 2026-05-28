/* ═══════════════════════════════════════════════════════════
   PARCOURS CA — main.js
   Lang toggle · Hamburger · Pricing toggle · Count-up · Scroll FX
═══════════════════════════════════════════════════════════ */

;(function () {
  'use strict'

  /* ─────────────────────────────────────────────────────────
     1. LUCIDE ICONS — initialise after DOM
  ───────────────────────────────────────────────────────── */
  if (typeof lucide !== 'undefined') lucide.createIcons()

  /* ─────────────────────────────────────────────────────────
     2. LANGUAGE TOGGLE
        data-fr / data-en attributes on any element
  ───────────────────────────────────────────────────────── */
  let currentLang = localStorage.getItem('pca-lang') || 'fr'

  function applyLang (lang) {
    currentLang = lang
    localStorage.setItem('pca-lang', lang)

    // Update all data-fr / data-en elements
    document.querySelectorAll('[data-fr]').forEach(el => {
      const text = el.getAttribute('data-' + lang)
      if (text === null) return
      // For input placeholders
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text
      } else {
        // Preserve child elements (icons) — only update text nodes
        const hasChildren = el.children.length > 0
        if (!hasChildren) {
          el.textContent = text
        } else {
          // Replace the last text node or first text node
          let replaced = false
          el.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '' && !replaced) {
              node.textContent = text
              replaced = true
            }
          })
          if (!replaced) {
            // Set textContent of first text-only child span
            const spans = el.querySelectorAll('span:not([data-fr])')
            if (spans.length === 0) el.textContent = text
          }
        }
      }
    })

    // html lang attribute
    document.documentElement.lang = lang

    // Lang buttons active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang)
    })
  }

  // Buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang))
  })

  // Init
  applyLang(currentLang)

  /* ─────────────────────────────────────────────────────────
     3. NAV SCROLL EFFECT
  ───────────────────────────────────────────────────────── */
  const nav = document.getElementById('nav')
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40)
    }, { passive: true })
  }

  /* ─────────────────────────────────────────────────────────
     4. HAMBURGER MENU
  ───────────────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger')
  const mobileNav = document.getElementById('mobileNav')

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open')
      hamburger.setAttribute('aria-expanded', isOpen)
    })

    // Close on mobile link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open')
        hamburger.setAttribute('aria-expanded', 'false')
      })
    })
  }

  /* ─────────────────────────────────────────────────────────
     5. PRICING TOGGLE — Monthly / Yearly
  ───────────────────────────────────────────────────────── */
  const pricingBtns = document.querySelectorAll('.pricing-btn')

  function setBilling (mode) {
    // mode: 'monthly' | 'yearly'
    pricingBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.billing === mode)
    })

    document.querySelectorAll('.monthly-price').forEach(el => {
      el.style.display = mode === 'monthly' ? '' : 'none'
    })
    document.querySelectorAll('.yearly-price').forEach(el => {
      el.style.display = mode === 'yearly' ? '' : 'none'
    })
    document.querySelectorAll('.monthly-label').forEach(el => {
      el.style.display = mode === 'monthly' ? '' : 'none'
    })
    document.querySelectorAll('.yearly-label').forEach(el => {
      el.style.display = mode === 'yearly' ? '' : 'none'
    })
  }

  pricingBtns.forEach(btn => {
    btn.addEventListener('click', () => setBilling(btn.dataset.billing))
  })

  // Init monthly
  setBilling('monthly')

  /* ─────────────────────────────────────────────────────────
     6. COUNT-UP ANIMATION (IntersectionObserver)
        Uses data-target and data-suffix on .stat-number
  ───────────────────────────────────────────────────────── */
  function easeOutExpo (t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }

  function animateCount (el, target, suffix, duration) {
    let startTime = null
    const start = 0

    function step (timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = Math.round(eased * target)

      // Format large numbers with spaces (e.g. 400 000)
      const formatted = target >= 10000
        ? current.toLocaleString('fr-CA')
        : current.toString()

      el.textContent = formatted + suffix

      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const statEls = document.querySelectorAll('.stat-number[data-target]')

  if (statEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target
          const target = parseInt(el.dataset.target, 10)
          const suffix = el.dataset.suffix || ''
          animateCount(el, target, suffix, 1800)
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.5 })

    statEls.forEach(el => observer.observe(el))
  } else {
    // Fallback — just show values
    statEls.forEach(el => {
      const target = parseInt(el.dataset.target, 10)
      const suffix = el.dataset.suffix || ''
      const formatted = target >= 10000 ? target.toLocaleString('fr-CA') : target.toString()
      el.textContent = formatted + suffix
    })
  }

  /* ─────────────────────────────────────────────────────────
     7. SCROLL FADE-UP ANIMATIONS
  ───────────────────────────────────────────────────────── */
  const fadeTargets = [
    '.mission-card',
    '.pillar-card',
    '.pricing-card',
    '.agent-card',
    '.testimonial-card',
    '.govt-point',
    '.partner-logo-placeholder',
    '.security-badge',
    '.section-label',
    '.section-h2',
    '.section-desc',
    '.hero-badge',
    '.hero-h1',
    '.hero-tagline',
    '.hero-desc',
    '.hero-cta',
    '.hero-trust',
    '.pricing-toggle',
    '.pricing-roi',
    '.partners-cta',
    '.cta-inner',
    '.stat-item',
  ]

  fadeTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('fade-up')
    })
  })

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger sibling cards
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-up'))
          const idx = siblings.indexOf(entry.target)
          setTimeout(() => {
            entry.target.classList.add('visible')
          }, idx * 80)
          fadeObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el))
  } else {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'))
  }

  /* ─────────────────────────────────────────────────────────
     8. SMOOTH SCROLL for anchor links (polyfill for older Safari)
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'))
      if (!target) return
      e.preventDefault()
      const navHeight = nav ? nav.offsetHeight : 0
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8
      window.scrollTo({ top, behavior: 'smooth' })
    })
  })

  /* ─────────────────────────────────────────────────────────
     9. ACTIVE NAV LINK — highlight on scroll
  ───────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id], footer[id]')
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link')

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          navLinks.forEach(link => {
            const href = link.getAttribute('href')
            link.style.color = href === '#' + id ? 'var(--gold-light)' : ''
          })
        }
      })
    }, { threshold: 0.4 })

    sections.forEach(s => sectionObserver.observe(s))
  }

})()
