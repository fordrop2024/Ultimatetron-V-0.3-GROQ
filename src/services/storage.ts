/**
 * ULTIMATETRON — Storage & Persistence Service
 * High-reliability IndexedDB storage with localStorage fallback.
 * Strictly guarantees Story ID uniqueness, monotonic sequencing,
 * verbatim source text preservation, and duplicate detection.
 */

import {
  SourceStory,
  ProjectConfig,
  StorageDiagnostics,
  SourceVersionRecord,
  ScriptRecord,
  PromptPackage,
  ThumbnailPackage,
  AssetRecord,
  ProductionPackageManifest
} from '../types';

const DB_NAME = 'ultimatetron_db';
const DB_VERSION = 5;
const STORE_SOURCES = 'sources';
const STORE_PROJECTS = 'projects';
const STORE_SCRIPTS = 'scripts';
const STORE_PROMPT_PACKAGES = 'prompt_packages';
const STORE_THUMBNAIL_PACKAGES = 'thumbnail_packages';
const STORE_ASSETS = 'production_assets';
const STORE_PRODUCTION_PACKAGES = 'production_packages';
const STORE_METADATA = 'metadata';

const LOCALSTORAGE_PREFIX = 'ultimatetron_';

// Memory fallback for environments without window.localStorage (e.g. CLI/tests/SSR)
if (typeof globalThis.localStorage === 'undefined') {
  const memoryStore = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => memoryStore.set(key, String(value)),
    removeItem: (key: string) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
  };
}

class StorageService {
  private db: IDBDatabase | null = null;
  private isIndexedDBAvailable: boolean = typeof window !== 'undefined' && 'indexedDB' in window;
  private highestStorySeq: number = 0;
  private highestProjSeq: number = 0;
  private highestScriptSeq: number = 0;
  private highestPackageSeq: number = 0;
  private highestThumbnailSeq: number = 0;
  private highestAssetSeq: number = 0;
  private highestProdPackageSeq: number = 0;
  private customEmblemBase64: string | null = null;

  async init(): Promise<void> {
    if (this.isIndexedDBAvailable) {
      try {
        this.db = await this.openIDB();
        await this.syncCounters();
        return;
      } catch (err) {
        console.warn('IndexedDB failed, falling back to localStorage:', err);
        this.isIndexedDBAvailable = false;
      }
    }
    this.syncCountersLocal();
  }

