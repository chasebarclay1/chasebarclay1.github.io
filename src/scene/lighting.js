/* Soft three-point lighting. No shadows — perf + flat aesthetic. */

import { AmbientLight, DirectionalLight } from 'three';

export function addLights(scene) {
  // Ambient fills the underside so flat shading doesn't black-clip.
  scene.add(new AmbientLight(0xffffff, 0.55));

  // Key light, slightly above + offset right.
  const key = new DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 4, 5);
  scene.add(key);

  // Fill from the opposite side, dimmer.
  const fill = new DirectionalLight(0xffffff, 0.35);
  fill.position.set(-4, 2, -2);
  scene.add(fill);
}
