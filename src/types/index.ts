/**
 * ULTIMATETRON — Type Definitions
 * Strict data models for Source Stories, Projects, Workflow States, and Settings.
 */

export type WorkflowStatus =
  | 'not_started'
  | 'draft'
  | 'needs_review'
  | 'approved'
  | 'ready_for_export';

export type AspectRatio = '9:16' | '16:9';

export type SupportedLanguage = 'Hindi' | 'English';

export type ContentMode =
  | 'Explainer'
  | 'Documentary'
  | 'Breaking News'
  | 'Detailed Explainer'
  | 'Horror Story'
  | 'Funny / Comedy'
  | 'Sci-Fi Explainer'
  | 'Mystery'
  | 'History'
  | 'Biography'
  | 'Investigative'
  | 'Myth vs Fact'
  | 'Case Study'
  | 'Educational'
  | 'Top Facts / List'
  | 'Motivational Story';

export type ContentTone =
  | 'Neutral'
  | 'Urgent'
  | 'Suspenseful'
  | 'Warm'
  | 'Humorous'
  | 'Analytical';

export type VisualStyle =
  | 'Cinematic'
  | '2D Animation'
  | '3D Animation'
  | 'Cartoon'
  | 'Comic-Book'
  | 'Vector Animation'
  | 'Documentary Realism'
  | 'Infographic / Motion Graphics';

export interface SourceVersionRecord {
  version: number;
  updatedAt: string;
  changeNote?: string;
  contentSnapshot: string;
}

export interface SourceStory {
  id: string; // E.g., STORY-000001
  seqNumber: number;
  version: number; // e.g. 1
  title: string;
  content: string; // Exact, preserved source text
  sourceUrl?: string;
  publisher?: string;
  publicationDate?: string;
  tags: string[];
  wordCount: number;
  charCount: number;
  createdAt: string;
  updatedAt: string;
  versionHistory: SourceVersionRecord[];
}

