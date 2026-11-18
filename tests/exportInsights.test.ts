import { describe, it, expect } from 'vitest';
import {
  buildArchitectureExportPayload,
  generateSimplifiedPdfBytes,
} from '../src/utils/exportInsights';

describe('Architecture & Dependency Export Utilities', () => {
  const sampleInput = {
    metadata: {
      owner: 'expressjs',
      repo: 'express',
      fullName: 'expressjs/express',
      description: 'Fast, unopinionated, minimalist web framework for node.',
      stars: 65000,
      forks: 15000,
      openIssues: 120,
      defaultBranch: 'master',
      license: 'MIT',
      detectedLanguages: { JavaScript: 98, Markdown: 2 },
      primaryFramework: 'Node.js Package',
      totalFiles: 120,
      analyzedFilesCount: 15,
      commitSha: 'a1b2c3d4e5f6',
      repoUrl: 'https://github.com/expressjs/express',
    },
    summary: {
      overview: 'Express uses a layered middleware pipeline and router dispatch architecture.',
      keyPatterns: ['Middleware Pipeline', 'Prototype Delegation'],
      mermaidArchitecture: 'graph TD\n  App --> Router',
      layerBreakdown: [
        {
          layer: 'Core Application',
          description: 'Handles application initialization and request routing.',
          files: ['lib/express.js', 'lib/application.js'],
        },
      ],
    },
    dependencies: [
      { from: 'lib/express.js', to: 'lib/application.js', isInternal: true },
      { from: 'lib/application.js', to: 'http', isInternal: false },
    ],
    circularDependencies: [['lib/router/index.js', 'lib/router/route.js', 'lib/router/index.js']],
  };

  it('builds a structured JSON export payload with architecture and dependency insights', () => {
    const payload = buildArchitectureExportPayload(sampleInput);
    expect(payload.generator).toBe('CodeAtlas AI');
    expect(payload.repository.fullName).toBe('expressjs/express');
    expect(payload.architectureSummary.keyPatterns).toContain('Middleware Pipeline');
    expect(payload.dependencyInsights.totalEdges).toBe(2);
    expect(payload.dependencyInsights.internalEdges).toBe(1);
    expect(payload.dependencyInsights.externalEdges).toBe(1);
    expect(payload.dependencyInsights.circularDependencyCount).toBe(1);
  });

  it('generates a valid PDF 1.4 binary summary from the export payload', () => {
    const payload = buildArchitectureExportPayload(sampleInput);
    const pdfBytes = generateSimplifiedPdfBytes(payload);
    expect(pdfBytes.byteLength).toBeGreaterThan(200);

    const pdfText = new TextDecoder().decode(pdfBytes);
    expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfText.trim().endsWith('%%EOF')).toBe(true);
    expect(pdfText).toContain('expressjs/express');
    expect(pdfText).toContain('Middleware Pipeline');
    expect(pdfText).toContain('Total Dependency Edges: 2');
  });
});
