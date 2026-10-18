/**
 * ULTIMATETRON — Gated Pipeline Modules (Phases 4 & 5)
 * Google Flow Prompt Studio & Thumbnail Studio
 * Connected directly to upstream Script Engine approval gate.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Eye,
  Clock,
  FileText
} from 'lucide-react';
import { ProjectConfig, SourceStory, NavigationTab, ScriptRecord } from '../types';
import { storageService } from '../services/storage';

interface WorkflowViewProps {
  activeProject: ProjectConfig | null;
  sources: SourceStory[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenProjectModal: () => void;
}

export const FlowStudioView: React.FC<WorkflowViewProps> = ({
  activeProject,
  sources,
  onNavigate,
  onOpenProjectModal,
}) => {
  const [approvedScript, setApprovedScript] = useState<ScriptRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkApprovedScript() {
      if (!activeProject) {
        setApprovedScript(null);
        return;
      }
      setLoading(true);
      try {
        const scripts = await storageService.getScriptsByProjectId(activeProject.id);
        const approved = scripts.find((s) => s.isApproved) || null;
        setApprovedScript(approved);
      } catch (err) {
        console.error('Failed to check approved scripts:', err);
      } finally {
        setLoading(false);
      }
    }
    checkApprovedScript();
  }, [activeProject?.id]);

  const linkedSource = activeProject
    ? sources.find((s) => s.id === activeProject.sourceStoryId)
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="pb-4 border-b border-[#1A1D27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
            Pipeline Stage 3 · Prompt Studio
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            Google Flow Prompt Studio
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Scene-by-scene video generation prompts with cross-clip visual, vocal, and audio continuity profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#9298A5]">UPSTREAM GATE:</span>
          {approvedScript ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-sm font-semibold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Script v{approvedScript.version} Approved</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-sm font-semibold uppercase">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Awaiting Script Approval</span>
            </span>
          )}
        </div>
      </div>

      {/* Upstream Gate Status Banner */}
      {!activeProject ? (
        <div className="p-8 bg-[#0A0D15] border border-amber-600/40 rounded-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No Project Loaded</div>
          <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
            Please select or initialize a project with a linked source story.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-4 py-2 text-xs font-semibold uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm"
          >
            Initialize Project Now
          </button>
        </div>
      ) : approvedScript ? (
        <div className="p-5 bg-[#06140D] border border-emerald-500/40 rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white font-mono">
                  Upstream Approval Gate Cleared — {approvedScript.id} (v{approvedScript.version})
                </div>
                <div className="text-xs text-emerald-300 font-mono">
                  Approved by {approvedScript.approvedBy || 'Production Lead'} on {new Date(approvedScript.approvalTimestamp!).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('scripts')}
              className="px-3 py-1.5 text-xs font-mono uppercase text-emerald-300 hover:text-white bg-emerald-950/50 border border-emerald-500/40 rounded-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Script</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-emerald-900/40">
            <div>
              <span className="text-[#9298A5]">Aspect Ratio:</span>{' '}
              <strong className="text-white">{approvedScript.projectSnapshot.aspectRatio}</strong>
            </div>
            <div>
              <span className="text-[#9298A5]">Runtime:</span>{' '}
              <strong className="text-white">{approvedScript.projectSnapshot.duration}s</strong>
            </div>
            <div>
              <span className="text-[#9298A5]">Scene Count:</span>{' '}
              <strong className="text-white">{approvedScript.sections.length} clips</strong>
            </div>
            <div>
              <span className="text-[#9298A5]">Visual Style:</span>{' '}
              <strong className="text-white">{approvedScript.projectSnapshot.visualStyle}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[#0A0D15] border border-[#1A2030] rounded-sm flex items-start gap-4">
          <Lock className="w-6 h-6 text-[#FF1738] shrink-0 mt-1" />
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">
              Upstream Approval Gate Active
            </div>
            <p className="text-xs text-[#A0A5B3] leading-relaxed">
              Per the ULTIMATETRON blueprint, Google Flow prompts cannot be generated until a script draft is approved in the AI Script Engine.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('scripts')}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Open AI Script Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approved Scenes Ready for Prompt Engine */}
      {approvedScript && (
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-[#9298A5] flex items-center justify-between">
            <span>Approved Scenes Ingested for Flow Studio</span>
            <span>{approvedScript.sections.length} Scene Units</span>
          </div>

          <div className="space-y-2">
            {approvedScript.sections.map((sec) => (
              <div
                key={sec.id}
                className="p-3 bg-[#08090E] border border-[#171A24] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#FF1738] font-bold">{sec.id}</span>
                  <span className="text-white font-semibold">{sec.purpose}</span>
                  <span className="text-[#9298A5]">({sec.startTime}s - {sec.endTime}s)</span>
                </div>
                <div className="text-[11px] text-[#A0A5B3] italic line-clamp-1 max-w-md">
                  &ldquo;{sec.narration}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Specification Architecture */}
      <div className="bg-[#08090E] border border-[#171A24] rounded-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF1738]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Independent Scene Prompt Invariants
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#0B0D14] border border-[#161A26] rounded-sm">
            <div className="text-[#FF1738] font-bold">1. Visual Continuity</div>
            <div className="text-[#A0A5B3] mt-1 text-[11px] leading-relaxed">
              Preserves camera language, lens focal length, color grading, and lighting environment across all scene prompts.
            </div>
          </div>

          <div className="p-3 bg-[#0B0D14] border border-[#161A26] rounded-sm">
            <div className="text-[#FF1738] font-bold">2. Vocal & Audio Spec</div>
            <div className="text-[#A0A5B3] mt-1 text-[11px] leading-relaxed">
              Provides pacing instructions, pronunciation cues for non-English names, tone modulation, and ambient sound bed.
            </div>
          </div>

          <div className="p-3 bg-[#0B0D14] border border-[#161A26] rounded-sm">
            <div className="text-[#FF1738] font-bold">3. Negative Safeguards</div>
            <div className="text-[#A0A5B3] mt-1 text-[11px] leading-relaxed">
              Strict bans against fake readable gibberish text, unintended commercial logos, and distorted anatomy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ThumbnailStudioView: React.FC<WorkflowViewProps> = ({
  activeProject,
  onNavigate,
  onOpenProjectModal,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="pb-4 border-b border-[#1A1D27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
            Pipeline Stage 4 · Thumbnail Studio
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            Thumbnail Studio Architecture
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Dual distinct visual concept generation: high-CTR composition, focal contrast, and factual headline typography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#9298A5]">STATUS:</span>
          <span className="text-xs font-mono text-amber-500 font-semibold uppercase">
            Awaiting Stage 4 Authorization
          </span>
        </div>
      </div>

      <div className="p-6 bg-[#0A0D15] border border-[#1A2030] rounded-sm flex items-start gap-4">
        <ImageIcon className="w-6 h-6 text-[#FF1738] shrink-0 mt-1" />
        <div className="space-y-2">
          <div className="text-sm font-semibold text-white">
            Dual Thumbnail Concept Engine
          </div>
          <p className="text-xs text-[#A0A5B3] leading-relaxed">
            Generates two radically different artistic directions (e.g. Cinematic Macro Subject vs Wide Dramatic Environmental Horizon) with safe margins and headline copy, matching the project aspect ratio (9:16 or 16:9).
          </p>
        </div>
      </div>
    </div>
  );
};
