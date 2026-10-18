/**
 * ULTIMATETRON — MASTER PRODUCT APPLICATION ROOT
 * Next-generation AI-powered YouTube content production command center.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SourceStory,
  ProjectConfig,
  NavigationTab,
  StorageDiagnostics,
  WorkflowStatus
} from './types';
import { storageService } from './services/storage';
import { AmbientCanvas } from './components/AmbientCanvas';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SourceLibraryView } from './components/SourceLibraryView';
import { AddSourceModal, EditSourceModal } from './components/SourceModals';
import { ProjectConfigModal } from './components/ProjectConfigModal';
import { ProjectHistoryView } from './components/ProjectHistoryView';
import { ScriptEngineView } from './components/ScriptEngineView';
import { FlowStudioView } from './components/FlowStudioView';
import { ThumbnailStudioView } from './components/ThumbnailStudioView';
import { ProductionWorkspaceView } from './components/ProductionWorkspaceView';
import { SettingsView } from './components/SettingsView';
import { BootScreen } from './components/BootScreen';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showBootScreen, setShowBootScreen] = useState(() => {
    return !sessionStorage.getItem('ultimatetron_boot_completed');
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [sources, setSources] = useState<SourceStory[]>([]);
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [selectedStory, setSelectedStory] = useState<SourceStory | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectConfig | null>(null);

  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isEditSourceOpen, setIsEditSourceOpen] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState<SourceStory | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectInitialSourceId, setProjectInitialSourceId] = useState<string | undefined>(undefined);
  const [projectToEdit, setProjectToEdit] = useState<ProjectConfig | null>(null);

  const [diagnostics, setDiagnostics] = useState<StorageDiagnostics | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const loadedSources = await storageService.getSources();
      const loadedProjects = await storageService.getProjects();
      const diag = await storageService.getDiagnostics();

      setSources(loadedSources);
      setProjects(loadedProjects);
      setDiagnostics(diag);

      // Keep active project in sync
      if (loadedProjects.length > 0) {
        setActiveProject((prev) => {
          if (!prev) return loadedProjects[0];
          return loadedProjects.find((p) => p.id === prev.id) || loadedProjects[0];
        });
      } else {
        setActiveProject(null);
      }

      // Keep selected story in sync
      if (selectedStory) {
        const found = loadedSources.find((s) => s.id === selectedStory.id);
        setSelectedStory(found || null);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  }, [selectedStory]);

  // Initial setup
  useEffect(() => {
    async function setup() {
      await storageService.init();
      await loadData();
      setIsInitialized(true);
    }
    setup();
  }, [loadData]);

  const handleBootComplete = () => {
    sessionStorage.setItem('ultimatetron_boot_completed', 'true');
    setShowBootScreen(false);
  };

  const handleReplayBoot = () => {
    setShowBootScreen(true);
  };

  // Source Actions
  const handleSaveSource = async (data: {
    title: string;
    content: string;
    sourceUrl?: string;
    publisher?: string;
    publicationDate?: string;
    tags: string[];
  }) => {
    const created = await storageService.addSource(data);
    await loadData();
    setSelectedStory(created);
    setActiveTab('sources');
  };

  const handleUpdateSource = async (
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
  ) => {
    const updated = await storageService.updateSource(id, updates);
    await loadData();
    setSelectedStory(updated);
  };

  const handleDeleteSource = async (id: string) => {
    await storageService.deleteSource(id);
    if (selectedStory?.id === id) {
      setSelectedStory(null);
    }
    await loadData();
  };

  // Project Actions
  const handleSaveProject = async (
    config: Omit<ProjectConfig, 'id' | 'seqNumber' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      const updated = await storageService.updateProject(existingId, config);
      await loadData();
      setActiveProject(updated);
      setActiveTab('history');
    } else {
      const created = await storageService.addProject(config);
      await loadData();
      setActiveProject(created);
      setActiveTab('history');
    }
  };

  const handleEditProject = (project: ProjectConfig) => {
    setProjectToEdit(project);
    setProjectInitialSourceId(project.sourceStoryId);
    setIsProjectModalOpen(true);
  };

  const handleUpdateProjectStatus = async (id: string, status: WorkflowStatus) => {
    const updated = await storageService.updateProject(id, { status });
    await loadData();
    if (activeProject?.id === id) {
      setActiveProject(updated);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await storageService.deleteProject(id);
    await loadData();
  };

  const handleCreateProjectFromSource = (story: SourceStory) => {
    setProjectToEdit(null);
    setProjectInitialSourceId(story.id);
    setIsProjectModalOpen(true);
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await storageService.seedDemoStoryIfEmpty();
      await loadData();
      setActiveTab('sources');
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center text-xs font-mono text-[#FF1738]">
        INITIALIZING ULTIMATETRON CORE...
      </div>
    );
  }

  if (showBootScreen) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F4F5FA] relative flex flex-col font-sans selection:bg-[#FF1738]/30 selection:text-white">
      {/* Background Holographic Atmosphere */}
      <AmbientCanvas />

      {/* Top Bar with Strict Contract */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewSourceModal={() => setIsAddSourceOpen(true)}
        selectedStoryTitle={selectedStory?.title}
        onReplayBoot={handleReplayBoot}
      />

      {/* Main Workspace with Sidebar & Viewport */}
      <div className="flex-1 flex relative z-10">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            activeProject={activeProject}
            sourceCount={sources.length}
            projectCount={projects.length}
            storageDriver={diagnostics?.driver || 'IndexedDB'}
            onOpenProjectModal={() => {
              setProjectInitialSourceId(undefined);
              setIsProjectModalOpen(true);
            }}
            onRunDiagnostics={() => setActiveTab('settings')}
          />
        </div>

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && (
            <DashboardView
              sources={sources}
              projects={projects}
              onNavigate={setActiveTab}
              onOpenNewSourceModal={() => setIsAddSourceOpen(true)}
              onOpenProjectModal={(srcId) => {
                setProjectInitialSourceId(srcId);
                setIsProjectModalOpen(true);
              }}
              onSelectSource={(s) => {
                setSelectedStory(s);
                setActiveTab('sources');
              }}
              onSelectProject={(p) => {
                setActiveProject(p);
                setActiveTab('history');
              }}
              onSeedDemo={handleSeedDemo}
              isSeeding={isSeeding}
            />
          )}

          {activeTab === 'sources' && (
            <SourceLibraryView
              sources={sources}
              selectedStory={selectedStory}
              onSelectStory={setSelectedStory}
              onOpenAddModal={() => setIsAddSourceOpen(true)}
              onOpenEditModal={(story) => {
                setStoryToEdit(story);
                setIsEditSourceOpen(true);
              }}
              onDeleteStory={handleDeleteSource}
              onCreateProjectFromSource={handleCreateProjectFromSource}
            />
          )}

          {activeTab === 'scripts' && (
            <ScriptEngineView
              activeProject={activeProject}
              projects={projects}
              sources={sources}
              onSelectProject={(project) => setActiveProject(project)}
              onNavigate={setActiveTab}
              onOpenProjectModal={() => {
                setProjectInitialSourceId(undefined);
                setIsProjectModalOpen(true);
              }}
            />
          )}

          {activeTab === 'flow_prompts' && (
            <FlowStudioView
              activeProject={activeProject}
              projects={projects}
              sources={sources}
              onSelectProject={(project) => setActiveProject(project)}
              onNavigate={setActiveTab}
              onOpenProjectModal={() => {
                setProjectInitialSourceId(undefined);
                setIsProjectModalOpen(true);
              }}
            />
          )}

          {activeTab === 'thumbnails' && (
            <ThumbnailStudioView
              activeProject={activeProject}
              sources={sources}
              onNavigate={setActiveTab}
              onOpenProjectModal={() => {
                setProjectInitialSourceId(undefined);
                setIsProjectModalOpen(true);
              }}
            />
          )}

          {activeTab === 'production' && (
            <ProductionWorkspaceView
              activeProject={activeProject}
              sources={sources}
              onNavigate={setActiveTab}
              onOpenProjectModal={() => {
                setProjectInitialSourceId(undefined);
                setIsProjectModalOpen(true);
              }}
            />
          )}

          {activeTab === 'history' && (
            <ProjectHistoryView
              projects={projects}
              sources={sources}
              onOpenProjectModal={() => {
                setProjectToEdit(null);
                setProjectInitialSourceId(undefined);
                setIsProjectModalOpen(true);
              }}
              onEditProject={handleEditProject}
              onSelectProject={(p) => setActiveProject(p)}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onDeleteProject={handleDeleteProject}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              diagnostics={diagnostics}
              onRefreshDiagnostics={loadData}
              onReplayBoot={handleReplayBoot}
              onDataMutated={loadData}
            />
          )}
        </main>
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onSave={handleSaveSource}
      />

      {/* Edit / Branch Version Modal */}
      <EditSourceModal
        isOpen={isEditSourceOpen}
        onClose={() => {
          setIsEditSourceOpen(false);
          setStoryToEdit(null);
        }}
        story={storyToEdit}
        onSave={handleUpdateSource}
      />

      {/* Canonical Project Configuration Modal */}
      <ProjectConfigModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectInitialSourceId(undefined);
          setProjectToEdit(null);
        }}
        sources={sources}
        initialSourceId={projectInitialSourceId}
        projectToEdit={projectToEdit}
        onSave={handleSaveProject}
        onOpenAddSource={() => setIsAddSourceOpen(true)}
      />
    </div>
  );
}
