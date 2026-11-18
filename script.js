/* =====================================================
   Chase Barclay — Portfolio v20
   ===================================================== */

(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Year ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Tagline: split into words ── */
  const tagline = document.getElementById('tagline');
  const words = [];
  if (tagline) {
    const nodes = [...tagline.childNodes];
    tagline.textContent = '';
    nodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            tagline.appendChild(document.createTextNode(' '));
          } else {
            const w = document.createElement('span');
            w.className = 'w';
            w.textContent = part;
            tagline.appendChild(w);
            words.push(w);
          }
        });
      } else {
        tagline.appendChild(n);
      }
    });
    if (reduceMotion) words.forEach((w) => w.classList.add('lit'));
  }

  function updateTagline() {
    if (reduceMotion || !words.length) return;
    const trigger = window.innerHeight * 0.62;
    for (const w of words) {
      const r = w.getBoundingClientRect();
      w.classList.toggle('lit', r.top + r.height / 2 < trigger);
    }
  }

  /* ── Rail: energizes as you scroll; nodes light when reached ── */
  const main = document.querySelector('main');
  const rail = document.querySelector('.rail');
  const fill = rail && rail.querySelector('.rail-fill');
  const nodes = [...document.querySelectorAll('.node')];
  let geo = null;

  function measureRail() {
    if (!main || !rail || nodes.length < 2) return;
    const mr = main.getBoundingClientRect();
    const pts = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - mr.left, y: r.top + r.height / 2 - mr.top };
    });
    const top = pts[0].y;
    const bottom = pts[pts.length - 1].y;
    rail.style.left = pts[0].x + 'px';
    rail.style.top = top + 'px';
    rail.style.height = bottom - top + 'px';
    geo = { mainTop: mr.top + window.scrollY, top, bottom, pts };
  }

  function updateRail() {
    if (!geo || !root.classList.contains('loaded')) return;
    const probe = window.scrollY + window.innerHeight * 0.6 - geo.mainTop;
    let p = (probe - geo.top) / (geo.bottom - geo.top);
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) p = 1;
    p = Math.min(1, Math.max(0, p));
    fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';

    const reach = geo.top + p * (geo.bottom - geo.top) + 1;
    nodes.forEach((n, i) => {
      if (n.classList.contains('node-source')) return;
      const on = geo.pts[i].y <= reach;
      if (on !== n.classList.contains('on')) {
        n.classList.toggle('on', on);
        if (n.parentElement.classList.contains('sec-title')) n.parentElement.classList.toggle('on', on);
      }
    });
  }

  /* ── Nav: current section ── */
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const linkFor = {};
  navLinks.forEach((a) => (linkFor[a.getAttribute('href').slice(1)] = a));
  const sections = [...document.querySelectorAll('main section[id]')];
  let activeLink = null;

  function updateNav() {
    const line = window.innerHeight * 0.35;
    let idx = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) idx = i; });
    let link = null;
    for (let i = idx; i >= 0; i--) {
      if (linkFor[sections[i].id]) { link = linkFor[sections[i].id]; break; }
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      link = linkFor.contact || link;
    }
    if (link === activeLink) return;
    if (activeLink) { activeLink.classList.remove('active'); activeLink.removeAttribute('aria-current'); }
    activeLink = link;
    if (link) { link.classList.add('active'); link.setAttribute('aria-current', 'true'); }
  }

  /* ── One rAF-throttled scroll handler ── */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateRail();
      updateNav();
      updateTagline();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function remeasure() { measureRail(); updateRail(); }
  window.addEventListener('resize', remeasure);
  if ('ResizeObserver' in window && main) new ResizeObserver(remeasure).observe(main);

  /* ── Scroll reveals: rise and fade in once ── */
  const reveals = [...document.querySelectorAll('.reveal')];
  // Stagger siblings that reveal together (cards, entries)
  reveals.forEach((el) => {
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 4));
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ── Mobile menu ── */
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    [...menu.querySelectorAll('.menu-links > *')].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 6)));
    let closeTimer;
    function openMenu() {
      clearTimeout(closeTimer);
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('open')));
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('menu-open');
      const first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
    function closeMenu(returnFocus) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('menu-open');
      closeTimer = setTimeout(() => { menu.hidden = true; }, reduceMotion ? 0 : 300);
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closeMenu(false) : openMenu();
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', (m) => {
      if (m.matches && toggle.getAttribute('aria-expanded') === 'true') closeMenu(false);
    });
  }

  /* ── Intro sequence ── */
  function start() {
    measureRail();
    if (reduceMotion) {
      root.classList.add('loaded');
      updateRail(); updateNav(); updateTagline();
      return;
    }
    if (rail) rail.classList.add('intro');
    requestAnimationFrame(() => {
      root.classList.add('loaded');
      setTimeout(() => { updateRail(); updateNav(); updateTagline(); }, 600);
      setTimeout(() => rail && rail.classList.remove('intro'), 2100);
    });
  }
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(start);

  /* ── Copy email ── */
  const copyBtn = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  if (copyBtn) {
    const label = copyBtn.querySelector('.btn-label');
    let timer;
    copyBtn.addEventListener('click', async () => {
      clearTimeout(timer);
      status.classList.remove('error');
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.email);
        copyBtn.classList.add('done');
        label.textContent = 'Email copied';
        status.textContent = 'chaser.barclay@gmail.com is on your clipboard.';
      } catch (err) {
        status.classList.add('error');
        status.textContent = 'Copy failed. Use the Email me button instead.';
      }
      timer = setTimeout(() => {
        copyBtn.classList.remove('done');
        label.textContent = 'Copy email';
        status.textContent = '';
      }, 2500);
    });
  }
})();
