/* =====================================================
   Chase Barclay Portfolio — Script
   ===================================================== */

/* ── Year ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── PCB Background ── */
(function () {
  const canvas = document.getElementById('pcb-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function draw() {
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    ctx.clearRect(0, 0, W, H);
    const rng = mulberry32(0xdeadbeef);
    const CELL = 56;
    const COLS = Math.ceil(W / CELL) + 2;
    const ROWS = Math.ceil(H / CELL) + 2;
    const TRACE = 'rgba(130,165,195,0.10)';
    const VIA = 'rgba(130,165,195,0.18)';
    ctx.lineCap = 'round';

    function via(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = VIA;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    }

    function seg(x1, y1, x2, y2, w) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = TRACE;
      ctx.lineWidth = w;
      ctx.stroke();
    }

    const count = Math.round(COLS * ROWS * 0.18);
    for (let i = 0; i < count; i++) {
      const col = Math.floor(rng() * COLS);
      const row = Math.floor(rng() * ROWS);
      const sx = col * CELL;
      const sy = row * CELL;
      const horiz = rng() > 0.5;
      const len = Math.floor(rng() * 5) + 2;
      const w = rng() > 0.55 ? 2.2 : 1.3;
      const ex = sx + (horiz ? len * CELL : 0);
      const ey = sy + (horiz ? 0 : len * CELL);
      seg(sx, sy, ex, ey, w);
      via(sx, sy);
      via(ex, ey);
      if (rng() < 0.4) {
        const llen = Math.floor(rng() * 3) + 1;
        const dir = rng() > 0.5 ? 1 : -1;
        seg(ex, ey, ex + (horiz ? 0 : dir * llen * CELL), ey + (horiz ? dir * llen * CELL : 0), w);
        via(ex + (horiz ? 0 : dir * llen * CELL), ey + (horiz ? dir * llen * CELL : 0));
      }
    }
  }

  draw();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 200); });
})();

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

/* ── Cursor Glow & Dot ── */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.getElementById('glow');
  const dot = document.getElementById('cursor-dot');
  if (!glow || !dot) return;

  let mx = -800, my = -800, gx = -800, gy = -800;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function loop() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(loop);
  })();

  // Hover expansion on interactive elements
  document.querySelectorAll('a, button, .project-row').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ── Hero Word Animation ── */
function animateHero() {
  const lines = document.querySelectorAll('.hero-line .word');
  const contactWords = document.querySelectorAll('.contact-heading .word');
  const portrait = document.getElementById('hero-portrait');
  let delay = 0;

  lines.forEach((w) => {
    const d = delay;
    setTimeout(() => w.classList.add('in'), d);
    delay += 180;
  });

  // Fade in portrait with the text
  if (portrait) setTimeout(() => portrait.classList.add('visible'), 120);

  delay += 120;
  const heroMeta = document.querySelectorAll('.hero-meta .reveal');
  heroMeta.forEach((el) => {
    const d = delay;
    setTimeout(() => el.classList.add('visible'), d);
    delay += 100;
  });

  // Contact words animate when scrolled into view (handled by observer)
}

/* ── Scroll Reveal ── */
function initReveal() {
  const obs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // Stagger siblings
          const parent = e.target.parentElement;
          const siblings = parent ? [...parent.querySelectorAll(':scope > .reveal')] : [];
          const idx = siblings.indexOf(e.target);
          const stagger = idx > 0 ? idx * 80 : 0;
          setTimeout(() => e.target.classList.add('visible'), stagger);

          // Handle contact heading words
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

  document.querySelectorAll('.reveal:not(.hero-meta .reveal)').forEach((el) => obs.observe(el));

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
      px += (tx - px) * 0.1;
      py += (ty - py) * 0.1;
      preview.style.left = px + 'px';
      preview.style.top = py + 'px';
    }
    requestAnimationFrame(track);
  })();

  document.querySelectorAll('.project-row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      const a1 = row.dataset.accent1 || '#333';
      const a2 = row.dataset.accent2 || '#555';
      preview.style.background = `linear-gradient(135deg, ${a1}, ${a2})`;
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

/* ── Parallax on scroll ── */
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

    // CHASE inverted layer
    const cw = chaseInv.parentElement.getBoundingClientRect();
    const chaseCP = `circle(${radius}px at ${cx - cw.left}px ${cy - cw.top}px)`;
    chaseInv.style.clipPath = chaseCP;

    // BARCLAY inverted layer
    const bw = barclayInv.parentElement.getBoundingClientRect();
    const barclayCP = `circle(${radius}px at ${cx - bw.left}px ${cy - bw.top}px)`;
    barclayInv.style.clipPath = barclayCP;
  }

  // Run after layout settles
  window.addEventListener('load', () => requestAnimationFrame(updateClip));
  window.addEventListener('resize', updateClip);
  // Also update during scroll since hero has parallax
  window.addEventListener('scroll', updateClip, { passive: true });
})();

/* ── Marquee Mouse Scrub ── */
(function () {
  const marquee = document.querySelector('.marquee');
  const track = document.querySelector('.marquee-track');
  if (!marquee || !track) return;

  let offset = 0;          // current translateX in px
  let velocity = 0;        // px per frame driven by mouse
  let isHovering = false;
  let raf;

  // Base auto-scroll speed (px/frame)
  const BASE_SPEED = 0.5;

  function getTrackHalf() {
    return track.scrollWidth / 2;
  }

  function tick() {
    if (isHovering) {
      offset += velocity;
    } else {
      offset += BASE_SPEED;
    }
    // Wrap seamlessly at the halfway point
    const half = getTrackHalf();
    if (offset >= half) offset -= half;
    if (offset < 0) offset += half;

    track.style.transform = `translateX(${-offset}px)`;
    raf = requestAnimationFrame(tick);
  }

  marquee.addEventListener('mouseenter', () => {
    isHovering = true;
    // Stop CSS animation, take over with JS
    track.style.animationPlayState = 'paused';
  });

  marquee.addEventListener('mouseleave', () => {
    isHovering = false;
    track.style.animationPlayState = 'paused'; // keep JS in control
  });

  marquee.addEventListener('mousemove', (e) => {
    const rect = marquee.getBoundingClientRect();
    // Normalise mouse X: -1 (far left) → +1 (far right), 0 = center = pause
    const norm = (e.clientX - rect.left) / rect.width * 2 - 1;
    // Max speed ~4px/frame
    velocity = norm * 4;
  });

  // Kick off JS-driven loop immediately (replaces CSS animation)
  track.style.animation = 'none';
  raf = requestAnimationFrame(tick);
})();
