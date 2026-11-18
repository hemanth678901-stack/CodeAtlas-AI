export type FileRole =
  | 'entry'
  | 'route'
  | 'controller'
  | 'service'
  | 'model'
  | 'component'
  | 'util'
  | 'config'
  | 'middleware'
  | 'style'
  | 'test'
  | 'other';

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues?: number;
  defaultBranch: string;
  license?: string;
  detectedLanguages: Record<string, number>;
  primaryFramework: string;
  totalFiles: number;
  analyzedFilesCount: number;
  commitSha?: string;
  repoUrl: string;
}

export interface FileNode {
  path: string;
  name: string;
  type: 'blob' | 'tree';
  size?: number;
  isAnalyzed?: boolean;
  role?: FileRole;
  children?: FileNode[];
}

export interface ExtractedFunction {
  name: string;
  signature?: string;
  purpose?: string;
  startLine?: number;
}

export interface AnalyzedFile {
  path: string;
  name: string;
  extension: string;
  purpose: string;
  responsibilities: string[];
  keyFunctions: ExtractedFunction[];
  imports: string[];
  importedBy: string[];
  role: FileRole;
  rawCode?: string;
  inputOutput?: {
    input?: string;
    output?: string;
  };
  lineCount?: number;
  isTruncated?: boolean;
}

export interface MindMapGraphNode {
  id: string;
  label: string;
  type: 'repo' | 'folder' | 'file' | 'function' | 'entry';
  path?: string;
  role?: FileRole | string;
  description?: string;
  functions?: string[];
}

export interface MindMapGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: 'contains' | 'imports' | 'calls' | 'inferred';
  label?: string;
}

export interface MindMapData {
  nodes: MindMapGraphNode[];
  edges: MindMapGraphEdge[];
}

export interface ExecutionStep {
  step: number;
  actor: string;
  action: string;
  target: string;
  fileReference?: string;
}

export interface ExecutionFlowItem {
  id: string;
  title: string;
  description: string;
  mermaidSyntax: string;
  isPartialOrInferred: boolean;
  steps: ExecutionStep[];
}

export interface DependencyLink {
  from: string;
  to: string;
  isInternal: boolean;
  isCircular?: boolean;
}

export interface ArchitectureSummary {
  overview: string;
  keyPatterns: string[];
  mermaidArchitecture: string;
  layerBreakdown?: {
    layer: string;
    description: string;
    files: string[];
  }[];
}

export interface CodebaseAnalysisResult {
  metadata: RepoMetadata;
  fileTree: FileNode;
  analyzedFiles: Record<string, AnalyzedFile>;
  mindMap: MindMapData;
  executionFlows: ExecutionFlowItem[];
  dependencies: DependencyLink[];
  architectureSummary: ArchitectureSummary;
  skippedFiles: string[];
  circularDependencies: string[][];
  source: 'live' | 'sample';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  referencedFiles?: string[];
}

export interface SampleRepoInfo {
  id: string;
  name: string;
  owner: string;
  repo: string;
  url: string;
  description: string;
  framework: string;
  badgeColor: string;
}

export interface GeminiModelOption {
  id: string;
  displayName: string;
  category: string;
  description: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedActions?: string[];
  isRecommended?: boolean;
  source?: 'api' | 'catalog';
}

