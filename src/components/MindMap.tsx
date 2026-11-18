import React, { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, ArrowRight, X } from 'lucide-react';
import { MindMapData, MindMapGraphNode } from '../types';

interface MindMapProps {
  data: MindMapData;
  onSelectFile: (path: string) => void;
  isDark?: boolean;
}

const CustomAtlasNode = ({ data }: { data: any }) => {
  const isSelected = data.isSelected;

  const getTypeStyle = () => {
    switch (data.type) {
      case 'repo':
        return {
          card: 'bg-indigo-50/95 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100',
          labelColor: 'text-indigo-700 dark:text-indigo-300',
          tag: 'Repository Root',
        };
      case 'entry':
        return {
          card: 'bg-emerald-50/95 dark:bg-emerald-950/75 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
          labelColor: 'text-emerald-700 dark:text-emerald-300',
          tag: 'Entrypoint',
        };
      case 'folder':
        return {
          card: 'bg-amber-50/95 dark:bg-amber-950/75 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100',
          labelColor: 'text-amber-700 dark:text-amber-300',
          tag: 'Domain Module',
        };
      case 'function':
        return {
          card: 'bg-purple-50/95 dark:bg-purple-950/75 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100',
          labelColor: 'text-purple-700 dark:text-purple-300',
          tag: 'Function',
        };
      default:
        return {
          card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
          labelColor: 'text-slate-900 dark:text-slate-100',
          tag: data.role ? String(data.role) : 'Source File',
        };
    }
  };

  const style = getTypeStyle();

  return (
    <div
      onClick={() => {
        if (data.onNodeClick) {
          data.onNodeClick(data.id);
        }
      }}
      className={`px-3.5 py-3 rounded-lg border shadow-xs transition-all cursor-pointer min-w-[200px] max-w-[260px] ${
        style.card
      } ${
        isSelected
          ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 border-indigo-600 dark:border-indigo-400'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 dark:!bg-slate-600 !w-2 !h-2 !border-white dark:!border-slate-900"
      />

      {/* Unboxed Metadata Kicker */}
      <div className="flex items-center justify-between gap-2 mb-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span>{style.tag}</span>
        {data.role && data.type === 'file' && <span>· {data.role}</span>}
      </div>

      {/* Node Title */}
      <div className={`font-mono font-semibold text-xs truncate ${style.labelColor}`}>
        {data.label}
      </div>

      {/* Description */}
      {data.description && (
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {data.description}
        </div>
      )}

      {/* Explicit Action Button to Inspect File (Does NOT trigger on accidental drag/click) */}
      {data.path && data.type !== 'repo' && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            data.onSelectFile(data.path);
          }}
          className="mt-2.5 pt-1.5 w-full border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
        >
          <span>Inspect file</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 dark:!bg-slate-600 !w-2 !h-2 !border-white dark:!border-slate-900"
      />
    </div>
  );
};

const nodeTypes = { atlasNode: CustomAtlasNode };

export const MindMap: React.FC<MindMapProps> = ({ data, onSelectFile, isDark = false }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entry' | 'file' | 'folder' | 'function'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const matches = (n: MindMapGraphNode) => {
      const matchText =
        !filterQuery ||
        n.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (n.description && n.description.toLowerCase().includes(filterQuery.toLowerCase()));
      const matchType = typeFilter === 'all' || n.type === typeFilter;
      return matchText && matchType;
    };

    const levels: Record<number, MindMapGraphNode[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
    };

    for (const node of data.nodes) {
      if (!matches(node)) continue;
      if (node.type === 'repo') levels[0].push(node);
      else if (node.type === 'folder') levels[1].push(node);
      else if (node.type === 'file' || node.type === 'entry') levels[2].push(node);
      else levels[3].push(node);
    }

    const horizontalSpacing = 280;
    const verticalSpacing = 175;

    Object.entries(levels).forEach(([lvlStr, levelNodes]) => {
      const lvl = Number(lvlStr);
      const totalInLevel = levelNodes.length;
      const startX = -((totalInLevel - 1) * horizontalSpacing) / 2 + 500;

      levelNodes.forEach((node, idx) => {
        nodes.push({
          id: node.id,
          type: 'atlasNode',
          position: {
            x: startX + idx * horizontalSpacing,
            y: lvl * verticalSpacing + 60,
          },
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            path: node.path,
            role: node.role,
            description: node.description,
            isSelected: selectedNodeId === node.id,
            onNodeClick: (id: string) => setSelectedNodeId(prev => (prev === id ? null : id)),
            onSelectFile,
          },
        });
      });
    });

    const existingNodeIds = new Set(nodes.map(n => n.id));
    for (const [idx, edge] of data.edges.entries()) {
      if (existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target)) {
        const isCalls = edge.relation === 'calls';
        const isImports = edge.relation === 'imports';
        const isInferred = edge.relation === 'inferred';
        const isConnectedToSelected =
          selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

        edges.push({
          id: edge.id || `e-${idx}`,
          source: edge.source,
          target: edge.target,
          label: edge.label || (isCalls ? 'calls' : isImports ? 'imports' : undefined),
          animated: isCalls || Boolean(isConnectedToSelected),
          style: {
            stroke: isConnectedToSelected
              ? '#4F46E5'
              : isInferred
              ? isDark
                ? '#475569'
                : '#94A3B8'
              : isCalls
              ? isDark
                ? '#A78BFA'
                : '#7C3AED'
              : isDark
              ? '#6366F1'
              : '#4F46E5',
            strokeWidth: isConnectedToSelected ? 2 : isCalls || isImports ? 1.5 : 1,
            strokeDasharray: isInferred ? '4 4' : undefined,
          },
          labelStyle: {
            fontSize: 10,
            fill: isDark ? '#CBD5E1' : '#475569',
            fontWeight: 500,
            fontFamily: 'monospace',
          },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: isDark ? '#0F172A' : '#FFFFFF',
            stroke: isDark ? '#1E293B' : '#E2E8F0',
          },
        });
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, filterQuery, typeFilter, onSelectFile, selectedNodeId, isDark]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-[#090D16] relative select-none transition-colors duration-150">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={isDark ? '#1E293B' : '#CBD5E1'}
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={n => {
            if (n.data?.type === 'entry') return '#16A34A';
            if (n.data?.type === 'folder') return '#D97706';
            if (n.data?.type === 'repo') return '#4F46E5';
            if (n.data?.type === 'function') return '#7C3AED';
            return '#64748B';
          }}
          maskColor={isDark ? 'rgba(9, 13, 22, 0.78)' : 'rgba(248, 250, 252, 0.78)'}
          className="!bg-white dark:!bg-slate-900 !border !border-slate-200 dark:!border-slate-800 !shadow-xs !rounded-lg"
          zoomable
          pannable
        />

        {/* Top-Left Search & Node Type Filter Toolbar */}
        <Panel position="top-left" className="!m-3">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-xs flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Search nodes..."
                className="pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 w-44 font-mono"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs p-0.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {(
                [
                  { id: 'all', label: `All (${data.nodes.length})` },
                  { id: 'entry', label: 'Entries' },
                  { id: 'folder', label: 'Modules' },
                  { id: 'file', label: 'Files' },
                  { id: 'function', label: 'Functions' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums ${
                    typeFilter === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {/* Bottom-Left Compact Tier Legend */}
        <Panel position="bottom-left" className="!m-3">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 shadow-xs flex items-center gap-3">
            <span>Tier 0: Root</span>
            <span>·</span>
            <span>Tier 1: Domain</span>
            <span>·</span>
            <span>Tier 2: File / Entry</span>
            <span>·</span>
            <span>Tier 3: Function</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
