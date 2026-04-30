/* Shared URDF + STL loader. Used for both SO-101 and Argos.
 *
 * Every loaded mesh is forced onto the shared grey matte material —
 * the URDF's original silver/3D-print colors don't fit the page palette.
 * URDFs are Z-up (ROS); the returned root is rotated -90° about X so +Z
 * aligns with three.js +Y. */

import { LoadingManager, Mesh } from 'three';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { createRobotMaterial } from '../materials.js';

/** Load a URDF and return a Promise<URDFRobot>.
 *  @param {string} url - URDF URL (relative to site root).
 *  @param {object} [packages] - optional map of `package://NAME/...` resolution.
 *      e.g. { Argos_description: '/urdf/argos' } */
export function loadURDFRobot(url, packages = {}) {
  return new Promise((resolve, reject) => {
    const manager = new LoadingManager();
    const stl = new STLLoader(manager);
    const greyMat = createRobotMaterial();

    const loader = new URDFLoader(manager);
    if (Object.keys(packages).length) loader.packages = packages;

    loader.loadMeshCb = (path, _mgr, onComplete) => {
      stl.load(
        path,
        (geometry) => onComplete(new Mesh(geometry, greyMat)),
        undefined,
        (err) => onComplete(null, err),
      );
    };

    loader.load(
      url,
      (robot) => {
        // URDFs are Z-up; rotate so +Z aligns with three.js +Y.
        robot.rotation.x = -Math.PI / 2;
        resolve(robot);
      },
      undefined,
      (err) => reject(err),
    );
  });
}
