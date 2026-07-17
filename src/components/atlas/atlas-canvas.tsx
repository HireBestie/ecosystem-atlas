"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
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

function AtlasCanvasInner() {
  const nodes = useAtlasStore((s) => s.nodes);
  const edges = useAtlasStore((s) => s.edges);
  const onNodesChange = useAtlasStore((s) => s.onNodesChange);
  const onEdgesChange = useAtlasStore((s) => s.onEdgesChange);
  const selectNode = useAtlasStore((s) => s.selectNode);
  const { fitView } = useReactFlow();
  const didFit = useRef(false);

  useEffect(() => {
    if (nodes.length === 0 || didFit.current) return;
    didFit.current = true;
    const timer = window.setTimeout(() => {
      void fitView({ padding: 0.18, duration: 200 });
    }, 50);
    return () => window.clearTimeout(timer);
    // Intentionally only re-run when the graph becomes populated once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  const onNodeClick = useCallback(
    (_: unknown, node: { id: string }) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="atlas-canvas absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        minZoom={0.15}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: "oklch(0.55 0.02 250)", strokeWidth: 1 },
        }}
        onlyRenderVisibleElements
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

export function AtlasCanvas() {
  return (
    <ReactFlowProvider>
      <AtlasCanvasInner />
    </ReactFlowProvider>
  );
}
