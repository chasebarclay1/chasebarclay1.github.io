/* Phase-3 placeholder cube. Confirms the canvas + render loop + material
 * pipeline is working. Removed in Phase 4 once real GLB models load. */

import { BoxGeometry, Mesh } from 'three';
import { createRobotMaterial } from './materials.js';

export function addCanary(scene) {
  const cube = new Mesh(new BoxGeometry(0.6, 0.6, 0.6), createRobotMaterial());
  cube.position.set(2, -0.5, 0);
  scene.add(cube);
  scene.userData.robots.push({
    tick: (t) => {
      cube.rotation.x = t * 0.0005;
      cube.rotation.y = t * 0.0008;
    },
  });
}
