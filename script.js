/* script.js — Chase Barclay Portfolio */

/* ── YEAR ── */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── PCB BACKGROUND ── */
(function () {
  const canvas = document.getElementById("pcb-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

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
    const CELL = 52;
    const COLS = Math.ceil(W / CELL) + 2;
    const ROWS = Math.ceil(H / CELL) + 2;
    const TRACE_C = "rgba(130, 165, 195, 0.14)";
    const VIA_C = "rgba(130, 165, 195, 0.24)";
    ctx.lineCap = "round";

    function via(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = VIA_C;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
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

    const count = Math.round(COLS * ROWS * 0.2);
    for (let i = 0; i < count; i++) {
      const col = Math.floor(rng() * COLS);
      const row = Math.floor(rng() * ROWS);
      const sx = col * CELL;
      const sy = row * CELL;
      const horiz = rng() > 0.5;
      const len = Math.floor(rng() * 6) + 2;
      const w = rng() > 0.55 ? 2.5 : 1.5;
      const ex = sx + (horiz ? len * CELL : 0);
      const ey = sy + (horiz ? 0 : len * CELL);
      seg(sx, sy, ex, ey, w);
      via(sx, sy);
      via(ex, ey);
      if (rng() < 0.42) {
        const llen = Math.floor(rng() * 4) + 1;
        const dir = rng() > 0.5 ? 1 : -1;
        const lx = ex + (horiz ? 0 : dir * llen * CELL);
        const ly = ey + (horiz ? dir * llen * CELL : 0);
        const lw = rng() > 0.55 ? 2.5 : 1.5;
        seg(ex, ey, lx, ly, lw);
        via(lx, ly);
      }
    }
  }

  draw();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150);
  });
})();

/* ── NAVBAR ── */
(function () {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* ── PAGE LOADER + HERO WORD ANIMATION + SCROLL REVEALS ── */
(function () {
  const loader = document.getElementById("loader");

  // Split element text into <span class="word"> tokens (preserving spaces between)
  function splitWords(el) {
    if (!el) return [];
    const raw = el.textContent.trim();
    el.innerHTML = raw
      .split(/\s+/)
      .map((w) => `<span class="word">${w}</span>`)
      .join(" ");
    return el.querySelectorAll(".word");
  }

  function animateHero() {
    const titleWords = splitWords(document.querySelector(".hero-title"));
    const subWords = splitWords(document.querySelector(".hero-subtitle"));
    let delay = 0;

    titleWords.forEach((w) => {
      const d = delay;
      setTimeout(() => w.classList.add("in"), d);
      delay += 70;
    });

    delay += 90; // brief pause between title and subtitle

    subWords.forEach((w) => {
      const d = delay;
      setTimeout(() => w.classList.add("in"), d);
      delay += 52;
    });

    // Hero about paragraph comes in after subtitle
    const about = document.querySelector(".hero-about");
    if (about) setTimeout(() => about.classList.add("visible"), delay + 120);
  }

  function initReveal() {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    // hero-about is driven by animateHero, everything else uses observer
    document
      .querySelectorAll(".reveal:not(.hero-about)")
      .forEach((el) => obs.observe(el));
  }

  const start = () => {
    animateHero();
    initReveal();
  };

  if (loader) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("hidden");
        start();
      }, 180);
    });
  } else {
    start();
  }
})();

/* ── CUSTOM CURSOR ── */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const dot = document.getElementById("cursor");
  const ring = document.getElementById("cursor-follower");
  if (!dot || !ring) return;

  let mx = -200,
    my = -200,
    rx = -200,
    ry = -200;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
  });

  (function loop() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();

  document
    .querySelectorAll("a, button, .project-card, .footer-cta")
    .forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("cursor-hover"),
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("cursor-hover"),
      );
    });
})();

/* ── 3D CARD TILT ── */
(function () {
  document.querySelectorAll(".project-card").forEach((card) => {
    let raf;
    card.addEventListener("mousemove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const rotY = ((e.clientX - r.left) / r.width - 0.5) * 10;
        const rotX = -((e.clientY - r.top) / r.height - 0.5) * 10;
        card.style.transition =
          "background-color 0.3s ease, border-color 0.3s ease";
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.01)`;
      });
    });
    card.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      card.style.transition =
        "transform 0.65s cubic-bezier(0.16,1,0.3,1), background-color 0.3s ease, border-color 0.3s ease";
      card.style.transform = "";
    });
  });
})();

/* ── FOOTER CTA MAGNETIC ── */
(function () {
  const cta = document.querySelector(".footer-cta");
  if (!cta) return;
  cta.addEventListener("mousemove", (e) => {
    const r = cta.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.2;
    cta.style.transition = "transform 0.25s ease";
    cta.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  cta.addEventListener("mouseleave", () => {
    cta.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
    cta.style.transform = "";
  });
})();
