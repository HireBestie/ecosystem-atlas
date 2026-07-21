"use client";

import { ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WorkedCase } from "@/lib/case-types";
import { useCaseStore, useSelectedCase } from "@/store/case-store";

const spine: { key: keyof WorkedCase; label: string }[] = [
  { key: "publicThesis", label: "1 · Public thesis & operating signal" },
  { key: "operatingModel", label: "2 · Operating model" },
  { key: "relevantSegment", label: "3 · Relevant portfolio / startup segment" },
  { key: "decisionMakerVsOperator", label: "4 · Decision-maker vs programme operator" },
  { key: "claudeSpecificNeed", label: "5 · Claude-specific need" },
  { key: "proposedProgramme", label: "6 · Proposed programme" },
  { key: "successMetric", label: "8 · Success metric" },
  { key: "killCriteria", label: "9 · Kill criteria" },
];

export function AtlasCases() {
  const bundle = useCaseStore((s) => s.bundle);
  const selectedId = useCaseStore((s) => s.selectedCaseId);
  const selectCase = useCaseStore((s) => s.selectCase);
  const selected = useSelectedCase();

  if (!bundle || !selected) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading worked cases…
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0b1014] text-[#f4eedf]">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.18em] text-teal-200/80 uppercase">
            Two defensible cases · not a panoramic map
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-mission)] text-4xl leading-tight tracking-[-0.03em] md:text-5xl">
            {bundle.meta.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">
            {bundle.meta.disclaimer}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {bundle.cases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCase(c.id)}
                className={`border px-4 py-2 text-xs transition-colors ${
                  c.id === selectedId
                    ? "border-[#e7b85b]/60 bg-[#e7b85b]/12 text-[#f5deb0]"
                    : "border-white/10 text-white/45 hover:border-white/25 hover:text-white/75"
                }`}
              >
                {c.partner}
                <span className="ml-2 font-mono text-[9px] opacity-60">
                  {c.partnerType === "vc_portfolio" ? "VC" : "Campus"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 border border-white/10 bg-white/[0.025] p-6 md:p-8">
            <p className="font-mono text-[10px] tracking-[0.16em] text-amber-200/80 uppercase">
              {selected.country} · {selected.partnerType.replaceAll("_", " ")}
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-mission)] text-3xl leading-tight">
              {selected.partner}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
              {selected.oneLiner}
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {spine.map(({ key, label }) => {
              const value = selected[key];
              if (typeof value !== "string") return null;
              return (
                <section
                  key={key}
                  className="border border-white/10 bg-[#10161b] p-5"
                >
                  <p className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/75">{value}</p>
                </section>
              );
            })}

            <section className="border border-white/10 bg-[#10161b] p-5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
                7 · Evidence supporting
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                {selected.evidenceSupporting.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-teal-300">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border border-white/10 bg-[#10161b] p-5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
                7b · Counterarguments
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                {selected.counterarguments.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#e37b64]">×</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border border-white/10 bg-[#10161b] p-5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
                10 · Unknowns before speaking
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                {selected.unknownsBeforeSpeaking.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-amber-200">?</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
              Sources
            </p>
            <ul className="mt-3 space-y-2">
              {selected.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80"
                  >
                    {s.title ?? s.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="/enablement/build-with-claude/"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-teal-200 hover:text-teal-100"
            >
              Open Build with Claude Evaluation Kit
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
