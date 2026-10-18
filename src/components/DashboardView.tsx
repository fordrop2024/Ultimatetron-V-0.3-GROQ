/**
 * ULTIMATETRON — Command Dashboard
 * Central command environment displaying the official brand emblem,
 * real production pipeline counts, quick project initialization,
 * and high-fidelity recent records.
 */

import React from 'react';
import {
  Plus,
  PlayCircle,
  FileCheck,
  Clock,
  Layers,
  ChevronRight,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package
} from 'lucide-react';
import { SourceStory, ProjectConfig, NavigationTab } from '../types';
import { BrandLogo } from './BrandLogo';

interface DashboardViewProps {
  sources: SourceStory[];
  projects: ProjectConfig[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewSourceModal: () => void;
  onOpenProjectModal: (sourceId?: string) => void;
  onSelectSource: (story: SourceStory) => void;
  onSelectProject: (project: ProjectConfig) => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sources,
  projects,
  onNavigate,
  onOpenNewSourceModal,
  onOpenProjectModal,
  onSelectSource,
  onSelectProject,
  onSeedDemo,
  isSeeding,
}) => {
  const approvedProjects = projects.filter((p) => p.status === 'approved').length;
  const draftProjects = projects.filter((p) => p.status === 'draft' || p.status === 'not_started').length;
  const reviewProjects = projects.filter((p) => p.status === 'needs_review').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Command Banner */}
      <div className="relative rounded-sm bg-gradient-to-r from-[#0C0E16] via-[#08090E] to-[#050507] border border-[#1A1E2B] p-8 overflow-hidden">
        {/* Holographic background ambient grid */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,23,56,0.12),transparent_60%)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start sm:items-center gap-6">
            {/* Central Animated Infinity Emblem */}
            <div className="shrink-0">
              <BrandLogo size="hero" withHalo={true} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
                  System Online · Infinity Engine Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F5FA] font-sans">
                ULTIMATETRON COMMAND
              </h1>
              <p className="text-sm text-[#A0A5B3] max-w-xl leading-relaxed">
                Next-generation YouTube content production engine. Strict source fidelity,
                algorithmic pacing, and unified continuity profiles.
              </p>
            </div>
          </div>

          {/* Primary Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenProjectModal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] active:bg-[#D90F2D] rounded-sm shadow-[0_0_20px_rgba(255,23,56,0.35)] transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF1738]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Initialize Project</span>
            </button>

            <button
              onClick={onOpenNewSourceModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-[#F4F5FA] bg-[#121520] hover:bg-[#1A1F2E] border border-[#23293D] rounded-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FF1738]" />
              <span>Add Source Story</span>
            </button>

            <button
              onClick={() => onNavigate('production')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-[#A0A5B3] hover:text-white bg-[#0A0C13] hover:bg-[#131622] border border-[#1A1E2C] rounded-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#00E5FF]" />
              <span>Production Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Pipeline Statistics (Zero-Pill, Tabular Numbers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#090A10] border border-[#161922] rounded-sm">
          <div className="text-[11px] font-mono text-[#9298A5] uppercase tracking-wider flex items-center justify-between">
            <span>Source Stories</span>
            <Layers className="w-3.5 h-3.5 text-[#FF1738]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#F4F5FA] tabular-nums">
            {sources.length}
          </div>
          <div className="mt-1 text-[11px] text-[#A0A5B3]">
            {sources.length === 1 ? '1 preserved record' : `${sources.length} preserved records`}
          </div>
        </div>

        <div className="p-4 bg-[#090A10] border border-[#161922] rounded-sm">
          <div className="text-[11px] font-mono text-[#9298A5] uppercase tracking-wider flex items-center justify-between">
            <span>Drafts & Queued</span>
            <Clock className="w-3.5 h-3.5 text-[#9298A5]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#F4F5FA] tabular-nums">
            {draftProjects}
          </div>
          <div className="mt-1 text-[11px] text-[#A0A5B3]">
            Pending script or configuration
          </div>
        </div>

        <div className="p-4 bg-[#090A10] border border-[#161922] rounded-sm">
          <div className="text-[11px] font-mono text-[#9298A5] uppercase tracking-wider flex items-center justify-between">
            <span>In Review</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#F4F5FA] tabular-nums">
            {reviewProjects}
          </div>
          <div className="mt-1 text-[11px] text-[#A0A5B3]">
            Awaiting gate approval
          </div>
        </div>

        <div className="p-4 bg-[#090A10] border border-[#161922] rounded-sm">
          <div className="text-[11px] font-mono text-[#9298A5] uppercase tracking-wider flex items-center justify-between">
            <span>Approved Output</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#F4F5FA] tabular-nums">
            {approvedProjects}
          </div>
          <div className="mt-1 text-[11px] text-[#A0A5B3]">
            Ready for prompt generation
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Sources & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Story Library Quick View */}
        <div className="p-6 bg-[#08090E] border border-[#171A24] rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#171A24]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF1738]" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-[#F4F5FA]">
                  Source Story Library
                </h2>
              </div>
              <button
                onClick={() => onNavigate('sources')}
                className="text-xs text-[#FF1738] hover:text-[#FF3048] flex items-center gap-1 font-mono uppercase tracking-wider"
              >
                <span>View All ({sources.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sources.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#10121C] border border-[#1E2333] flex items-center justify-center text-[#9298A5]">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#F4F5FA]">
                    Source Library is Empty
                  </div>
                  <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
                    Add your first original news brief, research paper, or story to start the ULTIMATETRON pipeline.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onOpenNewSourceModal}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm"
                  >
                    Add Source Story
                  </button>
                  <button
                    onClick={onSeedDemo}
                    disabled={isSeeding}
                    className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#A0A5B3] hover:text-white bg-[#121520] border border-[#22283A] rounded-sm"
                  >
                    {isSeeding ? 'Seeding...' : 'Load Demo Voyager Brief'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#131620] mt-2">
                {sources.slice(0, 5).map((story) => (
                  <div
                    key={story.id}
                    onClick={() => onSelectSource(story)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-[#0D0F17] rounded-sm cursor-pointer transition-colors group"
                  >
                    <div className="space-y-1 pr-4 truncate">
                      <div className="flex items-center gap-2 text-[11px] text-[#A0A5B3]">
                        <span className="font-mono text-[#FF1738] font-semibold">
                          {story.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">v{story.version}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{story.wordCount} words</span>
                      </div>
                      <div className="text-xs font-medium text-[#F4F5FA] group-hover:text-white truncate">
                        {story.title}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9298A5] group-hover:text-[#FF1738] transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#171A24] flex items-center justify-between text-[11px] text-[#9298A5]">
            <span className="font-mono">Verbatim Persistence Guaranteed</span>
            <button
              onClick={onOpenNewSourceModal}
              className="text-[#FF1738] hover:underline uppercase tracking-wider font-mono"
            >
              + Add Story
            </button>
          </div>
        </div>

        {/* Project History & Active Pipeline */}
        <div className="p-6 bg-[#08090E] border border-[#171A24] rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#171A24]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#FF1738]" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-[#F4F5FA]">
                  Active Projects
                </h2>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-[#FF1738] hover:text-[#FF3048] flex items-center gap-1 font-mono uppercase tracking-wider"
              >
                <span>All Projects ({projects.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#10121C] border border-[#1E2333] flex items-center justify-center text-[#9298A5]">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#F4F5FA]">
                    No Projects Initialized
                  </div>
                  <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
                    Configure your first project with duration rules, aspect ratio, content mode, and tone.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onOpenProjectModal()}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm"
                  >
                    Initialize First Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#131620] mt-2">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-[#0D0F17] rounded-sm cursor-pointer transition-colors group"
                  >
                    <div className="space-y-1 pr-4 truncate">
                      <div className="flex items-center gap-2 text-[11px] text-[#A0A5B3]">
                        <span className="font-mono text-[#F4F5FA] font-semibold">
                          {project.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{project.aspectRatio}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{project.duration}s</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#FF1738] font-mono text-[10px] uppercase font-semibold">
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#F4F5FA] group-hover:text-white truncate">
                        {project.name}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9298A5] group-hover:text-[#FF1738] transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#171A24] flex items-center justify-between text-[11px] text-[#9298A5]">
            <span className="font-mono">Shorts (8s Clips) & 4m+ Long-Form Rules</span>
            <button
              onClick={() => onOpenProjectModal()}
              className="text-[#FF1738] hover:underline uppercase tracking-wider font-mono"
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      {/* Storage & Architecture Guarantee Strip */}
      <div className="p-4 bg-[#07080C] border border-[#161922] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-[#9298A5]">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-[#FF1738] shrink-0" />
          <div>
            <span className="text-[#F4F5FA] font-medium">Local High-Reliability Storage</span>
            <span className="mx-2 text-[#9298A5]/40">|</span>
            <span>Zero cloud loss, verbatim line-break preservation, non-reusable IDs</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>RATIO 9:16 (24s / 32s / 40s / 48s)</span>
          <span aria-hidden="true">·</span>
          <span>RATIO 16:9 (&ge; 240s)</span>
        </div>
      </div>
    </div>
  );
};
