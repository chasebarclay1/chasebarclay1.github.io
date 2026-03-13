/* =====================================================
   Chase Barclay Portfolio — Script v9
   ===================================================== */

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
  document.querySelectorAll('a, button, .project-row, .skill-card, .exp-row, .lead-row').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
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

/* ── Hero Word Animation ── */
function animateHero() {
  const lines = document.querySelectorAll('.hero-line .word');
  const portrait = document.getElementById('hero-portrait');
  let delay = 0;

  lines.forEach((w) => {
    const d = delay;
    setTimeout(() => w.classList.add('in'), d);
    delay += 180;
  });

  if (portrait) setTimeout(() => portrait.classList.add('visible'), 120);

  delay += 120;
  const heroMeta = document.querySelectorAll('.hero-meta .reveal, .hero-scroll-hint.reveal');
  heroMeta.forEach((el) => {
    const d = delay;
    setTimeout(() => el.classList.add('visible'), d);
    delay += 100;
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
    // Ease out
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
      // Neutral dark gradient — no color accent
      preview.style.background = `rgba(18,18,18,0.95)`;
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

/* ── 3D Tilt on Cards ── */
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

  // Project rows: stronger tilt
  document.querySelectorAll('.project-row').forEach((el) => applyTilt(el, 4, 6));
  // Cards: subtle tilt
  document.querySelectorAll('.skill-card, .exp-row, .edu-card, .lead-row').forEach((el) => applyTilt(el, 3, 4));
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
      // How far element center is from viewport center, normalized
      const centerY = rect.top + rect.height / 2;
      const relCenter = (centerY - viewH / 2) / viewH; // -0.5 to 0.5 roughly
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

/* ── Marquee Mouse Scrub ── */
(function () {
  const marquee = document.querySelector('.marquee');
  const track = document.querySelector('.marquee-track');
  if (!marquee || !track) return;

  let offset = 0;
  let velocity = 0;
  let isHovering = false;
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
    const half = getTrackHalf();
    if (offset >= half) offset -= half;
    if (offset < 0) offset += half;
    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(tick);
  }

  marquee.addEventListener('mouseenter', () => {
    isHovering = true;
    track.style.animationPlayState = 'paused';
  });

  marquee.addEventListener('mouseleave', () => {
    isHovering = false;
    track.style.animationPlayState = 'paused';
  });

  marquee.addEventListener('mousemove', (e) => {
    const rect = marquee.getBoundingClientRect();
    const norm = (e.clientX - rect.left) / rect.width * 2 - 1;
    velocity = norm * 4;
  });

  track.style.animation = 'none';
  requestAnimationFrame(tick);
})();

/* ── Section Label Text Scramble ── */
(function () {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·—';

  function scramble(el) {
    const original = el.textContent.trim();
    const len = original.length;
    let frame = 0;
    const totalFrames = 22;
    const id = setInterval(() => {
      el.textContent = original.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (frame / totalFrames >= i / len) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      frame++;
      if (frame > totalFrames) {
        clearInterval(id);
        el.textContent = original;
      }
    }, 38);
  }

  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); }
    }),
    { threshold: 0.8 }
  );
  document.querySelectorAll('.section-label').forEach((el) => obs.observe(el));
})();
