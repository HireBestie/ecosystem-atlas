export type SourceRef = {
  url: string;
  title?: string;
  accessed?: string;
};

export type IdentificationStatus =
  | "confirmed"
  | "hypothesized"
  | "unknown"
  | "needs_research";

export type LinkedInDegree = 1 | 2 | 3 | null;

export type TieStrength = "strong" | "warm" | "weak" | "unknown";

export type NetworkNodeKind = "person" | "org";

export type NetworkRelation =
  | "KNOWS"
  | "CAN_INTRO"
  | "WORKS_AT"
  | "PARTNER_AT"
  | "FOUNDED"
  | "ADVISES"
  | "CO_INVESTS_WITH"
  | "PROGRAM_OWNER_FOR"
  | "MEMBER_OF";

export type NetworkPerson = {
  id: string;
  kind: "person";
  name: string;
  publicRole: string;
  orgIds: string[];
  thesis?: string;
  identificationStatus: IdentificationStatus;
  linkedinUrl?: string;
  /** Ego / bridge / target */
  networkRole: "ego" | "bridge" | "target" | "ecosystem";
  notes?: string;
  sources: SourceRef[];
};

export type NetworkOrg = {
  id: string;
  kind: "org";
  name: string;
  orgType: "vc_fund" | "accelerator" | "hub" | "community" | "other";
  country?: string;
  thesis?: string;
  aiStance?: "ai_native" | "opportunistic" | "mixed" | "unknown";
  atlasEntityId?: string;
  sources: SourceRef[];
};

export type NetworkNode = NetworkPerson | NetworkOrg;

export type NetworkEdge = {
  id: string;
  from: string;
  to: string;
  rel: NetworkRelation;
  linkedinDegree?: LinkedInDegree;
  strength?: TieStrength;
  /** Why this edge exists — must be honest */
  basis: string;
  confidence: "confirmed" | "likely" | "claimed" | "unknown";
  sources?: SourceRef[];
};

export type NetworkTarget = {
  personId: string;
  orgId: string;
  priority: number;
  why: string;
  desiredAsk: string;
  killCriteria?: string;
  /** Concrete next-step copy for the Next board in the app */
  verifySteps?: {
    sharedConnectionsHint?: string;
    introAskDraft?: string;
  };
};

export type BridgePathHop = {
  from: string;
  to: string;
  rel: NetworkRelation;
  linkedinDegree?: LinkedInDegree;
  strength?: TieStrength;
  basis: string;
};

export type BridgePath = {
  targetPersonId: string;
  hops: BridgePathHop[];
  /** 1 = direct L1, 2 = via one bridge, null = no path */
  degreesFromEgo: 1 | 2 | null;
  score: number;
  blockers: string[];
};

export type NetworkGraph = {
  meta: {
    version: string;
    title: string;
    generatedAt: string;
    disclaimer: string;
    enrichment?: Record<string, string>;
    /** When true, UI never renders bridge person names — only proximity. */
    hideBridgeIdentities?: boolean;
  };
  egoPersonId: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  targets: NetworkTarget[];
  /**
   * Optional declared proximity (usually from private overlay).
   * Bridge identity must never be stored in public JSON.
   */
  proximityClaims?: ProximityClaim[];
  proximityPolicy?: ProximityPolicy;
};

/** Declared L1/L2 without naming the voucher in public UI. */
export type ProximityClaim = {
  targetPersonId: string;
  degreesFromEgo: 1 | 2;
  voucherStrength: TieStrength;
  /** Safe to show publicly — no names */
  basisPublic: string;
  confidence: "confirmed" | "claimed" | "likely";
};

export type ProximityPolicy = {
  /** Apply to every target lacking an explicit claim or graph path */
  defaultDegreesFromEgo?: 1 | 2;
  defaultVoucherStrength?: TieStrength;
  basisPublic?: string;
  confidence?: "confirmed" | "claimed" | "likely";
};

export type PublicProximity = {
  degreesFromEgo: 1 | 2 | null;
  /** confirmed = graph path or confirmed claim; claimed = operator assertion with hidden voucher */
  evidence: "graph" | "declared" | "none";
  confidence: "confirmed" | "claimed" | "likely" | "unknown";
  voucherStrength?: TieStrength;
  /** Always public-safe */
  label: string;
  basisPublic: string;
  blockers: string[];
  /** Internal only — never render in public Output view */
  _privatePath?: BridgePath | null;
};

export type NetworkOverlay = Partial<
  Pick<NetworkGraph, "nodes" | "edges" | "targets" | "proximityClaims" | "proximityPolicy">
> & {
  meta?: Partial<NetworkGraph["meta"]>;
};

export function isPerson(node: NetworkNode): node is NetworkPerson {
  return node.kind === "person";
}

