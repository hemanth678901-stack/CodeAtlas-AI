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
    supportedActions: ['generateContent', 'countTokens', 'batchGenerateContent'],
    isRecommended: true,
    source: 'catalog',
  },
  {
    id: 'gemini-4-argon',
    displayName: 'Gemini 4 Argon',
    category: 'Gemini 4 Series (Flagship)',
    description: 'Advanced coding, software architecture synthesis, math, and complex STEM reasoning.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 32768,
    supportedActions: ['generateContent', 'countTokens', 'batchGenerateContent'],
    isRecommended: true,
    source: 'catalog',
  },
  {
    id: 'gemini-4-carbon',
    displayName: 'Gemini 4 Carbon',
    category: 'Gemini 4 Series (Flagship)',
    description: 'Maximum reasoning depth for root-cause debugging, architectural design, and security auditing.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 32768,
    supportedActions: ['generateContent', 'countTokens', 'batchGenerateContent'],
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
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    isRecommended: true,
    source: 'catalog',
  },
  {
    id: 'gemini-3.7-flash',
    displayName: 'Gemini 3.7 Flash',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'High-throughput Flash model for fast code comprehension and structured JSON output.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Fast text and code generation model with 1M context window.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Balanced speed and accuracy for multi-file repository analysis.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.5-flash-lite',
    displayName: 'Gemini 3.5 Flash Lite',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Lightweight low-latency model for rapid codebase summaries.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.1-pro-preview',
    displayName: 'Gemini 3.1 Pro Preview',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Pro-grade reasoning model for deep codebase inspection and multi-file dependency synthesis.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Ultra-fast, lightweight model ideal for rapid repository scanning and high-throughput queries.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash Preview',
    category: 'Gemini 3 Series (Text & Code)',
    description: 'Fast multimodal and code comprehension model with low latency.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
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
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    category: 'Gemini 2.5 Series',
    description: 'Balanced speed and structured JSON generation for repository analysis.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
  {
    id: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    category: 'Gemini 2.5 Series',
    description: 'Cost-efficient lightweight model for fast text and code summarization.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedActions: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent'],
    source: 'catalog',
  },
];

const NON_TEXT_OR_UNSUPPORTED_MODEL_PATTERNS = [
  /live/i,
  /tts/i,
  /transcribe/i,
  /image/i,
  /banana/i,
  /lyria/i,
  /omni/i,
  /embedding/i,
  /decision/i,
  /robotics/i,
  /computer-use/i,
  /native-audio/i,
  /audio/i,
  /veo/i,
  /imagen/i,
  /customtools/i,
];

