import { GoogleGenAI, Type } from '@google/genai';
import {
  AnalyzedFile,
  ArchitectureSummary,
  ExecutionFlowItem,
  GeminiModelOption,
  MindMapData,
  RepoMetadata,
} from '../src/types/index.js';

export interface FileAnalysisInput {
  path: string;
  content: string;
  role: string;
  staticFunctions: { name: string; signature?: string }[];
  imports: string[];
}

export const AVAILABLE_GEMINI_MODELS: GeminiModelOption[] = [
  // Gemini 4 Series (Flagship & Reasoning)
  {
    id: 'gemini-4-hydrogen',
    displayName: 'Gemini 4 Hydrogen',
    category: 'Gemini 4 Series (Flagship)',
    description: 'High-speed flagship multimodal model for general text, code, and structured synthesis.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    isRecommended: true,
    source: 'catalog',
  },
  {
    id: 'gemini-4-argon',
    displayName: 'Gemini 4 Argon',
    category: 'Gemini 4 Series (Flagship)',
    description: 'Advanced coding, software architecture synthesis, math, and complex STEM reasoning.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    isRecommended: true,
    source: 'catalog',
  },
  {
    id: 'gemini-4-carbon',
    displayName: 'Gemini 4 Carbon',
    category: 'Gemini 4 Series (Flagship)',
    description: 'Maximum reasoning depth for root-cause debugging, architectural design, and security auditing.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },

  // Gemini 3 Series (Text, Code & High-Throughput)
  {
    id: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Default high-speed model optimized for repository architecture analysis and low-latency Q&A.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    isRecommended: true,
    source: 'catalog',
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Ultra-fast, lightweight model ideal for rapid repository scanning and high-throughput queries.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.1-pro-preview',
    displayName: 'Gemini 3.1 Pro Preview',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Pro-grade reasoning model for deep codebase inspection and multi-file dependency synthesis.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro Preview',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'High-precision reasoning model for complex software engineering and architectural tasks.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash Preview',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Fast multimodal and code comprehension model with low latency.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },

  // Gemini 2.5 Series
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    category: 'Gemini 2.5 Series',
    description: 'Long-context reasoning model for large multi-module codebases and technical documentation.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    category: 'Gemini 2.5 Series',
    description: 'Balanced speed and structured JSON generation for repository analysis.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    category: 'Gemini 2.5 Series',
    description: 'Cost-efficient lightweight model for fast text and code summarization.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'streamGenerateContent'],
    source: 'catalog',
  },

  // Live, Audio & Speech Models
  {
    id: 'gemini-3.8-live',
    displayName: 'Gemini 3.8 Live',
    category: 'Live, Audio & Speech Models',
    description: 'Real-time low-latency audio and video conversation model via the Gemini Live API.',
    supportedActions: ['bidiGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.8-live-extended-thinking',
    displayName: 'Gemini 3.8 Live Extended Thinking',
    category: 'Live, Audio & Speech Models',
    description: 'Real-time voice conversation model with extended reasoning and multi-step tool use.',
    supportedActions: ['bidiGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.5-transcribe',
    displayName: 'Gemini 3.5 Transcribe',
    category: 'Live, Audio & Speech Models',
    description: 'Dedicated audio transcription model for pre-recorded or static audio.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.5-transcribe-live',
    displayName: 'Gemini 3.5 Transcribe Live',
    category: 'Live, Audio & Speech Models',
    description: 'Real-time streaming speech-to-text transcription via the Live API.',
    supportedActions: ['bidiGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.5-live-translate-preview',
    displayName: 'Gemini 3.5 Live Translate Preview',
    category: 'Live, Audio & Speech Models',
    description: 'Real-time bidirectional speech-to-speech translation model.',
    supportedActions: ['bidiGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.8-flash-lite-tts',
    displayName: 'Gemini 3.8 Flash Lite TTS',
    category: 'Live, Audio & Speech Models',
    description: 'High-throughput single-speaker text-to-speech generation model.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.8-flash-tts',
    displayName: 'Gemini 3.8 Flash TTS',
    category: 'Live, Audio & Speech Models',
    description: 'Expressive multi-speaker text-to-speech and custom voice design model.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },

  // Multimodal, Image, Video & Music Models
  {
    id: 'gemini-omni-1.2-flash',
    displayName: 'Gemini Omni 1.2 Flash',
    category: 'Image, Video & Music Models',
    description: 'Omni multimodal model for video generation, editing, and extension via Interactions API.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    displayName: 'Gemini 3.1 Flash Lite Image (Nano Banana)',
    category: 'Image, Video & Music Models',
    description: 'Fast image generation and editing model.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-nano-banana-2.1',
    displayName: 'Gemini Nano Banana 2.1',
    category: 'Image, Video & Music Models',
    description: 'High-resolution image generation and editing model (1K, 2K, 4K).',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3-pro-image',
    displayName: 'Gemini 3 Pro Image (Nano Banana Pro)',
    category: 'Image, Video & Music Models',
    description: 'Professional-grade image generation and visual synthesis model.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'lyria-3-clip-preview',
    displayName: 'Lyria 3 Clip Preview',
    category: 'Image, Video & Music Models',
    description: 'Short 30-second music clip generation model.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },
  {
    id: 'lyria-3-pro-preview',
    displayName: 'Lyria 3 Pro Preview',
    category: 'Image, Video & Music Models',
    description: 'Full-length studio music composition and generation model.',
    supportedActions: ['generateContent'],
    source: 'catalog',
  },

  // Embeddings Models
  {
    id: 'gemini-embedding-2',
    displayName: 'Gemini Embedding 2',
    category: 'Embedding Models',
    description: 'High-dimensional text, code, and multimodal embedding model for semantic retrieval.',
    supportedActions: ['embedContent'],
    source: 'catalog',
  },
];

const DEPRECATED_MODEL_PATTERNS = [
  /^gemini-1\.0/i,
  /^gemini-1\.5/i,
  /^gemini-2\.0/i,
  /^gemini-pro$/i,
  /^gemini-pro-vision$/i,
];

export function isDeprecatedModel(modelId: string): boolean {
  const clean = modelId.replace(/^models\//, '').trim();
  return DEPRECATED_MODEL_PATTERNS.some(regex => regex.test(clean));
}

export function sanitizeModelName(rawModel?: string): string {
  const fallback = 'gemini-3.8-flash';
  if (!rawModel || typeof rawModel !== 'string') {
    return fallback;
  }
  let cleaned = rawModel.trim();
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  cleaned = cleaned.replace(/^models\//, '').trim();

  // If someone passed an API key or token (starts with AQ., AIza, contains underscores, etc.)
  if (
    cleaned.startsWith('AQ.') ||
    cleaned.startsWith('AIza') ||
    cleaned.includes('_') ||
    !(/^(gemini|lyria)-/i.test(cleaned)) ||
    isDeprecatedModel(cleaned)
  ) {
    console.warn(
      `[GeminiService] Invalid or unrecognized GEMINI_MODEL provided (redacted). Defaulting to standard model "${fallback}".`
    );
    return fallback;
  }

  // Model name should conform to valid Gemini / Lyria model identifiers
  if (!/^(gemini|lyria)-[a-z0-9\.\-]+$/i.test(cleaned)) {
    console.warn(
      `[GeminiService] GEMINI_MODEL has invalid format (redacted). Defaulting to standard model "${fallback}".`
    );
    return fallback;
  }

  return cleaned;
}

export class GeminiService {
  private defaultAi?: GoogleGenAI;
  private defaultModel: string;

  constructor() {
    this.defaultModel = sanitizeModelName(process.env.GEMINI_MODEL);
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.defaultAi = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } else {
      console.warn('[CodeAtlas AI] GEMINI_API_KEY not detected in environment. Using static intelligent fallback unless provided in request.');
    }
  }

  public getModel(): string {
    return this.defaultModel;
  }

  public async listAvailableModels(apiKeyOverride?: string): Promise<GeminiModelOption[]> {
    const modelMap = new Map<string, GeminiModelOption>();
    for (const item of AVAILABLE_GEMINI_MODELS) {
      modelMap.set(item.id, { ...item });
    }

    const client = this.getClient(apiKeyOverride);
    if (!client) {
      return Array.from(modelMap.values());
    }

    try {
      const pager = await client.models.list({ config: { pageSize: 100 } });
      const categorizeId = (id: string): string => {
        if (id.startsWith('gemini-4')) return 'Gemini 4 Series (Flagship)';
        if (id.startsWith('gemini-3')) {
          if (id.includes('live') || id.includes('tts') || id.includes('transcribe')) {
            return 'Live, Audio & Speech Models';
          }
          if (id.includes('image') || id.includes('banana')) {
            return 'Image, Video & Music Models';
          }
          return 'Gemini 3 Series (Text & Code)';
        }
        if (id.startsWith('gemini-2.5')) return 'Gemini 2.5 Series';
        if (id.includes('embedding')) return 'Embedding Models';
        if (id.includes('lyria') || id.includes('omni') || id.includes('image') || id.includes('veo') || id.includes('imagen')) {
          return 'Image, Video & Music Models';
        }
        return 'Additional API Models';
      };

      for await (const rawModel of pager) {
        const rawName = rawModel?.name || '';
        const id = rawName.replace(/^models\//, '').trim();
        if (!id || isDeprecatedModel(id)) continue;
        if (!/^(gemini|lyria)-[a-z0-9\.\-]+$/i.test(id)) continue;

        const existing = modelMap.get(id);
        if (existing) {
          modelMap.set(id, {
            ...existing,
            displayName: rawModel.displayName || existing.displayName,
            description: rawModel.description || existing.description,
            inputTokenLimit: rawModel.inputTokenLimit ?? existing.inputTokenLimit,
            outputTokenLimit: rawModel.outputTokenLimit ?? existing.outputTokenLimit,
            supportedActions: rawModel.supportedActions?.length
              ? rawModel.supportedActions
              : existing.supportedActions,
            source: 'api',
          });
        } else {
          modelMap.set(id, {
            id,
            displayName: rawModel.displayName || id,
            category: categorizeId(id),
            description: rawModel.description || `Live Gemini API model (${id}).`,
            inputTokenLimit: rawModel.inputTokenLimit,
            outputTokenLimit: rawModel.outputTokenLimit,
            supportedActions: rawModel.supportedActions,
            source: 'api',
          });
        }
      }
    } catch (err) {
      console.warn('[GeminiService] Could not fetch dynamic model list from API, returning full catalog:', err);
    }

    return Array.from(modelMap.values());
  }

  private getClient(apiKeyOverride?: string): GoogleGenAI | undefined {
    if (apiKeyOverride && typeof apiKeyOverride === 'string' && apiKeyOverride.trim().length > 10) {
      return new GoogleGenAI({
        apiKey: apiKeyOverride.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.defaultAi;
  }

  private async executeGenerateContent(
    client: GoogleGenAI,
    modelName: string,
    params: { contents: string; config?: any }
  ) {
    const primary = sanitizeModelName(modelName);
    const candidates = [primary];
    if (primary !== 'gemini-3.1-flash-lite') {
      candidates.push('gemini-3.1-flash-lite');
    }

    let lastError: any = null;
    for (const model of candidates) {
      try {
        return await client.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isRetryable =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('404') ||
          msg.includes('INVALID_ARGUMENT');
        if (isRetryable && model !== candidates[candidates.length - 1]) {
          console.warn(
            `[GeminiService] Model "${model}" failed (${msg}). Retrying with candidate "${candidates[1]}"...`
          );
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  public async analyzeCodebase(
    repoName: string,
    files: FileAnalysisInput[],
    options?: { apiKey?: string; model?: string }
  ): Promise<{
    fileExplanations: Record<string, Partial<AnalyzedFile>>;
    mindMap: MindMapData;
    executionFlows: ExecutionFlowItem[];
    architectureSummary: ArchitectureSummary;
  }> {
    const client = this.getClient(options?.apiKey);
    if (!client) {
      return this.generateFallbackAnalysis(repoName, files);
    }

    const targetModel = options?.model ? sanitizeModelName(options.model) : this.defaultModel;

    try {
      const filesSummary = files
        .map(
          f => `
--- File: ${f.path} (${f.role}) ---
Discovered Symbols: ${f.staticFunctions.map(s => s.name).join(', ') || 'None'}
Imports: ${f.imports.join(', ') || 'None'}
Code Preview:
${f.content.slice(0, 2200)}
`
        )
        .join('\n\n');

      const prompt = `You are a Principal Software Architect analyzing the repository "${repoName}".
Analyze the following source files and produce a comprehensive, structured architectural blueprint as a JSON object.

Input files:
${filesSummary}

Requirements for JSON output:
1. "fileExplanations": An object keyed by file path. For each file, provide:
   - "purpose": A concise, accurate description (1-2 sentences) of what this file does.
   - "responsibilities": 2 to 4 concrete, actionable responsibilities verified by code inspection.
   - "keyFunctions": Array of { "name": string, "purpose": string }.
   - "inputOutput": { "input": string, "output": string } describing what inputs it accepts and what it returns or outputs.

2. "mindMap": Structured graph containing:
   - "nodes": Array of { "id": string, "label": string, "type": "repo" | "folder" | "file" | "function" | "entry", "path"?: string, "role"?: string, "description"?: string }.
     - Level 0: The root repository node.
     - Level 1: Major functional domains or directories.
     - Level 2: Core source files.
     - Level 3: Key critical functions/methods.
   - "edges": Array of { "id": string, "source": string, "target": string, "relation": "contains" | "imports" | "calls" | "inferred", "label"?: string }.

3. "executionFlows": Array of 2 to 3 distinct execution flows (e.g. "Application Boot & Initialization", "Primary Request Processing", "State / Data Flow"):
   - "id": string
   - "title": string
   - "description": string
   - "mermaidSyntax": A valid Mermaid syntax diagram (e.g. "sequenceDiagram\\n  autonumber\\n  Client->>Server: Request...")
   - "isPartialOrInferred": boolean (true if extrapolated from static analysis)
   - "steps": Array of { "step": number, "actor": string, "action": string, "target": string, "fileReference"?: string }

4. "architectureSummary":
   - "overview": High-level architectural explanation of how the system is organized.
   - "keyPatterns": Array of architectural design patterns detected in the code (e.g. MVC, Middleware Pipeline, Repository Pattern, Event-driven, etc.).
   - "mermaidArchitecture": Valid Mermaid graph (e.g. "graph TD\\n  Client[Client / Consumer] --> Entry[Entrypoint]...")
   - "layerBreakdown": Array of { "layer": string, "description": string, "files": string[] }.

Strict instructions:
- Only reference files, functions, and imports that exist in the input. Do not hallucinate files.
- Ensure all Mermaid diagrams are syntax-error free.
- Output valid JSON strictly conforming to the requested schema.`;

      const response = await this.executeGenerateContent(client, targetModel, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fileExplanations: {
                type: Type.OBJECT,
                description: 'Map of file paths to explanation details',
              },
              mindMap: {
                type: Type.OBJECT,
                properties: {
                  nodes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        type: { type: Type.STRING },
                        path: { type: Type.STRING },
                        role: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['id', 'label', 'type'],
                    },
                  },
                  edges: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        source: { type: Type.STRING },
                        target: { type: Type.STRING },
                        relation: { type: Type.STRING },
                        label: { type: Type.STRING },
                      },
                      required: ['id', 'source', 'target', 'relation'],
                    },
                  },
                },
                required: ['nodes', 'edges'],
              },
              executionFlows: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    mermaidSyntax: { type: Type.STRING },
                    isPartialOrInferred: { type: Type.BOOLEAN },
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          step: { type: Type.INTEGER },
                          actor: { type: Type.STRING },
                          action: { type: Type.STRING },
                          target: { type: Type.STRING },
                          fileReference: { type: Type.STRING },
                        },
                        required: ['step', 'actor', 'action', 'target'],
                      },
                    },
                  },
                  required: ['id', 'title', 'description', 'mermaidSyntax', 'isPartialOrInferred', 'steps'],
                },
              },
              architectureSummary: {
                type: Type.OBJECT,
                properties: {
                  overview: { type: Type.STRING },
                  keyPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mermaidArchitecture: { type: Type.STRING },
                  layerBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        layer: { type: Type.STRING },
                        description: { type: Type.STRING },
                        files: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['layer', 'description', 'files'],
                    },
                  },
                },
                required: ['overview', 'keyPatterns', 'mermaidArchitecture'],
              },
            },
            required: ['fileExplanations', 'mindMap', 'executionFlows', 'architectureSummary'],
          },
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch {
        console.warn('[GeminiService] Initial JSON parse failed.');
      }

      if (this.isValidGeminiOutput(parsed)) {
        return parsed;
      }

      // Retry once with corrective instruction
      console.warn('[GeminiService] Initial response failed schema validation. Retrying once...');
      try {
        const retryResponse = await this.executeGenerateContent(client, targetModel, {
          contents: `${prompt}\n\nCRITICAL FIX: The previous output was missing required properties. Output strictly valid JSON with non-empty mindMap.nodes and executionFlows.`,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const retryParsed = JSON.parse(retryResponse.text || '{}');
        if (this.isValidGeminiOutput(retryParsed)) {
          return retryParsed;
        }
      } catch (retryErr) {
        console.warn('[GeminiService] Retry attempt failed:', retryErr);
      }

      console.warn('[GeminiService] Gemini synthesis failed validation. Falling back gracefully to static analysis.');
      return this.generateFallbackAnalysis(repoName, files);
    } catch (err) {
      console.error('[GeminiService] AI generation failed, falling back to static generation:', err);
      return this.generateFallbackAnalysis(repoName, files);
    }
  }

  public isValidGeminiOutput(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (!data.fileExplanations || typeof data.fileExplanations !== 'object') return false;
    if (!data.mindMap || typeof data.mindMap !== 'object') return false;
    if (!Array.isArray(data.mindMap.nodes) || data.mindMap.nodes.length === 0) return false;
    if (!Array.isArray(data.mindMap.edges)) return false;
    if (!Array.isArray(data.executionFlows) || data.executionFlows.length === 0) return false;
    if (!data.architectureSummary || typeof data.architectureSummary !== 'object') return false;
    if (typeof data.architectureSummary.overview !== 'string') return false;
    if (!Array.isArray(data.architectureSummary.keyPatterns)) return false;
    if (typeof data.architectureSummary.mermaidArchitecture !== 'string') return false;
    return true;
  }

  public async answerQuestion(
    question: string,
    contextFiles: { path: string; content: string; purpose?: string; role?: string }[],
    metadata: RepoMetadata,
    options?: { apiKey?: string; model?: string }
  ): Promise<{ answer: string; referencedFiles: string[] }> {
    const client = this.getClient(options?.apiKey);
    if (!client) {
      return this.generateFallbackAnswer(question, contextFiles);
    }

    const targetModel = options?.model ? sanitizeModelName(options.model) : this.defaultModel;

    try {
      const filesContext = contextFiles
        .map(
          f => `
File: ${f.path} (${f.role || 'source'})
Summary: ${f.purpose || 'No summary'}
Content:
${f.content.slice(0, 3500)}
`
        )
        .join('\n\n');

      const prompt = `You are CodeAtlas Assistant, an expert codebase analyst for the repository "${metadata.fullName}".
Your job is to answer questions about this codebase with high technical precision.

Context Files:
${filesContext}

User Question: ${question}

Rules:
1. Ground your answer strictly in the provided files.
2. Reference exact file paths (e.g. \`${contextFiles[0]?.path || 'file'}\`) and function names whenever mentioning code.
3. If the provided code snippets do not contain enough information to answer definitively, explicitly state:
   "Based on the analyzed files, there is insufficient evidence to explain this part of the repository."
4. Structure your response using clean Markdown with bullet points and code references.`;

      const response = await this.executeGenerateContent(client, targetModel, {
        contents: prompt,
      });

      const text = response.text || 'Unable to generate response.';
      const referencedFiles = contextFiles
        .filter(f => text.includes(f.path) || question.toLowerCase().includes(f.path.toLowerCase()))
        .map(f => f.path);

      return {
        answer: text,
        referencedFiles: Array.from(new Set(referencedFiles)),
      };
    } catch (err: any) {
      console.error('[GeminiService] Chat generation failed:', err);
      return this.generateFallbackAnswer(question, contextFiles);
    }
  }

  private generateFallbackAnalysis(repoName: string, files: FileAnalysisInput[]) {
    const fileExplanations: Record<string, Partial<AnalyzedFile>> = {};
    const nodes: any[] = [];
    const edges: any[] = [];

    // Root node
    nodes.push({
      id: 'root-repo',
      label: repoName,
      type: 'repo',
      description: `Repository root with ${files.length} analyzed source files.`,
    });

    // Group files by top-level folder
    const folderMap = new Map<string, string[]>();

    for (const f of files) {
      const parts = f.path.split('/');
      const folder = parts.length > 1 ? parts[0] : 'root';
      if (!folderMap.has(folder)) {
        folderMap.set(folder, []);
      }
      folderMap.get(folder)?.push(f.path);

      // File explanations
      fileExplanations[f.path] = {
        purpose: `Module serving as ${f.role} in the application.`,
        responsibilities: [
          `Implements core logic for ${f.path.split('/').pop()}`,
          `Provides ${f.staticFunctions.length} discovered callable functions`,
          `Imports ${f.imports.length} external/internal dependencies`,
        ],
        keyFunctions: f.staticFunctions.map(fn => ({
          name: fn.name,
          purpose: `Function ${fn.name} extracted via static analysis.`,
        })),
        inputOutput: {
          input: 'Function parameters and imported module dependencies.',
          output: 'Exported methods, objects, or handlers.',
        },
      };

      // File node
      const isEntry = f.role === 'entry';
      nodes.push({
        id: f.path,
        label: f.path.split('/').pop() || f.path,
        type: isEntry ? 'entry' : 'file',
        path: f.path,
        role: f.role,
        description: `${f.role.toUpperCase()} module with ${f.staticFunctions.length} functions.`,
      });

      // Edge from folder to file
      edges.push({
        id: `contains-${f.path}`,
        source: `folder-${folder}`,
        target: f.path,
        relation: 'contains',
      });

      // Add function nodes for top functions
      for (const fn of f.staticFunctions.slice(0, 2)) {
        const fnId = `${f.path}::${fn.name}`;
        nodes.push({
          id: fnId,
          label: `${fn.name}()`,
          type: 'function',
          path: f.path,
          description: `Extracted function in ${f.path}`,
        });
        edges.push({
          id: `calls-${fnId}`,
          source: f.path,
          target: fnId,
          relation: 'calls',
        });
      }
    }

    // Add folder nodes
    for (const [folder] of folderMap.entries()) {
      nodes.push({
        id: `folder-${folder}`,
        label: folder.toUpperCase(),
        type: 'folder',
        description: `Module category containing related components.`,
      });
      edges.push({
        id: `root-folder-${folder}`,
        source: 'root-repo',
        target: `folder-${folder}`,
        relation: 'contains',
      });
    }

    const entryFile = files.find(f => f.role === 'entry') || files[0];
    const entryName = entryFile ? entryFile.path.split('/').pop() : 'App';

    return {
      fileExplanations,
      mindMap: { nodes, edges },
      executionFlows: [
        {
          id: 'boot-flow',
          title: 'Application Bootstrap & Execution Flow',
          description: 'Flow traced from detected entry point through secondary service modules.',
          mermaidSyntax: `sequenceDiagram\n  autonumber\n  actor User\n  participant Entry as "${entryName || 'Entry'}"\n  participant Core as Core Modules\n  User->>Entry: Launch / Request\n  Entry->>Core: Initialize & Route Handlers\n  Core-->>Entry: Return Status\n  Entry-->>User: Ready / Render`,
          isPartialOrInferred: true,
          steps: [
            {
              step: 1,
              actor: 'User/Environment',
              action: 'Invokes runtime entry',
              target: entryFile?.path || 'Entry',
              fileReference: entryFile?.path,
            },
            {
              step: 2,
              actor: entryName || 'Entry',
              action: 'Loads dependencies and registers handlers',
              target: 'Module Registry',
            },
            {
              step: 3,
              actor: 'Module Registry',
              action: 'Initializes internal state and exports endpoints',
              target: 'Application Runtime',
            },
          ],
        },
      ],
      architectureSummary: {
        overview: `Repository analyzed using static AST inspection. Contains ${files.length} primary source modules organized into ${folderMap.size} modular domains.`,
        keyPatterns: ['Modular Layering', 'Separation of Concerns', 'Dependency Inversion'],
        mermaidArchitecture: `graph TD\n  Root["${repoName.replace(/"/g, '')}"] --> Layers[Functional Modules]\n  Layers --> Core[Core Engine]\n  Core --> Utilities[Utils & Configuration]`,
        layerBreakdown: Array.from(folderMap.entries()).map(([folder, fileList]) => ({
          layer: folder.toUpperCase(),
          description: `Contains ${fileList.length} files handling domain logic for ${folder}.`,
          files: fileList,
        })),
      },
    };
  }

  private generateFallbackAnswer(
    question: string,
    contextFiles: { path: string; content: string; purpose?: string; role?: string }[]
  ) {
    const qLower = question.toLowerCase();
    const matchedFiles = contextFiles.filter(
      f =>
        f.path.toLowerCase().includes(qLower) ||
        (f.role && qLower.includes(f.role)) ||
        (f.purpose && f.purpose.toLowerCase().includes(qLower))
    );

    const targetFiles = matchedFiles.length > 0 ? matchedFiles : contextFiles.slice(0, 3);

    return {
      answer: `Based on the repository analysis:

- **Identified Modules:**
${targetFiles.map(f => `  - \`${f.path}\` (${f.role || 'module'}): ${f.purpose || 'Implements core logic.'}`).join('\n')}

- **Execution Context:**
  When exploring this codebase, execution typically begins at the entry point files and branches out through imports into the services and utilities listed above.

*(For full AI-grounded explanations, please ensure a valid GEMINI_API_KEY is configured in your Secrets panel.)*`,
      referencedFiles: targetFiles.map(f => f.path),
    };
  }
}
