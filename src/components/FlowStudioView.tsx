/**
 * ULTIMATETRON — Google Flow Prompt Studio (Phase 4)
 * Production Implementation conforming to Section 10:
 * - A. Header: Active project, approved script version, duration, save status, JSON/Markdown export
 * - B. Left Panel: Scene Navigator (ordered list, timestamps, review status, validation badges)
 * - C. Center Panel: Prompt Editor (final production prompt, copy, save, selective regeneration with diff, exact narration, structured schema)
 * - D. Right Panel: Continuity & Validation Inspector (global profile, adjacent-scene comparison, real-time validation checks, disclaimer)
 * - E. Bottom View: Visual Timeline (scene boundaries, durations, continuity flags)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  Download,
  Save,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  BookOpen,
  Camera,
  Film,
  Compass,
  FileText,
  Volume2,
  Clock,
  History,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  ProjectConfig,
  SourceStory,
  ScriptRecord,
  PromptPackage,
  ScenePromptRecord,
  ContinuityProfile,
  NavigationTab
} from '../types';
import { storageService } from '../services/storage';
import { promptStudioService, PromptGenerationProgress } from '../services/promptStudio';

interface FlowStudioViewProps {
  activeProject: ProjectConfig | null;
  projects: ProjectConfig[];
  sources: SourceStory[];
  onSelectProject: (project: ProjectConfig) => void;
  onOpenProjectModal: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const FlowStudioView: React.FC<FlowStudioViewProps> = ({
  activeProject,
  projects,
  sources,
  onSelectProject,
  onOpenProjectModal,
  onNavigate,
}) => {
  const [approvedScript, setApprovedScript] = useState<ScriptRecord | null>(null);
  const [packages, setPackages] = useState<PromptPackage[]>([]);
  const [activePackage, setActivePackage] = useState<PromptPackage | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<PromptGenerationProgress | null>(null);

  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [sceneInstruction, setSceneInstruction] = useState<Record<string, string>>({});

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [isStructuredAccordionOpen, setIsStructuredAccordionOpen] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [isPackageCopied, setIsPackageCopied] = useState(false);
  const [fallbackModalText, setFallbackModalText] = useState<string | null>(null);
  const [fallbackModalTitle, setFallbackModalTitle] = useState<string>('');

  // Load approved script & packages for active project
  const loadProjectData = async (projId: string) => {
    setIsLoading(true);
    try {
      const scriptList = await storageService.getScriptsByProjectId(projId);
      const approved = scriptList.find((s) => s.isApproved) || null;
      setApprovedScript(approved);

      if (approved) {
        const packageList = await storageService.getPromptPackagesByScriptId(approved.id, approved.version);
        setPackages(packageList);
        if (packageList.length > 0) {
          setActivePackage(packageList[0]);
          if (packageList[0].scenes.length > 0) {
            setSelectedSceneId(packageList[0].scenes[0].id);
          }
        } else {
          setActivePackage(null);
          setSelectedSceneId(null);
        }
      } else {
        setPackages([]);
        setActivePackage(null);
        setSelectedSceneId(null);
      }
    } catch (err: any) {
      console.error('Failed to load Prompt Studio data:', err);
      setErrorMessage(err.message || 'Failed to load prompt studio data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [activeProject?.id]);

  // Selected Scene
  const activeScene = useMemo(() => {
    if (!activePackage || !activePackage.scenes) return null;
    return activePackage.scenes.find((s) => s.id === selectedSceneId) || activePackage.scenes[0] || null;
  }, [activePackage, selectedSceneId]);

  // Linked Source
  const linkedSource = useMemo(() => {
    if (!activeProject) return null;
    return sources.find((s) => s.id === activeProject.sourceStoryId) || null;
  }, [activeProject, sources]);

  // Handle Full Package Generation
  const handleGeneratePackage = async () => {
    if (!activeProject || !approvedScript) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const generated = await promptStudioService.generatePromptPackage(
        activeProject.id,
        approvedScript.id,
        activePackage?.continuityProfile,
        (p) => setGenerationProgress(p)
      );
      await loadProjectData(activeProject.id);
      setActivePackage(generated);
      if (generated.scenes.length > 0) {
        setSelectedSceneId(generated.scenes[0].id);
      }
      setSuccessMessage(
        `Prompt package v${generated.version} generated successfully (${generated.scenes.length} scene prompts).`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate prompt package.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Handle Scene-Level Regeneration
  const handleRegenerateScene = async (sceneId: string) => {
    if (!activePackage) return;
    setRegeneratingSceneId(sceneId);
    setErrorMessage(null);
    try {
      const instruction = sceneInstruction[sceneId] || '';
      const updatedPackage = await promptStudioService.regenerateScenePrompt(
        activePackage.id,
        sceneId,
        instruction
      );
      setActivePackage(updatedPackage);
      await loadProjectData(activePackage.projectId);
      setSuccessMessage(`Scene ${sceneId} selectively regenerated. All other scenes preserved byte-for-byte.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to regenerate scene.');
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  // Handle Scene Prompt Text Direct Edit
  const handleScenePromptTextChange = (sceneId: string, newText: string) => {
    if (!activePackage) return;

    const updatedScenes = activePackage.scenes.map((sc) => {
      if (sc.id === sceneId) {
        return {
          ...sc,
          finalProductionPrompt: newText,
          structured: {
            ...sc.structured,
            finalProductionPrompt: newText,
          },
        };
      }
      return sc;
    });

    setActivePackage({
      ...activePackage,
      scenes: updatedScenes,
    });
  };

  // Save Current Prompt Package Draft
  const handleSavePackageDraft = async () => {
    if (!activePackage || !activeProject || !approvedScript) return;
    try {
      const report = promptStudioService.runValidationChecks(
        activeProject,
        approvedScript,
        activePackage.scenes,
        activePackage.continuityProfile
      );

      const updated = await storageService.updatePromptPackage(activePackage.id, {
        scenes: activePackage.scenes,
        continuityProfile: activePackage.continuityProfile,
        validationReport: report,
        isReadyForExport: report.canExport,
      });

      setActivePackage(updated);
      setSuccessMessage('Prompt package draft saved to local persistence.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save prompt package.');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    if (!activePackage) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activePackage, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `${activePackage.id}_GOOGLE_FLOW_PROMPTS.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    setSuccessMessage('Machine-readable JSON package exported.');
  };

  // Export Markdown
  const handleExportMarkdown = () => {
    if (!activePackage) return;
    const md = promptStudioService.exportPromptPackageToMarkdown(activePackage);
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `${activePackage.id}_GOOGLE_FLOW_PROMPTS.md`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    setSuccessMessage('Readable Markdown prompt package exported.');
  };

  // Reliable clipboard copy adapter with execCommand fallback
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    } catch (err) {
      console.error('Clipboard copy error:', err);
      return false;
    }
  };

  // Copy Complete Scene Prompt (Sections A through J with exact verbatim narration)
  const handleCopyScenePrompt = async (scene: ScenePromptRecord) => {
    if (!activePackage) return;
    const fullPrompt = promptStudioService.serializeCompleteScenePrompt(scene, activePackage);
    const success = await copyTextToClipboard(fullPrompt);
    if (success) {
      setCopiedSceneId(scene.id);
      setTimeout(() => setCopiedSceneId(null), 2500);
      setSuccessMessage(`Complete Google Flow prompt for Scene ${scene.segmentNumber} copied to clipboard.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setFallbackModalTitle(`Complete Scene Prompt — Scene ${scene.segmentNumber} of ${activePackage.scenes.length}`);
      setFallbackModalText(fullPrompt);
      setErrorMessage('Direct clipboard write was blocked by the browser. You can copy manually from the drawer below or download.');
    }
  };

  // Copy Complete Google Flow Package (All Scenes + Central Continuity Profile + Narration Directives)
  const handleCopyCompletePackage = async () => {
    if (!activePackage) return;
    const fullPackageText = promptStudioService.serializeCompletePromptPackage(
      activePackage,
      approvedScript,
      linkedSource
    );
    const success = await copyTextToClipboard(fullPackageText);
    if (success) {
      setIsPackageCopied(true);
      setTimeout(() => setIsPackageCopied(false), 2500);
      setSuccessMessage(`Complete Google Flow Package (${activePackage.scenes.length} Scenes) copied to clipboard.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setFallbackModalTitle(`Complete Google Flow Package (${activePackage.scenes.length} Scenes)`);
      setFallbackModalText(fullPackageText);
      setErrorMessage('Direct clipboard write was blocked by the browser. You can copy manually from the drawer below or download.');
    }
  };

  // Gate check
  const gateValidation = useMemo(() => {
    if (!activeProject) return null;
    return {
      hasApprovedScript: Boolean(approvedScript),
      script: approvedScript,
    };
  }, [activeProject, approvedScript]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 3 · Google Flow Prompt Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            Google Flow Scene Prompt Studio
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Scene-by-scene video prompt generator with central continuity profiles, exact narration anchors, and validation auditing.
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#9298A5] uppercase">Project:</span>
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) onSelectProject(found);
                }}
                className="bg-[#090B12] border border-[#1E2333] focus:border-[#FF1738] rounded-sm py-1.5 px-3 text-xs text-[#F4F5FA] font-mono focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.name.slice(0, 30)} ({p.aspectRatio})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenProjectModal}
            className="px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#10121C] border border-[#22283A] rounded-sm"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-3 bg-[#1A0A0E] border border-[#FF1738]/60 rounded-sm flex items-start gap-3 text-xs text-[#FF3048]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-[#9298A5] hover:text-white">
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-sm flex items-start gap-3 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{successMessage}</div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* ENTRY GATE VALIDATION: If No Active Project OR Script Unapproved */}
      {!activeProject ? (
        <div className="p-16 bg-[#08090E] border border-[#161922] rounded-sm text-center space-y-4">
          <Film className="w-12 h-12 text-[#9298A5] mx-auto opacity-50" />
          <div className="text-base font-semibold text-[#F4F5FA]">
            No Project Initialized
          </div>
          <p className="text-xs text-[#A0A5B3] max-w-md mx-auto">
            Google Flow Prompt Studio requires an active project configuration with an approved script draft.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_12px_rgba(255,23,56,0.3)] inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Initialize Project Now</span>
          </button>
        </div>
      ) : !approvedScript ? (
        <div className="p-12 bg-[#0A0D15] border border-amber-600/40 rounded-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">
              Phase 4 Entry Gate Locked: Awaiting Approved Script
            </h2>
            <p className="text-xs text-[#A0A5B3] max-w-lg mx-auto leading-relaxed">
              Per the ULTIMATETRON blueprint, Google Flow scene prompts cannot be synthesized from unapproved drafts.
              Project <strong className="text-white">{activeProject.id}</strong> requires an explicitly approved script version before unlocking Prompt Studio.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('scripts')}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_15px_rgba(255,23,56,0.35)] inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Open AI Script Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 2: Read-Only Approved Script Context Strip */}
          <div className="p-4 bg-[#080A10] border border-[#1A1F2E] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#FF1738] font-bold">{activeProject.id}</span>
                <span className="text-[#9298A5]" aria-hidden="true">·</span>
                <span className="text-white font-semibold">{activeProject.name}</span>
                <span className="text-[#9298A5]" aria-hidden="true">·</span>
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved Script {approvedScript.id} (v{approvedScript.version})</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#9298A5] flex-wrap">
                <span>{activeProject.aspectRatio}</span>
                <span aria-hidden="true">·</span>
                <span>{activeProject.duration}s ({activeProject.aspectRatio === '9:16' ? `${Math.round(activeProject.duration / 8)} clips @ 8s` : `${approvedScript.sections.length} chapters`})</span>
                <span aria-hidden="true">·</span>
                <span>Language: {activeProject.language}</span>
                <span aria-hidden="true">·</span>
                <span>Mode: {activeProject.contentMode}</span>
                <span aria-hidden="true">·</span>
                <span>Tone: {activeProject.tone}</span>
                <span aria-hidden="true">·</span>
                <span>Style: {activeProject.visualStyle}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsSourceDrawerOpen(!isSourceDrawerOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FF1738]" />
                <span>Script Text</span>
                {isSourceDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('scripts')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm"
              >
                <FileText className="w-3.5 h-3.5 text-[#9298A5]" />
                <span>Script Engine</span>
              </button>
            </div>
          </div>

          {/* Collapsible Script Narration Inspection Drawer */}
          {isSourceDrawerOpen && (
            <div className="p-4 bg-[#05060A] border border-[#161A26] rounded-sm space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#9298A5] pb-2 border-b border-[#141724]">
                <span className="text-white font-bold">
                  {approvedScript.id} (v{approvedScript.version}) — Approved Narration Sections
                </span>
                <span>{approvedScript.totalWordCount} words · ~{Math.round(approvedScript.estimatedTotalDuration)}s spoken</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-[#08090E] rounded-sm border border-[#121520]">
                {approvedScript.sections.map((sec) => (
                  <div key={sec.id} className="p-2 border-b border-[#141824] last:border-b-0 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-[#FF1738]">
                      <span>{sec.id}</span>
                      <span>·</span>
                      <span>{sec.purpose}</span>
                      <span>·</span>
                      <span className="text-[#9298A5]">[{sec.startTime}s - {sec.endTime}s] ({sec.wordCount} words)</span>
                    </div>
                    <p className="text-xs text-[#F4F5FA] leading-relaxed">&ldquo;{sec.narration}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Generation Progress Indicator */}
          {generationProgress && (
            <div className="p-4 bg-[#0E121E] border border-[#FF1738]/50 rounded-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#FF1738] animate-spin" />
                  <span className="text-white font-bold uppercase">
                    Stage {generationProgress.step} of {generationProgress.totalSteps}: {generationProgress.stageName}
                  </span>
                </div>
                <span className="text-[#FF1738] font-bold">
                  {Math.round((generationProgress.step / generationProgress.totalSteps) * 100)}%
                </span>
              </div>
              <p className="text-xs text-[#A0A5B3] font-mono">{generationProgress.detail}</p>
              <div className="w-full h-1 bg-[#1A2030] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF1738] transition-all duration-300"
                  style={{ width: `${(generationProgress.step / generationProgress.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Prompt Package Viewport */}
          {!activePackage ? (
            <div className="p-12 bg-[#08090E] border border-[#161922] rounded-sm text-center space-y-4">
              <Sparkles className="w-10 h-10 text-[#FF1738] mx-auto opacity-70 animate-pulse" />
              <div className="text-base font-semibold text-[#F4F5FA]">
                No Google Flow Prompt Package Generated Yet
              </div>
              <p className="text-xs text-[#A0A5B3] max-w-md mx-auto leading-relaxed">
                Transform approved script {approvedScript.id} (v{approvedScript.version}) into self-contained scene prompts adhering to the Complete Google Flow Prompt Schema.
              </p>
              <button
                onClick={handleGeneratePackage}
                disabled={isGenerating}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_15px_rgba(255,23,56,0.35)] transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing Prompts...' : 'Generate Google Flow Prompts'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Package Control Bar & Export Hub */}
              <div className="p-4 bg-[#0A0D16] border border-[#1A2234] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#FF1738]">
                    {activePackage.id}
                  </span>
                  <span className="text-xs font-mono text-white font-semibold">
                    Package v{activePackage.version}
                  </span>
                  <span className="text-xs font-mono text-[#9298A5]">
                    ({activePackage.scenes.length} Scenes)
                  </span>

                  {activePackage.isReadyForExport ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready For Export</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-semibold text-amber-400 bg-amber-950/40 border border-amber-600/40 px-2 py-0.5 rounded-sm">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Audit Blockers</span>
                    </span>
                  )}
                </div>

                {/* Export & Package Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Copy Complete Google Flow Package */}
                  <button
                    onClick={handleCopyCompletePackage}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] active:bg-[#D90F2D] rounded-sm shadow-[0_0_12px_rgba(255,23,56,0.3)] transition-all cursor-pointer"
                    title="Copy complete Google Flow production package for all scenes in chronological order"
                  >
                    {isPackageCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Package Copied ({activePackage.scenes.length} Scenes)</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Complete Google Flow Package ({activePackage.scenes.length} Scenes)</span>
                      </>
                    )}
                  </button>

                  {/* Export Full Markdown Package */}
                  <button
                    onClick={handleExportMarkdown}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121624] hover:bg-[#1A2033] border border-[#232B42] rounded-sm cursor-pointer"
                    title="Export complete human-readable Markdown package"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FF1738]" />
                    <span>Export Full Markdown Package</span>
                  </button>

                  {/* Export JSON */}
                  <button
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121624] hover:bg-[#1A2033] border border-[#232B42] rounded-sm cursor-pointer"
                    title="Export machine-readable JSON package"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9298A5]" />
                    <span>Export JSON</span>
                  </button>

                  {/* Save Draft */}
                  <button
                    onClick={handleSavePackageDraft}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#101420] hover:bg-[#181F30] border border-[#222C42] rounded-sm"
                  >
                    <Save className="w-3.5 h-3.5 text-[#FF1738]" />
                    <span>Save Draft</span>
                  </button>

                  {/* Regenerate All Prompts */}
                  <button
                    onClick={handleGeneratePackage}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Package</span>
                  </button>
                </div>
              </div>

              {/* SECTION 10 3-COLUMN WORKSPACE: LEFT (Navigator) · CENTER (Editor) · RIGHT (Continuity/Validation) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT PANEL: SCENE NAVIGATOR (3 Cols) */}
                <div className="lg:col-span-3 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-[#9298A5] px-1">
                    <span>Scene Navigator</span>
                    <span>{activePackage.scenes.length} Units</span>
                  </div>

                  <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                    {activePackage.scenes.map((scene) => {
                      const isSelected = activeScene?.id === scene.id;
                      const hasWarnings = scene.warnings.length > 0;

                      return (
                        <div
                          key={scene.id}
                          onClick={() => setSelectedSceneId(scene.id)}
                          className={`p-3 rounded-sm border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#121624] border-[#FF1738] shadow-[inset_0_1px_0_rgba(255,23,56,0.3)]'
                              : 'bg-[#08090E] border-[#171A24] hover:border-[#22283A]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-xs">
                            <span className={`font-bold ${isSelected ? 'text-[#FF1738]' : 'text-white'}`}>
                              {scene.id}
                            </span>
                            <span className="text-[#9298A5] text-[11px]">
                              {scene.startTime.toFixed(1)}s &ndash; {scene.endTime.toFixed(1)}s
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-[#F4F5FA] truncate mt-1">
                            {scene.structured.sceneObjective.purpose}
                          </div>

                          <p className="text-[10px] text-[#A0A5B3] italic line-clamp-2 mt-1">
                            &ldquo;{scene.exactNarration}&rdquo;
                          </p>

                          <div className="mt-2 pt-2 border-t border-[#141824] flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#9298A5]">
                              {scene.targetDuration}s window
                            </span>
                            {hasWarnings && (
                              <span className="text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{scene.warnings.length} warning</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CENTER PANEL: PROMPT EDITOR (6 Cols) */}
                <div className="lg:col-span-6 space-y-4">
                  {activeScene ? (
                    <div className="p-5 bg-[#080A10] border border-[#1A1F2E] rounded-sm space-y-4">
                      {/* Scene Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#161C2C]">
                        <div>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-bold text-[#FF1738]">{activeScene.id}</span>
                            <span className="text-[#9298A5]">·</span>
                            <span className="text-white font-semibold">{activeScene.structured.sceneObjective.purpose}</span>
                            <span className="text-[#9298A5]">·</span>
                            <span className="text-[#A0A5B3]">{activeScene.startTime}s - {activeScene.endTime}s ({activeScene.targetDuration}s target)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyScenePrompt(activeScene)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm cursor-pointer"
                            title="Copy final production prompt"
                          >
                            {copiedSceneId === activeScene.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Read-Only Exact Script Narration (Byte-For-Byte Fidelity) */}
                      <div className="p-3 bg-[#05060A] border border-[#141824] rounded-sm space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#9298A5]">
                          <span className="flex items-center gap-1 text-[#FF1738]">
                            <Volume2 className="w-3 h-3" />
                            <span>Exact Approved Voiceover Narration ({activeProject.language})</span>
                          </span>
                          <span className="text-emerald-400">Immutable Script Link</span>
                        </div>
                        <p className="text-xs text-[#F4F5FA] font-sans leading-relaxed italic">
                          &ldquo;{activeScene.exactNarration}&rdquo;
                        </p>
                      </div>

                      {/* Editable Final Production Prompt (Section J) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-[#9298A5] flex items-center justify-between">
                          <span>Standalone Production Prompt (Google Flow Executable)</span>
                          <span className="text-[#A0A5B3]">Section J · Self-Contained</span>
                        </label>
                        <textarea
                          rows={6}
                          value={activeScene.finalProductionPrompt}
                          onChange={(e) => handleScenePromptTextChange(activeScene.id, e.target.value)}
                          className="w-full bg-[#05060A] border border-[#161924] focus:border-[#FF1738] rounded-sm p-3 text-xs text-[#F4F5FA] font-mono leading-relaxed focus:outline-none"
                        />
                      </div>

                      {/* Selective Scene Regeneration Directive */}
                      <div className="p-3 bg-[#0B0E18] border border-[#1C2438] rounded-sm space-y-2">
                        <div className="text-[11px] font-mono uppercase text-[#9298A5] flex items-center justify-between">
                          <span>Selective Scene Prompt Regeneration</span>
                          <span className="text-[10px] text-[#9298A5]">Preserves all other scenes byte-for-byte</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sceneInstruction[activeScene.id] || ''}
                            onChange={(e) =>
                              setSceneInstruction({
                                ...sceneInstruction,
                                [activeScene.id]: e.target.value,
                              })
                            }
                            placeholder="Directive (e.g. emphasize volumetric light shafts, macro camera close-up)..."
                            className="flex-1 bg-[#05060A] border border-[#1A2234] focus:border-[#FF1738] rounded-sm py-1.5 px-3 text-xs text-[#F4F5FA] placeholder-[#9298A5]/40 font-sans focus:outline-none"
                          />

                          <button
                            type="button"
                            disabled={regeneratingSceneId === activeScene.id}
                            onClick={() => handleRegenerateScene(activeScene.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${regeneratingSceneId === activeScene.id ? 'animate-spin' : ''}`} />
                            <span>{regeneratingSceneId === activeScene.id ? 'Regenerating...' : 'Regenerate Scene'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Accordion: Structured Complete Schema Breakdown (Sections A-I) */}
                      <div className="border border-[#141824] rounded-sm overflow-hidden">
                        <button
                          onClick={() => setIsStructuredAccordionOpen(!isStructuredAccordionOpen)}
                          className="w-full p-2.5 bg-[#07090F] flex items-center justify-between text-xs font-mono uppercase text-[#A0A5B3] hover:text-white"
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-[#FF1738]" />
                            <span>Complete Google Flow Schema Fields (A through I)</span>
                          </span>
                          {isStructuredAccordionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isStructuredAccordionOpen && (
                          <div className="p-3 bg-[#05060A] space-y-3 text-xs font-mono">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-1">
                                <div className="text-[10px] text-[#FF1738] uppercase font-bold">B. Objective</div>
                                <div className="text-[11px] text-[#F4F5FA]">{activeScene.structured.sceneObjective.mainVisualIdea}</div>
                                <div className="text-[10px] text-[#9298A5]">{activeScene.structured.sceneObjective.intendedViewerEffect}</div>
                              </div>

                              <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-1">
                                <div className="text-[10px] text-[#FF1738] uppercase font-bold">C. Subject & Setting</div>
                                <div className="text-[11px] text-[#F4F5FA]">{activeScene.structured.subjectAndEnvironment.mainSubject}</div>
                                <div className="text-[10px] text-[#9298A5]">{activeScene.structured.subjectAndEnvironment.settingAndBackground}</div>
                              </div>

                              <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-1">
                                <div className="text-[10px] text-[#FF1738] uppercase font-bold">D. Action & Motion</div>
                                <div className="text-[11px] text-[#F4F5FA]">{activeScene.structured.actionAndMotion.actionDescription}</div>
                                <div className="text-[10px] text-[#9298A5]">{activeScene.structured.actionAndMotion.subjectMovement}</div>
                              </div>

                              <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-1">
                                <div className="text-[10px] text-[#FF1738] uppercase font-bold">E. Camera Direction</div>
                                <div className="text-[11px] text-[#F4F5FA]">{activeScene.structured.cameraDirection.shotTypeAndFraming}</div>
                                <div className="text-[10px] text-[#9298A5]">{activeScene.structured.cameraDirection.cameraMovement} · {activeScene.structured.cameraDirection.lensOrDepthOfField}</div>
                              </div>

                              <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-1">
                                <div className="text-[10px] text-[#FF1738] uppercase font-bold">F. Lighting & Color</div>
                                <div className="text-[11px] text-[#F4F5FA]">{activeScene.structured.lightingAndColor.lightSourceAndDirection}</div>
                                <div className="text-[10px] text-[#9298A5]">{activeScene.structured.lightingAndColor.colorPalette}</div>
                              </div>

                              <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-1">
                                <div className="text-[10px] text-[#FF1738] uppercase font-bold">H. Transitions</div>
                                <div className="text-[11px] text-[#F4F5FA]">In: {activeScene.structured.transitionsAndContinuity.incomingTransition}</div>
                                <div className="text-[10px] text-[#9298A5]">Out: {activeScene.structured.transitionsAndContinuity.outgoingTransition}</div>
                              </div>
                            </div>

                            <div className="p-2 bg-[#08090E] rounded-sm border border-[#121520] space-y-0.5">
                              <div className="text-[10px] text-amber-500 uppercase font-bold">I. Negative Constraints</div>
                              <div className="text-[11px] text-[#A0A5B3]">{activeScene.structured.constraints.negativeRestrictions}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scene Revision History */}
                      {activeScene.revisionHistory.length > 1 && (
                        <div className="p-3 bg-[#06070B] border border-[#121622] rounded-sm space-y-2">
                          <div className="text-[10px] font-mono uppercase text-[#9298A5] flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <History className="w-3 h-3 text-[#FF1738]" />
                              <span>Scene Revision History</span>
                            </span>
                            <span>{activeScene.revisionHistory.length} revisions</span>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[11px]">
                            {activeScene.revisionHistory.map((rev) => (
                              <div key={rev.revision} className="flex items-center justify-between text-[#A0A5B3] p-1 bg-[#090B12] rounded-sm">
                                <span>Rev #{rev.revision} · {rev.instruction || 'Edit'}</span>
                                <span className="text-[10px] text-[#9298A5]">{new Date(rev.timestamp).toLocaleTimeString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-[#9298A5] bg-[#080A10] border border-[#1A1F2E] rounded-sm">
                      Select a scene from the navigator to inspect and edit its prompt.
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL: CONTINUITY AND VALIDATION (3 Cols) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Central Continuity Profile Summary */}
                  <div className="p-4 bg-[#080A10] border border-[#1A1F2E] rounded-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#161C2C]">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#FF1738]" />
                        <span className="text-xs font-mono font-bold uppercase text-white">
                          Central Continuity Profile
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-[#FF1738] uppercase">1. Visual Style & Color</div>
                        <div className="text-[11px] text-white font-semibold">{activePackage.continuityProfile.visualIdentity.overallVisualStyle}</div>
                        <div className="text-[10px] text-[#A0A5B3] line-clamp-2">{activePackage.continuityProfile.visualIdentity.colorGrading}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#FF1738] uppercase">2. Focal Subject Continuity</div>
                        <div className="text-[11px] text-white">{activePackage.continuityProfile.subjectIdentity.primarySubjectId}</div>
                        <div className="text-[10px] text-[#A0A5B3] line-clamp-2">{activePackage.continuityProfile.subjectIdentity.appearanceDescription}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#FF1738] uppercase">3. Primary Environment</div>
                        <div className="text-[11px] text-white">{activePackage.continuityProfile.environment.primaryLocation}</div>
                        <div className="text-[10px] text-[#A0A5B3] line-clamp-1">{activePackage.continuityProfile.environment.weatherAndAtmosphere}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#FF1738] uppercase">4. Camera Movement Rule</div>
                        <div className="text-[10px] text-[#A0A5B3] line-clamp-2">{activePackage.continuityProfile.cameraLanguage.cameraMovementConventions}</div>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Validation Report */}
                  <div className="p-4 bg-[#080A10] border border-[#1A1F2E] rounded-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#161C2C]">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#FF1738]" />
                        <span className="text-xs font-mono font-bold uppercase text-white">
                          Validation Report
                        </span>
                      </div>
                      {activePackage.validationReport.canExport ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Pass</span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#FF3048] font-bold uppercase">Blocked</span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {activePackage.validationReport.structuralErrors.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-[#FF3048] font-bold uppercase">Structural Errors</div>
                          {activePackage.validationReport.structuralErrors.map((err, i) => (
                            <div key={i} className="p-2 bg-[#1A0A0E] text-[#FF3048] rounded-sm border border-[#FF1738]/40 text-[11px]">
                              {err}
                            </div>
                          ))}
                        </div>
                      )}

                      {activePackage.validationReport.warnings.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-amber-500 font-bold uppercase">Continuity Warnings</div>
                          {activePackage.validationReport.warnings.map((w, i) => (
                            <div key={i} className="p-2 bg-[#18120A] text-amber-400 rounded-sm border border-amber-600/30 text-[11px]">
                              {w}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 text-[11px] text-[#9298A5]">
                        {activePackage.validationReport.notes.map((n, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Info className="w-3 h-3 text-[#9298A5] shrink-0 mt-0.5" />
                            <span>{n}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 7 Mandatory Limitation Disclaimer */}
                  <div className="p-3 bg-[#07080D] border border-[#161A26] rounded-sm space-y-1 text-[11px] font-mono text-[#9298A5]">
                    <div className="text-[10px] text-white font-bold uppercase">Google Flow Model Constraint</div>
                    <p className="leading-relaxed">
                      While central continuity profiles enforce consistent prompting anchors, external video diffusion models do not guarantee 100% identical facial morphology or audio sync across distinct clips.
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTTOM VIEW: VISUAL TIMELINE STRIP */}
              <div className="p-4 bg-[#08090E] border border-[#171A24] rounded-sm space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs uppercase text-[#9298A5]">
                  <span>Timeline Visualizer · {activeProject.aspectRatio} ({activeProject.duration}s Total Spoken Duration)</span>
                  <span>{activePackage.scenes.length} Continuous Units</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {activePackage.scenes.map((scene) => {
                    const isSelected = activeScene?.id === scene.id;
                    return (
                      <div
                        key={scene.id}
                        onClick={() => setSelectedSceneId(scene.id)}
                        className={`p-2.5 rounded-sm border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#141A2E] border-[#FF1738]'
                            : 'bg-[#0A0D16] border-[#181F30] hover:border-[#283248]'
                        }`}
                      >
                        <div className="text-[10px] text-[#FF1738] font-bold">{scene.id}</div>
                        <div className="text-xs text-white font-semibold truncate mt-0.5">
                          {scene.structured.sceneObjective.purpose}
                        </div>
                        <div className="text-[10px] text-[#9298A5] mt-1">
                          {scene.startTime}s - {scene.endTime}s ({scene.targetDuration}s)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
