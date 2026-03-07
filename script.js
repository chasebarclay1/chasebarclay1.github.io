/* ─────────────────────────────────────────────
   script.js — Chase Barclay Portfolio
───────────────────────────────────────────── */

/* ── YEAR ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ─────────────────────────────────────────────
   PCB CIRCUIT BACKGROUND (static, drawn once)
───────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  // Tiny seeded PRNG so the layout is identical on every page load
  function makePRNG(seed) {
    let s = seed >>> 0;
    return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  }

  function drawPCB() {
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, W, H);

    const rng = makePRNG(0xC0FFEE42);
    const G   = 34;                          // grid cell size (px)
    const cols = Math.ceil(W / G) + 1;
    const rows = Math.ceil(H / G) + 1;

    // ── Subtle grid of dot markers ──────────────────────────────────
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.arc(c * G, r * G, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.06)';
        ctx.fill();
      }
    }

    // ── Build horizontal trace segments ─────────────────────────────
    const hTraces = []; // { r, c0, c1, thick }
    for (let r = 0; r <= rows; r++) {
      let c = 0;
      while (c < cols) {
        if (rng() < 0.38) {
          const len   = Math.floor(rng() * 7) + 2;
          const thick = rng() < 0.18;
          hTraces.push({ r, c0: c, c1: Math.min(c + len, cols), thick });
          c += len + Math.floor(rng() * 3) + 1;
        } else {
          c++;
        }
      }
    }

    // ── Build vertical trace segments ───────────────────────────────
    const vTraces = []; // { c, r0, r1, thick }
    for (let c = 0; c <= cols; c++) {
      let r = 0;
      while (r < rows) {
        if (rng() < 0.38) {
          const len   = Math.floor(rng() * 7) + 2;
          const thick = rng() < 0.18;
          vTraces.push({ c, r0: r, r1: Math.min(r + len, rows), thick });
          r += len + Math.floor(rng() * 3) + 1;
        } else {
          r++;
        }
      }
    }

    // ── Draw traces ─────────────────────────────────────────────────
    ctx.lineCap = 'square';
    hTraces.forEach(t => {
      ctx.beginPath();
      ctx.moveTo(t.c0 * G, t.r * G);
      ctx.lineTo(t.c1 * G, t.r * G);
      ctx.strokeStyle = t.thick ? 'rgba(0,212,255,0.09)' : 'rgba(0,212,255,0.045)';
      ctx.lineWidth   = t.thick ? 2.5 : 1;
      ctx.stroke();
    });
    vTraces.forEach(t => {
      ctx.beginPath();
      ctx.moveTo(t.c * G, t.r0 * G);
      ctx.lineTo(t.c * G, t.r1 * G);
      ctx.strokeStyle = t.thick ? 'rgba(0,212,255,0.09)' : 'rgba(0,212,255,0.045)';
      ctx.lineWidth   = t.thick ? 2.5 : 1;
      ctx.stroke();
    });

    // ── Collect via candidates (trace endpoints + junctions) ────────
    const viaMap = new Map(); // key → count (junctions get higher count)
    const mark = key => viaMap.set(key, (viaMap.get(key) || 0) + 1);
    hTraces.forEach(t => { mark(`${t.c0},${t.r}`); mark(`${t.c1},${t.r}`); });
    vTraces.forEach(t => { mark(`${t.c},${t.r0}`); mark(`${t.c},${t.r1}`); });

    // ── Draw vias ───────────────────────────────────────────────────
    viaMap.forEach((count, key) => {
      if (rng() > 0.55) return;           // sparse – not every endpoint
      const [c, r] = key.split(',').map(Number);
      const x = c * G, y = r * G;
      const junction = count > 1;

      if (junction || rng() < 0.35) {
        // Through-hole via: outer annular ring + drill hole
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.14)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,0.25)';
        ctx.fill();
      } else {
        // SMD pad dot
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,0.16)';
        ctx.fill();
      }
    });

    // ── IC component outlines ───────────────────────────────────────
    const numICs = Math.max(4, Math.floor(W * H / 160000));
    const PREFIXES = ['U', 'IC', 'U', 'MCU', 'FPGA', 'DSP', 'U'];
    for (let i = 0; i < numICs; i++) {
      const cg = Math.floor(rng() * (cols - 7)) + 2;
      const rg = Math.floor(rng() * (rows - 7)) + 2;
      const wg = Math.floor(rng() * 3) + 2;
      const hg = Math.floor(rng() * 2) + 2;
      const x  = cg * G,  y  = rg * G;
      const w  = wg * G,  h  = hg * G;

      // Body
      ctx.strokeStyle = 'rgba(0,212,255,0.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // Pin-1 notch (arc on top edge)
      ctx.beginPath();
      ctx.arc(x + w / 2, y, G * 0.22, Math.PI, 0);
      ctx.strokeStyle = 'rgba(0,212,255,0.07)';
      ctx.stroke();

      // Pins along top & bottom
      const pinsWide = wg;
      for (let p = 0; p < pinsWide; p++) {
        const px = x + G * 0.5 + p * G;
        ctx.fillStyle = 'rgba(0,212,255,0.08)';
        ctx.fillRect(px - 3, y - 7,  6, 7);   // top
        ctx.fillRect(px - 3, y + h,  6, 7);   // bottom
      }
      // Pins along left & right
      const pinsTall = hg;
      for (let p = 0; p < pinsTall; p++) {
        const py = y + G * 0.5 + p * G;
        ctx.fillStyle = 'rgba(0,212,255,0.08)';
        ctx.fillRect(x - 7,  py - 3, 7, 6);   // left
        ctx.fillRect(x + w,  py - 3, 7, 6);   // right
      }

      // Reference designator
      const ref = PREFIXES[Math.floor(rng() * PREFIXES.length)];
      ctx.font         = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle    = 'rgba(0,212,255,0.10)';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${ref}${Math.floor(rng() * 20) + 1}`, x + w / 2, y + h / 2);
    }

    // ── Passive components (resistors / capacitors) ─────────────────
    const numPassive = Math.max(8, Math.floor(W * H / 75000));
    for (let i = 0; i < numPassive; i++) {
      const cg    = Math.floor(rng() * (cols - 3)) + 1;
      const rg    = Math.floor(rng() * (rows - 3)) + 1;
      const x     = cg * G,  y  = rg * G;
      const horiz = rng() < 0.5;
      const bw    = G * 0.95, bh = G * 0.44;

      ctx.strokeStyle = 'rgba(0,212,255,0.07)';
      ctx.lineWidth   = 1;

      if (horiz) {
        ctx.strokeRect(x - bw / 2, y - bh / 2, bw, bh);
        ctx.beginPath();
        ctx.moveTo(x - bw / 2 - G * 0.38, y);
        ctx.lineTo(x - bw / 2, y);
        ctx.moveTo(x + bw / 2, y);
        ctx.lineTo(x + bw / 2 + G * 0.38, y);
        ctx.strokeStyle = 'rgba(0,212,255,0.05)';
        ctx.stroke();
      } else {
        ctx.strokeRect(x - bh / 2, y - bw / 2, bh, bw);
        ctx.beginPath();
        ctx.moveTo(x, y - bw / 2 - G * 0.38);
        ctx.lineTo(x, y - bw / 2);
        ctx.moveTo(x, y + bw / 2);
        ctx.lineTo(x, y + bw / 2 + G * 0.38);
        ctx.strokeStyle = 'rgba(0,212,255,0.05)';
        ctx.stroke();
      }
    }
  }

  window.addEventListener('resize', drawPCB);
  drawPCB();
})();

/* ─────────────────────────────────────────────
   NAVBAR — scroll state
───────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

/* ─────────────────────────────────────────────
   HAMBURGER MENU
───────────────────────────────────────────── */
(function () {
  const btn   = document.getElementById('hamburger');
  const links = document.querySelector('.nav-links');

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

/* ─────────────────────────────────────────────
   TYPED TEXT ANIMATION
───────────────────────────────────────────── */
(function () {
  const el = document.getElementById('typed-text');
  const phrases = [
    'Hardware Engineer',
    'VLSI Designer',
    'Embedded Developer',
    'Robotics Builder',
    'Systems Architect',
  ];
  let pIdx = 0, cIdx = 0, deleting = false;
  const DELAY_TYPE   = 80;
  const DELAY_DELETE = 45;
  const DELAY_PAUSE  = 1800;

  function type() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(type, DELAY_PAUSE);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? DELAY_DELETE : DELAY_TYPE);
  }

  setTimeout(type, 1200);
})();

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER — reveal animations
───────────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => observer.observe(el));

  // Also observe section titles for underline animation
  document.querySelectorAll('.section-title').forEach(el => {
    const titleObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          titleObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    titleObs.observe(el);
  });
})();

/* ─────────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const step = target / (duration / 16);
      let count = 0;
      const tick = () => {
        count = Math.min(count + step, target);
        el.textContent = Math.floor(count) + (count >= target ? '+' : '');
        if (count < target) requestAnimationFrame(tick);
      };
      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

/* ─────────────────────────────────────────────
   PROJECT CARD — mouse-light effect
───────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
})();

/* ─────────────────────────────────────────────
   ACTIVE NAV LINK — highlight on scroll
───────────────────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActive() {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + id) {
            if (!a.classList.contains('btn-nav')) a.style.color = '#00d4ff';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();
