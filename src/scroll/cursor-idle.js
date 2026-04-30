/* Cursor idle — when the user stops scrolling for ~600ms, the robots
 * gently track the cursor so the page reads "alive" instead of frozen.
 * The arm biases its shoulder toward the cursor's horizontal position;
 * Argos turns its body slightly toward it. */

const IDLE_THRESHOLD_MS = 600;
const ARM_PAN_BIAS = 0.35;     // max additional shoulderPan rotation (rad)
const ARGOS_BODY_BIAS = 0.25;  // max additional body Y rotation (rad)

export function startCursorIdle({ armRig, argosRig }) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lastScrollAt = performance.now();
  let armBaseY = 0;
  let argosBaseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('scroll', () => {
    lastScrollAt = performance.now();
  }, { passive: true });

  // Snapshot the rig's current pose-applied rotation each tick so we know
  // what to bias *on top of*. The bias is added in tick() below — small
  // enough that it doesn't fight the pose-driven base rotation.

  function tick() {
    const idleFor = performance.now() - lastScrollAt;
    const idleAmount = Math.min(1, Math.max(0, (idleFor - IDLE_THRESHOLD_MS) / 400));
    if (idleAmount > 0) {
      const nx = (mouseX / window.innerWidth) * 2 - 1;   // -1..+1
      const ny = (mouseY / window.innerHeight) * 2 - 1;  // -1..+1

      if (armRig) {
        armRig.idleBias = {
          shoulder_pan: nx * ARM_PAN_BIAS * idleAmount,
          shoulder_lift: ny * 0.15 * idleAmount,
        };
      }
      if (argosRig) argosRig.idleBiasY = -nx * ARGOS_BODY_BIAS * idleAmount;
    } else {
      if (armRig) armRig.idleBias = null;
      if (argosRig) argosRig.idleBiasY = 0;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
