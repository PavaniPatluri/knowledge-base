import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FileText, Users, Network, Info } from 'lucide-react';

const initialNodes = [
  { id: '1', type: 'docNode', position: { x: 250, y: 50 }, data: { label: 'Engineering Onboarding', type: 'doc', status: 'healthy' } },
  { id: '2', type: 'teamNode', position: { x: 100, y: 200 }, data: { label: 'Frontend Team', type: 'team' } },
  { id: '3', type: 'teamNode', position: { x: 400, y: 200 }, data: { label: 'Backend Team', type: 'team' } },
  { id: '4', type: 'docNode', position: { x: 250, y: 350 }, data: { label: 'API Architecture V2', type: 'doc', status: 'outdated' } },
  { id: '5', type: 'topicNode', position: { x: 100, y: 400 }, data: { label: 'React 19 Migration', type: 'topic' } },
  { id: '6', type: 'docNode', position: { x: 550, y: 300 }, data: { label: 'Database Schema', type: 'doc', status: 'healthy' } },
  { id: '7', type: 'topicNode', position: { x: 400, y: 500 }, data: { label: 'Security Protocols', type: 'topic' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'hsl(var(--primary))' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'hsl(var(--primary))' } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: 'hsl(var(--muted-foreground))' } },
  { id: 'e3-4', source: '3', target: '4', style: { stroke: 'hsl(var(--muted-foreground))' } },
  { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e3-6', source: '3', target: '6', style: { stroke: 'hsl(var(--muted-foreground))' } },
  { id: 'e4-7', source: '4', target: '7', style: { stroke: '#ef4444' } },
  { id: 'e6-7', source: '6', target: '7', style: { stroke: '#ef4444' } },
];

const DocNode = ({ data }: NodeProps) => {
  const status = data.status as string;
  const label = data.label as string;
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border-2 border-primary/20 hover:border-primary transition-colors min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-16 !bg-primary/50" />
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full mb-2 ${status === 'outdated' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
          <FileText size={20} />
        </div>
        <div className="text-sm font-bold text-center">{label}</div>
        <div className="text-xs text-muted-foreground capitalize mt-1 flex items-center">
          {status === 'outdated' && <span className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></span>}
          {status}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-primary/50" />
    </div>
  );
};

const TeamNode = ({ data }: NodeProps) => {
  const label = data.label as string;
  return (
    <div className="px-4 py-3 shadow-md rounded-full bg-background border-2 border-purple-500/30 hover:border-purple-500 transition-colors flex items-center justify-center min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <Users size={16} className="text-purple-500 mr-2" />
      <div className="text-sm font-bold">{label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  );
};

const TopicNode = ({ data }: NodeProps) => {
  const label = data.label as string;
  return (
    <div className="px-4 py-2 shadow-sm rounded-lg bg-secondary border border-border flex items-center">
      <Handle type="target" position={Position.Top} className="!bg-foreground" />
      <Network size={14} className="text-foreground mr-2" />
      <div className="text-xs font-semibold">{label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-foreground" />
    </div>
  );
};

const nodeTypes = {
  docNode: DocNode,
  teamNode: TeamNode,
  topicNode: TopicNode,
};

export const KnowledgeGraph = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">AI Knowledge Graph</h2>
        <p className="text-muted-foreground mt-2">
          Visually explore relationships between documents, teams, and active topics across the organization.
        </p>
      </div>
      
      <div className="flex-1 bg-card border rounded-xl overflow-hidden shadow-sm relative">
        <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md border rounded-lg p-3 shadow-sm text-xs space-y-2">
          <div className="font-semibold mb-2 flex items-center">
            <Info size={14} className="mr-1" /> Legend
          </div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary mr-2"></div> Documents</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500 mr-2"></div> Teams</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-md bg-secondary border border-border mr-2"></div> Topics</div>
          <div className="flex items-center"><div className="w-3 h-0.5 bg-red-500 mr-2 mt-1"></div> Critical Dependency</div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-muted/10 dark:bg-black"
        >
          <Controls className="bg-background border-border shadow-sm" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'docNode') return 'hsl(var(--primary))';
              if (n.type === 'teamNode') return '#a855f7';
              return 'hsl(var(--secondary))';
            }}
            maskColor="hsl(var(--background) / 0.5)"
            className="bg-card border-border"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--muted-foreground) / 0.2)" />
        </ReactFlow>
      </div>
    </div>
  );
};