export function hasAvailableTokensAndTextSupport(model: {
  id: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedActions?: string[];
}): boolean {
  if (!model.id || isDeprecatedModel(model.id)) return false;
  if (!/^gemini-[a-z0-9\.\-]+$/i.test(model.id)) return false;
  if (NON_TEXT_OR_UNSUPPORTED_MODEL_PATTERNS.some(rx => rx.test(model.id))) return false;
  if (typeof model.inputTokenLimit !== 'number' || model.inputTokenLimit <= 0) return false;
  if (typeof model.outputTokenLimit !== 'number' || model.outputTokenLimit <= 100) return false;
  if (Array.isArray(model.supportedActions) && model.supportedActions.length > 0) {
    if (!model.supportedActions.includes('generateContent')) return false;
  }
  return true;
}

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
    const catalogMap = new Map<string, GeminiModelOption>();
    for (const item of AVAILABLE_GEMINI_MODELS) {
      if (hasAvailableTokensAndTextSupport(item)) {
        catalogMap.set(item.id, { ...item });
      }
    }

    const client = this.getClient(apiKeyOverride);
    if (!client) {
      return Array.from(catalogMap.values());
    }

    try {
      const pager = await client.models.list({ config: { pageSize: 100 } });
      const liveModelsMap = new Map<string, GeminiModelOption>();
      const categorizeId = (id: string): string => {
        if (id.startsWith('gemini-4')) return 'Gemini 4 Series (Flagship)';
        if (id.startsWith('gemini-3')) return 'Gemini 3 Series (Text & Code)';
        if (id.startsWith('gemini-2.5')) return 'Gemini 2.5 Series';
        return 'Gemini API Models';
      };

      for await (const rawModel of pager) {
        const rawName = rawModel?.name || '';
        const id = rawName.replace(/^models\//, '').trim();
        const candidate = {
          id,
          inputTokenLimit: rawModel.inputTokenLimit,
          outputTokenLimit: rawModel.outputTokenLimit,
          supportedActions: rawModel.supportedActions,
        };

        // Strictly include only models returned by the API that support text/code generation and have available token limits
        if (!hasAvailableTokensAndTextSupport(candidate)) continue;
        if (Array.isArray(rawModel.supportedActions) && !rawModel.supportedActions.includes('countTokens')) {
          continue;
        }

        const existing = catalogMap.get(id);
        if (existing) {
          liveModelsMap.set(id, {
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
          liveModelsMap.set(id, {
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

      if (liveModelsMap.size > 0) {
        // Order curated models first (if confirmed live in API), followed by additional live API models
        const ordered: GeminiModelOption[] = [];
        for (const item of AVAILABLE_GEMINI_MODELS) {
          const live = liveModelsMap.get(item.id);
          if (live) {
            ordered.push(live);
            liveModelsMap.delete(item.id);
          }
        }
        for (const remaining of liveModelsMap.values()) {
          ordered.push(remaining);
        }
        return ordered;
      }
    } catch (err) {
      console.warn('[GeminiService] Could not fetch dynamic model list from API, returning verified token models:', err);
    }

    return Array.from(catalogMap.values());
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
1. "fileExplanationsList": An array of file explanation objects (one for each analyzed file). Each item must have:
   - "path": Exact file path from the input.
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

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          fileExplanationsList: {
            type: Type.ARRAY,
            description: 'List of per-file architectural explanations',
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                purpose: { type: Type.STRING },
                responsibilities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyFunctions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      purpose: { type: Type.STRING },
                    },
                    required: ['name', 'purpose'],
                  },
                },
                inputOutput: {
                  type: Type.OBJECT,
                  properties: {
                    input: { type: Type.STRING },
                    output: { type: Type.STRING },
                  },
                  required: ['input', 'output'],
                },
              },
              required: ['path', 'purpose', 'responsibilities'],
            },
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
        required: ['fileExplanationsList', 'mindMap', 'executionFlows', 'architectureSummary'],
      };

      const response = await this.executeGenerateContent(client, targetModel, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const fallbackData = this.generateFallbackAnalysis(repoName, files);
      const parsed = this.parseAndNormalizeOutput(response.text, fallbackData);

      if (this.isValidGeminiOutput(parsed)) {
        return parsed;
      }

      // Retry once if response was completely unparseable
      try {
        const retryResponse = await this.executeGenerateContent(client, targetModel, {
          contents: `${prompt}\n\nOutput strictly valid JSON conforming to the requested schema.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema,
          },
        });
        const retryParsed = this.parseAndNormalizeOutput(retryResponse.text, fallbackData);
        if (this.isValidGeminiOutput(retryParsed)) {
          return retryParsed;
        }
      } catch {
        // Fall through to deterministic static analysis fallback
      }

      return fallbackData;
    } catch {
      return this.generateFallbackAnalysis(repoName, files);
    }
  }

  private parseAndNormalizeOutput(
    rawText: string | undefined,
    fallback: {
      fileExplanations: Record<string, Partial<AnalyzedFile>>;
      mindMap: MindMapData;
      executionFlows: ExecutionFlowItem[];
      architectureSummary: ArchitectureSummary;
    }
  ) {
    if (!rawText || typeof rawText !== 'string') return fallback;
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let raw: any;
    try {
      raw = JSON.parse(cleaned);
    } catch {
      return fallback;
    }

    if (!raw || typeof raw !== 'object') return fallback;

    const fileExplanations: Record<string, Partial<AnalyzedFile>> = {
      ...fallback.fileExplanations,
    };

    if (Array.isArray(raw.fileExplanationsList)) {
      for (const item of raw.fileExplanationsList) {
        if (item && typeof item.path === 'string' && item.path.trim()) {
          fileExplanations[item.path.trim()] = {
            purpose: item.purpose || fileExplanations[item.path.trim()]?.purpose,
            responsibilities: Array.isArray(item.responsibilities)
              ? item.responsibilities
              : fileExplanations[item.path.trim()]?.responsibilities,
            keyFunctions: Array.isArray(item.keyFunctions)
              ? item.keyFunctions
              : fileExplanations[item.path.trim()]?.keyFunctions,
            inputOutput:
              item.inputOutput && typeof item.inputOutput === 'object'
                ? item.inputOutput
                : fileExplanations[item.path.trim()]?.inputOutput,
          };
        }
      }
    } else if (raw.fileExplanations && typeof raw.fileExplanations === 'object' && !Array.isArray(raw.fileExplanations)) {
      for (const [filePath, exp] of Object.entries<any>(raw.fileExplanations)) {
        if (exp && typeof exp === 'object') {
          fileExplanations[filePath] = {
            ...fileExplanations[filePath],
            ...exp,
          };
        }
      }
    }

    const mindMap: MindMapData =
      raw.mindMap &&
      typeof raw.mindMap === 'object' &&
      Array.isArray(raw.mindMap.nodes) &&
      raw.mindMap.nodes.length > 0
        ? {
            nodes: raw.mindMap.nodes,
            edges: Array.isArray(raw.mindMap.edges) ? raw.mindMap.edges : fallback.mindMap.edges,
          }
        : fallback.mindMap;

    const executionFlows: ExecutionFlowItem[] =
      Array.isArray(raw.executionFlows) && raw.executionFlows.length > 0
        ? raw.executionFlows
        : fallback.executionFlows;

    const architectureSummary: ArchitectureSummary =
      raw.architectureSummary &&
      typeof raw.architectureSummary === 'object' &&
      typeof raw.architectureSummary.overview === 'string'
        ? {
            overview: raw.architectureSummary.overview,
            keyPatterns: Array.isArray(raw.architectureSummary.keyPatterns)
              ? raw.architectureSummary.keyPatterns
              : fallback.architectureSummary.keyPatterns,
            mermaidArchitecture:
              typeof raw.architectureSummary.mermaidArchitecture === 'string' &&
              raw.architectureSummary.mermaidArchitecture.trim()
                ? raw.architectureSummary.mermaidArchitecture
                : fallback.architectureSummary.mermaidArchitecture,
            layerBreakdown: Array.isArray(raw.architectureSummary.layerBreakdown)
              ? raw.architectureSummary.layerBreakdown
              : fallback.architectureSummary.layerBreakdown,
          }
        : fallback.architectureSummary;

    return {
      fileExplanations,
      mindMap,
      executionFlows,
      architectureSummary,
    };
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
