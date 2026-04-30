/* Scroll-driven choreography for the SO-101 arm + Argos quadruped.
 *
 * Arm:    enters from right when #projects appears, picks a reach pose per
 *         project row based on the row's vertical screen position, retracts
 *         when #projects leaves the viewport.
 * Argos:  walks across the bottom gutter. Position is mapped to overall
 *         scroll progress between hero bottom and contact top. Walk speed
 *         is driven by scroll velocity so it only "walks" while the user
 *         is scrolling. */

import { animate } from 'animejs';

const ARM_PARK_X = 6;
const ARM_ONSCREEN_X = 2.6;

const ARGOS_LEFT_X = -3.8;
const ARGOS_RIGHT_X = 3.8;

export function setupTimeline({ stage, armRig, argosRig }) {
  const arm = stage.robots.arm;
  const argos = stage.robots.argos;

  /* ── Arm enter/exit on the projects section ── */
  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(arm.position, {
            x: ARM_ONSCREEN_X,
            duration: 900,
            ease: 'outExpo',
          });
        } else {
          armRig.setPose('idle');
          animate(arm.position, {
            x: ARM_PARK_X,
            duration: 700,
            ease: 'inExpo',
          });
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(projectsSection);
  }

  /* ── Per-row reach pose ──
   * Pick the pose closest to where the row sits on screen. The active row
   * is whichever .project-row is closest to the viewport center. */
  const rows = [...document.querySelectorAll('.project-row')];
  if (rows.length) {
    function pickActiveRow() {
      const cy = window.innerHeight / 2;
      let best = null;
      let bestDist = Infinity;
      for (const row of rows) {
        const r = row.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const rcy = r.top + r.height / 2;
        const d = Math.abs(rcy - cy);
        if (d < bestDist) { bestDist = d; best = row; }
      }
      return best;
    }

    function updateRowPose() {
      const row = pickActiveRow();
      if (!row) return;
      const r = row.getBoundingClientRect();
      const screenY = (r.top + r.height / 2) / window.innerHeight;
      // Top third → reachUp, middle → reachMid, bottom third → reachDown.
      const pose = screenY < 0.4 ? 'reachUp'
                 : screenY > 0.6 ? 'reachDown'
                 : 'reachMid';
      armRig.setPose(pose);
    }

    window.addEventListener('scroll', updateRowPose, { passive: true });
    updateRowPose();
  }

  /* ── Argos walk: position from scroll progress, speed from scroll velocity ── */
  const heroSection = document.getElementById('hero');
  const contactSection = document.getElementById('contact');
  if (heroSection && contactSection) {
    let lastY = window.scrollY;
    let velocity = 0;
    let velocityFadeRaf = null;

    function updateArgos() {
      // Progress between hero-bottom and contact-top, clamped [0, 1].
      const startScroll = heroSection.offsetTop + heroSection.offsetHeight - window.innerHeight * 0.5;
      const endScroll = contactSection.offsetTop - window.innerHeight * 0.5;
      const range = Math.max(1, endScroll - startScroll);
      const p = Math.max(0, Math.min(1, (window.scrollY - startScroll) / range));
      argos.position.x = ARGOS_LEFT_X + p * (ARGOS_RIGHT_X - ARGOS_LEFT_X);

      // Velocity-driven walk speed. Decays when scroll stops.
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      velocity = Math.max(velocity, Math.min(1, dy * 0.04));
      argosRig.setSpeed(velocity);

      // Direction follows scroll sign (down = right, up = left).
      argosRig.setFacing(window.scrollY >= (updateArgos._lastForFacing ?? 0) ? 1 : -1);
      updateArgos._lastForFacing = window.scrollY;

      // Schedule velocity decay.
      if (velocityFadeRaf) cancelAnimationFrame(velocityFadeRaf);
      const fade = () => {
        velocity *= 0.92;
        argosRig.setSpeed(velocity);
        if (velocity > 0.005) velocityFadeRaf = requestAnimationFrame(fade);
        else velocity = 0;
      };
      velocityFadeRaf = requestAnimationFrame(fade);
    }

    window.addEventListener('scroll', updateArgos, { passive: true });
    updateArgos();
  }
}
