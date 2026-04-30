/* Argos controller — trotting walk cycle.
 *
 * Diagonal pairs (FR+RL, FL+RR) move in antiphase. Hip swings and knees
 * flex on a cosine offset so the foot lifts during swing and plants during
 * stance. Walk speed (0..1) controls phase advance and amplitude. When
 * speed → 0 the legs settle back to standing. */

const SWING_AMP = 0.35;   // hip swing amplitude (rad)
const KNEE_AMP = 0.55;    // knee flex amplitude (rad)
const PHASE_SPEED = 0.012; // rad per ms at speed=1

export class ArgosRig {
  constructor(root) {
    this.root = root;
    this.bones = root.userData.bones;
    this.baseY = root.position.y;
    this._speed = 0;
    this._phase = 0;
    this._lastTime = 0;
    this._facing = 1; // +1 walks right, -1 walks left
    this._targetRotY = 0;
  }

  setSpeed(speed) {
    this._speed = Math.max(0, Math.min(1, speed));
  }

  setFacing(dir) {
    this._facing = dir < 0 ? -1 : 1;
    this._targetRotY = this._facing > 0 ? 0 : Math.PI;
  }

  tick(time) {
    const dt = this._lastTime ? time - this._lastTime : 16;
    this._lastTime = time;

    if (this._speed > 0.01) {
      this._phase += PHASE_SPEED * this._speed * dt;
      const amp = SWING_AMP * Math.min(1, this._speed * 1.5);
      const kAmp = KNEE_AMP * Math.min(1, this._speed * 1.5);

      // Diagonal pair A: FR + RL
      const a = this._phase;
      this.bones.FR.hip.rotation.x = Math.sin(a) * amp;
      this.bones.RL.hip.rotation.x = Math.sin(a) * amp;
      this.bones.FR.knee.rotation.x = Math.max(0, Math.cos(a)) * kAmp;
      this.bones.RL.knee.rotation.x = Math.max(0, Math.cos(a)) * kAmp;

      // Diagonal pair B: FL + RR (antiphase)
      const b = this._phase + Math.PI;
      this.bones.FL.hip.rotation.x = Math.sin(b) * amp;
      this.bones.RR.hip.rotation.x = Math.sin(b) * amp;
      this.bones.FL.knee.rotation.x = Math.max(0, Math.cos(b)) * kAmp;
      this.bones.RR.knee.rotation.x = Math.max(0, Math.cos(b)) * kAmp;

      // Subtle body bob — twice per stride.
      this.root.position.y = this.baseY + Math.sin(this._phase * 2) * 0.04;
    } else {
      // Settle — relax all joints toward zero.
      const decay = 0.88;
      for (const id in this.bones) {
        this.bones[id].hip.rotation.x *= decay;
        this.bones[id].knee.rotation.x *= decay;
      }
      this.root.position.y += (this.baseY - this.root.position.y) * 0.1;
    }

    // Smooth turn toward target heading + cursor-idle bias.
    const targetY = this._targetRotY + (this.idleBiasY || 0);
    const rotDiff = targetY - this.root.rotation.y;
    this.root.rotation.y += rotDiff * 0.08;
  }
}
