import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  Search,
  PlayCircle,
  X,
} from 'lucide-react';
import { FileNode, FileRole } from '../types';

interface FileExplorerProps {
  tree: FileNode;
  selectedFilePath?: string;
  onSelectFile: (path: string) => void;
  analyzedCount: number;
  totalCount: number;
}

const getRoleTag = (role?: FileRole) => {
  if (!role) return null;
  switch (role) {
    case 'entry':
      return <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">entry</span>;
    case 'route':
      return <span className="text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400">route</span>;
    case 'service':
      return <span className="text-[10px] font-mono font-medium text-sky-600 dark:text-sky-400">svc</span>;
    case 'controller':
      return <span className="text-[10px] font-mono font-medium text-purple-600 dark:text-purple-400">ctrl</span>;
    case 'model':
      return <span className="text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400">model</span>;
    case 'component':
      return <span className="text-[10px] font-mono font-medium text-teal-600 dark:text-teal-400">ui</span>;
    case 'config':
      return <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">cfg</span>;
    default:
      return null;
  }
};

const TreeNode: React.FC<{
  node: FileNode;
  level: number;
  filterText: string;
  onlyAnalyzed: boolean;
  selectedFilePath?: string;
  onSelectFile: (path: string) => void;
}> = ({ node, level, filterText, onlyAnalyzed, selectedFilePath, onSelectFile }) => {
  const [isOpen, setIsOpen] = useState(level < 2 || Boolean(filterText) || onlyAnalyzed);

  const matchesFilter = (n: FileNode): boolean => {
    if (n.type === 'blob') {
      if (onlyAnalyzed && !n.isAnalyzed) return false;
      if (!filterText) return true;
      return (
        n.name.toLowerCase().includes(filterText.toLowerCase()) ||
        n.path.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    if (n.children) {
      return n.children.some(matchesFilter);
    }
    return false;
  };

  if (!matchesFilter(node)) {
    return null;
  }

  const isExpanded = isOpen || Boolean(filterText) || onlyAnalyzed;

  if (node.type === 'tree') {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-md cursor-pointer text-xs text-slate-800 dark:text-slate-200 select-none transition-colors"
          style={{ paddingLeft: `${level * 12 + 6}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          )}
          <span className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">
            {node.name}
          </span>
        </div>
        {isExpanded && node.children && (
          <div className="border-l border-slate-200 dark:border-slate-800 ml-3.5">
            {node.children.map(child => (
              <TreeNode
                key={child.path}
                node={child}
                level={level + 1}
                filterText={filterText}
                onlyAnalyzed={onlyAnalyzed}
                selectedFilePath={selectedFilePath}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFilePath === node.path;

  return (
    <div
      onClick={() => onSelectFile(node.path)}
      className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs select-none transition-colors ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-medium'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
      style={{ paddingLeft: `${level * 12 + 10}px` }}
    >
      <div className="flex items-center gap-1.5 truncate">
        {node.role === 'entry' ? (
          <PlayCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <FileCode
            className={`w-3.5 h-3.5 shrink-0 ${
              isSelected
                ? 'text-indigo-600 dark:text-indigo-400'
                : node.isAnalyzed
                ? 'text-slate-600 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-600'
            }`}
          />
        )}
        <span
          className={`truncate font-mono text-xs ${
            !node.isAnalyzed && !isSelected ? 'opacity-70' : ''
          }`}
        >
          {node.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {getRoleTag(node.role)}
      </div>
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  tree,
  selectedFilePath,
  onSelectFile,
  analyzedCount,
  totalCount,
}) => {
  const [filterText, setFilterText] = useState('');
  const [onlyAnalyzed, setOnlyAnalyzed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0D131F] border-r border-slate-200 dark:border-slate-800/90 select-none w-[280px] transition-colors duration-150">
      {/* Header with Search & Mode Toggle */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Repository Files
          </span>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {analyzedCount} / {totalCount} analyzed
          </span>
        </div>

        {/* Segmented Filter: All vs Analyzed Only */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setOnlyAnalyzed(false)}
            className={`py-1 text-[11px] font-medium rounded-md transition-colors tabular-nums ${
              !onlyAnalyzed
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Files ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setOnlyAnalyzed(true)}
            className={`py-1 text-[11px] font-medium rounded-md transition-colors tabular-nums ${
              onlyAnalyzed
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Analyzed ({analyzedCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Filter file names..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {tree.children && tree.children.length > 0 ? (
          tree.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              level={0}
              filterText={filterText}
              onlyAnalyzed={onlyAnalyzed}
              selectedFilePath={selectedFilePath}
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
            No source files found
          </div>
        )}
      </div>

      {/* Subtle Footer Legend */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <span>Click file to inspect</span>
        <span className="flex items-center gap-1">
          <PlayCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Entrypoint
        </span>
      </div>
    </div>
  );
};
