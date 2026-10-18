/**
 * ULTIMATETRON — Master Thumbnail Studio Service (Phase 5)
 * Strict Architecture & Engine:
 * - Entry gate validation: strict enforcement of approved script binding & project existence
 * - Thumbnail context extraction: main subject, conflict, hook, visual moments, spoiler guards
 * - Three-option concept generator: Concept A (Curiosity), Concept B (Emotion), Concept C (Environment)
 * - Interactive configuration controls mapping (framing, lighting, placement, ratio, headline, typography)
 * - Single-concept selective regeneration with verified byte-for-byte preservation of other concepts
 * - Concept revision history & package versioning
 * - Separate prompt-only, image generation, and offline fallback capability states
 * - Automated validation engine with structural error blocking and creative warning disclosure
 * - Machine-readable JSON and readable Markdown exports
 */

import {
  ProjectConfig,
  SourceStory,
  ScriptRecord,
  ThumbnailConfig,
  ThumbnailScriptContext,
  ThumbnailConcept,
  ThumbnailPackage,
  ThumbnailValidationReport,
  ThumbnailWarning,
  ConceptOptionId,
  ConceptRevisionEntry,
  AspectRatio,
  VisualStyle,
  ThumbnailCameraFraming,
  ThumbnailLighting,
  ThumbnailColorStrategy,
  ThumbnailTypographyStyle,
  ThumbnailSubjectPlacement
} from '../types';
import { storageService } from './storage';

export class ThumbnailStudioService {
  /**
   * Phase 5 Entry Gate: Validates project, source, and approved script binding.
   * Locked if project missing or script unapproved.
   */
  async validateThumbnailEntryGate(
    projectId: string,
    scriptId?: string
  ): Promise<{
    canEnter: boolean;
    project: ProjectConfig | null;
    source: SourceStory | null;
    script: ScriptRecord | null;
    blockingReasons: string[];
  }> {
    const blockingReasons: string[] = [];

    const project = await storageService.getProjectById(projectId);
    if (!project) {
      return {
        canEnter: false,
        project: null,
        source: null,
        script: null,
        blockingReasons: [`Project "${projectId}" not found in local registry.`],
      };
    }

    const source = await storageService.getSourceById(project.sourceStoryId);
    if (!source) {
      blockingReasons.push(`Linked Source Story "${project.sourceStoryId}" not found in Master Vault.`);
    }

    let script: ScriptRecord | null = null;
    if (scriptId) {
      script = await storageService.getScriptById(scriptId);
      if (!script) {
        blockingReasons.push(`Script "${scriptId}" not found.`);
      }
    } else {
      const projectScripts = await storageService.getScriptsByProjectId(projectId);
      script = projectScripts.find((s) => s.isApproved) || null;
      if (!script && projectScripts.length > 0) {
        script = projectScripts[0]; // Will fail approval check below
      }
    }

    if (!script) {
      blockingReasons.push('No script draft generated for this project. Generate and approve a script in the Script Engine first.');
    } else if (!script.isApproved) {
      blockingReasons.push(
        `Script ${script.id} (v${script.version}) is in Draft status. Thumbnail Studio requires an approved script to guarantee visual provenance.`
      );
    } else {
      if (!script.sections || script.sections.length === 0) {
        blockingReasons.push('Approved script contains zero narration sections.');
      }
    }

    return {
      canEnter: blockingReasons.length === 0,
      project,
      source,
      script,
      blockingReasons,
    };
  }

  /**
   * Generates default configuration matching the project's canonical profile.
   */
  createDefaultConfig(project: ProjectConfig, script?: ScriptRecord | null): ThumbnailConfig {
    const isShorts = project.aspectRatio === '9:16';
    const isUrgent = project.tone === 'Urgent' || project.tone === 'Suspenseful';

    // Extract quick headline candidate from script topic or project name
    let defaultHeadline = project.name.split(/[-—:]/)[0].trim();
    if (script?.analysis?.topic) {
      defaultHeadline = script.analysis.topic.split(' ').slice(0, 4).join(' ');
    }
    if (defaultHeadline.length > 28) {
      defaultHeadline = defaultHeadline.slice(0, 28) + '...';
    }

    return {
      aspectRatio: project.aspectRatio || '16:9',
      visualStyle: project.visualStyle || 'Cinematic',
      subjectPlacement: 'rule_of_thirds_left',
      facialExpression: isUrgent ? 'intense_intrigue' : 'subtle',
      cameraFraming: isShorts ? 'medium_close_up' : 'close_up',
      backgroundComplexity: 'balanced',
      lightingDirection: 'rim_edge_glow',
      colorPalette: 'crimson_cyan',
      typographyStyle: 'bold_sans',
      textPlacement: 'bottom_left',
      textVisibility: 'high_impact_boxed',
      headlineText: defaultHeadline,
      branding: 'none',
      creativeIntensity: 'dramatic',
    };
  }

