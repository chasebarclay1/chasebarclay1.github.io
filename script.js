/* script.js — Chase Barclay Portfolio */

/* ── YEAR ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── NAVBAR ── */
(function () {
  const nav = document.getElementById('navbar');
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── HAMBURGER ── */
(function () {
  const btn   = document.getElementById('hamburger');
  const links = document.querySelector('.nav-links');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    })
  );
})();

/* ── SCROLL REVEAL ── */
(function () {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── COUNTER ── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const step   = target / (1100 / 16);
      let   count  = 0;
      const tick   = () => {
        count = Math.min(count + step, target);
        el.textContent = Math.floor(count);
        if (count < target) requestAnimationFrame(tick);
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(c => obs.observe(c));
})();

/* ── PCB BACKGROUND ── */
(function () {
  const canvas = document.getElementById('pcb-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function draw() {
    const W = (canvas.width  = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    ctx.clearRect(0, 0, W, H);

    const rng     = mulberry32(0xDEADBEEF);
    const CELL    = 52;
    const COLS    = Math.ceil(W / CELL) + 2;
    const ROWS    = Math.ceil(H / CELL) + 2;
    const TRACE_C = 'rgba(130, 165, 195, 0.14)';
    const VIA_C   = 'rgba(130, 165, 195, 0.24)';

    ctx.lineCap = 'round';

    function via(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = VIA_C;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    }

    function seg(x1, y1, x2, y2, w) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = TRACE_C;
      ctx.lineWidth = w;
      ctx.stroke();
    }

    const count = Math.round(COLS * ROWS * 0.20);
    for (let i = 0; i < count; i++) {
      const col   = Math.floor(rng() * COLS);
      const row   = Math.floor(rng() * ROWS);
      const sx    = col * CELL;
      const sy    = row * CELL;
      const horiz = rng() > 0.5;
      const len   = Math.floor(rng() * 6) + 2;   // 2–7 cells
      const w     = rng() > 0.55 ? 2.5 : 1.5;

      const ex = sx + (horiz ? len * CELL : 0);
      const ey = sy + (horiz ? 0 : len * CELL);

      seg(sx, sy, ex, ey, w);
      via(sx, sy);
      via(ex, ey);

      // ~42% chance: add a perpendicular bend at the endpoint
      if (rng() < 0.42) {
        const llen = Math.floor(rng() * 4) + 1;
        const dir  = rng() > 0.5 ? 1 : -1;
        const lx   = ex + (horiz ? 0 : dir * llen * CELL);
        const ly   = ey + (horiz ? dir * llen * CELL : 0);
        const lw   = rng() > 0.55 ? 2.5 : 1.5;
        seg(ex, ey, lx, ly, lw);
        via(lx, ly);
      }
    }
  }

  draw();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150);
  });
})();

/* ── ACTIVE NAV ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 80;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(a => {
          const isActive = a.getAttribute('href') === '#' + s.id;
          if (!a.classList.contains('nav-cta'))
            a.style.color = isActive ? '#f5f5f7' : '';
        });
      }
    });
  }, { passive: true });
})();
