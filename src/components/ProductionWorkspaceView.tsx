/**
 * ULTIMATETRON — Production Workspace & Asset Management (Phase 6)
 * Master Production Implementation:
 * - Real, un-invented status & progress calculation
 * - Production Asset Library (Reference Images, Voiceover Audio, Ambient Beds, Generated Assets)
 * - Scene-to-Asset Linkage panel with live preview & playback
 * - Deterministic Production Readiness Validator (blocking errors vs recommendations)
 * - Full Production Package Assembly & Versioning
 * - Real JSZip multi-file packaging, JSON manifest, and Markdown production briefs
 * - Google Flow manual handoff protocol with verbatim narration and standalone prompts
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  Layers,
  FolderOpen,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Sparkles,
  Image as ImageIcon,
  Music,
  Mic,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Trash2,
  Eye,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Info,
  Link as LinkIcon,
  Play,
  Pause,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import {
  ProjectConfig,
  SourceStory,
  ScriptRecord,
  PromptPackage,
  ThumbnailPackage,
  AssetRecord,
  AssetCategory,
  SceneAssetLinkage,
  ProductionStageHealth,
  ProductionReadinessReport,
  ProductionPackageManifest,
  NavigationTab
} from '../types';
import { storageService } from '../services/storage';
import { productionService } from '../services/productionService';

interface ProductionWorkspaceViewProps {
  activeProject: ProjectConfig | null;
  sources: SourceStory[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenProjectModal: () => void;
}

export const ProductionWorkspaceView: React.FC<ProductionWorkspaceViewProps> = ({
  activeProject,
  sources,
  onNavigate,
  onOpenProjectModal,
}) => {
  // Upstream project artifacts
  const [approvedScript, setApprovedScript] = useState<ScriptRecord | null>(null);
  const [promptPackage, setPromptPackage] = useState<PromptPackage | null>(null);
  const [thumbnailPackage, setThumbnailPackage] = useState<ThumbnailPackage | null>(null);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [productionPackages, setProductionPackages] = useState<ProductionPackageManifest[]>([]);
  const [activeProdPkg, setActiveProdPkg] = useState<ProductionPackageManifest | null>(null);

  // Health and Readiness states
  const [health, setHealth] = useState<ProductionStageHealth | null>(null);
  const [readiness, setReadiness] = useState<ProductionReadinessReport | null>(null);

  // Scene linkage state
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneLinkages, setSceneLinkages] = useState<Record<string, SceneAssetLinkage>>({});

  // Asset filtering & search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI state
  const [activeTabSubView, setActiveTabSubView] = useState<'overview' | 'assets' | 'linkage' | 'handoff' | 'export'>('overview');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New asset modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<AssetCategory>('reference_image');
  const [uploadAssociatedScene, setUploadAssociatedScene] = useState<string>('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadIsMandatory, setUploadIsMandatory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Audio player state
  const [playingAssetId, setPlayingAssetId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load all project production data
  const loadProjectProductionData = async (projId: string) => {
    try {
      const scripts = await storageService.getScriptsByProjectId(projId);
      const approved = scripts.find((s) => s.isApproved) || null;
      setApprovedScript(approved);

      if (approved) {
        const promptPkgs = await storageService.getPromptPackagesByScriptId(approved.id, approved.version);
        setPromptPackage(promptPkgs[0] || null);

        const thumbPkgs = await storageService.getThumbnailPackagesByScriptId(approved.id, approved.version);
        setThumbnailPackage(thumbPkgs[0] || null);
      } else {
        setPromptPackage(null);
        setThumbnailPackage(null);
      }

      const projAssets = await storageService.getAssetsByProjectId(projId);
      setAssets(projAssets);

      const linkages = await productionService.getSceneLinkages(projId);
      setSceneLinkages(linkages);

      const prodPkgs = await storageService.getProductionPackagesByProjectId(projId);
      setProductionPackages(prodPkgs);
      if (prodPkgs.length > 0 && !activeProdPkg) {
        setActiveProdPkg(prodPkgs[0]);
      }

      const h = await productionService.calculateProjectProductionHealth(projId);
      setHealth(h);

      const r = await productionService.validateProductionReadiness(projId);
      setReadiness(r);
    } catch (err: any) {
      console.error('Failed to load project production data:', err);
      setErrorMessage(err.message || 'Failed to load production data.');
    }
  };

  useEffect(() => {
    if (activeProject) {
      loadProjectProductionData(activeProject.id);
    } else {
      setApprovedScript(null);
      setPromptPackage(null);
      setThumbnailPackage(null);
      setAssets([]);
      setHealth(null);
      setReadiness(null);
    }
  }, [activeProject?.id]);

  // Available scenes from approved script or prompt package
  const scenesList = useMemo(() => {
    if (promptPackage && promptPackage.scenes) {
      return promptPackage.scenes.map((s) => ({
        id: s.id,
        scriptSectionId: s.scriptSectionId,
        number: s.segmentNumber,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.targetDuration,
        narration: s.exactNarration,
        prompt: s.finalProductionPrompt,
      }));
    }
    if (approvedScript && approvedScript.sections) {
      return approvedScript.sections.map((s) => ({
        id: s.id,
        scriptSectionId: s.id,
        number: s.segmentNumber,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.endTime - s.startTime,
        narration: s.narration,
        prompt: s.visualIntention || '',
      }));
    }
    return [];
  }, [promptPackage, approvedScript]);

  useEffect(() => {
    if (scenesList.length > 0 && !selectedSceneId) {
      setSelectedSceneId(scenesList[0].id);
    }
  }, [scenesList, selectedSceneId]);

  const activeScene = useMemo(() => {
    return scenesList.find((s) => s.id === selectedSceneId) || scenesList[0] || null;
  }, [scenesList, selectedSceneId]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [assets, selectedCategory, searchQuery]);

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Upload Asset Handler (Reads real file into Base64 Data URL)
  const handleUploadAsset = async () => {
    if (!activeProject || !uploadTitle.trim()) {
      setErrorMessage('Asset title is required.');
      return;
    }

    try {
      let dataUrl: string | undefined;
      let sizeBytes: number | undefined;
      let fileName: string | undefined;
      let mimeType: string | undefined;

      if (selectedFile) {
        fileName = selectedFile.name;
        mimeType = selectedFile.type;
        sizeBytes = selectedFile.size;
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      await storageService.saveAsset({
        projectId: activeProject.id,
        category: uploadCategory,
        title: uploadTitle.trim(),
        fileName,
        mimeType,
        sizeBytes,
        dataUrl,
        sourceRevisionProvenance: {
          storyId: activeProject.sourceStoryId,
          sourceVersion: activeProject.sourceVersion,
          scriptId: approvedScript?.id,
          scriptVersion: approvedScript?.version,
        },
        associatedSceneId: uploadAssociatedScene || undefined,
        status: dataUrl ? 'ready' : 'missing',
        tags: uploadCategory === 'voiceover_audio' ? ['audio', 'narration'] : ['production', uploadCategory],
        userNotes: uploadNotes.trim() || undefined,
        isMandatory: uploadIsMandatory,
      });

      // If associated with scene, update scene linkage
      if (uploadAssociatedScene) {
        // Will be reflected on reload
      }

      setIsUploadModalOpen(false);
      setUploadTitle('');
      setSelectedFile(null);
      setUploadNotes('');
      setUploadIsMandatory(false);
      setSuccessMessage('Asset successfully saved to production library.');
      await loadProjectProductionData(activeProject.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload asset.');
    }
  };

  // Toggle Mandatory
  const handleToggleMandatory = async (asset: AssetRecord) => {
    await storageService.updateAsset(asset.id, { isMandatory: !asset.isMandatory });
    if (activeProject) await loadProjectProductionData(activeProject.id);
  };

  // Delete Asset
  const handleDeleteAsset = async (assetId: string) => {
    await storageService.deleteAsset(assetId);
    if (activeProject) await loadProjectProductionData(activeProject.id);
    setSuccessMessage('Asset deleted from library.');
  };

  // Scene Linkage update
  const handleLinkAssetToActiveScene = async (assetId: string, role: 'primaryVisual' | 'voiceover' | 'ambient' | 'general') => {
    if (!activeProject || !selectedSceneId) return;
    try {
      await productionService.linkAssetToScene(activeProject.id, selectedSceneId, assetId, role);
      await loadProjectProductionData(activeProject.id);
      setSuccessMessage(`Asset linked to Scene ${activeScene?.number || selectedSceneId}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to link asset to scene.');
    }
  };

  // Assemble and Export Production Package
  const handleAssemblePackage = async () => {
    if (!activeProject) return;
    try {
      const manifest = await productionService.assembleProductionPackage(activeProject.id);
      setActiveProdPkg(manifest);
      await loadProjectProductionData(activeProject.id);
      setSuccessMessage(`Production Package ${manifest.id} assembled and verified.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to assemble production package.');
    }
  };

  // Export JSON
  const handleDownloadJSON = () => {
    if (!activeProdPkg) return;
    const jsonStr = productionService.exportProductionPackageJSON(activeProdPkg);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProdPkg.id}_manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Downloaded production manifest JSON.');
  };

  // Export Markdown Brief
  const handleDownloadMarkdown = () => {
    if (!activeProdPkg) return;
    const md = productionService.exportProductionPackageMarkdown(
      activeProdPkg,
      approvedScript || undefined,
      promptPackage || undefined,
      thumbnailPackage || undefined
    );
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProdPkg.id}_production_brief.md`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Downloaded production brief Markdown.');
  };

  // Export Real Multi-File ZIP (JSZip)
  const handleDownloadZIP = async () => {
    if (!activeProdPkg) return;
    setIsExportingZip(true);
    setErrorMessage(null);
    try {
      const zipBlob = await productionService.exportProductionPackageZIP(
        activeProdPkg,
        approvedScript || undefined,
        promptPackage || undefined,
        thumbnailPackage || undefined,
        assets
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProdPkg.id}_${activeProdPkg.projectSnapshot.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_bundle.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage('Multi-file production ZIP bundle generated and downloaded successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate production ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Audio Playback Toggle
  const handleTogglePlayAudio = (asset: AssetRecord) => {
    if (!asset.dataUrl) return;
    if (playingAssetId === asset.id) {
      audioRef.current?.pause();
      setPlayingAssetId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(asset.dataUrl);
        audioRef.current.onended = () => setPlayingAssetId(null);
      } else {
        audioRef.current.src = asset.dataUrl;
      }
      audioRef.current.play();
      setPlayingAssetId(asset.id);
    }
  };

  // Stage status badge helper
  const getStageBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'exported':
        return (
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-sm uppercase inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      case 'ready_for_export':
        return (
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-sm uppercase inline-flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>READY</span>
          </span>
        );
      case 'draft':
        return (
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-sm uppercase inline-flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            <span>DRAFT</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-sm uppercase inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>BLOCKED</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-[#9298A5] bg-[#121520] border border-[#202535] px-2 py-0.5 rounded-sm uppercase">
            NOT STARTED
          </span>
        );
    }
  };

  if (!activeProject) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="pb-4 border-b border-[#1A1D27] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 5 · Production Workspace
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
              Production Command Center
            </h1>
          </div>
        </div>
        <div className="p-8 bg-[#0A0D15] border border-amber-600/40 rounded-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="text-sm font-semibold text-white">No Project Loaded</div>
          <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
            Please select an existing project or initialize a project linked to a master source story.
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header and Project Hub */}
      <div className="pb-4 border-b border-[#1A1D27] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Pipeline Stage 5 · Master Production
            </span>
            {health && (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-sm font-bold">
                {health.overallProgressPercent}% READY
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans mt-0.5">
            Production Workspace & Asset Hub
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-0.5 font-mono">
            {activeProject.name} ({activeProject.id}) · {activeProject.aspectRatio} · {activeProject.duration}s target
          </p>
        </div>

        {/* Global Export & Package Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAssemblePackage}
            className="px-3.5 py-1.5 text-xs font-mono uppercase bg-[#141824] hover:bg-[#1E2335] text-white border border-[#23293D] rounded-sm inline-flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <Package className="w-3.5 h-3.5 text-[#FF1738]" />
            <span>Assemble Package</span>
          </button>

          <button
            onClick={handleDownloadZIP}
            disabled={!activeProdPkg || isExportingZip}
            className="px-4 py-1.5 text-xs font-mono uppercase tracking-wider bg-[#FF1738] hover:bg-[#FF3048] text-white rounded-sm inline-flex items-center gap-1.5 font-bold cursor-pointer disabled:opacity-40 glow-crimson-sm"
          >
            {isExportingZip ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Bundling ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download ZIP Bundle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
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

      {/* Workspace Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#171B26] pb-2 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTabSubView('overview')}
          className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
            activeTabSubView === 'overview'
              ? 'bg-[#FF1738] text-white font-bold'
              : 'text-[#A0A5B3] hover:text-white hover:bg-[#0B0D14]'
          }`}
        >
          1. Production Status Matrix
        </button>

        <button
          onClick={() => setActiveTabSubView('assets')}
          className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTabSubView === 'assets'
              ? 'bg-[#FF1738] text-white font-bold'
              : 'text-[#A0A5B3] hover:text-white hover:bg-[#0B0D14]'
          }`}
        >
          <span>2. Asset Library</span>
          <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full">{assets.length}</span>
        </button>

        <button
          onClick={() => setActiveTabSubView('linkage')}
          className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
            activeTabSubView === 'linkage'
              ? 'bg-[#FF1738] text-white font-bold'
              : 'text-[#A0A5B3] hover:text-white hover:bg-[#0B0D14]'
          }`}
        >
          3. Scene-to-Asset Linkage
        </button>

        <button
          onClick={() => setActiveTabSubView('handoff')}
          className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
            activeTabSubView === 'handoff'
              ? 'bg-[#FF1738] text-white font-bold'
              : 'text-[#A0A5B3] hover:text-white hover:bg-[#0B0D14]'
          }`}
        >
          4. Google Flow Handoff
        </button>

        <button
          onClick={() => setActiveTabSubView('export')}
          className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTabSubView === 'export'
              ? 'bg-[#FF1738] text-white font-bold'
              : 'text-[#A0A5B3] hover:text-white hover:bg-[#0B0D14]'
          }`}
        >
          <span>5. Export Hub</span>
          {activeProdPkg && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. OVERVIEW: PRODUCTION STAGE HEALTH MATRIX              */}
      {/* ======================================================== */}
      {activeTabSubView === 'overview' && health && (
        <div className="space-y-6">
          {/* Health Matrix Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Stage 1: Source Story */}
            <div className="p-4 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9298A5] uppercase font-bold">1. Source Story</span>
                {getStageBadge(health.sourceStatus)}
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {activeProject.sourceStoryId} (v{activeProject.sourceVersion})
              </div>
              <p className="text-[11px] text-[#A0A5B3]">
                Master vault record with verbatim source fidelity preserved.
              </p>
              <button
                onClick={() => onNavigate('sources')}
                className="text-[11px] font-mono text-[#FF1738] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Story Vault</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Stage 2: Approved Script */}
            <div className="p-4 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9298A5] uppercase font-bold">2. Script Engine</span>
                {getStageBadge(health.scriptStatus)}
              </div>
              <div className="text-xs font-semibold text-white">
                {approvedScript ? `${approvedScript.id} (v${approvedScript.version})` : 'No Approved Script'}
              </div>
              <p className="text-[11px] text-[#A0A5B3]">
                {approvedScript
                  ? `${approvedScript.sections.length} scene chapters · ${approvedScript.totalWordCount} words`
                  : 'Awaiting explicit sign-off in AI Script Engine.'}
              </p>
              <button
                onClick={() => onNavigate('scripts')}
                className="text-[11px] font-mono text-[#FF1738] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Open Script Engine</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Stage 3: Google Flow Scene Prompts */}
            <div className="p-4 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9298A5] uppercase font-bold">3. Flow Prompts</span>
                {getStageBadge(health.flowPromptsStatus)}
              </div>
              <div className="text-xs font-semibold text-white">
                {promptPackage ? `${promptPackage.scenes.length} Scenes Ready` : 'Prompts Not Generated'}
              </div>
              <p className="text-[11px] text-[#A0A5B3]">
                {promptPackage
                  ? `Continuous timeline across ${activeProject.duration}s with continuity profile.`
                  : 'Requires approved script to synthesize scene prompts.'}
              </p>
              <button
                onClick={() => onNavigate('flow_prompts')}
                className="text-[11px] font-mono text-[#FF1738] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Open Prompt Studio</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Stage 4: Thumbnail Concepts */}
            <div className="p-4 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9298A5] uppercase font-bold">4. Thumbnails</span>
                {getStageBadge(health.thumbnailStatus)}
              </div>
              <div className="text-xs font-semibold text-white">
                {thumbnailPackage ? `3 Concepts Ready (${thumbnailPackage.id})` : 'Concepts Not Generated'}
              </div>
              <p className="text-[11px] text-[#A0A5B3]">
                Curiosity, emotion, and environmental concepts in {activeProject.aspectRatio} format.
              </p>
              <button
                onClick={() => onNavigate('thumbnails')}
                className="text-[11px] font-mono text-[#FF1738] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Open Thumbnail Studio</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Stage 5: Production Assets */}
            <div className="p-4 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9298A5] uppercase font-bold">5. Asset Library</span>
                {getStageBadge(health.assetsStatus)}
              </div>
              <div className="text-xs font-semibold text-white">
                {assets.length} Media Assets Logged
              </div>
              <p className="text-[11px] text-[#A0A5B3]">
                Reference visuals, voiceover audio, and scene attachment linkages.
              </p>
              <button
                onClick={() => setActiveTabSubView('assets')}
                className="text-[11px] font-mono text-[#FF1738] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Asset Library</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Stage 6: Final Production Package */}
            <div className="p-4 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9298A5] uppercase font-bold">6. Production Package</span>
                {getStageBadge(health.packageStatus)}
              </div>
              <div className="text-xs font-semibold text-white">
                {activeProdPkg ? `${activeProdPkg.id} (rev ${activeProdPkg.version})` : 'Not Yet Assembled'}
              </div>
              <p className="text-[11px] text-[#A0A5B3]">
                {activeProdPkg
                  ? 'All deliverables verified, bundled and ready for export.'
                  : 'Assemble when all upstream pipeline gates are cleared.'}
              </p>
              <button
                onClick={() => setActiveTabSubView('export')}
                className="text-[11px] font-mono text-[#FF1738] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Open Export Hub</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Readiness Report Card */}
          {readiness && (
            <div className="p-5 bg-[#08090E] border border-[#171B26] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Production Readiness Validator
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm font-semibold ${
                    readiness.isReady
                      ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/40'
                      : 'text-amber-400 bg-amber-950/50 border border-amber-500/40'
                  }`}
                >
                  {readiness.isReady ? 'CLEARED FOR PRODUCTION EXPORT' : 'DELIVERABLES INCOMPLETE'}
                </span>
              </div>

              {readiness.blockingErrors.length > 0 && (
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-sm text-xs font-mono text-red-200 space-y-1">
                  <div className="font-bold text-red-300">Blocking Errors (Export Restricted):</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {readiness.blockingErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {readiness.recommendations.length > 0 && (
                <div className="space-y-1 text-xs font-mono text-[#A0A5B3] pt-1 border-t border-[#141722]">
                  {readiness.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ASSET LIBRARY: UPLOAD, FILTER, MANAGE                 */}
      {/* ======================================================== */}
      {activeTabSubView === 'assets' && (
        <div className="space-y-4">
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#08090E] border border-[#171B26] p-3 rounded-sm text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#9298A5] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="bg-[#050609] border border-[#1A1F2D] text-white pl-8 pr-3 py-1.5 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none w-48"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#050609] border border-[#1A1F2D] text-white px-2.5 py-1.5 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
              >
                <option value="all">All Categories ({assets.length})</option>
                <option value="reference_image">Reference Images</option>
                <option value="voiceover_audio">Voiceover Audio</option>
                <option value="ambient_music">Ambient & Music</option>
                <option value="generated_asset">Generated Visuals</option>
                <option value="final_deliverable">Final Deliverables</option>
              </select>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 bg-[#FF1738] hover:bg-[#FF3048] text-white font-bold rounded-sm inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Production Asset</span>
            </button>
          </div>

          {/* Assets Grid */}
          {filteredAssets.length === 0 ? (
            <div className="p-12 bg-[#08090E] border border-dashed border-[#1B1E2B] rounded-sm text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-[#9298A5]/50 mx-auto" />
              <div className="text-sm font-semibold text-white">No Assets Found</div>
              <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
                Upload character concept images, background environments, or scene voiceover audio to build your production library.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 text-xs font-mono uppercase bg-[#141824] hover:bg-[#1E2335] text-white border border-[#23293D] rounded-sm cursor-pointer"
              >
                Add First Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const isImage = asset.mimeType?.startsWith('image/') || asset.category === 'reference_image';
                const isAudio = asset.mimeType?.startsWith('audio/') || asset.category === 'voiceover_audio' || asset.category === 'ambient_music';
                const isPlaying = playingAssetId === asset.id;

                return (
                  <div
                    key={asset.id}
                    className="p-4 bg-[#08090E] border border-[#171B26] hover:border-[#22283A] rounded-sm flex flex-col justify-between space-y-3 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 truncate">
                        <span className="text-[10px] font-mono text-[#FF1738] font-bold uppercase tracking-wider">
                          {asset.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate" title={asset.title}>
                          {asset.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleMandatory(asset)}
                          className={`px-1.5 py-0.5 text-[9px] font-mono rounded-sm border cursor-pointer ${
                            asset.isMandatory
                              ? 'text-amber-400 bg-amber-950/50 border-amber-500/50 font-bold'
                              : 'text-[#9298A5] border-[#1E2335] hover:text-white'
                          }`}
                          title="Mandatory assets block production export if missing"
                        >
                          {asset.isMandatory ? 'MANDATORY' : 'OPTIONAL'}
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1 text-[#9298A5] hover:text-red-400 cursor-pointer"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="h-32 bg-[#050609] border border-[#161924] rounded-sm overflow-hidden flex items-center justify-center relative">
                      {isImage && asset.dataUrl ? (
                        <img src={asset.dataUrl} alt={asset.title} className="w-full h-full object-cover" />
                      ) : isAudio ? (
                        <div className="text-center space-y-2 p-2">
                          <Mic className="w-6 h-6 text-cyan-400 mx-auto" />
                          <button
                            onClick={() => handleTogglePlayAudio(asset)}
                            className="px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 rounded-sm text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
                          >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 p-2">
                          <FileText className="w-6 h-6 text-[#9298A5]/40 mx-auto" />
                          <span className="text-[10px] font-mono text-[#9298A5]">
                            {asset.fileName || 'Asset payload stored'}
                          </span>
                        </div>
                      )}

                      {asset.associatedSceneId && (
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono bg-black/80 text-white px-1.5 py-0.5 rounded-sm border border-zinc-700">
                          Scene: {asset.associatedSceneId}
                        </span>
                      )}
                    </div>

                    {/* Footer Info & Details */}
                    <div className="pt-2 border-t border-[#141722] text-[11px] font-mono text-[#9298A5] space-y-1">
                      <div className="flex items-center justify-between">
                        <span>ID: <strong className="text-white">{asset.id}</strong></span>
                        {asset.sizeBytes ? (
                          <span>{(asset.sizeBytes / 1024).toFixed(1)} KB</span>
                        ) : (
                          <span>Stored Data</span>
                        )}
                      </div>
                      {asset.userNotes && (
                        <p className="text-[10px] text-[#A0A5B3] italic line-clamp-1">
                          &ldquo;{asset.userNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SCENE-TO-ASSET LINKAGE WORKBENCH                      */}
      {/* ======================================================== */}
      {activeTabSubView === 'linkage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Scene Navigator */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono uppercase text-[#9298A5] flex items-center justify-between">
              <span>Approved Production Scenes</span>
              <span>{scenesList.length} Units</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {scenesList.map((sc) => {
                const isSelected = selectedSceneId === sc.id;
                const link = sceneLinkages[sc.id];
                const count = link?.assetIds?.length || 0;

                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedSceneId(sc.id)}
                    className={`p-3 rounded-sm border text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#121520] border-[#FF1738] text-white shadow-md'
                        : 'bg-[#08090E] border-[#161A26] text-[#A0A5B3] hover:text-white hover:border-[#22283A]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FF1738]">Scene {sc.number}</span>
                        <span className="text-[10px] text-[#9298A5]">({sc.startTime}s - {sc.endTime}s)</span>
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded-sm font-bold">
                          {count} Linked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9298A5] mt-1 line-clamp-2 italic">
                      &ldquo;{sc.narration}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Scene Asset Linkage Editor */}
          <div className="lg:col-span-7 bg-[#08090E] border border-[#171B26] p-5 rounded-sm space-y-5">
            {activeScene ? (
              <>
                <div className="border-b border-[#171A24] pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#FF1738] uppercase font-bold">
                      Scene {activeScene.number} Asset Association
                    </span>
                    <span className="text-xs font-mono text-[#9298A5]">
                      Window: {activeScene.startTime}s - {activeScene.endTime}s ({activeScene.duration}s)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-mono">{activeScene.id}</h3>
                  <div className="p-2.5 bg-[#050609] border border-[#141724] rounded-sm text-xs font-mono text-[#A0A5B3] italic">
                    &ldquo;{activeScene.narration}&rdquo;
                  </div>
                </div>

                {/* Available Assets to Link */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-white font-bold flex items-center justify-between">
                    <span>Link Media from Asset Library</span>
                    <span className="text-[10px] text-[#9298A5]">Click category role to attach</span>
                  </div>

                  {assets.length === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-[#9298A5] bg-[#050609] border border-[#141724] rounded-sm">
                      No assets in library. Upload files in the Asset Library tab first.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {assets.map((asset) => {
                        const isAttached = sceneLinkages[activeScene.id]?.assetIds?.includes(asset.id);

                        return (
                          <div
                            key={asset.id}
                            className="p-2.5 bg-[#050609] border border-[#141724] rounded-sm flex items-center justify-between gap-3 text-xs font-mono"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[#FF1738] font-bold">{asset.id}</span>
                              <span className="text-white truncate font-medium">{asset.title}</span>
                              <span className="text-[10px] text-[#9298A5] uppercase">({asset.category})</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isAttached ? (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-sm font-bold">
                                  ATTACHED
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleLinkAssetToActiveScene(asset.id, 'primaryVisual')}
                                    className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/40 rounded-sm cursor-pointer"
                                    title="Attach as Primary Visual Reference"
                                  >
                                    Visual Ref
                                  </button>
                                  <button
                                    onClick={() => handleLinkAssetToActiveScene(asset.id, 'voiceover')}
                                    className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/40 rounded-sm cursor-pointer"
                                    title="Attach as Voiceover Audio"
                                  >
                                    Voiceover
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs font-mono text-[#9298A5]">Select a scene from the left to manage linkages.</div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. GOOGLE FLOW PRODUCTION HANDOFF PROTOCOL                */}
      {/* ======================================================== */}
      {activeTabSubView === 'handoff' && (
        <div className="space-y-5">
          <div className="p-4 bg-[#0A0D15] border border-cyan-500/40 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Google Flow / VideoFX Production Handoff Protocol</span>
            </div>
            <p className="text-xs text-[#A0A5B3] leading-relaxed">
              ULTIMATETRON operates as the upstream architectural command center. Each prompt below is self-contained and ready to execute in Google Flow.
              Narration text is strictly byte-for-byte grounded in the approved script. Copy prompts individually or copy the complete production bundle.
            </p>
          </div>

          {/* Scene Prompt Handoff List */}
          <div className="space-y-4">
            {scenesList.map((sc) => {
              const linkage = sceneLinkages[sc.id];

              return (
                <div key={sc.id} className="bg-[#08090E] border border-[#171B26] p-4 rounded-sm space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#141724] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF1738] font-bold">SCENE {sc.number}</span>
                      <span className="text-[#9298A5]">({sc.startTime}s - {sc.endTime}s · {sc.duration}s target)</span>
                    </div>

                    <button
                      onClick={() => handleCopyText(sc.prompt, `prompt_${sc.id}`)}
                      className="px-2.5 py-1 text-[11px] bg-[#121520] hover:bg-[#1E2335] text-white border border-[#23293D] rounded-sm inline-flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedKey === `prompt_${sc.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#FF1738]" />
                          <span>Copy Flow Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Verbatim Narration Reference */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#9298A5] uppercase">Exact Approved Narration (Verbatim):</span>
                    <div className="p-2 bg-[#050609] border border-[#141724] rounded-sm text-white italic">
                      &ldquo;{sc.narration}&rdquo;
                    </div>
                  </div>

                  {/* Flow Prompt Content */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#FF1738] uppercase font-bold">Standalone Production Prompt:</span>
                    <div className="p-3 bg-[#050609] border border-[#161A26] rounded-sm text-[#F4F5FA] leading-relaxed select-all">
                      {sc.prompt}
                    </div>
                  </div>

                  {linkage?.assetIds?.length ? (
                    <div className="text-[11px] text-cyan-300">
                      Attached References: {linkage.assetIds.join(', ')}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. EXPORT HUB: JSON, MARKDOWN & MULTI-FILE ZIP           */}
      {/* ======================================================== */}
      {activeTabSubView === 'export' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#08090E] border border-[#171B26] rounded-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#141724]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Production Package Export Center
                </h3>
                <p className="text-xs text-[#A0A5B3] mt-0.5">
                  Exports genuine bundles with verified provenance and actual included files.
                </p>
              </div>

              {activeProdPkg && (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {activeProdPkg.id} (rev {activeProdPkg.version})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Option A: JSON Manifest */}
              <div className="p-4 bg-[#050609] border border-[#1A1F2D] rounded-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[#FF1738] font-bold uppercase text-[11px]">1. Structured Manifest</div>
                  <div className="text-white font-bold text-sm mt-1">JSON Package</div>
                  <p className="text-[11px] text-[#A0A5B3] mt-1">
                    Complete machine-readable JSON schema (v1) with provenance stamps and scene linkages.
                  </p>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  disabled={!activeProdPkg}
                  className="w-full py-2 bg-[#121520] hover:bg-[#1E2335] text-white border border-[#23293D] rounded-sm uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF1738]" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Option B: Markdown Production Brief */}
              <div className="p-4 bg-[#050609] border border-[#1A1F2D] rounded-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-cyan-400 font-bold uppercase text-[11px]">2. Human-Readable</div>
                  <div className="text-white font-bold text-sm mt-1">Markdown Brief</div>
                  <p className="text-[11px] text-[#A0A5B3] mt-1">
                    Comprehensive production guide formatted for human directors, audio leads, and prompt operators.
                  </p>
                </div>
                <button
                  onClick={handleDownloadMarkdown}
                  disabled={!activeProdPkg}
                  className="w-full py-2 bg-[#121520] hover:bg-[#1E2335] text-white border border-[#23293D] rounded-sm uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export Brief MD</span>
                </button>
              </div>

              {/* Option C: Multi-File ZIP Bundle */}
              <div className="p-4 bg-[#050609] border border-[#1A1F2D] rounded-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-amber-400 font-bold uppercase text-[11px]">3. Complete Media Bundle</div>
                  <div className="text-white font-bold text-sm mt-1">Production ZIP</div>
                  <p className="text-[11px] text-[#A0A5B3] mt-1">
                    Multi-file ZIP archive containing manifest, markdown, scripts, prompts, thumbnails, and actual uploaded media files.
                  </p>
                </div>
                <button
                  onClick={handleDownloadZIP}
                  disabled={!activeProdPkg || isExportingZip}
                  className="w-full py-2 bg-[#FF1738] hover:bg-[#FF3048] text-white rounded-sm uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 glow-crimson-sm"
                >
                  {isExportingZip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ZIP</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPLOAD PRODUCTION ASSET                           */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0D14] border border-[#1F2433] rounded-sm max-w-lg w-full p-6 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#1A1F2D] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#FF1738]" />
                <h3 className="text-sm font-bold text-white uppercase font-sans">
                  Upload Production Asset
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-xs font-mono text-[#9298A5] hover:text-white"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-3">
              {/* Asset Title */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Asset Title *</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Lead Subject Cybernetic Armor Reference"
                  className="w-full bg-[#050609] border border-[#1A1F2D] text-white px-3 py-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as AssetCategory)}
                  className="w-full bg-[#050609] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="reference_image">Reference Image</option>
                  <option value="voiceover_audio">Voiceover Audio</option>
                  <option value="ambient_music">Ambient / Music Bed</option>
                  <option value="generated_asset">Generated Asset</option>
                  <option value="final_deliverable">Final Deliverable</option>
                </select>
              </div>

              {/* Associate to Scene */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Link to Scene (Optional)</label>
                <select
                  value={uploadAssociatedScene}
                  onChange={(e) => setUploadAssociatedScene(e.target.value)}
                  className="w-full bg-[#050609] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs focus:border-[#FF1738] focus:outline-none"
                >
                  <option value="">None (Project Global)</option>
                  {scenesList.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      Scene {sc.number} ({sc.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Picker */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Select File (Image / Audio / Text)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#050609] border border-[#1A1F2D] text-[#A0A5B3] p-2 rounded-sm text-xs"
                />
              </div>

              {/* Mandatory checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={uploadIsMandatory}
                  onChange={(e) => setUploadIsMandatory(e.target.checked)}
                  className="rounded-sm"
                />
                <label htmlFor="mandatoryCheck" className="text-white text-[11px] cursor-pointer">
                  Mark as mandatory for production readiness export
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#9298A5] uppercase">Notes</label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Notes for production operator..."
                  className="w-full bg-[#050609] border border-[#1A1F2D] text-white p-2 rounded-sm text-xs h-16 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1A1F2D]">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 bg-[#121520] hover:bg-[#1E2335] text-white rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAsset}
                className="px-4 py-1.5 bg-[#FF1738] hover:bg-[#FF3048] text-white font-bold rounded-sm"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
