/* SO-101 — procedural 6-DOF arm built from primitives.
 *
 * Joint tree mirrors the URDF (shoulder_pan/lift → elbow_flex → wrist_flex/roll
 * → gripper). Real segment lengths from so101_new_calib.urdf, scaled up for
 * camera-friendly size at z=6.
 *
 * Returned root.userData.joints exposes each pivot Group so the rig
 * controller in Phase 5 can drive joint angles directly. */

import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
} from 'three';
import { createRobotMaterial } from '../materials.js';

const SCALE = 4;

export function buildSO101() {
  const root = new Group();
  root.name = 'so101';
  const mat = createRobotMaterial();

  // Segment dimensions (URDF distances × SCALE).
  const baseR = 0.06 * SCALE;
  const baseH = 0.10 * SCALE;
  const segR = 0.025 * SCALE;
  const upperLen = 0.13 * SCALE;
  const lowerLen = 0.13 * SCALE;
  const wristLen = 0.06 * SCALE;
  const gripperLen = 0.05 * SCALE;

  // ── Base (static) ──
  const base = new Mesh(
    new CylinderGeometry(baseR, baseR * 1.15, baseH, 32),
    mat,
  );
  base.position.y = baseH / 2;
  root.add(base);

  // ── Shoulder pan (rotates around Y) ──
  const shoulderPan = new Group();
  shoulderPan.position.y = baseH;
  root.add(shoulderPan);

  // Shoulder collar — short cylinder above the pan joint.
  const collar = new Mesh(
    new CylinderGeometry(segR * 1.6, segR * 1.6, segR * 1.2, 24),
    mat,
  );
  collar.position.y = segR * 0.6;
  shoulderPan.add(collar);

  // ── Shoulder lift (rotates around X) ──
  const shoulderLift = new Group();
  shoulderLift.position.y = segR * 1.2;
  shoulderPan.add(shoulderLift);

  // Upper arm — cylinder pointing up along local +Y (will tilt with shoulderLift).
  const upperArm = new Mesh(
    new CylinderGeometry(segR, segR * 0.95, upperLen, 16),
    mat,
  );
  upperArm.position.y = upperLen / 2;
  shoulderLift.add(upperArm);

  // ── Elbow flex (rotates around X at end of upper arm) ──
  const elbow = new Group();
  elbow.position.y = upperLen;
  shoulderLift.add(elbow);

  const lowerArm = new Mesh(
    new CylinderGeometry(segR * 0.95, segR * 0.85, lowerLen, 16),
    mat,
  );
  lowerArm.position.y = lowerLen / 2;
  elbow.add(lowerArm);

  // ── Wrist flex (rotates around X) ──
  const wristFlex = new Group();
  wristFlex.position.y = lowerLen;
  elbow.add(wristFlex);

  // ── Wrist roll (rotates around Y, nested in wrist flex) ──
  const wristRoll = new Group();
  wristFlex.add(wristRoll);

  const wrist = new Mesh(
    new CylinderGeometry(segR * 0.85, segR * 0.7, wristLen, 16),
    mat,
  );
  wrist.position.y = wristLen / 2;
  wristRoll.add(wrist);

  // ── Gripper assembly (two parallel jaws) ──
  const gripper = new Group();
  gripper.position.y = wristLen;
  wristRoll.add(gripper);

  const jawW = 0.018 * SCALE;
  const jawT = 0.012 * SCALE;
  const jawSpacing = 0.022 * SCALE;
  const leftJaw = new Mesh(new BoxGeometry(jawT, gripperLen, jawW), mat);
  leftJaw.position.set(-jawSpacing / 2, gripperLen / 2, 0);
  gripper.add(leftJaw);

  const rightJaw = new Mesh(new BoxGeometry(jawT, gripperLen, jawW), mat);
  rightJaw.position.set(jawSpacing / 2, gripperLen / 2, 0);
  gripper.add(rightJaw);

  // Neutral pose: arm parked, elbow bent — looks "ready" not "stiff".
  shoulderLift.rotation.x = -0.4;
  elbow.rotation.x = 1.3;
  wristFlex.rotation.x = -0.5;

  root.userData.joints = {
    shoulderPan,
    shoulderLift,
    elbow,
    wristFlex,
    wristRoll,
    gripper,
    leftJaw,
    rightJaw,
  };
  root.userData.dimensions = { baseH, upperLen, lowerLen, wristLen, gripperLen };

  return root;
}
