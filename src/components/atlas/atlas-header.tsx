"use client";

import { GitBranch, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAtlasStats, useAtlasStore } from "@/store/atlas-store";

export function AtlasHeader() {
  const view = useAtlasStore((s) => s.view);
  const setView = useAtlasStore((s) => s.setView);
  const meta = useAtlasStore((s) => s.atlas?.meta);
  const stats = useAtlasStats();

  return (
    <header className="relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
            <Map className="h-4 w-4 text-teal-300" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight md:text-base">
              Ecosystem Atlas
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              France & Southern Europe AI · map · decide · activate
            </p>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <Stat label="Entities" value={stats.entities} tone="teal" />
        <Stat label="Assumptions" value={stats.assumptions} tone="amber" />
        <Stat label="Principles" value={stats.principles} tone="rose" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Badge variant="outline" className="font-mono text-[10px] font-normal">
          <GitBranch className="mr-1 h-3 w-3" />
          {meta?.version ?? "—"} · {stats.edges} edges
        </Badge>
      </div>

      <Tabs
        value={view}
        onValueChange={(v) =>
          setView(v as "graph" | "timeline" | "mission" | "network")
        }
      >
        <TabsList>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="mission">Operate</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "amber" | "rose";
}) {
  const toneClass =
    tone === "teal"
      ? "text-teal-300"
      : tone === "amber"
        ? "text-amber-300"
        : "text-rose-200";

  return (
    <div className="rounded-lg border border-border/70 bg-card/60 px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`font-mono text-sm tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}
