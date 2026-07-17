"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isAssumption } from "@/lib/atlas-types";
import type { AtlasFlowNode } from "@/lib/layout-graph";

export function AssumptionNode({ data, selected }: NodeProps<AtlasFlowNode>) {
  if (!isAssumption(data.atlas)) return null;
  const node = data.atlas;

  return (
    <div
      className={cn(
        "relative w-[240px] rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-all",
        "border-amber-500/35 hover:border-amber-400/70",
        selected && "ring-2 ring-amber-400/80 border-amber-400",
        data.dimmed && "opacity-25",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-amber-400"
      />
      <div className="mb-1.5 flex items-center gap-1.5">
        <Badge
          variant="secondary"
          className="h-5 rounded-md bg-amber-500/15 px-1.5 text-[10px] font-normal text-amber-300"
        >
          Assumption
        </Badge>
        {node.anchoredToEvent?.date ? (
          <span className="font-mono text-[10px] text-muted-foreground">
            {node.anchoredToEvent.date}
          </span>
        ) : null}
      </div>
      <p className="line-clamp-3 text-xs leading-relaxed text-foreground/90">
        {node.statement}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-amber-400"
      />
    </div>
  );
}
