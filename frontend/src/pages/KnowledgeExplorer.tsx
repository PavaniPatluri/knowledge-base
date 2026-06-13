import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges,
  ConnectionMode
} from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FileText, Users, Hash } from 'lucide-react';

const CustomNode = ({ data }: any) => {
  const Icon = data.type === 'document' ? FileText : data.type === 'team' ? Users : Hash;
  const color = data.type === 'document' ? 'bg-blue-500' : data.type === 'team' ? 'bg-indigo-500' : 'bg-emerald-500';
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-card border-2 ${data.selected ? 'border-primary' : 'border-border'} flex items-center gap-2 transition-all`}>
      <div className={`p-1.5 rounded-full text-white ${color}`}>
        <Icon size={14} />
      </div>
      <div>
        <div className="font-bold text-xs">{data.label}</div>
        <div className="text-[10px] text-muted-foreground">{data.sublabel}</div>
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

export const KnowledgeExplorer = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real data from backend to build graph
    const fetchGraph = async () => {
      try {
        const [docsRes, teamsRes] = await Promise.all([
          fetch('http://localhost:3000/documents'),
          fetch('http://localhost:3000/teams')
        ]);
        const documents = await docsRes.json();
        const teams = await teamsRes.json();

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Build Team Nodes
        teams.forEach((team: any, i: number) => {
          newNodes.push({
            id: `team-${team.id}`,
            type: 'custom',
            position: { x: 400, y: i * 150 },
            data: { label: team.name, sublabel: `${team.members?.length || 0} Members`, type: 'team' }
          });
        });

        // Build Document Nodes and connect to Teams
        documents.forEach((doc: any, i: number) => {
          const xPos = 100 + (Math.random() * 200 - 100);
          newNodes.push({
            id: `doc-${doc.id}`,
            type: 'custom',
            position: { x: xPos, y: i * 80 },
            data: { label: doc.title, sublabel: doc.status, type: 'document' }
          });

          if (doc.teamId) {
            newEdges.push({
              id: `e-doc-${doc.id}-team-${doc.teamId}`,
              source: `doc-${doc.id}`,
              target: `team-${doc.teamId}`,
              animated: true,
              style: { stroke: 'hsl(var(--primary))' }
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className="h-full w-full flex flex-col p-8 pb-0">
      <div className="shrink-0 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Explorer</h2>
        <p className="text-muted-foreground mt-2">
          Visually explore relationships between documents, teams, and topics.
        </p>
      </div>
      
      <div className="flex-1 border rounded-t-xl overflow-hidden bg-background relative shadow-inner">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Building Knowledge Graph...
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-muted/10"
          >
            <Background gap={16} size={1} color="hsl(var(--muted-foreground))" />
            <Controls className="bg-card border-border shadow-sm fill-foreground" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};
