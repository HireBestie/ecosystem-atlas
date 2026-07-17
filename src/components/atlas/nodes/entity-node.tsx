"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ENTITY_TYPE_LABELS, isEntity } from "@/lib/atlas-types";
import type { AtlasFlowNode } from "@/lib/layout-graph";

export function EntityNode({ data, selected }: NodeProps<AtlasFlowNode>) {
  if (!isEntity(data.atlas)) return null;
  const node = data.atlas;

  return (
    <div
      className={cn(
        "group relative w-[200px] rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-all",
        "border-teal-500/30 hover:border-teal-400/60",
        selected && "ring-2 ring-teal-400/80 border-teal-400",
        data.dimmed && "opacity-25",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-teal-400"
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug tracking-tight text-foreground">
          {node.name}
        </p>
        {node.country ? (
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {node.country}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge
          variant="secondary"
          className="h-5 rounded-md bg-teal-500/10 px-1.5 text-[10px] font-normal text-teal-300"
        >
          {ENTITY_TYPE_LABELS[node.entityType] ?? node.entityType}
        </Badge>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-teal-400"
      />
    </div>
  );
}