export interface ProjectConfig {
  id: string; // E.g., PROJ-000001
  seqNumber: number;
  name: string;
  sourceStoryId: string;
  sourceVersion: number;
  status: WorkflowStatus;
  aspectRatio: AspectRatio;
  duration: number; // in seconds
  clipCount?: number; // For 9:16 (duration / 8)
  language: SupportedLanguage;
  contentMode: ContentMode;
  tone: ContentTone;
  visualStyle: VisualStyle;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptWarning {
  type: 'timing' | 'fidelity' | 'repetition' | 'unsupported_claim' | 'mode';
  severity: 'warning' | 'error' | 'notice';
  claimText?: string;
  sourceExcerpt?: string;
  reason: string;
  status: 'supported_by_source' | 'requires_verification' | 'interpretive';
}

export interface ScriptSection {
  id: string; // e.g. SEC-001 (stable ID)
  segmentNumber: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  purpose: string;
  narration: string;
  visualIntention?: string;
  wordCount: number;
  estimatedDurationSec: number;
  warnings: ScriptWarning[];
}

export interface ScriptAnalysis {
  topic: string;
  entities: string[];
  dates: string[];
  events: string[];
  sourceStatedFacts: string[];
  allegations: string[];
  interpretations: string[];
  unknowns: string[];
  centralQuestion: string;
  narrativeArc: string;
  analyzedAt: string;
}

export interface ScriptRecord {
  id: string; // e.g. SCRIPT-000001
  seqNumber: number;
  projectId: string;
  version: number;
  sourceStoryId: string;
  sourceVersion: number;
  projectSnapshot: {
    aspectRatio: AspectRatio;
    duration: number;
    clipCount?: number;
    language: SupportedLanguage;
    contentMode: ContentMode;
    tone: ContentTone;
    visualStyle: VisualStyle;
  };
  analysis?: ScriptAnalysis;
  sections: ScriptSection[];
  totalWordCount: number;
  estimatedTotalDuration: number;
  overallWarnings: ScriptWarning[];
  isApproved: boolean;
  approvalTimestamp?: string;
  approvedBy?: string;
  parentScriptId?: string;
  createdAt: string;
  updatedAt: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'sources'
  | 'scripts'
  | 'flow_prompts'
  | 'thumbnails'
  | 'production'
  | 'history'
  | 'settings';

export interface StorageDiagnostics {
  driver: 'IndexedDB' | 'localStorage';
  sourceCount: number;
  projectCount: number;
  scriptCount?: number;
  promptPackageCount?: number;
  thumbnailPackageCount?: number;
  assetCount?: number;
  productionPackageCount?: number;
  highestStorySeq: number;
  highestScriptSeq?: number;
  highestPackageSeq?: number;
  highestThumbnailSeq?: number;
  highestAssetSeq?: number;
  highestProdPackageSeq?: number;
  storageEstimateBytes?: number;
  emblemStatus: 'mounted' | 'fallback' | 'custom_uploaded';
}

// ==========================================
// PHASE 4: GOOGLE FLOW PROMPT STUDIO TYPES
// ==========================================

export interface ContinuityVisualIdentity {
  overallVisualStyle: VisualStyle;
  colorGrading: string;
  contrastAndLighting: string;
  textureAndDetail: string;
  realismOrAnimationProfile: string;
}

export interface ContinuitySubjectIdentity {
  primarySubjectId: string;
  appearanceDescription: string;
  wardrobeAndAccessories: string;
  identifyingCharacteristics: string;
  consistencyConstraints: string;
}

export interface ContinuityEnvironment {
  primaryLocation: string;
  architecturalLandscapeFeatures: string;
  weatherAndAtmosphere: string;
  timePeriodAndTimeOfDay: string;
}

export interface ContinuityCameraLanguage {
  preferredFraming: string;
  cameraMovementConventions: string;
  lensAndDepthOfField: string;
  pacingAndTransitions: string;
}

export interface ContinuityVoiceProfile {
  language: SupportedLanguage;
  accentOrDialect: string;
  vocalCharacterAndTone: string;
  narrationPacingWpm: number;
  emotionalCadence: string;
  pronunciationNotes: string;
}

export interface ContinuityAudioProfile {
  musicMood: string;
  energyCurve: string;
  ambientSoundBed: string;
  soundEffectsStrategy: string;
  audioTransitionStyle: string;
}

export interface ContinuityProfile {
  visualIdentity: ContinuityVisualIdentity;
  subjectIdentity: ContinuitySubjectIdentity;
  environment: ContinuityEnvironment;
  cameraLanguage: ContinuityCameraLanguage;
  voiceProfile: ContinuityVoiceProfile;
  audioProfile: ContinuityAudioProfile;
  aspectRatio: AspectRatio;
  contentMode: ContentMode;
  visualStyle: VisualStyle;
  targetDuration: number;
}

export interface StructuredScenePrompt {
  // A. Scene Identity
  sceneIdentity: {
    projectTitle: string;
    sceneNumber: number;
    totalScenes: number;
    sceneId: string;
    linkedScriptSectionId: string;
    targetDurationSec: number;
    aspectRatio: AspectRatio;
  };
  // B. Scene Objective
  sceneObjective: {
    purpose: string;
    mainVisualIdea: string;
    intendedViewerEffect: string;
    connectionToNarration: string;
  };
  // C. Subject & Environment
  subjectAndEnvironment: {
    mainSubject: string;
    appearanceAndWardrobe: string;
    settingAndBackground: string;
    timeOfDay: string;
    keyObjects: string;
    screenComposition: string;
  };
  // D. Action & Motion
  actionAndMotion: {
    actionDescription: string;
    subjectMovement: string;
    environmentalMovement: string;
    foregroundBackgroundMotion: string;
    progressionStates?: string;
  };
  // E. Camera Direction
  cameraDirection: {
    shotTypeAndFraming: string;
    cameraAngle: string;
    cameraMovement: string;
    lensOrDepthOfField: string;
    focusBehavior: string;
    visualHierarchy: string;
  };
  // F. Lighting & Color
  lightingAndColor: {
    lightSourceAndDirection: string;
    contrastAndShadow: string;
    colorPalette: string;
    selectedStyleNotes: string;
    adjacentSceneContinuity: string;
  };
  // G. Narration & Audio
  narrationAndAudio: {
    exactLinkedNarration: string;
    language: SupportedLanguage;
    voiceProfileSummary: string;
    intendedDeliveryPacing: string;
    musicMoodEnergy: string;
    ambientSoundEffects: string;
    audioTransitionGuidance: string;
  };
  // H. Transitions & Continuity
  transitionsAndContinuity: {
    openingVisualState: string;
    endingVisualState: string;
    incomingTransition: string;
    outgoingTransition: string;
    matchCutOrBridge: string;
    continuityDependencies: string[];
  };
  // I. Constraints / Negative Safeguards
  constraints: {
    negativeRestrictions: string;
  };
  // J. Final Standalone Production Prompt
  finalProductionPrompt: string;
}

export interface SceneRevisionEntry {
  revision: number;
  timestamp: string;
  prompt: string;
  instruction?: string;
}

export interface PromptWarning {
  type:
    | 'structural'
    | 'continuity'
    | 'duration'
    | 'fidelity'
    | 'coverage'
    | 'missing_field'
    | 'contradiction';
  severity: 'error' | 'warning' | 'note';
  message: string;
  suggestedFix?: string;
}

export interface ScenePromptRecord {
  id: string; // e.g. SCENE-001
  segmentNumber: number;
  scriptSectionId: string;
  startTime: number;
  endTime: number;
  targetDuration: number;
  aspectRatio: AspectRatio;
  exactNarration: string;
  structured: StructuredScenePrompt;
  finalProductionPrompt: string;
  sceneOverrides?: Partial<ContinuityProfile>;
  revisionHistory: SceneRevisionEntry[];
  status: 'draft' | 'reviewed' | 'regenerated';
  warnings: PromptWarning[];
}

export interface PromptValidationReport {
  canExport: boolean;
  structuralErrors: string[];
  warnings: string[];
  notes: string[];
}

export interface PromptPackage {
  id: string; // e.g. PACKAGE-000001
  seqNumber: number;
  projectId: string;
  scriptId: string;
  scriptVersion: number;
  sourceStoryId: string;
  sourceVersion: number;
  projectSnapshot: {
    aspectRatio: AspectRatio;
    duration: number;
    clipCount?: number;
    language: SupportedLanguage;
    contentMode: ContentMode;
    tone: ContentTone;
    visualStyle: VisualStyle;
  };
  continuityProfile: ContinuityProfile;
  scenes: ScenePromptRecord[];
  validationReport: PromptValidationReport;
  version: number;
  isReadyForExport: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PHASE 5: THUMBNAIL STUDIO TYPES
// ==========================================

export type ThumbnailCreativeIntensity = 'subtle' | 'balanced' | 'dramatic';

export type ThumbnailSubjectPlacement =
  | 'center'
  | 'rule_of_thirds_left'
  | 'rule_of_thirds_right'
  | 'foreground_dominant';

export type ThumbnailFacialExpression =
  | 'subtle'
  | 'moderate'
  | 'intense_intrigue'
  | 'shock_dramatic'
  | 'not_applicable';

export type ThumbnailCameraFraming =
  | 'extreme_close_up'
  | 'close_up'
  | 'medium_close_up'
  | 'low_angle_dramatic'
  | 'dutch_tilt'
  | 'wide_panoramic';

export type ThumbnailBackgroundComplexity =
  | 'minimalist'
  | 'balanced'
  | 'dense_high_detail';

export type ThumbnailLighting =
  | 'rim_edge_glow'
  | 'chiaroscuro'
  | 'volumetric_rays'
  | 'cybernetic_neon'
  | 'golden_hour';

export type ThumbnailColorStrategy =
  | 'crimson_cyan'
  | 'warm_amber_slate'
  | 'high_key_vibrant'
  | 'desaturated_noir'
  | 'high_contrast_mono';

export type ThumbnailTypographyStyle =
  | 'bold_sans'
  | 'futuristic_display'
  | 'distress_grunge'
  | 'cinematic_serif';

export type ThumbnailTextPlacement =
  | 'top_left'
  | 'bottom_left'
  | 'center_banner'
  | 'none';

export type ThumbnailTextVisibility =
  | 'high_impact_boxed'
  | 'drop_shadow_outline'
  | 'minimalist';

export type ThumbnailBranding =
  | 'emblem_badge'
  | 'watermark_corner'
  | 'none';

export interface ThumbnailConfig {
  aspectRatio: AspectRatio;
  visualStyle: VisualStyle | 'Photorealistic' | 'Custom';
  customStyleNotes?: string;
  subjectPlacement: ThumbnailSubjectPlacement;
  facialExpression: ThumbnailFacialExpression;
  cameraFraming: ThumbnailCameraFraming;
  backgroundComplexity: ThumbnailBackgroundComplexity;
  lightingDirection: ThumbnailLighting;
  colorPalette: ThumbnailColorStrategy;
  typographyStyle: ThumbnailTypographyStyle;
  textPlacement: ThumbnailTextPlacement;
  textVisibility: ThumbnailTextVisibility;
  headlineText?: string;
  branding: ThumbnailBranding;
  creativeIntensity: ThumbnailCreativeIntensity;
}

export interface ThumbnailScriptContext {
  mainSubject: string;
  centralConflict: string;
  strongestVisualMoment: string;
  emotionalTone: string;
  importantEnvironment: string;
  mainCuriosityHook: string;
  spoilerWarnings: string[];
  keyEntities: string[];
}

export type ConceptOptionId = 'concept_a' | 'concept_b' | 'concept_c';

export interface ConceptRevisionEntry {
  revision: number;
  timestamp: string;
  prompt: string;
  negativePrompt: string;
  instruction?: string;
}

export interface ThumbnailConcept {
  id: ConceptOptionId;
  title: string;
  creativeDirection: string;
  creativeRationale: string;
  primarySubject: string;
  facialExpressionDirection: string;
  compositionAndFocalPoint: string;
  backgroundAndEnvironment: string;
  foregroundBackgroundSeparation: string;
  colorPaletteAndContrast: string;
  lightingAndAtmosphere: string;
  thumbnailTextSuggestion: string;
  typographyHierarchyAndPlacement: string;
  safeMarginsAndMobileReadability: string;
  selfContainedPrompt: string;
  negativePrompt: string;
  inferredCreativeElements: string[];
  generatedImageUrl?: string;
  imageGenerationStatus: 'not_requested' | 'generating' | 'generated' | 'failed' | 'unavailable';
  imageGenerationError?: string;
  revisionHistory: ConceptRevisionEntry[];
}

export interface ThumbnailWarning {
  type: 'structural' | 'story_fidelity' | 'text_render_disclaimer' | 'mobile_safe_margin' | 'contrast';
  severity: 'error' | 'warning' | 'notice';
  message: string;
  conceptId?: ConceptOptionId;
}

export interface ThumbnailValidationReport {
  canExport: boolean;
  structuralErrors: string[];
  warnings: string[];
  notices: string[];
}

export interface ThumbnailPackage {
  id: string; // e.g. THUMB-000001
  seqNumber: number;
  projectId: string;
  storyId: string;
  sourceVersion: number;
  scriptId: string;
  scriptVersion: number;
  version: number;
  config: ThumbnailConfig;
  scriptContext: ThumbnailScriptContext;
  concepts: [ThumbnailConcept, ThumbnailConcept, ThumbnailConcept];
  validationReport: ThumbnailValidationReport;
  generationMode: 'prompt_only' | 'image_generated' | 'offline_fallback';
  exportSchemaVersion: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PHASE 6: PRODUCTION WORKSPACE & ASSET MANAGEMENT TYPES
// ==========================================

export type AssetCategory =
  | 'approved_script'
  | 'prompt_package'
  | 'thumbnail_concept'
  | 'reference_image'
  | 'voiceover_audio'
  | 'ambient_music'
  | 'generated_asset'
  | 'final_deliverable';

export type AssetStatus = 'ready' | 'processing' | 'failed' | 'missing';

export interface AssetRecord {
  id: string; // e.g. ASSET-000001
  seqNumber: number;
  projectId: string;
  category: AssetCategory;
  title: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  dataUrl?: string; // Stored base64 / blob payload
  storageRef?: string;
  createdAt: string;
  updatedAt: string;
  sourceRevisionProvenance: {
    storyId: string;
    sourceVersion: number;
    scriptId?: string;
    scriptVersion?: number;
  };
  associatedSceneId?: string;
  status: AssetStatus;
  tags: string[];
  userNotes?: string;
  isMandatory?: boolean;
}

export interface SceneAssetLinkage {
  sceneId: string; // e.g. SEC-001 or SCENE-001
  assetIds: string[];
  primaryVisualRefId?: string;
  voiceoverAssetId?: string;
  ambientAssetId?: string;
  notes?: string;
}

export type ProductionStageStatus =
  | 'not_started'
  | 'draft'
  | 'awaiting_approval'
  | 'approved'
  | 'ready_for_export'
  | 'exported'
  | 'blocked';

export interface ProductionStageHealth {
  sourceStatus: ProductionStageStatus;
  scriptStatus: ProductionStageStatus;
  flowPromptsStatus: ProductionStageStatus;
  thumbnailStatus: ProductionStageStatus;
  assetsStatus: ProductionStageStatus;
  packageStatus: ProductionStageStatus;
  overallProgressPercent: number; // Strictly computed from actual persisted artifacts
}

export interface ProductionReadinessReport {
  isReady: boolean;
  blockingErrors: string[];
  warnings: string[];
  recommendations: string[];
  missingMandatoryDeliverables: string[];
  checkedAt: string;
}

export interface ProductionPackageManifest {
  id: string; // e.g. PRODPKG-000001
  seqNumber: number;
  projectId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  exportSchemaVersion: string; // "ultimatetron.production.v1"
  projectSnapshot: {
    id: string;
    name: string;
    aspectRatio: AspectRatio;
    duration: number;
    language: SupportedLanguage;
    contentMode: ContentMode;
    tone: ContentTone;
    visualStyle: VisualStyle;
  };
  sourceProvenance: {
    storyId: string;
    sourceVersion: number;
    storyTitle: string;
  };
  scriptSnapshot: {
    id: string;
    version: number;
    approvalTimestamp: string;
    approvedBy: string;
    sectionsCount: number;
    totalWordCount: number;
  };
  promptPackageSnapshot?: {
    id: string;
    version: number;
    sceneCount: number;
    continuityProfileSummary: string;
  };
  thumbnailPackageSnapshot?: {
    id: string;
    version: number;
    selectedConceptId: string;
    selectedConceptTitle: string;
    selectedConceptPrompt: string;
  };
  assetManifest: Array<{
    assetId: string;
    title: string;
    category: AssetCategory;
    fileName?: string;
    sizeBytes?: number;
    attachedToSceneId?: string;
    hasDataUrl: boolean;
  }>;
  sceneLinkages: Record<string, SceneAssetLinkage>;
  readinessReport: ProductionReadinessReport;
  exportNotes?: string;
}


