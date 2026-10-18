/**
 * ULTIMATETRON — Project History & Output Registry
 * Comprehensive lifecycle view of all created projects,
 * workflow statuses, settings invariants, and JSON exports.
 */

import React, { useState } from 'react';
import {
  History,
  PlayCircle,
  Download,
  Trash2,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Edit3,
  Sliders
} from 'lucide-react';
import { ProjectConfig, SourceStory, WorkflowStatus, NavigationTab } from '../types';

interface ProjectHistoryViewProps {
  projects: ProjectConfig[];
  sources: SourceStory[];
  onOpenProjectModal: () => void;
  onEditProject: (project: ProjectConfig) => void;
  onSelectProject: (project: ProjectConfig) => void;
  onUpdateProjectStatus: (id: string, status: WorkflowStatus) => void;
  onDeleteProject: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ProjectHistoryView: React.FC<ProjectHistoryViewProps> = ({
  projects,
  sources,
  onOpenProjectModal,
  onEditProject,
  onSelectProject,
  onUpdateProjectStatus,
  onDeleteProject,
  onNavigate,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  const linkedSource = activeProject
    ? sources.find((s) => s.id === activeProject.sourceStoryId)
    : null;

  const exportProjectJson = (project: ProjectConfig) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.id}_${project.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Production Lifecycle
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            Project History & State Registry
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Tracks configuration snapshots, approval progression, and links to immutable source records.
          </p>
        </div>

        <button
          onClick={onOpenProjectModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm transition-all shadow-[0_0_12px_rgba(255,23,56,0.25)] cursor-pointer"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-16 bg-[#08090E] border border-[#161922] rounded-sm text-center space-y-4">
          <History className="w-10 h-10 text-[#9298A5] mx-auto opacity-50" />
          <div className="text-base font-medium text-[#F4F5FA]">
            No Production Projects Initialized
          </div>
          <p className="text-xs text-[#A0A5B3] max-w-md mx-auto">
            Projects link an approved source story to canonical duration rules, content mode, tone, and visual style.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm inline-flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Initialize Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Projects List Column */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9298A5] px-1 font-mono">
              <span>{projects.length} Total Projects</span>
              <span>Sorted by Creation</span>
            </div>

            <div className="space-y-2">
              {projects.map((project) => {
                const isSelected = activeProject?.id === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      onSelectProject(project);
                    }}
                    className={`p-4 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#10131D] border-[#FF1738] shadow-[0_0_12px_rgba(255,23,56,0.15)]'
                        : 'bg-[#090A10] border-[#161922] hover:bg-[#0D0F16] hover:border-[#222838]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#FF1738]">
                        {project.id}
                      </span>
                      <span className="font-mono text-[11px] uppercase font-semibold text-[#A0A5B3]">
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-2 text-sm font-semibold text-[#F4F5FA] line-clamp-1">
                      {project.name}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-[#9298A5]">
                      <span>{project.aspectRatio}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{project.duration}s</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.contentMode}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Details Panel */}
          {activeProject && (
            <div className="lg:col-span-7 bg-[#08090E] border border-[#1A1E2B] rounded-sm p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#171A24]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#FF1738] font-bold">{activeProject.id}</span>
                    <span className="text-[#9298A5]">·</span>
                    <span className="text-[#A0A5B3]">
                      Created {new Date(activeProject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#F4F5FA] font-sans mt-1">
                    {activeProject.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditProject(activeProject)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm transition-all shadow-[0_0_10px_rgba(255,23,56,0.25)] cursor-pointer"
                    title="Reopen and edit canonical project settings"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Settings</span>
                  </button>

                  <button
                    onClick={() => exportProjectJson(activeProject)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121520] hover:bg-[#1A1F2E] border border-[#22283A] rounded-sm"
                    title="Export Project JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={() => onDeleteProject(activeProject.id)}
                    className="p-1.5 text-[#9298A5] hover:text-[#FF1738] bg-[#10121C] border border-[#22283A] rounded-sm cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Workflow Progression Selector */}
              <div className="p-4 bg-[#0A0C13] border border-[#181C2A] rounded-sm space-y-3">
                <div className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold flex items-center justify-between">
                  <span>Workflow Status</span>
                  <span className="text-[#FF1738]">{activeProject.status.replace('_', ' ').toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
                  {(
                    [
                      'not_started',
                      'draft',
                      'needs_review',
                      'approved',
                      'ready_for_export',
                    ] as WorkflowStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateProjectStatus(activeProject.id, st)}
                      className={`p-2 rounded-sm border uppercase text-center transition-all ${
                        activeProject.status === st
                          ? 'bg-[#FF1738] text-white border-[#FF1738] font-bold shadow-[0_0_8px_rgba(255,23,56,0.3)]'
                          : 'bg-[#08090E] border-[#1A1F2C] text-[#9298A5] hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canonical Settings Invariants Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Aspect Ratio</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {activeProject.aspectRatio}
                  </div>
                  <div className="text-[10px] text-[#9298A5] mt-0.5">
                    {activeProject.aspectRatio === '9:16' ? 'Shorts / Reels' : 'Long-Form Video'}
                  </div>
                </div>

                <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Duration</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {activeProject.duration}s
                  </div>
                  <div className="text-[10px] text-[#9298A5] mt-0.5">
                    {activeProject.aspectRatio === '9:16'
                      ? `${activeProject.clipCount || Math.round(activeProject.duration / 8)} clips @ 8s target`
                      : `${Math.floor(activeProject.duration / 60)}m ${activeProject.duration % 60}s narrative`}
                  </div>
                </div>

                <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Language</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {activeProject.language}
                  </div>
                  <div className="text-[10px] text-[#9298A5] mt-0.5">Narration standard</div>
                </div>

                <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Content Mode</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {activeProject.contentMode}
                  </div>
                  <div className="text-[10px] text-[#9298A5] mt-0.5">Narrative structure</div>
                </div>

                <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Tone</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {activeProject.tone}
                  </div>
                  <div className="text-[10px] text-[#9298A5] mt-0.5">Vocal modulation</div>
                </div>

                <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Visual Style</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {activeProject.visualStyle}
                  </div>
                  <div className="text-[10px] text-[#9298A5] mt-0.5">Prompt aesthetic</div>
                </div>
              </div>

              {/* Linked Source Story Card */}
              <div className="p-4 bg-[#0A0C13] border border-[#181C2A] rounded-sm space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#9298A5] flex items-center justify-between">
                  <span>Linked Source Story</span>
                  <span className="text-[#FF1738] font-bold">{activeProject.sourceStoryId} (v{activeProject.sourceVersion})</span>
                </div>
                {linkedSource ? (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white">
                      {linkedSource.title}
                    </div>
                    <p className="text-xs text-[#A0A5B3] line-clamp-2 leading-relaxed">
                      {linkedSource.content}
                    </p>
                    <div className="pt-1 flex items-center gap-3 text-[10px] font-mono text-[#9298A5]">
                      <span>{linkedSource.wordCount} words</span>
                      <span aria-hidden="true">·</span>
                      <span>{linkedSource.charCount} chars</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#9298A5]">
                    Source record {activeProject.sourceStoryId} has been archived.
                  </div>
                )}
              </div>

              {/* Next Step Router */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('sources')}
                  className="text-xs font-mono text-[#9298A5] hover:text-white uppercase"
                >
                  &larr; Return to Library
                </button>

                <button
                  onClick={() => onNavigate('scripts')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_10px_rgba(255,23,56,0.3)] transition-all"
                >
                  <span>Proceed to Script Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
