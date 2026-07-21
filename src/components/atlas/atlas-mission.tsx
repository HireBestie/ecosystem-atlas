"use client";

import { useMemo, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleDot,
  ExternalLink,
  Gauge,
  Radar,
  Scale,
  ShieldAlert,
  Target,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  isMissionKind,
  type MissionAssumption,
  type MissionEdge,
  type MissionNode,
  type MissionRecommendation,
} from "@/lib/mission-types";
import { useActiveWorldview, useMissionStore } from "@/store/mission-store";

const tone = {
  external: {
    ink: "text-teal-200",
    border: "border-teal-400/25",
    wash: "bg-teal-400/[0.055]",
    bar: "bg-teal-300",
  },
  internal: {
    ink: "text-amber-200",
    border: "border-amber-400/25",
    wash: "bg-amber-400/[0.055]",
    bar: "bg-amber-300",
  },
  objective: {
    ink: "text-[#f3dfb1]",
    border: "border-[#e7b85b]/35",
    wash: "bg-[#e7b85b]/[0.08]",
    bar: "bg-[#e7b85b]",
  },
} as const;

export function AtlasMission() {
  const mission = useMissionStore((state) => state.mission);
  const worldviewId = useMissionStore((state) => state.worldviewId);
  const setWorldviewId = useMissionStore((state) => state.setWorldviewId);
  const worldview = useActiveWorldview();

  const model = useMemo(() => {
    if (!mission) return null;
    const byId = new Map(mission.nodes.map((node) => [node.id, node]));
    const assumptions = mission.nodes.filter((node) =>
      isMissionKind(node, "assumption"),
    );
    const external = assumptions.filter(
      (node) => node.systemRole === "external_event",
    );
    const internal = assumptions.filter(
      (node) => node.systemRole === "operator_situation",
    );
    const objectiveMarket = assumptions.find(
      (node) => node.systemRole === "operator_objective",
    );
    const theorem = mission.nodes.find((node) =>
      isMissionKind(node, "operating_theorem"),
    );
    const rebuttals = mission.nodes.filter((node) =>
      isMissionKind(node, "rebuttal"),
    );
    const argumentsList = mission.nodes.filter((node) =>
      isMissionKind(node, "argumentation"),
    );
    const terminalStates = mission.nodes
      .filter((node) => isMissionKind(node, "assumption_state"))
      .filter((state) => state.assumptionId === objectiveMarket?.id)
      .sort((a, b) => a.asOf.localeCompare(b.asOf));
    const influenceEdges = mission.edges.filter((edge) => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      return (
        from?.kind === "assumption" &&
        from.systemRole === "external_event" &&
        to?.kind === "assumption" &&
        to.systemRole !== "external_event"
      );
    });
    return {
      byId,
      external,
      internal,
      objectiveMarket,
      theorem,
      rebuttals,
      argumentsList,
      terminalStates,
      influenceEdges,
    };
  }, [mission]);

  if (!mission || !worldview || !model) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading mission graph…
      </div>
    );
  }

  const selectedRecommendation = model.byId.get(
    worldview.selectedRecommendationId,
  ) as MissionRecommendation | undefined;
  const selectedIntervention = selectedRecommendation
    ? linkedNode(model.byId, mission.edges, selectedRecommendation.id, "SELECTED_BY")
    : undefined;
  const selectedAsset = selectedIntervention
    ? linkedNode(model.byId, mission.edges, selectedIntervention.id, "USES_ASSET")
    : undefined;
  const selectedMetric = selectedIntervention
    ? linkedNode(model.byId, mission.edges, selectedIntervention.id, "MEASURED_BY")
    : undefined;
  const activePrinciples = worldview.principleIds
    .map((id) => model.byId.get(id))
    .filter((node): node is Extract<MissionNode, { kind: "principle" }> =>
      Boolean(node && node.kind === "principle"),
    );

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b1014] text-[#f4f0e6]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:40px_40px]" />
      <ScrollArea className="relative h-full">
        <div className="mx-auto max-w-[1480px] px-4 py-7 md:px-8 lg:px-10">
          <header className="grid gap-7 border-b border-white/10 pb-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
                <span className="border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-teal-200">
                  Day-one operating system
                </span>
                <span className="text-white/45">{mission.meta.version}</span>
                <span className="text-white/25">•</span>
                <span className="text-white/45">flat-file prototype</span>
              </div>
              <h2 className="max-w-4xl font-[family-name:var(--font-mission)] text-4xl leading-[1.02] tracking-[-0.035em] text-[#f6eddb] md:text-6xl">
                {mission.meta.title}
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-white/55 md:text-[15px]">
                External events are prediction markets. Internal milestones are
                prediction markets. Causal edges make the influence explicit;
                rebuttals show what could stop the mission; principles compile
                into the next move.
              </p>
            </div>
            <div className="border-l-2 border-amber-300/70 pl-5">
              <p className="font-mono text-[10px] tracking-[0.18em] text-amber-200 uppercase">
                Scope
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {mission.meta.disclaimer}
              </p>
            </div>
          </header>

          <section className="grid border-b border-white/10 sm:grid-cols-5">
            {mission.readiness.map((item, index) => (
              <div
                key={item.id}
                className="relative border-white/10 px-4 py-4 sm:border-r sm:last:border-r-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] text-white/35">
                    0{index + 1}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.status === "ready" ? "bg-teal-300" : "bg-amber-300"
                    }`}
                  />
                </div>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{item.proof}</p>
              </div>
            ))}
          </section>

          <section className="py-10">
            <SectionTitle
              index="01"
              eyebrow="Marcou-compatible world model"
              title="One mission, three market lanes"
              body="The factual layer remains independent from what the operator wants. Every market has a date, resolution rule and current belief state."
            />

            <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_1fr_.78fr]">
              <MarketLane
                title="External events"
                subtitle="What must become true in the ecosystem"
                icon={<Radar className="h-4 w-4" />}
                assumptions={model.external}
                palette="external"
              />
              <MarketLane
                title="Internal events"
                subtitle="What the operator can make happen"
                icon={<Gauge className="h-4 w-4" />}
                assumptions={model.internal}
                palette="internal"
              />
              <MarketLane
                title="Objective market"
                subtitle="The outcome that settles the mission"
                icon={<Target className="h-4 w-4" />}
                assumptions={model.objectiveMarket ? [model.objectiveMarket] : []}
                palette="objective"
              />
            </div>

            <div className="mt-4 border border-white/10 bg-black/15">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.16em] text-white/50 uppercase">
                  Causal influence ledger
                </p>
                <span className="text-xs text-white/30">
                  Estimated deltas are hypotheses, not attribution claims
                </span>
              </div>
              <div className="divide-y divide-white/[0.07]">
                {model.influenceEdges.map((edge) => (
                  <InfluenceRow key={edge.id} edge={edge} byId={model.byId} />
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 py-10">
            <SectionTitle
              index="02"
              eyebrow="Rebuttal-first account intelligence"
              title="What can stop the close?"
              body="A support judgment without an active counter-argument is CRM theatre. Each blocker is tied to the market it challenges and the intervention that can test or remove it."
            />
            <div className="mt-7 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
              {model.rebuttals.map((rebuttal) => (
                <div key={rebuttal.id} className="bg-[#10161b] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <ShieldAlert className="h-4 w-4 text-[#e37b64]" />
                    <span className="font-mono text-[10px] tracking-wider text-[#e9a08f] uppercase">
                      {rebuttal.severity}
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-white/78">
                    {rebuttal.statement}
                  </p>
                  <p className="mt-4 font-mono text-[10px] text-white/35">
                    Address via {rebuttal.resolvableVia?.join(" / ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/10 py-10">
            <SectionTitle
              index="03"
              eyebrow="Worldview compiler"
              title="Same world. Different policy. Different move."
              body="Organisation constraints, team strategy and target doctrine remain separate. The operating theorem compiles them for this objective and target."
            />

            <div className="mt-7 flex flex-wrap gap-2">
              {mission.worldviews.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setWorldviewId(profile.id)}
                  className={`border px-4 py-2 text-xs transition-colors ${
                    profile.id === worldviewId
                      ? "border-[#e7b85b]/60 bg-[#e7b85b]/12 text-[#f5deb0]"
                      : "border-white/10 text-white/45 hover:border-white/25 hover:text-white/75"
                  }`}
                >
                  {profile.name}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[.92fr_1.08fr]">
              <div className="grid gap-px border border-white/10 bg-white/10">
                {activePrinciples.map((principle) => (
                  <div key={principle.id} className="bg-[#10161b] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
                        {principle.principleType.replaceAll("_", " ")}
                      </span>
                      <span className="font-mono text-[10px] text-white/30">
                        {principle.strength}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/78">
                      {principle.statement}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border border-amber-300/25 bg-amber-300/[0.045] p-6">
                <div className="flex items-center gap-2 text-amber-200">
                  <Scale className="h-4 w-4" />
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
                    Compiled operating theorem
                  </span>
                </div>
                {model.theorem ? (
                  <>
                    <p className="mt-5 font-[family-name:var(--font-mission)] text-2xl leading-tight text-[#f5e8cf]">
                      Prefer {model.theorem.prefer} over {model.theorem.over}.
                    </p>
                    <p className="mt-4 text-sm leading-6 text-white/58">
                      {model.theorem.because}
                    </p>
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="font-mono text-[10px] tracking-wider text-[#e9a08f] uppercase">
                        Unless
                      </p>
                      <ul className="mt-2 space-y-2 text-xs text-white/50">
                        {model.theorem.unless.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-[#e37b64]">×</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 py-10">
            <SectionTitle
              index="04"
              eyebrow="Next-best intervention"
              title="Turn the ruling into a programme"
              body={worldview.rankingNote}
            />
            <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
              <div className="border border-teal-300/25 bg-teal-300/[0.045] p-6 md:p-8">
                <p className="font-mono text-[10px] tracking-[0.16em] text-teal-200 uppercase">
                  Selected under {worldview.name}
                </p>
                <h3 className="mt-4 font-[family-name:var(--font-mission)] text-3xl leading-tight text-[#f4eedf]">
                  {selectedRecommendation?.statement}
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/58">
                  {selectedRecommendation?.rationale}
                </p>
                {selectedIntervention?.kind === "intervention" ? (
                  <div className="mt-7 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
                    <div>
                      <p className="font-mono text-[10px] text-white/35 uppercase">Expected effect</p>
                      <p className="mt-2 text-sm leading-6 text-white/65">{selectedIntervention.expectedEffect}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-white/35 uppercase">Success gate</p>
                      <ul className="mt-2 space-y-2 text-sm text-white/65">
                        {selectedIntervention.successCriteria.map((item) => (
                          <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="grid gap-4">
                <CompactArtifact
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Ready asset"
                  node={selectedAsset}
                  href={
                    selectedAsset?.kind === "enablement_asset"
                      ? "/enablement/build-with-claude/"
                      : undefined
                  }
                />
                <CompactArtifact icon={<Gauge className="h-4 w-4" />} label="Programme measurement" node={selectedMetric} />
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 py-10">
            <SectionTitle
              index="05"
              eyebrow="Argument → state"
              title="Every belief move leaves a receipt"
              body="Observed facts can append directly. Support-level changes require an argument that admits evidence, states its warrant and keeps rebuttals visible — without fake numerical precision."
            />
            <div className="mt-7 grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
              <div className="border border-white/10 bg-white/[0.025] p-6">
                <p className="font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">Belief history</p>
                <div className="mt-5 flex items-center gap-3">
                  {model.terminalStates.map((state, index) => (
                    <div key={state.id} className="contents">
                      {index > 0 ? <ArrowRight className="h-4 w-4 shrink-0 text-white/25" /> : null}
                      <div className="min-w-0 flex-1 border border-white/10 bg-black/20 p-4">
                        <p className="font-mono text-sm uppercase tracking-wide text-[#f3d897]">
                          {state.supportLevel.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-white/35">{state.asOf}</p>
                        <p className="mt-3 text-xs leading-5 text-white/48">{state.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-white/10 bg-white/[0.025] p-6">
                {model.argumentsList[0] ? (
                  <>
                    <div className="flex items-center gap-2 text-teal-200">
                      <CircleDot className="h-4 w-4" />
                      <p className="font-mono text-[10px] tracking-[0.16em] uppercase">Admitted argumentation</p>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-white/68">{model.argumentsList[0].warrant}</p>
                    <div className="mt-5 border-l-2 border-amber-300/60 pl-4">
                      <p className="text-sm font-medium leading-6 text-[#f0dfb9]">{model.argumentsList[0].claim}</p>
                    </div>
                    <SourceLink node={model.argumentsList[0]} />
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <footer className="flex flex-col gap-4 border-t border-white/10 py-7 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
            <p>
              Ontology alignment: Instance / append-only State / Argumentation / Rebuttal / Principle.
            </p>
            <a
              href="https://job-boards.greenhouse.io/anthropic/jobs/5131095008"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white"
            >
              Public role mandate <ExternalLink className="h-3 w-3" />
            </a>
          </footer>
        </div>
      </ScrollArea>
    </div>
  );
}

function SectionTitle({ index, eyebrow, title, body }: { index: string; eyebrow: string; title: string; body: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-[56px_1fr_1fr] md:items-end">
      <span className="font-mono text-xs text-white/25">{index}</span>
      <div>
        <p className="font-mono text-[10px] tracking-[0.18em] text-teal-200/75 uppercase">{eyebrow}</p>
        <h3 className="mt-2 font-[family-name:var(--font-mission)] text-3xl leading-tight text-[#f4eedf]">{title}</h3>
      </div>
      <p className="max-w-xl text-sm leading-6 text-white/48">{body}</p>
    </div>
  );
}

function MarketLane({ title, subtitle, icon, assumptions, palette }: { title: string; subtitle: string; icon: ReactNode; assumptions: MissionAssumption[]; palette: keyof typeof tone }) {
  const colors = tone[palette];
  return (
    <div className={`border ${colors.border} ${colors.wash}`}>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className={colors.ink}>{icon}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[11px] text-white/35">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-white/[0.07]">
        {assumptions.map((assumption) => (
          <MarketCard key={assumption.id} assumption={assumption} palette={palette} />
        ))}
      </div>
    </div>
  );
}

function MarketCard({ assumption, palette }: { assumption: MissionAssumption; palette: keyof typeof tone }) {
  const colors = tone[palette];
  const supportLabel =
    assumption.supportLevel === "supported"
      ? "Supported"
      : assumption.supportLevel === "weakly_supported"
        ? "Weakly supported"
        : "Uncertain";
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-5 text-white/76">{assumption.statement}</p>
        <span className={`shrink-0 font-mono text-[10px] tracking-wide uppercase ${colors.ink}`}>
          {supportLabel}
        </span>
      </div>
      <div className="mt-3 space-y-2 text-[11px] leading-5 text-white/45">
        <p>
          <span className="text-white/30">For · </span>
          {assumption.evidenceFor.slice(0, 2).join(" · ")}
        </p>
        <p>
          <span className="text-white/30">Against · </span>
          {assumption.evidenceAgainst.slice(0, 2).join(" · ")}
        </p>
        <p>
          <span className="text-white/30">Unknown · </span>
          {assumption.unknowns.slice(0, 2).join(" · ")}
        </p>
        <p>
          <span className="text-white/30">Decision · </span>
          {assumption.decisionAffected}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[9px] tracking-wide text-white/32 uppercase">
        <span>{assumption.family}</span>
        <span>resolves {assumption.resolveBy}</span>
      </div>
    </div>
  );
}

function InfluenceRow({ edge, byId }: { edge: MissionEdge; byId: Map<string, MissionNode> }) {
  const from = byId.get(edge.from);
  const to = byId.get(edge.to);
  if (!from || !to) return null;
  const fromLabel = from.kind === "assumption" ? from.statement : edge.from;
  const toLabel = to.kind === "assumption" ? to.statement : edge.to;
  return (
    <div className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_auto_1fr_76px] md:items-center">
      <p className="text-xs leading-5 text-teal-100/65">{fromLabel}</p>
      <span className="font-mono text-[9px] tracking-wider text-white/35 uppercase">{edge.rel}</span>
      <p className="text-xs leading-5 text-amber-100/65">{toLabel}</p>
      <span className="justify-self-start border border-teal-300/20 bg-teal-300/[0.06] px-2 py-1 font-mono text-[10px] text-teal-200 md:justify-self-end">
        {edge.magnitude ?? "—"}
      </span>
      {edge.mechanism ? <p className="text-[11px] leading-5 text-white/30 md:col-span-4">{edge.mechanism}</p> : null}
    </div>
  );
}

function CompactArtifact({
  icon,
  label,
  node,
  href,
}: {
  icon: ReactNode;
  label: string;
  node?: MissionNode;
  href?: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-white/45">
        {icon}
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase">{label}</span>
      </div>
      <p className="mt-4 text-sm font-medium leading-6 text-white/78">
        {node ? nodeLabel(node) : "Not linked"}
      </p>
      {node?.kind === "enablement_asset" ? (
        <p className="mt-2 text-xs leading-5 text-white/42">{node.summary}</p>
      ) : null}
      {node?.kind === "metric" ? (
        <p className="mt-2 font-mono text-xs leading-5 text-amber-200/75">{node.targetValue}</p>
      ) : null}
      {href ? (
        <a
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-[10px] text-teal-200/80 hover:text-teal-100"
        >
          Open kit <ExternalLink className="h-2.5 w-2.5" />
        </a>
      ) : node ? (
        <SourceLink node={node} />
      ) : null}
    </div>
  );
}

function SourceLink({ node }: { node: MissionNode }) {
  const source = node.sources[0];
  if (!source) return null;
  return (
    <a href={source.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-[10px] text-white/35 hover:text-white/65">
      {source.title ?? source.url}<ExternalLink className="h-2.5 w-2.5" />
    </a>
  );
}

function linkedNode(byId: Map<string, MissionNode>, edges: MissionEdge[], from: string, rel: MissionEdge["rel"]): MissionNode | undefined {
  const edge = edges.find((candidate) => candidate.from === from && candidate.rel === rel);
  return edge ? byId.get(edge.to) : undefined;
}

function nodeLabel(node: MissionNode): string {
  if (node.kind === "entity" || node.kind === "intervention" || node.kind === "enablement_asset") return node.name;
  if (node.kind === "argumentation") return node.claim;
  if (node.kind === "assumption_state") return node.note;
  return node.statement;
}
