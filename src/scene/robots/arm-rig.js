/* SO-101 controller — drives the URDF robot's named joints.
 *
 * Pose values are in radians, matching the URDF convention. urdf-loader
 * exposes each revolute joint as robot.joints[name].setJointValue(rad).
 *
 * Three reach poses (Up / Mid / Down) cover the row range we hit during
 * the projects-section scroll. Per-frame lerp blends between target and
 * current so motion looks continuous instead of snapping. */

const POSES = {
  idle: {
    shoulder_pan:  0.0,
    shoulder_lift: -1.0,
    elbow_flex:    1.6,
    wrist_flex:    -0.4,
    wrist_roll:    0.0,
    gripper:       0.0,
  },
  reachUp: {
    shoulder_pan:  0.55,
    shoulder_lift: -1.7,
    elbow_flex:    0.9,
    wrist_flex:    -0.3,
    wrist_roll:    0.0,
    gripper:       0.5,
  },
  reachMid: {
    shoulder_pan:  0.55,
    shoulder_lift: -1.3,
    elbow_flex:    1.3,
    wrist_flex:    -0.4,
    wrist_roll:    0.0,
    gripper:       0.5,
  },
  reachDown: {
    shoulder_pan:  0.55,
    shoulder_lift: -0.9,
    elbow_flex:    1.7,
    wrist_flex:    -0.5,
    wrist_roll:    0.0,
    gripper:       0.5,
  },
};

export class ArmRig {
  constructor(robot) {
    this.robot = robot;
    this.joints = robot.joints;
    this.current = { ...POSES.idle };
    this.target = { ...POSES.idle };
    this.idleBias = null; // {shoulder_pan, shoulder_lift} — cursor tracking nudge
  }

  setPose(name) {
    if (!POSES[name]) return;
    this.target = { ...POSES[name] };
  }

  tick() {
    const lerp = 0.08;
    for (const name in this.target) {
      this.current[name] += (this.target[name] - this.current[name]) * lerp;
    }
    const bias = this.idleBias || { shoulder_pan: 0, shoulder_lift: 0 };
    this._set('shoulder_pan',  this.current.shoulder_pan + bias.shoulder_pan);
    this._set('shoulder_lift', this.current.shoulder_lift + bias.shoulder_lift);
    this._set('elbow_flex',    this.current.elbow_flex);
    this._set('wrist_flex',    this.current.wrist_flex);
    this._set('wrist_roll',    this.current.wrist_roll);
    this._set('gripper',       this.current.gripper);
  }

  _set(name, value) {
    const j = this.joints[name];
    if (j && typeof j.setJointValue === 'function') j.setJointValue(value);
  }
}
