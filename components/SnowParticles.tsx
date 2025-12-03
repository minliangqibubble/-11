
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

// PATCHED BY GEMINI: 修复树体/装饰/雪/材质/DOF/fog/UI 文案

export const SnowParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate snow data
  const { positions, velocities } = useMemo(() => {
    const count = CONFIG.SNOW_COUNT;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random position in a large volume
      pos[i * 3] = (Math.random() - 0.5) * 60;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50 + 10; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60; // z

      // Velocity: Fall down, slight drift
      vel[i * 3] = (Math.random() - 0.5) * 0.04;      // x drift
      vel[i * 3 + 1] = -(Math.random() * 0.04 + 0.02); // y fall speed
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.04;  // z drift
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < CONFIG.SNOW_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Add simple sine wave sway based on time
      positions[ix] += velocities[ix] + Math.sin(time + i) * 0.002;
      positions[iy] += velocities[iy];
      positions[iz] += velocities[iz] + Math.cos(time + i) * 0.002;

      // Reset if below floor (assume floor at -12)
      if (positions[iy] < -12) {
        positions[iy] = 35; // Reset to top
        positions[ix] = (Math.random() - 0.5) * 60; 
        positions[iz] = (Math.random() - 0.5) * 60;
      }
    }
    
    posAttr.needsUpdate = true;
  });

  // Soft snowflake texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.4}
        color={COLORS.SNOW_WHITE}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
        alphaTest={0.01}
      />
    </points>
  );
};

// END PATCH
