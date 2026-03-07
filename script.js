/* ─────────────────────────────────────────────
   script.js — Chase Barclay Portfolio
───────────────────────────────────────────── */

/* ── YEAR ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ─────────────────────────────────────────────
   PARTICLE BACKGROUND CANVAS
───────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COUNT = 80;
  const MAX_DIST = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.8 + 0.6,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.35)';
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  // Mouse interaction — push particles
  let mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    particles.forEach(p => {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.vx += (dx / dist) * force * 0.3;
        p.vy += (dy / dist) * force * 0.3;
        // Cap speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.5) { p.vx *= 2.5 / speed; p.vy *= 2.5 / speed; }
      }
    });
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
    loop();
  });

  init();
  loop();
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
