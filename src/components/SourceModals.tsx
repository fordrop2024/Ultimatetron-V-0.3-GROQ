/**
 * ULTIMATETRON — Source Story Modals
 * Add Source Story & Edit/Branch Version Modals with real-time duplicate detection.
 */

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SourceStory } from '../types';
import { storageService } from '../services/storage';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    sourceUrl?: string;
    publisher?: string;
    publicationDate?: string;
    tags: string[];
  }) => Promise<void>;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check duplicate on debounce
  useEffect(() => {
    if (!content.trim() && !title.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const check = await storageService.checkForDuplicates(title, content);
        if (check.isDuplicate && check.reason) {
          setDuplicateWarning(check.reason);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // ignore
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, content]);

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a descriptive title for this source story.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Please paste or write the verbatim source story text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        title,
        content, // Preserves exact whitespace and newlines
        sourceUrl: sourceUrl.trim() || undefined,
        publisher: publisher.trim() || undefined,
        publicationDate: publicationDate.trim() || undefined,
        tags,
      });

      // Reset
      setTitle('');
      setContent('');
      setSourceUrl('');
      setPublisher('');
      setPublicationDate('');
      setTagsInput('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save source story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0B0D14] border border-[#1E2333] rounded-sm p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1F2E]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Master Source Intake
            </span>
            <h2 className="text-lg font-bold text-[#F4F5FA] font-sans">
              Add New Source Story
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9298A5] hover:text-white rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="p-3 bg-[#1C1208] border border-amber-600/40 rounded-sm flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-amber-400">
                Potential Duplicate Story Detected
              </div>
              <div className="text-[#A0A5B3] leading-relaxed">
                {duplicateWarning}
                <br />
                <span className="text-neutral-400">
                  You may still save this record if it represents an intentional update or variant.
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-[#1A0A0E] border border-[#FF1738]/50 rounded-sm flex items-start gap-3 text-xs text-[#FF3048]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-[#F4F5FA] flex items-center justify-between">
              <span>Story Title *</span>
              <span className="text-[11px] text-[#9298A5] font-normal">Required</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breakthrough in Room-Temperature Superconductivity Verification"
              className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] placeholder-[#9298A5]/50 focus:outline-none font-sans"
            />
          </div>

          {/* Verbatim Source Content */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#F4F5FA]">
              <span>Verbatim Source Story *</span>
              <span className="text-[11px] text-[#A0A5B3] tabular-nums font-mono normal-case">
                {wordCount} words · {charCount} chars
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste original news article, transcript, research brief, or story here. All formatting, quotes, and punctuation are strictly preserved..."
              className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm p-3 text-xs text-[#F4F5FA] placeholder-[#9298A5]/50 focus:outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">
                Source URL (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] placeholder-[#9298A5]/50 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">
                Publisher / Author
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="e.g. Nature Physics / Reuters"
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] placeholder-[#9298A5]/50 focus:outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">
                Publication Date
              </label>
              <input
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Science, Physics, Breaking, Discovery"
              className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] placeholder-[#9298A5]/50 focus:outline-none font-sans"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1A1F2E]">
            <div className="text-[11px] font-mono text-[#9298A5]">
              Strict Monotonic Story ID assigned automatically
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm transition-all shadow-[0_0_12px_rgba(255,23,56,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Source Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: SourceStory | null;
  onSave: (
    id: string,
    updates: {
      title?: string;
      content?: string;
      sourceUrl?: string;
      publisher?: string;
      publicationDate?: string;
      tags?: string[];
      changeNote?: string;
      createNewVersion?: boolean;
    }
  ) => Promise<void>;
}

export const EditSourceModal: React.FC<EditSourceModalProps> = ({
  isOpen,
  onClose,
  story,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [createNewVersion, setCreateNewVersion] = useState(true);
  const [changeNote, setChangeNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setContent(story.content);
      setSourceUrl(story.sourceUrl || '');
      setPublisher(story.publisher || '');
      setPublicationDate(story.publicationDate || '');
      setTagsInput(story.tags.join(', '));
      setChangeNote('');
      setCreateNewVersion(true);
    }
  }, [story]);

  if (!isOpen || !story) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave(story.id, {
        title,
        content,
        sourceUrl: sourceUrl.trim() || undefined,
        publisher: publisher.trim() || undefined,
        publicationDate: publicationDate.trim() || undefined,
        tags,
        changeNote: changeNote.trim() || undefined,
        createNewVersion,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0B0D14] border border-[#1E2333] rounded-sm p-6 space-y-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1F2E]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
              Source Revision Control
            </span>
            <h2 className="text-lg font-bold text-[#F4F5FA] font-sans">
              Edit {story.id} (Current v{story.version})
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#9298A5] hover:text-white rounded-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Version branching choice */}
          <div className="p-3 bg-[#07080C] border border-[#1A1F2E] rounded-sm space-y-2">
            <div className="text-xs font-mono uppercase text-[#F4F5FA] font-semibold">
              Versioning Strategy
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-2.5 rounded-sm border cursor-pointer text-xs flex items-center gap-2 ${
                  createNewVersion
                    ? 'bg-[#151926] border-[#FF1738] text-white font-semibold'
                    : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3]'
                }`}
              >
                <input
                  type="radio"
                  name="versionStrategy"
                  checked={createNewVersion}
                  onChange={() => setCreateNewVersion(true)}
                  className="sr-only"
                />
                <CheckCircle2 className={`w-4 h-4 ${createNewVersion ? 'text-[#FF1738]' : 'text-neutral-600'}`} />
                <div>
                  <div>Create New Version (v{story.version + 1})</div>
                  <div className="text-[10px] text-[#9298A5] font-normal">
                    Preserves historical snapshot of v{story.version}
                  </div>
                </div>
              </label>

              <label
                className={`p-2.5 rounded-sm border cursor-pointer text-xs flex items-center gap-2 ${
                  !createNewVersion
                    ? 'bg-[#151926] border-[#FF1738] text-white font-semibold'
                    : 'bg-[#090A10] border-[#1C202C] text-[#A0A5B3]'
                }`}
              >
                <input
                  type="radio"
                  name="versionStrategy"
                  checked={!createNewVersion}
                  onChange={() => setCreateNewVersion(false)}
                  className="sr-only"
                />
                <CheckCircle2 className={`w-4 h-4 ${!createNewVersion ? 'text-[#FF1738]' : 'text-neutral-600'}`} />
                <div>
                  <div>In-Place Edit (Stay v{story.version})</div>
                  <div className="text-[10px] text-[#9298A5] font-normal">
                    Fix typos without creating a new revision
                  </div>
                </div>
              </label>
            </div>

            {createNewVersion && (
              <div className="pt-2">
                <input
                  type="text"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Revision note (e.g. Added second-source confirmation paragraph)..."
                  className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] placeholder-[#9298A5]/50 focus:outline-none font-sans"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#F4F5FA]">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-2 px-3 text-xs text-[#F4F5FA] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-[#F4F5FA]">
              <span>Verbatim Source Story</span>
              <span className="text-[11px] text-[#A0A5B3]">
                {content.length} chars
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm p-3 text-xs text-[#F4F5FA] focus:outline-none font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#A0A5B3]">Publication Date</label>
              <input
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full bg-[#05060A] border border-[#1C202C] focus:border-[#FF1738] rounded-sm py-1.5 px-2.5 text-xs text-[#F4F5FA] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1F2E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold uppercase text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm"
            >
              {isSubmitting ? 'Updating...' : createNewVersion ? `Save as Version ${story.version + 1}` : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
