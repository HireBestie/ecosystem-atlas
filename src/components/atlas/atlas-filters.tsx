"use client";

import { RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ENTITY_TYPE_LABELS,
  KIND_LABELS,
  type EntityType,
  type NodeKind,
} from "@/lib/atlas-types";
import {
  useAtlasStats,
  useAtlasStore,
  useAvailableFacets,
} from "@/store/atlas-store";

export function AtlasFilters() {
  const filters = useAtlasStore((s) => s.filters);
  const setQuery = useAtlasStore((s) => s.setQuery);
  const setKinds = useAtlasStore((s) => s.setKinds);
  const toggleCountry = useAtlasStore((s) => s.toggleCountry);
  const toggleEntityType = useAtlasStore((s) => s.toggleEntityType);
  const setHideInferred = useAtlasStore((s) => s.setHideInferred);
  const resetFilters = useAtlasStore((s) => s.resetFilters);
  const facets = useAvailableFacets();
  const stats = useAtlasStats();

  return (
    <aside className="relative z-20 flex w-full shrink-0 flex-col gap-4 border-b border-border/80 bg-background/70 p-4 backdrop-blur-md md:w-72 md:border-b-0 md:border-r">
      <div className="relative">
        <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes…"
          className="pl-8"
        />
      </div>

      <div>
        <SectionLabel>Kinds</SectionLabel>
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={1}
          className="mt-2 flex flex-wrap justify-start"
          value={filters.kinds}
          onValueChange={(values) => {
            const next = values as NodeKind[];
            if (
              next.length === filters.kinds.length &&
              next.every((kind) => filters.kinds.includes(kind))
            ) {
              return;
            }
            setKinds(next);
          }}
        >
          {(Object.keys(KIND_LABELS) as NodeKind[]).map((kind) => (
            <ToggleGroupItem
              key={kind}
              value={kind}
              className="h-8 px-2.5 text-xs data-[state=on]:bg-secondary"
            >
              {KIND_LABELS[kind]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Separator />

      <div>
        <SectionLabel>Country</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {facets.countries.map((country) => {
            const active = filters.countries.includes(country);
            return (
              <Badge
                key={country}
                variant={active ? "default" : "outline"}
                className="cursor-pointer font-mono text-[11px]"
                onClick={() => toggleCountry(country)}
              >
                {country}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Entity type</SectionLabel>
        <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {facets.entityTypes.map((type) => {
            const active = filters.entityTypes.includes(type as EntityType);
            return (
              <Badge
                key={type}
                variant={active ? "default" : "outline"}
                className="cursor-pointer text-[11px] font-normal"
                onClick={() => toggleEntityType(type)}
              >
                {ENTITY_TYPE_LABELS[type as EntityType] ?? type}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setHideInferred(!filters.hideInferred)}
        >
          {filters.hideInferred
            ? "Hiding inferred principles"
            : "Showing inferred principles"}
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={resetFilters}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <p className="font-mono text-[11px] text-muted-foreground">
        Showing {stats.visible} /{" "}
        {stats.entities + stats.assumptions + stats.principles} nodes
      </p>

      <div className="mt-auto hidden rounded-xl border border-border/70 bg-card/50 p-3 text-xs leading-relaxed text-muted-foreground md:block">
        <p className="mb-1 font-medium text-foreground">How to read</p>
        <p>
          <span className="text-teal-300">Entities</span> are stakeholders.{" "}
          <span className="text-amber-300">Assumptions</span> are dated
          falsifiable bets.{" "}
          <span className="text-rose-200">Principles</span> are quoted theses —
          never vibes. Click any node for sources.
        </p>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}
