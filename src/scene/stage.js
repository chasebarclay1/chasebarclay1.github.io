/* Three.js stage — single renderer, scene, camera. Canvas is fixed, behind DOM.
 * Models attach to scene.userData.robots; loop.js iterates and renders. */

import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { addLights } from './lighting.js';

export function createStage() {
  const canvas = document.getElementById('stage');
  if (!canvas) throw new Error('Missing <canvas id="stage">');

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new Scene();
  scene.userData.robots = [];

  const camera = new PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    50,
  );
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  addLights(scene);

  // Resize handler — keep canvas drawing buffer in sync with viewport.
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera };
}
