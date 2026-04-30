/* Shared material for both robots — flat grey matte, Apple-flat aesthetic. */

import { MeshStandardMaterial, Color } from 'three';

export const ROBOT_GREY = new Color('#B0B5BD');

export function createRobotMaterial() {
  return new MeshStandardMaterial({
    color: ROBOT_GREY,
    roughness: 0.85,
    metalness: 0.05,
  });
}
