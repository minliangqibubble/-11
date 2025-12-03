
import * as THREE from 'three';

// PATCHED BY GEMINI: 修复树体/装饰/雪/材质/DOF/fog/UI 文案

export const COLORS = {
  // Deep Emerald for Tree Body
  EMERALD_DEEP: "#0B3A2E",
  EMERALD_LIGHT: "#105040",
  
  // Decorations
  RED_VELVET: "#8B1A1A",
  GOLD_METALLIC: "#FFD700", // Standard Gold
  GOLD_WARM: "#FFD983",     // Warm Highlight Gold
  
  SNOW_WHITE: "#FFF8E7",
  BACKGROUND: "#010806",
  FOG: "#061A14"
};

export const CONFIG = {
  // Increased density for "Foliage" look
  NEEDLE_COUNT: 4000, 
  
  // 50% Gifts, 50% Ornaments roughly
  GIFT_COUNT: 120, 
  SPHERE_COUNT: 120,
  MISC_COUNT: 80,
  ORNAMENT_COUNT: 120, // Spheres, Cones
  
  SNOW_COUNT: 1500,
  
  TREE_HEIGHT: 18,
  TREE_RADIUS: 6.5,
  SCATTER_RADIUS: 40,
  
  ANIMATION_SPEED: 1.8,
};

// Reusable Three objects to reduce GC
export const DUMMY_OBJ = new THREE.Object3D();
export const DUMMY_VEC = new THREE.Vector3();
export const DUMMY_COLOR = new THREE.Color();

// END PATCH
