import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sun,
  Moon,
  Monitor,
  Cpu,
  RefreshCw,
  Check,
  Sparkles,
} from 'lucide-react';
import { GeminiModelOption, RepoMetadata, SampleRepoInfo } from '../types';
import { ThemeMode } from '../hooks/useTheme';
import { DEFAULT_GEMINI_MODELS, getAvailableModels } from '../services/api';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onAnalyze: (url: string, token?: string, maxFiles?: number) => void;
  onSelectSample: (sampleId: string) => void;
  isLoading: boolean;
  metadata?: RepoMetadata;
  samples: SampleRepoInfo[];
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAnalyze,
  onSelectSample,
  isLoading,
  samples,
  themeMode,
  onThemeModeChange,
}) => {
  const [url, setUrl] = useState('https://github.com/expressjs/express');
  const [token, setToken] = useState(() => localStorage.getItem('codeatlas_github_token') || '');
  const [geminiModel, setGeminiModel] = useState(
    () => localStorage.getItem('codeatlas_gemini_model') || 'gemini-3.8-flash'
  );
  const [maxFiles, setMaxFiles] = useState(
    () => Number(localStorage.getItem('codeatlas_max_files')) || 40
  );
  const [availableModels, setAvailableModels] = useState<GeminiModelOption[]>(DEFAULT_GEMINI_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);

  const fetchModelsFromApi = async () => {
    setIsLoadingModels(true);
    try {
      const result = await getAvailableModels();
      if (result.models && result.models.length > 0) {
        setAvailableModels(result.models);
      }
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModelsFromApi();
  }, []);

  // Group models by category for both <optgroup> and interactive browser
  const groupedModels = useMemo(() => {
    const groups = new Map<string, GeminiModelOption[]>();
    for (const model of availableModels) {
      const cat = model.category || 'Additional API Models';
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(model);
    }
    return groups;
  }, [availableModels]);

  const categories = useMemo(() => ['ALL', ...Array.from(groupedModels.keys())], [groupedModels]);

  const filteredModels = useMemo(() => {
    const q = modelSearchQuery.trim().toLowerCase();
    return availableModels.filter(m => {
      const matchesCategory =
        selectedCategoryFilter === 'ALL' || m.category === selectedCategoryFilter;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        m.id.toLowerCase().includes(q) ||
        m.displayName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [availableModels, modelSearchQuery, selectedCategoryFilter]);

  const selectedModelDetails = useMemo(
    () => availableModels.find(m => m.id === geminiModel),
    [availableModels, geminiModel]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    setShowSampleDropdown(false);
    onAnalyze(url.trim(), token.trim() || undefined, maxFiles);
  };

  const handleSaveSettings = () => {
    if (token.trim()) {
      localStorage.setItem('codeatlas_github_token', token.trim());
    } else {
      localStorage.removeItem('codeatlas_github_token');
    }

    if (geminiModel.trim()) {
      localStorage.setItem('codeatlas_gemini_model', geminiModel.trim());
    }

    localStorage.setItem('codeatlas_max_files', String(maxFiles));
    setShowSettingsModal(false);
  };

  const formatTokenCount = (tokens?: number) => {
    if (!tokens) return null;
    if (tokens >= 1000000) return `${(tokens / 1048576).toFixed(0)}M tokens`;
    if (tokens >= 1000) return `${Math.round(tokens / 1024)}K tokens`;
    return `${tokens} tokens`;
  };

  return (
    <header className="bg-white dark:bg-[#0D131F] border-b border-slate-200 dark:border-slate-800/90 sticky top-0 z-40 select-none transition-colors duration-150">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <span className="font-display font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
            CodeAtlas <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </div>

        {/* Zone 2: Repository Search & Curated Samples */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full pl-9 pr-24 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs transition-colors"
              />

              {/* Sample Selector Trigger */}
              <div className="absolute inset-y-0 right-1.5 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                  className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <span>Samples</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap shrink-0 h-8.5"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze Repo</span>
              )}
            </button>
          </form>

          {/* Sample Repositories Popover */}
          {showSampleDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3 z-50">
              <div className="px-1 pb-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Load Curated Sample Repository</span>
                <button
                  onClick={() => setShowSampleDropdown(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {samples.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setShowSampleDropdown(false);
                      setUrl(sample.url || `https://github.com/${sample.owner}/${sample.repo}`);
                      onSelectSample(sample.id);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-mono">
                          {sample.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sample.framework.split('/')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone 3: Theme Switcher (Light / Dark / System), Model & Settings Trigger, PWA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 3-Way Segmented Theme Control */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            role="group"
            aria-label="Theme mode selector"
          >
            <button
              type="button"
              onClick={() => onThemeModeChange('light')}
              title="Light Theme"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
                themeMode === 'light'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Light</span>
            </button>

            <button
              type="button"
              onClick={() => onThemeModeChange('dark')}
              title="Dark Theme"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
                themeMode === 'dark'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => onThemeModeChange('system')}
              title="System Theme"
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
                themeMode === 'system'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">System</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              token.trim() || maxFiles !== 40 || geminiModel !== 'gemini-3.8-flash'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={`Workspace & Model Settings (Active: ${geminiModel})`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Settings</span>
            <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
              {geminiModel}
            </span>
          </button>

          <PWAInstallButton />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Workspace & Gemini API Model Settings
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-4">
              {/* 1. Gemini API Model Selector (Full API Catalog + Live Discovery) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <label
                      htmlFor="gemini-model-select"
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Gemini API Model Selector
                    </label>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/60">
                      {availableModels.length} models available
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={fetchModelsFromApi}
                    disabled={isLoadingModels}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors disabled:opacity-50"
                    title="Sync available models from Gemini API"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    <span>{isLoadingModels ? 'Syncing API...' : 'Refresh from API'}</span>
                  </button>
                </div>

                {/* Primary Categorized Dropdown (<select> with <optgroup>) */}
                <select
                  id="gemini-model-select"
                  value={geminiModel}
                  onChange={e => setGeminiModel(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 transition-colors"
                >
                  {Array.from(groupedModels.entries()).map(([category, modelsInCategory]) => (
                    <optgroup key={category} label={category}>
                      {modelsInCategory.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.id} — {model.displayName}
                          {model.isRecommended ? ' ★ Recommended' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {/* Active Model Summary Card */}
                {selectedModelDetails && (
                  <div className="mt-2.5 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-indigo-700 dark:text-indigo-300">
                          {selectedModelDetails.id}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          ({selectedModelDetails.displayName})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {selectedModelDetails.isRecommended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                            <Sparkles className="w-2.5 h-2.5" /> Recommended
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          {selectedModelDetails.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedModelDetails.description}
                    </p>
                    {(selectedModelDetails.inputTokenLimit ||
                      selectedModelDetails.outputTokenLimit ||
                      selectedModelDetails.supportedActions) && (
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {selectedModelDetails.inputTokenLimit && (
                          <span>
                            Context: {formatTokenCount(selectedModelDetails.inputTokenLimit)}
                          </span>
                        )}
                        {selectedModelDetails.outputTokenLimit && (
                          <span>
                            Max Output: {formatTokenCount(selectedModelDetails.outputTokenLimit)}
                          </span>
                        )}
                        {selectedModelDetails.supportedActions &&
                          selectedModelDetails.supportedActions.length > 0 && (
                            <span>
                              Capabilities: {selectedModelDetails.supportedActions.join(', ')}
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Filterable Catalog of All API Models */}
                <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={modelSearchQuery}
                        onChange={e => setModelSearchQuery(e.target.value)}
                        placeholder="Filter all API models by ID, capability, or series..."
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      />
                    </div>
                    <select
                      value={selectedCategoryFilter}
                      onChange={e => setSelectedCategoryFilter(e.target.value)}
                      className="text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                      aria-label="Filter models by category"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'ALL' ? 'All API Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-800/70">
                    {filteredModels.map(model => {
                      const isSelected = model.id === geminiModel;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setGeminiModel(model.id)}
                          className={`w-full px-3 py-2 text-left flex items-start justify-between gap-3 transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/90 dark:bg-indigo-950/60'
                              : 'hover:bg-white dark:hover:bg-slate-900'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-mono font-semibold ${
                                  isSelected
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {model.id}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {model.displayName}
                              </span>
                              {model.isRecommended && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                  Recommended
                                </span>
                              )}
                              {model.source === 'api' && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                                  Live API
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {model.description}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 self-center">
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                              {model.category.split(' ')[0]} {model.category.split(' ')[1]}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {filteredModels.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        No models matched "{modelSearchQuery}".
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Appearance Theme Preference */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Appearance Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ] as const
                  ).map(item => {
                    const Icon = item.icon;
                    const active = themeMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onThemeModeChange(item.id)}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          active
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Analyzed Files Cap Slider */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Analyzed Files Cap
                  </label>
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {maxFiles} files
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={maxFiles}
                  onChange={e => setMaxFiles(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Default is 40. Controls the maximum number of prioritized source files analyzed per repository.
                </p>
              </div>

              {/* 4. GitHub Personal Access Token */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                  GitHub Personal Access Token (Optional)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Raises GitHub rate limit from 60 to 5,000 requests/hr and unlocks private repositories.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setToken('');
                  setGeminiModel('gemini-3.8-flash');
                  setMaxFiles(40);
                  localStorage.removeItem('codeatlas_github_token');
                  localStorage.removeItem('codeatlas_gemini_model');
                  localStorage.removeItem('codeatlas_max_files');
                  setShowSettingsModal(false);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
