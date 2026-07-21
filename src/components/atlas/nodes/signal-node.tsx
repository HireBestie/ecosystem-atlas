"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isSignal, SIGNAL_TYPE_LABELS } from "@/lib/atlas-types";
import type { AtlasFlowNode } from "@/lib/layout-graph";

export function SignalNode({ data, selected }: NodeProps<AtlasFlowNode>) {
  if (!isSignal(data.atlas)) return null;
  const node = data.atlas;

  return (
    <div
      className={cn(
        "relative w-[220px] rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-all",
        "border-sky-400/30 hover:border-sky-300/60",
        selected && "ring-2 ring-sky-300/80 border-sky-300",
        data.dimmed && "opacity-25",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-sky-300"
      />
      <div className="mb-1.5 flex items-center gap-1.5">
        <Badge
          variant="secondary"
          className="h-5 rounded-md bg-sky-500/15 px-1.5 text-[10px] font-normal text-sky-200"
        >
          {SIGNAL_TYPE_LABELS[node.signalType] ?? "Signal"}
        </Badge>
        {node.inferred ? (
          <Badge variant="outline" className="h-5 text-[10px]">
            inferred
          </Badge>
        ) : null}
      </div>
      {node.quote ? (
        <p className="line-clamp-3 text-xs italic leading-relaxed text-foreground/85">
          “{node.quote}”
        </p>
      ) : (
        <p className="line-clamp-3 text-xs leading-relaxed text-foreground/85">
          {node.statement}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-sky-300"
      />
    </div>
  );
}
