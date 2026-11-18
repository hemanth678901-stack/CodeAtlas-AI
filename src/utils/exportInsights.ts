import {
  AnalyzedFile,
  ArchitectureSummary,
  DependencyLink,
  ExecutionFlowItem,
  RepoMetadata,
} from '../types';

export interface ArchitectureExportPayload {
  exportedAt: string;
  generator: string;
  repository: RepoMetadata;
  architectureSummary: ArchitectureSummary;
  dependencyInsights: {
    totalEdges: number;
    internalEdges: number;
    externalEdges: number;
    circularDependencyCount: number;
    circularDependencies: string[][];
    links: DependencyLink[];
  };
  executionFlows?: Pick<
    ExecutionFlowItem,
    'id' | 'title' | 'description' | 'isPartialOrInferred' | 'steps'
  >[];
  analyzedModules?: {
    path: string;
    role: string;
    purpose: string;
    responsibilities: string[];
    keyFunctions: string[];
    importsCount: number;
    importedByCount: number;
    lineCount?: number;
  }[];
}

export function buildArchitectureExportPayload(params: {
  metadata: RepoMetadata;
  summary: ArchitectureSummary;
  dependencies?: DependencyLink[];
  circularDependencies?: string[][];
  analyzedFiles?: Record<string, AnalyzedFile>;
  executionFlows?: ExecutionFlowItem[];
}): ArchitectureExportPayload {
  const {
    metadata,
    summary,
    dependencies = [],
    circularDependencies = [],
    analyzedFiles = {},
    executionFlows = [],
  } = params;

  const internalEdges = dependencies.filter(d => d.isInternal).length;
  const externalEdges = dependencies.length - internalEdges;

  const analyzedModules = Object.values(analyzedFiles).map(file => ({
    path: file.path,
    role: file.role,
    purpose: file.purpose,
    responsibilities: file.responsibilities || [],
    keyFunctions: (file.keyFunctions || []).map(fn => fn.name),
    importsCount: (file.imports || []).length,
    importedByCount: (file.importedBy || []).length,
    lineCount: file.lineCount,
  }));

  return {
    exportedAt: new Date().toISOString(),
    generator: 'CodeAtlas AI',
    repository: metadata,
    architectureSummary: {
      overview: summary.overview,
      keyPatterns: summary.keyPatterns,
      layerBreakdown: summary.layerBreakdown || [],
      mermaidArchitecture: summary.mermaidArchitecture,
    },
    dependencyInsights: {
      totalEdges: dependencies.length,
      internalEdges,
      externalEdges,
      circularDependencyCount: circularDependencies.length,
      circularDependencies,
      links: dependencies,
    },
    executionFlows: executionFlows.map(flow => ({
      id: flow.id,
      title: flow.title,
      description: flow.description,
      isPartialOrInferred: flow.isPartialOrInferred,
      steps: flow.steps,
    })),
    analyzedModules,
  };
}

