import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileExplorer } from './components/FileExplorer';
import { MindMap } from './components/MindMap';
import { ExecutionFlowViewer } from './components/ExecutionFlowViewer';
import { DependencyGraph } from './components/DependencyGraph';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import { UnifiedRightPanel } from './components/UnifiedRightPanel';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useTheme } from './hooks/useTheme';
import {
  analyzeRepository,
  getSampleRepos,
  loadSampleRepo,
} from './services/api';
import { CodebaseAnalysisResult, SampleRepoInfo } from './types';
import {
  Layers,
  Activity,
  Network,
  MessageSquare,
  AlertCircle,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  BookOpen,
  Code2,
  GitBranch,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [data, setData] = useState<CodebaseAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('Fetching repository tree from GitHub...');
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleRepoInfo[]>([]);

  // Workspace center tab: 4 primary views
  const [activeTab, setActiveTab] = useState<'mindmap' | 'execution' | 'dependencies' | 'overview'>('mindmap');
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>(undefined);

  // Right panel (File Inspector + Ask AI) is strictly user-controlled and closed by default ('none')
  const [rightPanelTab, setRightPanelTab] = useState<'none' | 'inspector' | 'copilot'>('none');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  // Fetch sample repos on mount & load express by default
  useEffect(() => {
    getSampleRepos().then(s => setSamples(s));
    loadSampleRepo('express')
      .then(result => {
        setData(result);
        const firstFile = Object.keys(result.analyzedFiles)[0];
        if (firstFile) setSelectedFilePath(firstFile);
      })
      .catch(err => {
        console.warn('Initial sample load failed:', err);
      });
  }, []);

  const handleAnalyze = async (url: string, token?: string) => {
    setIsLoading(true);
    setError(null);
    setRightPanelTab('none');
    setLoadingStepIndex(0);
    setLoadingStepText('Validating repository and fetching file tree...');

    const timer1 = setTimeout(() => {
      setLoadingStepIndex(1);
      setLoadingStepText('Parsing source files and extracting definitions...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setLoadingStepIndex(2);
      setLoadingStepText('Synthesizing architecture and execution flows with Gemini AI...');
    }, 2400);

    try {
      const result = await analyzeRepository(url, token);
      setData(result);
      const firstAnalyzed = Object.keys(result.analyzedFiles)[0];
      if (firstAnalyzed) setSelectedFilePath(firstAnalyzed);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect and analyze the repository.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    setIsLoading(true);
    setError(null);
    setRightPanelTab('none');
    setLoadingStepIndex(0);
    setLoadingStepText('Loading curated repository analysis...');
    try {
      const result = await loadSampleRepo(sampleId);
      setData(result);
      const firstFile = Object.keys(result.analyzedFiles)[0];
      if (firstFile) setSelectedFilePath(firstFile);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample repository.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
    setRightPanelTab('inspector');
  };

  const handleToggleCopilot = () => {
    setRightPanelTab(prev => (prev === 'copilot' ? 'none' : 'copilot'));
  };

  const handleToggleInspector = () => {
    setRightPanelTab(prev => (prev === 'inspector' ? 'none' : 'inspector'));
  };

  const selectedFile =
    selectedFilePath && data?.analyzedFiles ? data.analyzedFiles[selectedFilePath] : undefined;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#090D16] font-sans text-slate-900 dark:text-slate-100 antialiased overflow-hidden transition-colors">
      {/* Top Navigation Header */}
      <Navbar
        onAnalyze={handleAnalyze}
        onSelectSample={handleSelectSample}
        isLoading={isLoading}
        metadata={data?.metadata}
        samples={samples}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
      />

      {/* Error State Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 px-4 py-2.5 flex items-center justify-between text-red-600 dark:text-red-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-bold ml-4 text-base leading-none"
            title="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Progress Steps Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-[#0D131F] border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-900 dark:text-slate-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin shrink-0" />
            <span className="font-medium">{loadingStepText}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className={loadingStepIndex >= 0 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
              1. Fetch
            </span>
            <span>&rarr;</span>
            <span className={loadingStepIndex >= 1 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
              2. Parse
            </span>
            <span>&rarr;</span>
            <span className={loadingStepIndex >= 2 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
              3. AI Synthesize
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {data ? (
          <>
            {/* Left Sidebar: 280px File Explorer, collapsible */}
            {isLeftSidebarOpen && (
              <div className="w-[280px] shrink-0 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] z-20 transition-colors">
                <FileExplorer
                  tree={data.fileTree}
                  selectedFilePath={selectedFilePath}
                  onSelectFile={handleSelectFile}
                  analyzedCount={data.metadata.analyzedFilesCount}
                  totalCount={data.metadata.totalFiles}
                />
              </div>
            )}

            {/* Center Workspace */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#090D16] relative transition-colors">
              {/* Organized Workspace Sub-Header Bar */}
              <div className="h-11 border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between bg-white dark:bg-[#0D131F] select-none shrink-0 gap-2 transition-colors">
                {/* Left Group: Sidebar Toggle + Active Repository Context */}
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                      isLeftSidebarOpen
                        ? 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/70 text-indigo-600 dark:text-indigo-300'
                    }`}
                    title={isLeftSidebarOpen ? 'Hide File Explorer' : 'Show File Explorer'}
                  >
                    {isLeftSidebarOpen ? (
                      <PanelLeftClose className="w-3.5 h-3.5" />
                    ) : (
                      <PanelLeftOpen className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Files</span>
                  </button>

                  <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                    <a
                      href={`https://github.com/${data.metadata.fullName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 truncate transition-colors"
                      title={`Open ${data.metadata.fullName} on GitHub`}
                    >
                      <span className="truncate">{data.metadata.fullName}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                    </a>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <GitBranch className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      {data.metadata.defaultBranch}
                    </span>
                  </div>
                </div>

                {/* Center Group: 4 Primary Workspace Views */}
                <div
                  className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-x-auto"
                  role="tablist"
                  aria-label="Workspace views"
                >
                  <button
                    role="tab"
                    aria-selected={activeTab === 'mindmap'}
                    onClick={() => setActiveTab('mindmap')}
                    className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      activeTab === 'mindmap'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Mind Map</span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === 'execution'}
                    onClick={() => setActiveTab('execution')}
                    className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      activeTab === 'execution'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Execution Flows</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                      {data.executionFlows.length}
                    </span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === 'dependencies'}
                    onClick={() => setActiveTab('dependencies')}
                    className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      activeTab === 'dependencies'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Dependencies</span>
                    {data.circularDependencies && data.circularDependencies.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title={`${data.circularDependencies.length} circular dependencies`} />
                    )}
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      activeTab === 'overview'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                </div>

                {/* Right Group: Explicit User-Controlled Side Drawers (File Inspector & Ask AI) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleToggleInspector}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      rightPanelTab === 'inspector'
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-semibold'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title="Toggle File Inspector drawer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">File Inspector</span>
                    {selectedFile && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block" />
                    )}
                  </button>

                  <button
                    onClick={handleToggleCopilot}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                      rightPanelTab === 'copilot'
                        ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title="Open Ask AI Copilot drawer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              {/* Central Viewport */}
              <div className="flex-1 relative overflow-hidden">
                {activeTab === 'mindmap' && (
                  <MindMap
                    data={data.mindMap}
                    onSelectFile={handleSelectFile}
                    isDark={isDark}
                  />
                )}
                {activeTab === 'execution' && (
                  <ExecutionFlowViewer
                    flows={data.executionFlows}
                    onSelectFile={handleSelectFile}
                    isDark={isDark}
                  />
                )}
                {activeTab === 'dependencies' && (
                  <DependencyGraph
                    dependencies={data.dependencies}
                    analyzedFiles={data.analyzedFiles}
                    circularDependencies={data.circularDependencies}
                    onSelectFile={handleSelectFile}
                  />
                )}
                {activeTab === 'overview' && (
                  <ArchitectureOverview
                    summary={data.architectureSummary}
                    metadata={data.metadata}
                    dependencies={data.dependencies}
                    circularDependencies={data.circularDependencies}
                    analyzedFiles={data.analyzedFiles}
                    executionFlows={data.executionFlows}
                    onSelectFile={handleSelectFile}
                    isDark={isDark}
                  />
                )}
              </div>
            </div>

            {/* Unified Right Drawer (File Inspector + Ask AI), only open when explicitly requested */}
            {rightPanelTab !== 'none' && (
              <UnifiedRightPanel
                activeTab={rightPanelTab}
                onTabChange={tab => setRightPanelTab(tab)}
                onClose={() => setRightPanelTab('none')}
                selectedFile={selectedFile}
                selectedFilePath={selectedFilePath}
                owner={data.metadata.owner}
                repo={data.metadata.repo}
                onSelectFile={handleSelectFile}
              />
            )}
          </>
        ) : (
          /* Empty / Landing State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#090D16] select-none transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs">
              <GitBranch className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              CodeAtlas AI
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mt-2 mb-8 leading-relaxed">
              Explore codebase architecture mind maps, trace execution flows, and inspect module dependencies with Gemini AI. Enter any public GitHub repository above or select a curated sample.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
              {samples.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-mono">
                        {sample.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {sample.framework.split('/')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <span>Analyze repo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Static Heuristic Extraction
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Interactive Mind Maps
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Sequence Execution Flows
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
