/**
 * ULTIMATETRON — Top Bar
 * Adheres strictly to the Top Bar Contract:
 * Zone 1: Single text wordmark with official emblem
 * Zone 2: 4-5 concise single-line nav links
 * Zone 3: 1 primary action
 */

import React from 'react';
import { NavigationTab } from '../types';
import { BrandLogo } from './BrandLogo';

interface TopBarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewSourceModal: () => void;
  selectedStoryTitle?: string;
  onReplayBoot?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewSourceModal,
}) => {
  const navItems: Array<{ id: NavigationTab; label: string }> = [
    { id: 'dashboard', label: 'Command Center' },
    { id: 'sources', label: 'Source Library' },
    { id: 'scripts', label: 'Script Engine' },
    { id: 'flow_prompts', label: 'Google Flow' },
    { id: 'thumbnails', label: 'Thumbnails' },
    { id: 'production', label: 'Production' },
    { id: 'history', label: 'Project History' },
    { id: 'settings', label: 'Diagnostics' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#050507]/90 backdrop-blur-md border-b border-[#1A1D27] flex items-center justify-between gap-8 px-6">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <BrandLogo
          size="sm"
          showDescriptor={true}
          onClick={() => onSelectTab('dashboard')}
          className="cursor-pointer hover:opacity-95 transition-opacity"
        />
      </div>

      {/* Zone 2: Single-line Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase whitespace-nowrap shrink-0 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF1738] ${
                isActive
                  ? 'text-[#F4F5FA] bg-[#141722] border-b-2 border-[#FF1738]'
                  : 'text-[#A0A5B3] hover:text-[#F4F5FA] hover:bg-[#0B0C11]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenNewSourceModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] active:bg-[#D90F2D] rounded-sm shadow-[0_0_14px_rgba(255,23,56,0.3)] transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1738]"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>New Source Story</span>
        </button>
      </div>
    </header>
  );
};
