"use client";

import { useMemo } from "react";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";
import type { AtlasData, AtlasFilters, NodeKind } from "@/lib/atlas-types";
import { ALL_KINDS, isEntity } from "@/lib/atlas-types";
import {
  buildFlowGraph,
  matchesFilters,
  type AtlasFlowEdge,
  type AtlasFlowNode,
} from "@/lib/layout-graph";

type AtlasStore = {
  atlas: AtlasData | null;
  nodes: AtlasFlowNode[];
  edges: AtlasFlowEdge[];
  selectedId: string | null;
  panelOpen: boolean;
  view: "graph" | "timeline" | "mission" | "network";
  filters: AtlasFilters;
  hydrate: (atlas: AtlasData) => void;
  onNodesChange: OnNodesChange<AtlasFlowNode>;
  onEdgesChange: OnEdgesChange<AtlasFlowEdge>;
  selectNode: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  setView: (view: "graph" | "timeline" | "mission" | "network") => void;
  setQuery: (query: string) => void;
  toggleKind: (kind: NodeKind) => void;
  setKinds: (kinds: NodeKind[]) => void;
  toggleCountry: (country: string) => void;
  toggleEntityType: (entityType: string) => void;
  setHideInferred: (hide: boolean) => void;
  resetFilters: () => void;
};

const defaultFilters: AtlasFilters = {
  query: "",
  kinds: [...ALL_KINDS],
  countries: [],
  entityTypes: [],
  hideInferred: true,
};

function sameStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const as = [...a].sort();
  const bs = [...b].sort();
  return as.every((value, index) => value === bs[index]);
}

function computeVisibleIds(
  allNodes: AtlasFlowNode[],
  allEdges: AtlasFlowEdge[],
  filters: AtlasFilters,
): Set<string> {
  const entityVisible = new Set<string>();
  for (const node of allNodes) {
    if (
      node.data.atlas.kind === "entity" &&
      matchesFilters(node.data.atlas, filters)
    ) {
      entityVisible.add(node.id);
    }
  }

  const visibleIds = new Set<string>();
  for (const node of allNodes) {
    const atlas = node.data.atlas;
    if (!matchesFilters(atlas, filters)) continue;

    if (atlas.kind === "entity") {
      visibleIds.add(node.id);
      continue;
    }

    const linkedToVisibleEntity = allEdges.some((edge) => {
      const other =
        edge.source === node.id
          ? edge.target
          : edge.target === node.id
            ? edge.source
            : null;
      if (!other) return false;
      return entityVisible.has(other);
    });

    const entityFilterActive =
      filters.countries.length > 0 || filters.entityTypes.length > 0;

    if (!entityFilterActive || linkedToVisibleEntity || filters.query.trim()) {
      visibleIds.add(node.id);
    }
  }

  return visibleIds;
}

function projectGraph(
  allNodes: AtlasFlowNode[],
  allEdges: AtlasFlowEdge[],
  filters: AtlasFilters,
  selectedId: string | null,
  currentNodes: AtlasFlowNode[],
): { nodes: AtlasFlowNode[]; edges: AtlasFlowEdge[] } {
  const visibleIds = computeVisibleIds(allNodes, allEdges, filters);

  const neighborIds = new Set<string>();
  if (selectedId) {
    for (const edge of allEdges) {
      if (edge.source === selectedId) neighborIds.add(edge.target);
      if (edge.target === selectedId) neighborIds.add(edge.source);
    }
  }

  // Preserve React Flow measured positions/dimensions when possible
  const currentById = new Map(currentNodes.map((n) => [n.id, n]));

  const nodes = allNodes
    .filter((n) => visibleIds.has(n.id))
    .map((n) => {
      const existing = currentById.get(n.id);
      const dimmed =
        selectedId != null && n.id !== selectedId && !neighborIds.has(n.id);
      return {
        ...(existing ?? n),
        id: n.id,
        type: n.type,
        position: existing?.position ?? n.position,
        data: {
          ...n.data,
          dimmed,
        },
        selected: n.id === selectedId,
        hidden: false,
      };
    });

  const edges = allEdges
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e) => {
      const highlighted =
        selectedId != null &&
        (e.source === selectedId || e.target === selectedId);
      return {
        ...e,
        animated: highlighted,
        style: {
          opacity: selectedId && !highlighted ? 0.12 : 0.45,
          strokeWidth: highlighted ? 2 : 1,
        },
      };
    });

  return { nodes, edges };
}

let baseNodes: AtlasFlowNode[] = [];
let baseEdges: AtlasFlowEdge[] = [];