  /**
   * Analyzes approved script and story context to extract thumbnail hooks and constraints.
   */
  async extractScriptContext(
    project: ProjectConfig,
    script: ScriptRecord,
    source?: SourceStory | null
  ): Promise<ThumbnailScriptContext> {
    // Check if server analysis is available
    if (typeof window !== 'undefined' && source?.content) {
      try {
        const res = await fetch('/api/thumbnail/analyze-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyTitle: source.title,
            storyContent: source.content,
            script,
            project,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.mainSubject && data.centralConflict) {
            return data;
          }
        }
      } catch {
        // Fall back to deterministic local extraction
      }
    }

    // Deterministic algorithmic fallback
    const analysis = script.analysis;
    const firstSection = script.sections?.[0];
    const climaxSection = script.sections?.[Math.floor(script.sections.length / 2)] || firstSection;

    const mainSubject = analysis?.entities?.[0] || source?.title || project.name;
    const centralConflict = analysis?.centralQuestion || analysis?.topic || `${project.name} revelation`;
    const strongestVisualMoment = climaxSection?.visualIntention || climaxSection?.narration || `${mainSubject} under critical tension`;
    const emotionalTone = `${project.tone} urgency with dramatic curiosity`;
    const importantEnvironment = analysis?.entities?.find((e) => e.toLowerCase().includes('space') || e.toLowerCase().includes('lab') || e.toLowerCase().includes('city')) || 'High-contrast atmosphere';
    const mainCuriosityHook = analysis?.centralQuestion || `The Untold Truth of ${mainSubject}`;
    const spoilerWarnings = analysis?.unknowns?.length ? [analysis.unknowns[0]] : ['Do not reveal the final resolution before click'];
    const keyEntities = analysis?.entities || [mainSubject];

