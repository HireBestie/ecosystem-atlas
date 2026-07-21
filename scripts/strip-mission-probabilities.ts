/**
 * Strip fake probabilities from mission-motier.json → support tiers.
 */
import { readFileSync, writeFileSync } from "fs";

type SupportLevel = "supported" | "uncertain" | "weakly_supported";

function levelFromProb(p: number | undefined): SupportLevel {
  if (p === undefined) return "uncertain";
  if (p >= 0.65) return "supported";
  if (p >= 0.4) return "uncertain";
  return "weakly_supported";
}

const path = "public/data/mission-motier.json";
const mission = JSON.parse(readFileSync(path, "utf8"));

mission.meta = {
  ...mission.meta,
  version: "mission-graph-v3-support-tiers",
  generatedAt: new Date().toISOString(),
  disclaimer:
    "A role-specific work sample, not an Anthropic plan or a claim of existing relationships. Public facts are sourced. Support levels are qualitative judgments for programme design — not calibrated probabilities.",
};

mission.readiness = mission.readiness.map(
  (r: { id: string; status: string; proof: string }) =>
    r.id === "enable"
      ? {
          ...r,
          status: "ready",
          proof: "Build with Claude Evaluation Kit (inspectable)",
        }
      : r,
);

for (const node of mission.nodes) {
  if (node.kind === "assumption") {
    const p = node.probability as number | undefined;
    node.supportLevel = levelFromProb(p);
    delete node.probability;
    node.evidenceFor = node.evidenceFor ?? [
      ...(node.sources ?? []).map(
        (s: { title?: string; url: string }) => s.title ?? s.url,
      ),
    ];
    node.evidenceAgainst = node.evidenceAgainst ?? [
      "Partner-side validation not yet obtained",
    ];
    node.unknowns = node.unknowns ?? [
      "Named programme owner",
      "Shared technical need across cohort",
    ];
    node.decisionAffected =
      node.decisionAffected ??
      "Whether to invest operator time in a Motier portfolio cohort vs another partner.";
  }
  if (node.kind === "assumption_state") {
    node.supportLevel = levelFromProb(node.probability);
    delete node.probability;
  }
  if (node.kind === "argumentation" && typeof node.claim === "string") {
    node.claim = node.claim
      .replace(/from \d+% to \d+%/g, "from weakly supported to uncertain")
      .replace(/\d+%/g, "a qualitative support update");
  }
  if (node.kind === "enablement_asset") {
    node.sources = [
      {
        url: "/enablement/build-with-claude/",
        title: "Build with Claude — Evaluation Kit",
        accessed: "2026-07-20",
      },
    ];
  }
}

for (const edge of mission.edges) {
  delete edge.estimatedDeltaPp;
}

writeFileSync(path, JSON.stringify(mission, null, 2) + "\n");
console.log("mission updated", mission.meta.version);
