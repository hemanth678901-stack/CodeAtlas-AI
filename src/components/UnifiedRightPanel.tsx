import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  MessageSquare,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AnalyzedFile } from '../types';
import { FileDetailDrawer } from './FileDetailDrawer';
import { AIAssistant } from './AIAssistant';

interface UnifiedRightPanelProps {
  activeTab: 'inspector' | 'copilot';
  onTabChange: (tab: 'inspector' | 'copilot') => void;
  onClose: () => void;
  selectedFile?: AnalyzedFile;
  selectedFilePath?: string;
  owner: string;
  repo: string;
  onSelectFile: (path: string) => void;
}

export const UnifiedRightPanel: React.FC<UnifiedRightPanelProps> = ({
  activeTab,
  onTabChange,
  onClose,
  selectedFile,
  selectedFilePath,
  owner,
  repo,
  onSelectFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Allow closing drawer with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <aside
      className={`h-full bg-white dark:bg-[#0D131F] border-l border-slate-200 dark:border-slate-800/90 flex flex-col shadow-lg z-30 transition-all duration-150 select-none ${
        isExpanded
          ? 'w-full lg:w-[740px]'
          : 'w-full sm:w-[440px] lg:w-[460px]'
      }`}
    >
      {/* Single Clean Control Header */}
      <div className="h-11 border-b border-slate-200 dark:border-slate-800/90 px-3 flex items-center justify-between bg-white dark:bg-[#0D131F] shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onTabChange('inspector')}
            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'inspector'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>File Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('copilot')}
            className={`px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'copilot'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-semibold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>

        {/* Panel Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:block transition-colors"
            title={isExpanded ? 'Standard width' : 'Expand width'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-[#0D131F]">
        {activeTab === 'inspector' ? (
          <FileDetailDrawer
            file={selectedFile}
            selectedFilePath={selectedFilePath}
            onClose={onClose}
            onSelectRelatedFile={onSelectFile}
          />
        ) : (
          <AIAssistant
            owner={owner}
            repo={repo}
            onSelectFile={onSelectFile}
          />
        )}
      </div>
    </aside>
  );
};