    return {
      mainSubject,
      centralConflict,
      strongestVisualMoment,
      emotionalTone,
      importantEnvironment,
      mainCuriosityHook,
      spoilerWarnings,
      keyEntities,
    };
  }

  /**
   * Generates a complete Thumbnail Package with exactly three distinct concepts.
   */
  async generateThumbnailPackage(
    projectId: string,
    scriptId: string,
    customConfig?: Partial<ThumbnailConfig>,
    onProgress?: (p: { step: number; totalSteps: number; message: string }) => void
  ): Promise<ThumbnailPackage> {
    onProgress?.({ step: 1, totalSteps: 4, message: 'Validating upstream approval gate...' });

    const gate = await this.validateThumbnailEntryGate(projectId, scriptId);
    if (!gate.canEnter || !gate.project || !gate.script) {
      throw new Error(`Cannot enter Thumbnail Studio: ${gate.blockingReasons.join(' ')}`);
    }

    const { project, source, script } = gate;

    onProgress?.({ step: 2, totalSteps: 4, message: 'Analyzing script context & narrative tension...' });
    const scriptContext = await this.extractScriptContext(project, script, source);

    const mergedConfig: ThumbnailConfig = {
      ...this.createDefaultConfig(project, script),
      ...customConfig,
    };

    onProgress?.({ step: 3, totalSteps: 4, message: 'Generating three distinct thumbnail concepts...' });

    let concepts: [ThumbnailConcept, ThumbnailConcept, ThumbnailConcept];
    let generationMode: 'prompt_only' | 'image_generated' | 'offline_fallback' = 'offline_fallback';

    // Attempt server Gemini generation
    try {
      const res = await fetch('/api/thumbnail/generate-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptContext,
          config: mergedConfig,
          project,
          script,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.concept_a && data.concept_b && data.concept_c) {
          concepts = [
            this.mapToConceptRecord('concept_a', data.concept_a, mergedConfig),
            this.mapToConceptRecord('concept_b', data.concept_b, mergedConfig),
            this.mapToConceptRecord('concept_c', data.concept_c, mergedConfig),
          ];
          generationMode = 'prompt_only';
        } else {
          concepts = this.generateDeterministicConcepts(project, scriptContext, mergedConfig);
        }
      } else {
        concepts = this.generateDeterministicConcepts(project, scriptContext, mergedConfig);
      }
    } catch {
      concepts = this.generateDeterministicConcepts(project, scriptContext, mergedConfig);
    }

    onProgress?.({ step: 4, totalSteps: 4, message: 'Validating concepts and establishing provenance...' });

    const validationReport = this.runValidationChecks(mergedConfig, script, concepts);

    // Save package into persistence
    const savedPackage = await storageService.saveThumbnailPackageDraft({
      projectId: project.id,
      storyId: project.sourceStoryId,
      sourceVersion: project.sourceVersion,
      scriptId: script.id,
      scriptVersion: script.version,
      version: 1,
      config: mergedConfig,
      scriptContext,
      concepts,
      validationReport,
      generationMode,
      exportSchemaVersion: 'ultimatetron.thumbnail.v1',
    });

    return savedPackage;
  }

  /**
   * Regenerates a single concept (A, B, or C) while preserving the other two concepts byte-for-byte.
   */
  async regenerateSingleConcept(
    packageId: string,
    conceptId: ConceptOptionId,
    instruction?: string,
    updatedConfig?: Partial<ThumbnailConfig>
  ): Promise<ThumbnailPackage> {
    const pkg = await storageService.getThumbnailPackageById(packageId);
    if (!pkg) {
      throw new Error(`Thumbnail Package "${packageId}" not found.`);
    }

    const script = await storageService.getScriptById(pkg.scriptId);
    if (!script) {
      throw new Error(`Approved script "${pkg.scriptId}" not found.`);
    }

    const project = await storageService.getProjectById(pkg.projectId);
    if (!project) {
      throw new Error(`Project "${pkg.projectId}" not found.`);
    }

    const targetIndex = pkg.concepts.findIndex((c) => c.id === conceptId);
    if (targetIndex === -1) {
      throw new Error(`Concept "${conceptId}" not found in package.`);
    }

    // Capture byte-for-byte snapshots of unaffected concepts before mutation
    const beforeSnapshots = pkg.concepts.map((c) => JSON.stringify(c));

    const activeConfig: ThumbnailConfig = {
      ...pkg.config,
      ...updatedConfig,
    };

    const currentConcept = pkg.concepts[targetIndex];

    // Attempt server-side regeneration
    let regenerated: ThumbnailConcept;
    try {
      const res = await fetch('/api/thumbnail/regenerate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId,
          currentConcept,
          config: activeConfig,
          project,
          scriptContext: pkg.scriptContext,
          instruction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        regenerated = this.mapToConceptRecord(conceptId, data, activeConfig, currentConcept, instruction);
      } else {
        regenerated = this.regenerateDeterministicConcept(conceptId, currentConcept, activeConfig, pkg.scriptContext, instruction);
      }
    } catch {
      regenerated = this.regenerateDeterministicConcept(conceptId, currentConcept, activeConfig, pkg.scriptContext, instruction);
    }

    // Construct new concepts tuple with strict byte-for-byte preservation for unaffected concepts
    const newConcepts: [ThumbnailConcept, ThumbnailConcept, ThumbnailConcept] = [
      targetIndex === 0 ? regenerated : JSON.parse(beforeSnapshots[0]),
      targetIndex === 1 ? regenerated : JSON.parse(beforeSnapshots[1]),
      targetIndex === 2 ? regenerated : JSON.parse(beforeSnapshots[2]),
    ];

    // Verify byte-for-byte preservation
    for (let i = 0; i < 3; i++) {
      if (i !== targetIndex) {
        const afterStr = JSON.stringify(newConcepts[i]);
        if (afterStr !== beforeSnapshots[i]) {
          throw new Error(`Integrity violation: concept ${i} mutated during selective regeneration of concept ${targetIndex}.`);
        }
      }
    }

    const validationReport = this.runValidationChecks(activeConfig, script, newConcepts);

    const updated = await storageService.updateThumbnailPackage(pkg.id, {
      config: activeConfig,
      concepts: newConcepts,
      validationReport,
    });

    return updated;
  }

  /**
   * Triggers server-side image generation for a specific concept prompt when API is configured.
   */
  async generateConceptImage(packageId: string, conceptId: ConceptOptionId): Promise<ThumbnailPackage> {
    const pkg = await storageService.getThumbnailPackageById(packageId);
    if (!pkg) throw new Error(`Package "${packageId}" not found.`);

    const targetIndex = pkg.concepts.findIndex((c) => c.id === conceptId);
    if (targetIndex === -1) throw new Error(`Concept "${conceptId}" not found.`);

    const targetConcept = pkg.concepts[targetIndex];

    try {
      const res = await fetch('/api/thumbnail/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetConcept.selfContainedPrompt,
          negativePrompt: targetConcept.negativePrompt,
          aspectRatio: pkg.config.aspectRatio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          targetConcept.generatedImageUrl = data.imageUrl;
          targetConcept.imageGenerationStatus = 'generated';
          targetConcept.imageGenerationError = undefined;
        } else {
          targetConcept.imageGenerationStatus = 'failed';
          targetConcept.imageGenerationError = 'Model returned empty image data.';
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        targetConcept.imageGenerationStatus = res.status === 503 ? 'unavailable' : 'failed';
        targetConcept.imageGenerationError = errData.error || `HTTP ${res.status}: Image generation unavailable`;
      }
    } catch (err: any) {
      targetConcept.imageGenerationStatus = 'failed';
      targetConcept.imageGenerationError = err.message || 'Network connection failed during image generation.';
    }

    return await storageService.updateThumbnailPackage(pkg.id, {
      concepts: [...pkg.concepts] as [ThumbnailConcept, ThumbnailConcept, ThumbnailConcept],
    });
  }

  /**
   * Deterministic Fallback Generator: produces 3 distinct, high-quality concepts without external API calls.
   */
  generateDeterministicConcepts(
    project: ProjectConfig,
    context: ThumbnailScriptContext,
    config: ThumbnailConfig
  ): [ThumbnailConcept, ThumbnailConcept, ThumbnailConcept] {
    const isShorts = config.aspectRatio === '9:16';
    const orientation = isShorts ? 'vertical 9:16 portrait composition' : 'wide 16:9 cinematic landscape';
    const headline = config.headlineText || context.mainCuriosityHook || 'CRITICAL DISCOVERY';

    // Concept A: High-Curiosity Cinematic Composition
    const promptA = `Hyper-detailed YouTube thumbnail image, ${orientation}, ${config.visualStyle} style. Visual focal point: ${context.mainSubject} positioned in dramatic ${config.subjectPlacement.replace(/_/g, ' ')}, illuminated by ${config.lightingDirection.replace(/_/g, ' ')}. Background features ${context.importantEnvironment} with volumetric haze and atmospheric depth. Color grading in ${config.colorPalette.replace(/_/g, ' ')}. High visual contrast, dramatic tension around "${context.centralConflict}". Crisp focus, 8k resolution, cinematic lighting, rule of thirds, clean mobile-readable composition.`;
    const negA = `blurry details, flat lighting, cropped focal point, low resolution, amateur graphic design, distorted facial features, gibberish random text, watermarks, ugly anatomy`;

    const conceptA: ThumbnailConcept = {
      id: 'concept_a',
      title: 'Concept A: High-Curiosity Cinematic Composition',
      creativeDirection: 'High-Curiosity Cinematic Composition',
      creativeRationale: `Positions ${context.mainSubject} dynamically off-center using ${config.subjectPlacement.replace(/_/g, ' ')} to create an open curiosity vector. High contrast between foreground and background commands attention in crowded mobile feeds.`,
      primarySubject: `${context.mainSubject} under intense dramatic focus`,
      facialExpressionDirection: config.facialExpression === 'not_applicable' ? 'Non-human focal object with volumetric rim glow' : `Intense facial intrigue (${config.facialExpression.replace(/_/g, ' ')}) looking towards off-screen mystery`,
      compositionAndFocalPoint: `Rule of thirds, ${config.subjectPlacement.replace(/_/g, ' ')} with leading depth lines into ${context.importantEnvironment}`,
      backgroundAndEnvironment: `${context.importantEnvironment} with atmospheric depth and volumetric light cones`,
      foregroundBackgroundSeparation: 'Strong bokeh and rim-lit separation maintaining high silhouette contrast',
      colorPaletteAndContrast: `Dominant ${config.colorPalette.replace(/_/g, ' ')} palette with deep shadows and vibrant edge accents`,
      lightingAndAtmosphere: `${config.lightingDirection.replace(/_/g, ' ')} creating dramatic dimensional contrast`,
      thumbnailTextSuggestion: headline,
      typographyHierarchyAndPlacement: `High-impact bold typography in ${config.textPlacement.replace(/_/g, ' ')}, ${config.textVisibility.replace(/_/g, ' ')}`,
      safeMarginsAndMobileReadability: isShorts ? 'Safe vertical center (middle 60%), keeping top and bottom 20% clear for platform overlays' : 'Leave bottom-right 20% clear for video duration timestamp badge; subject centered within safe zone',
      selfContainedPrompt: promptA,
      negativePrompt: negA,
      inferredCreativeElements: ['Volumetric dust motes and atmospheric haze', 'Chiaroscuro rim light highlights'],
      imageGenerationStatus: 'not_requested',
      revisionHistory: [],
    };

    // Concept B: Emotion-Driven Character / Focal Close-Up
    const promptB = `Macro close-up YouTube thumbnail, ${orientation}, ${config.visualStyle} realism. Primary subject: extreme focal close-up of ${context.mainSubject}, capturing intense emotional expression of ${config.facialExpression.replace(/_/g, ' ')}. Intense eye reflections, micro skin/material textures, shallow depth of field (f/1.8). Intense ${config.lightingDirection.replace(/_/g, ' ')} sculpting facial contours. Subtle hint of ${context.importantEnvironment} blurred in background. High emotional stakes reflecting "${context.centralConflict}". Highly emotive, cinematic masterpiece, 8k.`;
    const negB = `plastic skin, distorted eyes, asymmetrical pupils, lack of emotion, dull eyes, low contrast, washed out colors, artificial smoothing, chaotic background`;

    const conceptB: ThumbnailConcept = {
      id: 'concept_b',
      title: 'Concept B: Emotion-Driven Character Close-Up',
      creativeDirection: 'Emotion-Driven Character Close-Up',
      creativeRationale: `Leverages the human psychological response to intense facial expression and direct gaze. Pulls viewer directly into the personal emotional stakes of "${context.centralConflict}".`,
      primarySubject: `Extreme macro close-up of ${context.mainSubject}`,
      facialExpressionDirection: `High-intensity emotional resonance (${config.facialExpression.replace(/_/g, ' ')}), wide eyes, micro-expressions of shock and awe`,
      compositionAndFocalPoint: 'Subject fills 60% of frame with focal point focused on eyes and facial tension',
      backgroundAndEnvironment: 'Heavily defocused background hinting at environment through color and light blooms',
      foregroundBackgroundSeparation: 'Extreme shallow depth of field (f/1.8 lens emulation) isolating subject completely',
      colorPaletteAndContrast: 'Warm skin/focal tones contrasted against cool dark shadows, saturated accent rim',
      lightingAndAtmosphere: 'Key light at 45 degrees with strong specular catchlights in eyes and edge rim',
      thumbnailTextSuggestion: headline.toUpperCase(),
      typographyHierarchyAndPlacement: `Compact 2-3 word bold display typography positioned at ${config.textPlacement.replace(/_/g, ' ')}`,
      safeMarginsAndMobileReadability: 'Facial focal point centered in upper 50% to ensure readability at 50px mobile thumbnail size',
      selfContainedPrompt: promptB,
      negativePrompt: negB,
      inferredCreativeElements: ['Specular eye catchlights with reflected environmental silhouette', 'Micro-textured surface details'],
      imageGenerationStatus: 'not_requested',
      revisionHistory: [],
    };

    // Concept C: Dramatic Environmental Storytelling
    const promptC = `Epic scale environmental storytelling YouTube thumbnail, ${orientation}, ${config.visualStyle}. Wide cinematic vantage showing ${context.importantEnvironment} in vast scale. A lone silhouette or focal figure of ${context.mainSubject} confronts an overwhelming scale event representing "${context.centralConflict}". Colossal horizon, atmospheric volumetric god-rays, deep depth planes. Color palette: ${config.colorPalette.replace(/_/g, ' ')}. Dramatic cinematic concept art, Unreal Engine 5 render style, 8k resolution.`;
    const negC = `cluttered mess, unreadable scale, muddy colors, no clear focal point, oversaturated cheap filter, flat perspective, blurry horizon`;

    const conceptC: ThumbnailConcept = {
      id: 'concept_c',
      title: 'Concept C: Dramatic Environmental Storytelling',
      creativeDirection: 'Dramatic Environmental Storytelling',
      creativeRationale: `Emphasizes epic physical scale and cosmic/environmental consequence. Contrasts human/small subject against immense scale to stimulate profound curiosity regarding the overarching narrative.`,
      primarySubject: `Silhouette/figure of ${context.mainSubject} set against colossal environmental forces`,
      facialExpressionDirection: 'Silhouetted or determined posture conveying awe and confrontation with the unknown',
      compositionAndFocalPoint: 'Low-angle wide perspective with strong vertical scale lines leading from subject to sky/horizon',
      backgroundAndEnvironment: `Towering, intricate ${context.importantEnvironment} showing scale and worldbuilding texture`,
      foregroundBackgroundSeparation: 'Atmospheric depth layers (aerial perspective, dust layers, light shafts)',
      colorPaletteAndContrast: 'Deep cinematic contrast with glowing focal horizon and atmospheric color grading',
      lightingAndAtmosphere: 'Grand volumetric god rays cutting through dark clouds/mist',
      thumbnailTextSuggestion: `WHAT HAPPENED TO ${context.mainSubject.toUpperCase()}?`,
      typographyHierarchyAndPlacement: `Centered or bottom banner with letterspaced cinematic styling`,
      safeMarginsAndMobileReadability: 'Strong high-contrast silhouette ensures subject stands out even at minimal mobile zoom',
      selfContainedPrompt: promptC,
      negativePrompt: negC,
      inferredCreativeElements: ['Colossal atmospheric light shafts', 'Layered aerial perspective fog'],
      imageGenerationStatus: 'not_requested',
      revisionHistory: [],
    };

    return [conceptA, conceptB, conceptC];
  }

  /**
   * Deterministic single-concept regeneration
   */
  regenerateDeterministicConcept(
    conceptId: ConceptOptionId,
    current: ThumbnailConcept,
    config: ThumbnailConfig,
    context: ThumbnailScriptContext,
    instruction?: string
  ): ThumbnailConcept {
    const isShorts = config.aspectRatio === '9:16';
    const orientation = isShorts ? 'vertical 9:16' : 'horizontal 16:9';
    const now = new Date().toISOString();

    const previousHistory = current.revisionHistory || [];
    const newRevisionNumber = previousHistory.length + 1;

    const historyEntry: ConceptRevisionEntry = {
      revision: newRevisionNumber,
      timestamp: now,
      prompt: current.selfContainedPrompt,
      negativePrompt: current.negativePrompt,
      instruction: instruction || 'Refined with updated configuration controls',
    };

    const refinedPrompt = `${current.selfContainedPrompt} User Directive: ${instruction || 'Heighten visual drama and mobile-feed contrast'}. Rendered in ${orientation} with ${config.visualStyle} fidelity and ${config.lightingDirection.replace(/_/g, ' ')}.`;

    return {
      ...current,
      creativeRationale: `${current.creativeRationale} [Revision ${newRevisionNumber}: Refined based on directive: "${instruction || 'Adjusted visual parameters'}"]`,
      selfContainedPrompt: refinedPrompt,
      safeMarginsAndMobileReadability: isShorts
        ? 'Safe vertical central 60% viewport zone, avoiding platform UI chips'
        : 'Safe 16:9 layout with bottom-right 20% timestamp avoidance',
      revisionHistory: [...previousHistory, historyEntry],
    };
  }

  /**
   * Helper to map server-generated JSON into strongly-typed ThumbnailConcept record
   */
  private mapToConceptRecord(
    id: ConceptOptionId,
    data: any,
    config: ThumbnailConfig,
    previousConcept?: ThumbnailConcept,
    instruction?: string
  ): ThumbnailConcept {
    const now = new Date().toISOString();
    const prevHistory = previousConcept?.revisionHistory || [];

    let newHistory = prevHistory;
    if (previousConcept) {
      newHistory = [
        ...prevHistory,
        {
          revision: prevHistory.length + 1,
          timestamp: now,
          prompt: previousConcept.selfContainedPrompt,
          negativePrompt: previousConcept.negativePrompt,
          instruction: instruction || 'Regenerated concept',
        },
      ];
    }

    return {
      id,
      title: data.title || `Concept ${id.toUpperCase().replace('CONCEPT_', '')}`,
      creativeDirection: data.creativeDirection || 'Cinematic Direction',
      creativeRationale: data.creativeRationale || '',
      primarySubject: data.primarySubject || '',
      facialExpressionDirection: data.facialExpressionDirection || '',
      compositionAndFocalPoint: data.compositionAndFocalPoint || '',
      backgroundAndEnvironment: data.backgroundAndEnvironment || '',
      foregroundBackgroundSeparation: data.foregroundBackgroundSeparation || '',
      colorPaletteAndContrast: data.colorPaletteAndContrast || '',
      lightingAndAtmosphere: data.lightingAndAtmosphere || '',
      thumbnailTextSuggestion: data.thumbnailTextSuggestion || config.headlineText || '',
      typographyHierarchyAndPlacement: data.typographyHierarchyAndPlacement || '',
      safeMarginsAndMobileReadability: data.safeMarginsAndMobileReadability || '',
      selfContainedPrompt: data.selfContainedPrompt || '',
      negativePrompt: data.negativePrompt || 'blurry, low quality, distorted',
      inferredCreativeElements: data.inferredCreativeElements || [],
      imageGenerationStatus: 'not_requested',
      revisionHistory: newHistory,
    };
  }

  /**
   * Deterministic Validation Engine (Section 8)
   */
  runValidationChecks(
    config: ThumbnailConfig,
    script: ScriptRecord,
    concepts: ThumbnailConcept[]
  ): ThumbnailValidationReport {
    const structuralErrors: string[] = [];
    const warnings: string[] = [];
    const notices: string[] = [];

    // 1. Exactly 3 concepts check
    if (!concepts || concepts.length !== 3) {
      structuralErrors.push(`Thumbnail package must contain exactly 3 concepts (found ${concepts?.length || 0}).`);
    }

    // 2. Aspect Ratio validation
    if (config.aspectRatio !== '16:9' && config.aspectRatio !== '9:16') {
      structuralErrors.push(`Invalid aspect ratio "${config.aspectRatio}". Must be "16:9" or "9:16".`);
    }

    // 3. Script link validation
    if (!script || !script.isApproved) {
      structuralErrors.push('Concepts must bind to an approved script record.');
    }

    // 4. Per-concept validation
    concepts?.forEach((c, idx) => {
      const label = `Concept ${String.fromCharCode(65 + idx)}`;

      if (!c.selfContainedPrompt || c.selfContainedPrompt.trim().length < 25) {
        structuralErrors.push(`${label} prompt is empty or too short (< 25 characters).`);
      }

      if (!c.title || !c.creativeDirection || !c.creativeRationale) {
        structuralErrors.push(`${label} is missing required creative direction or rationale.`);
      }

      if (!c.compositionAndFocalPoint) {
        warnings.push(`${label} does not specify focal point composition.`);
      }

      if (!c.backgroundAndEnvironment) {
        warnings.push(`${label} does not specify background environment.`);
      }

      if (!c.safeMarginsAndMobileReadability) {
        warnings.push(`${label} missing mobile safe margins documentation.`);
      }

      // Check for negative prompt
      if (!c.negativePrompt || c.negativePrompt.trim().length < 10) {
        warnings.push(`${label} negative prompt is missing or incomplete.`);
      }

      // Story contradiction flags: check if concept mentions alien or futuristic lasers for documentary mode
      if (script.projectSnapshot.contentMode === 'Documentary' || script.projectSnapshot.contentMode === 'Breaking News') {
        const lowerPrompt = c.selfContainedPrompt.toLowerCase();
        if (lowerPrompt.includes('alien invasion') || lowerPrompt.includes('fantasy dragon')) {
          warnings.push(`${label} contains speculative creative elements that may conflict with Documentary mode.`);
        }
      }
    });

    // 5. Standard Text-Rendering Notice (non-blocking)
    notices.push(
      'Text Rendering Notice: Image models (Imagen, Midjourney, FLUX) may render misspelled or degraded typographic text. Always plan for final post-production vector typography overlays.'
    );

    // 6. Mobile Safe Margin Notice
    if (config.aspectRatio === '16:9') {
      notices.push('Safe Margins: Keep the lower-right 20% free of critical visual info to avoid YouTube timestamp overlay.');
    } else {
      notices.push('Safe Margins: Keep top 15% and bottom 20% clear of critical focal details for Reels/Shorts UI controls.');
    }

    return {
      canExport: structuralErrors.length === 0,
      structuralErrors,
      warnings,
      notices,
    };
  }

  /**
   * Serializes the thumbnail package as clean, structured JSON
   */
  exportPackageAsJSON(pkg: ThumbnailPackage): string {
    return JSON.stringify(pkg, null, 2);
  }

  /**
   * Generates a readable, formatted Markdown production brief
   */
  exportPackageAsMarkdown(
    pkg: ThumbnailPackage,
    project: ProjectConfig,
    script: ScriptRecord
  ): string {
    const divider = '------------------------------------------------------------';
    const dateStr = new Date(pkg.createdAt).toUTCString();

    let md = `# ULTIMATETRON — THUMBNAIL PRODUCTION BRIEF
**Package ID:** \`${pkg.id}\` (Revision ${pkg.version})
**Project:** ${project.name} (\`${project.id}\`)
**Format:** ${pkg.config.aspectRatio} | **Style:** ${pkg.config.visualStyle} | **Intensity:** ${pkg.config.creativeIntensity}
**Approved Script Link:** \`${script.id}\` (v${script.version})
**Source Story ID:** \`${pkg.storyId}\` (v${pkg.sourceVersion})
**Generated Date:** ${dateStr}
**Generation Mode:** \`${pkg.generationMode}\`

${divider}

## 1. STORY & SCRIPT CONTEXT
- **Main Subject:** ${pkg.scriptContext.mainSubject}
- **Central Conflict:** ${pkg.scriptContext.centralConflict}
- **Strongest Visual Moment:** ${pkg.scriptContext.strongestVisualMoment}
- **Emotional Frequency:** ${pkg.scriptContext.emotionalTone}
- **Curiosity Hook:** "${pkg.scriptContext.mainCuriosityHook}"
- **Spoiler Restrictions:** ${pkg.scriptContext.spoilerWarnings.join('; ')}

${divider}

## 2. PRODUCTION CONFIGURATION
- **Aspect Ratio:** ${pkg.config.aspectRatio}
- **Visual Style:** ${pkg.config.visualStyle}
- **Subject Placement:** ${pkg.config.subjectPlacement.replace(/_/g, ' ')}
- **Facial Expression / Gaze:** ${pkg.config.facialExpression.replace(/_/g, ' ')}
- **Camera Framing:** ${pkg.config.cameraFraming.replace(/_/g, ' ')}
- **Lighting Direction:** ${pkg.config.lightingDirection.replace(/_/g, ' ')}
- **Color Strategy:** ${pkg.config.colorPalette.replace(/_/g, ' ')}
- **Typography Style:** ${pkg.config.typographyStyle.replace(/_/g, ' ')} (${pkg.config.textPlacement.replace(/_/g, ' ')})
- **Headline Text:** "${pkg.config.headlineText || 'N/A'}"

${divider}

## 3. THREE-OPTION THUMBNAIL CONCEPTS

`;

    pkg.concepts.forEach((c, idx) => {
      const letter = String.fromCharCode(65 + idx);
      md += `### CONCEPT ${letter}: ${c.title}
*Creative Direction: ${c.creativeDirection}*

**Creative Rationale:**
${c.creativeRationale}

- **Primary Subject:** ${c.primarySubject}
- **Facial Expression & Gaze:** ${c.facialExpressionDirection}
- **Composition & Focal Point:** ${c.compositionAndFocalPoint}
- **Background & Environment:** ${c.backgroundAndEnvironment}
- **Foreground / Background Separation:** ${c.foregroundBackgroundSeparation}
- **Color Palette & Contrast:** ${c.colorPaletteAndContrast}
- **Lighting & Cinematic Atmosphere:** ${c.lightingAndAtmosphere}
- **Thumbnail Text Suggestion:** "${c.thumbnailTextSuggestion}"
- **Typography & Hierarchy:** ${c.typographyHierarchyAndPlacement}
- **Safe Margins & Mobile Readability:** ${c.safeMarginsAndMobileReadability}

#### Standalone Image Generation Prompt:
\`\`\`text
${c.selfContainedPrompt}
\`\`\`

#### Negative Prompt:
\`\`\`text
${c.negativePrompt}
\`\`\`

${c.revisionHistory.length > 0 ? `*Revision History (${c.revisionHistory.length} revisions logged)*\n` : ''}
${divider}

`;
    });

    md += `## 4. VALIDATION & COMPLIANCE REPORT
- **Export Status:** ${pkg.validationReport.canExport ? 'CLEARED FOR EXPORT' : 'BLOCKED BY STRUCTURAL ERRORS'}
- **Structural Errors (${pkg.validationReport.structuralErrors.length}):** ${pkg.validationReport.structuralErrors.length === 0 ? 'None' : pkg.validationReport.structuralErrors.join(', ')}
- **Creative Warnings (${pkg.validationReport.warnings.length}):** ${pkg.validationReport.warnings.length === 0 ? 'None' : pkg.validationReport.warnings.join('; ')}
- **Notices:**
${pkg.validationReport.notices.map((n) => `  * ${n}`).join('\n')}

${divider}
*Generated by ULTIMATETRON Phase 5: Master Thumbnail Command Center*
`;

    return md;
  }
}

export const thumbnailStudioService = new ThumbnailStudioService();
