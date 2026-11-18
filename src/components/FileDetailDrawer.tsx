import React, { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import {
  Code,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AnalyzedFile } from '../types';

interface FileDetailDrawerProps {
  file?: AnalyzedFile;
  selectedFilePath?: string;
  onClose: () => void;
  onSelectRelatedFile: (path: string) => void;
}

export const FileDetailDrawer: React.FC<FileDetailDrawerProps> = ({
  file,
  selectedFilePath,
  onSelectRelatedFile,
}) => {
  const [activeTab, setActiveTab] = useState<'explanation' | 'source'>('explanation');
  const [copied, setCopied] = useState(false);

  const codeLines = file?.rawCode ? file.rawCode.split('\n') : [];

  const highlightedCode = useMemo(() => {
    if (!file?.rawCode) return [];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let grammar = Prism.languages.javascript;
    if (ext === 'ts' || ext === 'tsx') grammar = Prism.languages.typescript || Prism.languages.javascript;
    else if (ext === 'json') grammar = Prism.languages.json || Prism.languages.javascript;
    else if (ext === 'py') grammar = Prism.languages.python || Prism.languages.javascript;
    else if (ext === 'sh' || ext === 'bash') grammar = Prism.languages.bash || Prism.languages.javascript;

    return file.rawCode.split('\n').map(line => Prism.highlight(line || ' ', grammar, ext));
  }, [file?.rawCode, file?.name]);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0D131F] text-slate-600 dark:text-slate-400">
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
          <Info className="w-5 h-5" />
        </div>
        {selectedFilePath ? (
          <>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono mb-1">
              {selectedFilePath.split('/').pop()}
            </h4>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
              {selectedFilePath}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
              This file was not included in the prioritized deep-analysis subset. Switch the File Explorer filter to <strong>Analyzed</strong> to browse analyzed modules, or raise the <strong>Analyzed Files Cap</strong> in Settings.
            </p>
          </>
        ) : (
          <>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              No File Selected
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
              Select any analyzed file in the left File Explorer or click <strong>Inspect file</strong> on a Mind Map node to view its functions, contracts, and source code.
            </p>
          </>
        )}
      </div>
    );
  }

  const handleCopy = () => {
    if (!file.rawCode) return;
    navigator.clipboard.writeText(file.rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0D131F] overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* File Identity Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800/90 bg-slate-50/60 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
              {file.role}
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate font-mono">
              {file.name}
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
            {file.lineCount || codeLines.length} lines
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
          {file.path}
        </p>
      </div>

      {/* Sub-Tabs: Analysis vs Source Code */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/90 text-xs bg-white dark:bg-[#0D131F] shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('explanation')}
          className={`flex-1 py-2.5 text-xs text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'explanation'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Module Analysis</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('source')}
          className={`flex-1 py-2.5 text-xs text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'source'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span className="tabular-nums">Source Code ({file.lineCount || codeLines.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-[#0D131F]">
        {activeTab === 'explanation' ? (
          <div className="space-y-5 text-sm">
            {/* Purpose */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1.5">
                Purpose & Scope
              </h4>
              <p className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 text-xs">
                {file.purpose}
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1.5">
                Key Responsibilities
              </h4>
              <ul className="space-y-1.5">
                {file.responsibilities.map((resp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Input & Output */}
            {file.inputOutput && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <span className="text-[11px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                    Accepts / Input
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 text-xs mt-1 block leading-normal font-mono">
                    {file.inputOutput.input || 'Module initialization'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <span className="text-[11px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                    Returns / Output
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 text-xs mt-1 block leading-normal font-mono">
                    {file.inputOutput.output || 'Exported bindings'}
                  </span>
                </div>
              </div>
            )}

            {/* Key Functions */}
            {file.keyFunctions.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-2 tabular-nums">
                  Functions & Methods ({file.keyFunctions.length})
                </h4>
                <div className="space-y-2">
                  {file.keyFunctions.map((fn, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                        {fn.signature || `${fn.name}()`}
                      </div>
                      {fn.purpose && (
                        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                          {fn.purpose}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Imports */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1.5 tabular-nums">
                Dependencies ({file.imports.length})
              </h4>
              {file.imports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 italic text-xs">No dependencies.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {file.imports.map((imp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-xs rounded border border-slate-200 dark:border-slate-800"
                    >
                      {imp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Imported By */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1.5 tabular-nums">
                Consumers ({file.importedBy.length})
              </h4>
              {file.importedBy.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 italic text-xs">
                  No internal consumers.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {file.importedBy.map(dep => (
                    <button
                      key={dep}
                      type="button"
                      onClick={() => onSelectRelatedFile(dep)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 font-mono text-xs rounded border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{dep.split('/').pop()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Source Code Viewer */
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {file.name} · {codeLines.length} lines
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>{copied ? 'Copied' : 'Copy code'}</span>
              </button>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-[#090D16] rounded-lg overflow-auto border border-slate-200 dark:border-slate-800 font-mono text-[13px] p-2 leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  {codeLines.map((line, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="text-slate-400 dark:text-slate-600 select-none text-right pr-3 pl-1 w-10 align-top text-xs font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td
                        className="text-slate-900 dark:text-slate-100 whitespace-pre font-mono pr-2"
                        dangerouslySetInnerHTML={{ __html: highlightedCode[idx] || ' ' }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
