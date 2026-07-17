"use client";

import { ExternalLink, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ENTITY_TYPE_LABELS,
  isAssumption,
  isEntity,
  isPrinciple,
  type AtlasNode,
} from "@/lib/atlas-types";
import { useAtlasStore } from "@/store/atlas-store";

export function AtlasDetailSheet() {
  const open = useAtlasStore((s) => s.panelOpen);
  const setPanelOpen = useAtlasStore((s) => s.setPanelOpen);
  const selectedId = useAtlasStore((s) => s.selectedId);
  const atlas = useAtlasStore((s) => s.atlas);
  const selectNode = useAtlasStore((s) => s.selectNode);
  const selected =
    selectedId && atlas
      ? (atlas.nodes.find((n) => n.id === selectedId) ?? null)
      : null;

  if (!open || !selected) return null;

  const neighbors = atlas
    ? atlas.edges
        .filter((e) => e.from === selected.id || e.to === selected.id)
        .map((e) => {
          const otherId = e.from === selected.id ? e.to : e.from;
          const other = atlas.nodes.find((n) => n.id === otherId);
          return { edge: e, other };
        })
        .filter(
          (n): n is { edge: (typeof atlas.edges)[0]; other: AtlasNode } =>
            Boolean(n.other),
        )
    : [];

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-border bg-popover shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <KindBadge node={selected} />
            {isEntity(selected) && selected.country ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                {selected.country}
                {selected.city ? ` · ${selected.city}` : ""}
              </Badge>
            ) : null}
          </div>
          <h2 className="text-lg leading-snug font-semibold">
            {isEntity(selected) ? selected.name : selected.statement}
          </h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            {selected.id}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setPanelOpen(false)}
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-5 py-4">
          {isEntity(selected) ? (
            <>
              <MetaRow
                label="Type"
                value={
                  ENTITY_TYPE_LABELS[selected.entityType] ?? selected.entityType
                }
              />
              {selected.summary ? (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {selected.summary}
                </p>
              ) : null}
              {selected.tags && selected.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[11px] font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {isAssumption(selected) ? (
            <>
              <p className="text-sm leading-relaxed">{selected.statement}</p>
              <div className="grid gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <MetaRow label="Status" value={selected.status} />
                {selected.resolveBy ? (
                  <MetaRow label="Resolve by" value={selected.resolveBy} />
                ) : null}
                {selected.anchoredToEvent ? (
                  <>
                    <MetaRow
                      label="Anchored"
                      value={selected.anchoredToEvent.date}
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {selected.anchoredToEvent.what}
                    </p>
                  </>
                ) : null}
              </div>
            </>
          ) : null}

          {isPrinciple(selected) ? (
            <>
              {selected.quote ? (
                <blockquote className="border-l-2 border-rose-300/50 pl-3 text-sm leading-relaxed italic text-foreground/90">
                  “{selected.quote}”
                </blockquote>
              ) : null}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selected.statement}
              </p>
              {selected.inferred ? (
                <Badge variant="outline">Inferred — not default view</Badge>
              ) : null}
            </>
          ) : null}

          <Separator />

          <section>
            <h3 className="mb-2 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Sources
            </h3>
            <ul className="space-y-2">
              {selected.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded-lg border border-border/70 bg-card/40 px-3 py-2 transition-colors hover:border-border hover:bg-card"
                  >
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">
                        {source.title ?? source.url}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground">
                        {source.accessed
                          ? `accessed ${source.accessed}`
                          : source.url}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {neighbors.length > 0 ? (
            <>
              <Separator />
              <section>
                <h3 className="mb-2 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Connected ({neighbors.length})
                </h3>
                <ul className="space-y-1.5">
                  {neighbors.map(({ edge, other }) => (
                    <li key={`${edge.from}-${edge.to}-${edge.rel}`}>
                      <button
                        type="button"
                        onClick={() => selectNode(other.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/40"
                      >
                        <span className="min-w-0 truncate text-sm">
                          {isEntity(other)
                            ? other.name
                            : other.statement.slice(0, 60)}
                        </span>
                        <Badge
                          variant="outline"
                          className="shrink-0 font-mono text-[9px]"
                        >
                          {edge.rel}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  );
}

function KindBadge({ node }: { node: AtlasNode }) {
  if (isEntity(node)) {
    return (
      <Badge className="bg-teal-500/15 text-teal-300 hover:bg-teal-500/20">
        Entity
      </Badge>
    );
  }
  if (isAssumption(node)) {
    return (
      <Badge className="bg-amber-500/15 text-amber-300 hover:bg-amber-500/20">
        Assumption
      </Badge>
    );
  }
  return (
    <Badge className="bg-rose-500/15 text-rose-200 hover:bg-rose-500/20">
      Principle
    </Badge>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
