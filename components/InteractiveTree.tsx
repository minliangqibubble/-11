
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, ParticleData, OrnamentType } from '../types';
import { CONFIG, COLORS, DUMMY_OBJ } from '../constants';

// PATCHED BY GEMINI: 装饰物多样化 (Gifts, Spheres, Stars, Ribbons)

// --- Materials ---
const foliageMaterial = new THREE.MeshStandardMaterial({
  color: COLORS.EMERALD_DEEP,
  roughness: 0.8, // Foliage is not shiny
  metalness: 0.1,
  flatShading: true,
});

// Helper for Gold Material with directional reflection "boost" via props
const goldMaterialProps = {
  color: new THREE.Color(COLORS.GOLD_METALLIC),
  emissive: new THREE.Color(COLORS.GOLD_WARM),
  emissiveIntensity: 0.2, // Subtle glow
  roughness: 0.15,
  metalness: 0.9,
  envMapIntensity: 1.5,
};

const boxMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 0.1,
});

// Easing function for animation
function backOut(t: number): number {
  const s = 1.70158;
  return --t * t * ((s + 1) * t + s) + 1;
}

interface InteractiveTreeProps {
  state: TreeState;
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ state }) => {
  // Refs for Instanced Meshes
  const needlesRef = useRef<THREE.InstancedMesh>(null);
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  const ribbonsRef = useRef<THREE.InstancedMesh>(null);
  const spheresRef = useRef<THREE.InstancedMesh>(null);
  const conesRef = useRef<THREE.InstancedMesh>(null);
  const smallStarsRef = useRef<THREE.InstancedMesh>(null);
  
  // Ref for the Star (Single Mesh)
  const starRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  // --- Data Generation ---
  // Helper: Spiral distribution on cone
  const generateTreePosition = (ratio: number, radiusOffset: number = 0) => {
    const y = (ratio * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
    const rBase = (1 - ratio) * CONFIG.TREE_RADIUS + radiusOffset; 
    const angle = ratio * Math.PI * 20 + (Math.random() * Math.PI * 2); // Random angle + spiral bias
    const x = Math.cos(angle) * rBase;
    const z = Math.sin(angle) * rBase;
    return new THREE.Vector3(x, y, z);
  };

  const generateScatterPosition = () => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS;
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  };

  const { needles, boxes, ribbons, spheres, cones, smallStars, starData } = useMemo(() => {
    const _needles: ParticleData[] = [];
    const _boxes: ParticleData[] = [];
    const _ribbons: ParticleData[] = []; // Ribbons (Attached + Independent)
    const _spheres: ParticleData[] = [];
    const _cones: ParticleData[] = [];
    const _smallStars: ParticleData[] = [];
    
    // 1. Needles (Foliage) - High count, simple particles
    for (let i = 0; i < CONFIG.NEEDLE_COUNT; i++) {
      const ratio = Math.pow(i / CONFIG.NEEDLE_COUNT, 0.8); // Bias towards bottom slightly
      // Tighter spiral for foliage structure
      const y = (ratio * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const r = (1 - ratio) * CONFIG.TREE_RADIUS;
      const angle = i * 0.1 + Math.random(); 
      // Jitter radius to create volume, not just a surface
      const rJitter = r * (0.8 + Math.random() * 0.4); 
      const x = Math.cos(angle) * rJitter;
      const z = Math.sin(angle) * rJitter;

      _needles.push({
        id: i,
        type: 'NEEDLE',
        treePosition: new THREE.Vector3(x, y, z),
        scatterPosition: generateScatterPosition(),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotationSpeed: 0.05,
        scale: new THREE.Vector3(1, 1, 1).multiplyScalar(Math.random() * 0.3 + 0.2),
        color: new THREE.Color(Math.random() > 0.6 ? COLORS.EMERALD_DEEP : COLORS.EMERALD_LIGHT),
        speed: Math.random() * 0.2 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }

    // --- DECORATIONS GENERATION ---
    // 50% Gifts
    for (let i = 0; i < CONFIG.GIFT_COUNT; i++) {
        const ratio = Math.random() * 0.85; 
        const pos = generateTreePosition(ratio, 0.5); 
        const scatter = generateScatterPosition();
        
        const scale = Math.random() * 0.4 + 0.5; // 0.5 to 0.9
        // 50/50 Emerald vs Red for box body
        const isEmerald = Math.random() > 0.5;
        const color = isEmerald ? COLORS.EMERALD_DEEP : COLORS.RED_VELVET;
        const rot = new THREE.Euler(0, Math.random() * Math.PI * 2, 0); 

        // Box Data
        _boxes.push({
            id: i,
            type: 'BOX',
            treePosition: pos,
            scatterPosition: scatter,
            rotation: rot,
            rotationSpeed: 0.1,
            scale: new THREE.Vector3(scale, scale, scale),
            color: new THREE.Color(color),
            speed: Math.random() * 0.3,
            phase: Math.random() * 10
        });

        // Attached Ribbon Data
        _ribbons.push({
            id: i,
            type: 'RIBBON',
            treePosition: pos, 
            scatterPosition: scatter, 
            rotation: rot,
            rotationSpeed: 0.1,
            scale: new THREE.Vector3(scale, scale, scale),
            color: new THREE.Color(COLORS.GOLD_WARM),
            speed: Math.random() * 0.3,
            phase: Math.random() * 10
        });
    }

    // 30% Spheres
    for (let i = 0; i < CONFIG.SPHERE_COUNT; i++) {
        const ratio = Math.random() * 0.95;
        const pos = generateTreePosition(ratio, 0.2);
        const scatter = generateScatterPosition();
        
        // Colors: Gold, Red, Green
        const rnd = Math.random();
        let col = COLORS.GOLD_METALLIC;
        if (rnd < 0.3) col = COLORS.RED_VELVET;
        else if (rnd < 0.6) col = COLORS.EMERALD_LIGHT;
        
        _spheres.push({
            id: i,
            type: 'SPHERE',
            treePosition: pos,
            scatterPosition: scatter,
            rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
            rotationSpeed: Math.random() * 0.5,
            scale: new THREE.Vector3(0.35, 0.35, 0.35),
            color: new THREE.Color(col),
            speed: Math.random() * 0.2,
            phase: i
        });
    }

    // 20% Misc (Small Stars, Cones, Independent Ribbons)
    for (let i = 0; i < CONFIG.MISC_COUNT; i++) {
        const ratio = Math.random() * 0.9;
        const pos = generateTreePosition(ratio, 0.3);
        const scatter = generateScatterPosition();
        
        const typeRnd = Math.random();
        const commonData = {
            id: i,
            treePosition: pos,
            scatterPosition: scatter,
            rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
            rotationSpeed: Math.random() * 0.4,
            speed: Math.random() * 0.2,
            phase: i
        };

        if (typeRnd < 0.4) {
            // Cone
            _cones.push({
                ...commonData,
                type: 'CONE',
                scale: new THREE.Vector3(0.3, 0.3, 0.3),
                color: new THREE.Color(COLORS.GOLD_METALLIC)
            });
        } else if (typeRnd < 0.7) {
            // Small Star
            _smallStars.push({
                ...commonData,
                type: 'SMALL_STAR',
                scale: new THREE.Vector3(0.4, 0.4, 0.4),
                color: new THREE.Color(COLORS.GOLD_WARM)
            });
        } else {
            // Independent Ribbon (Bow)
            _ribbons.push({
                ...commonData,
                type: 'RIBBON',
                scale: new THREE.Vector3(0.6, 0.6, 0.6),
                color: new THREE.Color(COLORS.GOLD_WARM)
            });
        }
    }

    // Big Star Data
    const starData: ParticleData = {
        id: 9999,
        type: 'STAR',
        treePosition: new THREE.Vector3(0, CONFIG.TREE_HEIGHT / 2 + 1, 0),
        scatterPosition: generateScatterPosition(),
        rotation: new THREE.Euler(0, 0, 0),
        rotationSpeed: 0.5,
        scale: new THREE.Vector3(1.8, 1.8, 1.8),
        color: new THREE.Color(COLORS.GOLD_METALLIC),
        speed: 0.2,
        phase: 0
    };
    
    return { needles: _needles, boxes: _boxes, ribbons: _ribbons, spheres: _spheres, cones: _cones, smallStars: _smallStars, starData };
  }, []);

  // --- Apply Colors & Initial Setup ---
  useLayoutEffect(() => {
    const apply = (ref: React.RefObject<THREE.InstancedMesh>, data: ParticleData[]) => {
        if (!ref.current) return;
        data.forEach((p, i) => ref.current!.setColorAt(i, p.color));
        ref.current.instanceColor!.needsUpdate = true;
    };
    apply(needlesRef, needles);
    apply(boxesRef, boxes);
    apply(spheresRef, spheres); 
    apply(conesRef, cones); 
    apply(smallStarsRef, smallStars);
    apply(ribbonsRef, ribbons);
  }, [needles, boxes, ribbons, spheres, cones, smallStars]);

  // --- Animation Loop ---
  useFrame((stateCtx, delta) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * CONFIG.ANIMATION_SPEED);
    const t = progressRef.current;
    const time = stateCtx.clock.getElapsedTime();

    const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, data: ParticleData[], type: OrnamentType) => {
        if (!ref.current) return;
        
        data.forEach((p, i) => {
            // Morph Position
            DUMMY_OBJ.position.lerpVectors(p.scatterPosition, p.treePosition, t);
            
            // Add "Floating" noise when scattered
            if (t < 0.99) {
                const floatIntensity = (1 - t);
                DUMMY_OBJ.position.y += Math.sin(time * p.speed + p.phase) * floatIntensity;
                DUMMY_OBJ.position.x += Math.cos(time * 0.5 + p.phase) * floatIntensity * 0.5;
                
                // Random tumble when scattered
                DUMMY_OBJ.rotation.x = p.rotation.x + time * p.rotationSpeed * floatIntensity;
                DUMMY_OBJ.rotation.y = p.rotation.y + time * p.rotationSpeed * floatIntensity;
            } else {
                // Stable on tree
                DUMMY_OBJ.rotation.copy(p.rotation);
                // Slow rotation for visual interest
                if (type === 'BOX' || type === 'RIBBON' || type === 'SMALL_STAR') {
                    DUMMY_OBJ.rotation.y += Math.sin(time * 0.5 + p.phase) * 0.05;
                }
            }
            
            // Scale Transition (Pop in)
            // Stagger based on ID
            const staggerStart = (i % 50) / 50;
            const smoothT = THREE.MathUtils.smoothstep(t, staggerStart * 0.2, 1.0);
            
            let s = p.scale.x;
            if (type === 'NEEDLE') s *= smoothT; // Grow needles
            else if (type === 'BOX' || type === 'RIBBON' || type === 'SMALL_STAR') s *= backOut(smoothT); // Pop items
            else s *= smoothT; // Linear for spheres/cones
            
            DUMMY_OBJ.scale.setScalar(s);
            if (type === 'CONE') DUMMY_OBJ.scale.y *= 2.5; // Elongate cones

            DUMMY_OBJ.updateMatrix();
            ref.current!.setMatrixAt(i, DUMMY_OBJ.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(needlesRef, needles, 'NEEDLE');
    updateMesh(boxesRef, boxes, 'BOX');
    updateMesh(ribbonsRef, ribbons, 'RIBBON');
    updateMesh(spheresRef, spheres, 'SPHERE');
    updateMesh(conesRef, cones, 'CONE');
    updateMesh(smallStarsRef, smallStars, 'SMALL_STAR');

    // --- Big Star Animation ---
    if (starRef.current) {
        const p = starData;
        starRef.current.position.lerpVectors(p.scatterPosition, p.treePosition, t);
        
        // Float logic for star
        if (t < 0.99) {
             starRef.current.position.y += Math.sin(time) * 0.5 * (1-t);
             starRef.current.rotation.y += delta;
             starRef.current.rotation.z += delta * 0.5;
        } else {
             // Upright on tree top
             starRef.current.rotation.set(0, time * 0.5, 0);
        }
        
        const scalePulse = 1 + Math.sin(time * 3) * 0.1;
        starRef.current.scale.setScalar(p.scale.x * scalePulse);
    }
  });

  // --- Geometries ---
  // Reuse Star Geometry for both Topper and Small Stars
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1;
    const innerRadius = 0.4;
    for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const a = (i / (points * 2)) * Math.PI * 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3 });
  }, []);

  return (
    <group>
        {/* 1. Needles (Foliage) */}
        <instancedMesh ref={needlesRef} args={[undefined, undefined, CONFIG.NEEDLE_COUNT]} castShadow receiveShadow>
            <tetrahedronGeometry args={[1, 0]} />
            <primitive object={foliageMaterial} />
        </instancedMesh>

        {/* 2. Gift Boxes */}
        <instancedMesh ref={boxesRef} args={[undefined, undefined, boxes.length]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <primitive object={boxMaterial} />
        </instancedMesh>

        {/* 3. Gift Ribbons (The Bow/Cross) + Independent Ribbons */}
        <instancedMesh ref={ribbonsRef} args={[undefined, undefined, ribbons.length]}>
            <torusKnotGeometry args={[0.3, 0.08, 64, 8]} /> 
            <meshStandardMaterial {...goldMaterialProps} color={COLORS.GOLD_WARM} />
        </instancedMesh>

        {/* 4. Spheres */}
        <instancedMesh ref={spheresRef} args={[undefined, undefined, spheres.length]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial {...goldMaterialProps} color={undefined} /> 
            {/* Color is set via instanceColor */}
        </instancedMesh>

        {/* 5. Cones */}
        <instancedMesh ref={conesRef} args={[undefined, undefined, cones.length]} castShadow>
            <coneGeometry args={[0.3, 1.5, 16]} />
            <meshStandardMaterial {...goldMaterialProps} color={COLORS.GOLD_METALLIC} />
        </instancedMesh>
        
        {/* 6. Small Stars */}
        <instancedMesh ref={smallStarsRef} args={[undefined, undefined, smallStars.length]}>
            <primitive object={starGeometry} />
            <meshStandardMaterial {...goldMaterialProps} color={COLORS.GOLD_WARM} />
        </instancedMesh>

        {/* 7. Big Star Topper */}
        <group ref={starRef}>
            <mesh geometry={starGeometry}>
                <meshStandardMaterial 
                    color={COLORS.GOLD_METALLIC}
                    emissive={COLORS.GOLD_WARM}
                    emissiveIntensity={2.0}
                    metalness={1.0}
                    roughness={0.1}
                    envMapIntensity={2.0}
                />
            </mesh>
            {/* Star Glow Halo */}
            <pointLight intensity={5} color={COLORS.GOLD_WARM} distance={10} decay={2} />
        </group>
    </group>
  );
};
