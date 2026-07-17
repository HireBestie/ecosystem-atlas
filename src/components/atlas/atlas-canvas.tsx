"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { AssumptionNode } from "@/components/atlas/nodes/assumption-node";
import { EntityNode } from "@/components/atlas/nodes/entity-node";
import { PrincipleNode } from "@/components/atlas/nodes/principle-node";
import { useAtlasStore } from "@/store/atlas-store";

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  assumption: AssumptionNode,
  principle: PrincipleNode,
};

export function AtlasCanvas() {
  const nodes = useAtlasStore((s) => s.nodes);
  const edges = useAtlasStore((s) => s.edges);
  const onNodesChange = useAtlasStore((s) => s.onNodesChange);
  const onEdgesChange = useAtlasStore((s) => s.onEdgesChange);
  const selectNode = useAtlasStore((s) => s.selectNode);

  return (
    <div className="atlas-canvas absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.15}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: "oklch(0.55 0.02 250)", strokeWidth: 1 },
          labelStyle: {
            fill: "oklch(0.7 0 0)",
            fontSize: 9,
            fontFamily: "ui-monospace, monospace",
          },
          labelBgStyle: { fill: "oklch(0.18 0 0)", fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="oklch(1 0 0 / 0.08)"
        />
        <Controls
          className="!overflow-hidden !rounded-xl !border !border-border !bg-card/95 !shadow-lg [&>button]:!border-border [&>button]:!bg-transparent [&>button]:!text-foreground"
          showInteractive={false}
        />
        <MiniMap
          className="!overflow-hidden !rounded-xl !border !border-border !bg-card/90"
          nodeColor={(n) => {
            if (n.type === "assumption") return "oklch(0.75 0.14 75)";
            if (n.type === "principle") return "oklch(0.72 0.12 15)";
            return "oklch(0.72 0.1 180)";
          }}
          maskColor="oklch(0.145 0 0 / 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
