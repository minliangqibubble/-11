
import * as THREE from 'three';

// PATCHED BY GEMINI: 修复树体/装饰/雪/材质/DOF/fog/UI 文案

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export type OrnamentType = 'NEEDLE' | 'BOX' | 'RIBBON' | 'SPHERE' | 'CONE' | 'STAR' | 'SMALL_STAR';

export interface ParticleData {
  id: number;
  type: OrnamentType;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  rotation: THREE.Euler; 
  rotationSpeed: number;
  scale: THREE.Vector3;
  color: THREE.Color;
  speed: number;
  phase: number;
}

// END PATCH
