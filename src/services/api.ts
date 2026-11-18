import { CodebaseAnalysisResult, GeminiModelOption, SampleRepoInfo } from '../types';

export const DEFAULT_GEMINI_MODELS: GeminiModelOption[] = [
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

export function filterModelsWithAvailableTokens(models: GeminiModelOption[]): GeminiModelOption[] {
  return models.filter(
    m =>
      typeof m.inputTokenLimit === 'number' &&
      m.inputTokenLimit > 0 &&
      typeof m.outputTokenLimit === 'number' &&
      m.outputTokenLimit > 100 &&
      (!Array.isArray(m.supportedActions) ||
        m.supportedActions.length === 0 ||
        m.supportedActions.includes('generateContent'))
  );
}

export async function getAvailableModels(): Promise<{
  defaultModel: string;
  models: GeminiModelOption[];
}> {
  try {
    const response = await fetch('/api/models');
    if (!response.ok) {
      return {
        defaultModel: 'gemini-3.8-flash',
        models: filterModelsWithAvailableTokens(DEFAULT_GEMINI_MODELS),
      };
    }
    const data = await response.json();
    const validModels = Array.isArray(data.models)
      ? filterModelsWithAvailableTokens(data.models)
      : [];
    return {
      defaultModel: data.defaultModel || 'gemini-3.8-flash',
      models: validModels.length > 0 ? validModels : filterModelsWithAvailableTokens(DEFAULT_GEMINI_MODELS),
    };
  } catch {
    return {
      defaultModel: 'gemini-3.8-flash',
      models: filterModelsWithAvailableTokens(DEFAULT_GEMINI_MODELS),
    };
  }
}

export async function analyzeRepository(
  url: string,
  githubToken?: string,
  geminiApiKey?: string,
  geminiModel?: string,
  maxFiles?: number
): Promise<CodebaseAnalysisResult> {
  const customModel = geminiModel || localStorage.getItem('codeatlas_gemini_model') || undefined;
  const configuredMaxFiles = maxFiles || Number(localStorage.getItem('codeatlas_max_files')) || 40;

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      githubToken,
      geminiModel: customModel,
      maxFiles: configuredMaxFiles,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze repository (${response.statusText})`);
  }

  return await response.json();
}

export async function askCodebaseQuestion(
  owner: string,
  repo: string,
  question: string,
  geminiApiKey?: string,
  geminiModel?: string
): Promise<{ answer: string; referencedFiles: string[] }> {
  const customModel = geminiModel || localStorage.getItem('codeatlas_gemini_model') || undefined;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner,
      repo,
      question,
      geminiModel: customModel,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Assistant error (${response.statusText})`);
  }

  return await response.json();
}

export async function getSampleRepos(): Promise<SampleRepoInfo[]> {
  const response = await fetch('/api/samples');
  if (!response.ok) return [];
  return await response.json();
}

export async function loadSampleRepo(id: string): Promise<CodebaseAnalysisResult> {
  const response = await fetch('/api/load-sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error('Failed to load sample repository.');
  }

  return await response.json();
}

