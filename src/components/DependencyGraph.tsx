import React, { useState, useMemo } from 'react';
import {
  Link2,
  ArrowRight,
  AlertTriangle,
  Search,
  FileText,
} from 'lucide-react';
import { DependencyLink, AnalyzedFile } from '../types';

interface DependencyGraphProps {
  dependencies: DependencyLink[];
  analyzedFiles: Record<string, AnalyzedFile>;
  circularDependencies: string[][];
  onSelectFile: (path: string) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  dependencies,
  analyzedFiles,
  circularDependencies,
  onSelectFile,
}) => {
  const fileKeys = useMemo(() => Object.keys(analyzedFiles), [analyzedFiles]);
  const [selectedFile, setSelectedFile] = useState<string>(fileKeys[0] || '');
  const [filterQuery, setFilterQuery] = useState('');

  const activeSelectedFile = analyzedFiles[selectedFile] ? selectedFile : fileKeys[0] || '';

  const outgoing = useMemo(
    () => dependencies.filter(d => d.from === activeSelectedFile),
    [dependencies, activeSelectedFile]
  );

  const incoming = useMemo(
    () => dependencies.filter(d => d.to === activeSelectedFile),
    [dependencies, activeSelectedFile]
  );

  const filteredOutgoing = useMemo(
    () =>
      outgoing.filter(
        d => !filterQuery || d.to.toLowerCase().includes(filterQuery.toLowerCase())
      ),
    [outgoing, filterQuery]
  );

  const filteredIncoming = useMemo(
    () =>
      incoming.filter(
        d => !filterQuery || d.from.toLowerCase().includes(filterQuery.toLowerCase())
      ),
    [incoming, filterQuery]
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#090D16] overflow-hidden select-none transition-colors duration-150">
      {/* Top Controls Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Module Dependency Matrix
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 ml-3 font-mono tabular-nums">
              {dependencies.length} total links · {circularDependencies.length} circular cycles
            </span>
          </div>
        </div>

        {/* Module Selector & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter links..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-600 w-44"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Focus Module:</span>
            <select
              value={activeSelectedFile}
              onChange={e => setSelectedFile(e.target.value)}
              className="text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-1 focus:outline-none focus:border-indigo-600 max-w-xs truncate"
            >
              {fileKeys.map(path => (
                <option key={path} value={path}>
                  {path}
                </option>
              ))}
            </select>

            {activeSelectedFile && (
              <button
                type="button"
                onClick={() => onSelectFile(activeSelectedFile)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 transition-colors whitespace-nowrap"
                title="Open active module in File Inspector"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Circular Dependency Alert Banner */}
      {circularDependencies.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              Circular Dependency Detected ({circularDependencies.length}):
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              {circularDependencies.map((cycle, i) => (
                <div
                  key={i}
                  className="font-mono text-xs bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-800"
                >
                  {cycle.join(' → ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Matrix */}
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-w-7xl w-full mx-auto">
        {/* Outgoing Imports Column */}
        <div className="border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 bg-white dark:bg-[#0D131F] flex flex-col shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider tabular-nums">
                Outgoing Imports ({outgoing.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Modules imported by{' '}
                <code className="text-indigo-600 dark:text-indigo-400">
                  {activeSelectedFile.split('/').pop()}
                </code>
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {filteredOutgoing.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">
                No outgoing imports match filter
              </div>
            ) : (
              filteredOutgoing.map((dep, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (dep.isInternal && analyzedFiles[dep.to]) {
                      setSelectedFile(dep.to);
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                    dep.isInternal
                      ? 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer'
                      : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-mono text-xs truncate text-slate-900 dark:text-slate-100">
                      {dep.to}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {dep.isInternal ? 'internal' : 'external'}
                    </span>
                    {dep.isInternal && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSelectFile(dep.to);
                        }}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incoming Consumers Column */}
        <div className="border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 bg-white dark:bg-[#0D131F] flex flex-col shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider tabular-nums">
                Imported By ({incoming.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Internal consumers of{' '}
                <code className="text-indigo-600 dark:text-indigo-400">
                  {activeSelectedFile.split('/').pop()}
                </code>
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {filteredIncoming.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">
                No internal consumers match filter
              </div>
            ) : (
              filteredIncoming.map((dep, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (analyzedFiles[dep.from]) {
                      setSelectedFile(dep.from);
                    }
                  }}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer text-xs flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs truncate text-slate-900 dark:text-slate-100">
                      {dep.from}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      consumer
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectFile(dep.from);
                      }}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
