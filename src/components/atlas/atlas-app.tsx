"use client";

import { useEffect, useState } from "react";
import { AtlasCanvas } from "@/components/atlas/atlas-canvas";
import { AtlasDetailSheet } from "@/components/atlas/atlas-detail-sheet";
import { AtlasErrorBoundary } from "@/components/atlas/atlas-error-boundary";
import { AtlasFilters } from "@/components/atlas/atlas-filters";
import { AtlasHeader } from "@/components/atlas/atlas-header";
import { AtlasTimeline } from "@/components/atlas/atlas-timeline";
import type { AtlasData } from "@/lib/atlas-types";
import { useAtlasStore } from "@/store/atlas-store";

export function AtlasApp() {
  const hydrate = useAtlasStore((s) => s.hydrate);
  const view = useAtlasStore((s) => s.view);
  const atlas = useAtlasStore((s) => s.atlas);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/data/atlas.json", { cache: "force-cache" });
        if (!res.ok) {
          throw new Error(`Failed to fetch atlas.json (${res.status})`);
        }
        const data = (await res.json()) as AtlasData;
        if (cancelled) return;
        hydrate(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.stack ?? err.message : String(err);
        console.error("[AtlasApp] load failed", err);
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  return (
    <AtlasErrorBoundary>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <AtlasHeader />
        {error ? (
          <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 font-mono text-xs text-destructive whitespace-pre-wrap">
            Failed to load atlas graph:{"\n"}
            {error}
          </div>
        ) : null}
        {loading && !atlas ? (
          <div className="border-b border-border/80 px-4 py-2 text-xs text-muted-foreground">
            Loading graph…
          </div>
        ) : null}
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          <AtlasFilters />
          <main className="relative min-h-0 min-w-0 flex-1">
            {view === "graph" ? <AtlasCanvas /> : <AtlasTimeline />}
            <AtlasDetailSheet />
          </main>
        </div>
      </div>
    </AtlasErrorBoundary>
  );
}
