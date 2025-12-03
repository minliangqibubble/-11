
import React from 'react';
import { TreeState } from '../types';

// PATCHED BY GEMINI: UI 字体统一 & 颜色修复

interface UIOverlayProps {
  currentState: TreeState;
  onToggle: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggle }) => {
  const isTree = currentState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-center pt-10 opacity-0 animate-fade-in-down" style={{ animationFillMode: 'forwards' }}>
        <h2 className="text-[#D4AF37] tracking-[0.3em] text-xs font-bold uppercase mb-3 drop-shadow-md">
            The Holiday Collection
        </h2>
        {/* Luxury Title Container */}
        <h1 className="flex flex-col md:flex-row items-baseline gap-2 md:gap-4 text-5xl md:text-8xl text-center drop-shadow-xl font-serif">
            {/* Merry - Deep Red Gradient with Gold Stroke */}
            <span 
                className="bg-clip-text text-transparent bg-gradient-to-b from-[#8B0000] to-[#500000] italic font-light" 
                style={{ WebkitTextStroke: '1px #D4AF37' }}
            >
                Merry
            </span>
            
            {/* Christmas - Deep Emerald Gradient with Gold Stroke */}
            <span 
                className="bg-clip-text text-transparent bg-gradient-to-b from-[#105040] to-[#012215] italic font-light" 
                style={{ WebkitTextStroke: '1px #D4AF37' }}
            >
                Christmas
            </span>
        </h1>
      </header>

      {/* Footer / Controls */}
      <footer className="flex flex-col items-center pb-16 pointer-events-auto">
        <div className="flex flex-col items-center gap-6">
            <p className="text-white/70 text-xs tracking-widest uppercase font-light">
                {isTree ? "Signature Tree Form" : "Scattered Elements"}
            </p>
            
            <button
                onClick={onToggle}
                className={`
                    group relative px-12 py-4
                    border border-[#D4AF37] 
                    overflow-hidden transition-all duration-500 ease-out
                    hover:bg-[#D4AF37]/20
                    backdrop-blur-sm
                    cursor-pointer
                `}
            >
                {/* Decorative Borders */}
                <div className="absolute top-0 left-0 w-[1px] h-full bg-[#D4AF37] transition-all duration-300 group-hover:h-0" />
                <div className="absolute bottom-0 right-0 w-[1px] h-full bg-[#D4AF37] transition-all duration-300 group-hover:h-0" />
                
                <span className="relative z-10 font-serif text-white tracking-[0.2em] text-sm group-hover:text-[#FFD700] transition-colors">
                    {isTree ? "SCATTER" : "ASSEMBLE"}
                </span>
                
                {/* Shine Animation */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
            </button>
        </div>
      </footer>
    </div>
  );
};
