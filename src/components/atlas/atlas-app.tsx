"use client";

import { useEffect } from "react";
import { AtlasCanvas } from "@/components/atlas/atlas-canvas";
import { AtlasDetailSheet } from "@/components/atlas/atlas-detail-sheet";
import { AtlasFilters } from "@/components/atlas/atlas-filters";
import { AtlasHeader } from "@/components/atlas/atlas-header";
import { AtlasTimeline } from "@/components/atlas/atlas-timeline";
import type { AtlasData } from "@/lib/atlas-types";
import { useAtlasStore } from "@/store/atlas-store";

export function AtlasApp({ data }: { data: AtlasData }) {
  const hydrate = useAtlasStore((s) => s.hydrate);
  const view = useAtlasStore((s) => s.view);

  useEffect(() => {
    hydrate(data);
  }, [data, hydrate]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <AtlasHeader />
      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <AtlasFilters />
        <main className="relative min-h-0 min-w-0 flex-1">
          {view === "graph" ? <AtlasCanvas /> : <AtlasTimeline />}
        </main>
      </div>
      <AtlasDetailSheet />
    </div>
  );
}
