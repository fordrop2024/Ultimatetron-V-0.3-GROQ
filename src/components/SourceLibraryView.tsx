/**
 * ULTIMATETRON — Source Story Library Module
 * Core functional milestone:
 * - Unique Story ID generation (STORY-000001)
 * - Exact verbatim source preservation (line breaks, punctuation, unicode)
 * - Non-destructive duplicate detection warning
 * - Search, filter, versioning, and safe deletion
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Calendar,
  ExternalLink,
  Layers,
  Trash2,
  Edit3,
  Copy,
  Check,
  PlayCircle,
  Clock,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { SourceStory } from '../types';

interface SourceLibraryViewProps {
  sources: SourceStory[];
  selectedStory: SourceStory | null;
  onSelectStory: (story: SourceStory | null) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (story: SourceStory) => void;
  onDeleteStory: (id: string) => void;
  onCreateProjectFromSource: (story: SourceStory) => void;
}

export const SourceLibraryView: React.FC<SourceLibraryViewProps> = ({
  sources,
  selectedStory,
  onSelectStory,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteStory,
  onCreateProjectFromSource,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedContent, setCopiedContent] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'text' | 'metadata' | 'versions'>('text');

  // Filter sources
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources;
    const q = searchQuery.toLowerCase().trim();
    return sources.filter((s) => {
      const matchId = s.id.toLowerCase().includes(q);
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchContent = s.content.toLowerCase().includes(q);
      const matchPublisher = s.publisher?.toLowerCase().includes(q);
      const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
      return matchId || matchTitle || matchContent || matchPublisher || matchTags;
    });
  }, [sources, searchQuery]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const lines = useMemo(() => {
    if (!selectedStory) return [];
    return selectedStory.content.split('\n');
  }, [selectedStory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1D27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Master Source Vault
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            Source Story Library
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Preserve authentic source records verbatim. Every script downstream derives from an approved source version.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm transition-all shadow-[0_0_12px_rgba(255,23,56,0.25)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Source Story</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Table on left / Detail on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Source List Column */}
        <div className={`space-y-4 ${selectedStory ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9298A5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Story ID (e.g. STORY-000001), title, content, publisher..."
              className="w-full bg-[#090A10] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 pl-9 pr-4 text-xs text-[#F4F5FA] placeholder-[#9298A5]/60 focus:outline-none transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#9298A5] hover:text-white"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Records Counter (Zero-Pill, Unboxed) */}
          <div className="flex items-center justify-between text-xs text-[#9298A5] px-1 font-mono">
            <span>
              Showing <span className="text-[#F4F5FA] font-bold tabular-nums">{filteredSources.length}</span> of{' '}
              <span className="tabular-nums">{sources.length}</span> records
            </span>
            <span>Non-reusable monotonic sequence</span>
          </div>

          {/* Story List Items */}
          {filteredSources.length === 0 ? (
            <div className="p-12 bg-[#08090E] border border-[#161922] rounded-sm text-center space-y-4">
              <BookOpen className="w-8 h-8 text-[#9298A5] mx-auto opacity-50" />
              <div className="text-sm font-medium text-[#F4F5FA]">
                {searchQuery ? 'No matching stories found' : 'No source stories recorded yet'}
              </div>
              <p className="text-xs text-[#A0A5B3] max-w-sm mx-auto">
                {searchQuery
                  ? 'Try refining your query or clear search terms to view all records.'
                  : 'Add your first verbatim news brief, document, or research article.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Story</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              {filteredSources.map((story) => {
                const isSelected = selectedStory?.id === story.id;
                return (
                  <div
                    key={story.id}
                    onClick={() => onSelectStory(story)}
                    className={`p-4 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#10131D] border-[#FF1738] shadow-[0_0_12px_rgba(255,23,56,0.15)]'
                        : 'bg-[#090A10] border-[#161922] hover:bg-[#0D0F16] hover:border-[#222838]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      {/* Monospace Story ID */}
                      <span className="font-mono font-bold text-[#FF1738] tracking-wider">
                        {story.id}
                      </span>
                      {/* Metadata Separator (Zero-Pill) */}
                      <div className="flex items-center gap-2 text-[11px] text-[#A0A5B3] font-mono">
                        <span>v{story.version}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{story.wordCount} words</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm font-semibold text-[#F4F5FA] line-clamp-1">
                      {story.title}
                    </div>

                    <p className="mt-1 text-xs text-[#A0A5B3] line-clamp-2 leading-relaxed">
                      {story.content}
                    </p>

                    {/* Metadata tags (unboxed text) */}
                    {story.tags.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#9298A5] flex-wrap">
                        {story.tags.slice(0, 3).map((tag, i) => (
                          <React.Fragment key={tag}>
                            {i > 0 && <span aria-hidden="true">/</span>}
                            <span>{tag}</span>
                          </React.Fragment>
                        ))}
                        {story.tags.length > 3 && (
                          <span>+{story.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Story Detail Panel */}
        {selectedStory && (
          <div className="lg:col-span-7 bg-[#08090E] border border-[#1A1E2B] rounded-sm p-6 space-y-6">
            {/* Header info */}
            <div className="space-y-2 pb-4 border-b border-[#171A24]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#FF1738] font-bold tracking-wider">
                    {selectedStory.id}
                  </span>
                  <span className="text-[#9298A5]">·</span>
                  <span className="text-[#F4F5FA]">Revision v{selectedStory.version}</span>
                  <span className="text-[#9298A5]">·</span>
                  <span className="text-[#A0A5B3]">
                    Saved {new Date(selectedStory.updatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCreateProjectFromSource(selectedStory)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </button>

                  <button
                    onClick={() => onOpenEditModal(selectedStory)}
                    className="p-1.5 text-[#A0A5B3] hover:text-white bg-[#10121C] border border-[#22283A] rounded-sm"
                    title="Edit or create new version"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 text-[#9298A5] hover:text-[#FF1738] bg-[#10121C] border border-[#22283A] rounded-sm"
                    title="Delete source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold text-[#F4F5FA] font-sans">
                {selectedStory.title}
              </h2>

              {/* Publisher & Source Link */}
              <div className="flex items-center gap-3 text-xs text-[#A0A5B3] font-mono flex-wrap">
                {selectedStory.publisher && (
                  <span>Publisher: {selectedStory.publisher}</span>
                )}
                {selectedStory.publicationDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#9298A5]" />
                      {selectedStory.publicationDate}
                    </span>
                  </>
                )}
                {selectedStory.sourceUrl && (
                  <>
                    <span aria-hidden="true">·</span>
                    <a
                      href={selectedStory.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF1738] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Source Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Sub-tabs: Text / Metadata / Versions */}
            <div className="flex items-center justify-between gap-4 border-b border-[#171A24] pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDetailTab('text')}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm ${
                    activeDetailTab === 'text'
                      ? 'bg-[#151926] text-white font-bold'
                      : 'text-[#9298A5] hover:text-[#F4F5FA]'
                  }`}
                >
                  Original Text
                </button>
                <button
                  onClick={() => setActiveDetailTab('metadata')}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm ${
                    activeDetailTab === 'metadata'
                      ? 'bg-[#151926] text-white font-bold'
                      : 'text-[#9298A5] hover:text-[#F4F5FA]'
                  }`}
                >
                  Integrity & Metrics
                </button>
                <button
                  onClick={() => setActiveDetailTab('versions')}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm ${
                    activeDetailTab === 'versions'
                      ? 'bg-[#151926] text-white font-bold'
                      : 'text-[#9298A5] hover:text-[#F4F5FA]'
                  }`}
                >
                  Version Tree ({selectedStory.versionHistory.length})
                </button>
              </div>

              {activeDetailTab === 'text' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                    className="text-[11px] font-mono text-[#9298A5] hover:text-white px-2 py-0.5 border border-[#1F2436] rounded-sm"
                  >
                    {showLineNumbers ? 'Hide Line #' : 'Show Line #'}
                  </button>
                  <button
                    onClick={() => handleCopyText(selectedStory.content)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9298A5] hover:text-[#FF1738] px-2 py-0.5 border border-[#1F2436] rounded-sm"
                  >
                    {copiedContent ? (
                      <>
                        <Check className="w-3 h-3 text-[#16A34A]" />
                        <span className="text-[#16A34A]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Tab: Verbatim Original Text */}
            {activeDetailTab === 'text' && (
              <div className="bg-[#05060A] border border-[#161924] rounded-sm p-4 font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto">
                <div className="space-y-1">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      {showLineNumbers && (
                        <span className="text-[#9298A5]/40 select-none w-8 text-right shrink-0 tabular-nums">
                          {idx + 1}
                        </span>
                      )}
                      <span className="text-[#F4F5FA] whitespace-pre-wrap break-words flex-1">
                        {line || ' '}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Integrity & Metrics */}
            {activeDetailTab === 'metadata' && (
              <div className="space-y-4 font-mono text-xs text-[#A0A5B3]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                    <div className="text-[#9298A5] text-[10px] uppercase">Word Count</div>
                    <div className="text-xl font-bold text-white tabular-nums mt-1">
                      {selectedStory.wordCount}
                    </div>
                    <div className="text-[10px] text-[#9298A5] mt-1">
                      Est. Narration: ~{Math.ceil(selectedStory.wordCount / 2.5)}s @ 150wpm
                    </div>
                  </div>

                  <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                    <div className="text-[#9298A5] text-[10px] uppercase">Character Count</div>
                    <div className="text-xl font-bold text-white tabular-nums mt-1">
                      {selectedStory.charCount}
                    </div>
                    <div className="text-[10px] text-[#9298A5] mt-1">
                      Exact byte length preserved
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0A0C13] border border-[#181C2A] rounded-sm space-y-2">
                  <div className="text-[11px] text-[#F4F5FA] font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF1738]" />
                    <span>Fidelity Invariant Verification</span>
                  </div>
                  <p className="text-[11px] text-[#A0A5B3] leading-relaxed">
                    This source is preserved in raw format. Line endings (\n, \r\n), indentation, quotation marks, and special symbols are never normalized or truncated.
                  </p>
                  <div className="pt-2 text-[10px] text-[#9298A5] border-t border-[#181C2A]">
                    Created: {selectedStory.createdAt} · Modified: {selectedStory.updatedAt}
                  </div>
                </div>

                {selectedStory.tags.length > 0 && (
                  <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
                    <div className="text-[#9298A5] text-[10px] uppercase mb-1">Tags</div>
                    <div className="text-xs text-[#F4F5FA] flex items-center gap-2 flex-wrap">
                      {selectedStory.tags.map((tag, i) => (
                        <span key={tag} className="text-xs">
                          {i > 0 && <span className="text-[#9298A5] mr-2">·</span>}
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Version Tree */}
            {activeDetailTab === 'versions' && (
              <div className="space-y-3 font-mono text-xs">
                {selectedStory.versionHistory.map((v) => (
                  <div
                    key={v.version}
                    className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#FF1738]">
                        Version {v.version} {v.version === selectedStory.version && '(Current Active)'}
                      </span>
                      <span className="text-[10px] text-[#9298A5]">
                        {new Date(v.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {v.changeNote && (
                      <div className="text-[11px] text-[#A0A5B3]">
                        Note: {v.changeNote}
                      </div>
                    )}
                    <div className="text-[10px] text-[#9298A5]">
                      Snapshot Size: {v.contentSnapshot.length} chars
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0C0E16] border border-[#FF1738]/50 rounded-sm p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#FF1738]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Confirm Deletion of Source Record
              </h3>
            </div>
            <p className="text-xs text-[#A0A5B3] leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{selectedStory.id}</strong> (&ldquo;{selectedStory.title}&rdquo;)?
              <br /><br />
              <span className="text-[#FF1738]">Note:</span> By specification, this Story ID will never be reused, preserving monotonic audit integrity.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C202E]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStory(selectedStory.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
