import { Graph, layout as dagreLayout } from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { AtlasData, AtlasNode, NodeKind } from "@/lib/atlas-types";
import { isAssumption, isEntity, isPrinciple } from "@/lib/atlas-types";

export type AtlasFlowNodeData = {
  atlas: AtlasNode;
  degree: number;
  dimmed: boolean;
};

export type AtlasFlowNode = Node<AtlasFlowNodeData, NodeKind>;
export type AtlasFlowEdge = Edge<{ rel: string }>;

const NODE_WIDTH: Record<NodeKind, number> = {
  entity: 200,
  assumption: 240,
  principle: 220,
};

const NODE_HEIGHT: Record<NodeKind, number> = {
  entity: 72,
  assumption: 96,
  principle: 88,
};

function computeDegrees(data: AtlasData): Map<string, number> {
  const degrees = new Map<string, number>();
  for (const node of data.nodes) {
    degrees.set(node.id, 0);
  }
  for (const edge of data.edges) {
    degrees.set(edge.from, (degrees.get(edge.from) ?? 0) + 1);
    degrees.set(edge.to, (degrees.get(edge.to) ?? 0) + 1);
  }
  return degrees;
}

export function buildFlowGraph(data: AtlasData): {
  nodes: AtlasFlowNode[];
  edges: AtlasFlowEdge[];
} {
  const degrees = computeDegrees(data);

  const nodes: AtlasFlowNode[] = data.nodes.map((atlas) => ({
    id: atlas.id,
    type: atlas.kind,
    position: { x: 0, y: 0 },
    data: {
      atlas,
      degree: degrees.get(atlas.id) ?? 0,
      dimmed: false,
    },
    width: NODE_WIDTH[atlas.kind],
    height: NODE_HEIGHT[atlas.kind],
  }));

  const edges: AtlasFlowEdge[] = data.edges.map((edge, index) => ({
    id: `e:${edge.from}->${edge.to}:${edge.rel}:${index}`,
    source: edge.from,
    target: edge.to,
    data: { rel: edge.rel },
    type: "smoothstep",
  }));

  return { nodes: layoutNodes(nodes, edges), edges };
}

export function layoutNodes(
  nodes: AtlasFlowNode[],
  edges: AtlasFlowEdge[],
): AtlasFlowNode[] {
  try {
    return layoutWithDagre(nodes, edges);
  } catch (err) {
    console.error("[layoutNodes] dagre failed, using grid fallback", err);
    return layoutWithGrid(nodes);
  }
}

function layoutWithGrid(nodes: AtlasFlowNode[]): AtlasFlowNode[] {
  const columns = 8;
  return nodes.map((node, index) => {
    const width = NODE_WIDTH[node.type as NodeKind];
    const height = NODE_HEIGHT[node.type as NodeKind];
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      ...node,
      position: {
        x: col * (width + 48),
        y: row * (height + 36),
      },
    };
  });
}

function layoutWithDagre(
  nodes: AtlasFlowNode[],
  edges: AtlasFlowEdge[],
): AtlasFlowNode[] {
  const g = new Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: 36,
    ranksep: 90,
    marginx: 40,
    marginy: 40,
    align: "UL",
  });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: NODE_WIDTH[node.type as NodeKind],
      height: NODE_HEIGHT[node.type as NodeKind],
    });
  }

  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagreLayout(g);

  // Secondary pass: sort assumptions by event date vertically within their column
  const assumptionY = new Map<string, number>();
  const assumptions = nodes
    .filter((n) => n.type === "assumption")
    .sort((a, b) => {
      const da = isAssumption(a.data.atlas)
        ? a.data.atlas.anchoredToEvent?.date ?? "9999"
        : "9999";
      const db = isAssumption(b.data.atlas)
        ? b.data.atlas.anchoredToEvent?.date ?? "9999"
        : "9999";
      return da.localeCompare(db);
    });

  assumptions.forEach((node, index) => {
    assumptionY.set(node.id, 40 + index * 110);
  });

  return nodes.map((node) => {
    const layout = g.node(node.id);
    const width = NODE_WIDTH[node.type as NodeKind];
    const height = NODE_HEIGHT[node.type as NodeKind];
    let x = layout.x - width / 2;
    let y = layout.y - height / 2;

    if (node.type === "assumption" && assumptionY.has(node.id)) {
      y = assumptionY.get(node.id)!;
    }

    if (node.type === "entity" && isEntity(node.data.atlas)) {
      const typeOffset: Record<string, number> = {
        frontier_lab: -20,
        ai_startup: 0,
        vc_fund: 30,
        accelerator: -10,
        incubator: -10,
        public_institution: 50,
        person: 70,
      };
      y += typeOffset[node.data.atlas.entityType] ?? 0;
    }

    return {
      ...node,
      position: { x, y },
    };
  });
}

export function matchesFilters(
  node: AtlasNode,
  filters: {
    query: string;
    kinds: NodeKind[];
    countries: string[];
    entityTypes: string[];
    hideInferred: boolean;
  },
): boolean {
  if (!filters.kinds.includes(node.kind)) return false;

  if (isPrinciple(node) && filters.hideInferred && node.inferred) {
    return false;
  }

  if (isEntity(node)) {
    if (
      filters.countries.length > 0 &&
      node.country &&
      !filters.countries.includes(node.country)
    ) {
      return false;
    }
    if (
      filters.entityTypes.length > 0 &&
      !filters.entityTypes.includes(node.entityType)
    ) {
      return false;
    }
  } else if (filters.entityTypes.length > 0 || filters.countries.length > 0) {
    // Non-entities only show when linked to a visible entity — handled at store level.
    // Here we keep them if kind passes; store will dim/hide orphans.
  }

  const q = filters.query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    node.id,
    isEntity(node) ? node.name : "",
    isEntity(node) ? node.summary ?? "" : "",
    isEntity(node) ? node.entityType : "",
    isEntity(node) ? (node.tags ?? []).join(" ") : "",
    isAssumption(node) ? node.statement : "",
    isAssumption(node) ? node.anchoredToEvent?.what ?? "" : "",
    isPrinciple(node) ? node.statement : "",
    isPrinciple(node) ? node.quote ?? "" : "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}
