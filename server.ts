/**
 * ULTIMATETRON — Full-Stack Server
 * Express entry point with Vite middleware in development.
 * Handles server-side @google/genai SDK calls with GEMINI_API_KEY.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server-side only
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
  });
});

// Analyze source story endpoint (Stage 3 & 4 of Pipeline)
app.post('/api/script/analyze', async (req: Request, res: Response) => {
  try {
    const { storyTitle, storyContent, language, contentMode } = req.body;
    if (!storyContent) {
      return res.status(400).json({ error: 'Source story content is required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const prompt = `You are the master analytical engine of ULTIMATETRON, a next-generation YouTube content production command center.
Analyze the following source story with strict fidelity.
Do not hallucinate facts, dates, or quotes not present in the text.

Source Title: "${storyTitle || 'Untitled'}"
Language context: ${language || 'English'}
Content Mode: ${contentMode || 'Explainer'}

Source Text:
"""
${storyContent}
"""

Extract and separate:
1. Core Topic
2. Key Entities (people, agencies, locations, objects)
3. Dates and Milestones
4. Chronological Events
5. Source-Stated Facts (verifiable from the source)
6. Allegations or Claims (unverified claims or reported assertions)
7. Interpretations / Expert Opinions
8. Unknowns or Gaps
9. Central Dramatic/Intellectual Question
10. Narrative Arc Progression`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            entities: { type: Type.ARRAY, items: { type: Type.STRING } },
            dates: { type: Type.ARRAY, items: { type: Type.STRING } },
            events: { type: Type.ARRAY, items: { type: Type.STRING } },
            sourceStatedFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            allegations: { type: Type.ARRAY, items: { type: Type.STRING } },
            interpretations: { type: Type.ARRAY, items: { type: Type.STRING } },
            unknowns: { type: Type.ARRAY, items: { type: Type.STRING } },
            centralQuestion: { type: Type.STRING },
            narrativeArc: { type: Type.STRING },
          },
          required: [
            'topic',
            'entities',
            'dates',
            'events',
            'sourceStatedFacts',
            'allegations',
            'interpretations',
            'unknowns',
            'centralQuestion',
            'narrativeArc',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Script analysis error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze source story.',
      status: err.status || 500,
    });
  }
});

// Generate Full Script endpoint (Stages 5-8 of Pipeline)
app.post('/api/script/generate', async (req: Request, res: Response) => {
  try {
    const {
      storyTitle,
      storyContent,
      aspectRatio,
      duration,
      language,
      contentMode,
      tone,
      visualStyle,
      analysis,
    } = req.body;

    if (!storyContent) {
      return res.status(400).json({ error: 'Source story content is required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const isShorts = aspectRatio === '9:16';
    const requiredSegments = isShorts ? Math.round(duration / 8) : undefined;

    let instructions = '';
    if (isShorts) {
      instructions = `Generate EXACTLY ${requiredSegments} segments for 9:16 Shorts/Reels (${duration} seconds total).
Each segment must target approximately 8 seconds of voiceover narration.
Target words per segment: ${language === 'Hindi' ? '16 to 22 words in Hindi script' : '18 to 24 words in English'}.
Segment breakdown:
- Segment 1: Hook and Central Question (0.0s - 8.0s)
${requiredSegments === 3 ? '- Segment 2: Main Story Progression (8.0s - 16.0s)\n- Segment 3: Climax & Payoff (16.0s - 24.0s)' : ''}
${requiredSegments === 4 ? '- Segment 2: Context & Development (8.0s - 16.0s)\n- Segment 3: Key Progression (16.0s - 24.0s)\n- Segment 4: Ending & Payoff (24.0s - 32.0s)' : ''}
${requiredSegments === 5 ? '- Segment 2: Setup (8.0s - 16.0s)\n- Segment 3: Main Development (16.0s - 24.0s)\n- Segment 4: Implication/Reveal (24.0s - 32.0s)\n- Segment 5: Payoff (32.0s - 40.0s)' : ''}
${requiredSegments === 6 ? '- Segment 2: Setup (8.0s - 16.0s)\n- Segment 3: Key Fact 1 (16.0s - 24.0s)\n- Segment 4: Key Fact 2 / Twist (24.0s - 32.0s)\n- Segment 5: Implication/Reveal (32.0s - 40.0s)\n- Segment 6: Payoff (40.0s - 48.0s)' : ''}`;
    } else {
      instructions = `Generate a coherent long-form video script for 16:9 Long Video. Total target duration is ${duration} seconds (minimum 240s / 4 minutes).
Organize into 5 to 8 chapter sections:
1. Opening Hook & Central Premise
2. Background & Initial Context
3. Core Technical/Event Breakdown
4. Critical Evidence & Progression
5. Repercussions & In-depth Analysis
6. Conclusion & Lasting Significance
Provide rich, engaging narration in ${language} that meets the ~${duration}s runtime (roughly ${Math.round(duration * 2.3)} words total).`;
    }

    const systemPrompt = `You are ULTIMATETRON's AI Script Engine.
Your highest law is SOURCE FIDELITY:
- Never fabricate dates, quotes, statistics, or events.
- Never present unconfirmed allegations as confirmed facts.
- Match the requested Content Mode: "${contentMode}".
- Match Tone: "${tone}".
- Target Visual Style: "${visualStyle}".
- Narration Language: ${language} (Write natural, spoken dialogue in ${language}).
${instructions}`;

    const userPrompt = `Source Story: "${storyTitle}"
Analysis Context: ${JSON.stringify(analysis || {})}

Verbatim Source Content:
"""
${storyContent}
"""

Generate the structured script JSON matching the exact schema.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  segmentNumber: { type: Type.INTEGER },
                  startTime: { type: Type.NUMBER },
                  endTime: { type: Type.NUMBER },
                  purpose: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  visualIntention: { type: Type.STRING },
                },
                required: ['segmentNumber', 'startTime', 'endTime', 'purpose', 'narration'],
              },
            },
            claimsChecked: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claimText: { type: Type.STRING },
                  sourceExcerpt: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ['claimText', 'reason', 'status'],
              },
            },
          },
          required: ['sections'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Script generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate script.',
      status: err.status || 500,
    });
  }
});

// Regenerate single section endpoint
app.post('/api/script/regenerate-section', async (req: Request, res: Response) => {
  try {
    const {
      storyTitle,
      storyContent,
      section,
      instruction,
      language,
      contentMode,
      tone,
      aspectRatio,
    } = req.body;

    if (!section || !storyContent) {
      return res.status(400).json({ error: 'Section and source content are required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const targetSecDuration = section.endTime - section.startTime;
    const prompt = `You are ULTIMATETRON's AI Script Engine. Regenerate ONLY the specified section of narration.
Preserve the exact segment duration window (${section.startTime}s to ${section.endTime}s, target: ${targetSecDuration}s).
Purpose: ${section.purpose}
Language: ${language}
Content Mode: ${contentMode}
Tone: ${tone}
${instruction ? `User Refinement Directive: "${instruction}"` : ''}

Source Story:
"""
${storyContent}
"""

Current Narration to Improve:
"${section.narration}"

Generate improved, source-grounded narration for this segment.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narration: { type: Type.STRING },
            visualIntention: { type: Type.STRING },
            purpose: { type: Type.STRING },
          },
          required: ['narration'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Section regeneration error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to regenerate section.',
      status: err.status || 500,
    });
  }
});

// ==========================================
// PHASE 4: GOOGLE FLOW PROMPT STUDIO ROUTES
// ==========================================

// Analyze approved script for continuity profile planning
app.post('/api/prompts/analyze-script', async (req: Request, res: Response) => {
  try {
    const { script, project } = req.body;
    if (!script || !script.sections) {
      return res.status(400).json({ error: 'Valid script with sections is required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const sectionsSummary = script.sections
      .map((s: any) => `[Sec ${s.segmentNumber}: ${s.purpose} (${s.startTime}s-${s.endTime}s)] Narration: "${s.narration}"`)
      .join('\n');

    const prompt = `You are ULTIMATETRON's Prompt Architect for Google Flow.
Analyze this approved script for a YouTube video in ${project.aspectRatio} format, target duration ${project.duration}s, Content Mode: "${project.contentMode}", Tone: "${project.tone}", Style: "${project.visualStyle}".

Approved Script Sections:
${sectionsSummary}

Extract continuity anchors for a Central Continuity Profile:
1. Primary Subject Identity (character/agent/focal subject, appearance, wardrobe, consistency rules)
2. Primary Environment (setting, architecture/landscape, atmosphere, lighting)
3. Camera Language (framing, focal length, movement motifs)
4. Audio & Voice Profile (music mood, sound bed, voice pacing)
5. Visual Style Details (color grading palette, texture, realism vs animation)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjectIdentity: {
              type: Type.OBJECT,
              properties: {
                primarySubjectId: { type: Type.STRING },
                appearanceDescription: { type: Type.STRING },
                wardrobeAndAccessories: { type: Type.STRING },
                identifyingCharacteristics: { type: Type.STRING },
                consistencyConstraints: { type: Type.STRING },
              },
              required: ['primarySubjectId', 'appearanceDescription', 'wardrobeAndAccessories'],
            },
            environment: {
              type: Type.OBJECT,
              properties: {
                primaryLocation: { type: Type.STRING },
                architecturalLandscapeFeatures: { type: Type.STRING },
                weatherAndAtmosphere: { type: Type.STRING },
                timePeriodAndTimeOfDay: { type: Type.STRING },
              },
              required: ['primaryLocation', 'architecturalLandscapeFeatures', 'weatherAndAtmosphere'],
            },
            cameraLanguage: {
              type: Type.OBJECT,
              properties: {
                preferredFraming: { type: Type.STRING },
                cameraMovementConventions: { type: Type.STRING },
                lensAndDepthOfField: { type: Type.STRING },
                pacingAndTransitions: { type: Type.STRING },
              },
              required: ['preferredFraming', 'cameraMovementConventions'],
            },
            audioProfile: {
              type: Type.OBJECT,
              properties: {
                musicMood: { type: Type.STRING },
                energyCurve: { type: Type.STRING },
                ambientSoundBed: { type: Type.STRING },
                soundEffectsStrategy: { type: Type.STRING },
                audioTransitionStyle: { type: Type.STRING },
              },
              required: ['musicMood', 'ambientSoundBed'],
            },
            colorGrading: { type: Type.STRING },
            contrastAndLighting: { type: Type.STRING },
          },
          required: ['subjectIdentity', 'environment', 'cameraLanguage', 'audioProfile'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Prompt script analysis error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze script for continuity profile.',
      status: err.status || 500,
    });
  }
});

// Generate complete structured scene prompts
app.post('/api/prompts/generate', async (req: Request, res: Response) => {
  try {
    const { script, project, continuityProfile } = req.body;
    if (!script || !script.sections || !project) {
      return res.status(400).json({ error: 'Script and project are required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const isShorts = project.aspectRatio === '9:16';
    const totalScenes = script.sections.length;

    const sectionsData = script.sections.map((s: any, idx: number) => ({
      sceneNumber: idx + 1,
      totalScenes,
      sectionId: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.endTime - s.startTime,
      purpose: s.purpose,
      exactNarration: s.narration,
      visualIntention: s.visualIntention || '',
    }));

    const systemPrompt = `You are ULTIMATETRON's Master Google Flow Prompt Generation Engine.
Generate complete, self-contained video generation scene prompts adhering to the Complete Google Flow Prompt Schema.
Every scene prompt must be standalone and ready to execute in Google Flow.
Preserve exact narration text byte-for-byte in the narration section.
Apply Content Mode "${project.contentMode}", Visual Style "${project.visualStyle}", and Tone "${project.tone}".

Continuity Profile Anchors:
- Subject: ${continuityProfile?.subjectIdentity?.appearanceDescription || 'Consistent documentary subject'}
- Environment: ${continuityProfile?.environment?.primaryLocation || 'Authentic setting'}
- Camera: ${continuityProfile?.cameraLanguage?.preferredFraming || 'Cinematic standard'}
- Lighting & Color: ${continuityProfile?.visualIdentity?.contrastAndLighting || 'High-contrast volumetric illumination'}, Palette: ${continuityProfile?.visualIdentity?.colorGrading || 'Rich deep tones'}
- Negative Restrictions: No gibberish text overlays, no random logos, no mutated anatomy, no sudden color shifts.`;

    const userPrompt = `Project: "${project.name}" (${project.aspectRatio}, ${project.duration}s total)
Total Scenes to Generate: ${totalScenes}

Sections to convert into scene prompts:
${JSON.stringify(sectionsData, null, 2)}

Generate a structured prompt for each scene with all schema sections (objective, subject/environment, action/motion, camera direction, lighting/color, narration/audio, transitions, constraints, and finalProductionPrompt).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  scriptSectionId: { type: Type.STRING },
                  startTime: { type: Type.NUMBER },
                  endTime: { type: Type.NUMBER },
                  targetDurationSec: { type: Type.NUMBER },
                  sceneObjective: {
                    type: Type.OBJECT,
                    properties: {
                      purpose: { type: Type.STRING },
                      mainVisualIdea: { type: Type.STRING },
                      intendedViewerEffect: { type: Type.STRING },
                      connectionToNarration: { type: Type.STRING },
                    },
                    required: ['purpose', 'mainVisualIdea', 'intendedViewerEffect'],
                  },
                  subjectAndEnvironment: {
                    type: Type.OBJECT,
                    properties: {
                      mainSubject: { type: Type.STRING },
                      appearanceAndWardrobe: { type: Type.STRING },
                      settingAndBackground: { type: Type.STRING },
                      timeOfDay: { type: Type.STRING },
                      keyObjects: { type: Type.STRING },
                      screenComposition: { type: Type.STRING },
                    },
                    required: ['mainSubject', 'settingAndBackground', 'screenComposition'],
                  },
                  actionAndMotion: {
                    type: Type.OBJECT,
                    properties: {
                      actionDescription: { type: Type.STRING },
                      subjectMovement: { type: Type.STRING },
                      environmentalMovement: { type: Type.STRING },
                      foregroundBackgroundMotion: { type: Type.STRING },
                    },
                    required: ['actionDescription', 'subjectMovement'],
                  },
                  cameraDirection: {
                    type: Type.OBJECT,
                    properties: {
                      shotTypeAndFraming: { type: Type.STRING },
                      cameraAngle: { type: Type.STRING },
                      cameraMovement: { type: Type.STRING },
                      lensOrDepthOfField: { type: Type.STRING },
                      focusBehavior: { type: Type.STRING },
                      visualHierarchy: { type: Type.STRING },
                    },
                    required: ['shotTypeAndFraming', 'cameraAngle', 'cameraMovement'],
                  },
                  lightingAndColor: {
                    type: Type.OBJECT,
                    properties: {
                      lightSourceAndDirection: { type: Type.STRING },
                      contrastAndShadow: { type: Type.STRING },
                      colorPalette: { type: Type.STRING },
                      selectedStyleNotes: { type: Type.STRING },
                      adjacentSceneContinuity: { type: Type.STRING },
                    },
                    required: ['lightSourceAndDirection', 'contrastAndShadow', 'colorPalette'],
                  },
                  transitionsAndContinuity: {
                    type: Type.OBJECT,
                    properties: {
                      openingVisualState: { type: Type.STRING },
                      endingVisualState: { type: Type.STRING },
                      incomingTransition: { type: Type.STRING },
                      outgoingTransition: { type: Type.STRING },
                      matchCutOrBridge: { type: Type.STRING },
                    },
                    required: ['openingVisualState', 'endingVisualState'],
                  },
                  constraints: {
                    type: Type.OBJECT,
                    properties: {
                      negativeRestrictions: { type: Type.STRING },
                    },
                    required: ['negativeRestrictions'],
                  },
                  finalProductionPrompt: { type: Type.STRING },
                },
                required: [
                  'sceneNumber',
                  'scriptSectionId',
                  'startTime',
                  'endTime',
                  'sceneObjective',
                  'subjectAndEnvironment',
                  'actionAndMotion',
                  'cameraDirection',
                  'lightingAndColor',
                  'finalProductionPrompt',
                ],
              },
            },
          },
          required: ['scenes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Prompt generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate scene prompts.',
      status: err.status || 500,
    });
  }
});

// Regenerate single scene prompt
app.post('/api/prompts/regenerate-scene', async (req: Request, res: Response) => {
  try {
    const { scene, scriptSection, project, continuityProfile, instruction } = req.body;
    if (!scene || !scriptSection || !project) {
      return res.status(400).json({ error: 'Scene, script section, and project are required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const prompt = `You are ULTIMATETRON's Master Google Flow Prompt Generation Engine.
Regenerate ONLY Scene ${scene.segmentNumber} (Duration: ${scene.targetDuration}s, [${scene.startTime}s - ${scene.endTime}s]).
Aspect Ratio: ${project.aspectRatio}. Mode: "${project.contentMode}". Style: "${project.visualStyle}". Tone: "${project.tone}".
Exact Approved Narration (Must preserve byte-for-byte in narration field):
"${scriptSection.narration}"

User Refinement Directive:
"${instruction || 'Refine visual detail, camera movement clarity, and atmospheric tension.'}"

Current Prompt to Improve:
"${scene.finalProductionPrompt}"

Generate improved, self-contained scene prompt and structured components.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneObjective: {
              type: Type.OBJECT,
              properties: {
                purpose: { type: Type.STRING },
                mainVisualIdea: { type: Type.STRING },
                intendedViewerEffect: { type: Type.STRING },
                connectionToNarration: { type: Type.STRING },
              },
              required: ['purpose', 'mainVisualIdea'],
            },
            subjectAndEnvironment: {
              type: Type.OBJECT,
              properties: {
                mainSubject: { type: Type.STRING },
                appearanceAndWardrobe: { type: Type.STRING },
                settingAndBackground: { type: Type.STRING },
                timeOfDay: { type: Type.STRING },
                keyObjects: { type: Type.STRING },
                screenComposition: { type: Type.STRING },
              },
              required: ['mainSubject', 'settingAndBackground'],
            },
            actionAndMotion: {
              type: Type.OBJECT,
              properties: {
                actionDescription: { type: Type.STRING },
                subjectMovement: { type: Type.STRING },
                environmentalMovement: { type: Type.STRING },
                foregroundBackgroundMotion: { type: Type.STRING },
              },
              required: ['actionDescription'],
            },
            cameraDirection: {
              type: Type.OBJECT,
              properties: {
                shotTypeAndFraming: { type: Type.STRING },
                cameraAngle: { type: Type.STRING },
                cameraMovement: { type: Type.STRING },
                lensOrDepthOfField: { type: Type.STRING },
                focusBehavior: { type: Type.STRING },
                visualHierarchy: { type: Type.STRING },
              },
              required: ['shotTypeAndFraming', 'cameraMovement'],
            },
            lightingAndColor: {
              type: Type.OBJECT,
              properties: {
                lightSourceAndDirection: { type: Type.STRING },
                contrastAndShadow: { type: Type.STRING },
                colorPalette: { type: Type.STRING },
                selectedStyleNotes: { type: Type.STRING },
                adjacentSceneContinuity: { type: Type.STRING },
              },
              required: ['lightSourceAndDirection', 'colorPalette'],
            },
            finalProductionPrompt: { type: Type.STRING },
          },
          required: ['sceneObjective', 'actionAndMotion', 'cameraDirection', 'finalProductionPrompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Scene prompt regeneration error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to regenerate scene prompt.',
      status: err.status || 500,
    });
  }
});

// ==========================================
// PHASE 5: THUMBNAIL STUDIO ROUTES
// ==========================================

// Analyze approved script & story for thumbnail context
app.post('/api/thumbnail/analyze-context', async (req: Request, res: Response) => {
  try {
    const { storyTitle, storyContent, script, project } = req.body;
    if (!script || !storyContent) {
      return res.status(400).json({ error: 'Script and story content are required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const narrationSummary = (script.sections || [])
      .map((s: any) => `[${s.purpose}] ${s.narration}`)
      .join('\n');

    const prompt = `You are ULTIMATETRON's Master Thumbnail Context Analyst.
Analyze this approved YouTube script and source material to extract thumbnail visual hooks and narrative tensions.
Strict Source Fidelity applies: do NOT invent facts or details contradicting the source.

Project: "${project?.name || 'Untitled'}" (${project?.aspectRatio || '16:9'}, Mode: "${project?.contentMode || 'Explainer'}", Tone: "${project?.tone || 'Suspenseful'}", Style: "${project?.visualStyle || 'Cinematic'}")
Story Title: "${storyTitle || 'Untitled'}"

Source Story:
"""
${storyContent}
"""

Approved Narration Flow:
"""
${narrationSummary}
"""

Extract structured thumbnail context:
1. mainSubject: The central visual focal point (person, vehicle, spacecraft, artifact, creature, or phenomenon).
2. centralConflict: The core tension, mystery, stakes, or curiosity question.
3. strongestVisualMoment: The single most cinematic, striking, or high-impact visual scene.
4. emotionalTone: The emotional frequency (awe, dread, urgency, intense discovery, revelation).
5. importantEnvironment: Primary setting, backdrop, or atmosphere.
6. mainCuriosityHook: The irresistible curiosity gap for YouTube click-through rate without misleading clickbait.
7. spoilerWarnings: Any story twists or revelations that must NOT be spoiled on the thumbnail.
8. keyEntities: Key names, locations, objects.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainSubject: { type: Type.STRING },
            centralConflict: { type: Type.STRING },
            strongestVisualMoment: { type: Type.STRING },
            emotionalTone: { type: Type.STRING },
            importantEnvironment: { type: Type.STRING },
            mainCuriosityHook: { type: Type.STRING },
            spoilerWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'mainSubject',
            'centralConflict',
            'strongestVisualMoment',
            'emotionalTone',
            'importantEnvironment',
            'mainCuriosityHook',
            'spoilerWarnings',
            'keyEntities',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail context analysis error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze thumbnail context.',
      status: err.status || 500,
    });
  }
});

// Generate three distinct thumbnail concepts
app.post('/api/thumbnail/generate-concepts', async (req: Request, res: Response) => {
  try {
    const { scriptContext, config, project, script } = req.body;
    if (!scriptContext || !config || !project) {
      return res.status(400).json({ error: 'scriptContext, config, and project are required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const systemPrompt = `You are ULTIMATETRON's Master YouTube Thumbnail Concept & Prompt Engineering Engine.
Your mission is to generate EXACTLY THREE distinct, high-CTR, production-grade thumbnail concepts for the approved video project.
Every concept MUST follow a fundamentally different creative strategy:
- Concept A: High-Curiosity Cinematic Composition (wide cinematic tension, rule-of-thirds composition, visual contrast, intriguing curiosity gap).
- Concept B: Emotion-Driven Character / Subject Close-Up (visceral human or entity reaction, macro focal depth, intense gaze or lighting, personal stakes).
- Concept C: Dramatic Environmental Storytelling (epic scale, environmental confrontation, atmosphere, worldbuilding mystery).

Strict Rules:
1. Grounded in Approved Story: Never invent characters, events, or facts not supported by the script context.
2. Self-Contained Prompts: The selfContainedPrompt for each concept must be fully standalone for high-end text-to-image models (Midjourney, Imagen 3, FLUX), detailing subject, pose, framing, lighting, volumetric atmosphere, color palette, texture, lens, and 8k rendering style.
3. Negative Prompts: Detailed list of unwanted artifacts (e.g. blurry details, distorted hands, gibberish text, mutated faces, extra limbs, low resolution, bad anatomy, flat lighting).
4. Aspect Ratio: ${config.aspectRatio || '16:9'} format.
5. Inferred Elements: Clearly list any creative artistic interpretations in inferredCreativeElements.
6. Safe Margins: Include mobile safe margins (leave timestamp corner free, ensure focal center is visible on small smartphone feeds).`;

    const userPrompt = `Project: "${project.name}" (Aspect Ratio: ${config.aspectRatio}, Style: "${config.visualStyle}", Intensity: "${config.creativeIntensity}")
Thumbnail Config:
- Subject Placement: ${config.subjectPlacement}
- Facial Expression / Emotion: ${config.facialExpression}
- Camera Framing: ${config.cameraFraming}
- Background Complexity: ${config.backgroundComplexity}
- Lighting: ${config.lightingDirection}
- Color Palette: ${config.colorPalette}
- Typography Style: ${config.typographyStyle}
- Text Placement: ${config.textPlacement}
- Custom Headline: "${config.headlineText || scriptContext.mainCuriosityHook || ''}"

Script Context:
- Main Subject: ${scriptContext.mainSubject}
- Central Conflict: ${scriptContext.centralConflict}
- Strongest Visual Moment: ${scriptContext.strongestVisualMoment}
- Emotional Tone: ${scriptContext.emotionalTone}
- Setting / Environment: ${scriptContext.importantEnvironment}
- Curiosity Hook: ${scriptContext.mainCuriosityHook}
- Spoiler Restrictions: ${JSON.stringify(scriptContext.spoilerWarnings || [])}

Generate 3 complete concept objects: concept_a, concept_b, concept_c adhering to the JSON schema.`;

    const conceptProperties = {
      title: { type: Type.STRING },
      creativeDirection: { type: Type.STRING },
      creativeRationale: { type: Type.STRING },
      primarySubject: { type: Type.STRING },
      facialExpressionDirection: { type: Type.STRING },
      compositionAndFocalPoint: { type: Type.STRING },
      backgroundAndEnvironment: { type: Type.STRING },
      foregroundBackgroundSeparation: { type: Type.STRING },
      colorPaletteAndContrast: { type: Type.STRING },
      lightingAndAtmosphere: { type: Type.STRING },
      thumbnailTextSuggestion: { type: Type.STRING },
      typographyHierarchyAndPlacement: { type: Type.STRING },
      safeMarginsAndMobileReadability: { type: Type.STRING },
      selfContainedPrompt: { type: Type.STRING },
      negativePrompt: { type: Type.STRING },
      inferredCreativeElements: { type: Type.ARRAY, items: { type: Type.STRING } },
    };

    const requiredConceptProps = [
      'title',
      'creativeDirection',
      'creativeRationale',
      'primarySubject',
      'facialExpressionDirection',
      'compositionAndFocalPoint',
      'backgroundAndEnvironment',
      'foregroundBackgroundSeparation',
      'colorPaletteAndContrast',
      'lightingAndAtmosphere',
      'thumbnailTextSuggestion',
      'typographyHierarchyAndPlacement',
      'safeMarginsAndMobileReadability',
      'selfContainedPrompt',
      'negativePrompt',
      'inferredCreativeElements',
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept_a: { type: Type.OBJECT, properties: conceptProperties, required: requiredConceptProps },
            concept_b: { type: Type.OBJECT, properties: conceptProperties, required: requiredConceptProps },
            concept_c: { type: Type.OBJECT, properties: conceptProperties, required: requiredConceptProps },
          },
          required: ['concept_a', 'concept_b', 'concept_c'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail concepts generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate thumbnail concepts.',
      status: err.status || 500,
    });
  }
});

// Regenerate single thumbnail concept with directive
app.post('/api/thumbnail/regenerate-concept', async (req: Request, res: Response) => {
  try {
    const { conceptId, currentConcept, config, project, scriptContext, instruction } = req.body;
    if (!conceptId || !currentConcept || !config || !project) {
      return res.status(400).json({ error: 'conceptId, currentConcept, config, and project are required.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
      });
    }

    const prompt = `You are ULTIMATETRON's Thumbnail Engine. Regenerate ONLY ${conceptId.toUpperCase()} for "${project.name}".
Aspect Ratio: ${config.aspectRatio || '16:9'}. Visual Style: "${config.visualStyle}". Intensity: "${config.creativeIntensity}".
Creative Direction: "${currentConcept.creativeDirection}"
Current Concept Title: "${currentConcept.title}"

Current Prompt to Refine:
"${currentConcept.selfContainedPrompt}"

User Refinement Directive:
"${instruction || 'Elevate visual contrast, cinematic lighting depth, and immediate mobile-feed curiosity hook.'}"

Script Context:
- Subject: ${scriptContext?.mainSubject || currentConcept.primarySubject}
- Setting: ${scriptContext?.importantEnvironment || currentConcept.backgroundAndEnvironment}
- Hook: ${scriptContext?.mainCuriosityHook || currentConcept.thumbnailTextSuggestion}

Regenerate this specific concept adhering to all schema fields.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            creativeDirection: { type: Type.STRING },
            creativeRationale: { type: Type.STRING },
            primarySubject: { type: Type.STRING },
            facialExpressionDirection: { type: Type.STRING },
            compositionAndFocalPoint: { type: Type.STRING },
            backgroundAndEnvironment: { type: Type.STRING },
            foregroundBackgroundSeparation: { type: Type.STRING },
            colorPaletteAndContrast: { type: Type.STRING },
            lightingAndAtmosphere: { type: Type.STRING },
            thumbnailTextSuggestion: { type: Type.STRING },
            typographyHierarchyAndPlacement: { type: Type.STRING },
            safeMarginsAndMobileReadability: { type: Type.STRING },
            selfContainedPrompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
            inferredCreativeElements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'title',
            'creativeDirection',
            'creativeRationale',
            'primarySubject',
            'compositionAndFocalPoint',
            'backgroundAndEnvironment',
            'selfContainedPrompt',
            'negativePrompt',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Thumbnail concept regeneration error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to regenerate thumbnail concept.',
      status: err.status || 500,
    });
  }
});

// Optional Image Generation via Imagen 3 (when available)
app.post('/api/thumbnail/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, negativePrompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for image generation.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API is unconfigured on server. Please ensure GEMINI_API_KEY is available in environment secrets.',
        status: 'unavailable',
      });
    }

    // Attempt generateImages with imagen-3.0-generate-002
    try {
      const imgResponse = await aiClient.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
          outputMimeType: 'image/jpeg',
        },
      });

      const base64Bytes = imgResponse.generatedImages?.[0]?.image?.imageBytes;
      if (!base64Bytes) {
        throw new Error('No image bytes returned by Imagen model.');
      }

      const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;
      return res.json({
        imageUrl,
        status: 'generated',
        model: 'imagen-3.0-generate-002',
      });
    } catch (genErr: any) {
      console.warn('Imagen generation call failed or model unavailable:', genErr.message);
      return res.status(502).json({
        error: `Image generation API error: ${genErr.message || 'Model unavailable or quota exceeded'}`,
        status: 'failed',
      });
    }
  } catch (err: any) {
    console.error('Image generation route error:', err);
    return res.status(500).json({
      error: err.message || 'Internal error during image generation.',
      status: 'failed',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ULTIMATETRON Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
