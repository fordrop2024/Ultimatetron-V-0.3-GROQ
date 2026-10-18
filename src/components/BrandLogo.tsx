/**
 * ULTIMATETRON — Official Brand Logo & Infinity Energy Emblem
 * Integrates the official crimson-red infinity emblem with surrounding halo effects.
 * Conforms to strict branding guidelines:
 * - Preserves original proportions and silhouette
 * - Never distorts, replaces, or recolors the asset
 * - Surrounding animations are separate layered halos and light sweeps
 * - Clean, non-intrusive fallback placeholder if asset cannot be loaded
 */

import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showDescriptor?: boolean;
  withHalo?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showDescriptor = false,
  withHalo = true,
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [customSrc, setCustomSrc] = useState<string | null>(null);

  useEffect(() => {
    const custom = storageService.getCustomEmblem();
    if (custom) {
      setCustomSrc(custom);
    }
  }, []);

  // Preferred asset paths to check
  const candidateUrls = customSrc
    ? [customSrc]
    : [
        '/Crimson Infinity Energy Emblem.png',
        '/assets/Crimson Infinity Energy Emblem.png',
        '/emblem.png',
        '/assets/emblem.png',
      ];

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const handleImageError = () => {
    if (currentUrlIndex < candidateUrls.length - 1) {
      setCurrentUrlIndex((prev) => prev + 1);
    } else {
      setImageError(true);
    }
  };

  const sizeDimensions = {
    xs: { width: 28, height: 28, text: 'text-sm' },
    sm: { width: 36, height: 36, text: 'text-base' },
    md: { width: 48, height: 48, text: 'text-lg' },
    lg: { width: 80, height: 80, text: 'text-2xl' },
    hero: { width: 140, height: 140, text: 'text-4xl' },
  };

  const dim = sizeDimensions[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: `${dim.width}px`, height: `${dim.height}px` }}
      >
        {/* Outer subtle halo ring */}
        {withHalo && (
          <div
            className="absolute inset-0 rounded-full bg-[#FF1738]/15 blur-md animate-pulse pointer-events-none"
            style={{ transform: 'scale(1.25)' }}
            aria-hidden="true"
          />
        )}

        {/* Energy orbital ring */}
        {withHalo && (size === 'lg' || size === 'hero') && (
          <div
            className="absolute inset-[-8px] rounded-full border border-[#FF1738]/25 pointer-events-none animate-spin"
            style={{ animationDuration: '24s' }}
            aria-hidden="true"
          />
        )}

        {/* Primary Image Asset */}
        {!imageError ? (
          <img
            src={candidateUrls[currentUrlIndex]}
            alt="ULTIMATETRON Official Crimson Infinity Emblem"
            className="w-full h-full object-contain relative z-10 transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Official clean fallback placeholder when asset is not loaded in sandbox */
          <div
            className="w-full h-full rounded-full bg-[#0B0C11] border border-[#FF1738]/40 flex flex-col items-center justify-center relative z-10 p-1 group shadow-[0_0_12px_rgba(255,23,56,0.25)]"
            title="Official Emblem: Place 'Crimson Infinity Energy Emblem.png' in public folder or upload in Settings"
          >
            {/* Geometric infinity fallback silhouette */}
            <svg
              viewBox="0 0 100 60"
              className="w-4/5 h-4/5 text-[#FF1738] filter drop-shadow-[0_0_4px_#FF1738]"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 28 30 C 12 30 12 48 28 48 C 42 48 58 12 72 12 C 88 12 88 30 72 30 C 58 30 42 48 28 48 C 12 48 12 30 28 30 C 42 30 58 12 72 12 C 88 12 88 30 72 30" />
            </svg>
            <span className="sr-only">ULTIMATETRON Infinity Emblem Placeholder</span>
          </div>
        )}
      </div>

      {showDescriptor && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span
              className={`font-extrabold tracking-wider text-[#F4F5FA] font-sans ${dim.text} leading-none`}
            >
              ULTIMATETRON
            </span>
          </div>
          <span className="text-[10px] tracking-[0.25em] text-[#FF1738] font-mono uppercase mt-1 leading-none font-semibold">
            Infinite Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
