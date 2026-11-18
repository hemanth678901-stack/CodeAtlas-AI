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

export async function getAvailableModels(): Promise<{
  defaultModel: string;
  models: GeminiModelOption[];
}> {
  try {
    const response = await fetch('/api/models');
    if (!response.ok) {
      return { defaultModel: 'gemini-3.8-flash', models: DEFAULT_GEMINI_MODELS };
    }
    const data = await response.json();
    return {
      defaultModel: data.defaultModel || 'gemini-3.8-flash',
      models: Array.isArray(data.models) && data.models.length > 0 ? data.models : DEFAULT_GEMINI_MODELS,
    };
  } catch {
    return { defaultModel: 'gemini-3.8-flash', models: DEFAULT_GEMINI_MODELS };
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