export const useAtlasStore = create<AtlasStore>((set, get) => ({
  atlas: null,
  nodes: [],
  edges: [],
  selectedId: null,
  panelOpen: false,
  view: "network",
  filters: defaultFilters,

  hydrate: (atlas) => {
    if (get().atlas?.meta.generatedAt === atlas.meta.generatedAt && get().nodes.length > 0) {
      return;
    }
    const built = buildFlowGraph(atlas);
    baseNodes = built.nodes;
    baseEdges = built.edges;
    const filters = get().filters;
    const selectedId = get().selectedId;
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      filters,
      selectedId,
      [],
    );
    set({ atlas, ...visible });
  },

  onNodesChange: (changes: NodeChange<AtlasFlowNode>[]) => {
    if (changes.length === 0) return;
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange<AtlasFlowEdge>[]) => {
    if (changes.length === 0) return;
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  selectNode: (id) => {
    if (get().selectedId === id && get().panelOpen === (id != null)) return;
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      get().filters,
      id,
      get().nodes,
    );
    set({
      selectedId: id,
      panelOpen: id != null,
      ...visible,
    });
  },

  setPanelOpen: (open) => {
    if (open) {
      if (get().panelOpen) return;
      set({ panelOpen: true });
      return;
    }
    // Closing with nothing selected: no-op (prevents Radix onOpenChange loops)
    if (!get().panelOpen && get().selectedId == null) return;
    if (get().selectedId == null) {
      set({ panelOpen: false });
      return;
    }
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      get().filters,
      null,
      get().nodes,
    );
    set({ panelOpen: false, selectedId: null, ...visible });
  },

  setView: (view) => {
    if (get().view === view) return;
    set({ view });
  },

  setQuery: (query) => {
    if (get().filters.query === query) return;
    const filters = { ...get().filters, query };
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
      get().nodes,
    );
    set({ filters, ...visible });
  },

  toggleKind: (kind) => {
    const current = get().filters.kinds;
    const kinds = current.includes(kind)
      ? current.filter((k) => k !== kind)
      : [...current, kind];
    get().setKinds(kinds);
  },

  setKinds: (kinds) => {
    const nextKinds = kinds.length === 0 ? [...ALL_KINDS] : kinds;
    if (sameStringArray(get().filters.kinds, nextKinds)) return;
    const filters = { ...get().filters, kinds: nextKinds };
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
      get().nodes,
    );
    set({ filters, ...visible });
  },

  toggleCountry: (country) => {
    const current = get().filters.countries;
    const countries = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    if (sameStringArray(current, countries)) return;
    const filters = { ...get().filters, countries };
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
      get().nodes,
    );
    set({ filters, ...visible });
  },

  toggleEntityType: (entityType) => {
    const current = get().filters.entityTypes;
    const entityTypes = current.includes(entityType as never)
      ? current.filter((t) => t !== entityType)
      : [...current, entityType as never];
    if (sameStringArray(current, entityTypes)) return;
    const filters = { ...get().filters, entityTypes };
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
      get().nodes,
    );
    set({ filters, ...visible });
  },

  setHideInferred: (hideInferred) => {
    if (get().filters.hideInferred === hideInferred) return;
    const filters = { ...get().filters, hideInferred };
    const visible = projectGraph(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
      get().nodes,
    );
    set({ filters, ...visible });
  },

  resetFilters: () => {
    const filters = { ...defaultFilters, kinds: [...ALL_KINDS] };
    const visible = projectGraph(baseNodes, baseEdges, filters, null, []);
    set({ filters, selectedId: null, panelOpen: false, ...visible });
  },
}));

export function useAtlasStats() {
  const atlas = useAtlasStore((s) => s.atlas);
  const visible = useAtlasStore((s) => s.nodes.length);

  return useMemo(() => {
    if (!atlas) {
      return {
        entities: 0,
        assumptions: 0,
        principles: 0,
        edges: 0,
        visible: 0,
      };
    }
    return {
      entities: atlas.nodes.filter((n) => n.kind === "entity").length,
      assumptions: atlas.nodes.filter((n) => n.kind === "assumption").length,
      principles: atlas.nodes.filter((n) => n.kind === "principle").length,
      edges: atlas.edges.length,
      visible,
    };
  }, [atlas, visible]);
}

export function useAvailableFacets() {
  const atlas = useAtlasStore((s) => s.atlas);

  return useMemo(() => {
    if (!atlas) {
      return { countries: [] as string[], entityTypes: [] as string[] };
    }
    const countries = new Set<string>();
    const entityTypes = new Set<string>();
    for (const node of atlas.nodes) {
      if (isEntity(node)) {
        if (node.country) countries.add(node.country);
        entityTypes.add(node.entityType);
      }
    }
    return {
      countries: [...countries].sort(),
      entityTypes: [...entityTypes].sort(),
    };
  }, [atlas]);
}
