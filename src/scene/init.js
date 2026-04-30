/* 3D init module — split out so Vite can lazy-chunk three.js.
 * main.js dynamic-imports this only on eligible (desktop, motion-OK,
 * WebGL-capable) clients, so the hero loads without the ~140 KB three
 * payload blocking first paint. */

import { createStage } from './stage.js';
import { startLoop } from './loop.js';
import { buildSO101 } from './robots/so101.js';
import { buildArgos } from './robots/argos.js';
import { ArmRig } from './robots/arm-rig.js';
import { ArgosRig } from './robots/argos-rig.js';
import { setupTimeline } from '../scroll/timeline.js';
import { startCursorIdle } from '../scroll/cursor-idle.js';

export async function init3D() {
  const stage = createStage();

  // SO-101 — parked offscreen-right; setupTimeline slides it in.
  // Y=-0.8 keeps the base inside the visible frustum (±1.89 at z=0)
  // and the gripper in the upper portion of the screen on neutral pose.
  const arm = buildSO101();
  arm.position.set(5, -0.8, 0);
  arm.rotation.y = -0.3;
  stage.scene.add(arm);

  // Argos — sits in the bottom gutter; walks left↔right with scroll.
  // Y=-1.4 lands the body box near the bottom edge while keeping the
  // head visible.
  const argos = buildArgos();
  argos.position.set(-3.5, -1.4, 0);
  stage.scene.add(argos);

  // Rig controllers — pushed to scene.userData.robots so loop.js ticks them.
  const armRig = new ArmRig(arm);
  const argosRig = new ArgosRig(argos);
  stage.scene.userData.robots.push(armRig, argosRig);

  stage.robots = { arm, argos };
  window.__stage = stage;

  setupTimeline({ stage, armRig, argosRig });
  startCursorIdle({ armRig, argosRig });
  startLoop(stage);

  return stage;
}
