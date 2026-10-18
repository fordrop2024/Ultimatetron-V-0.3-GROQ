/**
 * ULTIMATETRON — Phase 2: Canonical Project Configuration
 * Implements full functional new-project flow and project reopening:
 * - Rich source selection by Story ID, title, saved date, and version
 * - Live verbatim source preview panel
 * - Ratio switching with automatic duration recalibration:
 *   - 9:16 Shorts/Reels: strictly 24s (3 clips), 32s (4 clips), 40s (5 clips), 48s (6 clips) [8s/clip]
 *   - 16:9 Long Video: minimum 240 seconds (4 minutes) with presets & custom duration
 * - Canonical settings object: Hindi/English, 16 Content Modes, 6 Tones, 8 Visual Styles
 * - Full persistence, validation, and reopening support
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  AspectRatio,
  SupportedLanguage,
  ContentMode,
  ContentTone,
  VisualStyle,
  SourceStory,
  ProjectConfig
} from '../types';

interface ProjectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SourceStory[];
  initialSourceId?: string;
  projectToEdit?: ProjectConfig | null;
  onSave: (
    config: Omit<ProjectConfig, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  onOpenAddSource?: () => void;
}

export const ProjectConfigModal: React.FC<ProjectConfigModalProps> = ({
  isOpen,
  onClose,
  sources,
  initialSourceId,
  projectToEdit,
  onSave,
  onOpenAddSource,
}) => {
  const [name, setName] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [isSourcePreviewExpanded, setIsSourcePreviewExpanded] = useState(false);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [duration, setDuration] = useState<number>(24);
  const [customLongDuration, setCustomLongDuration] = useState<string>('240');
  const [isCustomDurationActive, setIsCustomDurationActive] = useState(false);

  const [language, setLanguage] = useState<SupportedLanguage>('Hindi');
  const [contentMode, setContentMode] = useState<ContentMode>('Explainer');
  const [tone, setTone] = useState<ContentTone>('Urgent');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('Cinematic');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize or reset form based on props
  useEffect(() => {
    if (!isOpen) return;

    if (projectToEdit) {
      // Reopening existing project
      setName(projectToEdit.name);
      setSelectedSourceId(projectToEdit.sourceStoryId);
      setAspectRatio(projectToEdit.aspectRatio);
      setDuration(projectToEdit.duration);
      setLanguage(projectToEdit.language);
      setContentMode(projectToEdit.contentMode);
      setTone(projectToEdit.tone);
      setVisualStyle(projectToEdit.visualStyle);

      if (projectToEdit.aspectRatio === '16:9') {
        const presets = [240, 300, 360, 480, 600];
        if (!presets.includes(projectToEdit.duration)) {
          setIsCustomDurationActive(true);
          setCustomLongDuration(String(projectToEdit.duration));
        } else {
          setIsCustomDurationActive(false);
        }
      }
    } else {
      // New project initialization
      setAspectRatio('9:16');
      setDuration(24);
      setLanguage('Hindi');
      setContentMode('Explainer');
      setTone('Urgent');
      setVisualStyle('Cinematic');
      setIsCustomDurationActive(false);
      setCustomLongDuration('240');

      if (initialSourceId) {
        setSelectedSourceId(initialSourceId);
        const match = sources.find((s) => s.id === initialSourceId);
        if (match) {
          setName(`${match.title.slice(0, 45)} Brief`);
        }
      } else if (sources.length > 0) {
        setSelectedSourceId(sources[0].id);
        setName(`${sources[0].title.slice(0, 45)} Brief`);
      } else {
        setSelectedSourceId('');
        setName('');
      }
    }
    setValidationError(null);
  }, [isOpen, projectToEdit, initialSourceId, sources]);

  // Find currently selected source object
  const selectedSource = useMemo(() => {
    return sources.find((s) => s.id === selectedSourceId) || null;
  }, [sources, selectedSourceId]);

  // Filter sources for selection list
  const filteredSources = useMemo(() => {
    if (!sourceSearchQuery.trim()) return sources;
    const q = sourceSearchQuery.toLowerCase().trim();
    return sources.filter((s) => {
      return (
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [sources, sourceSearchQuery]);

  // Handle aspect ratio toggle with immediate duration rule recalibration
  const handleRatioToggle = (newRatio: AspectRatio) => {
    setAspectRatio(newRatio);
    setValidationError(null);
    if (newRatio === '9:16') {
      setIsCustomDurationActive(false);
      // Valid 9:16 durations: 24, 32, 40, 48
      if (![24, 32, 40, 48].includes(duration)) {
        setDuration(24);
      }
    } else {
      // 16:9 Long Video: minimum 240 seconds
      if (duration < 240) {
        setDuration(240);
        setCustomLongDuration('240');
      }
    }
  };

  const handleCustomDurationChange = (valStr: string) => {
    setCustomLongDuration(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      setDuration(parsed);
      if (parsed < 240) {
        setValidationError('16:9 Long-Form requires a minimum duration of 240 seconds (4 minutes).');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError('Please enter a valid numeric duration in seconds.');
    }
  };

  const handleSourceSelect = (src: SourceStory) => {
    setSelectedSourceId(src.id);
    setValidationError(null);
    if (!projectToEdit && (!name || name.includes('Brief'))) {
      setName(`${src.title.slice(0, 45)} Brief`);
    }
  };

  if (!isOpen) return null;

  const contentModes: ContentMode[] = [
    'Explainer',
    'Documentary',
    'Breaking News',
    'Detailed Explainer',
    'Horror Story',
    'Funny / Comedy',
    'Sci-Fi Explainer',
    'Mystery',
    'History',
    'Biography',
    'Investigative',
    'Myth vs Fact',
    'Case Study',
    'Educational',
    'Top Facts / List',
    'Motivational Story',
  ];

  const tones: ContentTone[] = [
    'Neutral',
    'Urgent',
    'Suspenseful',
    'Warm',
    'Humorous',
    'Analytical',
  ];

  const visualStyles: VisualStyle[] = [
    'Cinematic',
    '2D Animation',
    '3D Animation',
    'Cartoon',
    'Comic-Book',
    'Vector Animation',
    'Documentary Realism',
    'Infographic / Motion Graphics',
  ];

  const calculatedClips = aspectRatio === '9:16' ? Math.round(duration / 8) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Project name is required.');
      return;
    }

    if (!selectedSource) {
      setValidationError('A valid source story must be selected from the library.');
      return;
    }

    if (aspectRatio === '9:16') {
      if (![24, 32, 40, 48].includes(duration)) {
        setValidationError('For 9:16 Shorts/Reels, duration must be strictly 24, 32, 40, or 48 seconds.');
        return;
      }
    } else if (aspectRatio === '16:9') {
      if (duration < 240) {
        setValidationError('16:9 Long-Form videos must have a minimum duration of 240 seconds (4 minutes).');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          sourceStoryId: selectedSource.id,
          sourceVersion: selectedSource.version, // Binds exact source revision
          status: projectToEdit ? projectToEdit.status : 'not_started',
          aspectRatio,
          duration,
          clipCount: calculatedClips,
          language,
          contentMode,
          tone,
          visualStyle,
        },
        projectToEdit ? projectToEdit.id : undefined
      );
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save project settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#090B12] border border-[#1E2333] rounded-sm p-5 sm:p-7 space-y-6 shadow-2xl my-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1F2E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
                Phase 2 · Canonical Pipeline Configuration
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F4F5FA] font-sans">
              {projectToEdit ? `Reopen Project: ${projectToEdit.id}` : 'Initialize New Production Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9298A5] hover:text-white rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 bg-[#1A0A0E] border border-[#FF1738]/60 rounded-sm flex items-center gap-2.5 text-xs text-[#FF3048]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold flex items-center justify-between">
              <span>Project Name *</span>
              <span className="text-[11px] text-[#9298A5] font-normal font-sans">
                Human-readable project title
              </span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Voyager 1 Telemetry Glitch & Memory Recovery"
              className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] placeholder-[#9298A5]/40 focus:outline-none font-sans"
            />
          </div>

          {/* Section: Source Selection (Story ID, Title, Saved Date, Version, Preview) */}
          <div className="space-y-3 p-4 bg-[#06070B] border border-[#161A26] rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF1738]" />
                <span className="text-xs font-mono uppercase text-[#F4F5FA] font-bold">
                  Select Source Story *
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#9298A5]">
                {sources.length} stories available in library
              </span>
            </div>

            {sources.length === 0 ? (
              <div className="p-6 bg-[#0E1018] border border-[#FF1738]/30 rounded-sm text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-[#FF1738] mx-auto" />
                <div className="text-xs text-[#F4F5FA] font-medium">
                  Source Library is empty. A project requires an authentic source story.
                </div>
                {onOpenAddSource && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddSource();
                    }}
                    className="px-4 py-1.5 text-xs font-semibold uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm"
                  >
                    Add Source Story Now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search bar for sources if > 3 */}
                {sources.length > 3 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#9298A5] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={sourceSearchQuery}
                      onChange={(e) => setSourceSearchQuery(e.target.value)}
                      placeholder="Search saved sources by ID, title, or tags..."
                      className="w-full bg-[#090B12] border border-[#1A1F2E] focus:border-[#FF1738] rounded-sm py-1.5 pl-8 pr-3 text-xs text-[#F4F5FA] placeholder-[#9298A5]/40 focus:outline-none font-sans"
                    />
                  </div>
                )}

                {/* Source Story Selection Grid */}
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {filteredSources.map((s) => {
                    const isSelected = selectedSourceId === s.id;
                    const savedDateFormatted = new Date(s.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSourceSelect(s)}
                        className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#121624] border-[#FF1738] shadow-[0_0_10px_rgba(255,23,56,0.2)]'
                            : 'bg-[#090A10] border-[#161922] hover:bg-[#0D0F17] hover:border-[#222838]'
                        }`}
                      >
                        <div className="space-y-1 truncate flex-1">
                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className="font-bold text-[#FF1738]">{s.id}</span>
                            <span className="text-[#9298A5]" aria-hidden="true">·</span>
                            <span className="text-[#F4F5FA]">v{s.version}</span>
                            <span className="text-[#9298A5]" aria-hidden="true">·</span>
                            <span className="text-[#A0A5B3] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#9298A5]" />
                              Saved {savedDateFormatted}
                            </span>
                            <span className="text-[#9298A5]" aria-hidden="true">·</span>
                            <span className="text-[#9298A5] tabular-nums">{s.wordCount} words</span>
                          </div>
                          <div className="text-xs font-semibold text-[#F4F5FA] truncate">
                            {s.title}
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#FF1738] shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Live Verbatim Source Preview Drawer */}
                {selectedSource && (
                  <div className="p-3 bg-[#0B0D15] border border-[#1A1F2E] rounded-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[#FF1738] font-bold">Selected Source: {selectedSource.id}</span>
                        <span className="text-[#9298A5]">·</span>
                        <span className="text-white font-semibold">Active Revision: v{selectedSource.version}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSourcePreviewExpanded(!isSourcePreviewExpanded)}
                        className="text-[11px] font-mono text-[#9298A5] hover:text-white flex items-center gap-1"
                      >
                        <span>{isSourcePreviewExpanded ? 'Collapse Preview' : 'Expand Verbatim Preview'}</span>
                        {isSourcePreviewExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className={`text-xs text-[#A0A5B3] font-mono leading-relaxed bg-[#05060A] p-2.5 rounded-sm border border-[#141724] ${
                      isSourcePreviewExpanded ? 'max-h-60 overflow-y-auto whitespace-pre-wrap' : 'line-clamp-2'
                    }`}>
                      {selectedSource.content}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#9298A5] flex-wrap">
                      <span>{selectedSource.wordCount} words</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedSource.charCount} chars</span>
                      {selectedSource.publisher && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Publisher: {selectedSource.publisher}</span>
                        </>
                      )}
                      {selectedSource.publicationDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Published: {selectedSource.publicationDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Aspect Ratio Toggle & Duration Rules */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold flex items-center justify-between">
                <span>Aspect Ratio Specification *</span>
                <span className="text-[11px] text-[#A0A5B3] font-mono">
                  Controls clip math & pacing model
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 9:16 Shorts / Reels */}
                <button
                  type="button"
                  onClick={() => handleRatioToggle('9:16')}
                  className={`p-3.5 rounded-sm border text-left cursor-pointer transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-[#151926] border-[#FF1738] shadow-[0_0_12px_rgba(255,23,56,0.2)]'
                      : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3] hover:border-[#2C3348]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-mono text-[#FF1738]">9:16</span>
                      <span>Shorts / Reels</span>
                    </span>
                    {aspectRatio === '9:16' && <CheckCircle2 className="w-4 h-4 text-[#FF1738]" />}
                  </div>
                  <div className="mt-1.5 text-[11px] text-[#9298A5] font-mono leading-relaxed">
                    Strict 8-second clips · 24s (3 clips), 32s (4 clips), 40s (5 clips), or 48s (6 clips)
                  </div>
                </button>

                {/* 16:9 Long Video */}
                <button
                  type="button"
                  onClick={() => handleRatioToggle('16:9')}
                  className={`p-3.5 rounded-sm border text-left cursor-pointer transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-[#151926] border-[#FF1738] shadow-[0_0_12px_rgba(255,23,56,0.2)]'
                      : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3] hover:border-[#2C3348]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-mono text-[#FF1738]">16:9</span>
                      <span>Long Video</span>
                    </span>
                    {aspectRatio === '16:9' && <CheckCircle2 className="w-4 h-4 text-[#FF1738]" />}
                  </div>
                  <div className="mt-1.5 text-[11px] text-[#9298A5] font-mono leading-relaxed">
                    Long-Form narrative scene planning · Minimum 240 seconds (4 minutes)
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Duration Selector based on Aspect Ratio */}
            <div className="p-4 bg-[#06070B] border border-[#161A26] rounded-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-[#F4F5FA]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF1738]" />
                  <span className="font-bold">Target Duration & Clip Calculation *</span>
                </div>
                <span className="text-xs font-bold text-[#FF1738] tabular-nums">
                  {aspectRatio === '9:16'
                    ? `${duration}s (${calculatedClips} clips @ 8s target)`
                    : `${duration}s (${Math.floor(duration / 60)}m ${duration % 60}s)`}
                </span>
              </div>

              {aspectRatio === '9:16' ? (
                /* 9:16 strictly 4 duration choices */
                <div>
                  <div className="grid grid-cols-4 gap-2 font-mono">
                    {[
                      { sec: 24, clips: 3 },
                      { sec: 32, clips: 4 },
                      { sec: 40, clips: 5 },
                      { sec: 48, clips: 6 },
                    ].map((item) => (
                      <button
                        key={item.sec}
                        type="button"
                        onClick={() => {
                          setDuration(item.sec);
                          setValidationError(null);
                        }}
                        className={`p-3 text-xs rounded-sm border text-center transition-all cursor-pointer ${
                          duration === item.sec
                            ? 'bg-[#FF1738] text-white border-[#FF1738] font-bold shadow-[0_0_10px_rgba(255,23,56,0.3)]'
                            : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3] hover:text-white hover:border-[#2C3348]'
                        }`}
                      >
                        <div className="text-sm font-bold">{item.sec}s</div>
                        <div className="text-[10px] mt-0.5 opacity-90">{item.clips} clips</div>
                        <div className="text-[9px] text-[#9298A5] mt-0.5">8s / clip</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-[#9298A5]">
                    Pacing constraint: Every Shorts scene adheres strictly to 8-second visual prompt segments.
                  </div>
                </div>
              ) : (
                /* 16:9 Long Video minimum 240 seconds with presets and custom option */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                    {[
                      { sec: 240, label: '4 min (Min)' },
                      { sec: 300, label: '5 min' },
                      { sec: 360, label: '6 min' },
                      { sec: 480, label: '8 min' },
                      { sec: 600, label: '10 min' },
                    ].map((item) => {
                      const isActive = !isCustomDurationActive && duration === item.sec;
                      return (
                        <button
                          key={item.sec}
                          type="button"
                          onClick={() => {
                            setIsCustomDurationActive(false);
                            setDuration(item.sec);
                            setCustomLongDuration(String(item.sec));
                            setValidationError(null);
                          }}
                          className={`p-2.5 text-xs rounded-sm border text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#FF1738] text-white border-[#FF1738] font-bold shadow-[0_0_10px_rgba(255,23,56,0.3)]'
                              : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3] hover:text-white hover:border-[#2C3348]'
                          }`}
                        >
                          <div className="text-sm font-bold">{item.sec}s</div>
                          <div className="text-[10px] mt-0.5 opacity-90">{item.label}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom duration toggle for 16:9 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#161A26]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomDurationActive(!isCustomDurationActive);
                          if (!isCustomDurationActive && duration < 240) {
                            setDuration(240);
                            setCustomLongDuration('240');
                          }
                        }}
                        className={`px-3 py-1 text-xs font-mono rounded-sm border ${
                          isCustomDurationActive
                            ? 'bg-[#151926] border-[#FF1738] text-white font-bold'
                            : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3]'
                        }`}
                      >
                        Custom Duration (&ge; 240s)
                      </button>
                    </div>

                    {isCustomDurationActive && (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <label className="text-[#A0A5B3]">Duration in seconds:</label>
                        <input
                          type="number"
                          min={240}
                          step={10}
                          value={customLongDuration}
                          onChange={(e) => handleCustomDurationChange(e.target.value)}
                          className="w-24 bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1 px-2 text-xs text-white text-right font-mono"
                        />
                        <span className="text-[#9298A5]">sec</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Language, Tone, Content Mode, Visual Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              >
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Tone */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ContentTone)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Mode (All 16 blueprint modes) */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold">
                Content Mode
              </label>
              <select
                value={contentMode}
                onChange={(e) => setContentMode(e.target.value as ContentMode)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              >
                {contentModes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Style (All 8 blueprint styles) */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold">
                Visual Style
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              >
                {visualStyles.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1A1F2E]">
            <div className="text-[11px] font-mono text-[#9298A5] hidden sm:block">
              {projectToEdit ? `Updating ${projectToEdit.id}` : 'Canonical settings will be persisted'}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedSource}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm transition-all shadow-[0_0_12px_rgba(255,23,56,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? 'Saving Settings...'
                  : projectToEdit
                  ? 'Save Updated Settings'
                  : 'Save & Initialize Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
