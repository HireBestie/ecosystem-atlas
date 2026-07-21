import { mkdirSync, writeFileSync } from "fs";

const dir = "public/enablement/build-with-claude";
mkdirSync(dir, { recursive: true });

const pages: [string, string, string][] = [
  [
    "01-cohort-design.html",
    "Six-week portfolio cohort design",
    `<p class="muted">Design goal: one shared technical need cluster across 8–12 teams; measurable completion and activation.</p>
<ul>
<li><b>Owner:</b> named partner programme owner + operator enablement lead.</li>
<li><b>Intake:</b> use-case, technical champion, constraints, success definition.</li>
<li><b>Cadence:</b> kickoff → case draft → baseline → office hours ×2 → decision → 30-day follow-up.</li>
<li><b>Artefacts:</b> intake form, case pack, rubric scores, decision memo, activation log.</li>
<li><b>Anti-goal:</b> credits-only distribution without evaluation discipline.</li>
</ul>`,
  ],
  [
    "02-qualification.html",
    "Startup qualification criteria",
    `<ul>
<li>Named technical owner with calendar authority.</li>
<li>Concrete workflow (not “explore AI”).</li>
<li>Data/access for representative cases within 2 weeks.</li>
<li>No known fatal security/procurement blocker for a sandbox eval.</li>
<li>Willingness to document go/no-go and share product feedback.</li>
</ul>
<p class="muted">Disqualify vanity attendees and teams that refuse a written success definition.</p>`,
  ],
  [
    "03-founder-briefing.html",
    "Founder briefing",
    `<p class="muted">30–40 minute briefing for champions:</p>
<ul>
<li>Why evaluation beats vibes: baseline, rubric, cost, failure modes.</li>
<li>Honest Claude strengths/limits for their workflow class.</li>
<li>What “done” looks like (decision memo + optional activation).</li>
<li>Security / data-handling for the sandbox.</li>
<li>How feedback returns to product (structured notes).</li>
</ul>`,
  ],
  [
    "04-eval-template.html",
    "Representative evaluation-case template",
    `<p class="muted">Each team drafts 5–15 cases:</p>
<ul>
<li>User / system context</li>
<li>Input artefact</li>
<li>Expected behaviour / acceptance notes</li>
<li>Failure modes</li>
<li>Current baseline</li>
<li>Pass / fail / partial criteria</li>
</ul>
<p class="muted">Cases must be representative — not cherry-picked demos.</p>`,
  ],
  [
    "05-rubric.html",
    "Baseline and grading rubric",
    `<p class="muted">Score each case 0–2 on:</p>
<ul>
<li>Task success</li>
<li>Faithfulness / hallucination risk</li>
<li>Latency vs workflow need</li>
<li>Cost at projected volume</li>
<li>Operator effort to usable output</li>
</ul>
<p class="muted">Record baseline before Claude changes. Decide with rubric + constraints.</p>`,
  ],
  [
    "06-cost-worksheet.html",
    "Cost / latency worksheet",
    `<ul>
<li>Expected monthly volume</li>
<li>Tokens / calls per case (measured)</li>
<li>Projected monthly cost vs current</li>
<li>p50 / p95 latency vs SLA</li>
<li>Human review minutes saved or added</li>
<li>Break-even condition for go</li>
</ul>`,
  ],
  [
    "07-office-hours.html",
    "Technical office-hours format",
    `<p class="muted">2× 60-minute sessions:</p>
<ul>
<li>15 min shared failure patterns</li>
<li>30 min live debugging of 1–2 cases</li>
<li>15 min next experiments + decision timeline</li>
</ul>
<p class="muted">For unblocking evaluation — not sales Q&amp;A.</p>`,
  ],
  [
    "08-activation.html",
    "Activation definition",
    `<p class="muted">Activation = qualified usage sustained 30 days, not a single API call.</p>
<ul>
<li>Threshold agreed at intake</li>
<li>Champion still owns the workflow</li>
<li>Decision memo is “go” with constraints</li>
<li>Missed weeks trigger follow-up</li>
</ul>`,
  ],
  [
    "09-follow-up.html",
    "30-day follow-up protocol",
    `<ul>
<li><b>Day 3:</b> production path started or blockers logged</li>
<li><b>Day 14:</b> usage check + remediation hour if needed</li>
<li><b>Day 30:</b> activation yes/no + product feedback note</li>
</ul>
<p class="muted">No-fit teams still file feedback — trust over vanity metrics.</p>`,
  ],
  [
    "10-feedback-roi.html",
    "Product feedback + partner ROI dashboard",
    `<p><b>Feedback template:</b> workflow, what worked, what failed, requested capability, severity, evidence.</p>
<p><b>ROI scorecard:</b></p>
<ul>
<li>Champions / evaluations / activations / no-fits</li>
<li>Time-to-decision</li>
<li>Founder value (1–5)</li>
<li>Product feedback notes filed</li>
<li>Operator hours vs activations</li>
</ul>`,
  ],
];

function shell(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · Build with Claude</title>
<style>
body{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#0b1014;color:#f4eedf;line-height:1.55}
main{max-width:800px;margin:0 auto;padding:2rem 1.25rem 3rem}
a{color:#5eead4} h1{font-size:1.75rem;letter-spacing:-.02em}
.muted{color:rgba(244,238,223,.55)} ul{color:rgba(244,238,223,.55)} b{color:#f4eedf}
</style></head><body><main>
<p><a href="./">← Kit index</a></p>
<h1>${title}</h1>
${body}
<p class="muted" style="margin-top:2rem;font-size:.85rem"><a href="./">Back to kit index</a> · <a href="/">Atlas</a></p>
</main></body></html>
`;
}

for (const [file, title, body] of pages) {
  writeFileSync(`${dir}/${file}`, shell(title, body));
}
console.log("wrote", pages.length, "kit pages");
