
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping, DepthOfField } from '@react-three/postprocessing';
import { InteractiveTree } from './InteractiveTree';
import { SnowParticles } from './SnowParticles';
import { TreeState } from '../types';
import { COLORS } from '../constants';

// PATCHED BY GEMINI: 移除薄雾 (No Fog)

interface ExperienceProps {
  treeState: TreeState;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ 
            antialias: false, // Post-processing handles AA
            toneMappingExposure: 1.1,
            powerPreference: "high-performance"
        }}
    >
      {/* NO FOG applied here for crystal clear view */}
      <color attach="background" args={[COLORS.BACKGROUND]} />

      <PerspectiveCamera makeDefault position={[0, 0, 38]} fov={32} />
      
      <OrbitControls 
        minPolarAngle={Math.PI / 2.8} 
        maxPolarAngle={Math.PI / 1.8} 
        minDistance={20} 
        maxDistance={60}
        enablePan={false}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
      />

      {/* --- Environment & Lighting (Prevents Black Materials) --- */}
      <Environment preset="city" environmentIntensity={1.2} blur={0.7} />

      <ambientLight intensity={0.2} color={COLORS.EMERALD_DEEP} />
      
      {/* Key Light (Warm) */}
      <spotLight 
        position={[20, 30, 15]} 
        angle={0.3} 
        penumbra={1} 
        intensity={180} 
        castShadow 
        color="#FFF0DD"
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim Light (Cool - Highlights Edges) */}
      <spotLight 
        position={[-20, 10, -15]} 
        intensity={120} 
        color="#E0F7FA" 
        angle={0.6}
        penumbra={0.5}
      />

      {/* Fill Light (Bottom Up - Reveals Tree Underside) */}
      <pointLight position={[0, -10, 5]} intensity={40} color={COLORS.EMERALD_LIGHT} distance={25} />

      {/* Scene Content */}
      <group position={[0, -4, 0]}>
         <InteractiveTree state={treeState} />
         <SnowParticles />
         
         <ContactShadows 
            opacity={0.5} 
            scale={40} 
            blur={2} 
            far={10} 
            resolution={512} 
            color="#000000" 
         />
      </group>

      {/* --- Post Processing --- */}
      <EffectComposer enableNormalPass={false}>
        {/* Depth of Field for Cinematic Focus */}
        <DepthOfField 
            focusDistance={0.035} // Focuses roughly at tree center
            focalLength={0.1} 
            bokehScale={4} 
            height={480} 
        />
        
        {/* Luxurious Bloom */}
        <Bloom 
            luminanceThreshold={0.35} // Only brightest metals glow
            mipmapBlur 
            intensity={1.5} 
            radius={0.5}
        />
        
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  );
};
