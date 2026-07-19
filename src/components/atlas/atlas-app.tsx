"use client";

import { useEffect, useState } from "react";
import { AtlasCanvas } from "@/components/atlas/atlas-canvas";
import { AtlasDetailSheet } from "@/components/atlas/atlas-detail-sheet";
import { AtlasErrorBoundary } from "@/components/atlas/atlas-error-boundary";
import { AtlasFilters } from "@/components/atlas/atlas-filters";
import { AtlasHeader } from "@/components/atlas/atlas-header";
import { AtlasMission } from "@/components/atlas/atlas-mission";
import { AtlasNetwork } from "@/components/atlas/atlas-network";
import { AtlasTimeline } from "@/components/atlas/atlas-timeline";
import type { AtlasData } from "@/lib/atlas-types";
import type { MissionCase } from "@/lib/mission-types";
import {
  mergeNetworkGraphs,
  type NetworkGraph,
  type NetworkOverlay,
} from "@/lib/network-types";
import { useAtlasStore } from "@/store/atlas-store";
import { useMissionStore } from "@/store/mission-store";
import { useNetworkStore } from "@/store/network-store";

export function AtlasApp() {
  const hydrate = useAtlasStore((s) => s.hydrate);
  const hydrateMission = useMissionStore((s) => s.hydrate);
  const hydrateNetwork = useNetworkStore((s) => s.hydrate);
  const view = useAtlasStore((s) => s.view);
  const atlas = useAtlasStore((s) => s.atlas);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [atlasRes, missionRes, networkRes] = await Promise.all([
          fetch("/data/atlas.json", { cache: "force-cache" }),
          fetch("/data/mission-motier.json", { cache: "force-cache" }),
          fetch("/data/network-bridges.json", { cache: "force-cache" }),
        ]);
        if (!atlasRes.ok) {
          throw new Error(`Failed to fetch atlas.json (${atlasRes.status})`);
        }
        if (!missionRes.ok) {
          throw new Error(
            `Failed to fetch mission-motier.json (${missionRes.status})`,
          );
        }
        if (!networkRes.ok) {
          throw new Error(
            `Failed to fetch network-bridges.json (${networkRes.status})`,
          );
        }
        const data = (await atlasRes.json()) as AtlasData;
        const mission = (await missionRes.json()) as MissionCase;
        let network = (await networkRes.json()) as NetworkGraph;

        // Optional private L1 overlay — 404 is expected when not present
        try {
          const privateRes = await fetch("/data/network-bridges.private.json", {
            cache: "no-store",
          });
          if (privateRes.ok) {
            const overlay = (await privateRes.json()) as NetworkOverlay;
            network = mergeNetworkGraphs(network, overlay);
          }
        } catch {
          // ignore — private file is optional
        }

        if (cancelled) return;
        hydrate(data);
        hydrateMission(mission);
        hydrateNetwork(network);
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
  }, [hydrate, hydrateMission, hydrateNetwork]);

  const hideAtlasChrome = view === "mission" || view === "network";

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
              <AtlasNetwork />
            )}
            {!hideAtlasChrome ? <AtlasDetailSheet /> : null}
          </main>
        </div>
      </div>
    </AtlasErrorBoundary>
  );
}
