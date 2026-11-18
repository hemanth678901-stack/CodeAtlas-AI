import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  Layers,
  CheckCircle2,
  FileCode,
  GitCommit,
  Scale,
  Download,
  FileJson,
  FileText,
  ChevronDown,
  Check,
  Network,
  AlertTriangle,
} from 'lucide-react';
import {
  AnalyzedFile,
  ArchitectureSummary,
  DependencyLink,
  ExecutionFlowItem,
  RepoMetadata,
} from '../types';
import {
  buildArchitectureExportPayload,
  downloadArchitectureJson,
  downloadArchitecturePdf,
} from '../utils/exportInsights';

interface ArchitectureOverviewProps {
  summary: ArchitectureSummary;
  metadata: RepoMetadata;
  dependencies?: DependencyLink[];
  circularDependencies?: string[][];
  analyzedFiles?: Record<string, AnalyzedFile>;
  executionFlows?: ExecutionFlowItem[];
  onSelectFile?: (path: string) => void;
  isDark?: boolean;
}

export const ArchitectureOverview: React.FC<ArchitectureOverviewProps> = ({
  summary,
  metadata,
  dependencies = [],
  circularDependencies = [],
  analyzedFiles = {},
  executionFlows = [],
  onSelectFile,
  isDark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [lastExportFormat, setLastExportFormat] = useState<'json' | 'pdf' | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!summary.mermaidArchitecture || !containerRef.current) return;
    let isMounted = true;

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      themeVariables: isDark
        ? {
            darkMode: true,
            primaryColor: '#1E1B4B',
            primaryTextColor: '#E0E7FF',
            primaryBorderColor: '#4F46E5',
            lineColor: '#94A3B8',
            secondaryColor: '#0F172A',
            tertiaryColor: '#1E293B',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
          }
        : {
            darkMode: false,
            primaryColor: '#EEF2FF',
            primaryTextColor: '#1E1B4B',
            primaryBorderColor: '#C7D2FE',
            lineColor: '#64748B',
            secondaryColor: '#F8FAFC',
            tertiaryColor: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
          },
      securityLevel: 'loose',
    });

    const renderMermaid = async () => {
      const id = `arch-${Math.random().toString(36).substring(2, 9)}`;
      try {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';
        const { svg } = await mermaid.render(id, summary.mermaidArchitecture);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        const stray = document.getElementById(id) || document.getElementById(`d${id}`);
        if (stray) stray.remove();
        console.warn('Arch mermaid render error:', err);
      }
    };

    renderMermaid();
    return () => {
      isMounted = false;
    };
  }, [summary.mermaidArchitecture, isDark]);

  const handleExport = (format: 'json' | 'pdf') => {
    const payload = buildArchitectureExportPayload({
      metadata,
      summary,
      dependencies,
      circularDependencies,
      analyzedFiles,
      executionFlows,
    });

    if (format === 'json') {
      downloadArchitectureJson(payload);
    } else {
      downloadArchitecturePdf(payload);
    }

    setLastExportFormat(format);
    setShowExportMenu(false);
    setTimeout(() => {
      setLastExportFormat(null);
    }, 2500);
  };

  const languagesList = Object.entries(metadata.detectedLanguages || {});
  const internalDepsCount = dependencies.filter(d => d.isInternal).length;
  const externalDepsCount = dependencies.length - internalDepsCount;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#090D16] p-6 transition-colors duration-150">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Repository Executive Summary, Telemetry & Export Action */}
        <div className="bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-800/90 rounded-xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                System Architecture Overview
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Unboxed Metadata Telemetry */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <span>{metadata.primaryFramework}</span>
                {metadata.license && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      {metadata.license}
                    </span>
                  </>
                )}
                {metadata.commitSha && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5" />
                      {metadata.commitSha.slice(0, 7)}
                    </span>
                  </>
                )}
              </div>

              {/* Export Insights Button & Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(prev => !prev)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  aria-haspopup="menu"
                  aria-expanded={showExportMenu}
                  title="Export dependency and architecture insights"
                >
                  {lastExportFormat ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Exported {lastExportFormat.toUpperCase()}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </>
                  )}
                </button>

                {showExportMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-40"
                  >
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                      Export Architecture & Dependencies
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleExport('json')}
                      className="w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left flex items-start gap-2.5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          Structured JSON (.json)
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Complete machine-readable architecture, layer breakdown, and dependency graph.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleExport('pdf')}
                      className="w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left flex items-start gap-2.5 transition-colors group mt-0.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          Simplified PDF Summary (.pdf)
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          Formatted executive PDF report of architectural patterns, layers, and dependencies.
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
            {summary.overview}
          </p>

          {/* Language Distribution & Dependency Telemetry Strip */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
            {languagesList.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  Languages:
                </span>
                {languagesList.map(([lang, pct], idx) => (
                  <React.Fragment key={lang}>
                    {idx > 0 && <span className="text-slate-300 dark:text-slate-700">·</span>}
                    <span className="font-mono tabular-nums">
                      {lang} ({pct}%)
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Network className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {internalDepsCount} internal / {externalDepsCount} external deps
              </span>
              {circularDependencies.length > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {circularDependencies.length} circular{' '}
                  {circularDependencies.length === 1 ? 'cycle' : 'cycles'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Architectural Design Patterns */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Detected Architectural Patterns
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {summary.keyPatterns.map((pattern, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F] shadow-2xs"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{pattern}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mermaid Architecture Layer Graph */}
        {summary.mermaidArchitecture && (
          <div className="border border-slate-200 dark:border-slate-800/90 rounded-xl p-6 bg-white dark:bg-[#0D131F] shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Component & Module Layering
            </h4>
            <div className="flex justify-center overflow-x-auto p-2">
              <div ref={containerRef} className="max-w-full text-center" />
            </div>
          </div>
        )}

        {/* Layer-by-Layer Breakdown */}
        {summary.layerBreakdown && summary.layerBreakdown.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Subsystems & Directory Layers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.layerBreakdown.map((layer, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F] shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm font-mono">
                        {layer.layer}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {layer.files.length} {layer.files.length === 1 ? 'module' : 'modules'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {layer.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {layer.files.map(filePath => (
                      <button
                        key={filePath}
                        type="button"
                        onClick={() => onSelectFile && onSelectFile(filePath)}
                        className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-mono border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5"
                        title={`Inspect ${filePath}`}
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{filePath.split('/').pop()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
