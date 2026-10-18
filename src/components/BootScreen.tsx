/**
 * ULTIMATETRON — Boot Screen Sequence
 * Cinematic initialization environment with volumetric crimson depth
 * and central Infinity Emblem visualization.
 */

import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { ArrowRight, Sparkles } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setBootStep(1), 500);
    const t2 = setTimeout(() => setBootStep(2), 1200);
    const t3 = setTimeout(() => setBootStep(3), 2000);
    const t4 = setTimeout(() => setBootStep(4), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#050507] flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background radial crimson depth aura */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,23,56,0.18),transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Volumetric background ring lattices */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full border border-[#FF1738]/10 animate-spin pointer-events-none"
        style={{ animationDuration: '60s' }}
        aria-hidden="true"
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full border border-[#FF1738]/15 animate-spin pointer-events-none"
        style={{ animationDuration: '40s', animationDirection: 'reverse' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-8">
        {/* Central Official Infinity Emblem with layered volumetric glow */}
        <div className="relative flex items-center justify-center">
          <BrandLogo size="hero" withHalo={true} />
        </div>

        {/* Brand Title & Descriptor */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-[#F4F5FA] font-sans">
            ULTIMATETRON
          </h1>
          <div className="text-xs font-mono tracking-[0.3em] text-[#FF1738] uppercase font-bold">
            Infinite Intelligence · Command Center
          </div>
        </div>

        {/* System Diagnostics checklist during boot */}
        <div className="w-full max-w-xs space-y-1.5 font-mono text-[11px] text-left border-y border-[#1C202C] py-3 text-[#A0A5B3]">
          <div className="flex items-center justify-between">
            <span>Storage Driver: IndexedDB</span>
            <span className={bootStep >= 1 ? 'text-emerald-400' : 'text-neutral-600'}>
              {bootStep >= 1 ? 'OK' : '...'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Monotonic Story ID Vault</span>
            <span className={bootStep >= 2 ? 'text-emerald-400' : 'text-neutral-600'}>
              {bootStep >= 2 ? 'ACTIVE' : '...'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Verbatim Source Preservation</span>
            <span className={bootStep >= 3 ? 'text-emerald-400' : 'text-neutral-600'}>
              {bootStep >= 3 ? '100% INTACT' : '...'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Production Matrix Engine</span>
            <span className={bootStep >= 4 ? 'text-[#FF1738]' : 'text-neutral-600'}>
              {bootStep >= 4 ? 'ONLINE' : '...'}
            </span>
          </div>
        </div>

        {/* Enter Action */}
        <div className="flex items-center gap-4">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] active:bg-[#D90F2D] rounded-sm shadow-[0_0_24px_rgba(255,23,56,0.4)] transition-all cursor-pointer"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
