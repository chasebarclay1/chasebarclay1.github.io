/* =====================================================
   Chase Barclay Portfolio — Light Theme Script v1
   ===================================================== */

import './styles/main.css';
import { animate, stagger } from 'animejs';

/* ── 3D Stage (lazy-loaded) ──
 * Skip three.js + scene code on touch, reduced-motion, no-WebGL clients.
 * For everyone else, defer the import to idle time so the hero paints
 * before the ~140 KB chunk lands. */
(function maybeInit3D() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.WebGLRenderingContext) return;

  const start = () => {
    import('./scene/init.js')
      .then((m) => m.init3D())
      .catch((err) => console.warn('3D stage init failed:', err));
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 1500 });
  } else {
    setTimeout(start, 600);
  }
})();

/* ── Year ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Loader ── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  requestAnimationFrame(() => loader.classList.add('filling'));
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      animateHero();
      initReveal();
    }, 420);
  });
})();

/* ── Scroll Progress Bar ── */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Navbar scrolled state (adds hairline divider) ── */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  function update() {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Hero Word + Portrait Animation ── */
function animateHero() {
  const lines = document.querySelectorAll('.hero-line .word');
  const portrait = document.getElementById('hero-portrait');

  // anime.js stagger gives us a clean per-word reveal that fights nothing.
  animate(lines, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: stagger(180),
    duration: 900,
    ease: 'outExpo',
    onBegin: (anim) => {
      anim.targets.forEach((el) => el.classList.add('in'));
    },
  });

  if (portrait) {
    setTimeout(() => portrait.classList.add('visible'), 120);
  }

  const heroMeta = document.querySelectorAll('.hero-meta .reveal, .hero-scroll-hint.reveal');
  animate(heroMeta, {
    opacity: [0, 1],
    translateY: [16, 0],
    delay: stagger(100, { start: lines.length * 180 + 200 }),
    duration: 800,
    ease: 'outExpo',
    onBegin: (anim) => anim.targets.forEach((el) => el.classList.add('visible')),
  });
}

/* ── Scroll Reveal ── */
function initReveal() {
  const obs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const parent = e.target.parentElement;
          const siblings = parent ? [...parent.querySelectorAll(':scope > .reveal')] : [];
          const idx = siblings.indexOf(e.target);
          const stagger = idx > 0 ? idx * 80 : 0;
          setTimeout(() => e.target.classList.add('visible'), stagger);

          if (e.target.closest('.contact-heading')) {
            e.target.querySelectorAll('.word').forEach((w, i) => {
              setTimeout(() => w.classList.add('in'), i * 150);
            });
          }

          obs.unobserve(e.target);
        }
      }),
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal:not(.hero-meta .reveal):not(.hero-scroll-hint)').forEach((el) => obs.observe(el));

  // Contact heading words
  const contactH = document.querySelector('.contact-heading');
  if (contactH) {
    const cObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll('.word').forEach((w, i) => {
              setTimeout(() => w.classList.add('in'), i * 180);
            });
            cObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cObs.observe(contactH);
  }

  // Count-up stats
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  const countObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          countUp(e.target);
          countObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNums.forEach((el) => countObs.observe(el));
}

/* ── Count-Up Animation ── */
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + (progress < 1 ? '' : '+');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + '+';
  }
  requestAnimationFrame(tick);
}

/* ── Project Hover Preview ── */
(function () {
  const preview = document.getElementById('project-preview');
  const descEl = document.getElementById('preview-desc');
  if (!preview || !descEl) return;

  let px = 0, py = 0, tx = 0, ty = 0;
  let active = false;

  (function track() {
    if (active) {
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;
      preview.style.left = px + 'px';
      preview.style.top = py + 'px';
    }
    requestAnimationFrame(track);
  })();

  document.querySelectorAll('.project-row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      descEl.textContent = row.dataset.desc || '';
      preview.classList.add('active');
      active = true;
    });

    row.addEventListener('mousemove', (e) => {
      tx = e.clientX + 20;
      ty = e.clientY - 100;
    });

    row.addEventListener('mouseleave', () => {
      preview.classList.remove('active');
      active = false;
    });
  });
})();

/* ── Subtle 3D Tilt on Cards ── */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  function applyTilt(el, maxX, maxY) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * maxX}deg) rotateY(${x * maxY}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
    });
  }

  // Reduced from the dark-theme version — Apple aesthetic favors restraint.
  document.querySelectorAll('.skill-card, .exp-row, .edu-card').forEach((el) => applyTilt(el, 1.5, 2));
})();

/* ── Parallax on Hero Scroll ── */
(function () {
  const hero = document.querySelector('.hero-content');
  if (!hero) return;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        hero.style.transform = `translateY(${y * 0.25}px)`;
        hero.style.opacity = Math.max(1 - y / (window.innerHeight * 0.7), 0);
      }
    },
    { passive: true }
  );
})();

/* ── Parallax Dividers ── */
(function () {
  const dividers = document.querySelectorAll('.parallax-divider');
  if (!dividers.length) return;

  function updateDividers() {
    dividers.forEach((div) => {
      const text = div.querySelector('.divider-text');
      if (!text) return;
      const rect = div.getBoundingClientRect();
      const viewH = window.innerHeight;
      const centerY = rect.top + rect.height / 2;
      const relCenter = (centerY - viewH / 2) / viewH;
      const speed = parseFloat(div.dataset.speed) || 0.3;
      const offset = relCenter * speed * 200;
      text.style.transform = `translateX(${offset}px)`;
    });
  }

  window.addEventListener('scroll', updateDividers, { passive: true });
  window.addEventListener('resize', updateDividers);
  updateDividers();
})();

/* ── Hero Text / Photo Clip-Path Inversion ── */
(function () {
  const portrait = document.getElementById('hero-portrait');
  const chaseInv = document.getElementById('line-chase-inv');
  const barclayInv = document.getElementById('line-barclay-inv');
  if (!portrait || !chaseInv || !barclayInv) return;

  function updateClip() {
    const pr = portrait.getBoundingClientRect();
    const cx = pr.left + pr.width / 2;
    const cy = pr.top + pr.height / 2;
    const radius = pr.width / 2;

    const cw = chaseInv.parentElement.getBoundingClientRect();
    chaseInv.style.clipPath = `circle(${radius}px at ${cx - cw.left}px ${cy - cw.top}px)`;

    const bw = barclayInv.parentElement.getBoundingClientRect();
    barclayInv.style.clipPath = `circle(${radius}px at ${cx - bw.left}px ${cy - bw.top}px)`;
  }

  window.addEventListener('load', () => requestAnimationFrame(updateClip));
  window.addEventListener('resize', updateClip);
  window.addEventListener('scroll', updateClip, { passive: true });
})();

/* Tagline ticker is purely CSS-driven (animation: tagline-scroll). No JS. */