export function isOrg(node: NetworkNode): node is NetworkOrg {
  return node.kind === "org";
}

export function findBridgePaths(
  graph: NetworkGraph,
  targetPersonId: string,
  maxDegree = 2,
): BridgePath[] {
  const ego = graph.egoPersonId;
  const personIds = new Set(
    graph.nodes.filter(isPerson).map((n) => n.id),
  );
  if (!personIds.has(targetPersonId) || !personIds.has(ego)) {
    return [];
  }

  type QueueItem = {
    nodeId: string;
    hops: BridgePathHop[];
    degree: number;
  };

  const adjacency = new Map<string, NetworkEdge[]>();
  for (const edge of graph.edges) {
    if (
      edge.rel !== "KNOWS" &&
      edge.rel !== "CAN_INTRO" &&
      edge.rel !== "WORKS_AT" &&
      edge.rel !== "PARTNER_AT"
    ) {
      // Still allow KNOWS/CAN_INTRO for path; org edges don't bridge people alone
    }
    if (edge.rel !== "KNOWS" && edge.rel !== "CAN_INTRO") continue;
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from)!.push(edge);
    // Undirected for KNOWS; CAN_INTRO is directional (from introducer to target)
    if (edge.rel === "KNOWS") {
      adjacency.get(edge.to)!.push({
        ...edge,
        from: edge.to,
        to: edge.from,
        id: `${edge.id}:rev`,
      });
    }
  }

  const results: BridgePath[] = [];
  const queue: QueueItem[] = [{ nodeId: ego, hops: [], degree: 0 }];
  const visited = new Set<string>([ego]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.nodeId === targetPersonId && current.hops.length > 0) {
      const degreesFromEgo =
        current.degree <= 2 ? (current.degree as 1 | 2) : null;
      const blockers: string[] = [];
      const target = graph.nodes.find(
        (n) => n.id === targetPersonId && isPerson(n),
      ) as NetworkPerson | undefined;
      if (target?.identificationStatus === "unknown") {
        blockers.push("Target person still unidentified");
      }
      if (target?.identificationStatus === "needs_research") {
        blockers.push("Target person needs research confirmation");
      }
      for (const hop of current.hops) {
        if (hop.strength === "weak" || hop.strength === "unknown") {
          blockers.push(`Weak/unknown tie on ${hop.from} → ${hop.to}`);
        }
      }
      const score =
        (degreesFromEgo === 1 ? 100 : degreesFromEgo === 2 ? 70 : 0) -
        blockers.length * 8 +
        current.hops.reduce(
          (acc, hop) =>
            acc +
            (hop.strength === "strong" ? 10 : hop.strength === "warm" ? 5 : 0),
          0,
        );
      results.push({
        targetPersonId,
        hops: current.hops,
        degreesFromEgo,
        score,
        blockers,
      });
      continue;
    }
    if (current.degree >= maxDegree) continue;

    const edges = adjacency.get(current.nodeId) ?? [];
    for (const edge of edges) {
      const nextId = edge.to;
      if (!personIds.has(nextId)) continue;
      if (visited.has(nextId) && nextId !== targetPersonId) continue;
      // Path length from ego (1 = direct, 2 = via one bridge). Do not use
      // edge.linkedinDegree as absolute distance — that field is per-hop LI degree.
      const hopDegree = current.degree + 1;
      if (hopDegree > maxDegree) continue;
      visited.add(nextId);
      queue.push({
        nodeId: nextId,
        degree: hopDegree,
        hops: [
          ...current.hops,
          {
            from: edge.from,
            to: edge.to,
            rel: edge.rel,
            linkedinDegree: edge.linkedinDegree ?? null,
            strength: edge.strength,
            basis: edge.basis,
          },
        ],
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function bestPathToTarget(
  graph: NetworkGraph,
  targetPersonId: string,
): BridgePath | null {
  const paths = findBridgePaths(graph, targetPersonId);
  return paths[0] ?? null;
}

/** Overlay private L1 names/edges/claims onto the public seed without committing PII. */
export function mergeNetworkGraphs(
  base: NetworkGraph,
  overlay: NetworkOverlay | null,
): NetworkGraph {
  if (!overlay) return base;
  const nodeById = new Map(base.nodes.map((n) => [n.id, n]));
  for (const node of overlay.nodes ?? []) {
    nodeById.set(node.id, node);
  }
  const edgeById = new Map(base.edges.map((e) => [e.id, e]));
  for (const edge of overlay.edges ?? []) {
    edgeById.set(edge.id, edge);
  }
  const targetByPerson = new Map(base.targets.map((t) => [t.personId, t]));
  for (const target of overlay.targets ?? []) {
    targetByPerson.set(target.personId, target);
  }
  const claimByTarget = new Map(
    (base.proximityClaims ?? []).map((c) => [c.targetPersonId, c]),
  );
  for (const claim of overlay.proximityClaims ?? []) {
    claimByTarget.set(claim.targetPersonId, claim);
  }
  return {
    ...base,
    meta: {
      ...base.meta,
      ...overlay.meta,
      hideBridgeIdentities:
        overlay.meta?.hideBridgeIdentities ??
        base.meta.hideBridgeIdentities ??
        true,
    },
    nodes: [...nodeById.values()],
    edges: [...edgeById.values()],
    targets: [...targetByPerson.values()].sort((a, b) => a.priority - b.priority),
    proximityClaims: [...claimByTarget.values()],
    proximityPolicy: overlay.proximityPolicy ?? base.proximityPolicy,
  };
}

export function resolvePublicProximity(
  graph: NetworkGraph,
  targetPersonId: string,
): PublicProximity {
  const path = bestPathToTarget(graph, targetPersonId);
  const claim = graph.proximityClaims?.find(
    (c) => c.targetPersonId === targetPersonId,
  );
  const policy = graph.proximityPolicy;

  if (path?.degreesFromEgo != null) {
    const strengthOk = !path.blockers.some((b) =>
      b.startsWith("Weak/unknown"),
    );
    return {
      degreesFromEgo: path.degreesFromEgo,
      evidence: "graph",
      confidence: strengthOk ? "confirmed" : "likely",
      voucherStrength:
        path.hops.find((h) => h.rel === "KNOWS" || h.rel === "CAN_INTRO")
          ?.strength ?? "unknown",
      label:
        path.degreesFromEgo === 1
          ? "L1 · direct"
          : "L2 · via trusted voucher",
      basisPublic:
        path.degreesFromEgo === 1
          ? "Direct LinkedIn L1 (voucher identity not shown)."
          : "Warm path via a trusted voucher in the personal network (identity private).",
      blockers: path.blockers,
      _privatePath: path,
    };
  }

  if (claim) {
    return {
      degreesFromEgo: claim.degreesFromEgo,
      evidence: "declared",
      confidence: claim.confidence,
      voucherStrength: claim.voucherStrength,
      label:
        claim.degreesFromEgo === 1
          ? "L1 · declared"
          : "L2 · trusted voucher",
      basisPublic: claim.basisPublic,
      blockers:
        claim.confidence === "claimed"
          ? ["Declared proximity — voucher identity private; verify before outreach"]
          : [],
      _privatePath: null,
    };
  }

  if (policy?.defaultDegreesFromEgo) {
    return {
      degreesFromEgo: policy.defaultDegreesFromEgo,
      evidence: "declared",
      confidence: policy.confidence ?? "claimed",
      voucherStrength: policy.defaultVoucherStrength ?? "strong",
      label:
        policy.defaultDegreesFromEgo === 1
          ? "L1 · policy"
          : "L2 · trusted voucher",
      basisPublic:
        policy.basisPublic ??
        "Trusted voucher in personal network (identity private).",
      blockers: [
        "Default proximity policy — not path-verified per target in public graph",
      ],
      _privatePath: null,
    };
  }

  return {
    degreesFromEgo: null,
    evidence: "none",
    confidence: "unknown",
    label: "No proximity claim",
    basisPublic:
      "No L1/L2 path in graph and no declared voucher claim for this target.",
    blockers: ["No proximity evidence"],
    _privatePath: null,
  };
}

export function targetCoverage(graph: NetworkGraph) {
  const rows = graph.targets.map((target) => {
    const person = graph.nodes.find(
      (n) => n.id === target.personId && isPerson(n),
    ) as NetworkPerson | undefined;
    const org = graph.nodes.find(
      (n) => n.id === target.orgId && isOrg(n),
    ) as NetworkOrg | undefined;
    const proximity = resolvePublicProximity(graph, target.personId);
    const path = proximity._privatePath ?? null;
    const identified =
      person?.identificationStatus === "confirmed" ||
      person?.identificationStatus === "hypothesized";
    return { target, person, org, path, proximity, identified };
  });
  return {
    rows,
    identifiedCount: rows.filter((r) => r.identified).length,
    pathCount: rows.filter((r) => r.proximity.degreesFromEgo != null).length,
    strongPathCount: rows.filter(
      (r) =>
        r.proximity.degreesFromEgo != null &&
        r.proximity.blockers.length === 0 &&
        (r.proximity.voucherStrength === "strong" ||
          r.proximity.voucherStrength === "warm" ||
          r.proximity.evidence === "graph"),
    ).length,
    claimedCount: rows.filter((r) => r.proximity.evidence === "declared")
      .length,
  };
}
