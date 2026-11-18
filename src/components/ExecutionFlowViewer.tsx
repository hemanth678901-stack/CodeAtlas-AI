import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  Info,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { ExecutionFlowItem } from '../types';

interface ExecutionFlowViewerProps {
  flows: ExecutionFlowItem[];
  onSelectFile?: (path: string) => void;
  isDark?: boolean;
}

export const ExecutionFlowViewer: React.FC<ExecutionFlowViewerProps> = ({
  flows,
  onSelectFile,
  isDark = false,
}) => {
  const [selectedFlowIndex, setSelectedFlowIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeFlow = flows[selectedFlowIndex] || flows[0];

  useEffect(() => {
    if (!activeFlow || !containerRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#090D16',
            primaryColor: '#1E293B',
            primaryTextColor: '#F8FAFC',
            primaryBorderColor: '#6366F1',
            lineColor: '#818CF8',
            secondaryColor: '#0F172A',
            tertiaryColor: '#1E293B',
            noteBkgColor: '#1E293B',
            noteTextColor: '#F8FAFC',
            actorBkg: '#0F172A',
            actorBorder: '#334155',
            actorTextColor: '#F8FAFC',
            actorLineColor: '#475569',
            signalColor: '#818CF8',
            signalTextColor: '#F8FAFC',
          }
        : {
            darkMode: false,
            background: '#FFFFFF',
            primaryColor: '#F8FAFC',
            primaryTextColor: '#0F172A',
            primaryBorderColor: '#4F46E5',
            lineColor: '#4F46E5',
            secondaryColor: '#FFFFFF',
            tertiaryColor: '#F8FAFC',
            noteBkgColor: '#F8FAFC',
            noteTextColor: '#0F172A',
            actorBkg: '#FFFFFF',
            actorBorder: '#CBD5E1',
            actorTextColor: '#0F172A',
            actorLineColor: '#94A3B8',
            signalColor: '#4F46E5',
            signalTextColor: '#0F172A',
          },
    });

    let isCancelled = false;
    const renderId = `flow-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const renderDiagram = async () => {
      try {
        if (!containerRef.current || isCancelled) return;
        containerRef.current.innerHTML =
          '<div class="text-xs text-slate-500 py-8">Rendering sequence diagram...</div>';
        const { svg } = await mermaid.render(renderId, activeFlow.mermaidSyntax);
        if (!isCancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        const stray = document.getElementById(renderId) || document.getElementById(`d${renderId}`);
        if (stray) stray.remove();
        console.warn('Mermaid render error:', err);
        if (!isCancelled && containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-6 text-center max-w-md mx-auto">
              <div class="text-xs font-semibold mb-2 font-mono">${activeFlow.title}</div>
              <div class="p-4 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-left font-mono whitespace-pre-wrap">
                ${activeFlow.mermaidSyntax}
              </div>
            </div>
          `;
        }
      }
    };

    renderDiagram();
    return () => {
      isCancelled = true;
    };
  }, [activeFlow, isDark]);

  if (!flows || flows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm">
        No execution flows available for this codebase.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#090D16] overflow-hidden select-none transition-colors duration-150">
      {/* Left Pane: Flow Selector + Chronological Step Walkthrough */}
      <div className="w-full lg:w-96 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F] shrink-0 overflow-hidden">
        {/* Flow Selector Tabs */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/90">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Select Runtime Pathway ({flows.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {flows.map((flow, idx) => {
              const isSelected = selectedFlowIndex === idx;
              return (
                <button
                  key={flow.id}
                  type="button"
                  onClick={() => {
                    setSelectedFlowIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`px-3 py-2 text-left rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {flow.title}</span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                    {flow.steps.length} steps
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Flow Summary & Steps */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {activeFlow.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {activeFlow.description}
            </p>
          </div>

          <div className="pt-2 space-y-2">
            {activeFlow.steps.map((st, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-mono mb-1.5">
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-200">
                    Step {st.step}
                  </span>
                  {st.fileReference && (
                    <button
                      type="button"
                      onClick={() => onSelectFile && onSelectFile(st.fileReference!)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                      title={`Inspect ${st.fileReference}`}
                    >
                      <FileCode className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">
                        {st.fileReference.split('/').pop()}
                      </span>
                    </button>
                  )}
                </div>

                <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                  <span className="truncate text-indigo-600 dark:text-indigo-400 font-mono">
                    {st.actor}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-900 dark:text-slate-100 font-mono">
                    {st.target}
                  </span>
                </div>

                <div className="text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed text-xs">
                  {st.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Sequence Diagram Viewport */}
      <div className="flex-1 p-6 overflow-auto flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090D16] relative">
        {/* Floating Zoom Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono tabular-nums px-2 text-slate-700 dark:text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 max-w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs"
        >
          <div ref={containerRef} className="max-w-full overflow-x-auto text-center" />
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 shadow-xs flex items-center gap-1.5">
          {activeFlow.isPartialOrInferred ? (
            <>
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Inferred sequence based on module imports & exports</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Verified execution sequence</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