function escapePdfText(input: string): string {
  // Normalize non-ASCII characters to safe ASCII equivalents for standard Type1 fonts
  const ascii = input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/\u2022/g, '*')
    .replace(/[^\x20-\x7E]/g, '');

  return ascii.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number): string[] {
  const clean = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [''];
  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

interface PdfLineItem {
  text: string;
  font: 'F1' | 'F2' | 'F3'; // F1: Helvetica, F2: Helvetica-Bold, F3: Courier
  size: number;
  indent?: number;
  spacingBefore?: number;
  spacingAfter?: number;
  color?: [number, number, number]; // RGB 0..1
}

/**
 * Generates a valid, self-contained multi-page PDF 1.4 document summarizing
 * repository architecture and dependency insights without external dependencies.
 */
export function generateSimplifiedPdfBytes(payload: ArchitectureExportPayload): Uint8Array {
  const items: PdfLineItem[] = [];
  const { repository, architectureSummary, dependencyInsights, analyzedModules = [] } = payload;

  // Title Block
  items.push({
    text: `CodeAtlas AI - Architecture & Dependency Summary`,
    font: 'F2',
    size: 16,
    color: [0.19, 0.18, 0.51],
    spacingAfter: 4,
  });
  items.push({
    text: `Repository: ${repository.fullName} (${repository.repoUrl})`,
    font: 'F2',
    size: 11,
    color: [0.06, 0.09, 0.16],
    spacingAfter: 2,
  });
  items.push({
    text: `Generated: ${new Date(payload.exportedAt).toUTCString()}`,
    font: 'F1',
    size: 9,
    color: [0.39, 0.45, 0.55],
    spacingAfter: 10,
  });

  // Section 1: Repository Telemetry
  items.push({
    text: '1. Repository Metadata & Telemetry',
    font: 'F2',
    size: 12,
    color: [0.19, 0.18, 0.51],
    spacingBefore: 6,
    spacingAfter: 4,
  });

  const metaLines = [
    `Primary Framework: ${repository.primaryFramework || 'Unknown'}   |   Default Branch: ${repository.defaultBranch || 'main'}`,
    `Files Analyzed: ${repository.analyzedFilesCount} of ${repository.totalFiles} total files   |   Stars: ${repository.stars}   |   Forks: ${repository.forks}`,
    `Commit SHA: ${repository.commitSha ? repository.commitSha.slice(0, 12) : 'N/A'}   |   License: ${repository.license || 'Unspecified'}`,
  ];
  for (const line of metaLines) {
    items.push({ text: line, font: 'F3', size: 9, indent: 8, spacingAfter: 2 });
  }

  const langEntries = Object.entries(repository.detectedLanguages || {});
  if (langEntries.length > 0) {
    const langStr = langEntries.map(([k, v]) => `${k} (${v}%)`).join(', ');
    for (const wrapped of wrapText(`Languages: ${langStr}`, 88)) {
      items.push({ text: wrapped, font: 'F3', size: 9, indent: 8, spacingAfter: 2 });
    }
  }

  // Section 2: System Architecture Overview
  items.push({
    text: '2. Executive Architecture Overview',
    font: 'F2',
    size: 12,
    color: [0.19, 0.18, 0.51],
    spacingBefore: 10,
    spacingAfter: 4,
  });

  for (const line of wrapText(architectureSummary.overview || 'No overview provided.', 92)) {
    items.push({ text: line, font: 'F1', size: 10, spacingAfter: 2 });
  }

  // Section 3: Detected Architectural Patterns
  if (architectureSummary.keyPatterns && architectureSummary.keyPatterns.length > 0) {
    items.push({
      text: '3. Detected Architectural Patterns',
      font: 'F2',
      size: 12,
      color: [0.19, 0.18, 0.51],
      spacingBefore: 10,
      spacingAfter: 4,
    });

    for (const pattern of architectureSummary.keyPatterns) {
      items.push({
        text: `* ${pattern}`,
        font: 'F1',
        size: 10,
        indent: 10,
        spacingAfter: 2,
      });
    }
  }

  // Section 4: Subsystems & Directory Layers
  if (architectureSummary.layerBreakdown && architectureSummary.layerBreakdown.length > 0) {
    items.push({
      text: '4. Subsystems & Layer Breakdown',
      font: 'F2',
      size: 12,
      color: [0.19, 0.18, 0.51],
      spacingBefore: 10,
      spacingAfter: 4,
    });

    for (const layer of architectureSummary.layerBreakdown) {
      items.push({
        text: `${layer.layer} (${layer.files.length} ${layer.files.length === 1 ? 'module' : 'modules'})`,
        font: 'F2',
        size: 10,
        indent: 6,
        spacingBefore: 3,
        spacingAfter: 1,
      });
      for (const descLine of wrapText(layer.description, 88)) {
        items.push({ text: descLine, font: 'F1', size: 9.5, indent: 12, spacingAfter: 1 });
      }
      const filesList = layer.files.slice(0, 12).join(', ');
      const suffix = layer.files.length > 12 ? ` (+${layer.files.length - 12} more)` : '';
      for (const fileLine of wrapText(`Modules: ${filesList}${suffix}`, 86)) {
        items.push({
          text: fileLine,
          font: 'F3',
          size: 8.5,
          indent: 12,
          color: [0.3, 0.35, 0.45],
          spacingAfter: 2,
        });
      }
    }
  }

  // Section 5: Dependency Graph Insights
  items.push({
    text: '5. Dependency & Coupling Insights',
    font: 'F2',
    size: 12,
    color: [0.19, 0.18, 0.51],
    spacingBefore: 10,
    spacingAfter: 4,
  });

  items.push({
    text: `Total Dependency Edges: ${dependencyInsights.totalEdges}   |   Internal: ${dependencyInsights.internalEdges}   |   External: ${dependencyInsights.externalEdges}`,
    font: 'F3',
    size: 9.5,
    indent: 8,
    spacingAfter: 2,
  });
  items.push({
    text: `Circular Dependencies Detected: ${dependencyInsights.circularDependencyCount}`,
    font: 'F2',
    size: 9.5,
    indent: 8,
    color: dependencyInsights.circularDependencyCount > 0 ? [0.7, 0.25, 0.05] : [0.05, 0.5, 0.3],
    spacingAfter: 4,
  });

  if (dependencyInsights.circularDependencies.length > 0) {
    for (const cycle of dependencyInsights.circularDependencies.slice(0, 8)) {
      const cycleText = `Cycle: ${cycle.join(' -> ')}`;
      for (const wrapped of wrapText(cycleText, 85)) {
        items.push({ text: wrapped, font: 'F3', size: 8.5, indent: 14, spacingAfter: 1.5 });
      }
    }
  }

  // Top Internal Dependency Links
  const internalLinks = dependencyInsights.links.filter(l => l.isInternal);
  if (internalLinks.length > 0) {
    items.push({
      text: `Key Internal Module Connections (showing up to 20 of ${internalLinks.length}):`,
      font: 'F2',
      size: 9.5,
      indent: 8,
      spacingBefore: 4,
      spacingAfter: 2,
    });
    for (const link of internalLinks.slice(0, 20)) {
      items.push({
        text: `${link.from}  -->  ${link.to}${link.isCircular ? ' [CIRCULAR]' : ''}`,
        font: 'F3',
        size: 8.5,
        indent: 14,
        spacingAfter: 1.5,
      });
    }
  }

  // Section 6: Key Analyzed Modules
  if (analyzedModules.length > 0) {
    items.push({
      text: `6. Analyzed Source Modules (${analyzedModules.length})`,
      font: 'F2',
      size: 12,
      color: [0.19, 0.18, 0.51],
      spacingBefore: 10,
      spacingAfter: 4,
    });

    for (const mod of analyzedModules.slice(0, 25)) {
      items.push({
        text: `${mod.path} [${mod.role.toUpperCase()}] (Imports: ${mod.importsCount}, Imported By: ${mod.importedByCount})`,
        font: 'F2',
        size: 9.5,
        indent: 6,
        spacingBefore: 2,
        spacingAfter: 1,
      });
      for (const pLine of wrapText(mod.purpose, 88)) {
        items.push({ text: pLine, font: 'F1', size: 9, indent: 12, spacingAfter: 1.5 });
      }
    }
  }

  // Paginate items into 612 x 792 pt pages (US Letter)
  const PAGE_HEIGHT = 792;
  const TOP_MARGIN = 52;
  const BOTTOM_MARGIN = 52;
  const LEFT_MARGIN = 48;

  const pageStreams: string[] = [];
  let currentCommands: string[] = [];
  let cursorY = PAGE_HEIGHT - TOP_MARGIN;
  let pageNumber = 1;

  const flushPage = () => {
    // Footer
    currentCommands.push(
      `BT /F1 8 Tf 0.45 0.5 0.58 rg ${LEFT_MARGIN} 28 Td (CodeAtlas AI Architecture Report - ${escapePdfText(
        repository.fullName
      )} - Page ${pageNumber}) Tj ET`
    );
    pageStreams.push(currentCommands.join('\n'));
    currentCommands = [];
    cursorY = PAGE_HEIGHT - TOP_MARGIN;
    pageNumber++;
  };

  for (const item of items) {
    const before = item.spacingBefore || 0;
    const after = item.spacingAfter || 0;
    const lineHeight = item.size * 1.35;

    if (cursorY - before - lineHeight < BOTTOM_MARGIN) {
      flushPage();
    }

    cursorY -= before + item.size;
    const x = LEFT_MARGIN + (item.indent || 0);
    const [r, g, b] = item.color || [0.1, 0.14, 0.2];
    const safeText = escapePdfText(item.text);

    currentCommands.push(
      `BT /${item.font} ${item.size} Tf ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(
        2
      )} rg ${x} ${cursorY.toFixed(1)} Td (${safeText}) Tj ET`
    );
    cursorY -= lineHeight - item.size + after;
  }

  if (currentCommands.length > 0 || pageStreams.length === 0) {
    flushPage();
  }

  // Assemble PDF 1.4 Objects
  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Font F1 (Helvetica)
  // Object 4: Font F2 (Helvetica-Bold)
  // Object 5: Font F3 (Courier)
  // For each page i: Page object + Content Stream object
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;
  objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`;
  objects[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`;
  objects[5] = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj`;

  let nextObjId = 6;
  for (const stream of pageStreams) {
    const pageObjId = nextObjId++;
    const contentObjId = nextObjId++;
    pageObjectIds.push(pageObjId);

    objects[pageObjId] = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`;
    objects[contentObjId] = `${contentObjId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`;
  }

  const kidsRef = pageObjectIds.map(id => `${id} 0 R`).join(' ');
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${kidsRef}] /Count ${pageObjectIds.length} >>\nendobj`;

  let pdfContent = `%PDF-1.4\n`;
  const offsets: number[] = [0];

  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdfContent.length;
    pdfContent += `${objects[i]}\n`;
  }

  const xrefOffset = pdfContent.length;
  pdfContent += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdfContent += `${offsetStr} 00000 n \n`;
  }

  pdfContent += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdfContent);
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadArchitectureJson(payload: ArchitectureExportPayload): void {
  const safeRepo = (payload.repository.repo || 'repository').replace(/[^a-z0-9_\-]/gi, '-');
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  triggerBrowserDownload(blob, `${safeRepo}-architecture-insights.json`);
}

export function downloadArchitecturePdf(payload: ArchitectureExportPayload): void {
  const safeRepo = (payload.repository.repo || 'repository').replace(/[^a-z0-9_\-]/gi, '-');
  const pdfBytes = generateSimplifiedPdfBytes(payload);
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  triggerBrowserDownload(blob, `${safeRepo}-architecture-summary.pdf`);
}
