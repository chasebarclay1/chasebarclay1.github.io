/* 3D init module — loads the two URDF robots in parallel, wires rigs +
 * scroll choreography + cursor idle, kicks off the render loop. */

import { createStage } from './stage.js';
import { startLoop } from './loop.js';
import { loadURDFRobot } from './robots/urdf-loader.js';
import { ArmRig } from './robots/arm-rig.js';
import { ArgosRig } from './robots/argos-rig.js';
import { setupTimeline } from '../scroll/timeline.js';
import { startCursorIdle } from '../scroll/cursor-idle.js';

export async function init3D() {
  const stage = createStage();

  // Load both URDFs in parallel. Each ~5–16 MB of STL meshes; render loop
  // starts immediately and robots pop in when their loads complete.
  const [armResult, argosResult] = await Promise.allSettled([
    loadURDFRobot('/urdf/so101.urdf'),
    loadURDFRobot('/urdf/argos.urdf', { Argos_description: '/urdf/argos' }),
  ]);

  const robots = {};

  if (armResult.status === 'fulfilled') {
    const arm = armResult.value;
    arm.position.set(2.4, -0.6, 0);     // visible right side, parked
    arm.rotation.y = -0.2;
    stage.scene.add(arm);
    const armRig = new ArmRig(arm);
    stage.scene.userData.robots.push(armRig);
    robots.arm = arm;
    robots.armRig = armRig;
    // Park the arm offscreen-right initially; setupTimeline slides it in.
    arm.position.x = 5;
  } else {
    console.warn('SO-101 URDF failed to load:', armResult.reason);
  }

  if (argosResult.status === 'fulfilled') {
    const argos = argosResult.value;
    argos.position.set(-3, -1.2, 0);
    stage.scene.add(argos);
    const argosRig = new ArgosRig(argos);
    stage.scene.userData.robots.push(argosRig);
    robots.argos = argos;
    robots.argosRig = argosRig;
  } else {
    console.warn('Argos URDF failed to load:', argosResult.reason);
  }

  stage.robots = robots;
  window.__stage = stage;

  // Wire scroll choreography for whichever rig(s) loaded successfully.
  if (robots.armRig || robots.argosRig) {
    setupTimeline({ stage, armRig: robots.armRig, argosRig: robots.argosRig });
    startCursorIdle({ armRig: robots.armRig, argosRig: robots.argosRig });
  }
  startLoop(stage);

  return stage;
}
