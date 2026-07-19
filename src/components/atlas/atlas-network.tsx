"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  ListChecks,
  Network,
  Shield,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  isOrg,
  isPerson,
  targetCoverage,
  type NetworkOrg,
  type NetworkPerson,
  type NetworkTarget,
  type PublicProximity,
} from "@/lib/network-types";
import {
  VERIFY_STEPS,
  useNetworkStore,
  type VerifyStepId,
} from "@/store/network-store";
import { cn } from "@/lib/utils";

type Panel = "next" | "output" | "method";

const NEXT_WAVE_MAX_PRIORITY = 5;

export function AtlasNetwork() {
  const network = useNetworkStore((s) => s.network);
  const selectedTargetId = useNetworkStore((s) => s.selectedTargetId);
  const selectTarget = useNetworkStore((s) => s.selectTarget);
  const verifyProgress = useNetworkStore((s) => s.verifyProgress);
  const toggleVerifyStep = useNetworkStore((s) => s.toggleVerifyStep);
  const [panel, setPanel] = useState<Panel>("next");

  const coverage = useMemo(
    () => (network ? targetCoverage(network) : null),
    [network],
  );

  const nextWave = useMemo(() => {
    if (!coverage) return [];
    return coverage.rows
      .filter((r) => r.target.priority <= NEXT_WAVE_MAX_PRIORITY)
      .sort((a, b) => a.target.priority - b.target.priority);
  }, [coverage]);

  const nextWaveStats = useMemo(() => {
    let verified = 0;
    let inProgress = 0;
    for (const row of nextWave) {
      const done = verifyProgress[row.target.personId] ?? [];
      if (done.includes("sent_ask")) verified += 1;
      else if (done.length > 0) inProgress += 1;
    }
    return {
      total: nextWave.length,
      verified,
      inProgress,
      todo: nextWave.length - verified - inProgress,
    };
  }, [nextWave, verifyProgress]);

  const selected = useMemo(() => {
    if (!network || !selectedTargetId || !coverage) return null;
    return (
      coverage.rows.find((r) => r.target.personId === selectedTargetId) ?? null
    );
  }, [network, selectedTargetId, coverage]);

  const publicOrgRelations = useMemo(() => {
    if (!network) return [];
    return network.edges.filter((e) => {
      if (
        e.rel !== "CO_INVESTS_WITH" &&
        e.rel !== "WORKS_AT" &&
        e.rel !== "PARTNER_AT" &&
        e.rel !== "FOUNDED" &&
        e.rel !== "PROGRAM_OWNER_FOR"
      ) {
        return false;
      }
      if (network.meta.hideBridgeIdentities !== false) {
        const from = network.nodes.find((n) => n.id === e.from);
        const to = network.nodes.find((n) => n.id === e.to);
        if (
          (from && isPerson(from) && from.networkRole === "bridge") ||
          (to && isPerson(to) && to.networkRole === "bridge")
        ) {
          return false;
        }
      }
      return true;
    });
  }, [network]);

  if (!network || !coverage) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading activation network…
      </div>
    );
  }

  const nameOf = (id: string) =>
    network.nodes.find((n) => n.id === id)?.name ?? id;

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-border/80 lg:w-[400px] lg:border-b-0 lg:border-r">
        <div className="border-b border-border/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-teal-300" />
            <h2 className="text-sm font-semibold tracking-tight">
              Stakeholders & proximity
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Next: verify top targets. Output: who + proximity. Method:
            replicate. Vouchers stay private.
          </p>

          <div className="mt-3 flex gap-1 rounded-lg border border-border/70 bg-card/40 p-1">
            <PanelTab
              active={panel === "next"}
              onClick={() => setPanel("next")}
              icon={<ListChecks className="h-3.5 w-3.5" />}
              label="Next"
            />
            <PanelTab
              active={panel === "output"}
              onClick={() => setPanel("output")}
              icon={<Target className="h-3.5 w-3.5" />}
              label="Output"
            />
            <PanelTab
              active={panel === "method"}
              onClick={() => setPanel("method")}
              icon={<BookOpen className="h-3.5 w-3.5" />}
              label="Method"
            />
          </div>

          {panel === "output" ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Metric
                label="Named"
                value={`${coverage.identifiedCount}/${coverage.rows.length}`}
                hint="targets ID'd"
              />
              <Metric
                label="≤ L2"
                value={String(coverage.pathCount)}
                hint="proximity"
              />
              <Metric
                label="Declared"
                value={String(coverage.claimedCount)}
                hint="hidden voucher"
              />
            </div>
          ) : null}

          {panel === "next" ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Metric
                label="Wave"
                value={String(nextWaveStats.total)}
                hint="top targets"
              />
              <Metric
                label="Doing"
                value={String(nextWaveStats.inProgress)}
                hint="in progress"
              />
              <Metric
                label="Sent"
                value={String(nextWaveStats.verified)}
                hint="intro asked"
              />
            </div>
          ) : null}
        </div>

        {panel === "output" ? (
          <ScrollArea className="min-h-0 flex-1">
            <ul className="space-y-1 p-2">
              {coverage.rows.map(
                ({ target, person, org, proximity, identified }) => {
                  const active = target.personId === selectedTargetId;
                  return (
                    <li key={target.personId}>
                      <button
                        type="button"
                        onClick={() => selectTarget(target.personId)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                          active
                            ? "border-teal-400/40 bg-teal-400/[0.07]"
                            : "border-transparent hover:border-border/80 hover:bg-card/50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              <span className="mr-1.5 font-mono text-[10px] text-muted-foreground">
                                P{target.priority}
                              </span>
                              {person?.name ?? target.personId}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {org?.name ?? "—"} · {person?.publicRole ?? "—"}
                            </p>
                          </div>
                          <ProximityChip
                            identified={identified}
                            proximity={proximity}
                          />
                        </div>
                      </button>
                    </li>
                  );
                },
              )}
            </ul>
          </ScrollArea>
        ) : panel === "method" ? (
          <ScrollArea className="min-h-0 flex-1">
            <MethodSidebar />
          </ScrollArea>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <ul className="space-y-1 p-2">
              {nextWave.map((row) => {
                const done = verifyProgress[row.target.personId] ?? [];
                const active = row.target.personId === selectedTargetId;
                const pct = Math.round(
                  (done.length / VERIFY_STEPS.length) * 100,
                );
                return (
                  <li key={row.target.personId}>
                    <button
                      type="button"
                      onClick={() => selectTarget(row.target.personId)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-teal-400/40 bg-teal-400/[0.07]"
                          : "border-transparent hover:border-border/80 hover:bg-card/50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            <span className="mr-1.5 font-mono text-[10px] text-muted-foreground">
                              P{row.target.priority}
                            </span>
                            {row.person?.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {row.org?.name} · {done.length}/{VERIFY_STEPS.length}{" "}
                            steps
                          </p>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border/60">
                            <div
                              className="h-full rounded-full bg-teal-400/70"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <NextStatusChip
                          done={done}
                          proximity={row.proximity}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </aside>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
          {panel === "method" ? (
            <MethodDetail />
          ) : panel === "next" && selected ? (
            <NextActionDetail
              target={selected.target}
              person={selected.person}
              org={selected.org}
              proximity={selected.proximity}
              done={verifyProgress[selected.target.personId] ?? []}
              onToggle={(step) =>
                toggleVerifyStep(selected.target.personId, step)
              }
            />
          ) : selected ? (
            <TargetDetail
              target={selected.target}
              person={selected.person}
              org={selected.org}
              proximity={selected.proximity}
            />
          ) : null}

          {panel === "output" ? (
            <>
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ecosystem relationships (public actors only)
                </h3>
                <p className="text-xs text-muted-foreground">
                  How funds/hubs and named decision-makers sit relative to each
                  other — not your personal vouchers.
                </p>
                <ul className="space-y-2">
                  {publicOrgRelations.map((edge) => (
                    <li
                      key={edge.id}
                      className="rounded-lg border border-border/70 bg-card/40 px-3 py-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{nameOf(edge.from)}</span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {edge.rel}
                        </Badge>
                        <span className="font-medium">{nameOf(edge.to)}</span>
                        <ConfidenceBadge confidence={edge.confidence} />
                      </div>
                      <p className="mt-1 text-muted-foreground">{edge.basis}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border border-border/70 bg-card/30 px-4 py-3">
                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Voucher identities are private
                    </p>
                    <p>
                      Proximity shows L1 / L2 via a trusted voucher who can
                      vouch — never the voucher’s name in this Output view.
                      Private edges live only in the gitignored overlay.
                    </p>
                    <p className="text-[11px]">{network.meta.disclaimer}</p>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {panel === "next" ? (
            <section className="rounded-lg border border-border/70 bg-card/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">
                This week’s board (visualized)
              </p>
              <p className="mt-1">
                Do not expand the map. Verify proximity for these five, keep
                voucher names private, then send one specific warm intro each.
                Progress saves in this browser.
              </p>
            </section>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}

function TargetDetail({
  target,
  person,
  org,
  proximity,
}: {
  target: NetworkTarget;
  person?: NetworkPerson;
  org?: NetworkOrg;
  proximity: PublicProximity;
}) {
  const identified =
    person?.identificationStatus === "confirmed" ||
    person?.identificationStatus === "hypothesized";

  return (
    <section className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {person?.name ?? target.personId}
          </h2>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[10px]",
              identified
                ? "border-teal-400/40 text-teal-200"
                : "border-amber-400/40 text-amber-200",
            )}
          >
            {person?.identificationStatus ?? "unknown"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {person?.publicRole}
          {org ? ` · ${org.name}` : ""}
        </p>
        {person?.linkedinUrl ? (
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-teal-300 hover:underline"
          >
            LinkedIn <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <CardBlock title="Thesis">
          {person?.thesis ??
            org?.thesis ??
            "Not written yet — fill before outreach."}
        </CardBlock>
        <CardBlock title="Why this stakeholder">
          {target.why}
        </CardBlock>
        <CardBlock title="Desired ask">{target.desiredAsk}</CardBlock>
        <CardBlock title="Kill criteria">
          {target.killCriteria ?? "—"}
        </CardBlock>
      </div>

      <div className="rounded-lg border border-border/80 bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-teal-300" />
          <h3 className="text-sm font-semibold">Proximity (public)</h3>
        </div>
        {proximity.degreesFromEgo == null ? (
          <div className="flex items-start gap-2 text-sm text-amber-100/90">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-medium">No proximity claim</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {proximity.basisPublic}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">You</span>
              {proximity.degreesFromEgo === 2 ? (
                <>
                  <span className="text-muted-foreground">→</span>
                  <Badge
                    variant="outline"
                    className="border-dashed font-mono text-[10px]"
                  >
                    trusted voucher · identity private
                  </Badge>
                </>
              ) : null}
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">
                {person?.name ?? "stakeholder"}
              </span>
              <Badge className="ml-1 bg-teal-500/20 text-teal-100 hover:bg-teal-500/20">
                L{proximity.degreesFromEgo}
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[10px] text-muted-foreground"
              >
                {proximity.evidence} · {proximity.confidence}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {proximity.basisPublic}
            </p>
            {proximity.blockers.length > 0 ? (
              <ul className="space-y-1 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-2 text-xs text-amber-100/90">
                {proximity.blockers.map((b) => (
                  <li key={b} className="flex gap-1.5">
                    <CircleDashed className="mt-0.5 h-3 w-3 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-teal-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Proximity clear enough to draft a warm intro (still verify
                voucher willingness).
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function NextActionDetail({
  target,
  person,
  org,
  proximity,
  done,
  onToggle,
}: {
  target: NetworkTarget;
  person?: NetworkPerson;
  org?: NetworkOrg;
  proximity: PublicProximity;
  done: VerifyStepId[];
  onToggle: (step: VerifyStepId) => void;
}) {
  const pct = Math.round((done.length / VERIFY_STEPS.length) * 100);

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Next wave · P{target.priority}
        </p>
        <h2 className="mt-0.5 text-lg font-semibold tracking-tight">
          {person?.name ?? target.personId}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {person?.publicRole}
          {org ? ` · ${org.name}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ProximityChip identified proximity={proximity} />
          <Badge variant="outline" className="font-mono text-[10px]">
            {pct}% checklist
          </Badge>
          {person?.linkedinUrl ? (
            <a
              href={person.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-teal-300 hover:underline"
            >
              Open LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-teal-400/80 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="space-y-2">
        {VERIFY_STEPS.map((step, index) => {
          const checked = done.includes(step.id);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onToggle(step.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                  checked
                    ? "border-teal-400/35 bg-teal-400/[0.07]"
                    : "border-border/70 bg-card/40 hover:border-border",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                    checked
                      ? "border-teal-400/50 bg-teal-400/20 text-teal-100"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {checked ? "✓" : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{step.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {step.hint}
                  </span>
                  {step.id === "check_shared" &&
                  target.verifySteps?.sharedConnectionsHint ? (
                    <span className="mt-1.5 block text-xs text-amber-100/80">
                      {target.verifySteps.sharedConnectionsHint}
                    </span>
                  ) : null}
                  {step.id === "draft_ask" &&
                  target.verifySteps?.introAskDraft ? (
                    <span className="mt-1.5 block rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-xs text-foreground/90">
                      {target.verifySteps.introAskDraft}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-3 md:grid-cols-2">
        <CardBlock title="Desired ask">{target.desiredAsk}</CardBlock>
        <CardBlock title="Kill criteria">
          {target.killCriteria ?? "—"}
        </CardBlock>
      </div>
    </section>
  );
}

function NextStatusChip({
  done,
  proximity,
}: {
  done: VerifyStepId[];
  proximity: PublicProximity;
}) {
  if (done.includes("sent_ask")) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-teal-400/35 font-mono text-[10px] text-teal-200"
      >
        sent
      </Badge>
    );
  }
  if (done.length > 0) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-amber-400/35 font-mono text-[10px] text-amber-200"
      >
        {done.length}/{VERIFY_STEPS.length}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 font-mono text-[10px]",
        proximity.evidence === "declared"
          ? "border-amber-400/35 text-amber-200"
          : "border-border text-muted-foreground",
      )}
    >
      {proximity.degreesFromEgo != null
        ? `L${proximity.degreesFromEgo} · todo`
        : "todo"}
    </Badge>
  );
}

function MethodSidebar() {
  return (
    <div className="space-y-3 p-3 text-xs leading-relaxed text-muted-foreground">
      <p className="font-medium text-foreground">Replicable in 4 layers</p>
      <ol className="list-decimal space-y-2 pl-4">
        <li>
          <span className="text-foreground">Identify</span> — Exa / team pages:
          name humans + theses + org ties (public).
        </li>
        <li>
          <span className="text-foreground">Proximity</span> — LinkedIn
          Connections.csv + Shared connections → L1/L2 (private).
        </li>
        <li>
          <span className="text-foreground">Publish</span> — Output shows
          stakeholder + L1/L2 only; hide vouchers.
        </li>
        <li>
          <span className="text-foreground">Activate</span> — Specific ask +
          kill criteria; no brand leverage.
        </li>
      </ol>
      <p>
        Full protocol:{" "}
        <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-[10px]">
          prep/NETWORK_ACTIVATION_PROTOCOL.md
        </code>
      </p>
    </div>
  );
}

function MethodDetail() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          How this map was built (replicate it)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Two artifacts: public stakeholders, private proximity. Never mix
          voucher names into the public Output.
        </p>
      </div>

      <Step
        n="1"
        title="Entity + person layer (public)"
        body="Start from ecosystem orgs (funds, hubs, labs). For each priority org, name the human who can mobilise founders — not “someone at Elaia”. Source from official team pages + Exa. Flip status to confirmed only with a URL."
      />
      <Step
        n="2"
        title="Proximity layer (private)"
        body="Export LinkedIn Connections.csv. Match L1s. For each target, check Shared connections. Store KNOWS / CAN_INTRO only in a gitignored overlay. If a strong voucher exists but must stay anonymous, declare proximityClaims without names."
      />
      <Step
        n="3"
        title="Public Output"
        body="For each stakeholder show: name, role, thesis, org relationships, proximity badge (L1 / L2 via trusted voucher). Path rendering: You → [voucher hidden] → Stakeholder."
      />
      <Step
        n="4"
        title="Honesty bar"
        body="ID gaps stay visible. Declared L2 is labeled claimed until path-verified. Southern Europe people layer is still thin — expand before claiming full coverage."
      />

      <div className="rounded-lg border border-amber-400/25 bg-amber-400/[0.05] px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-amber-100">Coverage is not complete</p>
        <p className="mt-1">
          See{" "}
          <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-[10px]">
            prep/ECOSYSTEM_COVERAGE.md
          </code>{" "}
          for who is still missing (Eurazeo, Raise, Ring, Korelya, Educapital,
          ES/IT/PT decision-makers, many programme owners).
        </p>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/40 px-4 py-3">
      <p className="font-mono text-[10px] text-muted-foreground">STEP {n}</p>
      <h3 className="mt-0.5 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function PanelTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ProximityChip({
  identified,
  proximity,
}: {
  identified: boolean;
  proximity: PublicProximity;
}) {
  if (!identified) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-amber-400/35 font-mono text-[10px] text-amber-200"
      >
        ID gap
      </Badge>
    );
  }
  if (proximity.degreesFromEgo == null) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-rose-400/35 font-mono text-[10px] text-rose-200"
      >
        no path
      </Badge>
    );
  }
  const tone =
    proximity.evidence === "declared"
      ? "border-amber-400/35 text-amber-200"
      : "border-teal-400/35 text-teal-200";
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 font-mono text-[10px]", tone)}
    >
      L{proximity.degreesFromEgo}
      {proximity.evidence === "declared" ? " · claimed" : ""}
    </Badge>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/50 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm tabular-nums text-teal-200">{value}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function CardBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed">{children}</p>
    </div>
  );
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: "confirmed" | "likely" | "claimed" | "unknown";
}) {
  const tone =
    confidence === "confirmed"
      ? "text-teal-200 border-teal-400/30"
      : confidence === "likely"
        ? "text-amber-200 border-amber-400/30"
        : "text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("font-mono text-[10px]", tone)}>
      {confidence}
    </Badge>
  );
}
