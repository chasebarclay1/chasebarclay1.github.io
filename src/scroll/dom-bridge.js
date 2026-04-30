/* Map a DOM element's screen rect to a 3D world point on the camera plane.
 * Used to position the arm's reach target relative to project rows. */

import { Vector3 } from 'three';

const _v = new Vector3();

export function domToWorld(element, camera, planeZ = 0) {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const ndcX = (cx / window.innerWidth) * 2 - 1;
  const ndcY = -((cy / window.innerHeight) * 2 - 1);

  _v.set(ndcX, ndcY, 0.5).unproject(camera);
  _v.sub(camera.position).normalize();
  const t = (planeZ - camera.position.z) / _v.z;
  return camera.position.clone().add(_v.multiplyScalar(t));
}
