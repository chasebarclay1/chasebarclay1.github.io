/* Render loop. Pauses when the tab is hidden to save battery. */

export function startLoop({ renderer, scene, camera }) {
  let running = true;

  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) renderer.setAnimationLoop(tick);
    else renderer.setAnimationLoop(null);
  });

  function tick(time) {
    // Per-robot tick hook: each rig can register an update callback.
    for (const robot of scene.userData.robots) {
      robot.tick?.(time);
    }
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(tick);
}
