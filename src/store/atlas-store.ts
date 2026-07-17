"use client";

import {
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";
import type { AtlasData, AtlasFilters, AtlasNode, NodeKind } from "@/lib/atlas-types";
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
  view: "graph" | "timeline";
  filters: AtlasFilters;
  hydrate: (atlas: AtlasData) => void;
  onNodesChange: OnNodesChange<AtlasFlowNode>;
  onEdgesChange: OnEdgesChange<AtlasFlowEdge>;
  selectNode: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  setView: (view: "graph" | "timeline") => void;
  setQuery: (query: string) => void;
  toggleKind: (kind: NodeKind) => void;
  toggleCountry: (country: string) => void;
  toggleEntityType: (entityType: string) => void;
  setHideInferred: (hide: boolean) => void;
  resetFilters: () => void;
  getSelectedNode: () => AtlasNode | null;
  getNeighborIds: (id: string) => Set<string>;
};

const defaultFilters: AtlasFilters = {
  query: "",
  kinds: [...ALL_KINDS],
  countries: [],
  entityTypes: [],
  hideInferred: true,
};

function applyVisibility(
  allNodes: AtlasFlowNode[],
  allEdges: AtlasFlowEdge[],
  filters: AtlasFilters,
  selectedId: string | null,
): { nodes: AtlasFlowNode[]; edges: AtlasFlowEdge[] } {
  const neighborIds = new Set<string>();
  if (selectedId) {
    for (const edge of allEdges) {
      if (edge.source === selectedId) neighborIds.add(edge.target);
      if (edge.target === selectedId) neighborIds.add(edge.source);
    }
  }

  const entityVisible = new Set<string>();
  for (const node of allNodes) {
    if (node.data.atlas.kind === "entity" && matchesFilters(node.data.atlas, filters)) {
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

    // Show assumption/principle if connected to a visible entity, or if no entity filters active
    const linkedToVisibleEntity = allEdges.some((edge) => {
      const other = edge.source === node.id ? edge.target : edge.target === node.id ? edge.source : null;
      if (!other) return false;
      return entityVisible.has(other);
    });

    const entityFilterActive =
      filters.countries.length > 0 || filters.entityTypes.length > 0;

    if (!entityFilterActive || linkedToVisibleEntity || filters.query.trim()) {
      visibleIds.add(node.id);
    }
  }

  const nodes = allNodes
    .filter((n) => visibleIds.has(n.id))
    .map((n) => {
      const dimmed =
        selectedId != null &&
        n.id !== selectedId &&
        !neighborIds.has(n.id);
      return {
        ...n,
        hidden: false,
        data: { ...n.data, dimmed },
        selected: n.id === selectedId,
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
        animated: highlighted || e.animated,
        style: {
          opacity: selectedId && !highlighted ? 0.12 : 0.55,
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
  view: "graph",
  filters: defaultFilters,

  hydrate: (atlas) => {
    const built = buildFlowGraph(atlas);
    baseNodes = built.nodes;
    baseEdges = built.edges;
    const filters = get().filters;
    const selectedId = get().selectedId;
    const visible = applyVisibility(baseNodes, baseEdges, filters, selectedId);
    set({ atlas, ...visible });
  },

  onNodesChange: (changes: NodeChange<AtlasFlowNode>[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange<AtlasFlowEdge>[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  selectNode: (id) => {
    const filters = get().filters;
    const visible = applyVisibility(baseNodes, baseEdges, filters, id);
    set({
      selectedId: id,
      panelOpen: id != null,
      ...visible,
    });
  },

  setPanelOpen: (open) => {
    if (!open) {
      const filters = get().filters;
      const visible = applyVisibility(baseNodes, baseEdges, filters, null);
      set({ panelOpen: false, selectedId: null, ...visible });
      return;
    }
    set({ panelOpen: open });
  },

  setView: (view) => set({ view }),

  setQuery: (query) => {
    const filters = { ...get().filters, query };
    const visible = applyVisibility(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
    );
    set({ filters, ...visible });
  },

  toggleKind: (kind) => {
    const current = get().filters.kinds;
    const kinds = current.includes(kind)
      ? current.filter((k) => k !== kind)
      : [...current, kind];
    const nextKinds = kinds.length === 0 ? [...ALL_KINDS] : kinds;
    const filters = { ...get().filters, kinds: nextKinds };
    const visible = applyVisibility(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
    );
    set({ filters, ...visible });
  },

  toggleCountry: (country) => {
    const current = get().filters.countries;
    const countries = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    const filters = { ...get().filters, countries };
    const visible = applyVisibility(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
    );
    set({ filters, ...visible });
  },

  toggleEntityType: (entityType) => {
    const current = get().filters.entityTypes;
    const entityTypes = current.includes(entityType as never)
      ? current.filter((t) => t !== entityType)
      : [...current, entityType as never];
    const filters = { ...get().filters, entityTypes };
    const visible = applyVisibility(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
    );
    set({ filters, ...visible });
  },

  setHideInferred: (hideInferred) => {
    const filters = { ...get().filters, hideInferred };
    const visible = applyVisibility(
      baseNodes,
      baseEdges,
      filters,
      get().selectedId,
    );
    set({ filters, ...visible });
  },

  resetFilters: () => {
    const filters = { ...defaultFilters };
    const visible = applyVisibility(baseNodes, baseEdges, filters, null);
    set({ filters, selectedId: null, panelOpen: false, ...visible });
  },

  getSelectedNode: () => {
    const { atlas, selectedId } = get();
    if (!atlas || !selectedId) return null;
    return atlas.nodes.find((n) => n.id === selectedId) ?? null;
  },

  getNeighborIds: (id) => {
    const ids = new Set<string>();
    for (const edge of baseEdges) {
      if (edge.source === id) ids.add(edge.target);
      if (edge.target === id) ids.add(edge.source);
    }
    return ids;
  },
}));

export function useAtlasStats() {
  return useAtlasStore((s) => {
    if (!s.atlas) {
      return { entities: 0, assumptions: 0, principles: 0, edges: 0, visible: 0 };
    }
    return {
      entities: s.atlas.nodes.filter((n) => n.kind === "entity").length,
      assumptions: s.atlas.nodes.filter((n) => n.kind === "assumption").length,
      principles: s.atlas.nodes.filter((n) => n.kind === "principle").length,
      edges: s.atlas.edges.length,
      visible: s.nodes.length,
    };
  });
}

export function useAvailableFacets() {
  return useAtlasStore((s) => {
    if (!s.atlas) {
      return { countries: [] as string[], entityTypes: [] as string[] };
    }
    const countries = new Set<string>();
    const entityTypes = new Set<string>();
    for (const node of s.atlas.nodes) {
      if (isEntity(node)) {
        if (node.country) countries.add(node.country);
        entityTypes.add(node.entityType);
      }
    }
    return {
      countries: [...countries].sort(),
      entityTypes: [...entityTypes].sort(),
    };
  });
}
