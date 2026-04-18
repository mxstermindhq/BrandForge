"use client";

import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

function TriggerNode({ data }: NodeProps<{ label: string; schedule?: string }>) {
  return (
    <div className="border-primary/30 bg-primary/10 rounded-lg border px-4 py-2">
      <Handle type="target" position={Position.Top} className="!bg-primary !h-2 !w-2" />
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
        <span className="font-headline text-on-surface text-sm font-600">{data.label}</span>
      </div>
      {data.schedule ? (
        <div className="text-on-surface-variant mt-1 font-body text-xs">{data.schedule}</div>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-primary !h-2 !w-2" />
    </div>
  );
}

function ScrapeNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="border-outline-variant bg-surface-container rounded-lg border px-4 py-2">
      <Handle type="target" position={Position.Top} className="!bg-on-surface-variant !h-2 !w-2" />
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">download</span>
        <span className="font-headline text-on-surface text-sm font-600">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-on-surface-variant !h-2 !w-2" />
    </div>
  );
}

function GenerateNode({ data }: NodeProps<{ label: string; model?: string }>) {
  return (
    <div className="border-secondary/30 bg-secondary/10 rounded-lg border px-4 py-2">
      <Handle type="target" position={Position.Top} className="!bg-secondary !h-2 !w-2" />
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
        <span className="font-headline text-on-surface text-sm font-600">{data.label}</span>
      </div>
      {data.model ? (
        <div className="text-on-surface-variant mt-1 font-body text-xs">{data.model}</div>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-secondary !h-2 !w-2" />
    </div>
  );
}

function PublishNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="border-outline-variant bg-surface-container-high rounded-lg border px-4 py-2">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-on-surface" />
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface text-[18px]">publish</span>
        <span className="font-headline text-on-surface text-sm font-600">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-on-surface" />
    </div>
  );
}

function ConditionNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="border-outline-variant/80 bg-surface-container rounded-lg border px-4 py-2">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-on-surface-variant" />
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">fork_right</span>
        <span className="font-headline text-on-surface text-sm font-600">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" className="!left-1/4 !bg-primary" />
      <Handle type="source" position={Position.Bottom} id="b" className="!left-3/4 !bg-secondary" />
    </div>
  );
}

function DelayNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="border-outline-variant bg-surface-container-high rounded-lg border px-4 py-2">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-on-surface-variant" />
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">timer</span>
        <span className="font-headline text-on-surface text-sm font-600">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-on-surface-variant" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  scrape: ScrapeNode,
  generate: GenerateNode,
  publish: PublishNode,
  condition: ConditionNode,
  delay: DelayNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "trigger",
    position: { x: 250, y: 20 },
    data: { label: "Daily at 9am", schedule: "0 9 * * *" },
  },
  { id: "2", type: "scrape", position: { x: 250, y: 120 }, data: { label: "Scrape competitors" } },
  {
    id: "3",
    type: "generate",
    position: { x: 250, y: 220 },
    data: { label: "Generate article", model: "Llama 3.1 70B (example)" },
  },
  { id: "4", type: "condition", position: { x: 250, y: 320 }, data: { label: "Quality check > 80%" } },
  { id: "5", type: "publish", position: { x: 120, y: 420 }, data: { label: "Publish to CMS" } },
  { id: "6", type: "delay", position: { x: 380, y: 420 }, data: { label: "Wait 1 hour" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5", sourceHandle: "a" },
  { id: "e4-6", source: "4", target: "6", sourceHandle: "b" },
];

const TEMPLATES = [
  { id: "seo", name: "SEO content agent", materialIcon: "search", price: "$3,000/mo" },
  { id: "content", name: "Content refresh", materialIcon: "autorenew", price: "$2,000/mo" },
  { id: "ads", name: "Ad creative", materialIcon: "campaign", price: "$4,000/mo" },
  { id: "email", name: "Email sequences", materialIcon: "mail", price: "$1,500/mo" },
  { id: "prospecting", name: "B2B prospecting", materialIcon: "person_search", price: "$2,500/mo" },
];

export function AgentStudio() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTemplate, setSelectedTemplate] = useState("seo");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="flex min-h-[min(70vh,720px)] flex-col gap-6 lg:flex-row">
      <div className="border-outline-variant bg-surface-container w-full shrink-0 rounded-xl border p-4 lg:w-72">
        <h2 className="text-on-surface-variant mb-4 font-headline text-xs font-600 tracking-wider uppercase">
          Templates
        </h2>
        <div className="mb-6 space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTemplate(t.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedTemplate === t.id
                  ? "border-primary/40 bg-primary/10"
                  : "border-outline-variant/50 bg-surface-container-low hover:border-outline"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">{t.materialIcon}</span>
                <div>
                  <div className="font-headline text-on-surface text-sm font-600">{t.name}</div>
                  <div className="text-on-surface-variant font-body text-xs">{t.price}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <h2 className="text-on-surface-variant mb-2 font-headline text-xs font-600 tracking-wider uppercase">
          Node types
        </h2>
        <p className="text-on-surface-variant font-body text-xs">
          Drag from the canvas toolbar (React Flow) to extend. Saving workflows to Supabase is next.
        </p>
      </div>

      <div className="border-outline-variant bg-surface-container-low min-h-[420px] flex-1 overflow-hidden rounded-xl border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-surface-container-low"
        >
          <Controls className="!bg-surface-container !border-outline-variant !shadow-none" />
          <MiniMap className="!bg-surface-container" />
          <Background gap={16} color="var(--color-outline-variant)" />
        </ReactFlow>
      </div>

      <div className="border-outline-variant bg-surface-container w-full shrink-0 rounded-xl border p-4 lg:w-64">
        <h2 className="text-on-surface-variant mb-4 font-headline text-xs font-600 tracking-wider uppercase">
          Properties
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-on-surface-variant mb-1 block font-headline text-xs font-600">Agent name</label>
            <input
              type="text"
              defaultValue="My SEO agent"
              className="border-outline-variant bg-surface-container-low text-on-surface focus:border-primary w-full rounded-lg border px-3 py-2 font-body text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-on-surface-variant mb-1 block font-headline text-xs font-600">Monthly price</label>
            <input
              type="text"
              defaultValue="$3,000"
              className="border-outline-variant bg-surface-container-low text-on-surface focus:border-primary w-full rounded-lg border px-3 py-2 font-body text-sm outline-none"
            />
          </div>
          <button type="button" className="btn-primary font-headline w-full rounded-lg py-2 text-sm font-600" disabled>
            Save template
          </button>
          <button
            type="button"
            className="border-outline-variant bg-surface-container-high text-on-surface font-headline hover:bg-surface-container w-full rounded-lg border py-2 text-sm font-600"
            disabled
          >
            Deploy to client
          </button>
        </div>
      </div>
    </div>
  );
}
