"use client";

import { useEffect, useState } from "react";
import { AtlasCanvas } from "@/components/atlas/atlas-canvas";
import { AtlasCases } from "@/components/atlas/atlas-cases";
import { AtlasDetailSheet } from "@/components/atlas/atlas-detail-sheet";
import { AtlasErrorBoundary } from "@/components/atlas/atlas-error-boundary";
import { AtlasFilters } from "@/components/atlas/atlas-filters";
import { AtlasHeader } from "@/components/atlas/atlas-header";
import { AtlasMission } from "@/components/atlas/atlas-mission";
import { AtlasTimeline } from "@/components/atlas/atlas-timeline";
import type { AtlasData } from "@/lib/atlas-types";
import type { WorkedCaseBundle } from "@/lib/case-types";
import type { MissionCase } from "@/lib/mission-types";
import { useAtlasStore } from "@/store/atlas-store";
import { useCaseStore } from "@/store/case-store";
import { useMissionStore } from "@/store/mission-store";

export function AtlasApp() {
  const hydrate = useAtlasStore((s) => s.hydrate);
  const hydrateMission = useMissionStore((s) => s.hydrate);
  const hydrateCases = useCaseStore((s) => s.hydrate);
  const view = useAtlasStore((s) => s.view);
  const atlas = useAtlasStore((s) => s.atlas);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [atlasRes, missionRes, casesRes] = await Promise.all([
          fetch("/data/atlas.json", { cache: "force-cache" }),
          fetch("/data/mission-motier.json", { cache: "force-cache" }),
          fetch("/data/worked-cases.json", { cache: "force-cache" }),
        ]);
        if (!atlasRes.ok) {
          throw new Error(`Failed to fetch atlas.json (${atlasRes.status})`);
        }
        if (!missionRes.ok) {
          throw new Error(
            `Failed to fetch mission-motier.json (${missionRes.status})`,
          );
        }
        if (!casesRes.ok) {
          throw new Error(
            `Failed to fetch worked-cases.json (${casesRes.status})`,
          );
        }
        const data = (await atlasRes.json()) as AtlasData;
        const mission = (await missionRes.json()) as MissionCase;
        const cases = (await casesRes.json()) as WorkedCaseBundle;

        if (cancelled) return;
        hydrate(data);
        hydrateMission(mission);
        hydrateCases(cases);
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
  }, [hydrate, hydrateMission, hydrateCases]);

  const hideAtlasChrome = view === "mission" || view === "cases";

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
          {!hideAtlasChrome ? <AtlasFilters /> : null}
          <main className="relative min-h-0 min-w-0 flex-1">
            {view === "graph" ? (
              <AtlasCanvas />
            ) : view === "timeline" ? (
              <AtlasTimeline />
            ) : view === "mission" ? (
              <AtlasMission />
            ) : (
              <AtlasCases />
            )}
            {!hideAtlasChrome ? <AtlasDetailSheet /> : null}
          </main>
        </div>
      </div>
    </AtlasErrorBoundary>
  );
}
