/**
 * ULTIMATETRON — Futuristic Sidebar Navigation
 * Desktop navigation rail with real project context and storage status.
 */

import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Sparkles,
  Image as ImageIcon,
  History,
  Sliders,
  Database,
  PlayCircle,
  Package
} from 'lucide-react';
import { NavigationTab, ProjectConfig } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeProject?: ProjectConfig | null;
  sourceCount: number;
  projectCount: number;
  storageDriver: string;
  onOpenProjectModal: () => void;
  onRunDiagnostics: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeProject,
  sourceCount,
  projectCount,
  storageDriver,
  onOpenProjectModal,
  onRunDiagnostics,
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    phase?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Command Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'sources',
      label: 'Source Story Library',
      icon: <BookOpen className="w-4 h-4" />,
      badgeCount: sourceCount,
    },
    {
      id: 'scripts',
      label: 'Script Engine',
      icon: <FileText className="w-4 h-4" />,
      phase: 'Phase 3',
    },
    {
      id: 'flow_prompts',
      label: 'Flow Prompt Studio',
      icon: <Sparkles className="w-4 h-4" />,
      phase: 'Phase 4',
    },
    {
      id: 'thumbnails',
      label: 'Thumbnail Studio',
      icon: <ImageIcon className="w-4 h-4" />,
      phase: 'Phase 5',
    },
    {
      id: 'production',
      label: 'Production Workspace',
      icon: <Package className="w-4 h-4" />,
      phase: 'Phase 6',
    },
    {
      id: 'history',
      label: 'Project History',
      icon: <History className="w-4 h-4" />,
      badgeCount: projectCount,
    },
    {
      id: 'settings',
      label: 'System & Diagnostics',
      icon: <Sliders className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#07080C] border-r border-[#161922] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6">
        {/* Active Context Card */}
        <div className="p-3 bg-[#0B0D14] border border-[#1A1E2B] rounded-sm">
          <div className="flex items-center justify-between text-[11px] text-[#A0A5B3]">
            <span className="font-mono tracking-wider uppercase">Active Context</span>
            <span className="text-[#FF1738] font-mono text-[10px] font-semibold">
              {activeProject ? activeProject.status.replace('_', ' ').toUpperCase() : 'NO PROJECT'}
            </span>
          </div>

          {activeProject ? (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-semibold text-[#F4F5FA] truncate">
                {activeProject.name}
              </div>
              <div className="text-[11px] font-mono text-[#9298A5] flex items-center gap-1.5">
                <span>{activeProject.id}</span>
                <span aria-hidden="true">·</span>
                <span>{activeProject.aspectRatio}</span>
                <span aria-hidden="true">·</span>
                <span>{activeProject.duration}s</span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#9298A5]">
              No active project loaded.
              <button
                onClick={onOpenProjectModal}
                className="mt-2 w-full text-left text-[11px] font-mono text-[#FF1738] hover:text-[#FF3048] flex items-center gap-1"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Initialize Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono tracking-widest text-[#9298A5] uppercase mb-2">
            Workspace Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-sm transition-all text-left ${
                  isActive
                    ? 'text-white bg-[#121520] border-l-2 border-[#FF1738] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-[#A0A5B3] hover:text-[#F4F5FA] hover:bg-[#0B0D14]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-[#FF1738]' : 'text-[#9298A5]'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badgeCount !== undefined ? (
                  <span className="text-[11px] font-mono text-[#9298A5] tabular-nums">
                    {item.badgeCount}
                  </span>
                ) : item.phase ? (
                  <span className="text-[10px] font-mono text-[#9298A5]/60 tracking-wider uppercase">
                    {item.phase}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Diagnostic Panel */}
      <div className="p-4 border-t border-[#161922] bg-[#050609]">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9298A5]">
          <div className="flex items-center gap-1.5 truncate">
            <Database className="w-3.5 h-3.5 text-[#FF1738]" />
            <span className="truncate">{storageDriver}</span>
          </div>
          <button
            onClick={onRunDiagnostics}
            className="text-[10px] text-[#A0A5B3] hover:text-[#FF1738] uppercase tracking-wider underline cursor-pointer"
          >
            Diagnostics
          </button>
        </div>
        <div className="mt-1 text-[10px] text-[#9298A5]/70 font-mono">
          Strict Monotonic Engine · Zero Loss
        </div>
      </div>
    </aside>
  );
};
