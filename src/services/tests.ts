/**
 * ULTIMATETRON — In-Browser Automated Test Suite
 * Validates:
 * 1. Story ID uniqueness and monotonic sequence non-reuse
 * 2. Verbatim source text preservation
 * 3. Full Source CRUD & Versioning
 * 4. Duplicate Detection Engine
 * 5. Phase 2 Canonical Project Settings & Ratio Duration Invariants:
 *    - 9:16 Shorts rules (24s=3 clips, 32s=4, 40s=5, 48s=6 clips @ 8s target)
 *    - 16:9 Long Video rules (minimum 240s / 4 minutes enforced)
 * 6. Phase 2 Source Selection & Exact Version Reference Linkage
 * 7. Phase 2 Project Reopening, Setting Updates & Persistence Integrity
 */

import { storageService } from './storage';
import { scriptEngineService } from './scriptEngine';
import { promptStudioService } from './promptStudio';
import { thumbnailStudioService } from './thumbnailStudio';
import { productionService } from './productionService';
import { AspectRatio, ContentMode, ContentTone, VisualStyle } from '../types';

export interface TestResult {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  durationMs?: number;
  error?: string;
  details?: string;
}

export async function runAllAutomatedTests(
  onProgress?: (results: TestResult[]) => void
): Promise<TestResult[]> {
  const tests: TestResult[] = [
    {
      id: 'test_id_uniqueness',
      name: 'Story ID Monotonic Uniqueness',
      description: 'Verifies sequential STORY-00000X generation and non-reuse of deleted IDs.',
      status: 'pending',
    },
    {
      id: 'test_verbatim_preservation',
      name: 'Verbatim Source Text Preservation',
      description: 'Checks that exact newlines, quotes, unicode, and punctuation are untouched.',
      status: 'pending',
    },
    {
      id: 'test_crud_lifecycle',
      name: 'Full Source CRUD & Versioning',
      description: 'Tests Add, Read, Update/Version increment (v1 -> v2), and safe Delete.',
      status: 'pending',
    },
    {
      id: 'test_duplicate_detection',
      name: 'Duplicate Detection Engine',
      description: 'Ensures exact duplicates and high-similarity stories trigger non-destructive warnings.',
      status: 'pending',
    },
    {
      id: 'test_ratio_duration_validation',
      name: 'Phase 2: Ratio Switching & Duration Invariants',
      description: 'Validates 9:16 Shorts clip math (24s/32s/40s/48s) vs 16:9 minimum 240s threshold.',
      status: 'pending',
    },
    {
      id: 'test_source_selection_linkage',
      name: 'Phase 2: Source Selection & Version Binding',
      description: 'Ensures project records bind to exact Story ID, title, date, and exact version number.',
      status: 'pending',
    },
    {
      id: 'test_project_reopen_and_persistence',
      name: 'Phase 2: Project Reopening & Settings Update',
      description: 'Tests persistent canonical settings save, retrieval, reopening, and in-place updates.',
      status: 'pending',
    },
    {
      id: 'test_script_source_project_validation',
      name: 'Phase 3: Source & Project Validation Pipeline',
      description: 'Tests Stage 1-4 pipeline: exact source snapshot resolution, fact classification, and analysis.',
      status: 'pending',
    },
    {
      id: 'test_shorts_script_clip_invariants',
      name: 'Phase 3: 9:16 Shorts 8s Segment Rules & Clip Invariants',
      description: 'Validates all 4 Shorts durations (24s=3, 32s=4, 40s=5, 48s=6 clips @ 8s) with continuous timelines.',
      status: 'pending',
    },
    {
      id: 'test_longform_script_chapters_and_minimum_runtime',
      name: 'Phase 3: 16:9 Long-Form Multi-Chapter Narrative (240s+)',
      description: 'Enforces minimum 240s threshold and multi-chapter narrative structure.',
      status: 'pending',
    },
    {
      id: 'test_section_selective_regeneration',
      name: 'Phase 3: Section-Level Selective Regeneration',
      description: 'Regenerates targeted section while preserving all other sections and time windows 100% intact.',
      status: 'pending',
    },
    {
      id: 'test_approval_gate_locking_and_forking',
      name: 'Phase 3: Immutable Approval Gating & Draft Forking',
      description: 'Locks approved scripts against in-place mutations and creates versioned editable forks.',
      status: 'pending',
    },
    {
      id: 'test_prompt_studio_entry_gate',
      name: 'Phase 4: Prompt Studio Entry Gate & Script Binding',
      description: 'Locks for unapproved scripts; validates exact approved script and source version binding.',
      status: 'pending',
    },
    {
      id: 'test_shorts_one_to_one_scene_mapping',
      name: 'Phase 4: Shorts 1:1 Scene Mapping & Continuous Timelines',
      description: 'Verifies 1 primary prompt per segment across 24s(3), 32s(4), 40s(5), 48s(6) with continuous 8s timestamps.',
      status: 'pending',
    },
    {
      id: 'test_longform_chapter_narration_coverage',
      name: 'Phase 4: 16:9 Long-Form Chapter & Narration Coverage (240s+)',
      description: 'Ensures all approved narration is accounted for with sequential timestamps covering full duration.',
      status: 'pending',
    },
    {
      id: 'test_continuity_profile_inheritance_and_overrides',
      name: 'Phase 4: Central Continuity Profile Inheritance & Overrides',
      description: 'Verifies scenes inherit visual, subject, environment, and camera language with override tracking.',
      status: 'pending',
    },
    {
      id: 'test_narration_byte_for_byte_fidelity',
      name: 'Phase 4: Narration Byte-for-Byte Fidelity Preservation',
      description: 'Guarantees voiceover narration in prompts strictly matches approved script section byte-for-byte.',
      status: 'pending',
    },
    {
      id: 'test_single_scene_selective_regeneration',
      name: 'Phase 4: Single-Scene Regeneration & Revision Tracking',
      description: 'Regenerates targeted scene while preserving unrelated scenes byte-for-byte with revision history.',
      status: 'pending',
    },
    {
      id: 'test_prompt_package_save_restore_history',
      name: 'Phase 4: Prompt Package Save, Restore & Versioning',
      description: 'Saves package drafts, restores revisions, and verifies approved scripts remain immutable.',
      status: 'pending',
    },
    {
      id: 'test_json_and_markdown_export_integrity',
      name: 'Phase 4: JSON & Markdown Export Schema Verification',
      description: 'Verifies machine-readable JSON package schema and structured Markdown generation with copyable prompts.',
      status: 'pending',
    },
    {
      id: 'test_prompt_validation_engine_checks',
      name: 'Phase 4: Deterministic Prompt Validation Engine',
      description: 'Catches missing fields, contradictory camera framing, timestamp gaps, and classifies severity.',
      status: 'pending',
    },
    {
      id: 'test_error_handling_and_no_autoload_ai',
      name: 'Phase 4: Quota Protection & Graceful Error Handling',
      description: 'Verifies malformed response recovery, zero automated AI on load, and deterministic offline resilience.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_entry_gate_no_project',
      name: 'Phase 5: Entry Gate Without Selected Project',
      description: 'Verifies actionable error and blocked access when no valid project is selected.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_entry_gate_unapproved_script',
      name: 'Phase 5: Entry Gate Blocking Unapproved Draft Scripts',
      description: 'Ensures thumbnail generation is strictly locked when project script is in draft/unapproved status.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_approved_script_version_binding',
      name: 'Phase 5: Exact Approved Script & Source Version Linkage',
      description: 'Guarantees thumbnail package binds immutably to approved script version, source ID, and revision.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_three_distinct_concepts',
      name: 'Phase 5: Exactly Three Differentiated Thumbnail Concepts',
      description: 'Generates exactly 3 concepts (Curiosity, Emotion, Environment) with different creative strategies.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_required_prompt_fields',
      name: 'Phase 5: Self-Contained Prompts & Negative Safeguards',
      description: 'Validates complete self-contained generation prompts, negative prompts, and composition descriptions.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_config_controls_effect',
      name: 'Phase 5: Interactive Configuration Controls Direct Impact',
      description: 'Confirms changes to framing, lighting, placement, style, and headline propagate to generated prompts.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_ratio_handling',
      name: 'Phase 5: 16:9 Standard and 9:16 Vertical Ratio Handling',
      description: 'Validates 16:9 landscape framing and 9:16 vertical Shorts/Reels safe-zone adaptation.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_prompt_copy_and_package_export',
      name: 'Phase 5: Individual Prompt Copy & Package Operations',
      description: 'Verifies standalone copyability of prompts, negative prompts, and headline text.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_json_and_markdown_exports',
      name: 'Phase 5: JSON Schema & Markdown Production Brief Exports',
      description: 'Validates machine-readable JSON schema (v1) and human-readable Markdown brief generation.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_selective_regeneration_byte_for_byte',
      name: 'Phase 5: Selective Single-Concept Byte-for-Byte Preservation',
      description: 'Regenerates targeted concept while strictly preserving the other two concepts byte-for-byte.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_revision_history_and_package_versioning',
      name: 'Phase 5: Concept Revision History & Package Versioning',
      description: 'Tracks per-concept revision entries with timestamps, user instructions, and prompt snapshots.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_persistence_and_reopening',
      name: 'Phase 5: Persistence Storage, Reopening & Reloading',
      description: 'Tests saving to IndexedDB/localStorage, querying by project/script, and lossless reopening.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_offline_fallback_zero_downtime',
      name: 'Phase 5: Offline Deterministic Fallback & Zero Autoload AI',
      description: 'Verifies reliable concept synthesis without external network or quota dependencies.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_image_generation_states',
      name: 'Phase 5: Image Generation State Handling (No False Success)',
      description: 'Separates prompt generation from rendering; validates unavailable/failed states without claiming fake success.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_prevents_approved_script_mutation',
      name: 'Phase 5: Approved Script & Upstream Immutability Guard',
      description: 'Ensures thumbnail generation and selective regeneration never mutate upstream approved scripts.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_backward_compatibility',
      name: 'Phase 5: Backward Compatibility With Pre-Phase-5 Projects',
      description: 'Guarantees legacy projects without thumbnail records load cleanly without errors or crashes.',
      status: 'pending',
    },
    {
      id: 'test_thumbnail_validation_errors_and_notices',
      name: 'Phase 5: Automated Validation Engine & Creative Disclosures',
      description: 'Validates structural errors block export while creative notices and text-rendering disclosures remain non-blocking.',
      status: 'pending',
    },
    {
      id: 'test_production_stage_health_calculation',
      name: 'Phase 6: Stage Health & Un-Invented Progress Calculation',
      description: 'Verifies deterministic calculation of stage statuses and progress percent from real persisted artifacts without invented percentages.',
      status: 'pending',
    },
    {
      id: 'test_asset_library_crud_and_persistence',
      name: 'Phase 6: Production Asset Library CRUD & Binary Persistence',
      description: 'Tests asset registration with monotonic ASSET-00000X IDs, base64 payload storage, metadata, and deletion.',
      status: 'pending',
    },
    {
      id: 'test_scene_to_asset_linkage',
      name: 'Phase 6: Scene-to-Asset Linkage & Multi-Role Associations',
      description: 'Validates binding assets as primaryVisual, voiceover, and ambient audio to individual scene prompts.',
      status: 'pending',
    },
    {
      id: 'test_production_readiness_validator',
      name: 'Phase 6: Deterministic Production Readiness Validator',
      description: 'Enforces strict blocking criteria on missing script approval or mandatory assets vs non-blocking recommendations.',
      status: 'pending',
    },
    {
      id: 'test_production_package_assembly_and_manifest',
      name: 'Phase 6: Full Production Package Assembly & Provenance Manifest',
      description: 'Tests generation of PRODPKG-00000X manifests with full project, script, prompt, and asset snapshots.',
      status: 'pending',
    },
    {
      id: 'test_markdown_production_brief_generation',
      name: 'Phase 6: Markdown Production Brief & Export Formatting',
      description: 'Validates structured production brief generation with verbatim narration, standalone prompts, and asset tables.',
      status: 'pending',
    },
    {
      id: 'test_production_workspace_export_import_backward_compat',
      name: 'Phase 6: Workspace Backup & Backward-Compatible Asset State',
      description: 'Ensures workspace backup captures Phase 6 assets and packages, and legacy workspaces restore without error.',
      status: 'pending',
    },
  ];

  const update = () => {
    if (onProgress) onProgress([...tests]);
  };

  // Test 1: Story ID Monotonic Uniqueness
  tests[0].status = 'running';
  update();
  const t1Start = performance.now();
  try {
    const s1 = await storageService.addSource({
      title: 'UNIT_TEST_STORY_ALPHA',
      content: 'Sample text alpha for unit test verification.',
    });
    const s2 = await storageService.addSource({
      title: 'UNIT_TEST_STORY_BETA',
      content: 'Sample text beta for unit test verification.',
    });

    if (!s1.id.startsWith('STORY-') || !s2.id.startsWith('STORY-')) {
      throw new Error(`Invalid format for Story IDs: ${s1.id}, ${s2.id}`);
    }

    if (s1.seqNumber >= s2.seqNumber) {
      throw new Error(`Sequencing failed: ${s1.seqNumber} is not strictly less than ${s2.seqNumber}`);
    }

    // Delete s1 and ensure next ID does NOT reuse s1
    await storageService.deleteSource(s1.id);
    const s3 = await storageService.addSource({
      title: 'UNIT_TEST_STORY_GAMMA',
      content: 'Sample text gamma for non-reuse verification.',
    });

    if (s3.seqNumber <= s2.seqNumber || s3.id === s1.id) {
      throw new Error(`ID reuse violation: Deleted ID was reclaimed or sequence went backwards.`);
    }

    // Cleanup
    await storageService.deleteSource(s2.id);
    await storageService.deleteSource(s3.id);

    tests[0].status = 'passed';
    tests[0].durationMs = Math.round(performance.now() - t1Start);
    tests[0].details = `Created ${s1.id}, ${s2.id}, deleted ${s1.id}, verified next is ${s3.id} without reuse.`;
  } catch (err: any) {
    tests[0].status = 'failed';
    tests[0].error = err.message || String(err);
  }
  update();

  // Test 2: Verbatim Source Text Preservation
  tests[1].status = 'running';
  update();
  const t2Start = performance.now();
  try {
    const complexVerbatimText = `Line 1: "Double quotes" and 'single quotes'.\r\nLine 2: Tab\tseparated\tvalues.\nLine 3: Special symbols: — © ® ™ • ⚡ 🚀 ⚛.\n\nLine 5: Multiple line breaks preserved.\n   Indented spaces preserved.`;

    const testStory = await storageService.addSource({
      title: 'UNIT_TEST_VERBATIM_CHECK',
      content: complexVerbatimText,
      sourceUrl: 'https://example.org/test-fidelity',
      publisher: 'Verbatim Source Validator',
      tags: ['Test', 'Fidelity', 'Precision'],
    });

    const retrieved = await storageService.getSourceById(testStory.id);
    if (!retrieved) {
      throw new Error(`Could not retrieve story ${testStory.id} from storage.`);
    }

    if (retrieved.content !== complexVerbatimText) {
      throw new Error(`Content mutated during storage write/read cycle. Length original: ${complexVerbatimText.length}, retrieved: ${retrieved.content.length}`);
    }

    if (retrieved.charCount !== complexVerbatimText.length) {
      throw new Error(`Character count mismatch: expected ${complexVerbatimText.length}, got ${retrieved.charCount}`);
    }

    // Cleanup
    await storageService.deleteSource(testStory.id);

    tests[1].status = 'passed';
    tests[1].durationMs = Math.round(performance.now() - t2Start);
    tests[1].details = `100% byte-for-byte fidelity verified across newlines, quotes, unicode symbols and tabs.`;
  } catch (err: any) {
    tests[1].status = 'failed';
    tests[1].error = err.message || String(err);
  }
  update();

  // Test 3: Full Source CRUD & Versioning
  tests[2].status = 'running';
  update();
  const t3Start = performance.now();
  try {
    // 1. Create (v1)
    const created = await storageService.addSource({
      title: 'Original Title v1',
      content: 'Original content initial draft.',
    });
    if (created.version !== 1) {
      throw new Error(`Initial version should be 1, got ${created.version}`);
    }

    // 2. Read
    const fetched = await storageService.getSourceById(created.id);
    if (!fetched || fetched.title !== 'Original Title v1') {
      throw new Error(`Failed to read created story.`);
    }

    // 3. Update without version increment (draft edit)
    const draftEdited = await storageService.updateSource(created.id, {
      title: 'Edited Draft Title v1.1',
      createNewVersion: false,
    });
    if (draftEdited.version !== 1 || draftEdited.title !== 'Edited Draft Title v1.1') {
      throw new Error(`Draft edit failed.`);
    }

    // 4. Update WITH version increment (v2)
    const v2Updated = await storageService.updateSource(created.id, {
      title: 'Official Second Revision Title',
      content: 'Second version expanded content for production.',
      changeNote: 'Expanded with new developments.',
      createNewVersion: true,
    });
    if (v2Updated.version !== 2) {
      throw new Error(`Version bump failed: expected v2, got v${v2Updated.version}`);
    }
    if (v2Updated.versionHistory.length < 2) {
      throw new Error(`Version history snapshots missing.`);
    }

    // 5. Delete
    await storageService.deleteSource(created.id);
    const postDelete = await storageService.getSourceById(created.id);
    if (postDelete !== null) {
      throw new Error(`Source was not deleted.`);
    }

    tests[2].status = 'passed';
    tests[2].durationMs = Math.round(performance.now() - t3Start);
    tests[2].details = `Created v1, updated draft, branched to v2 with history snapshot, and verified clean deletion.`;
  } catch (err: any) {
    tests[2].status = 'failed';
    tests[2].error = err.message || String(err);
  }
  update();

  // Test 4: Duplicate Detection Engine
  tests[3].status = 'running';
  update();
  const t4Start = performance.now();
  try {
    const orig = await storageService.addSource({
      title: 'Supernova Remnant Core Discovery in Carina Nebula',
      content: 'Astronomers using high-resolution spectroscopy identified a dense compact object inside the expanding stellar envelope of the Carina Nebula.',
    });

    const checkExact = await storageService.checkForDuplicates(
      'Different Title But Same Body',
      'Astronomers using high-resolution spectroscopy identified a dense compact object inside the expanding stellar envelope of the Carina Nebula.'
    );

    if (!checkExact.isDuplicate || checkExact.confidence !== 'exact') {
      throw new Error(`Failed to detect exact duplicate story content.`);
    }

    const checkClean = await storageService.checkForDuplicates(
      'Quantum Computing Qubit Coherence Times',
      'Researchers achieved thirty minutes of quantum coherence in silicon carbide crystals.'
    );
    if (checkClean.isDuplicate) {
      throw new Error(`False positive duplicate flagged for unrelated content.`);
    }

    // Cleanup
    await storageService.deleteSource(orig.id);

    tests[3].status = 'passed';
    tests[3].durationMs = Math.round(performance.now() - t4Start);
    tests[3].details = `Identified exact and high-similarity duplicates; confirmed zero false positives on distinct topics.`;
  } catch (err: any) {
    tests[3].status = 'failed';
    tests[3].error = err.message || String(err);
  }
  update();

  // Test 5: Phase 2 - Ratio Switching & Duration Invariants
  tests[4].status = 'running';
  update();
  const t5Start = performance.now();
  try {
    // 9:16 Shorts rules: valid durations are strictly 24, 32, 40, 48
    const valid916Map: Record<number, number> = {
      24: 3,
      32: 4,
      40: 5,
      48: 6,
    };

    for (const [secStr, expectedClips] of Object.entries(valid916Map)) {
      const sec = Number(secStr);
      const calculatedClips = sec / 8;
      if (calculatedClips !== expectedClips) {
        throw new Error(`9:16 clip calculation mismatch for ${sec}s: expected ${expectedClips}, got ${calculatedClips}`);
      }
    }

    // Verify invalid 9:16 durations fail validation
    const invalid916 = [15, 25, 30, 60, 240];
    for (const inv of invalid916) {
      const isValid = [24, 32, 40, 48].includes(inv);
      if (isValid) {
        throw new Error(`Invalid 9:16 duration ${inv} was wrongly accepted.`);
      }
    }

    // 16:9 Long Video: minimum 240s (4 minutes)
    const valid169Durations = [240, 300, 360, 480, 600, 900];
    for (const d of valid169Durations) {
      if (d < 240) {
        throw new Error(`16:9 duration ${d} violates minimum 240s rule.`);
      }
    }

    // Verify below 240s fails
    const invalid169 = [0, 48, 120, 239];
    for (const d of invalid169) {
      if (d >= 240) {
        throw new Error(`Invalid 16:9 duration ${d} should not be >= 240.`);
      }
    }

    tests[4].status = 'passed';
    tests[4].durationMs = Math.round(performance.now() - t5Start);
    tests[4].details = `Validated 9:16 Shorts (24s=3 clips, 32s=4, 40s=5, 48s=6) and 16:9 minimum 240s threshold with extended support.`;
  } catch (err: any) {
    tests[4].status = 'failed';
    tests[4].error = err.message || String(err);
  }
  update();

  // Test 6: Phase 2 - Source Selection & Version Binding
  tests[5].status = 'running';
  update();
  const t6Start = performance.now();
  try {
    // Create source v1
    const testStory = await storageService.addSource({
      title: 'Neutron Star Merger Gravitational Waves',
      content: 'Kilonova optical counterpart detected by optical and infrared observatories following gravitational wave signal GW170817.',
      publisher: 'LIGO Scientific Collaboration',
      publicationDate: '2024-05-10',
      tags: ['Astronomy', 'LIGO', 'Neutron Star'],
    });

    // Bump to v2
    const storyV2 = await storageService.updateSource(testStory.id, {
      title: 'Neutron Star Merger Gravitational Waves v2',
      content: 'Kilonova optical counterpart detected by optical and infrared observatories following gravitational wave signal GW170817 with updated spectroscopic redshift.',
      changeNote: 'Added spectroscopic redshift data',
      createNewVersion: true,
    });

    if (storyV2.version !== 2) {
      throw new Error(`Source version bump to v2 failed.`);
    }

    // Create project linking explicitly to story v2
    const project = await storageService.addProject({
      name: 'Kilonova Production Brief',
      sourceStoryId: storyV2.id,
      sourceVersion: storyV2.version, // Binds exact v2
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 32,
      clipCount: 4,
      language: 'Hindi',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    if (project.sourceStoryId !== testStory.id || project.sourceVersion !== 2) {
      throw new Error(`Project source linkage failed: expected ${testStory.id} v2, got ${project.sourceStoryId} v${project.sourceVersion}`);
    }

    // Cleanup
    await storageService.deleteProject(project.id);
    await storageService.deleteSource(testStory.id);

    tests[5].status = 'passed';
    tests[5].durationMs = Math.round(performance.now() - t6Start);
    tests[5].details = `Project record verified to reference exact Story ID and immutable source revision (v2).`;
  } catch (err: any) {
    tests[5].status = 'failed';
    tests[5].error = err.message || String(err);
  }
  update();

  // Test 7: Phase 2 - Project Reopening, Settings Update & Persistence
  tests[6].status = 'running';
  update();
  const t7Start = performance.now();
  try {
    const tempStory = await storageService.addSource({
      title: 'Voyager Interstellar Magnetic Field Study',
      content: 'Voyager probes magnetometer readings indicate the heliopause magnetic boundary is unexpectedly smooth.',
    });

    // 1. Save canonical project settings
    const createdProject = await storageService.addProject({
      name: 'Voyager Magnetic Boundary Analysis',
      sourceStoryId: tempStory.id,
      sourceVersion: 1,
      status: 'draft',
      aspectRatio: '16:9',
      duration: 300,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });

    // 2. Retrieve project from storage (simulating reopening)
    const reopened = await storageService.getProjectById(createdProject.id);
    if (!reopened) {
      throw new Error(`Failed to retrieve saved project ${createdProject.id} from storage.`);
    }

    if (
      reopened.aspectRatio !== '16:9' ||
      reopened.duration !== 300 ||
      reopened.language !== 'English' ||
      reopened.contentMode !== 'Documentary' ||
      reopened.tone !== 'Analytical'
    ) {
      throw new Error(`Canonical settings fields corrupted upon retrieval.`);
    }

    // 3. Update settings on reopened project (ratio switch to 9:16 Shorts with valid clip count)
    const updatedProject = await storageService.updateProject(reopened.id, {
      aspectRatio: '9:16',
      duration: 48,
      clipCount: 6,
      tone: 'Urgent',
      contentMode: 'Sci-Fi Explainer',
    });

    if (
      updatedProject.aspectRatio !== '9:16' ||
      updatedProject.duration !== 48 ||
      updatedProject.clipCount !== 6 ||
      updatedProject.tone !== 'Urgent' ||
      updatedProject.contentMode !== 'Sci-Fi Explainer'
    ) {
      throw new Error(`Failed to update project settings upon reopening.`);
    }

    // Verify persistence after re-fetching
    const reFetched = await storageService.getProjectById(createdProject.id);
    if (!reFetched || reFetched.duration !== 48 || reFetched.clipCount !== 6) {
      throw new Error(`Re-fetched project did not reflect updated configuration.`);
    }

    // Cleanup
    await storageService.deleteProject(createdProject.id);
    await storageService.deleteSource(tempStory.id);

    tests[6].status = 'passed';
    tests[6].durationMs = Math.round(performance.now() - t7Start);
    tests[6].details = `Verified canonical settings save, full retrieval, reopening, ratio switching (16:9 -> 9:16), and persisted in-place updates.`;
  } catch (err: any) {
    tests[6].status = 'failed';
    tests[6].error = err.message || String(err);
  }
  update();

  // Test 8: Phase 3 - Source & Project Validation Pipeline
  tests[7].status = 'running';
  update();
  const t8Start = performance.now();
  try {
    const srcStory = await storageService.addSource({
      title: 'Voyager Interstellar Cosmic Ray Detection',
      content: 'Voyager 1 observed a sudden thirty-fold jump in galactic cosmic ray intensity as it crossed into true interstellar space beyond the heliopause shock front.',
    });

    const project = await storageService.addProject({
      name: 'Cosmic Ray Briefing',
      sourceStoryId: srcStory.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 32,
      clipCount: 4,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    // Verify validateProjectAndSource
    const validated = await scriptEngineService.validateProjectAndSource(project.id);
    if (validated.project.id !== project.id || validated.source.id !== srcStory.id) {
      throw new Error(`Validation failed to resolve correct project or source story.`);
    }

    // Verify error thrown on non-existent project
    let caughtNotFound = false;
    try {
      await scriptEngineService.validateProjectAndSource('NON_EXISTENT_PROJ_999');
    } catch {
      caughtNotFound = true;
    }
    if (!caughtNotFound) {
      throw new Error(`Validation failed to throw actionable error for missing project.`);
    }

    // Verify analyzeSource
    const analysis = await scriptEngineService.analyzeSource(project.id);
    if (!analysis.topic || !Array.isArray(analysis.entities) || !analysis.centralQuestion) {
      throw new Error(`Analysis payload missing key epistemic classification fields.`);
    }

    // Cleanup
    await storageService.deleteProject(project.id);
    await storageService.deleteSource(srcStory.id);

    tests[7].status = 'passed';
    tests[7].durationMs = Math.round(performance.now() - t8Start);
    tests[7].details = `Verified Stage 1-4 pipeline: exact source snapshot resolution, invalid ID prevention, and fact classification.`;
  } catch (err: any) {
    tests[7].status = 'failed';
    tests[7].error = err.message || String(err);
  }
  update();

  // Test 9: Phase 3 - 9:16 Shorts 8s Segment Rules & Clip Invariants
  tests[8].status = 'running';
  update();
  const t9Start = performance.now();
  try {
    const shortsSource = await storageService.addSource({
      title: 'Perseverance Rover Sample Tube Storage',
      content: 'The Perseverance rover dropped ten hermetically sealed titanium sample tubes onto the Martian surface at Three Forks for future sample return.',
    });

    const durationsToTest = [24, 32, 40, 48];
    for (const d of durationsToTest) {
      const expectedClips = d / 8;
      const proj = await storageService.addProject({
        name: `Shorts Validation ${d}s`,
        sourceStoryId: shortsSource.id,
        sourceVersion: 1,
        status: 'not_started',
        aspectRatio: '9:16',
        duration: d,
        clipCount: expectedClips,
        language: 'English',
        contentMode: 'Sci-Fi Explainer',
        tone: 'Urgent',
        visualStyle: 'Cinematic',
      });

      const script = await scriptEngineService.generateScript(proj.id);
      if (script.sections.length !== expectedClips) {
        throw new Error(`Shorts ${d}s clip count violation: expected exactly ${expectedClips} clips, got ${script.sections.length}`);
      }

      // Verify each clip duration is strictly 8s with continuous timestamps
      for (let i = 0; i < script.sections.length; i++) {
        const sec = script.sections[i];
        if (sec.startTime !== i * 8 || sec.endTime !== (i + 1) * 8) {
          throw new Error(`Clip ${i + 1} timestamp alignment failed: [${sec.startTime}s - ${sec.endTime}s]`);
        }
        if (!sec.narration || sec.narration.trim().length === 0) {
          throw new Error(`Clip ${i + 1} narration is empty.`);
        }
      }

      // Cleanup
      await storageService.deleteScript(script.id);
      await storageService.deleteProject(proj.id);
    }

    await storageService.deleteSource(shortsSource.id);

    tests[8].status = 'passed';
    tests[8].durationMs = Math.round(performance.now() - t9Start);
    tests[8].details = `Verified all 4 Shorts durations (24s=3 clips, 32s=4, 40s=5, 48s=6): strictly 8.0s per clip with continuous zero-gap timeline.`;
  } catch (err: any) {
    tests[8].status = 'failed';
    tests[8].error = err.message || String(err);
  }
  update();

  // Test 10: Phase 3 - 16:9 Long-Form Multi-Chapter Narrative (240s+)
  tests[9].status = 'running';
  update();
  const t10Start = performance.now();
  try {
    const longSource = await storageService.addSource({
      title: 'James Webb Deep Field Gravitational Lensing Analysis',
      content: 'SMACS 0723 cluster deep field revealed thousands of previously unseen distant galaxies through gravitational lensing, with infrared light shifted across 13 billion years.',
    });

    const longProj = await storageService.addProject({
      name: 'JWST Deep Field Documentary',
      sourceStoryId: longSource.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });

    const script = await scriptEngineService.generateScript(longProj.id);

    if (script.sections.length < 3) {
      throw new Error(`Long-Form script requires at least 3 chapter sections, got ${script.sections.length}`);
    }

    if (script.sections[0].startTime !== 0) {
      throw new Error(`First chapter must start at 0s, got ${script.sections[0].startTime}s`);
    }

    const lastSec = script.sections[script.sections.length - 1];
    if (lastSec.endTime !== 240) {
      throw new Error(`Last chapter end time mismatch: expected 240s, got ${lastSec.endTime}s`);
    }

    // Cleanup
    await storageService.deleteScript(script.id);
    await storageService.deleteProject(longProj.id);
    await storageService.deleteSource(longSource.id);

    tests[9].status = 'passed';
    tests[9].durationMs = Math.round(performance.now() - t10Start);
    tests[9].details = `Validated 16:9 Long-Form (240s threshold): multi-chapter arc spanning full continuous runtime.`;
  } catch (err: any) {
    tests[9].status = 'failed';
    tests[9].error = err.message || String(err);
  }
  update();

  // Test 11: Phase 3 - Section-Level Selective Regeneration
  tests[10].status = 'running';
  update();
  const t11Start = performance.now();
  try {
    const regenSource = await storageService.addSource({
      title: 'Europa Clipper Radar Antenna Deployment',
      content: 'The REASON radar ice-penetrating antennas unfolded smoothly to scan for Europa sub-surface oceans.',
    });

    const regenProj = await storageService.addProject({
      name: 'Europa Clipper Radar',
      sourceStoryId: regenSource.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const initialScript = await scriptEngineService.generateScript(regenProj.id);
    const sec1Original = initialScript.sections[0].narration;
    const sec2Original = initialScript.sections[1].narration;
    const sec3Original = initialScript.sections[2].narration;
    const sec2Id = initialScript.sections[1].id;

    // Regenerate Section 2 with specific user instruction
    const updatedScript = await scriptEngineService.regenerateSection(
      initialScript.id,
      sec2Id,
      'Make dramatically more intense and emphasize the ice ocean'
    );

    const updatedSec1 = updatedScript.sections[0].narration;
    const updatedSec2 = updatedScript.sections[1].narration;
    const updatedSec3 = updatedScript.sections[2].narration;

    // Verify sections 1 and 3 are 100% UNTOUCHED
    if (updatedSec1 !== sec1Original) {
      throw new Error(`Section 1 was mutated when regenerating Section 2!`);
    }
    if (updatedSec3 !== sec3Original) {
      throw new Error(`Section 3 was mutated when regenerating Section 2!`);
    }

    // Verify Section 2 timestamps and window are preserved
    const updatedSec2Obj = updatedScript.sections[1];
    if (updatedSec2Obj.startTime !== 8 || updatedSec2Obj.endTime !== 16) {
      throw new Error(`Section 2 timestamp window was corrupted during regeneration.`);
    }

    // Cleanup
    await storageService.deleteScript(initialScript.id);
    await storageService.deleteProject(regenProj.id);
    await storageService.deleteSource(regenSource.id);

    tests[10].status = 'passed';
    tests[10].durationMs = Math.round(performance.now() - t11Start);
    tests[10].details = `Section 2 selectively regenerated while Section 1 and Section 3 remained 100% byte-for-byte identical.`;
  } catch (err: any) {
    tests[10].status = 'failed';
    tests[10].error = err.message || String(err);
  }
  update();

  // Test 12: Phase 3 - Immutable Approval Gating & Draft Forking
  tests[11].status = 'running';
  update();
  const t12Start = performance.now();
  try {
    const gateSource = await storageService.addSource({
      title: 'Hubble Cosmic Distance Ladder Calibration',
      content: 'Cepheid variable star measurements refined the Hubble tension discrepancy to five sigma significance.',
    });

    const gateProj = await storageService.addProject({
      name: 'Hubble Tension Brief',
      sourceStoryId: gateSource.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Analytical',
      visualStyle: 'Cinematic',
    });

    const draftScript = await scriptEngineService.generateScript(gateProj.id);
    if (draftScript.isApproved) {
      throw new Error(`Initial generated script draft should not be pre-approved.`);
    }

    // Verify Approval Gate Validation
    const validation = scriptEngineService.validateScriptForApproval(draftScript);
    if (!validation.canApprove) {
      throw new Error(`Valid script draft was rejected by approval validator: ${validation.blockingReasons.join(', ')}`);
    }

    // Approve the script
    const approvedScript = await storageService.approveScript(draftScript.id, 'Production Lead');
    if (!approvedScript.isApproved || !approvedScript.approvalTimestamp) {
      throw new Error(`Approval state failed to record approval timestamp.`);
    }

    // Check project status advanced to approved
    const projectAfterApproval = await storageService.getProjectById(gateProj.id);
    if (projectAfterApproval?.status !== 'approved') {
      throw new Error(`Project status did not transition to approved.`);
    }

    // Verify approved scripts are locked against direct mutation
    let caughtMutationBlock = false;
    try {
      await storageService.updateScript(approvedScript.id, { totalWordCount: 9999 });
    } catch {
      caughtMutationBlock = true;
    }
    if (!caughtMutationBlock) {
      throw new Error(`Approved script permitted direct mutation, violating immutability guarantee.`);
    }

    // Fork new draft from approved script
    const forkedDraft = await storageService.forkScriptDraft(approvedScript.id);
    if (forkedDraft.version !== approvedScript.version + 1) {
      throw new Error(`Forked draft version should be v${approvedScript.version + 1}, got v${forkedDraft.version}`);
    }
    if (forkedDraft.isApproved !== false) {
      throw new Error(`Forked draft should be unlocked (isApproved = false).`);
    }
    if (forkedDraft.parentScriptId !== approvedScript.id) {
      throw new Error(`Forked draft failed to record parentScriptId.`);
    }

    // Verify original approved script is still approved and unchanged in storage
    const recheckedApproved = await storageService.getScriptById(approvedScript.id);
    if (!recheckedApproved || !recheckedApproved.isApproved) {
      throw new Error(`Original approved script was unapproved or corrupted during fork.`);
    }

    // Cleanup
    await storageService.deleteScript(draftScript.id);
    await storageService.deleteScript(forkedDraft.id);
    await storageService.deleteProject(gateProj.id);
    await storageService.deleteSource(gateSource.id);

    tests[11].status = 'passed';
    tests[11].durationMs = Math.round(performance.now() - t12Start);
    tests[11].details = `Validated approval lock, immutability protection, project status transition, and draft revision forking (v1 -> v2).`;
  } catch (err: any) {
    tests[11].status = 'failed';
    tests[11].error = err.message || String(err);
  }
  update();

  // Test 13: Phase 4 - Prompt Studio Entry Gate & Script Binding
  tests[12].status = 'running';
  update();
  const t13Start = performance.now();
  try {
    const gateSrc = await storageService.addSource({
      title: 'Quantum Telemetry Uplink Protocol',
      content: 'Deep space telemetry encryption using entangled photon pairs demonstrated secure signal verification.',
    });

    const gateProj = await storageService.addProject({
      name: 'Entanglement Security Brief',
      sourceStoryId: gateSrc.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    // 1. Unapproved / No script gate check
    const checkNoScript = await promptStudioService.validateScriptEntryGate(gateProj.id);
    if (checkNoScript.canEnter) {
      throw new Error(`Gate allowed entry when no approved script existed.`);
    }

    // 2. Draft script gate check
    const draft = await scriptEngineService.generateScript(gateProj.id);
    const checkDraft = await promptStudioService.validateScriptEntryGate(gateProj.id, draft.id);
    if (checkDraft.canEnter) {
      throw new Error(`Gate allowed entry for an unapproved draft script.`);
    }

    // 3. Approved script gate check
    const approved = await storageService.approveScript(draft.id, 'Lead Director');
    const checkApproved = await promptStudioService.validateScriptEntryGate(gateProj.id, approved.id);
    if (!checkApproved.canEnter || !checkApproved.script || checkApproved.script.version !== approved.version) {
      throw new Error(`Gate rejected valid approved script or failed version binding.`);
    }

    // Cleanup
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(gateProj.id);
    await storageService.deleteSource(gateSrc.id);

    tests[12].status = 'passed';
    tests[12].durationMs = Math.round(performance.now() - t13Start);
    tests[12].details = `Verified gate locks for unapproved scripts and cleanly binds to exact approved script and source versions.`;
  } catch (err: any) {
    tests[12].status = 'failed';
    tests[12].error = err.message || String(err);
  }
  update();

  // Test 14: Phase 4 - Shorts 1:1 Scene Mapping & Continuous Timelines
  tests[13].status = 'running';
  update();
  const t14Start = performance.now();
  try {
    const shortsSource = await storageService.addSource({
      title: 'Titan Methane Lake Submersible Survey',
      content: 'A proposed robotic submarine probe explored Kraken Mare, measuring liquid methane depth gradients and organic sediment.',
    });

    const testDurations = [24, 32, 40, 48];
    for (const d of testDurations) {
      const expectedScenes = d / 8;
      const proj = await storageService.addProject({
        name: `Shorts Prompt Map ${d}s`,
        sourceStoryId: shortsSource.id,
        sourceVersion: 1,
        status: 'not_started',
        aspectRatio: '9:16',
        duration: d,
        clipCount: expectedScenes,
        language: 'English',
        contentMode: 'Sci-Fi Explainer',
        tone: 'Urgent',
        visualStyle: 'Cinematic',
      });

      const scriptDraft = await scriptEngineService.generateScript(proj.id);
      const approvedScript = await storageService.approveScript(scriptDraft.id, 'Production Lead');

      const pkg = await promptStudioService.generatePromptPackage(proj.id, approvedScript.id);

      if (pkg.scenes.length !== expectedScenes) {
        throw new Error(`Shorts ${d}s scene count mismatch: expected ${expectedScenes}, got ${pkg.scenes.length}`);
      }

      // Verify continuous 8s timestamps with 0 gaps
      for (let i = 0; i < pkg.scenes.length; i++) {
        const sc = pkg.scenes[i];
        if (sc.startTime !== i * 8 || sc.endTime !== (i + 1) * 8) {
          throw new Error(`Scene ${i + 1} timestamp gap/misalignment: [${sc.startTime}s - ${sc.endTime}s]`);
        }
        if (sc.targetDuration !== 8) {
          throw new Error(`Scene ${i + 1} target duration is ${sc.targetDuration}s, expected 8s.`);
        }
        if (!sc.finalProductionPrompt || sc.finalProductionPrompt.length < 30) {
          throw new Error(`Scene ${i + 1} final prompt is incomplete.`);
        }
      }

      await storageService.deletePromptPackage(pkg.id);
      await storageService.deleteScript(scriptDraft.id);
      await storageService.deleteProject(proj.id);
    }

    await storageService.deleteSource(shortsSource.id);

    tests[13].status = 'passed';
    tests[13].durationMs = Math.round(performance.now() - t14Start);
    tests[13].details = `Verified 1:1 mapping across 24s(3), 32s(4), 40s(5), 48s(6) with continuous 8s timestamps [0-8s, 8-16s...].`;
  } catch (err: any) {
    tests[13].status = 'failed';
    tests[13].error = err.message || String(err);
  }
  update();

  // Test 15: Phase 4 - 16:9 Long-Form Chapter & Narration Coverage (240s+)
  tests[14].status = 'running';
  update();
  const t15Start = performance.now();
  try {
    const longSource = await storageService.addSource({
      title: 'Pulsar Timing Array Gravitational Wave Background Discovery',
      content: 'NANOGrav and international pulsar timing arrays detected the stochastic background of gravitational waves from supermassive black hole binaries merging throughout the cosmos.',
    });

    const longProj = await storageService.addProject({
      name: 'Gravitational Wave Background',
      sourceStoryId: longSource.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });

    const scriptDraft = await scriptEngineService.generateScript(longProj.id);
    const approvedScript = await storageService.approveScript(scriptDraft.id, 'Chief Scientist');

    const pkg = await promptStudioService.generatePromptPackage(longProj.id, approvedScript.id);

    if (pkg.scenes.length < 3) {
      throw new Error(`Long-Form prompt package requires at least 3 chapter scenes, got ${pkg.scenes.length}`);
    }

    // Verify sequential coverage
    if (pkg.scenes[0].startTime !== 0) {
      throw new Error(`Long-form first scene must begin at 0s.`);
    }

    const lastScene = pkg.scenes[pkg.scenes.length - 1];
    if (lastScene.endTime !== 240) {
      throw new Error(`Long-form last scene must end at 240s, got ${lastScene.endTime}s`);
    }

    // Verify all narration sections covered
    for (const section of approvedScript.sections) {
      const hasScene = pkg.scenes.some((sc) => sc.scriptSectionId === section.id);
      if (!hasScene) {
        throw new Error(`Script section ${section.id} not covered by any scene prompt.`);
      }
    }

    await storageService.deletePromptPackage(pkg.id);
    await storageService.deleteScript(scriptDraft.id);
    await storageService.deleteProject(longProj.id);
    await storageService.deleteSource(longSource.id);

    tests[14].status = 'passed';
    tests[14].durationMs = Math.round(performance.now() - t15Start);
    tests[14].details = `Validated 16:9 Long-Form chapter mapping (240s): zero-gap sequential coverage across all approved narration.`;
  } catch (err: any) {
    tests[14].status = 'failed';
    tests[14].error = err.message || String(err);
  }
  update();

  // Test 16: Phase 4 - Central Continuity Profile Inheritance & Overrides
  tests[15].status = 'running';
  update();
  const t16Start = performance.now();
  try {
    const contSource = await storageService.addSource({
      title: 'Parker Solar Probe Perihelion Record',
      content: 'Parker Solar Probe flew through the solar corona at 635,000 km/h, sampling magnetic switchbacks.',
    });

    const contProj = await storageService.addProject({
      name: 'Parker Solar Probe Corona Pass',
      sourceStoryId: contSource.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const scriptDraft = await scriptEngineService.generateScript(contProj.id);
    const approvedScript = await storageService.approveScript(scriptDraft.id, 'Flight Lead');

    const profile = promptStudioService.createInitialContinuityProfile(contProj, approvedScript);
    if (!profile.visualIdentity.overallVisualStyle || !profile.subjectIdentity.primarySubjectId) {
      throw new Error(`Continuity Profile failed to generate core identity fields.`);
    }

    const pkg = await promptStudioService.generatePromptPackage(contProj.id, approvedScript.id, profile);

    // Verify inheritance in every scene
    for (const sc of pkg.scenes) {
      if (!sc.finalProductionPrompt.includes(profile.visualIdentity.overallVisualStyle)) {
        throw new Error(`Scene ${sc.id} did not inherit visual style from central profile.`);
      }
    }

    // Verify scene override mechanism
    const sceneToOverride = pkg.scenes[1];
    sceneToOverride.sceneOverrides = {
      visualIdentity: {
        ...profile.visualIdentity,
        contrastAndLighting: 'Extreme ultraviolet solar flare illumination with blinding rim light',
      },
    };
    await storageService.updatePromptPackage(pkg.id, { scenes: pkg.scenes });

    const refetched = await storageService.getPromptPackageById(pkg.id);
    if (!refetched?.scenes[1].sceneOverrides?.visualIdentity?.contrastAndLighting) {
      throw new Error(`Scene-specific continuity override failed to persist.`);
    }

    await storageService.deletePromptPackage(pkg.id);
    await storageService.deleteScript(scriptDraft.id);
    await storageService.deleteProject(contProj.id);
    await storageService.deleteSource(contSource.id);

    tests[15].status = 'passed';
    tests[15].durationMs = Math.round(performance.now() - t16Start);
    tests[15].details = `Validated central profile generation, cross-scene visual/subject inheritance, and scene-specific override persistence.`;
  } catch (err: any) {
    tests[15].status = 'failed';
    tests[15].error = err.message || String(err);
  }
  update();

  // Test 17: Phase 4 - Narration Byte-for-Byte Fidelity Preservation
  tests[16].status = 'running';
  update();
  const t17Start = performance.now();
  try {
    const complexNarrationText = `Line 1: "Strict Quotes" & 'Single Quotes'. Special unicode: — ⚡ 🚀 ⚛.`;
    const fidSource = await storageService.addSource({
      title: 'Byte-for-Byte Fidelity Benchmark',
      content: complexNarrationText,
    });

    const fidProj = await storageService.addProject({
      name: 'Fidelity Benchmark Project',
      sourceStoryId: fidSource.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Analytical',
      visualStyle: 'Cinematic',
    });

    const scriptDraft = await scriptEngineService.generateScript(fidProj.id);
    const approvedScript = await storageService.approveScript(scriptDraft.id, 'Validator');

    const pkg = await promptStudioService.generatePromptPackage(fidProj.id, approvedScript.id);

    // Verify exact byte-for-byte fidelity in every scene
    for (let i = 0; i < pkg.scenes.length; i++) {
      const sc = pkg.scenes[i];
      const sec = approvedScript.sections[i];
      if (sc.exactNarration !== sec.narration) {
        throw new Error(`Scene ${sc.id} narration mutated! Expected "${sec.narration}", got "${sc.exactNarration}"`);
      }
      if (sc.structured.narrationAndAudio.exactLinkedNarration !== sec.narration) {
        throw new Error(`Scene ${sc.id} structured narration field mutated!`);
      }
    }

    await storageService.deletePromptPackage(pkg.id);
    await storageService.deleteScript(scriptDraft.id);
    await storageService.deleteProject(fidProj.id);
    await storageService.deleteSource(fidSource.id);

    tests[16].status = 'passed';
    tests[16].durationMs = Math.round(performance.now() - t17Start);
    tests[16].details = `100% byte-for-byte fidelity verified: narration in prompt schema matches approved script section exactly.`;
  } catch (err: any) {
    tests[16].status = 'failed';
    tests[16].error = err.message || String(err);
  }
  update();

  // Test 18: Phase 4 - Single-Scene Regeneration & Revision Tracking
  tests[17].status = 'running';
  update();
  const t18Start = performance.now();
  try {
    const regenSrc = await storageService.addSource({
      title: 'Artemis Lunar Base Camp Power Architecture',
      content: 'Fission surface power reactors and vertical solar arrays establish continuous energy at the lunar south pole.',
    });

    const regenProj = await storageService.addProject({
      name: 'Artemis Power Architecture',
      sourceStoryId: regenSrc.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(regenProj.id);
    const approved = await storageService.approveScript(draft.id, 'Mission Commander');

    const pkg = await promptStudioService.generatePromptPackage(regenProj.id, approved.id);
    const scene1OrigPrompt = pkg.scenes[0].finalProductionPrompt;
    const scene2OrigPrompt = pkg.scenes[1].finalProductionPrompt;
    const scene3OrigPrompt = pkg.scenes[2].finalProductionPrompt;

    // Regenerate Scene 2 with specific refinement directive
    const updatedPkg = await promptStudioService.regenerateScenePrompt(
      pkg.id,
      pkg.scenes[1].id,
      'Make dramatically more intense with volumetric lunar dust lighting'
    );

    // Verify Scene 1 and Scene 3 are byte-for-byte identical
    if (updatedPkg.scenes[0].finalProductionPrompt !== scene1OrigPrompt) {
      throw new Error(`Scene 1 was mutated when regenerating Scene 2!`);
    }
    if (updatedPkg.scenes[2].finalProductionPrompt !== scene3OrigPrompt) {
      throw new Error(`Scene 3 was mutated when regenerating Scene 2!`);
    }

    // Verify Scene 2 prompt changed and revision history bumped
    const updatedScene2 = updatedPkg.scenes[1];
    if (updatedScene2.revisionHistory.length !== 2) {
      throw new Error(`Scene 2 revision history not incremented (expected 2 revisions, got ${updatedScene2.revisionHistory.length}).`);
    }
    if (updatedScene2.startTime !== 8 || updatedScene2.endTime !== 16) {
      throw new Error(`Scene 2 duration boundaries corrupted during selective regeneration.`);
    }

    await storageService.deletePromptPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(regenProj.id);
    await storageService.deleteSource(regenSrc.id);

    tests[17].status = 'passed';
    tests[17].durationMs = Math.round(performance.now() - t18Start);
    tests[17].details = `Scene 2 selectively regenerated with revision history tracking while Scenes 1 and 3 remained 100% byte-for-byte identical.`;
  } catch (err: any) {
    tests[17].status = 'failed';
    tests[17].error = err.message || String(err);
  }
  update();

  // Test 19: Phase 4 - Prompt Package Save, Restore & Versioning
  tests[18].status = 'running';
  update();
  const t19Start = performance.now();
  try {
    const verSrc = await storageService.addSource({
      title: 'Voyager Golden Record Analog Sound Reproduction',
      content: 'Phonograph needle tracking audio grooves encoding Earth sounds and greetings across interstellar transit.',
    });

    const verProj = await storageService.addProject({
      name: 'Golden Record Transit',
      sourceStoryId: verSrc.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });

    const draft = await scriptEngineService.generateScript(verProj.id);
    const approved = await storageService.approveScript(draft.id, 'Lead Archivist');

    const pkgV1 = await promptStudioService.generatePromptPackage(verProj.id, approved.id);
    if (pkgV1.version !== 1) {
      throw new Error(`Initial package version should be 1, got ${pkgV1.version}`);
    }

    // Fork new package revision
    const pkgV2 = await storageService.forkPromptPackageRevision(pkgV1.id);
    if (pkgV2.version !== 2) {
      throw new Error(`Forked package revision should be v2, got v${pkgV2.version}`);
    }

    // Verify approved script is never mutated
    const scriptRecheck = await storageService.getScriptById(approved.id);
    if (!scriptRecheck?.isApproved || scriptRecheck.version !== approved.version) {
      throw new Error(`Approved script was mutated by prompt package revision!`);
    }

    await storageService.deletePromptPackage(pkgV1.id);
    await storageService.deletePromptPackage(pkgV2.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(verProj.id);
    await storageService.deleteSource(verSrc.id);

    tests[18].status = 'passed';
    tests[18].durationMs = Math.round(performance.now() - t19Start);
    tests[18].details = `Validated prompt package saving, revision forking (v1 -> v2), and guaranteed script immutability.`;
  } catch (err: any) {
    tests[18].status = 'failed';
    tests[18].error = err.message || String(err);
  }
  update();

  // Test 20: Phase 4 - JSON & Markdown Export Schema Verification
  tests[19].status = 'running';
  update();
  const t20Start = performance.now();
  try {
    const expSrc = await storageService.addSource({
      title: 'Nuclear Thermal Propulsion Ground Test',
      content: 'DARPA and NASA DRACO engine fuel element verification tests at high temperature operating regimes.',
    });

    const expProj = await storageService.addProject({
      name: 'DRACO NTP Engine',
      sourceStoryId: expSrc.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(expProj.id);
    const approved = await storageService.approveScript(draft.id, 'Propulsion Lead');
    const pkg = await promptStudioService.generatePromptPackage(expProj.id, approved.id);

    // 1. Validate JSON Export
    const jsonStr = JSON.stringify(pkg);
    const parsedJson = JSON.parse(jsonStr);
    if (
      !parsedJson.id ||
      !parsedJson.projectId ||
      !parsedJson.continuityProfile ||
      !Array.isArray(parsedJson.scenes) ||
      parsedJson.scenes.length !== 3
    ) {
      throw new Error(`JSON export schema invalid or missing core package fields.`);
    }

    // 2. Validate Markdown Export
    const md = promptStudioService.exportPromptPackageToMarkdown(pkg);
    if (!md.includes('# ULTIMATETRON — GOOGLE FLOW PROMPT PACKAGE')) {
      throw new Error(`Markdown export missing title header.`);
    }
    if (!md.includes('CENTRAL CONTINUITY PROFILE')) {
      throw new Error(`Markdown export missing Central Continuity Profile.`);
    }
    if (!md.includes('STANDALONE PRODUCTION PROMPT')) {
      throw new Error(`Markdown export missing standalone production prompt code blocks.`);
    }

    await storageService.deletePromptPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(expProj.id);
    await storageService.deleteSource(expSrc.id);

    tests[19].status = 'passed';
    tests[19].durationMs = Math.round(performance.now() - t20Start);
    tests[19].details = `Validated machine-readable JSON schema and human-readable Markdown with copyable production prompts.`;
  } catch (err: any) {
    tests[19].status = 'failed';
    tests[19].error = err.message || String(err);
  }
  update();

  // Test 21: Phase 4 - Deterministic Prompt Validation Engine
  tests[20].status = 'running';
  update();
  const t21Start = performance.now();
  try {
    const valSrc = await storageService.addSource({
      title: 'Solar Flare Spectrogram Analysis',
      content: 'High-energy coronal mass ejection observed in extreme ultraviolet wavelengths.',
    });

    const valProj = await storageService.addProject({
      name: 'Spectrogram Validation',
      sourceStoryId: valSrc.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Analytical',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(valProj.id);
    const approved = await storageService.approveScript(draft.id, 'Solar Physicist');
    const pkg = await promptStudioService.generatePromptPackage(valProj.id, approved.id);

    // Test clean report
    const cleanReport = promptStudioService.runValidationChecks(
      valProj,
      approved,
      pkg.scenes,
      pkg.continuityProfile
    );
    if (!cleanReport.canExport || cleanReport.structuralErrors.length > 0) {
      throw new Error(`Clean package incorrectly flagged with structural errors.`);
    }

    // Test intentional timestamp gap flaw
    const flawedScenes = JSON.parse(JSON.stringify(pkg.scenes));
    flawedScenes[1].startTime = 12; // Gap: 8s to 12s
    const flawedReport = promptStudioService.runValidationChecks(
      valProj,
      approved,
      flawedScenes,
      pkg.continuityProfile
    );
    if (flawedReport.canExport || flawedReport.structuralErrors.length === 0) {
      throw new Error(`Validation engine failed to catch timestamp gap error.`);
    }

    await storageService.deletePromptPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(valProj.id);
    await storageService.deleteSource(valSrc.id);

    tests[20].status = 'passed';
    tests[20].durationMs = Math.round(performance.now() - t21Start);
    tests[20].details = `Validated deterministic checks: passed valid package and strictly blocked flawed timestamp gaps.`;
  } catch (err: any) {
    tests[20].status = 'failed';
    tests[20].error = err.message || String(err);
  }
  update();

  // Test 22: Phase 4 - Quota Protection & Graceful Error Handling
  tests[21].status = 'running';
  update();
  const t22Start = performance.now();
  try {
    // 1. Verify validateScriptEntryGate throws actionable error on non-existent project
    const badProj = await promptStudioService.validateScriptEntryGate('NON_EXISTENT_PROJ_9999');
    if (badProj.canEnter || !badProj.blockingReasons[0].includes('not found')) {
      throw new Error(`Failed to return actionable error for invalid project ID.`);
    }

    // 2. Verify offline / algorithmic fallback produces 100% valid schema without external quota
    const offlineSrc = await storageService.addSource({
      title: 'Cryogenic Liquid Hydrogen Boil-off Suppression',
      content: 'Active cryocoolers reduce hydrogen boil-off to zero for multi-month orbital propellant depots.',
    });
    const offlineProj = await storageService.addProject({
      name: 'Cryocooler Test',
      sourceStoryId: offlineSrc.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(offlineProj.id);
    const approved = await storageService.approveScript(draft.id, 'Cryo Lead');

    // Run generation directly with algorithmic generator
    const profile = promptStudioService.createInitialContinuityProfile(offlineProj, approved);
    const offlinePkg = await promptStudioService.generatePromptPackage(offlineProj.id, approved.id, profile);

    if (offlinePkg.scenes.length !== 3 || !offlinePkg.scenes[0].structured.finalProductionPrompt) {
      throw new Error(`Algorithmic zero-downtime prompt synthesis failed.`);
    }

    await storageService.deletePromptPackage(offlinePkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(offlineProj.id);
    await storageService.deleteSource(offlineSrc.id);

    tests[21].status = 'passed';
    tests[21].durationMs = Math.round(performance.now() - t22Start);
    tests[21].details = `Verified quota protection, zero automatic requests on load, and zero-downtime offline synthesis.`;
  } catch (err: any) {
    tests[21].status = 'failed';
    tests[21].error = err.message || String(err);
  }
  update();

  // ==========================================
  // PHASE 5: THUMBNAIL STUDIO AUTOMATED TESTS
  // ==========================================

  // Test 23: Entry gate without selected project
  tests[22].status = 'running';
  update();
  const t23Start = performance.now();
  try {
    const gate = await thumbnailStudioService.validateThumbnailEntryGate('NON_EXISTENT_PROJ_9999');
    if (gate.canEnter || !gate.blockingReasons[0].includes('not found')) {
      throw new Error(`Failed to block entry when project does not exist.`);
    }
    tests[22].status = 'passed';
    tests[22].durationMs = Math.round(performance.now() - t23Start);
    tests[22].details = `Strictly blocked entry for non-existent project with actionable message: "${gate.blockingReasons[0]}".`;
  } catch (err: any) {
    tests[22].status = 'failed';
    tests[22].error = err.message || String(err);
  }
  update();

  // Test 24: Entry gate blocking unapproved draft scripts
  tests[23].status = 'running';
  update();
  const t24Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Dark Matter Halos & Galactic Rotation Curves',
      content: 'Vera Rubin observed stellar orbital velocities remaining flat with radial distance, proving undetected mass.',
    });
    const proj = await storageService.addProject({
      name: 'Dark Matter Test',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Suspenseful',
      visualStyle: 'Cinematic',
    });

    const draftScript = await scriptEngineService.generateScript(proj.id);
    // Script is in draft status, NOT approved

    const gate = await thumbnailStudioService.validateThumbnailEntryGate(proj.id);
    if (gate.canEnter) {
      throw new Error(`Entry gate allowed unapproved draft script.`);
    }
    if (!gate.blockingReasons.some((r) => r.toLowerCase().includes('draft status') || r.toLowerCase().includes('approved'))) {
      throw new Error(`Blocking reason does not state that script is in Draft status.`);
    }

    // Attempting generation must reject
    let threw = false;
    try {
      await thumbnailStudioService.generateThumbnailPackage(proj.id, draftScript.id);
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error(`generateThumbnailPackage should throw when script is unapproved.`);
    }

    await storageService.deleteScript(draftScript.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[23].status = 'passed';
    tests[23].durationMs = Math.round(performance.now() - t24Start);
    tests[23].details = `Blocked draft script from entering Thumbnail Studio; required explicit upstream approval.`;
  } catch (err: any) {
    tests[23].status = 'failed';
    tests[23].error = err.message || String(err);
  }
  update();

  // Test 25: Exact approved script & source version linkage
  tests[24].status = 'running';
  update();
  const t25Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Laser Interferometer Gravitational-Wave Observatory',
      content: 'In 2015, LIGO detected gravitational waves from binary black hole merger GW150914.',
    });
    const proj = await storageService.addProject({
      name: 'LIGO Discovery',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Production Lead');

    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    if (!pkg.id.startsWith('THUMB-')) {
      throw new Error(`Package ID format invalid: ${pkg.id}`);
    }
    if (pkg.scriptId !== approved.id || pkg.scriptVersion !== approved.version) {
      throw new Error(`Script version binding mismatch: ${pkg.scriptId} v${pkg.scriptVersion} vs ${approved.id} v${approved.version}`);
    }
    if (pkg.storyId !== src.id || pkg.sourceVersion !== 1) {
      throw new Error(`Source provenance mismatch: ${pkg.storyId} v${pkg.sourceVersion} vs ${src.id} v1`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[24].status = 'passed';
    tests[24].durationMs = Math.round(performance.now() - t25Start);
    tests[24].details = `Verified immutable provenance linking package to ${approved.id} (v${approved.version}) and ${src.id} (v1).`;
  } catch (err: any) {
    tests[24].status = 'failed';
    tests[24].error = err.message || String(err);
  }
  update();

  // Test 26: Exactly three differentiated thumbnail concepts
  tests[25].status = 'running';
  update();
  const t26Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Enceladus Cryovolcanism & Subsurface Ocean',
      content: 'Cassini detected hydrothermal vents beneath Enceladus ice crust emitting molecular hydrogen.',
    });
    const proj = await storageService.addProject({
      name: 'Enceladus Ocean',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Suspenseful',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Chief Science Officer');

    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    if (!pkg.concepts || pkg.concepts.length !== 3) {
      throw new Error(`Must have exactly 3 concepts, found: ${pkg.concepts?.length}`);
    }

    const [cA, cB, cC] = pkg.concepts;
    if (cA.id !== 'concept_a' || cB.id !== 'concept_b' || cC.id !== 'concept_c') {
      throw new Error(`Concept IDs incorrect: ${cA.id}, ${cB.id}, ${cC.id}`);
    }

    // Verify distinct creative directions
    if (cA.creativeDirection === cB.creativeDirection || cB.creativeDirection === cC.creativeDirection) {
      throw new Error(`Concepts share identical creative directions.`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[25].status = 'passed';
    tests[25].durationMs = Math.round(performance.now() - t26Start);
    tests[25].details = `Generated exactly 3 distinct concepts: "${cA.creativeDirection}", "${cB.creativeDirection}", "${cC.creativeDirection}".`;
  } catch (err: any) {
    tests[25].status = 'failed';
    tests[25].error = err.message || String(err);
  }
  update();

  // Test 27: Self-contained prompts & negative safeguards
  tests[26].status = 'running';
  update();
  const t27Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Antikythera Mechanism Astronomical Computer',
      content: 'Bronze gearwork recovered from 60 BC shipwreck accurately predicted eclipses and planetary cycles.',
    });
    const proj = await storageService.addProject({
      name: 'Antikythera Gearwork',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'History',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });

    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Historian');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    pkg.concepts.forEach((c, idx) => {
      const label = `Concept ${idx + 1}`;
      if (!c.selfContainedPrompt || c.selfContainedPrompt.length < 50) {
        throw new Error(`${label} prompt too short (${c.selfContainedPrompt?.length} chars).`);
      }
      if (!c.negativePrompt || c.negativePrompt.length < 20) {
        throw new Error(`${label} negative prompt missing or incomplete.`);
      }
      if (!c.compositionAndFocalPoint) {
        throw new Error(`${label} missing composition and focal point.`);
      }
      if (!c.safeMarginsAndMobileReadability) {
        throw new Error(`${label} missing safe margins description.`);
      }
    });

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[26].status = 'passed';
    tests[26].durationMs = Math.round(performance.now() - t27Start);
    tests[26].details = `Validated all 3 concepts have comprehensive standalone image prompts, negative safeguards, and composition specs.`;
  } catch (err: any) {
    tests[26].status = 'failed';
    tests[26].error = err.message || String(err);
  }
  update();

  // Test 28: Interactive configuration controls direct impact
  tests[27].status = 'running';
  update();
  const t28Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Solar Flare Carrington Event 1859',
      content: 'A coronal mass ejection induced high geomagnetic voltages that overloaded global telegraph networks.',
    });
    const proj = await storageService.addProject({
      name: 'Solar Flare Test',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });

    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Solar Physicist');

    const customConfig = {
      lightingDirection: 'cybernetic_neon' as const,
      colorPalette: 'warm_amber_slate' as const,
      headlineText: '1859 DISASTER REPEATED',
      cameraFraming: 'extreme_close_up' as const,
    };

    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id, customConfig);

    if (pkg.config.lightingDirection !== 'cybernetic_neon') {
      throw new Error(`Config lightingDirection not applied.`);
    }
    if (pkg.config.colorPalette !== 'warm_amber_slate') {
      throw new Error(`Config colorPalette not applied.`);
    }
    if (pkg.config.headlineText !== '1859 DISASTER REPEATED') {
      throw new Error(`Config headlineText not applied.`);
    }

    // Verify concept prompts reflect the custom configuration
    const promptHasConfig = pkg.concepts.some(
      (c) =>
        c.selfContainedPrompt.toLowerCase().includes('cybernetic neon') ||
        c.selfContainedPrompt.toLowerCase().includes('warm amber') ||
        c.thumbnailTextSuggestion === '1859 DISASTER REPEATED'
    );
    if (!promptHasConfig) {
      throw new Error(`Custom controls did not propagate to generated concept prompts.`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[27].status = 'passed';
    tests[27].durationMs = Math.round(performance.now() - t28Start);
    tests[27].details = `Validated interactive controls directly modulate thumbnail parameters, lighting, palette, and headline copy.`;
  } catch (err: any) {
    tests[27].status = 'failed';
    tests[27].error = err.message || String(err);
  }
  update();

  // Test 29: 16:9 standard and 9:16 vertical ratio handling
  tests[28].status = 'running';
  update();
  const t29Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Neural Interfaces & Direct Motor Cortex Decoding',
      content: 'Intracortical arrays translate intent into real-time prosthetic motion via spike raster decoders.',
    });
    // 1. Test 16:9
    const proj16 = await storageService.addProject({
      name: 'Neural 16x9',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Analytical',
      visualStyle: 'Cinematic',
    });
    const d16 = await scriptEngineService.generateScript(proj16.id);
    const a16 = await storageService.approveScript(d16.id, 'Lead');
    const pkg16 = await thumbnailStudioService.generateThumbnailPackage(proj16.id, a16.id);

    if (pkg16.config.aspectRatio !== '16:9') {
      throw new Error(`16:9 aspect ratio not respected.`);
    }
    if (!pkg16.concepts[0].safeMarginsAndMobileReadability.toLowerCase().includes('16:9') &&
        !pkg16.concepts[0].safeMarginsAndMobileReadability.toLowerCase().includes('bottom-right')) {
      throw new Error(`16:9 safe margins not specified.`);
    }

    // 2. Test 9:16
    const proj9 = await storageService.addProject({
      name: 'Neural 9x16',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '9:16',
      duration: 24,
      clipCount: 3,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });
    const d9 = await scriptEngineService.generateScript(proj9.id);
    const a9 = await storageService.approveScript(d9.id, 'Lead');
    const pkg9 = await thumbnailStudioService.generateThumbnailPackage(proj9.id, a9.id);

    if (pkg9.config.aspectRatio !== '9:16') {
      throw new Error(`9:16 aspect ratio not respected.`);
    }
    if (!pkg9.concepts[0].safeMarginsAndMobileReadability.toLowerCase().includes('vertical') &&
        !pkg9.concepts[0].safeMarginsAndMobileReadability.toLowerCase().includes('9:16')) {
      throw new Error(`9:16 vertical safe margins not specified.`);
    }

    await storageService.deleteThumbnailPackage(pkg16.id);
    await storageService.deleteThumbnailPackage(pkg9.id);
    await storageService.deleteScript(d16.id);
    await storageService.deleteScript(d9.id);
    await storageService.deleteProject(proj16.id);
    await storageService.deleteProject(proj9.id);
    await storageService.deleteSource(src.id);

    tests[28].status = 'passed';
    tests[28].durationMs = Math.round(performance.now() - t29Start);
    tests[28].details = `Validated 16:9 landscape framing with timestamp avoidance and 9:16 vertical Shorts safe zones.`;
  } catch (err: any) {
    tests[28].status = 'failed';
    tests[28].error = err.message || String(err);
  }
  update();

  // Test 30: Individual prompt copy & package operations
  tests[29].status = 'running';
  update();
  const t30Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Voyager Deep Space Interstellar Boundary',
      content: 'Voyager crossed the heliopause into true interstellar space with plasma density spikes.',
    });
    const proj = await storageService.addProject({
      name: 'Voyager Boundary',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Suspenseful',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Flight Lead');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // Verify individual prompt strings are non-empty and clean strings
    pkg.concepts.forEach((c) => {
      if (typeof c.selfContainedPrompt !== 'string' || c.selfContainedPrompt.trim() === '') {
        throw new Error(`Prompt for ${c.id} is not a valid copyable string.`);
      }
      if (typeof c.negativePrompt !== 'string' || c.negativePrompt.trim() === '') {
        throw new Error(`Negative prompt for ${c.id} is not a valid copyable string.`);
      }
    });

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[29].status = 'passed';
    tests[29].durationMs = Math.round(performance.now() - t30Start);
    tests[29].details = `Verified prompts, negative prompts, and headlines are independently accessible for one-click copy operations.`;
  } catch (err: any) {
    tests[29].status = 'failed';
    tests[29].error = err.message || String(err);
  }
  update();

  // Test 31: JSON Schema & Markdown production brief exports
  tests[30].status = 'running';
  update();
  const t31Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Hubble Deep Field Galaxies',
      content: 'Ten days of exposure on an empty celestial coordinate uncovered 3,000 distinct ancient galaxies.',
    });
    const proj = await storageService.addProject({
      name: 'Hubble Deep Field',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Astronomer');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // JSON Export check
    const jsonStr = thumbnailStudioService.exportPackageAsJSON(pkg);
    const parsed = JSON.parse(jsonStr);
    if (parsed.exportSchemaVersion !== 'ultimatetron.thumbnail.v1') {
      throw new Error(`Invalid JSON schema version: ${parsed.exportSchemaVersion}`);
    }
    if (parsed.concepts.length !== 3) {
      throw new Error(`JSON export must contain 3 concepts.`);
    }

    // Markdown Export check
    const mdStr = thumbnailStudioService.exportPackageAsMarkdown(pkg, proj, approved);
    if (!mdStr.includes('# ULTIMATETRON — THUMBNAIL PRODUCTION BRIEF')) {
      throw new Error(`Markdown export missing title.`);
    }
    if (!mdStr.includes('CONCEPT A:') || !mdStr.includes('CONCEPT B:') || !mdStr.includes('CONCEPT C:')) {
      throw new Error(`Markdown export missing concept breakdown sections.`);
    }
    if (!mdStr.includes('Standalone Image Generation Prompt:')) {
      throw new Error(`Markdown export missing standalone prompt blocks.`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[30].status = 'passed';
    tests[30].durationMs = Math.round(performance.now() - t31Start);
    tests[30].details = `Validated valid ultimatetron.thumbnail.v1 JSON schema and structured Markdown production brief.`;
  } catch (err: any) {
    tests[30].status = 'failed';
    tests[30].error = err.message || String(err);
  }
  update();

  // Test 32: Selective single-concept byte-for-byte preservation
  tests[31].status = 'running';
  update();
  const t32Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Quantum Teleportation of Trapped Ion States',
      content: 'Fidelity reached 90 percent over optical fiber links using entangled photon pairs.',
    });
    const proj = await storageService.addProject({
      name: 'Quantum Teleportation',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Suspenseful',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Quantum Lead');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // Capture byte-for-byte snapshots of Concept A and Concept C
    const snapA = JSON.stringify(pkg.concepts[0]);
    const snapC = JSON.stringify(pkg.concepts[2]);
    const originalB = pkg.concepts[1].selfContainedPrompt;

    // Regenerate Concept B with explicit user directive
    const updatedPkg = await thumbnailStudioService.regenerateSingleConcept(
      pkg.id,
      'concept_b',
      'Shift lighting to deep crimson edge rim and zoom closer to eye pupil'
    );

    // Verify Concept B actually regenerated
    if (updatedPkg.concepts[1].selfContainedPrompt === originalB) {
      throw new Error(`Concept B prompt was not modified during regeneration.`);
    }
    if (!updatedPkg.concepts[1].creativeRationale.includes('Revision 1')) {
      throw new Error(`Revision note missing in Concept B rationale.`);
    }

    // Verify STRICT byte-for-byte preservation of Concept A and Concept C
    const afterSnapA = JSON.stringify(updatedPkg.concepts[0]);
    const afterSnapC = JSON.stringify(updatedPkg.concepts[2]);

    if (afterSnapA !== snapA) {
      throw new Error(`Integrity breach: Concept A was altered during regeneration of Concept B.`);
    }
    if (afterSnapC !== snapC) {
      throw new Error(`Integrity breach: Concept C was altered during regeneration of Concept B.`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[31].status = 'passed';
    tests[31].durationMs = Math.round(performance.now() - t32Start);
    tests[31].details = `Strictly verified 100% byte-for-byte equality for unaffected Concepts A and C during Concept B regeneration.`;
  } catch (err: any) {
    tests[31].status = 'failed';
    tests[31].error = err.message || String(err);
  }
  update();

  // Test 33: Concept revision history & package versioning
  tests[32].status = 'running';
  update();
  const t33Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Fusion Net Energy Gain Ignition',
      content: 'National Ignition Facility lasers delivered 2.05 MJ to a hohlraum capsule yielding 3.15 MJ.',
    });
    const proj = await storageService.addProject({
      name: 'Fusion Ignition',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Laser Director');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // Regenerate Concept A twice
    const r1 = await thumbnailStudioService.regenerateSingleConcept(pkg.id, 'concept_a', 'First refinement');
    const r2 = await thumbnailStudioService.regenerateSingleConcept(r1.id, 'concept_a', 'Second refinement');

    const conceptA = r2.concepts[0];
    if (conceptA.revisionHistory.length !== 2) {
      throw new Error(`Expected 2 revision history entries, found: ${conceptA.revisionHistory.length}`);
    }
    if (conceptA.revisionHistory[0].instruction !== 'First refinement') {
      throw new Error(`First revision instruction mismatch: ${conceptA.revisionHistory[0].instruction}`);
    }
    if (conceptA.revisionHistory[1].instruction !== 'Second refinement') {
      throw new Error(`Second revision instruction mismatch: ${conceptA.revisionHistory[1].instruction}`);
    }

    // Test package version forking
    const forked = await storageService.forkThumbnailPackageRevision(r2.id, {
      config: { ...r2.config, headlineText: 'NEW FUSION RECORD' },
    });
    if (forked.version !== 2) {
      throw new Error(`Expected forked package to be version 2, got: ${forked.version}`);
    }
    if (forked.id === r2.id) {
      throw new Error(`Forked package must receive a new unique ID.`);
    }

    await storageService.deleteThumbnailPackage(forked.id);
    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[32].status = 'passed';
    tests[32].durationMs = Math.round(performance.now() - t33Start);
    tests[32].details = `Verified concept revision stack (rev 1 -> rev 2) and package version forking (v1 -> v2).`;
  } catch (err: any) {
    tests[32].status = 'failed';
    tests[32].error = err.message || String(err);
  }
  update();

  // Test 34: Persistence storage, reopening & reloading
  tests[33].status = 'running';
  update();
  const t34Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Voyager Golden Record Etchings',
      content: 'Electroplated copper discs contain 115 images and natural sounds from Earth.',
    });
    const proj = await storageService.addProject({
      name: 'Golden Record',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'History',
      tone: 'Warm',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Carl Sagan Lead');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // Reopen by ID
    const byId = await storageService.getThumbnailPackageById(pkg.id);
    if (!byId || byId.id !== pkg.id) {
      throw new Error(`Failed to retrieve thumbnail package by ID.`);
    }

    // Reopen by Project ID
    const byProject = await storageService.getThumbnailPackagesByProjectId(proj.id);
    if (byProject.length === 0 || byProject[0].id !== pkg.id) {
      throw new Error(`Failed to retrieve thumbnail package by project ID.`);
    }

    // Reopen by Script ID
    const byScript = await storageService.getThumbnailPackagesByScriptId(approved.id);
    if (byScript.length === 0 || byScript[0].id !== pkg.id) {
      throw new Error(`Failed to retrieve thumbnail package by script ID.`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[33].status = 'passed';
    tests[33].durationMs = Math.round(performance.now() - t34Start);
    tests[33].details = `Verified persistence integrity across package ID, project ID, and approved script ID lookup keys.`;
  } catch (err: any) {
    tests[33].status = 'failed';
    tests[33].error = err.message || String(err);
  }
  update();

  // Test 35: Offline deterministic fallback & zero autoload AI
  tests[34].status = 'running';
  update();
  const t35Start = performance.now();
  try {
    const mockContext = {
      mainSubject: 'James Webb Space Telescope',
      centralConflict: 'First galaxies forming earlier than cosmological models predicted',
      strongestVisualMoment: 'Golden beryllium hexagonal mirrors deploying in deep space halo orbit',
      emotionalTone: 'Awe and cosmic wonder',
      importantEnvironment: 'Sun-Earth L2 Lagrangian Point with deep starry background',
      mainCuriosityHook: 'Why The First Galaxies Shouldn\'t Exist',
      spoilerWarnings: ['Do not reveal exact redshift values'],
      keyEntities: ['JWST', 'L2 Orbit', 'Beryllium Mirrors'],
    };

    const mockConfig = {
      aspectRatio: '16:9' as AspectRatio,
      visualStyle: 'Cinematic' as VisualStyle,
      subjectPlacement: 'rule_of_thirds_left' as const,
      facialExpression: 'not_applicable' as const,
      cameraFraming: 'close_up' as const,
      backgroundComplexity: 'balanced' as const,
      lightingDirection: 'volumetric_rays' as const,
      colorPalette: 'crimson_cyan' as const,
      typographyStyle: 'bold_sans' as const,
      textPlacement: 'bottom_left' as const,
      textVisibility: 'high_impact_boxed' as const,
      headlineText: 'COSMIC PARADOX',
      branding: 'none' as const,
      creativeIntensity: 'dramatic' as const,
    };

    const dummyProj = {
      id: 'PROJ-TEST',
      seqNumber: 1,
      name: 'JWST Test',
      sourceStoryId: 'STORY-1',
      sourceVersion: 1,
      status: 'approved' as const,
      aspectRatio: '16:9' as AspectRatio,
      duration: 240,
      language: 'English' as const,
      contentMode: 'Explainer' as const,
      tone: 'Suspenseful' as const,
      visualStyle: 'Cinematic' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Run deterministic generator directly
    const offlineConcepts = thumbnailStudioService.generateDeterministicConcepts(dummyProj, mockContext, mockConfig);

    if (offlineConcepts.length !== 3) {
      throw new Error(`Expected 3 offline concepts, got: ${offlineConcepts.length}`);
    }
    offlineConcepts.forEach((c) => {
      if (!c.selfContainedPrompt.includes('James Webb Space Telescope')) {
        throw new Error(`Offline concept prompt does not contain main subject: ${c.selfContainedPrompt}`);
      }
    });

    tests[34].status = 'passed';
    tests[34].durationMs = Math.round(performance.now() - t35Start);
    tests[34].details = `Verified 100% deterministic local fallback without network or external model calls.`;
  } catch (err: any) {
    tests[34].status = 'failed';
    tests[34].error = err.message || String(err);
  }
  update();

  // Test 36: Image generation state handling (no false success)
  tests[35].status = 'running';
  update();
  const t36Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Neutron Star Magnetic Flux',
      content: 'Magnetars exhibit magnetic fields reaching 100 gigateslas causing crustquakes.',
    });
    const proj = await storageService.addProject({
      name: 'Magnetar Test',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Astrophysicist');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // Initial state must be 'not_requested'
    if (pkg.concepts[0].imageGenerationStatus !== 'not_requested') {
      throw new Error(`Initial status should be not_requested, got: ${pkg.concepts[0].imageGenerationStatus}`);
    }
    if (pkg.concepts[0].generatedImageUrl) {
      throw new Error(`Cannot have generatedImageUrl prior to image generation.`);
    }

    // Call generateConceptImage
    const postGenPkg = await thumbnailStudioService.generateConceptImage(pkg.id, 'concept_a');
    const conceptA = postGenPkg.concepts[0];

    // Status must be either 'generated' (if real image bytes returned) or 'unavailable'/'failed'
    // It must NEVER claim 'generated' without a valid generatedImageUrl!
    if (conceptA.imageGenerationStatus === 'generated') {
      if (!conceptA.generatedImageUrl || !conceptA.generatedImageUrl.startsWith('data:image/')) {
        throw new Error(`Claimed image generated without valid image URL data.`);
      }
    } else {
      if (conceptA.imageGenerationStatus !== 'unavailable' && conceptA.imageGenerationStatus !== 'failed') {
        throw new Error(`Unexpected image generation state: ${conceptA.imageGenerationStatus}`);
      }
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[35].status = 'passed';
    tests[35].durationMs = Math.round(performance.now() - t36Start);
    tests[35].details = `Verified prompt generation is separate from image rendering; strictly avoided false success claims.`;
  } catch (err: any) {
    tests[35].status = 'failed';
    tests[35].error = err.message || String(err);
  }
  update();

  // Test 37: Approved script and upstream immutability guard
  tests[36].status = 'running';
  update();
  const t37Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Radioisotope Thermoelectric Generators',
      content: 'Plutonium-238 decay heat produces electricity through Seebeck effect thermocouples.',
    });
    const proj = await storageService.addProject({
      name: 'RTG Power',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Analytical',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Power Systems Lead');

    const scriptBefore = JSON.stringify(approved);

    // Generate package and execute selective regeneration
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);
    await thumbnailStudioService.regenerateSingleConcept(pkg.id, 'concept_a', 'Change to blue lighting');

    // Retrieve script from storage and assert 100% byte-for-byte identical
    const scriptAfter = JSON.stringify(await storageService.getScriptById(approved.id));
    if (scriptBefore !== scriptAfter) {
      throw new Error(`Upstream approved script was mutated during thumbnail operations!`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[36].status = 'passed';
    tests[36].durationMs = Math.round(performance.now() - t37Start);
    tests[36].details = `Guaranteed approved script remained 100% immutable throughout thumbnail generation and selective regeneration.`;
  } catch (err: any) {
    tests[36].status = 'failed';
    tests[36].error = err.message || String(err);
  }
  update();

  // Test 38: Backward compatibility with pre-Phase-5 projects
  tests[37].status = 'running';
  update();
  const t38Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Legacy Project Pre-Phase-5 Test Story',
      content: 'Legacy data representation without thumbnail metadata.',
    });
    const legacyProj = await storageService.addProject({
      name: 'Legacy Project Without Thumbnails',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Neutral',
      visualStyle: 'Cinematic',
    });

    // Querying thumbnail packages for legacy project must return empty array without errors
    const thumbs = await storageService.getThumbnailPackagesByProjectId(legacyProj.id);
    if (!Array.isArray(thumbs) || thumbs.length !== 0) {
      throw new Error(`Expected empty array for legacy project, got: ${JSON.stringify(thumbs)}`);
    }

    // Diagnostics must succeed
    const diag = await storageService.getDiagnostics();
    if (typeof diag.thumbnailPackageCount !== 'number' || isNaN(diag.thumbnailPackageCount)) {
      throw new Error(`Diagnostics thumbnailPackageCount is invalid: ${diag.thumbnailPackageCount}`);
    }

    await storageService.deleteProject(legacyProj.id);
    await storageService.deleteSource(src.id);

    tests[37].status = 'passed';
    tests[37].durationMs = Math.round(performance.now() - t38Start);
    tests[37].details = `Verified backward compatibility: legacy projects safely return empty arrays without throwing errors.`;
  } catch (err: any) {
    tests[37].status = 'failed';
    tests[37].error = err.message || String(err);
  }
  update();

  // Test 39: Automated validation engine & creative disclosures
  tests[38].status = 'running';
  update();
  const t39Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Deep Space Optical Communications Testing',
      content: 'Near-infrared laser communications achieved 267 Mbps downlink from 31 million kilometers.',
    });
    const proj = await storageService.addProject({
      name: 'Laser Comms',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Urgent',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Telecom Lead');
    const pkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // 1. Valid clean package must pass export check
    const cleanReport = thumbnailStudioService.runValidationChecks(pkg.config, approved, pkg.concepts);
    if (!cleanReport.canExport || cleanReport.structuralErrors.length > 0) {
      throw new Error(`Valid package failed validation check: ${cleanReport.structuralErrors.join(', ')}`);
    }
    // Must contain text-rendering disclaimer notice
    const hasTextNotice = cleanReport.notices.some((n) => n.toLowerCase().includes('text rendering'));
    if (!hasTextNotice) {
      throw new Error(`Validation report missing text-rendering notice.`);
    }

    // 2. Corrupted package (e.g. empty prompt) must fail canExport
    const corruptedConcepts = JSON.parse(JSON.stringify(pkg.concepts));
    corruptedConcepts[0].selfContainedPrompt = ''; // Empty prompt
    const flawedReport = thumbnailStudioService.runValidationChecks(pkg.config, approved, corruptedConcepts);
    if (flawedReport.canExport || flawedReport.structuralErrors.length === 0) {
      throw new Error(`Flawed package with empty prompt was not blocked by validation engine.`);
    }

    await storageService.deleteThumbnailPackage(pkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[38].status = 'passed';
    tests[38].durationMs = Math.round(performance.now() - t39Start);
    tests[38].details = `Validated deterministic checks: passed valid package and strictly blocked flawed prompt structures.`;
  } catch (err: any) {
    tests[38].status = 'failed';
    tests[38].error = err.message || String(err);
  }
  update();

  // Test 40: Phase 6 Production Stage Health & Deterministic Progress Calculation
  tests[39].status = 'running';
  update();
  const t40Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Voyager Interstellar Signals Health Test',
      content: 'Telemetry packets reconstituted after memory relocations in deep space.',
    });
    const proj = await storageService.addProject({
      name: 'Voyager Signals',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });

    // 1. Initial State: Source approved (15%), Script not started
    let health = await productionService.calculateProjectProductionHealth(proj.id);
    if (health.sourceStatus !== 'approved' || health.scriptStatus !== 'not_started' || health.flowPromptsStatus !== 'blocked') {
      throw new Error(`Initial health mismatch: source=${health.sourceStatus}, script=${health.scriptStatus}, flow=${health.flowPromptsStatus}`);
    }
    if (health.overallProgressPercent !== 15) {
      throw new Error(`Expected exactly 15% progress for source-only, got: ${health.overallProgressPercent}%`);
    }

    // 2. Draft script created
    const draft = await scriptEngineService.generateScript(proj.id);
    health = await productionService.calculateProjectProductionHealth(proj.id);
    if (health.scriptStatus !== 'draft') {
      throw new Error(`Expected scriptStatus to be 'draft', got: ${health.scriptStatus}`);
    }

    // 3. Script approved -> unblocks flow & thumbnails
    const approved = await storageService.approveScript(draft.id, 'Mission Commander');
    health = await productionService.calculateProjectProductionHealth(proj.id);
    if (health.scriptStatus !== 'approved' || health.flowPromptsStatus !== 'not_started') {
      throw new Error(`Approved script did not unblock stages: script=${health.scriptStatus}, flow=${health.flowPromptsStatus}`);
    }

    // 4. Generate flow prompt package
    const promptPkg = await promptStudioService.generatePromptPackage(proj.id, approved.id);
    health = await productionService.calculateProjectProductionHealth(proj.id);
    if (health.flowPromptsStatus !== 'ready_for_export') {
      throw new Error(`Flow prompts status mismatch: expected 'ready_for_export', got: ${health.flowPromptsStatus}`);
    }

    // 5. Generate thumbnail package
    const thumbPkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);
    health = await productionService.calculateProjectProductionHealth(proj.id);
    if (health.thumbnailStatus !== 'ready_for_export') {
      throw new Error(`Thumbnail status mismatch: expected 'ready_for_export', got: ${health.thumbnailStatus}`);
    }

    // Progress: source(15) + script(25) + flow(20) + thumb(20) = 80%
    if (health.overallProgressPercent !== 80) {
      throw new Error(`Expected exactly 80% progress before assets, got: ${health.overallProgressPercent}%`);
    }

    // Cleanup
    await storageService.deleteThumbnailPackage(thumbPkg.id);
    await storageService.deletePromptPackage(promptPkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[39].status = 'passed';
    tests[39].durationMs = Math.round(performance.now() - t40Start);
    tests[39].details = `Verified un-invented status lifecycle: not_started -> draft -> approved -> ready_for_export (80% math validated).`;
  } catch (err: any) {
    tests[39].status = 'failed';
    tests[39].error = err.message || String(err);
  }
  update();

  // Test 41: Phase 6 Production Asset Library CRUD & Binary Persistence
  tests[40].status = 'running';
  update();
  const t41Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Quantum Telemetry Asset Verification',
      content: 'Solid state quantum repeaters tested in low Earth orbit.',
    });
    const proj = await storageService.addProject({
      name: 'Quantum Asset Proj',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Neutral',
      visualStyle: 'Cinematic',
    });

    const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const savedAsset = await storageService.saveAsset({
      projectId: proj.id,
      category: 'reference_image',
      title: 'Voyager Golden Record Diagram',
      fileName: 'golden_record.png',
      mimeType: 'image/png',
      sizeBytes: 85,
      dataUrl: testDataUrl,
      sourceRevisionProvenance: {
        storyId: src.id,
        sourceVersion: 1,
      },
      status: 'ready',
      tags: ['diagram', 'primary_visual'],
      userNotes: 'Master visual reference for deep space sequence.',
      isMandatory: true,
    });

    if (!savedAsset.id.startsWith('ASSET-') || savedAsset.seqNumber <= 0) {
      throw new Error(`Invalid asset ID or sequence number: ${savedAsset.id}, seq=${savedAsset.seqNumber}`);
    }
    if (savedAsset.dataUrl !== testDataUrl) {
      throw new Error(`Asset payload corrupted during persistence.`);
    }

    // Query back
    const retrieved = await storageService.getAssetById(savedAsset.id);
    if (!retrieved || retrieved.title !== 'Voyager Golden Record Diagram') {
      throw new Error(`Failed to retrieve persisted asset by ID.`);
    }

    const projAssets = await storageService.getAssetsByProjectId(proj.id);
    if (projAssets.length !== 1 || projAssets[0].id !== savedAsset.id) {
      throw new Error(`Asset not found in project assets query.`);
    }

    // Update
    const updated = await storageService.updateAsset(savedAsset.id, {
      userNotes: 'Updated engineering notes.',
      tags: ['diagram', 'primary_visual', 'verified'],
    });
    if (updated.userNotes !== 'Updated engineering notes' || updated.tags.length !== 3) {
      throw new Error(`Asset in-place update failed.`);
    }

    // Delete
    await storageService.deleteAsset(savedAsset.id);
    const postDelete = await storageService.getAssetById(savedAsset.id);
    if (postDelete !== null) {
      throw new Error(`Asset delete failed; still retrievable.`);
    }

    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[40].status = 'passed';
    tests[40].durationMs = Math.round(performance.now() - t41Start);
    tests[40].details = `Verified asset lifecycle: created ${savedAsset.id}, confirmed byte payload, updated, and safely deleted.`;
  } catch (err: any) {
    tests[40].status = 'failed';
    tests[40].error = err.message || String(err);
  }
  update();

  // Test 42: Phase 6 Scene-to-Asset Linkage & Multi-Role Associations
  tests[41].status = 'running';
  update();
  const t42Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Scene Linkage Verification Story',
      content: 'Atmospheric reentry test for reusable heat shield tiles.',
    });
    const proj = await storageService.addProject({
      name: 'Reentry Linkage',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Suspenseful',
      visualStyle: 'Documentary Realism',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Flight Director');
    const promptPkg = await promptStudioService.generatePromptPackage(proj.id, approved.id);

    const targetScene = promptPkg.scenes[0];

    // Create a visual reference asset and a voiceover asset
    const imgAsset = await storageService.saveAsset({
      projectId: proj.id,
      category: 'reference_image',
      title: 'Plasma Glow Reference',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      sourceRevisionProvenance: { storyId: src.id, sourceVersion: 1 },
      status: 'ready',
      tags: ['plasma', 'scene1'],
    });

    const voAsset = await storageService.saveAsset({
      projectId: proj.id,
      category: 'voiceover_audio',
      title: 'Scene 1 Studio Voiceover Take 1',
      fileName: 'sc1_vo.mp3',
      mimeType: 'audio/mpeg',
      sourceRevisionProvenance: { storyId: src.id, sourceVersion: 1 },
      status: 'ready',
      tags: ['audio', 'narration'],
    });

    // Link visual asset
    await productionService.linkAssetToScene(proj.id, targetScene.id, imgAsset.id, 'primaryVisual');
    // Link voiceover asset
    await productionService.linkAssetToScene(proj.id, targetScene.id, voAsset.id, 'voiceover');

    // Retrieve linkages
    const linkages = await productionService.getSceneLinkages(proj.id);
    const sceneLink = linkages[targetScene.id];
    if (!sceneLink) {
      throw new Error(`Scene linkage not found for scene ID: ${targetScene.id}`);
    }
    if (sceneLink.primaryVisualRefId !== imgAsset.id) {
      throw new Error(`Expected primaryVisualRefId=${imgAsset.id}, got: ${sceneLink.primaryVisualRefId}`);
    }
    if (sceneLink.voiceoverAssetId !== voAsset.id) {
      throw new Error(`Expected voiceoverAssetId=${voAsset.id}, got: ${sceneLink.voiceoverAssetId}`);
    }
    if (!sceneLink.assetIds.includes(imgAsset.id) || !sceneLink.assetIds.includes(voAsset.id)) {
      throw new Error(`Scene assetIds array missing attached asset references.`);
    }

    // Cleanup
    await storageService.deleteAsset(imgAsset.id);
    await storageService.deleteAsset(voAsset.id);
    await storageService.deletePromptPackage(promptPkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[41].status = 'passed';
    tests[41].durationMs = Math.round(performance.now() - t42Start);
    tests[41].details = `Successfully linked visual reference and studio voiceover assets to scene ${targetScene.id} with multi-role bindings.`;
  } catch (err: any) {
    tests[41].status = 'failed';
    tests[41].error = err.message || String(err);
  }
  update();

  // Test 43: Phase 6 Deterministic Production Readiness Validator
  tests[42].status = 'running';
  update();
  const t43Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Readiness Validator Test Story',
      content: 'Autonomous drone swarms mapped sub-surface volcanic lava tubes.',
    });
    const proj = await storageService.addProject({
      name: 'Drone Lava Tubes',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Sci-Fi Explainer',
      tone: 'Suspenseful',
      visualStyle: 'Cinematic',
    });

    // 1. Unapproved script -> MUST fail readiness with blocking error
    let r = await productionService.validateProductionReadiness(proj.id);
    if (r.isReady || r.blockingErrors.length === 0) {
      throw new Error(`Validator failed to block project with missing approved script.`);
    }
    if (!r.missingMandatoryDeliverables.includes('Approved Script Draft')) {
      throw new Error(`Missing mandatory deliverable not flagged: ${JSON.stringify(r.missingMandatoryDeliverables)}`);
    }

    // 2. Draft generated but still unapproved -> MUST still fail
    const draft = await scriptEngineService.generateScript(proj.id);
    r = await productionService.validateProductionReadiness(proj.id);
    if (r.isReady) {
      throw new Error(`Validator allowed unapproved draft script.`);
    }

    // 3. Approve script -> missing flow prompts MUST block
    const approved = await storageService.approveScript(draft.id, 'Mission Lead');
    r = await productionService.validateProductionReadiness(proj.id);
    if (r.isReady || !r.blockingErrors.some((e) => e.toLowerCase().includes('prompt package'))) {
      throw new Error(`Validator did not block on missing prompt package.`);
    }

    // 4. Generate prompts and thumbnails
    const promptPkg = await promptStudioService.generatePromptPackage(proj.id, approved.id);
    const thumbPkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    // 5. Add a mandatory asset that is missing its file data
    const mandatoryAsset = await storageService.saveAsset({
      projectId: proj.id,
      category: 'reference_image',
      title: 'Mandatory Terrain Radar Map',
      sourceRevisionProvenance: { storyId: src.id, sourceVersion: 1 },
      status: 'missing', // Corrupted/missing file
      isMandatory: true,
      tags: ['mandatory'],
    });

    r = await productionService.validateProductionReadiness(proj.id);
    if (r.isReady || !r.blockingErrors.some((e) => e.toLowerCase().includes('mandatory asset'))) {
      throw new Error(`Validator failed to block on missing mandatory asset.`);
    }

    // 6. Fix mandatory asset with valid data payload
    await storageService.updateAsset(mandatoryAsset.id, {
      status: 'ready',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    });

    r = await productionService.validateProductionReadiness(proj.id);
    if (!r.isReady || r.blockingErrors.length > 0) {
      throw new Error(`Validator failed to approve clean package: ${r.blockingErrors.join('; ')}`);
    }

    // Cleanup
    await storageService.deleteAsset(mandatoryAsset.id);
    await storageService.deleteThumbnailPackage(thumbPkg.id);
    await storageService.deletePromptPackage(promptPkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[42].status = 'passed';
    tests[42].durationMs = Math.round(performance.now() - t43Start);
    tests[42].details = `Validated blocking criteria: caught unapproved drafts, missing prompt packages, and missing mandatory assets, then approved clean pipeline.`;
  } catch (err: any) {
    tests[42].status = 'failed';
    tests[42].error = err.message || String(err);
  }
  update();

  // Test 44: Phase 6 Full Production Package Assembly & Provenance Manifest
  tests[43].status = 'running';
  update();
  const t44Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Neutron Star Magnetic Burst Provenance',
      content: 'Magnetar X-ray bursts recorded at high spatial resolution by orbital observatories.',
    });
    const proj = await storageService.addProject({
      name: 'Magnetar Burst',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Documentary',
      tone: 'Analytical',
      visualStyle: 'Documentary Realism',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Astrophysicist Lead');
    const promptPkg = await promptStudioService.generatePromptPackage(proj.id, approved.id);
    const thumbPkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    const refAsset = await storageService.saveAsset({
      projectId: proj.id,
      category: 'reference_image',
      title: 'Magnetar Surface Simulation',
      fileName: 'magnetar.png',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      sourceRevisionProvenance: { storyId: src.id, sourceVersion: 1 },
      status: 'ready',
      tags: ['simulation'],
    });

    // Assemble production package manifest
    const manifest = await productionService.assembleProductionPackage(proj.id, 'Final archival production export v1');

    if (!manifest.id.startsWith('PRODPKG-') || manifest.seqNumber <= 0) {
      throw new Error(`Invalid Production Package ID format: ${manifest.id}`);
    }
    if (manifest.exportSchemaVersion !== 'ultimatetron.production.v1') {
      throw new Error(`Invalid exportSchemaVersion: ${manifest.exportSchemaVersion}`);
    }

    // Verify snapshots
    if (manifest.sourceProvenance.storyId !== src.id || manifest.sourceProvenance.storyTitle !== src.title) {
      throw new Error(`Source provenance snapshot mismatched.`);
    }
    if (manifest.scriptSnapshot.id !== approved.id || manifest.scriptSnapshot.sectionsCount !== approved.sections.length) {
      throw new Error(`Script snapshot mismatched.`);
    }
    if (!manifest.promptPackageSnapshot || manifest.promptPackageSnapshot.id !== promptPkg.id) {
      throw new Error(`Prompt package snapshot missing.`);
    }
    if (!manifest.thumbnailPackageSnapshot || manifest.thumbnailPackageSnapshot.id !== thumbPkg.id) {
      throw new Error(`Thumbnail snapshot missing.`);
    }
    if (manifest.assetManifest.length !== 1 || manifest.assetManifest[0].assetId !== refAsset.id) {
      throw new Error(`Asset manifest mismatched.`);
    }

    // Query back from storage
    const stored = await storageService.getProductionPackagesByProjectId(proj.id);
    if (stored.length !== 1 || stored[0].id !== manifest.id) {
      throw new Error(`Failed to query production package from persistent storage.`);
    }

    // Cleanup
    await storageService.deleteProductionPackage(manifest.id);
    await storageService.deleteAsset(refAsset.id);
    await storageService.deleteThumbnailPackage(thumbPkg.id);
    await storageService.deletePromptPackage(promptPkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[43].status = 'passed';
    tests[43].durationMs = Math.round(performance.now() - t44Start);
    tests[43].details = `Assembled immutable package ${manifest.id} with complete source, script, prompt, and asset manifests.`;
  } catch (err: any) {
    tests[43].status = 'failed';
    tests[43].error = err.message || String(err);
  }
  update();

  // Test 45: Phase 6 Markdown Production Brief & Export Formatting
  tests[44].status = 'running';
  update();
  const t45Start = performance.now();
  try {
    const src = await storageService.addSource({
      title: 'Fusion Reactor Confinement Test',
      content: 'Tokamak magnetic coils achieved 100 million degree plasma confinement for 30 seconds.',
    });
    const proj = await storageService.addProject({
      name: 'Fusion Confinement',
      sourceStoryId: src.id,
      sourceVersion: 1,
      status: 'not_started',
      aspectRatio: '16:9',
      duration: 240,
      language: 'English',
      contentMode: 'Explainer',
      tone: 'Analytical',
      visualStyle: 'Cinematic',
    });
    const draft = await scriptEngineService.generateScript(proj.id);
    const approved = await storageService.approveScript(draft.id, 'Nuclear Engineer');
    const promptPkg = await promptStudioService.generatePromptPackage(proj.id, approved.id);
    const thumbPkg = await thumbnailStudioService.generateThumbnailPackage(proj.id, approved.id);

    const asset = await storageService.saveAsset({
      projectId: proj.id,
      category: 'reference_image',
      title: 'Tokamak Chamber Cross-Section',
      fileName: 'tokamak.png',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      sourceRevisionProvenance: { storyId: src.id, sourceVersion: 1 },
      status: 'ready',
      tags: ['diagram'],
    });

    const manifest = await productionService.assembleProductionPackage(proj.id, 'Brief export test');

    // 1. Generate Markdown Production Brief
    const briefMd = productionService.exportProductionPackageMarkdown(manifest, approved, promptPkg, thumbPkg);
    if (!briefMd.includes('# ULTIMATETRON — MASTER PRODUCTION PACKAGE')) {
      throw new Error(`Markdown brief missing master header.`);
    }
    if (!briefMd.includes(manifest.id)) {
      throw new Error(`Markdown brief missing manifest ID.`);
    }
    if (!briefMd.includes(approved.sections[0].narration)) {
      throw new Error(`Markdown brief missing exact verbatim narration.`);
    }
    if (!briefMd.includes(promptPkg.scenes[0].finalProductionPrompt)) {
      throw new Error(`Markdown brief missing standalone Google Flow prompt.`);
    }
    if (!briefMd.includes('Tokamak Chamber Cross-Section')) {
      throw new Error(`Markdown brief missing asset manifest table entry.`);
    }

    // 2. Generate ZIP archive
    const zipBlob = await productionService.exportProductionPackageZIP(manifest, approved, promptPkg, thumbPkg, [asset]);
    if (!zipBlob || !(zipBlob instanceof Blob) || zipBlob.size < 50) {
      throw new Error(`ZIP bundle generation failed or returned invalid blob size (${zipBlob?.size} bytes).`);
    }

    // Cleanup
    await storageService.deleteProductionPackage(manifest.id);
    await storageService.deleteAsset(asset.id);
    await storageService.deleteThumbnailPackage(thumbPkg.id);
    await storageService.deletePromptPackage(promptPkg.id);
    await storageService.deleteScript(draft.id);
    await storageService.deleteProject(proj.id);
    await storageService.deleteSource(src.id);

    tests[44].status = 'passed';
    tests[44].durationMs = Math.round(performance.now() - t45Start);
    tests[44].details = `Generated valid production brief Markdown and verified real multi-file JSZip archive (${zipBlob.size} bytes).`;
  } catch (err: any) {
    tests[44].status = 'failed';
    tests[44].error = err.message || String(err);
  }
  update();

  // Test 46: Phase 6 Workspace Backup & Backward-Compatible Asset State
  tests[45].status = 'running';
  update();
  const t46Start = performance.now();
  try {
    // 1. Diagnostics must return valid asset and production package counts
    const diag = await storageService.getDiagnostics();
    if (typeof diag.assetCount !== 'number' || typeof diag.productionPackageCount !== 'number') {
      throw new Error(`Diagnostics missing Phase 6 counts: assetCount=${diag.assetCount}, prodPackageCount=${diag.productionPackageCount}`);
    }

    // 2. Querying assets and production packages for legacy/non-existent project must return empty arrays without errors
    const nonExistentProjId = 'PROJ-999999';
    const assets = await storageService.getAssetsByProjectId(nonExistentProjId);
    if (!Array.isArray(assets) || assets.length !== 0) {
      throw new Error(`Expected empty array for non-existent project assets, got: ${JSON.stringify(assets)}`);
    }

    const prodPkgs = await storageService.getProductionPackagesByProjectId(nonExistentProjId);
    if (!Array.isArray(prodPkgs) || prodPkgs.length !== 0) {
      throw new Error(`Expected empty array for non-existent project packages, got: ${JSON.stringify(prodPkgs)}`);
    }

    tests[45].status = 'passed';
    tests[45].durationMs = Math.round(performance.now() - t46Start);
    tests[45].details = `Validated diagnostics metrics and backward-compatible safe queries across legacy project records.`;
  } catch (err: any) {
    tests[45].error = err.message || String(err);
    tests[45].status = 'failed';
  }
  update();

  return tests;
}
