export type SourceRef = {
  url: string;
  title?: string;
  accessed?: string;
};

export type PrincipleType =
  | "org_constitution"
  | "team_strategy"
  | "target_doctrine"
  | "epistemic_rule";

export type PrincipleStrength =
  | "hard_constraint"
  | "default_rule"
  | "soft_preference";

export type AssumptionFamily =
  | "outcome"
  | "milestone"
  | "blocker"
  | "external"
  | "intervention";

export type AssumptionSystemRole =
  | "external_event"
  | "operator_situation"
  | "operator_objective";

export type MissionNodeKind =
  | "entity"
  | "objective"
  | "assumption"
  | "rebuttal"
  | "principle"
  | "operating_theorem"
  | "recommendation"
  | "intervention"
  | "enablement_asset"
  | "metric"
  | "evidence"
  | "argumentation"
  | "assumption_state";

export type MissionRelation =
  | "HAS_TERMINAL_MARKET"
  | "DEPENDS_ON"
  | "REBUTTED_BY"
  | "INFLUENCES"
  | "ACTIVATES"
  | "ADDRESSED_BY"
  | "SELECTED_BY"
  | "GOVERNED_BY"
  | "DERIVED_FROM"
  | "HOLDS_PRINCIPLE"
  | "MEASURED_BY"
  | "SUPPORTED_BY"
  | "CONTRADICTED_BY"
  | "PROPOSES_STATE"
  | "SETTLES"
  | "TARGETS"
  | "USES_ASSET"
  | "ALTERNATIVE_TO";

type BaseMissionNode = { id: string; sources: SourceRef[] };

export type MissionEntity = BaseMissionNode & {
  kind: "entity";
  entityType: string;
  name: string;
  country?: string;
  summary?: string;
  role?: "operator" | "target" | "other";
};

export type MissionObjective = BaseMissionNode & {
  kind: "objective";
  statement: string;
  targetEntityId: string;
  horizon: string;
};

export type MissionAssumption = BaseMissionNode & {
  kind: "assumption";
  statement: string;
  marketQuestion: string;
  family: AssumptionFamily;
  systemRole: AssumptionSystemRole;
  externalImpact?: "opportunity" | "threat" | "mixed";
  status: "open" | "held" | "falsified";
  resolveBy: string;
  resolutionCriteria: string;
  resolutionObservability: "public_direct" | "public_proxy" | "operator_confirmation";
  probability: number;
  currentStateId?: string;
};

export type MissionRebuttal = BaseMissionNode & {
  kind: "rebuttal";
  statement: string;
  severity: "fatal" | "active" | "watch";
  resolvableVia?: string[];
};

export type MissionPrinciple = BaseMissionNode & {
  kind: "principle";
  statement: string;
  principleType: PrincipleType;
  strength: PrincipleStrength;
  holderEntityId: string;
  quote?: string;
  decisionImplications: string[];
};

export type MissionOperatingTheorem = BaseMissionNode & {
  kind: "operating_theorem";
  statement: string;
  given: string[];
  when: string[];
  prefer: string;
  over: string;
  because: string;
  unless: string[];
};

export type MissionRecommendation = BaseMissionNode & {
  kind: "recommendation";
  statement: string;
  status: "selected" | "rejected" | "deferred";
  rationale: string;
};

export type MissionIntervention = BaseMissionNode & {
  kind: "intervention";
  name: string;
  summary: string;
  expectedEffect: string;
  preconditions: string[];
  successCriteria: string[];
};

export type MissionEnablementAsset = BaseMissionNode & {
  kind: "enablement_asset";
  name: string;
  summary: string;
  addressesRebuttals: string[];
};

export type MissionMetric = BaseMissionNode & {
  kind: "metric";
  statement: string;
  targetValue: string;
  reviewBy: string;
};

export type MissionEvidence = BaseMissionNode & {
  kind: "evidence";
  statement: string;
  observedAt: string;
};

export type MissionArgumentation = BaseMissionNode & {
  kind: "argumentation";
  evidenceIds: string[];
  rebuttalIds: string[];
  warrant: string;
  claim: string;
  observedAt: string;
};

export type MissionAssumptionState = BaseMissionNode & {
  kind: "assumption_state";
  assumptionId: string;
  probability: number;
  asOf: string;
  note: string;
};

export type MissionNode =
  | MissionEntity | MissionObjective | MissionAssumption | MissionRebuttal
  | MissionPrinciple | MissionOperatingTheorem | MissionRecommendation
  | MissionIntervention | MissionEnablementAsset | MissionMetric
  | MissionEvidence | MissionArgumentation | MissionAssumptionState;

export type MissionEdge = {
  id: string;
  from: string;
  to: string;
  rel: MissionRelation;
  polarity?: "positive" | "negative" | "mixed";
  magnitude?: "low" | "medium" | "high";
  mechanism?: string;
  estimatedDeltaPp?: number;
  asOf?: string;
  sources?: SourceRef[];
};

export type WorldviewProfile = {
  id: string;
  name: string;
  summary: string;
  principleIds: string[];
  selectedRecommendationId: string;
  rankingNote: string;
};

export type ReadinessCapability = {
  id: string;
  label: string;
  status: "ready" | "prototype" | "planned";
  proof: string;
};

export type MissionCase = {
  meta: {
    version: string;
    title: string;
    generatedAt: string;
    scope: string;
    disclaimer: string;
  };
  targetEntityId: string;
  defaultWorldviewId: string;
  worldviews: WorldviewProfile[];
  readiness: ReadinessCapability[];
  nodes: MissionNode[];
  edges: MissionEdge[];
};

export function isMissionKind<K extends MissionNodeKind>(
  node: MissionNode,
  kind: K,
): node is Extract<MissionNode, { kind: K }> {
  return node.kind === kind;
}

export function missionNodeLabel(node: MissionNode): string {
  switch (node.kind) {
    case "entity": return node.name;
    case "intervention":
    case "enablement_asset": return node.name;
    case "objective":
    case "assumption":
    case "rebuttal":
    case "principle":
    case "operating_theorem":
    case "recommendation":
    case "metric":
    case "evidence": return node.statement;
    case "argumentation": return node.claim;
    case "assumption_state": return `${Math.round(node.probability * 100)}% — ${node.note}`;
    default: {
      const exhaustive: never = node;
      return exhaustive;
    }
  }
}
