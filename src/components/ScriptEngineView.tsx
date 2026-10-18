/**
 * ULTIMATETRON — AI Script Engine Screen (Phase 3)
 * Full interactive UI for:
 * - Source analysis & fact classification
 * - AI script draft generation respecting 9:16 (8s clips) and 16:9 (4m+) duration rules
 * - Per-section live editing with word counts and spoken duration estimation
 * - Section-level selective regeneration preserving all other sections
 * - Version history browsing & draft saving
 * - Strict quality approval gate unlocking Google Flow Prompt Studio
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  PlayCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  BookOpen,
  Calendar,
  Save,
  ShieldCheck,
  Send,
  Eye,
  History,
  Check,
  Copy,
  AlertCircle
} from 'lucide-react';
import {
  ProjectConfig,
  SourceStory,
  ScriptRecord,
  ScriptSection,
  ScriptAnalysis,
  NavigationTab
} from '../types';
import { storageService } from '../services/storage';
import { scriptEngineService, GenerationProgress } from '../services/scriptEngine';

interface ScriptEngineViewProps {
  activeProject: ProjectConfig | null;
  projects: ProjectConfig[];
  sources: SourceStory[];
  onSelectProject: (project: ProjectConfig) => void;
  onOpenProjectModal: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ScriptEngineView: React.FC<ScriptEngineViewProps> = ({
  activeProject,
  projects,
  sources,
  onSelectProject,
  onOpenProjectModal,
  onNavigate,
}) => {
  const [scripts, setScripts] = useState<ScriptRecord[]>([]);
  const [activeScript, setActiveScript] = useState<ScriptRecord | null>(null);
  const [cachedAnalysis, setCachedAnalysis] = useState<ScriptAnalysis | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);

  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);
  const [sectionInstruction, setSectionInstruction] = useState<Record<string, string>>({});
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const [isSourcePreviewOpen, setIsSourcePreviewOpen] = useState(false);
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Linked Source
  const linkedSource = useMemo(() => {
    if (!activeProject) return null;
    return sources.find((s) => s.id === activeProject.sourceStoryId) || null;
  }, [activeProject, sources]);

  // Load scripts for the active project
  const loadProjectScripts = async (projId: string) => {
    try {
      const list = await storageService.getScriptsByProjectId(projId);
      setScripts(list);
      if (list.length > 0) {
        // Default to latest version
        setActiveScript(list[0]);
        if (list[0].analysis) {
          setCachedAnalysis(list[0].analysis);
        }
      } else {
        setActiveScript(null);
        setCachedAnalysis(null);
      }
    } catch (err: any) {
      console.error('Failed to load scripts:', err);
    }
  };

  useEffect(() => {
    if (activeProject) {
      loadProjectScripts(activeProject.id);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [activeProject?.id]);

  // Handle Source Analysis
  const handleAnalyzeSource = async () => {
    if (!activeProject) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const analysis = await scriptEngineService.analyzeSource(
        activeProject.id,
        (p) => setGenerationProgress(p)
      );
      setCachedAnalysis(analysis);
      setIsAnalysisDrawerOpen(true);
      setSuccessMessage('Source story analyzed successfully. Evidence & narrative arc extracted.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze source.');
    } finally {
      setIsAnalyzing(false);
      setGenerationProgress(null);
    }
  };

  // Handle Full Script Generation
  const handleGenerateScript = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const script = await scriptEngineService.generateScript(
        activeProject.id,
        cachedAnalysis || undefined,
        (p) => setGenerationProgress(p)
      );
      await loadProjectScripts(activeProject.id);
      setActiveScript(script);
      setSuccessMessage(`Script draft version v${script.version} generated successfully.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate script.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Handle Narration Text Editing
  const handleSectionNarrationChange = (sectionId: string, newNarration: string) => {
    if (!activeScript || activeScript.isApproved) return;

    const wordCount = newNarration.split(/\s+/).filter(Boolean).length;
    const speakingRate = activeScript.projectSnapshot.language === 'Hindi' ? 2.2 : 2.4;
    const estimatedDurationSec = Math.round((wordCount / speakingRate) * 10) / 10;

    const updatedSections = activeScript.sections.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          narration: newNarration,
          wordCount,
          estimatedDurationSec,
        };
      }
      return sec;
    });

    const totalWordCount = updatedSections.reduce((acc, s) => acc + s.wordCount, 0);
    const estimatedTotalDuration = updatedSections.reduce((acc, s) => acc + s.estimatedDurationSec, 0);

    setActiveScript({
      ...activeScript,
      sections: updatedSections,
      totalWordCount,
      estimatedTotalDuration,
    });
  };

  // Save Current In-Memory Edits to Draft
  const handleSaveDraft = async () => {
    if (!activeScript || activeScript.isApproved) return;
    try {
      const updated = await storageService.updateScript(activeScript.id, {
        sections: activeScript.sections,
        totalWordCount: activeScript.totalWordCount,
        estimatedTotalDuration: activeScript.estimatedTotalDuration,
      });
      setActiveScript(updated);
      setSuccessMessage('Script draft saved to local persistence.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save draft.');
    }
  };

  // Handle Section-Level Selective Regeneration
  const handleRegenerateSection = async (sectionId: string) => {
    if (!activeScript) return;
    setRegeneratingSectionId(sectionId);
    setErrorMessage(null);
    try {
      const instruction = sectionInstruction[sectionId] || '';
      const updatedScript = await scriptEngineService.regenerateSection(
        activeScript.id,
        sectionId,
        instruction
      );
      setActiveScript(updatedScript);
      await loadProjectScripts(activeScript.projectId);
      setSuccessMessage(`Section ${sectionId} regenerated with requested refinements.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to regenerate section.');
    } finally {
      setRegeneratingSectionId(null);
    }
  };

  // Handle Script Approval Gate
  const handleApproveScript = async () => {
    if (!activeScript) return;

    const validation = scriptEngineService.validateScriptForApproval(activeScript);
    if (!validation.canApprove) {
      setErrorMessage(
        `Approval Gate Blocked: ${validation.blockingReasons.join(' · ')}`
      );
      return;
    }

    try {
      const approved = await storageService.approveScript(activeScript.id, 'Production Lead');
      setActiveScript(approved);
      await loadProjectScripts(activeProject!.id);
      setSuccessMessage('Script approved! Prompt Studio is now unlocked.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve script.');
    }
  };

  // Handle Forking New Draft from Approved Script
  const handleForkNewDraft = async () => {
    if (!activeScript) return;
    try {
      const forked = await storageService.forkScriptDraft(activeScript.id);
      await loadProjectScripts(activeProject!.id);
      setActiveScript(forked);
      setSuccessMessage(`Created editable draft revision v${forked.version} from v${activeScript.version}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fork draft.');
    }
  };

  // Copy Full Script to Clipboard
  const handleCopyFullScript = () => {
    if (!activeScript) return;
    const fullText = activeScript.sections
      .map((s) => `[${s.purpose} | ${s.startTime}s - ${s.endTime}s]\n${s.narration}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const approvalValidation = useMemo(() => {
    if (!activeScript) return null;
    return scriptEngineService.validateScriptForApproval(activeScript);
  }, [activeScript]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header & Project Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 2 · Script Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            AI Script Generation & Pacing Engine
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Algorithmic narrative breakdown: 8-second narration clips for 9:16 Shorts vs chaptered structures for 16:9 Long-Form.
          </p>
        </div>

        {/* Project Selector Dropdown */}
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
                    {p.id} — {p.name.slice(0, 32)} ({p.aspectRatio})
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

      {/* If No Active Project */}
      {!activeProject ? (
        <div className="p-16 bg-[#08090E] border border-[#161922] rounded-sm text-center space-y-4">
          <PlayCircle className="w-12 h-12 text-[#9298A5] mx-auto opacity-50" />
          <div className="text-base font-semibold text-[#F4F5FA]">
            No Project Initialized
          </div>
          <p className="text-xs text-[#A0A5B3] max-w-md mx-auto">
            The Script Engine requires an active project configuration linked to a preserved Source Story.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_12px_rgba(255,23,56,0.3)] inline-flex items-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Initialize Project Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Canonical Configuration Context Strip */}
          <div className="p-4 bg-[#080A10] border border-[#1A1F2E] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#FF1738] font-bold">{activeProject.id}</span>
                <span className="text-[#9298A5]" aria-hidden="true">·</span>
                <span className="text-white font-semibold">{activeProject.name}</span>
                <span className="text-[#9298A5]" aria-hidden="true">·</span>
                <span className="text-[#A0A5B3]">
                  Source: <strong className="text-[#F4F5FA]">{activeProject.sourceStoryId} (v{activeProject.sourceVersion})</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#9298A5] flex-wrap">
                <span>{activeProject.aspectRatio}</span>
                <span aria-hidden="true">·</span>
                <span>{activeProject.duration}s ({activeProject.aspectRatio === '9:16' ? `${Math.round(activeProject.duration / 8)} clips @ 8s` : 'Long-Form'})</span>
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
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSourcePreviewOpen(!isSourcePreviewOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FF1738]" />
                <span>Source Text</span>
                {isSourcePreviewOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={handleAnalyzeSource}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121624] hover:bg-[#1A2033] border border-[#232B42] rounded-sm transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF1738]" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Source'}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Verbatim Source Preview Drawer */}
          {isSourcePreviewOpen && linkedSource && (
            <div className="p-4 bg-[#05060A] border border-[#161A26] rounded-sm space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#9298A5] pb-2 border-b border-[#141724]">
                <span className="text-white font-bold">
                  {linkedSource.id} (v{activeProject.sourceVersion}) — &ldquo;{linkedSource.title}&rdquo;
                </span>
                <span>{linkedSource.wordCount} words · {linkedSource.charCount} characters</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[#A0A5B3] max-h-56 overflow-y-auto p-2 bg-[#08090E] rounded-sm border border-[#121520]">
                {linkedSource.content}
              </p>
            </div>
          )}

          {/* Collapsible Source Analysis Drawer */}
          {isAnalysisDrawerOpen && cachedAnalysis && (
            <div className="p-4 bg-[#07090F] border border-[#1A2234] rounded-sm space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#161C2C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF1738]" />
                  <span className="text-white font-bold uppercase tracking-wider">
                    Source Evidence & Fact Classification
                  </span>
                </div>
                <button
                  onClick={() => setIsAnalysisDrawerOpen(false)}
                  className="text-[#9298A5] hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-[#090C14] border border-[#161E2E] rounded-sm space-y-1">
                  <div className="text-[10px] text-[#FF1738] uppercase font-bold">Source-Stated Facts</div>
                  <ul className="list-disc list-inside text-[11px] text-[#A0A5B3] space-y-0.5">
                    {cachedAnalysis.sourceStatedFacts.map((f, i) => (
                      <li key={i} className="line-clamp-2">{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-[#090C14] border border-[#161E2E] rounded-sm space-y-1">
                  <div className="text-[10px] text-amber-500 uppercase font-bold">Allegations & Context</div>
                  <ul className="list-disc list-inside text-[11px] text-[#A0A5B3] space-y-0.5">
                    {cachedAnalysis.allegations.map((a, i) => (
                      <li key={i} className="line-clamp-2">{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-[#090C14] border border-[#161E2E] rounded-sm space-y-1">
                  <div className="text-[10px] text-sky-400 uppercase font-bold">Central Question</div>
                  <p className="text-[11px] text-[#F4F5FA] leading-relaxed">
                    {cachedAnalysis.centralQuestion}
                  </p>
                  <div className="text-[10px] text-[#9298A5] pt-1">
                    Arc: {cachedAnalysis.narrativeArc}
                  </div>
                </div>
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

          {/* Main Script Editor / Viewport */}
          {!activeScript ? (
            <div className="p-12 bg-[#08090E] border border-[#161922] rounded-sm text-center space-y-4">
              <FileText className="w-10 h-10 text-[#9298A5] mx-auto opacity-50" />
              <div className="text-sm font-semibold text-[#F4F5FA]">
                No Script Draft Generated Yet
              </div>
              <p className="text-xs text-[#A0A5B3] max-w-md mx-auto leading-relaxed">
                Execute the AI Script Engine to generate narration structured for {activeProject.aspectRatio} ({activeProject.duration}s) in {activeProject.language}.
              </p>
              <button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_15px_rgba(255,23,56,0.3)] transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Script...' : 'Generate Script Draft'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Script Action Bar & Version Selector */}
              <div className="p-4 bg-[#0A0D16] border border-[#1A2234] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FF1738]">
                      {activeScript.id}
                    </span>
                    <span className="text-xs font-mono text-white font-semibold">
                      v{activeScript.version}
                    </span>
                    {activeScript.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-sm">
                        <Lock className="w-3 h-3" />
                        <span>Approved & Locked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-semibold text-amber-400 bg-amber-950/40 border border-amber-600/40 px-2 py-0.5 rounded-sm">
                        <Unlock className="w-3 h-3" />
                        <span>Draft Revision</span>
                      </span>
                    )}
                  </div>

                  {/* Versions dropdown if multiple exist */}
                  {scripts.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#9298A5]">
                      <span>History:</span>
                      <select
                        value={activeScript.id}
                        onChange={(e) => {
                          const s = scripts.find((x) => x.id === e.target.value);
                          if (s) setActiveScript(s);
                        }}
                        className="bg-[#05060A] border border-[#1A2030] text-[#F4F5FA] rounded-sm py-1 px-2 text-[11px] focus:outline-none"
                      >
                        {scripts.map((s) => (
                          <option key={s.id} value={s.id}>
                            v{s.version} {s.isApproved ? '(Approved)' : '(Draft)'} — {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Copy Script */}
                  <button
                    onClick={handleCopyFullScript}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm"
                    title="Copy full script text"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* If Approved, show Fork action */}
                  {activeScript.isApproved ? (
                    <button
                      onClick={handleForkNewDraft}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121624] hover:bg-[#1A2033] border border-[#232B42] rounded-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF1738]" />
                      <span>Fork New Draft (v{activeScript.version + 1})</span>
                    </button>
                  ) : (
                    <>
                      {/* Save Draft */}
                      <button
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#F4F5FA] bg-[#101420] hover:bg-[#181F30] border border-[#222C42] rounded-sm"
                      >
                        <Save className="w-3.5 h-3.5 text-[#FF1738]" />
                        <span>Save Draft</span>
                      </button>

                      {/* Full Regenerate */}
                      <button
                        onClick={handleGenerateScript}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#0D0F17] border border-[#202536] rounded-sm disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerate Whole Script</span>
                      </button>

                      {/* Approve Gate Action */}
                      <button
                        onClick={handleApproveScript}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_12px_rgba(255,23,56,0.3)] transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Script</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Script Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#08090E] border border-[#161922] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Total Narration Words</div>
                  <div className="text-lg font-bold text-white tabular-nums mt-0.5">
                    {activeScript.totalWordCount}
                  </div>
                  <div className="text-[10px] text-[#9298A5]">
                    Language: {activeScript.projectSnapshot.language}
                  </div>
                </div>

                <div className="p-3 bg-[#08090E] border border-[#161922] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Est. Speaking Runtime</div>
                  <div className="text-lg font-bold text-[#FF1738] tabular-nums mt-0.5">
                    ~{Math.round(activeScript.estimatedTotalDuration)}s
                  </div>
                  <div className="text-[10px] text-[#9298A5]">
                    Target: {activeScript.projectSnapshot.duration}s
                  </div>
                </div>

                <div className="p-3 bg-[#08090E] border border-[#161922] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Sections / Clips</div>
                  <div className="text-lg font-bold text-white tabular-nums mt-0.5">
                    {activeScript.sections.length}
                  </div>
                  <div className="text-[10px] text-[#9298A5]">
                    {activeScript.projectSnapshot.aspectRatio === '9:16'
                      ? `${Math.round(activeScript.projectSnapshot.duration / 8)} required (8s/clip)`
                      : 'Chaptered Narrative'}
                  </div>
                </div>

                <div className="p-3 bg-[#08090E] border border-[#161922] rounded-sm">
                  <div className="text-[10px] text-[#9298A5] uppercase">Approval Status</div>
                  <div className="text-lg font-bold mt-0.5">
                    {activeScript.isApproved ? (
                      <span className="text-emerald-400">APPROVED</span>
                    ) : (
                      <span className="text-amber-400">DRAFT</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#9298A5]">
                    {activeScript.isApproved ? 'Unlocks Prompt Studio' : 'Approval required'}
                  </div>
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[#9298A5]">
                  <span>Structured Narration Segments</span>
                  <span>Direct Editing & Selective Regeneration</span>
                </div>

                {activeScript.sections.map((section) => {
                  const isRegenerating = regeneratingSectionId === section.id;
                  const instruction = sectionInstruction[section.id] || '';

                  return (
                    <div
                      key={section.id}
                      className={`p-4 rounded-sm border transition-all ${
                        activeScript.isApproved
                          ? 'bg-[#07080C] border-[#181C26]'
                          : 'bg-[#080A10] border-[#1A1F2E] hover:border-[#283248]'
                      }`}
                    >
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#141824]">
                        <div className="flex items-center gap-2.5 font-mono text-xs">
                          <span className="font-bold text-[#FF1738]">{section.id}</span>
                          <span className="text-[#9298A5]" aria-hidden="true">·</span>
                          <span className="text-[#F4F5FA] font-semibold">{section.purpose}</span>
                          <span className="text-[#9298A5]" aria-hidden="true">·</span>
                          <span className="text-[#A0A5B3]">
                            {section.startTime.toFixed(1)}s &ndash; {section.endTime.toFixed(1)}s ({(section.endTime - section.startTime)}s window)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#9298A5]">
                          <span className="tabular-nums font-semibold text-white">
                            {section.wordCount} words
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            ~{section.estimatedDurationSec}s spoken
                          </span>
                        </div>
                      </div>

                      {/* Warnings if any */}
                      {section.warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {section.warnings.map((w, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-sm text-xs flex items-center gap-2 ${
                                w.severity === 'error'
                                  ? 'bg-[#1A0A0E] text-[#FF3048] border border-[#FF1738]/40'
                                  : 'bg-[#18120A] text-amber-400 border border-amber-600/30'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{w.reason}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Editable Narration Text Area */}
                      <div className="mt-3 space-y-1">
                        <label className="text-[10px] font-mono uppercase text-[#9298A5] flex items-center justify-between">
                          <span>Voiceover Narration Text ({activeScript.projectSnapshot.language})</span>
                          {activeScript.isApproved && (
                            <span className="text-emerald-400 font-semibold">Locked</span>
                          )}
                        </label>
                        <textarea
                          rows={3}
                          disabled={activeScript.isApproved || isRegenerating}
                          value={section.narration}
                          onChange={(e) => handleSectionNarrationChange(section.id, e.target.value)}
                          className="w-full bg-[#05060A] border border-[#161924] focus:border-[#FF1738] rounded-sm p-3 text-xs text-[#F4F5FA] focus:outline-none font-sans leading-relaxed disabled:opacity-80"
                        />
                      </div>

                      {/* Visual Intention Prompt Note */}
                      {section.visualIntention && (
                        <div className="mt-2 p-2 bg-[#06070B] border border-[#121520] rounded-sm flex items-start gap-2 text-[11px] font-mono text-[#A0A5B3]">
                          <Eye className="w-3.5 h-3.5 text-[#FF1738] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-white font-semibold">Visual Intent: </span>
                            <span>{section.visualIntention}</span>
                          </div>
                        </div>
                      )}

                      {/* Section-Level Selective Regeneration Controls (Only when not approved) */}
                      {!activeScript.isApproved && (
                        <div className="mt-3 pt-2.5 border-t border-[#121622] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={instruction}
                              onChange={(e) =>
                                setSectionInstruction({
                                  ...sectionInstruction,
                                  [section.id]: e.target.value,
                                })
                              }
                              placeholder="Regeneration instruction (e.g. make punchier, shorten to 18 words, emphasize dates)..."
                              className="w-full bg-[#05060A] border border-[#1A1F2E] focus:border-[#FF1738] rounded-sm py-1 px-2.5 text-xs text-[#F4F5FA] placeholder-[#9298A5]/40 focus:outline-none font-sans"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={isRegenerating}
                            onClick={() => handleRegenerateSection(section.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121520] hover:bg-[#1A1F2E] border border-[#22283A] rounded-sm whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 text-[#FF1738] ${isRegenerating ? 'animate-spin' : ''}`} />
                            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Section'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Approval Footer Action */}
              <div className="p-4 bg-[#08090E] border border-[#171A24] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs font-mono text-[#9298A5]">
                  {activeScript.isApproved ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Script approved on {new Date(activeScript.approvalTimestamp!).toLocaleString()}. Prompt Studio unlocked.</span>
                    </span>
                  ) : (
                    <span>
                      Approval gate requires validation: Shorts exact clip count, Long-Form duration threshold, and zero blocking errors.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeScript.isApproved ? (
                    <button
                      onClick={() => onNavigate('flow_prompts')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_15px_rgba(255,23,56,0.35)] transition-all cursor-pointer"
                    >
                      <span>Proceed to Google Flow Studio</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleApproveScript}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_15px_rgba(255,23,56,0.35)] transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Script Draft</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
