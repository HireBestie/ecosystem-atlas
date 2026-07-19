"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isAssumption } from "@/lib/atlas-types";
import { useAtlasStore } from "@/store/atlas-store";

export function AtlasTimeline() {
  const atlas = useAtlasStore((s) => s.atlas);
  const selectNode = useAtlasStore((s) => s.selectNode);
  const selectedId = useAtlasStore((s) => s.selectedId);
  const filters = useAtlasStore((s) => s.filters);

  const assumptions =
    atlas?.nodes
      .filter(isAssumption)
      .filter(() => filters.kinds.includes("assumption"))
      .filter((n) => {
        const q = filters.query.trim().toLowerCase();
        if (!q) return true;
        return (
          n.statement.toLowerCase().includes(q) ||
          (n.anchoredToEvent?.what ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = a.anchoredToEvent?.date ?? "9999-99-99";
        const db = b.anchoredToEvent?.date ?? "9999-99-99";
        return da.localeCompare(db);
      }) ?? [];

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[0.16em] text-amber-300/90 uppercase">
              Assumption timeline
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Ecosystem bets, dated
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Each assumption is anchored to a real event. Click through for
              sources and the entities exposed to the bet.
            </p>
          </div>

          <ol className="relative space-y-0 border-l border-amber-500/25 pl-6">
            {assumptions.map((item) => {
              const active = selectedId === item.id;
              return (
                <li key={item.id} className="relative pb-8 last:pb-0">
                  <span className="absolute top-1.5 -left-[1.91rem] h-2.5 w-2.5 rounded-full border-2 border-amber-400/80 bg-background" />
                  <button
                    type="button"
                    onClick={() => selectNode(item.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-amber-400/60 bg-amber-500/10"
                        : "border-border/70 bg-card/40 hover:border-border hover:bg-card/70"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-amber-300">
                        {item.anchoredToEvent?.date ?? "undated"}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.status}
                      </Badge>
                      {item.resolveBy ? (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          resolve by {item.resolveBy}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {item.statement}
                    </p>
                    {item.anchoredToEvent?.what ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Anchored: {item.anchoredToEvent.what}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </ScrollArea>
    </div>
  );
}
