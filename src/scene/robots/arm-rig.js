/* SO-101 controller — named poses + per-frame smoothing.
 *
 * Skip analytical IK in favor of hand-keyed poses (idle / reachUp /
 * reachMid / reachDown). Each scroll trigger picks the pose closest to
 * the target row's vertical position. The smoothing in tick() blends
 * between poses so the motion looks continuous. */

const POSES = {
  idle: {
    shoulderPan: 0,
    shoulderLift: -0.4,
    elbow: 1.3,
    wristFlex: -0.5,
    wristRoll: 0,
    gripper: 0,
  },
  reachUp: {
    shoulderPan: 0.55,
    shoulderLift: -1.15,
    elbow: 0.85,
    wristFlex: -0.4,
    wristRoll: 0,
    gripper: 0.5,
  },
  reachMid: {
    shoulderPan: 0.55,
    shoulderLift: -0.75,
    elbow: 1.05,
    wristFlex: -0.55,
    wristRoll: 0,
    gripper: 0.5,
  },
  reachDown: {
    shoulderPan: 0.55,
    shoulderLift: -0.35,
    elbow: 1.45,
    wristFlex: -0.55,
    wristRoll: 0,
    gripper: 0.5,
  },
};

export class ArmRig {
  constructor(root) {
    this.root = root;
    this.joints = root.userData.joints;
    this.current = { ...POSES.idle };
    this.target = { ...POSES.idle };
  }

  setPose(name) {
    if (!POSES[name]) return;
    this.target = { ...POSES[name] };
  }

  tick() {
    const lerp = 0.08;
    for (const key in this.target) {
      this.current[key] += (this.target[key] - this.current[key]) * lerp;
    }
    // Cursor-idle bias is added on top of the pose-driven rotation.
    const bias = this.idleBias || { shoulderPan: 0, shoulderLift: 0 };
    this.joints.shoulderPan.rotation.y = this.current.shoulderPan + bias.shoulderPan;
    this.joints.shoulderLift.rotation.x = this.current.shoulderLift + bias.shoulderLift;
    this.joints.elbow.rotation.x = this.current.elbow;
    this.joints.wristFlex.rotation.x = this.current.wristFlex;
    this.joints.wristRoll.rotation.y = this.current.wristRoll;

    // Gripper open/close — slide jaws apart from center.
    const open = this.current.gripper * 0.06;
    this.joints.leftJaw.position.x = -0.022 - open;
    this.joints.rightJaw.position.x = 0.022 + open;
  }
}
