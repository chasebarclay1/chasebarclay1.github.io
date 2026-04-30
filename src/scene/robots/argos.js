/* Argos — stylized low-poly quadruped.
 *
 * Body box + 4 two-segment legs + small head. Each leg has a hip (rotates X)
 * and knee (rotates X) — that's enough degrees of freedom to drive a 4-phase
 * walk cycle. No mechanical detail: the silhouette reads "robot dog" and lets
 * the matte grey material do the work. */

import { Group, Mesh, BoxGeometry, CylinderGeometry, SphereGeometry } from 'three';
import { createRobotMaterial } from '../materials.js';

const SCALE = 3;

export function buildArgos() {
  const root = new Group();
  root.name = 'argos';
  const mat = createRobotMaterial();

  const bodyLen = 0.55 * SCALE;
  const bodyH = 0.16 * SCALE;
  const bodyW = 0.22 * SCALE;
  const legUpper = 0.12 * SCALE;
  const legLower = 0.12 * SCALE;
  const legR = 0.022 * SCALE;
  const standHeight = legUpper + legLower;

  // ── Body ──
  const body = new Mesh(new BoxGeometry(bodyLen, bodyH, bodyW), mat);
  body.position.y = standHeight + bodyH / 2;
  root.add(body);

  // ── Head (small wedge at front) ──
  const headSize = bodyH * 0.85;
  const head = new Mesh(new BoxGeometry(headSize, headSize, headSize), mat);
  head.position.set(
    bodyLen / 2 + headSize / 2 - 0.02,
    standHeight + bodyH / 2 + headSize * 0.1,
    0,
  );
  root.add(head);

  // Optional eye dots (slight emboss for character).
  const eyeR = 0.012 * SCALE;
  const eyeMat = createRobotMaterial();
  eyeMat.color.set('#5C6470'); // slightly darker grey
  const eyeOffsetX = bodyLen / 2 + headSize - 0.01;
  const eyeOffsetZ = headSize * 0.32;
  for (const dz of [-eyeOffsetZ, eyeOffsetZ]) {
    const eye = new Mesh(new SphereGeometry(eyeR, 12, 12), eyeMat);
    eye.position.set(eyeOffsetX, head.position.y + eyeR * 0.5, dz);
    root.add(eye);
  }

  // ── Four legs ──
  const inset = legR * 1.8;
  const hipPositions = {
    FR: [ bodyLen / 2 - inset, -bodyW / 2 + inset],
    FL: [ bodyLen / 2 - inset,  bodyW / 2 - inset],
    RR: [-bodyLen / 2 + inset, -bodyW / 2 + inset],
    RL: [-bodyLen / 2 + inset,  bodyW / 2 - inset],
  };

  const bones = {};
  for (const [legId, [x, z]] of Object.entries(hipPositions)) {
    // Hip pivot at the bottom of the body.
    const hip = new Group();
    hip.position.set(x, standHeight, z);
    root.add(hip);

    // Upper leg extends downward (-Y) from hip.
    const upperLeg = new Mesh(
      new CylinderGeometry(legR, legR * 0.9, legUpper, 12),
      mat,
    );
    upperLeg.position.y = -legUpper / 2;
    hip.add(upperLeg);

    // Knee at end of upper leg.
    const knee = new Group();
    knee.position.y = -legUpper;
    hip.add(knee);

    const lowerLeg = new Mesh(
      new CylinderGeometry(legR * 0.9, legR * 0.7, legLower, 12),
      mat,
    );
    lowerLeg.position.y = -legLower / 2;
    knee.add(lowerLeg);

    // Foot pad (subtle rounded cap so legs don't end abruptly).
    const foot = new Mesh(new SphereGeometry(legR * 0.85, 12, 8), mat);
    foot.position.y = -legLower;
    knee.add(foot);

    bones[legId] = { hip, knee };
  }

  root.userData.bones = bones;
  root.userData.standHeight = standHeight;
  root.userData.bodyLen = bodyLen;

  return root;
}
