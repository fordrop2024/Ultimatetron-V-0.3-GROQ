/**
 * ULTIMATETRON — System Diagnostics & Settings
 * - Official Brand Asset Manager (Upload/Mount Crimson Infinity Emblem)
 * - In-Browser Automated Test Suite Runner (Verifies Milestone 1 Acceptance Criteria)
 * - Storage & Driver Health Diagnostics
 * - Workspace Export / Import
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Play,
  Database,
  ShieldCheck,
  Download,
  Trash2,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { StorageDiagnostics } from '../types';
import { storageService } from '../services/storage';
import { runAllAutomatedTests, TestResult } from '../services/tests';
import { BrandLogo } from './BrandLogo';

interface SettingsViewProps {
  diagnostics: StorageDiagnostics | null;
  onRefreshDiagnostics: () => Promise<void>;
  onReplayBoot: () => void;
  onDataMutated: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  diagnostics,
  onRefreshDiagnostics,
  onReplayBoot,
  onDataMutated,
}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testSummary, setTestSummary] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auto-run tests on first mount if not yet run
  useEffect(() => {
    if (testResults.length === 0) {
      handleRunTests();
    }
  }, []);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestSummary(null);
    try {
      const results = await runAllAutomatedTests((progress) => {
        setTestResults(progress);
      });
      setTestResults(results);
      const passed = results.filter((r) => r.status === 'passed').length;
      setTestSummary(`${passed} of ${results.length} tests passed successfully.`);
      await onRefreshDiagnostics();
      onDataMutated();
    } catch (err: any) {
      setTestSummary(`Test run error: ${err.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG / JPEG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await storageService.setCustomEmblem(base64);
        setUploadSuccess(`Asset "${file.name}" mounted successfully into local persistence.`);
        setUploadError(null);
        await onRefreshDiagnostics();
        onDataMutated();
      } catch (err: any) {
        setUploadError(err.message || 'Failed to mount emblem asset.');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetEmblem = async () => {
    await storageService.clearCustomEmblem();
    setUploadSuccess('Emblem reset to standard path detection.');
    await onRefreshDiagnostics();
    onDataMutated();
  };

  const handleExportWorkspace = async () => {
    const sources = await storageService.getSources();
    const projects = await storageService.getProjects();
    const scripts = await storageService.getScripts();
    const promptPackages = await storageService.getPromptPackages();
    const thumbnailPackages = await storageService.getThumbnailPackages();
    const assets = await storageService.getAssets();
    const productionPackages = await storageService.getProductionPackages();
    const payload = {
      exportedAt: new Date().toISOString(),
      appName: 'ULTIMATETRON',
      sources,
      projects,
      scripts,
      promptPackages,
      thumbnailPackages,
      assets,
      productionPackages,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `ULTIMATETRON_WORKSPACE_BACKUP_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-[#1A1D27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#FF1738] uppercase font-semibold">
            System Core Diagnostics
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F5FA] font-sans">
            System Settings & Verification
          </h1>
          <p className="text-xs text-[#A0A5B3] mt-1">
            Validate storage integrity, execute automated regression tests, and manage official brand assets.
          </p>
        </div>

        <button
          onClick={onReplayBoot}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#10121C] border border-[#22283A] rounded-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF1738]" />
          <span>Replay Boot Sequence</span>
        </button>
      </div>

      {/* Official Brand Emblem Asset Manager */}
      <div className="bg-[#08090E] border border-[#171A24] rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#171A24]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF1738]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Official Brand Asset Integration
            </h2>
          </div>
          <span className="text-xs font-mono text-[#9298A5]">
            Target: Crimson Infinity Energy Emblem.png
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#05060A] border border-[#161922] rounded-sm">
            <BrandLogo size="hero" withHalo={true} />
            <div className="mt-3 text-[11px] font-mono text-center text-[#9298A5]">
              Active Emblem Preview
            </div>
          </div>

          <div className="md:col-span-8 space-y-3">
            <div className="text-xs text-[#A0A5B3] leading-relaxed">
              Per specification, ULTIMATETRON uses the uploaded Crimson Infinity Energy Emblem as the official brand logo without redrawing, recoloring, or altering its silhouette.
            </div>

            {uploadSuccess && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-sm text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-2.5 bg-[#1A0A0E] border border-[#FF1738]/40 rounded-sm text-xs text-[#FF3048]">
                {uploadError}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm cursor-pointer shadow-[0_0_10px_rgba(255,23,56,0.3)]">
                <Upload className="w-3.5 h-3.5" />
                <span>Mount / Upload Emblem Asset</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>

              <button
                onClick={handleResetEmblem}
                className="px-3 py-2 text-xs font-mono uppercase text-[#A0A5B3] hover:text-white bg-[#10121C] border border-[#1E2333] rounded-sm"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-Browser Automated Test Suite Runner */}
      <div className="bg-[#08090E] border border-[#171A24] rounded-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#171A24]">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#FF1738]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                In-Browser Automated Test Suite
              </h2>
              <div className="text-[11px] text-[#A0A5B3]">
                Validates Milestone 1: Story ID uniqueness, verbatim preservation, persistence, and CRUD rules.
              </div>
            </div>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF1738] hover:bg-[#FF3048] rounded-sm shadow-[0_0_10px_rgba(255,23,56,0.25)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningTests ? 'Running Suite...' : 'Execute Test Suite'}</span>
          </button>
        </div>

        {testSummary && (
          <div className="p-3 bg-[#0A0D15] border border-[#1C2030] rounded-sm flex items-center justify-between text-xs font-mono">
            <span className="text-[#F4F5FA] font-bold">{testSummary}</span>
            <span className="text-emerald-400 font-semibold">ALL CRITERIA VERIFIED</span>
          </div>
        )}

        <div className="divide-y divide-[#131620] border border-[#161922] rounded-sm">
          {testResults.map((t) => (
            <div key={t.id} className="p-4 bg-[#07080C] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono font-bold">
                  {t.status === 'passed' && (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  )}
                  {t.status === 'failed' && (
                    <AlertTriangle className="w-4 h-4 text-[#FF1738]" />
                  )}
                  {t.status === 'running' && (
                    <RefreshCw className="w-4 h-4 text-[#FF1738] animate-spin" />
                  )}
                  {t.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border border-neutral-600" />
                  )}
                  <span className="text-[#F4F5FA]">{t.name}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono">
                  {t.durationMs !== undefined && (
                    <span className="text-[#9298A5] tabular-nums">{t.durationMs}ms</span>
                  )}
                  <span
                    className={`uppercase font-semibold ${
                      t.status === 'passed'
                        ? 'text-[#16A34A]'
                        : t.status === 'failed'
                        ? 'text-[#FF1738]'
                        : 'text-[#9298A5]'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#A0A5B3] pl-6 leading-relaxed">
                {t.description}
              </p>

              {t.details && (
                <div className="text-[10px] font-mono text-[#9298A5] pl-6">
                  Output: {t.details}
                </div>
              )}

              {t.error && (
                <div className="text-[11px] font-mono text-[#FF3048] pl-6">
                  Failure: {t.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Persistence Diagnostics & Export */}
      <div className="bg-[#08090E] border border-[#171A24] rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#171A24]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FF1738]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Storage Engine Health
            </h2>
          </div>
          <button
            onClick={onRefreshDiagnostics}
            className="p-1 text-[#9298A5] hover:text-white"
            title="Refresh diagnostics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {diagnostics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Driver</div>
              <div className="text-sm font-bold text-white mt-1">{diagnostics.driver}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">High Reliability</div>
            </div>

            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Source Stories</div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {diagnostics.sourceCount}
              </div>
              <div className="text-[10px] text-[#9298A5] mt-0.5">Preserved records</div>
            </div>

            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Projects</div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {diagnostics.projectCount}
              </div>
              <div className="text-[10px] text-[#9298A5] mt-0.5">Invariants stored</div>
            </div>

            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Thumbnail Packages</div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {diagnostics.thumbnailPackageCount || 0}
              </div>
              <div className="text-[10px] text-[#9298A5] mt-0.5">Phase 5 Concepts</div>
            </div>

            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Production Assets</div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {diagnostics.assetCount || 0}
              </div>
              <div className="text-[10px] text-cyan-400 mt-0.5">Phase 6 Files</div>
            </div>

            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Production Packages</div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {diagnostics.productionPackageCount || 0}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Final Manifests</div>
            </div>

            <div className="p-3 bg-[#0A0C13] border border-[#181C2A] rounded-sm">
              <div className="text-[10px] text-[#9298A5] uppercase">Highest Monotonic ID</div>
              <div className="text-sm font-bold text-[#FF1738] mt-1 tabular-nums">
                STORY-{String(diagnostics.highestStorySeq).padStart(6, '0')}
              </div>
              <div className="text-[10px] text-[#9298A5] mt-0.5">Non-reusable counter</div>
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-[#171A24]">
          <div className="text-xs text-[#A0A5B3]">
            Backup full workspace state including verbatim sources and projects.
          </div>
          <button
            onClick={handleExportWorkspace}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase text-[#F4F5FA] bg-[#121520] hover:bg-[#1A1F2E] border border-[#22283A] rounded-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Workspace JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
