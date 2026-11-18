import { describe, it, expect } from 'vitest';
import { sanitizeModelName, GeminiService, AVAILABLE_GEMINI_MODELS } from '../server/gemini';

describe('Gemini Model Name Sanitization', () => {
  it('defaults to gemini-3.8-flash when model is undefined or empty', () => {
    expect(sanitizeModelName(undefined)).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('   ')).toBe('gemini-3.8-flash');
  });

  it('strips leading models/ prefix', () => {
    expect(sanitizeModelName('models/gemini-3.8-flash')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('models/gemini-3.5-flash')).toBe('gemini-3.5-flash');
  });

  it('strips surrounding quotes', () => {
    expect(sanitizeModelName('"gemini-3.8-flash"')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName("'gemini-3.8-flash'")).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('"models/gemini-3.8-flash"')).toBe('gemini-3.8-flash');
  });

  it('detects and discards accidental API keys pasted into GEMINI_MODEL', () => {
    // API key beginning with AQ. or AIza
    const accidentalApiKey = ['AQ', 'x'.repeat(50)].join('.');
    expect(sanitizeModelName(accidentalApiKey)).toBe('gemini-3.8-flash');

    const googleApiKey = 'AI' + 'zaSyD-random-token-here';
    expect(sanitizeModelName(googleApiKey)).toBe('gemini-3.8-flash');
  });

  it('rejects placeholders, deprecated 1.5/2.0 models, or invalid model strings', () => {
    expect(sanitizeModelName('YOUR_GEMINI_MODEL')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('<model-code>')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('gpt-4o')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('random-invalid-model')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('gemini-1.5-flash')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('gemini-2.0-flash')).toBe('gemini-3.8-flash');
  });

  it('preserves valid Gemini and Lyria API model identifiers', () => {
    expect(sanitizeModelName('gemini-4-hydrogen')).toBe('gemini-4-hydrogen');
    expect(sanitizeModelName('gemini-4-argon')).toBe('gemini-4-argon');
    expect(sanitizeModelName('gemini-4-carbon')).toBe('gemini-4-carbon');
    expect(sanitizeModelName('gemini-3.8-flash')).toBe('gemini-3.8-flash');
    expect(sanitizeModelName('gemini-3.1-flash-lite')).toBe('gemini-3.1-flash-lite');
    expect(sanitizeModelName('gemini-2.5-flash')).toBe('gemini-2.5-flash');
    expect(sanitizeModelName('lyria-3-pro-preview')).toBe('lyria-3-pro-preview');
  });
});

describe('GeminiService Architecture and Fallback Engine', () => {
  it('initializes with a sanitized default model and lists all available API models', async () => {
    const service = new GeminiService();
    expect(service.getModel()).toMatch(/^(gemini|lyria)-[a-z0-9\.\-]+$/i);
    const models = await service.listAvailableModels();
    expect(models.length).toBeGreaterThanOrEqual(AVAILABLE_GEMINI_MODELS.length);
    const ids = models.map(m => m.id);
    expect(ids).toContain('gemini-4-hydrogen');
    expect(ids).toContain('gemini-4-argon');
    expect(ids).toContain('gemini-4-carbon');
    expect(ids).toContain('gemini-3.8-flash');
    expect(ids).toContain('gemini-3.1-flash-lite');
    expect(ids).toContain('gemini-embedding-2');
  });

  it('generates rich fallback analysis without crashing when AI client is inactive', async () => {
    const service = new GeminiService();
    const mockFiles = [
      {
        path: 'src/index.ts',
        content: 'import express from "express"; export const app = express();',
        role: 'entry',
        staticFunctions: [{ name: 'bootstrap', signature: '() => void' }],
        imports: ['express'],
      },
      {
        path: 'src/utils/math.ts',
        content: 'export function add(a: number, b: number) { return a + b; }',
        role: 'utility',
        staticFunctions: [{ name: 'add', signature: '(a: number, b: number) => number' }],
        imports: [],
      },
    ];

    const result = await service.analyzeCodebase('test-org/test-repo', mockFiles);
    expect(result).toBeDefined();
    expect(result.mindMap.nodes.length).toBeGreaterThan(0);
    expect(result.mindMap.edges.length).toBeGreaterThan(0);
    expect(result.architectureSummary.mermaidArchitecture).toContain('test-org/test-repo');
    expect(result.architectureSummary.overview).toContain('2 primary source modules');
    expect(result.fileExplanations['src/index.ts']).toBeDefined();
  });

  it('generates fallback answer for chat queries', async () => {
    const service = new GeminiService();
    const contextFiles = [
      {
        path: 'src/server.ts',
        content: 'console.log("booting");',
        purpose: 'Main server entry point',
        role: 'entry',
      },
    ];
    const metadata = {
      owner: 'test-org',
      repo: 'test-repo',
      fullName: 'test-org/test-repo',
      description: 'Test repository',
      stars: 10,
      forks: 2,
      openIssues: 0,
      defaultBranch: 'main',
      detectedLanguages: { TypeScript: 100 },
      primaryFramework: 'Node.js',
      totalFiles: 1,
      analyzedFilesCount: 1,
      repoUrl: 'https://github.com/test-org/test-repo',
    };

    const answerResult = await service.answerQuestion('Where is the entry point?', contextFiles, metadata);
    expect(answerResult.answer).toBeDefined();
    expect(answerResult.referencedFiles).toContain('src/server.ts');
  });

  it('validates structured Gemini outputs and rejects partial or malformed responses', () => {
    const service = new GeminiService();

    // Valid output
    const validOutput = {
      fileExplanations: { 'src/app.ts': { purpose: 'Main app' } },
      mindMap: {
        nodes: [{ id: 'root', label: 'App', type: 'repo' }],
        edges: [],
      },
      executionFlows: [
        {
          id: 'boot',
          title: 'Boot',
          description: 'desc',
          mermaidSyntax: 'sequenceDiagram',
          isPartialOrInferred: false,
          steps: [],
        },
      ],
      architectureSummary: {
        overview: 'Clean architecture',
        keyPatterns: ['MVC'],
        mermaidArchitecture: 'graph TD',
      },
    };
    expect(service.isValidGeminiOutput(validOutput)).toBe(true);

    // Invalid: missing nodes or executionFlows
    expect(service.isValidGeminiOutput({})).toBe(false);
    expect(service.isValidGeminiOutput({ mindMap: { nodes: [] } })).toBe(false);
    expect(
      service.isValidGeminiOutput({
        ...validOutput,
        executionFlows: [],
      })
    ).toBe(false);
    expect(
      service.isValidGeminiOutput({
        ...validOutput,
        architectureSummary: { overview: 123 },
      })
    ).toBe(false);
  });
});
