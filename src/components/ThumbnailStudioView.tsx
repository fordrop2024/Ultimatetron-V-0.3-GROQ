/**
 * ULTIMATETRON — Thumbnail Studio View (Phase 5)
 * Master Production Implementation:
 * - Upstream Script Approval Gating (locked if no project or unapproved script)
 * - Three Distinct Concept Cards (Concept A: Curiosity, Concept B: Emotion, Concept C: Environment)
 * - Deep Interactive Configuration Controls (Framing, Lighting, Placement, Palette, Typography, Headline)
 * - Prompt Copy & Standalone Prompt Inspection
 * - Single-Concept Selective Regeneration with Verified Byte-for-Byte Preservation
 * - Image Generation Integration & Fallback State Display
 * - Mobile Safe Margin & YouTube Timestamp Overlay Preview
 * - Real-time Validation Engine & Disclosures
 * - JSON and Markdown Production Brief Exports
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  Download,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  FileText,
  Camera,
  Film,
  Palette,
  Type,
  Maximize2,
  Smartphone,
  ShieldAlert,
  Info,
  Clock,
  History,
  Send,
  Wand2
} from 'lucide-react';
import {
  ProjectConfig,
  SourceStory,
  ScriptRecord,
  ThumbnailConfig,
  ThumbnailConcept,
  ThumbnailPackage,
  ConceptOptionId,
  NavigationTab,
  AspectRatio,
  VisualStyle,
  ThumbnailSubjectPlacement,
  ThumbnailFacialExpression,
  ThumbnailCameraFraming,
  ThumbnailLighting,
  ThumbnailColorStrategy,
  ThumbnailTypographyStyle,
  ThumbnailTextPlacement,
  ThumbnailCreativeIntensity
} from '../types';
import { storageService } from '../services/storage';
import { thumbnailStudioService } from '../services/thumbnailStudio';

interface ThumbnailStudioViewProps {
  activeProject: ProjectConfig | null;
  sources: SourceStory[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenProjectModal: () => void;
}

export const ThumbnailStudioView: React.FC<ThumbnailStudioViewProps> = ({
  activeProject,
  sources,
  onNavigate,
  onOpenProjectModal,
}) => {
  const [approvedScript, setApprovedScript] = useState<ScriptRecord | null>(null);
  const [packages, setPackages] = useState<ThumbnailPackage[]>([]);
  const [activePackage, setActivePackage] = useState<ThumbnailPackage | null>(null);

  // Live configuration state
  const [config, setConfig] = useState<ThumbnailConfig | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [showMobileSafeOverlay, setShowMobileSafeOverlay] = useState(false);

  // Loading & Generation states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [regeneratingConceptId, setRegeneratingConceptId] = useState<ConceptOptionId | null>(null);
  const [conceptDirectives, setConceptDirectives] = useState<Record<string, string>>({});
  const [renderingImageConceptId, setRenderingImageConceptId] = useState<ConceptOptionId | null>(null);

  // Copy notification states
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Revisions & inspection
  const [historyDrawerConceptId, setHistoryDrawerConceptId] = useState<ConceptOptionId | null>(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  // Load project script & saved packages
  const loadProjectData = async (projId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const scripts = await storageService.getScriptsByProjectId(projId);
      const approved = scripts.find((s) => s.isApproved) || null;
      setApprovedScript(approved);

      if (approved) {
        const pkgList = await storageService.getThumbnailPackagesByScriptId(approved.id, approved.version);
        setPackages(pkgList);
        if (pkgList.length > 0) {
          setActivePackage(pkgList[0]);
          setConfig(pkgList[0].config);
        } else {
          setActivePackage(null);
          if (activeProject) {
            setConfig(thumbnailStudioService.createDefaultConfig(activeProject, approved));
          }
        }
      } else {
        setPackages([]);
        setActivePackage(null);
        setConfig(null);
      }
    } catch (err: any) {
      console.error('Failed to load Thumbnail Studio data:', err);
      setErrorMessage(err.message || 'Failed to load thumbnail data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
    } else {
      setApprovedScript(null);
      setPackages([]);
      setActivePackage(null);
      setConfig(null);
    }
  }, [activeProject?.id]);

  const linkedSource = useMemo(() => {
    if (!activeProject) return null;
    return sources.find((s) => s.id === activeProject.sourceStoryId) || null;
  }, [activeProject, sources]);

  // Handle Full Package Generation
  const handleGenerateThreeConcepts = async () => {
    if (!activeProject || !approvedScript) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const generated = await thumbnailStudioService.generateThumbnailPackage(
        activeProject.id,
        approvedScript.id,
        config || undefined,
        (progress) => {
          setGenerationStep(progress.message);
        }
      );
      await loadProjectData(activeProject.id);
      setActivePackage(generated);
      setConfig(generated.config);
      setSuccessMessage('Generated 3 distinct thumbnail concepts successfully with verified provenance.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate thumbnail concepts.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  // Handle Single-Concept Selective Regeneration
  const handleRegenerateConcept = async (conceptId: ConceptOptionId) => {
    if (!activePackage) return;
    setRegeneratingConceptId(conceptId);
    setErrorMessage(null);

    try {
      const directive = conceptDirectives[conceptId] || '';
      const updated = await thumbnailStudioService.regenerateSingleConcept(
        activePackage.id,
        conceptId,
        directive,
        config || undefined
      );

      // Refresh list & active package
      const updatedList = await storageService.getThumbnailPackagesByProjectId(activePackage.projectId);
      setPackages(updatedList);
      const found = updatedList.find((p) => p.id === updated.id) || updated;
      setActivePackage(found);
      setSuccessMessage(
        `Concept ${conceptId.replace('concept_', '').toUpperCase()} regenerated. Unaffected concepts preserved byte-for-byte.`
      );
      setConceptDirectives((prev) => ({ ...prev, [conceptId]: '' }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Selective regeneration failed.');
    } finally {
      setRegeneratingConceptId(null);
    }
  };

  // Handle Concept Image Generation via Imagen
  const handleGenerateImage = async (conceptId: ConceptOptionId) => {
    if (!activePackage) return;
    setRenderingImageConceptId(conceptId);
    setErrorMessage(null);

    try {
      const updated = await thumbnailStudioService.generateConceptImage(activePackage.id, conceptId);
      setActivePackage(updated);
      const target = updated.concepts.find((c) => c.id === conceptId);
      if (target?.imageGenerationStatus === 'generated') {
        setSuccessMessage(`Image for Concept ${conceptId.replace('concept_', '').toUpperCase()} generated successfully.`);
      } else {
        setErrorMessage(
          target?.imageGenerationError || 'Image generation could not be completed with external provider.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to trigger image generation.');
    } finally {
      setRenderingImageConceptId(null);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!activePackage) return;
    const jsonStr = thumbnailStudioService.exportPackageAsJSON(activePackage);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePackage.id}_v${activePackage.version}_thumbnails.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Exported thumbnail package JSON schema.');
  };

  // Export Markdown
  const handleExportMarkdown = () => {
    if (!activePackage || !activeProject || !approvedScript) return;
    const md = thumbnailStudioService.exportPackageAsMarkdown(activePackage, activeProject, approvedScript);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePackage.id}_v${activePackage.version}_production_brief.md`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Exported readable Markdown production brief.');
  };

  // 1. Entry Gate: No Project Loaded
  if (!activeProject) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="pb-4 border-b border-[#1A1D27] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 4 · Thumbnail Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
              Thumbnail Command Center
            </h1>
          </div>
          <span className="text-xs font-mono text-amber-500 uppercase flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Gated</span>
          </span>
        </div>

        <div className="p-8 bg-[#0A0D15] border border-amber-600/40 rounded-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No Project Loaded</div>
          <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
            Please select an existing project or initialize a new project linked to a master source story.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-4 py-2 text-xs font-semibold uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm cursor-pointer"
          >
            Initialize Project Now
          </button>
        </div>
      </div>
    );
  }

  // 2. Entry Gate: Script Not Approved
  if (!approvedScript) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="pb-4 border-b border-[#1A1D27] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 4 · Thumbnail Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
              Thumbnail Command Center
            </h1>
            <p className="text-xs text-[#A0A5B3] mt-1">
              Project Context: <strong className="text-white font-mono">{activeProject.name}</strong> ({activeProject.id})
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-sm uppercase flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Awaiting Script Approval</span>
          </span>
        </div>

        <div className="p-6 bg-[#0A0D15] border border-[#1A2030] rounded-sm flex items-start gap-4">
          <Lock className="w-6 h-6 text-[#FF1738] shrink-0 mt-1" />
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">
              Upstream Approval Gate Active
            </div>
            <p className="text-xs text-[#A0A5B3] leading-relaxed">
              Per ULTIMATETRON specifications, thumbnail concepts cannot be generated from unapproved or draft scripts.
              Approved source material guarantees strict factual fidelity and narrative alignment without visual hallucinations.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('scripts')}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Open Script Engine to Review & Approve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Approved Gate Cleared — Full Production Workspace
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Header & Upstream Clearance Bar */}
      <div className="pb-4 border-b border-[#1A1D27] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 4 · Thumbnail Studio
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-sm uppercase font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Approved Script v{approvedScript.version} Linked</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans mt-1">
            Three-Option Thumbnail Concept Studio
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-0.5">
            Grounded in {activeProject.name} ({activeProject.aspectRatio}, {activeProject.duration}s). Standalone image generation prompts & CTR visual architecture.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {packages.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#0B0D14] border border-[#1A1F2D] px-2 py-1 rounded-sm text-xs font-mono">
              <span className="text-[#9298A5]">Package:</span>
              <select
                value={activePackage?.id || ''}
                onChange={(e) => {
                  const found = packages.find((p) => p.id === e.target.value);
                  if (found) {
                    setActivePackage(found);
                    setConfig(found.config);
                  }
                }}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id} className="bg-[#0B0D14] text-white">
                    {pkg.id} (rev {pkg.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowMobileSafeOverlay(!showMobileSafeOverlay)}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded-sm border inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              showMobileSafeOverlay
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                : 'bg-[#0B0D14] text-[#A0A5B3] border-[#1A1F2D] hover:text-white'
            }`}
            title="Toggle Simulated Mobile Feed Overlay"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showMobileSafeOverlay ? 'Mobile Safe Overlay ON' : 'Mobile Safe Preview'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={!activePackage}
            className="px-3 py-1.5 text-xs font-mono uppercase bg-[#0B0D14] hover:bg-[#121520] text-[#F4F5FA] border border-[#1A1F2D] rounded-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#FF1738]" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            disabled={!activePackage}
            className="px-3 py-1.5 text-xs font-mono uppercase bg-[#0B0D14] hover:bg-[#121520] text-[#F4F5FA] border border-[#1A1F2D] rounded-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Brief MD</span>
          </button>

          <button
            onClick={handleGenerateThreeConcepts}
            disabled={isGenerating}
            className="px-4 py-1.5 text-xs font-mono uppercase tracking-wider bg-[#FF1738] hover:bg-[#FF3048] text-white rounded-sm inline-flex items-center gap-1.5 font-bold cursor-pointer disabled:opacity-50 glow-crimson-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{generationStep || 'Generating...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>{activePackage ? 'Regenerate All 3' : 'Generate 3 Concepts'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-sm text-xs font-mono text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-sm text-xs font-mono text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Upstream Gate & Provenance Card */}
      <div className="p-4 bg-[#08090E] border border-[#161A26] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[#9298A5]">Provenance Link:</span>{' '}
            <strong className="text-white">{approvedScript.id}</strong> (Script v{approvedScript.version}) ·
            Source <strong className="text-white">{activeProject.sourceStoryId}</strong> (v{activeProject.sourceVersion})
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#9298A5]">
          <span>Ratio: <strong className="text-white">{config?.aspectRatio || activeProject.aspectRatio}</strong></span>
          <span>Style: <strong className="text-white">{config?.visualStyle || activeProject.visualStyle}</strong></span>
          <span>Mode: <strong className="text-white">{activePackage?.generationMode || 'prompt_only'}</strong></span>
        </div>
      </div>

      {/* Configuration Controls Panel (Collapsible) */}
      {config && (
        <div className="bg-[#08090E] border border-[#171B26] rounded-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center gap-2 text-xs font-mono uppercase text-white font-bold cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#FF1738]" />
              <span>Thumbnail Visual Configuration Parameters</span>
              {isConfigOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] font-mono text-[#9298A5]">
              Adjusting controls updates subsequent concept generation and prompts
            </span>
          </div>

          {isConfigOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#141722] text-xs font-mono">
              {/* Aspect Ratio */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Aspect Ratio</label>
                <select
                  value={config.aspectRatio}
                  onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value as AspectRatio })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="16:9">16:9 (Standard YouTube)</option>
                  <option value="9:16">9:16 (Shorts / Reels Cover)</option>
                </select>
              </div>

              {/* Visual Style */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Visual Style</label>
                <select
                  value={config.visualStyle}
                  onChange={(e) => setConfig({ ...config, visualStyle: e.target.value as VisualStyle })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="Cinematic">Cinematic Realism</option>
                  <option value="Documentary Realism">Documentary Realism</option>
                  <option value="Photorealistic">Photorealistic</option>
                  <option value="2D Animation">Stylized Illustration / 2D</option>
                  <option value="3D Animation">3D Unreal Render</option>
                  <option value="Comic-Book">Comic-Book Graphic</option>
                </select>
              </div>

              {/* Subject Placement */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Subject Placement</label>
                <select
                  value={config.subjectPlacement}
                  onChange={(e) => setConfig({ ...config, subjectPlacement: e.target.value as ThumbnailSubjectPlacement })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="rule_of_thirds_left">Rule of Thirds (Left)</option>
                  <option value="rule_of_thirds_right">Rule of Thirds (Right)</option>
                  <option value="center">Center Symmetrical</option>
                  <option value="foreground_dominant">Foreground Dominant Macro</option>
                </select>
              </div>

              {/* Facial Emotion */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Emotion & Intensity</label>
                <select
                  value={config.facialExpression}
                  onChange={(e) => setConfig({ ...config, facialExpression: e.target.value as ThumbnailFacialExpression })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="subtle">Subtle Intrigue</option>
                  <option value="moderate">Moderate Curiosity</option>
                  <option value="intense_intrigue">Intense Revelation / Shock</option>
                  <option value="shock_dramatic">Extreme Dramatic Shock</option>
                  <option value="not_applicable">N/A (Inanimate / Tech Object)</option>
                </select>
              </div>

              {/* Camera Framing */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Camera Framing</label>
                <select
                  value={config.cameraFraming}
                  onChange={(e) => setConfig({ ...config, cameraFraming: e.target.value as ThumbnailCameraFraming })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="extreme_close_up">Extreme Macro Close-Up</option>
                  <option value="close_up">Close-Up (Shoulder Level)</option>
                  <option value="medium_close_up">Medium Close-Up</option>
                  <option value="low_angle_dramatic">Low-Angle Hero Shot</option>
                  <option value="dutch_tilt">Dutch Tilt Dynamic</option>
                  <option value="wide_panoramic">Wide Panoramic Scale</option>
                </select>
              </div>

              {/* Lighting */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Lighting Atmosphere</label>
                <select
                  value={config.lightingDirection}
                  onChange={(e) => setConfig({ ...config, lightingDirection: e.target.value as ThumbnailLighting })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="rim_edge_glow">Rim Light / Silhouette Glow</option>
                  <option value="chiaroscuro">Chiaroscuro High Contrast</option>
                  <option value="volumetric_rays">Volumetric God-Rays</option>
                  <option value="cybernetic_neon">Cybernetic Neon Edge</option>
                  <option value="golden_hour">Golden Hour Dramatic</option>
                </select>
              </div>

              {/* Color Palette */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Color Strategy</label>
                <select
                  value={config.colorPalette}
                  onChange={(e) => setConfig({ ...config, colorPalette: e.target.value as ThumbnailColorStrategy })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="crimson_cyan">Crimson Energy & Deep Cyan</option>
                  <option value="warm_amber_slate">Warm Amber & Slate Noir</option>
                  <option value="high_key_vibrant">High-Key Vibrant Saturated</option>
                  <option value="desaturated_noir">Desaturated Dark Cinema</option>
                  <option value="high_contrast_mono">High-Contrast Monochromatic</option>
                </select>
              </div>

              {/* Creative Intensity */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Creative Intensity</label>
                <select
                  value={config.creativeIntensity}
                  onChange={(e) => setConfig({ ...config, creativeIntensity: e.target.value as ThumbnailCreativeIntensity })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="subtle">Subtle Realism</option>
                  <option value="balanced">Balanced Production</option>
                  <option value="dramatic">Dramatic High-CTR Impact</option>
                </select>
              </div>

              {/* Headline / Hook Text */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="text-[11px] text-[#9298A5] uppercase flex items-center justify-between">
                  <span>Headline Text Copy (2-4 Words Maximum)</span>
                  <span className="text-[#9298A5]/60 text-[10px]">Optional editable banner suggestion</span>
                </label>
                <input
                  type="text"
                  value={config.headlineText || ''}
                  onChange={(e) => setConfig({ ...config, headlineText: e.target.value })}
                  placeholder="e.g. THE VOYAGER SIGNAL or CRITICAL ANOMALY"
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white px-3 py-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none font-sans"
                />
              </div>

              {/* Typography Style */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Typography Treatment</label>
                <select
                  value={config.typographyStyle}
                  onChange={(e) => setConfig({ ...config, typographyStyle: e.target.value as ThumbnailTypographyStyle })}
                  className="w-full bg-[#0B0D14] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="bold_sans">Heavy Bold Sans-Serif</option>
                  <option value="futuristic_display">Futuristic Sci-Fi Display</option>
                  <option value="distress_grunge">Distressed Textured</option>
                  <option value="cinematic_serif">Cinematic Editorial Serif</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Three Concepts Grid */}
      {!activePackage ? (
        <div className="p-12 bg-[#08090E] border border-dashed border-[#1B1E2B] rounded-sm text-center space-y-4">
          <ImageIcon className="w-10 h-10 text-[#FF1738] mx-auto opacity-80" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Thumbnail Concepts Generated Yet</h3>
            <p className="text-xs text-[#A0A5B3] max-w-md mx-auto">
              Ready to generate 3 fundamentally distinct creative directions based on the approved script sections and central dramatic question.
            </p>
          </div>
          <button
            onClick={handleGenerateThreeConcepts}
            disabled={isGenerating}
            className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#FF1738] hover:bg-[#FF3048] text-white rounded-sm font-bold inline-flex items-center gap-2 cursor-pointer glow-crimson"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Three Thumbnail Concepts</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Concept Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activePackage.concepts.map((concept, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C
              const isSelectedForRegen = regeneratingConceptId === concept.id;
              const isRenderingImage = renderingImageConceptId === concept.id;

              return (
                <div
                  key={concept.id}
                  className="bg-[#08090E] border border-[#171B26] hover:border-[#2A3042] rounded-sm flex flex-col justify-between transition-all relative overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-[#141722] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-[#FF1738] font-bold uppercase">
                        Option {letter} · {concept.creativeDirection}
                      </span>
                      {concept.revisionHistory.length > 0 && (
                        <button
                          onClick={() => setHistoryDrawerConceptId(concept.id)}
                          className="text-[10px] font-mono text-[#9298A5] hover:text-[#FF1738] flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3 h-3" />
                          <span>Rev {concept.revisionHistory.length + 1}</span>
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white font-sans leading-snug">
                      {concept.title}
                    </h3>

                    <p className="text-xs text-[#A0A5B3] leading-relaxed line-clamp-3">
                      {concept.creativeRationale}
                    </p>
                  </div>

                  {/* Visual Composition / Safe Margin Preview Area */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Simulated Visual Aspect Box */}
                    <div
                      className={`relative bg-[#050609] border border-[#1F2433] rounded-sm overflow-hidden flex flex-col items-center justify-center ${
                        activePackage.config.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-72' : 'aspect-video'
                      }`}
                    >
                      {concept.generatedImageUrl ? (
                        <img
                          src={concept.generatedImageUrl}
                          alt={concept.title}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setEnlargedImageUrl(concept.generatedImageUrl || null)}
                        />
                      ) : (
                        <div className="p-4 text-center space-y-2 select-none">
                          <ImageIcon className="w-8 h-8 text-[#9298A5]/40 mx-auto" />
                          <div className="text-[11px] font-mono text-[#9298A5]">
                            {concept.imageGenerationStatus === 'failed' ? (
                              <span className="text-red-400">Image Generation Failed</span>
                            ) : concept.imageGenerationStatus === 'unavailable' ? (
                              <span className="text-amber-400">Image API Unavailable</span>
                            ) : (
                              <span>Standalone Prompt Ready</span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#9298A5]/60 max-w-[200px]">
                            {concept.compositionAndFocalPoint}
                          </div>
                        </div>
                      )}

                      {/* Headline Text Overlay simulation */}
                      {concept.thumbnailTextSuggestion && (
                        <div
                          className={`absolute ${
                            activePackage.config.textPlacement === 'top_left'
                              ? 'top-2 left-2'
                              : 'bottom-2 left-2'
                          } z-10 max-w-[85%]`}
                        >
                          <span className="bg-[#FF1738] text-white font-extrabold text-[11px] font-sans px-2 py-0.5 tracking-tight uppercase shadow-lg shadow-black/80">
                            {concept.thumbnailTextSuggestion}
                          </span>
                        </div>
                      )}

                      {/* Mobile Safe Zone Overlay */}
                      {showMobileSafeOverlay && (
                        <div className="absolute inset-0 pointer-events-none z-20 border-2 border-dashed border-amber-500/50 flex flex-col justify-between p-2">
                          <div className="text-[9px] font-mono bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded-sm self-start">
                            SAFE MARGIN VIEW
                          </div>
                          {activePackage.config.aspectRatio === '16:9' && (
                            <div className="self-end bg-black/90 text-[9px] font-mono text-zinc-400 px-1.5 py-0.5 rounded-sm border border-zinc-700">
                              04:12 (YT Timestamp)
                            </div>
                          )}
                        </div>
                      )}

                      {/* Zoom button for generated image */}
                      {concept.generatedImageUrl && (
                        <button
                          onClick={() => setEnlargedImageUrl(concept.generatedImageUrl || null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-sm text-xs cursor-pointer z-30"
                          title="Enlarge Image"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Breakdown Badges */}
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2 bg-[#0A0D15] rounded-sm border border-[#141724] space-y-1">
                        <span className="text-[#9298A5] text-[10px] uppercase">Primary Focal Point:</span>
                        <div className="text-white text-[11px] leading-snug">{concept.primarySubject}</div>
                      </div>

                      <div className="p-2 bg-[#0A0D15] rounded-sm border border-[#141724] space-y-1">
                        <span className="text-[#9298A5] text-[10px] uppercase">Lighting & Atmosphere:</span>
                        <div className="text-[#A0A5B3] text-[11px] leading-snug">{concept.lightingAndAtmosphere}</div>
                      </div>
                    </div>

                    {/* Standalone Prompt Box with One-Click Copy */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#FF1738] uppercase font-semibold">Image Generation Prompt</span>
                        <button
                          onClick={() => handleCopy(concept.selfContainedPrompt, `prompt_${concept.id}`)}
                          className="inline-flex items-center gap-1 text-[10px] text-[#A0A5B3] hover:text-white uppercase cursor-pointer"
                        >
                          {copiedType === `prompt_${concept.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 bg-[#050609] border border-[#161A26] rounded-sm text-[11px] font-mono text-[#F4F5FA] leading-relaxed max-h-28 overflow-y-auto select-all">
                        {concept.selfContainedPrompt}
                      </div>
                    </div>

                    {/* Negative Prompt with Copy */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#9298A5] uppercase">Negative Safeguards</span>
                        <button
                          onClick={() => handleCopy(concept.negativePrompt, `neg_${concept.id}`)}
                          className="text-[#9298A5] hover:text-white uppercase cursor-pointer"
                        >
                          {copiedType === `neg_${concept.id}` ? (
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          ) : (
                            <span>Copy Neg</span>
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] font-mono text-[#9298A5] italic line-clamp-2">
                        {concept.negativePrompt}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Selective Regeneration & Image Action */}
                  <div className="p-4 bg-[#0A0C13] border-t border-[#141722] space-y-3">
                    {/* Directive refinement input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-[#9298A5] uppercase flex items-center justify-between">
                        <span>Refine Directive (Affects Only Option {letter})</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={conceptDirectives[concept.id] || ''}
                          onChange={(e) =>
                            setConceptDirectives({ ...conceptDirectives, [concept.id]: e.target.value })
                          }
                          placeholder="e.g. Enhance rim light contrast..."
                          className="flex-1 bg-[#050609] border border-[#1A1F2D] text-white px-2.5 py-1.5 rounded-sm text-xs font-sans focus:border-[#FF1738] focus:outline-none"
                        />
                        <button
                          onClick={() => handleRegenerateConcept(concept.id)}
                          disabled={isSelectedForRegen}
                          className="px-3 py-1.5 text-xs font-mono uppercase bg-[#141824] hover:bg-[#1E2335] text-white border border-[#23293D] rounded-sm inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Regenerates only this concept while preserving the other two byte-for-byte"
                        >
                          {isSelectedForRegen ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF1738]" />
                          ) : (
                            <Send className="w-3.5 h-3.5 text-[#FF1738]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Image Generation Action */}
                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                      <span className="text-[#9298A5] text-[10px]">
                        Status: <strong className="text-white capitalize">{concept.imageGenerationStatus.replace('_', ' ')}</strong>
                      </span>

                      <button
                        onClick={() => handleGenerateImage(concept.id)}
                        disabled={isRenderingImage}
                        className="px-2.5 py-1 text-[11px] font-mono uppercase bg-[#FF1738]/20 hover:bg-[#FF1738]/30 text-[#FF1738] border border-[#FF1738]/40 rounded-sm inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isRenderingImage ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Calling API...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3 h-3" />
                            <span>Render Image</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation & Disclosure Panel */}
          <div className="p-5 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF1738]" />
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Deterministic Validation & Compliance Engine
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm font-semibold ${
                  activePackage.validationReport.canExport
                    ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/40'
                    : 'text-red-400 bg-red-950/50 border border-red-500/40'
                }`}
              >
                {activePackage.validationReport.canExport ? 'EXPORT CLEARED' : 'BLOCKED BY ERRORS'}
              </span>
            </div>

            {/* Error alerts if any */}
            {activePackage.validationReport.structuralErrors.length > 0 && (
              <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-sm space-y-1">
                <div className="text-[11px] font-mono text-red-300 font-bold uppercase">Structural Errors:</div>
                <ul className="list-disc list-inside text-xs font-mono text-red-200">
                  {activePackage.validationReport.structuralErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Non-blocking creative notices */}
            <div className="space-y-1.5 pt-2 border-t border-[#141722] text-xs font-mono text-[#A0A5B3]">
              {activePackage.validationReport.notices.map((notice, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{notice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal / Drawer */}
      {historyDrawerConceptId && activePackage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0D14] border border-[#1F2433] rounded-sm max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1F2D] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#FF1738]" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Concept {historyDrawerConceptId.replace('concept_', '').toUpperCase()} Revision History
                </h3>
              </div>
              <button
                onClick={() => setHistoryDrawerConceptId(null)}
                className="text-xs font-mono text-[#9298A5] hover:text-white"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activePackage.concepts
                .find((c) => c.id === historyDrawerConceptId)
                ?.revisionHistory.map((rev) => (
                  <div key={rev.revision} className="p-3 bg-[#07080C] border border-[#161A26] rounded-sm space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#9298A5]">
                      <span className="font-bold text-white">Revision {rev.revision}</span>
                      <span>{new Date(rev.timestamp).toLocaleString()}</span>
                    </div>
                    {rev.instruction && (
                      <div className="text-amber-400 text-[11px]">
                        Directive: &ldquo;{rev.instruction}&rdquo;
                      </div>
                    )}
                    <div className="text-[#A0A5B3] text-[11px] bg-black/40 p-2 rounded-sm select-all">
                      {rev.prompt}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Preview Modal */}
      {enlargedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEnlargedImageUrl(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={enlargedImageUrl}
              alt="Enlarged Thumbnail Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-sm border border-[#1F2433] shadow-2xl"
            />
            <div className="text-center text-xs font-mono text-[#9298A5] mt-2">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
