export type SourceRef = {
  url: string;
  title?: string;
  accessed?: string;
};

export type EntityType =
  | "frontier_lab"
  | "ai_startup"
  | "vc_fund"
  | "accelerator"
  | "incubator"
  | "community"
  | "event"
  | "public_institution"
  | "university"
  | "media"
  | "person";

/** Atlas knowledge kinds — principles reserved for real decision rules only. */
export type NodeKind = "entity" | "assumption" | "signal" | "principle";

export type SignalType =
  | "public_position"
  | "fund_thesis"
  | "observed_signal";

export type AtlasSource = SourceRef;

export type EntityNode = {
  id: string;
  kind: "entity";
  entityType: EntityType;
  name: string;
  country?: string;
  city?: string;
  summary?: string;
  tags?: string[];
  sources: AtlasSource[];
};

export type AssumptionNode = {
  id: string;
  kind: "assumption";
  statement: string;
  status: "open" | "held" | "falsified" | string;
  resolveBy?: string;
  anchoredToEvent?: {
    date: string;
    what: string;
  };
  sources: AtlasSource[];
};

/** Observed public fact / thesis / position — not an operating doctrine. */
export type SignalNode = {
  id: string;
  kind: "signal";
  signalType: SignalType;
  statement: string;
  quote?: string;
  inferred?: boolean;
  sources: AtlasSource[];
};

/** Actual decision rule held by an actor (rare). */
export type PrincipleNode = {
  id: string;
  kind: "principle";
  statement: string;
  quote?: string;
  inferred?: boolean;
  sources: AtlasSource[];
};

export type AtlasNode =
  | EntityNode
  | AssumptionNode
  | SignalNode
  | PrincipleNode;

export type Relation =
  | "INVESTED_IN"
  | "ACCELERATED_BY"
  | "PARTNERS_WITH"
  | "HOSTS"
  | "MEMBER_OF"
  | "SPUN_OUT_OF"
  | "FUNDS"
  | "HOLDS_PRINCIPLE"
  | "OBSERVES_SIGNAL"
  | "BETS_ON"
  | "EVIDENCED_BY"
  | "SUPPORTS"
  | "CONTRADICTS"
  | string;

export type AtlasEdge = {
  from: string;
  to: string;
  rel: Relation;
  sources: AtlasSource[];
};

export type AtlasMeta = {
  version: string;
  generatedAt: string;
  scope: string;
};

export type AtlasData = {
  meta: AtlasMeta;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
};

export type AtlasFilters = {
  query: string;
  kinds: NodeKind[];
  countries: string[];
  entityTypes: EntityType[];
  hideInferred: boolean;
};

export const ALL_KINDS: NodeKind[] = [
  "entity",
  "assumption",
  "signal",
  "principle",
];

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  frontier_lab: "Frontier lab",
  ai_startup: "AI startup",
  vc_fund: "VC fund",
  accelerator: "Accelerator",
  incubator: "Incubator",
  community: "Community",
  event: "Event",
  public_institution: "Institution",
  university: "University",
  media: "Media",
  person: "Person",
};

export const KIND_LABELS: Record<NodeKind, string> = {
  entity: "Entities",
  assumption: "Assumptions",
  signal: "Signals",
  principle: "Principles",
};

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  public_position: "Public position",
  fund_thesis: "Fund thesis",
  observed_signal: "Observed signal",
};

export function isEntity(node: AtlasNode): node is EntityNode {
  return node.kind === "entity";
}

export function isAssumption(node: AtlasNode): node is AssumptionNode {
  return node.kind === "assumption";
}

export function isSignal(node: AtlasNode): node is SignalNode {
  return node.kind === "signal";
}

export function isPrinciple(node: AtlasNode): node is PrincipleNode {
  return node.kind === "principle";
}

export function nodeLabel(node: AtlasNode): string {
  if (isEntity(node)) return node.name;
  return node.statement;
}