  private openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SOURCES)) {
          db.createObjectStore(STORE_SOURCES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SCRIPTS)) {
          db.createObjectStore(STORE_SCRIPTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PROMPT_PACKAGES)) {
          db.createObjectStore(STORE_PROMPT_PACKAGES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_THUMBNAIL_PACKAGES)) {
          db.createObjectStore(STORE_THUMBNAIL_PACKAGES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ASSETS)) {
          db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PRODUCTION_PACKAGES)) {
          db.createObjectStore(STORE_PRODUCTION_PACKAGES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async syncCounters(): Promise<void> {
    const metaSeq = await this.getMeta('highestStorySeq');
    const sources = await this.getAllFromStore<SourceStory>(STORE_SOURCES);
    let maxSourceSeq = metaSeq ? Number(metaSeq) : 0;
    for (const s of sources) {
      if (s.seqNumber && s.seqNumber > maxSourceSeq) {
        maxSourceSeq = s.seqNumber;
      }
    }
    this.highestStorySeq = maxSourceSeq;

    const metaProjSeq = await this.getMeta('highestProjSeq');
    const projects = await this.getAllFromStore<ProjectConfig>(STORE_PROJECTS);
    let maxProjSeq = metaProjSeq ? Number(metaProjSeq) : 0;
    for (const p of projects) {
      if (p.seqNumber && p.seqNumber > maxProjSeq) {
        maxProjSeq = p.seqNumber;
      }
    }
    this.highestProjSeq = maxProjSeq;

    const metaScriptSeq = await this.getMeta('highestScriptSeq');
    const scripts = await this.getAllFromStore<ScriptRecord>(STORE_SCRIPTS);
    let maxScriptSeq = metaScriptSeq ? Number(metaScriptSeq) : 0;
    for (const sc of scripts) {
      if (sc.seqNumber && sc.seqNumber > maxScriptSeq) {
        maxScriptSeq = sc.seqNumber;
      }
    }
    this.highestScriptSeq = maxScriptSeq;

    const metaPackageSeq = await this.getMeta('highestPackageSeq');
    const packages = await this.getAllFromStore<PromptPackage>(STORE_PROMPT_PACKAGES);
    let maxPackageSeq = metaPackageSeq ? Number(metaPackageSeq) : 0;
    for (const pkg of packages) {
      if (pkg.seqNumber && pkg.seqNumber > maxPackageSeq) {
        maxPackageSeq = pkg.seqNumber;
      }
    }
    this.highestPackageSeq = maxPackageSeq;

    const metaThumbSeq = await this.getMeta('highestThumbnailSeq');
    const thumbPackages = await this.getAllFromStore<ThumbnailPackage>(STORE_THUMBNAIL_PACKAGES);
    let maxThumbSeq = metaThumbSeq ? Number(metaThumbSeq) : 0;
    for (const tp of thumbPackages) {
      if (tp.seqNumber && tp.seqNumber > maxThumbSeq) {
        maxThumbSeq = tp.seqNumber;
      }
    }
    this.highestThumbnailSeq = maxThumbSeq;

    const metaAssetSeq = await this.getMeta('highestAssetSeq');
    const assets = await this.getAllFromStore<AssetRecord>(STORE_ASSETS);
    let maxAssetSeq = metaAssetSeq ? Number(metaAssetSeq) : 0;
    for (const a of assets) {
      if (a.seqNumber && a.seqNumber > maxAssetSeq) {
        maxAssetSeq = a.seqNumber;
      }
    }
    this.highestAssetSeq = maxAssetSeq;

    const metaProdPkgSeq = await this.getMeta('highestProdPackageSeq');
    const prodPackages = await this.getAllFromStore<ProductionPackageManifest>(STORE_PRODUCTION_PACKAGES);
    let maxProdPkgSeq = metaProdPkgSeq ? Number(metaProdPkgSeq) : 0;
    for (const pp of prodPackages) {
      if (pp.seqNumber && pp.seqNumber > maxProdPkgSeq) {
        maxProdPkgSeq = pp.seqNumber;
      }
    }
    this.highestProdPackageSeq = maxProdPkgSeq;

    const emblemData = await this.getMeta('customEmblemBase64');
    if (emblemData) {
      this.customEmblemBase64 = String(emblemData);
    }
  }

  private syncCountersLocal(): void {
    const rawSources = localStorage.getItem(`${LOCALSTORAGE_PREFIX}sources`);
    const sources: SourceStory[] = rawSources ? JSON.parse(rawSources) : [];
    let maxSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestStorySeq`) || 0);
    for (const s of sources) {
      if (s.seqNumber && s.seqNumber > maxSeq) {
        maxSeq = s.seqNumber;
      }
    }
    this.highestStorySeq = maxSeq;

    const rawProjects = localStorage.getItem(`${LOCALSTORAGE_PREFIX}projects`);
    const projects: ProjectConfig[] = rawProjects ? JSON.parse(rawProjects) : [];
    let maxProjSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestProjSeq`) || 0);
    for (const p of projects) {
      if (p.seqNumber && p.seqNumber > maxProjSeq) {
        maxProjSeq = p.seqNumber;
      }
    }
    this.highestProjSeq = maxProjSeq;

    const rawScripts = localStorage.getItem(`${LOCALSTORAGE_PREFIX}scripts`);
    const scripts: ScriptRecord[] = rawScripts ? JSON.parse(rawScripts) : [];
    let maxScriptSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestScriptSeq`) || 0);
    for (const sc of scripts) {
      if (sc.seqNumber && sc.seqNumber > maxScriptSeq) {
        maxScriptSeq = sc.seqNumber;
      }
    }
    this.highestScriptSeq = maxScriptSeq;

    const rawPackages = localStorage.getItem(`${LOCALSTORAGE_PREFIX}prompt_packages`);
    const packages: PromptPackage[] = rawPackages ? JSON.parse(rawPackages) : [];
    let maxPkgSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestPackageSeq`) || 0);
    for (const pkg of packages) {
      if (pkg.seqNumber && pkg.seqNumber > maxPkgSeq) {
        maxPkgSeq = pkg.seqNumber;
      }
    }
    this.highestPackageSeq = maxPkgSeq;

    const rawThumbs = localStorage.getItem(`${LOCALSTORAGE_PREFIX}thumbnail_packages`);
    const thumbs: ThumbnailPackage[] = rawThumbs ? JSON.parse(rawThumbs) : [];
    let maxThumbSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestThumbnailSeq`) || 0);
    for (const tp of thumbs) {
      if (tp.seqNumber && tp.seqNumber > maxThumbSeq) {
        maxThumbSeq = tp.seqNumber;
      }
    }
    this.highestThumbnailSeq = maxThumbSeq;

    const rawAssets = localStorage.getItem(`${LOCALSTORAGE_PREFIX}production_assets`);
    const assets: AssetRecord[] = rawAssets ? JSON.parse(rawAssets) : [];
    let maxAssetSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestAssetSeq`) || 0);
    for (const a of assets) {
      if (a.seqNumber && a.seqNumber > maxAssetSeq) {
        maxAssetSeq = a.seqNumber;
      }
    }
    this.highestAssetSeq = maxAssetSeq;

    const rawProdPkgs = localStorage.getItem(`${LOCALSTORAGE_PREFIX}production_packages`);
    const prodPkgs: ProductionPackageManifest[] = rawProdPkgs ? JSON.parse(rawProdPkgs) : [];
    let maxProdPkgSeq = Number(localStorage.getItem(`${LOCALSTORAGE_PREFIX}highestProdPackageSeq`) || 0);
    for (const pp of prodPkgs) {
      if (pp.seqNumber && pp.seqNumber > maxProdPkgSeq) {
        maxProdPkgSeq = pp.seqNumber;
      }
    }
    this.highestProdPackageSeq = maxProdPkgSeq;

    this.customEmblemBase64 = localStorage.getItem(`${LOCALSTORAGE_PREFIX}customEmblemBase64`);
  }

  private async setMeta(key: string, value: unknown): Promise<void> {
    if (this.db) {
      await this.putInStore(STORE_METADATA, { key, value });
    } else {
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}${key}`, JSON.stringify(value));
    }
  }

  private async getMeta(key: string): Promise<unknown> {
    if (this.db) {
      const record = await this.getFromStore<{ key: string; value: unknown }>(STORE_METADATA, key);
      return record ? record.value : null;
    } else {
      const item = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    }
  }

  private getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private getAllFromStore<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private putInStore(storeName: string, item: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private deleteFromStore(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Story ID generation & uniqueness guarantee ---
  /**
   * Generates a unique monotonic Story ID (STORY-000001, STORY-000002).
   * Monotonic counter is persisted and never decremented or reused upon deletion.
   */
  async generateNextStoryId(): Promise<{ id: string; seqNumber: number }> {
    this.highestStorySeq += 1;
    await this.setMeta('highestStorySeq', this.highestStorySeq);
    const padded = String(this.highestStorySeq).padStart(6, '0');
    return {
      id: `STORY-${padded}`,
      seqNumber: this.highestStorySeq,
    };
  }

  async generateNextProjectId(): Promise<{ id: string; seqNumber: number }> {
    this.highestProjSeq += 1;
    await this.setMeta('highestProjSeq', this.highestProjSeq);
    const padded = String(this.highestProjSeq).padStart(6, '0');
    return {
      id: `PROJ-${padded}`,
      seqNumber: this.highestProjSeq,
    };
  }

  // --- Duplicate Detection ---
  /**
   * Checks for duplicate stories by exact content match or high token similarity.
   */
  async checkForDuplicates(title: string, content: string, excludeId?: string): Promise<{
    isDuplicate: boolean;
    confidence: 'exact' | 'high' | 'none';
    match?: SourceStory;
    reason?: string;
  }> {
    const existing = await this.getSources();
    const cleanInputContent = content.trim();
    const cleanInputTitle = title.trim().toLowerCase();

    for (const story of existing) {
      if (excludeId && story.id === excludeId) continue;

      // Exact content match
      if (story.content.trim() === cleanInputContent) {
        return {
          isDuplicate: true,
          confidence: 'exact',
          match: story,
          reason: `Exact identical story content matches ${story.id} ("${story.title}").`,
        };
      }

      // Exact title match
      if (story.title.trim().toLowerCase() === cleanInputTitle && cleanInputTitle.length > 5) {
        return {
          isDuplicate: true,
          confidence: 'high',
          match: story,
          reason: `Story title is identical to ${story.id} ("${story.title}").`,
        };
      }

      // Jaccard similarity over word tokens
      const wordsA = new Set(cleanInputContent.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const wordsB = new Set(story.content.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      if (wordsA.size > 20 && wordsB.size > 20) {
        let intersection = 0;
        for (const w of wordsA) {
          if (wordsB.has(w)) intersection++;
        }
        const union = wordsA.size + wordsB.size - intersection;
        const similarity = union > 0 ? intersection / union : 0;
        if (similarity > 0.82) {
          return {
            isDuplicate: true,
            confidence: 'high',
            match: story,
            reason: `High content similarity (${Math.round(similarity * 100)}%) with ${story.id} ("${story.title}").`,
          };
        }
      }
    }

    return { isDuplicate: false, confidence: 'none' };
  }

  // --- Source Story CRUD ---
  async getSources(): Promise<SourceStory[]> {
    if (this.db) {
      const records = await this.getAllFromStore<SourceStory>(STORE_SOURCES);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}sources`);
      const records: SourceStory[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getSourceById(id: string): Promise<SourceStory | null> {
    if (this.db) {
      return this.getFromStore<SourceStory>(STORE_SOURCES, id);
    } else {
      const sources = await this.getSources();
      return sources.find(s => s.id === id) || null;
    }
  }

  async addSource(input: {
    title: string;
    content: string; // Preserved verbatim
    sourceUrl?: string;
    publisher?: string;
    publicationDate?: string;
    tags?: string[];
  }): Promise<SourceStory> {
    const { id, seqNumber } = await this.generateNextStoryId();
    const now = new Date().toISOString();

    const wordCount = input.content.trim() ? input.content.trim().split(/\s+/).length : 0;
    const charCount = input.content.length;

    const newSource: SourceStory = {
      id,
      seqNumber,
      version: 1,
      title: input.title.trim(),
      content: input.content, // Strict verbatim preservation: no strip/replace
      sourceUrl: input.sourceUrl?.trim() || undefined,
      publisher: input.publisher?.trim() || undefined,
      publicationDate: input.publicationDate?.trim() || undefined,
      tags: input.tags ? input.tags.map(t => t.trim()).filter(Boolean) : [],
      wordCount,
      charCount,
      createdAt: now,
      updatedAt: now,
      versionHistory: [
        {
          version: 1,
          updatedAt: now,
          changeNote: 'Initial Source Entry created.',
          contentSnapshot: input.content,
        },
      ],
    };

    if (this.db) {
      await this.putInStore(STORE_SOURCES, newSource);
    } else {
      const sources = await this.getSources();
      sources.unshift(newSource);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}sources`, JSON.stringify(sources));
    }

    return newSource;
  }

  /**
   * Updates an existing story.
   * If createNewVersion is true, increments version number (e.g. v1 -> v2)
   * and preserves snapshot in versionHistory.
   */
  async updateSource(
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
  ): Promise<SourceStory> {
    const current = await this.getSourceById(id);
    if (!current) {
      throw new Error(`Source with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    const isNewVersion = updates.createNewVersion ?? false;
    const nextVersion = isNewVersion ? current.version + 1 : current.version;

    const newContent = updates.content !== undefined ? updates.content : current.content;
    const wordCount = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;
    const charCount = newContent.length;

    const history: SourceVersionRecord[] = [...(current.versionHistory || [])];
    if (isNewVersion) {
      history.push({
        version: nextVersion,
        updatedAt: now,
        changeNote: updates.changeNote || `Updated to version ${nextVersion}`,
        contentSnapshot: newContent,
      });
    }

    const updatedSource: SourceStory = {
      ...current,
      version: nextVersion,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      content: newContent,
      sourceUrl: updates.sourceUrl !== undefined ? (updates.sourceUrl.trim() || undefined) : current.sourceUrl,
      publisher: updates.publisher !== undefined ? (updates.publisher.trim() || undefined) : current.publisher,
      publicationDate: updates.publicationDate !== undefined ? (updates.publicationDate.trim() || undefined) : current.publicationDate,
      tags: updates.tags !== undefined ? updates.tags.map(t => t.trim()).filter(Boolean) : current.tags,
      wordCount,
      charCount,
      updatedAt: now,
      versionHistory: history,
    };

    if (this.db) {
      await this.putInStore(STORE_SOURCES, updatedSource);
    } else {
      const sources = await this.getSources();
      const index = sources.findIndex(s => s.id === id);
      if (index >= 0) {
        sources[index] = updatedSource;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}sources`, JSON.stringify(sources));
      }
    }

    return updatedSource;
  }

  async deleteSource(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_SOURCES, id);
    } else {
      const sources = await this.getSources();
      const filtered = sources.filter(s => s.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}sources`, JSON.stringify(filtered));
    }
  }

  // --- Project CRUD ---
  async getProjects(): Promise<ProjectConfig[]> {
    if (this.db) {
      const records = await this.getAllFromStore<ProjectConfig>(STORE_PROJECTS);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}projects`);
      const records: ProjectConfig[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getProjectById(id: string): Promise<ProjectConfig | null> {
    if (this.db) {
      return this.getFromStore<ProjectConfig>(STORE_PROJECTS, id);
    } else {
      const projects = await this.getProjects();
      return projects.find(p => p.id === id) || null;
    }
  }

  async addProject(input: Omit<ProjectConfig, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>): Promise<ProjectConfig> {
    const { id, seqNumber } = await this.generateNextProjectId();
    const now = new Date().toISOString();

    const newProject: ProjectConfig = {
      ...input,
      id,
      seqNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_PROJECTS, newProject);
    } else {
      const projects = await this.getProjects();
      projects.unshift(newProject);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}projects`, JSON.stringify(projects));
    }

    return newProject;
  }

  async updateProject(id: string, updates: Partial<ProjectConfig>): Promise<ProjectConfig> {
    const current = await this.getProjectById(id);
    if (!current) throw new Error(`Project ${id} not found.`);

    const updated: ProjectConfig = {
      ...current,
      ...updates,
      id: current.id,
      seqNumber: current.seqNumber,
      updatedAt: new Date().toISOString(),
    };

    if (this.db) {
      await this.putInStore(STORE_PROJECTS, updated);
    } else {
      const projects = await this.getProjects();
      const index = projects.findIndex(p => p.id === id);
      if (index >= 0) {
        projects[index] = updated;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}projects`, JSON.stringify(projects));
      }
    }

    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_PROJECTS, id);
    } else {
      const projects = await this.getProjects();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}projects`, JSON.stringify(filtered));
    }
  }

  // --- Script ID Generation & Persistence ---
  async generateNextScriptId(): Promise<{ id: string; seqNumber: number }> {
    this.highestScriptSeq += 1;
    await this.setMeta('highestScriptSeq', this.highestScriptSeq);
    const padded = String(this.highestScriptSeq).padStart(6, '0');
    return {
      id: `SCRIPT-${padded}`,
      seqNumber: this.highestScriptSeq,
    };
  }

  // --- Script CRUD & Versioning ---
  async getScripts(): Promise<ScriptRecord[]> {
    if (this.db) {
      const records = await this.getAllFromStore<ScriptRecord>(STORE_SCRIPTS);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}scripts`);
      const records: ScriptRecord[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getScriptsByProjectId(projectId: string): Promise<ScriptRecord[]> {
    const all = await this.getScripts();
    return all.filter((s) => s.projectId === projectId).sort((a, b) => b.version - a.version);
  }

  async getScriptById(id: string): Promise<ScriptRecord | null> {
    if (this.db) {
      return this.getFromStore<ScriptRecord>(STORE_SCRIPTS, id);
    } else {
      const scripts = await this.getScripts();
      return scripts.find((s) => s.id === id) || null;
    }
  }

  async addScriptDraft(
    input: Omit<ScriptRecord, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<ScriptRecord> {
    const { id, seqNumber } = await this.generateNextScriptId();
    const now = new Date().toISOString();

    const newScript: ScriptRecord = {
      ...input,
      id,
      seqNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_SCRIPTS, newScript);
    } else {
      const scripts = await this.getScripts();
      scripts.unshift(newScript);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}scripts`, JSON.stringify(scripts));
    }

    // Advance project status to draft if currently not_started
    const proj = await this.getProjectById(input.projectId);
    if (proj && proj.status === 'not_started') {
      await this.updateProject(proj.id, { status: 'draft' });
    }

    return newScript;
  }

  async updateScript(id: string, updates: Partial<ScriptRecord>): Promise<ScriptRecord> {
    const current = await this.getScriptById(id);
    if (!current) throw new Error(`Script ${id} not found.`);

    if (current.isApproved) {
      throw new Error(`Approved scripts are immutable. Use forkScriptDraft to create a new draft version.`);
    }

    const updated: ScriptRecord = {
      ...current,
      ...updates,
      id: current.id,
      seqNumber: current.seqNumber,
      version: current.version,
      updatedAt: new Date().toISOString(),
    };

    if (this.db) {
      await this.putInStore(STORE_SCRIPTS, updated);
    } else {
      const scripts = await this.getScripts();
      const index = scripts.findIndex((s) => s.id === id);
      if (index >= 0) {
        scripts[index] = updated;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}scripts`, JSON.stringify(scripts));
      }
    }

    return updated;
  }

  async forkScriptDraft(parentScriptId: string, updates?: Partial<ScriptRecord>): Promise<ScriptRecord> {
    const parent = await this.getScriptById(parentScriptId);
    if (!parent) throw new Error(`Parent script ${parentScriptId} not found.`);

    const existingProjectScripts = await this.getScriptsByProjectId(parent.projectId);
    const nextVersion = Math.max(...existingProjectScripts.map((s) => s.version), parent.version) + 1;

    const { id, seqNumber } = await this.generateNextScriptId();
    const now = new Date().toISOString();

    const forked: ScriptRecord = {
      ...parent,
      ...updates,
      id,
      seqNumber,
      version: nextVersion,
      parentScriptId: parent.id,
      isApproved: false,
      approvalTimestamp: undefined,
      approvedBy: undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_SCRIPTS, forked);
    } else {
      const scripts = await this.getScripts();
      scripts.unshift(forked);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}scripts`, JSON.stringify(scripts));
    }

    await this.updateProject(parent.projectId, { status: 'draft' });

    return forked;
  }

  async approveScript(id: string, approvedBy: string = 'Production Lead'): Promise<ScriptRecord> {
    const current = await this.getScriptById(id);
    if (!current) throw new Error(`Script ${id} not found.`);

    if (!current.sections || current.sections.length === 0) {
      throw new Error(`Cannot approve script without sections.`);
    }

    const blockingError = current.overallWarnings.find((w) => w.severity === 'error') ||
      current.sections.some((s) => s.warnings.some((w) => w.severity === 'error'));
    if (blockingError) {
      const msg = typeof blockingError === 'object' && blockingError.reason ? blockingError.reason : 'Structural failure';
      throw new Error(`Cannot approve script with unresolved structural errors: ${msg}`);
    }

    const now = new Date().toISOString();
    const approved: ScriptRecord = {
      ...current,
      isApproved: true,
      approvalTimestamp: now,
      approvedBy,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_SCRIPTS, approved);
    } else {
      const scripts = await this.getScripts();
      const index = scripts.findIndex((s) => s.id === id);
      if (index >= 0) {
        scripts[index] = approved;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}scripts`, JSON.stringify(scripts));
      }
    }

    // Set project status to approved
    await this.updateProject(current.projectId, { status: 'approved' });

    return approved;
  }

  async deleteScript(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_SCRIPTS, id);
    } else {
      const scripts = await this.getScripts();
      const filtered = scripts.filter((s) => s.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}scripts`, JSON.stringify(filtered));
    }
  }

  // --- Prompt Package ID Generation & Persistence (Phase 4) ---
  async generateNextPackageId(): Promise<{ id: string; seqNumber: number }> {
    this.highestPackageSeq += 1;
    await this.setMeta('highestPackageSeq', this.highestPackageSeq);
    const padded = String(this.highestPackageSeq).padStart(6, '0');
    return {
      id: `PACKAGE-${padded}`,
      seqNumber: this.highestPackageSeq,
    };
  }

  async getPromptPackages(): Promise<PromptPackage[]> {
    if (this.db) {
      const records = await this.getAllFromStore<PromptPackage>(STORE_PROMPT_PACKAGES);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}prompt_packages`);
      const records: PromptPackage[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getPromptPackagesByProjectId(projectId: string): Promise<PromptPackage[]> {
    const all = await this.getPromptPackages();
    return all.filter((p) => p.projectId === projectId).sort((a, b) => b.version - a.version);
  }

  async getPromptPackagesByScriptId(scriptId: string, scriptVersion?: number): Promise<PromptPackage[]> {
    const all = await this.getPromptPackages();
    return all
      .filter((p) => p.scriptId === scriptId && (scriptVersion === undefined || p.scriptVersion === scriptVersion))
      .sort((a, b) => b.version - a.version);
  }

  async getPromptPackageById(id: string): Promise<PromptPackage | null> {
    if (this.db) {
      return this.getFromStore<PromptPackage>(STORE_PROMPT_PACKAGES, id);
    } else {
      const packages = await this.getPromptPackages();
      return packages.find((p) => p.id === id) || null;
    }
  }

  async savePromptPackageDraft(
    input: Omit<PromptPackage, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<PromptPackage> {
    const { id, seqNumber } = await this.generateNextPackageId();
    const now = new Date().toISOString();

    const newPackage: PromptPackage = {
      ...input,
      id,
      seqNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_PROMPT_PACKAGES, newPackage);
    } else {
      const packages = await this.getPromptPackages();
      packages.unshift(newPackage);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}prompt_packages`, JSON.stringify(packages));
    }

    return newPackage;
  }

  async updatePromptPackage(id: string, updates: Partial<PromptPackage>): Promise<PromptPackage> {
    const current = await this.getPromptPackageById(id);
    if (!current) throw new Error(`Prompt Package ${id} not found.`);

    const updated: PromptPackage = {
      ...current,
      ...updates,
      id: current.id,
      seqNumber: current.seqNumber,
      updatedAt: new Date().toISOString(),
    };

    if (this.db) {
      await this.putInStore(STORE_PROMPT_PACKAGES, updated);
    } else {
      const packages = await this.getPromptPackages();
      const index = packages.findIndex((p) => p.id === id);
      if (index >= 0) {
        packages[index] = updated;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}prompt_packages`, JSON.stringify(packages));
      }
    }

    return updated;
  }

  async forkPromptPackageRevision(id: string, updates?: Partial<PromptPackage>): Promise<PromptPackage> {
    const current = await this.getPromptPackageById(id);
    if (!current) throw new Error(`Prompt Package ${id} not found.`);

    const existing = await this.getPromptPackagesByProjectId(current.projectId);
    const nextVersion = Math.max(...existing.map((p) => p.version), current.version) + 1;

    const { id: newId, seqNumber } = await this.generateNextPackageId();
    const now = new Date().toISOString();

    const forked: PromptPackage = {
      ...current,
      ...updates,
      id: newId,
      seqNumber,
      version: nextVersion,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_PROMPT_PACKAGES, forked);
    } else {
      const packages = await this.getPromptPackages();
      packages.unshift(forked);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}prompt_packages`, JSON.stringify(packages));
    }

    return forked;
  }

  async deletePromptPackage(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_PROMPT_PACKAGES, id);
    } else {
      const packages = await this.getPromptPackages();
      const filtered = packages.filter((p) => p.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}prompt_packages`, JSON.stringify(filtered));
    }
  }

  // --- Thumbnail Package ID Generation & Persistence (Phase 5) ---
  async generateNextThumbnailPackageId(): Promise<{ id: string; seqNumber: number }> {
    this.highestThumbnailSeq += 1;
    await this.setMeta('highestThumbnailSeq', this.highestThumbnailSeq);
    const padded = String(this.highestThumbnailSeq).padStart(6, '0');
    return {
      id: `THUMB-${padded}`,
      seqNumber: this.highestThumbnailSeq,
    };
  }

  async getThumbnailPackages(): Promise<ThumbnailPackage[]> {
    if (this.db) {
      const records = await this.getAllFromStore<ThumbnailPackage>(STORE_THUMBNAIL_PACKAGES);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}thumbnail_packages`);
      const records: ThumbnailPackage[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getThumbnailPackagesByProjectId(projectId: string): Promise<ThumbnailPackage[]> {
    const all = await this.getThumbnailPackages();
    return all.filter((p) => p.projectId === projectId).sort((a, b) => b.version - a.version);
  }

  async getThumbnailPackagesByScriptId(scriptId: string, scriptVersion?: number): Promise<ThumbnailPackage[]> {
    const all = await this.getThumbnailPackages();
    return all
      .filter((p) => p.scriptId === scriptId && (scriptVersion === undefined || p.scriptVersion === scriptVersion))
      .sort((a, b) => b.version - a.version);
  }

  async getThumbnailPackageById(id: string): Promise<ThumbnailPackage | null> {
    if (this.db) {
      return this.getFromStore<ThumbnailPackage>(STORE_THUMBNAIL_PACKAGES, id);
    } else {
      const packages = await this.getThumbnailPackages();
      return packages.find((p) => p.id === id) || null;
    }
  }

  async saveThumbnailPackageDraft(
    input: Omit<ThumbnailPackage, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<ThumbnailPackage> {
    const { id, seqNumber } = await this.generateNextThumbnailPackageId();
    const now = new Date().toISOString();

    const newPackage: ThumbnailPackage = {
      ...input,
      id,
      seqNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_THUMBNAIL_PACKAGES, newPackage);
    } else {
      const packages = await this.getThumbnailPackages();
      packages.unshift(newPackage);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}thumbnail_packages`, JSON.stringify(packages));
    }

    return newPackage;
  }

  async updateThumbnailPackage(id: string, updates: Partial<ThumbnailPackage>): Promise<ThumbnailPackage> {
    const current = await this.getThumbnailPackageById(id);
    if (!current) throw new Error(`Thumbnail Package ${id} not found.`);

    const updated: ThumbnailPackage = {
      ...current,
      ...updates,
      id: current.id,
      seqNumber: current.seqNumber,
      updatedAt: new Date().toISOString(),
    };

    if (this.db) {
      await this.putInStore(STORE_THUMBNAIL_PACKAGES, updated);
    } else {
      const packages = await this.getThumbnailPackages();
      const index = packages.findIndex((p) => p.id === id);
      if (index >= 0) {
        packages[index] = updated;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}thumbnail_packages`, JSON.stringify(packages));
      }
    }

    return updated;
  }

  async forkThumbnailPackageRevision(id: string, updates?: Partial<ThumbnailPackage>): Promise<ThumbnailPackage> {
    const current = await this.getThumbnailPackageById(id);
    if (!current) throw new Error(`Thumbnail Package ${id} not found.`);

    const existing = await this.getThumbnailPackagesByProjectId(current.projectId);
    const nextVersion = Math.max(...existing.map((p) => p.version), current.version) + 1;

    const { id: newId, seqNumber } = await this.generateNextThumbnailPackageId();
    const now = new Date().toISOString();

    const forked: ThumbnailPackage = {
      ...current,
      ...updates,
      id: newId,
      seqNumber,
      version: nextVersion,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_THUMBNAIL_PACKAGES, forked);
    } else {
      const packages = await this.getThumbnailPackages();
      packages.unshift(forked);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}thumbnail_packages`, JSON.stringify(packages));
    }

    return forked;
  }

  async deleteThumbnailPackage(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_THUMBNAIL_PACKAGES, id);
    } else {
      const packages = await this.getThumbnailPackages();
      const filtered = packages.filter((p) => p.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}thumbnail_packages`, JSON.stringify(filtered));
    }
  }

  // --- Asset Management Persistence (Phase 6) ---
  async generateNextAssetId(): Promise<{ id: string; seqNumber: number }> {
    this.highestAssetSeq += 1;
    await this.setMeta('highestAssetSeq', this.highestAssetSeq);
    const padded = String(this.highestAssetSeq).padStart(6, '0');
    return {
      id: `ASSET-${padded}`,
      seqNumber: this.highestAssetSeq,
    };
  }

  async getAssets(): Promise<AssetRecord[]> {
    if (this.db) {
      const records = await this.getAllFromStore<AssetRecord>(STORE_ASSETS);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}production_assets`);
      const records: AssetRecord[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getAssetsByProjectId(projectId: string): Promise<AssetRecord[]> {
    const all = await this.getAssets();
    return all.filter((a) => a.projectId === projectId);
  }

  async getAssetById(id: string): Promise<AssetRecord | null> {
    if (this.db) {
      return this.getFromStore<AssetRecord>(STORE_ASSETS, id);
    } else {
      const all = await this.getAssets();
      return all.find((a) => a.id === id) || null;
    }
  }

  async saveAsset(
    input: Omit<AssetRecord, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<AssetRecord> {
    const { id, seqNumber } = await this.generateNextAssetId();
    const now = new Date().toISOString();

    const newAsset: AssetRecord = {
      ...input,
      id,
      seqNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_ASSETS, newAsset);
    } else {
      const assets = await this.getAssets();
      assets.unshift(newAsset);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_assets`, JSON.stringify(assets));
    }

    return newAsset;
  }

  async updateAsset(id: string, updates: Partial<AssetRecord>): Promise<AssetRecord> {
    const current = await this.getAssetById(id);
    if (!current) throw new Error(`Asset ${id} not found.`);

    const updated: AssetRecord = {
      ...current,
      ...updates,
      id: current.id,
      seqNumber: current.seqNumber,
      updatedAt: new Date().toISOString(),
    };

    if (this.db) {
      await this.putInStore(STORE_ASSETS, updated);
    } else {
      const assets = await this.getAssets();
      const index = assets.findIndex((a) => a.id === id);
      if (index >= 0) {
        assets[index] = updated;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_assets`, JSON.stringify(assets));
      }
    }

    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_ASSETS, id);
    } else {
      const assets = await this.getAssets();
      const filtered = assets.filter((a) => a.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_assets`, JSON.stringify(filtered));
    }
  }

  // --- Production Package Manifest Persistence (Phase 6) ---
  async generateNextProductionPackageId(): Promise<{ id: string; seqNumber: number }> {
    this.highestProdPackageSeq += 1;
    await this.setMeta('highestProdPackageSeq', this.highestProdPackageSeq);
    const padded = String(this.highestProdPackageSeq).padStart(6, '0');
    return {
      id: `PRODPKG-${padded}`,
      seqNumber: this.highestProdPackageSeq,
    };
  }

  async getProductionPackages(): Promise<ProductionPackageManifest[]> {
    if (this.db) {
      const records = await this.getAllFromStore<ProductionPackageManifest>(STORE_PRODUCTION_PACKAGES);
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    } else {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}production_packages`);
      const records: ProductionPackageManifest[] = raw ? JSON.parse(raw) : [];
      return records.sort((a, b) => b.seqNumber - a.seqNumber);
    }
  }

  async getProductionPackagesByProjectId(projectId: string): Promise<ProductionPackageManifest[]> {
    const all = await this.getProductionPackages();
    return all.filter((p) => p.projectId === projectId).sort((a, b) => b.version - a.version);
  }

  async getProductionPackageById(id: string): Promise<ProductionPackageManifest | null> {
    if (this.db) {
      return this.getFromStore<ProductionPackageManifest>(STORE_PRODUCTION_PACKAGES, id);
    } else {
      const all = await this.getProductionPackages();
      return all.find((p) => p.id === id) || null;
    }
  }

  async saveProductionPackage(
    input: Omit<ProductionPackageManifest, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<ProductionPackageManifest> {
    const { id, seqNumber } = await this.generateNextProductionPackageId();
    const now = new Date().toISOString();

    const newPkg: ProductionPackageManifest = {
      ...input,
      id,
      seqNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_PRODUCTION_PACKAGES, newPkg);
    } else {
      const packages = await this.getProductionPackages();
      packages.unshift(newPkg);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_packages`, JSON.stringify(packages));
    }

    return newPkg;
  }

  async updateProductionPackage(id: string, updates: Partial<ProductionPackageManifest>): Promise<ProductionPackageManifest> {
    const current = await this.getProductionPackageById(id);
    if (!current) throw new Error(`Production Package ${id} not found.`);

    const updated: ProductionPackageManifest = {
      ...current,
      ...updates,
      id: current.id,
      seqNumber: current.seqNumber,
      updatedAt: new Date().toISOString(),
    };

    if (this.db) {
      await this.putInStore(STORE_PRODUCTION_PACKAGES, updated);
    } else {
      const packages = await this.getProductionPackages();
      const index = packages.findIndex((p) => p.id === id);
      if (index >= 0) {
        packages[index] = updated;
        localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_packages`, JSON.stringify(packages));
      }
    }

    return updated;
  }

  async forkProductionPackage(id: string, updates?: Partial<ProductionPackageManifest>): Promise<ProductionPackageManifest> {
    const current = await this.getProductionPackageById(id);
    if (!current) throw new Error(`Production Package ${id} not found.`);

    const existing = await this.getProductionPackagesByProjectId(current.projectId);
    const nextVersion = Math.max(...existing.map((p) => p.version), current.version) + 1;

    const { id: newId, seqNumber } = await this.generateNextProductionPackageId();
    const now = new Date().toISOString();

    const forked: ProductionPackageManifest = {
      ...current,
      ...updates,
      id: newId,
      seqNumber,
      version: nextVersion,
      createdAt: now,
      updatedAt: now,
    };

    if (this.db) {
      await this.putInStore(STORE_PRODUCTION_PACKAGES, forked);
    } else {
      const packages = await this.getProductionPackages();
      packages.unshift(forked);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_packages`, JSON.stringify(packages));
    }

    return forked;
  }

  async deleteProductionPackage(id: string): Promise<void> {
    if (this.db) {
      await this.deleteFromStore(STORE_PRODUCTION_PACKAGES, id);
    } else {
      const packages = await this.getProductionPackages();
      const filtered = packages.filter((p) => p.id !== id);
      localStorage.setItem(`${LOCALSTORAGE_PREFIX}production_packages`, JSON.stringify(filtered));
    }
  }

  // --- Official Emblem Management ---
  async setCustomEmblem(base64: string): Promise<void> {
    this.customEmblemBase64 = base64;
    await this.setMeta('customEmblemBase64', base64);
  }

  async clearCustomEmblem(): Promise<void> {
    this.customEmblemBase64 = null;
    await this.setMeta('customEmblemBase64', null);
  }

  getCustomEmblem(): string | null {
    return this.customEmblemBase64;
  }

  // --- Diagnostics ---
  async getDiagnostics(): Promise<StorageDiagnostics> {
    const sources = await this.getSources();
    const projects = await this.getProjects();
    const scripts = await this.getScripts();
    const packages = await this.getPromptPackages();
    const thumbPackages = await this.getThumbnailPackages();
    const assets = await this.getAssets();
    const prodPackages = await this.getProductionPackages();

    let storageEstimateBytes: number | undefined;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        storageEstimateBytes = est.usage;
      } catch {
        // Ignore
      }
    }

    return {
      driver: this.db ? 'IndexedDB' : 'localStorage',
      sourceCount: sources.length,
      projectCount: projects.length,
      scriptCount: scripts.length,
      promptPackageCount: packages.length,
      thumbnailPackageCount: thumbPackages.length,
      assetCount: assets.length,
      productionPackageCount: prodPackages.length,
      highestStorySeq: this.highestStorySeq,
      highestScriptSeq: this.highestScriptSeq,
      highestPackageSeq: this.highestPackageSeq,
      highestThumbnailSeq: this.highestThumbnailSeq,
      highestAssetSeq: this.highestAssetSeq,
      highestProdPackageSeq: this.highestProdPackageSeq,
      storageEstimateBytes,
      emblemStatus: this.customEmblemBase64 ? 'custom_uploaded' : 'mounted',
    };
  }

  // --- Demo Story Seeder (Clear demo badge) ---
  async seedDemoStoryIfEmpty(): Promise<boolean> {
    const sources = await this.getSources();
    if (sources.length > 0) return false;

    await this.addSource({
      title: 'Voyager 1 Signals Glitch and Interstellar Telemetry Recovery',
      content: `In November 2023, NASA's Voyager 1 spacecraft, currently operating more than 24 billion kilometers from Earth in interstellar space, began transmitting an unreadable repeating telemetry pattern of binary ones and zeroes.

The issue was traced to one of Voyager's three onboard computers: the Flight Data System (FDS), which packages science and engineering telemetry before transmission via the spacecraft's high-gain antenna. Engineers at the Jet Propulsion Laboratory discovered that a single corrupted memory chip—comprising roughly 3% of the FDS memory—was preventing normal operational telemetry packets from assembling.

Because Voyager 1 was launched in 1977 and requires over 22.5 hours for radio signals to travel one way from Earth, JPL software specialists devised a remote memory reorganization patch. On April 20, 2024, the mission team received valid engineering telemetry confirming the memory relocation succeeded, preserving humanity's farthest operational emissary.`,
      sourceUrl: 'https://www.nasa.gov/missions/voyager/voyager-1-telemetry-recovery',
      publisher: 'NASA Jet Propulsion Laboratory',
      publicationDate: '2024-04-22',
      tags: ['Space', 'Voyager 1', 'Science & Technology', 'Deep Space'],
    });

    return true;
  }
}

export const storageService = new StorageService();
