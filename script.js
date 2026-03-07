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
