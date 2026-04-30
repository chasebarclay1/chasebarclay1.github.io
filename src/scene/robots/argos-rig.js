/* Argos controller — drives the URDF robot's named joints.
 *
 * URDF joint names mirror robot-config.js: {FR/FL/RR/RL}_{coxa,femur,tibia}_joint.
 * For forward walking we only animate femur (hip swing) + tibia (knee flex);
 * coxa stays at zero (it controls hip abduction, not gait).
 *
 * Diagonal pairs (FR+RL, FL+RR) move antiphase. Walk speed (0..1) scales
 * phase advance + amplitude. When speed → 0 the legs settle back to a
 * neutral standing pose. */

const SWING_AMP = 0.3;     // femur swing amplitude (rad)
const KNEE_AMP = 0.45;     // tibia flex amplitude (rad)
const PHASE_SPEED = 0.012; // rad per ms at speed=1

const LEG_IDS = ['FR', 'FL', 'RR', 'RL'];

export class ArgosRig {
  constructor(robot) {
    this.robot = robot;
    this.joints = robot.joints;
    this.baseY = null; // captured on first tick (position may be set after construction)
    this._speed = 0;
    this._phase = 0;
    this._lastTime = 0;
    this._targetRotY = 0;
    this.idleBiasY = 0;

    // Cached current joint values (URDF joints don't expose .angle reliably).
    this._cur = {};
    for (const id of LEG_IDS) {
      this._cur[`${id}_femur_joint`] = 0;
      this._cur[`${id}_tibia_joint`] = 0;
    }
  }

  setSpeed(speed) {
    this._speed = Math.max(0, Math.min(1, speed));
  }

  setFacing(dir) {
    this._targetRotY = dir < 0 ? Math.PI : 0;
  }

  tick(time) {
    if (this.baseY === null) this.baseY = this.robot.position.y;
    const dt = this._lastTime ? time - this._lastTime : 16;
    this._lastTime = time;

    if (this._speed > 0.01) {
      this._phase += PHASE_SPEED * this._speed * dt;
      const amp = SWING_AMP * Math.min(1, this._speed * 1.5);
      const kAmp = KNEE_AMP * Math.min(1, this._speed * 1.5);

      // Diagonal pair A: FR + RL
      const a = this._phase;
      this._setJoint('FR_femur_joint', Math.sin(a) * amp);
      this._setJoint('RL_femur_joint', Math.sin(a) * amp);
      this._setJoint('FR_tibia_joint', Math.max(0, Math.cos(a)) * kAmp);
      this._setJoint('RL_tibia_joint', Math.max(0, Math.cos(a)) * kAmp);

      // Diagonal pair B: FL + RR (antiphase)
      const b = this._phase + Math.PI;
      this._setJoint('FL_femur_joint', Math.sin(b) * amp);
      this._setJoint('RR_femur_joint', Math.sin(b) * amp);
      this._setJoint('FL_tibia_joint', Math.max(0, Math.cos(b)) * kAmp);
      this._setJoint('RR_tibia_joint', Math.max(0, Math.cos(b)) * kAmp);

      // Body bob — twice per stride.
      this.robot.position.y = this.baseY + Math.sin(this._phase * 2) * 0.02;
    } else {
      // Settle — relax all leg joints toward zero.
      const decay = 0.9;
      for (const id of LEG_IDS) {
        const f = `${id}_femur_joint`;
        const t = `${id}_tibia_joint`;
        this._setJoint(f, this._cur[f] * decay);
        this._setJoint(t, this._cur[t] * decay);
      }
      this.robot.position.y += (this.baseY - this.robot.position.y) * 0.1;
    }

    // Smooth yaw turn + cursor-idle bias.
    const targetY = this._targetRotY + (this.idleBiasY || 0);
    const rotDiff = targetY - this.robot.rotation.y;
    this.robot.rotation.y += rotDiff * 0.08;
  }

  _setJoint(name, value) {
    const j = this.joints[name];
    if (j && typeof j.setJointValue === 'function') {
      j.setJointValue(value);
      this._cur[name] = value;
    }
  }
}
