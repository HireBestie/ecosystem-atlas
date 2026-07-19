/**
 * Patch network with Maxime's named L1 bridges (Pierre, Elsa, Penelope)
 * and reframe: bridges ≠ targets. Targets = activation counterparts only.
 */
import { readFileSync, writeFileSync } from "fs";

const today = "2026-07-19";
const src = (url: string, title: string) => [{ url, title, accessed: today }];

const graph = JSON.parse(
  readFileSync("public/data/network-bridges.json", "utf8"),
);
const priv = JSON.parse(
  readFileSync("public/data/network-bridges.private.json", "utf8"),
);

const byId = new Map(graph.nodes.map((n: { id: string }) => [n.id, n]));

function upsert(node: Record<string, unknown>) {
  const id = node.id as string;
  if (byId.has(id)) {
    Object.assign(byId.get(id)!, node);
  } else {
    graph.nodes.push(node);
    byId.set(id, node);
  }
}

function upsertEdge(edge: Record<string, unknown>) {
  const i = graph.edges.findIndex((e: { id: string }) => e.id === edge.id);
  if (i >= 0) graph.edges[i] = edge;
  else graph.edges.push(edge);
}

function upsertPrivEdge(edge: Record<string, unknown>) {
  const i = priv.edges.findIndex((e: { id: string }) => e.id === edge.id);
  if (i >= 0) priv.edges[i] = edge;
  else priv.edges.push(edge);
}

function upsertPrivNode(node: Record<string, unknown>) {
  const i = priv.nodes.findIndex((n: { id: string }) => n.id === node.id);
  if (i >= 0) priv.nodes[i] = node;
  else priv.nodes.push(node);
}

// Orgs
upsert({
  kind: "org",
  id: "org:pricemoov",
  name: "Pricemoov",
  orgType: "other",
  thesis: "AI price management SaaS — Pierre Hébrard’s company; Series A led by ISAI + Bpifrance Digital Venture (2023).",
  aiStance: "ai_native",
  country: "FR",
  sources: src("https://pricemoov.com/news/series-a", "Pricemoov Series A"),
});
upsert({
  kind: "org",
  id: "org:aleph-avocats",
  name: "Aleph Avocats",
  orgType: "other",
  thesis: "Paris business law firm active in tech / blockchain / e-reputation.",
  aiStance: "unknown",
  country: "FR",
  sources: src("https://aleph-avocats.com/elsa-sammari/?lang=en", "Aleph — Elsa Sammari"),
});
upsert({
  kind: "org",
  id: "org:ditp",
  name: "DITP (Direction interministérielle de la transformation publique)",
  orgType: "other",
  thesis: "Public transformation; Agora citizen dialogue product.",
  aiStance: "unknown",
  country: "FR",
  sources: src("https://beta.gouv.fr/startups/agora.html", "Agora — beta.gouv"),
});
upsert({
  kind: "org",
  id: "org:bpifrance",
  name: "Bpifrance",
  orgType: "vc_fund",
  thesis: "Public investment bank — Digital Venture co-led Pricemoov Series A.",
  aiStance: "mixed",
  atlasEntityId: "entity:bpifrance",
  country: "FR",
  sources: src("https://www.bpifrance.com/", "Bpifrance"),
});

// Bridge people (public identities; KNOWS in private)
upsert({
  kind: "person",
  id: "person:pierre-hebrard",
  name: "Pierre Hébrard",
  publicRole: "CEO & Co-Founder, Pricemoov",
  orgIds: ["org:pricemoov"],
  thesis: "AI SaaS founder with ISAI + Bpifrance as LPs — founder-to-founder and founder-to-investor intros.",
  identificationStatus: "confirmed",
  networkRole: "bridge",
  linkedinUrl: "https://www.linkedin.com/in/pierre-hebrard",
  notes:
    "L1 since Aug 2011. Concrete investor path: Series A led by ISAI (Nicolas Martineau adjacency) + Bpifrance Digital Venture.",
  sources: [
    ...src("https://www.linkedin.com/in/pierre-hebrard", "LinkedIn"),
    ...src("https://pricemoov.com/news/series-a", "Pricemoov Series A"),
  ],
});
upsert({
  kind: "person",
  id: "person:elsa-sammari",
  name: "Elsa Sammari",
  publicRole: "Partner, Aleph Avocats",
  orgIds: ["org:aleph-avocats"],
  thesis: "Tech / blockchain / e-reputation counsel — dense founder + operator client network.",
  identificationStatus: "confirmed",
  networkRole: "bridge",
  linkedinUrl: "https://www.linkedin.com/in/elsasammari",
  notes: "L1 since Apr 2013. Bridge into legal-tech / founder advisory circles, not a VC GP.",
  sources: src(
    "https://aleph-avocats.com/elsa-sammari/?lang=en",
    "Aleph Avocats — Elsa",
  ),
});
upsert({
  kind: "person",
  id: "person:penelope-liot",
  name: "Pénélope Liot",
  publicRole: "Directrice produit Agora, DITP; founder Le Noël de la French Tech",
  orgIds: ["org:ditp", "org:france-digitale"],
  thesis: "French Tech mobilisation (Noël FT since 2014) + public digital product — campus/community intros.",
  identificationStatus: "confirmed",
  networkRole: "bridge",
  linkedinUrl: "https://www.linkedin.com/in/penelopeliot",
  notes:
    "L1 since Apr 2013. Strong Station F / French Tech community adjacency — verify shared connection with Roxanne before claiming CAN_INTRO.",
  sources: [
    ...src("https://www.linkedin.com/in/penelopeliot", "LinkedIn"),
    ...src(
      "https://medium.com/startup-grind/how-we-united-200-startups-in-our-country-how-you-could-too-9071daeabaf1",
      "Noël de la French Tech",
    ),
  ],
});

// Keep Sofia/Harold/Thomas as bridges (not activation targets)
for (const id of [
  "person:sofia-dahoune",
  "person:harold-dumeurger",
  "person:thomas-friang",
]) {
  const n = byId.get(id);
  if (n) n.networkRole = "bridge";
}

upsertEdge({
  id: "e:pierre-pricemoov",
  from: "person:pierre-hebrard",
  to: "org:pricemoov",
  rel: "FOUNDED",
  basis: "CEO & Co-Founder",
  confidence: "confirmed",
  sources: src("https://www.linkedin.com/in/pierre-hebrard", "LinkedIn"),
});
upsertEdge({
  id: "e:pierre-isai-backed",
  from: "org:isai",
  to: "org:pricemoov",
  rel: "CO_INVESTS_WITH",
  basis: "ISAI co-led Pricemoov $10M Series A (Apr 2023) with Bpifrance Digital Venture",
  confidence: "confirmed",
  sources: src("https://pricemoov.com/news/series-a", "Pricemoov Series A"),
});
upsertEdge({
  id: "e:elsa-aleph",
  from: "person:elsa-sammari",
  to: "org:aleph-avocats",
  rel: "PARTNER_AT",
  basis: "Partner / associated",
  confidence: "confirmed",
  sources: src("https://aleph-avocats.com/elsa-sammari/?lang=en", "Aleph"),
});
upsertEdge({
  id: "e:penelope-ditp",
  from: "person:penelope-liot",
  to: "org:ditp",
  rel: "WORKS_AT",
  basis: "Directrice produit Agora",
  confidence: "confirmed",
  sources: src("https://beta.gouv.fr/startups/agora.html", "Agora"),
});

// Targets = activation counterparts only (not your L1 bridges)
graph.targets = [
  {
    personId: "person:nicolas-essayan",
    orgId: "org:motier",
    priority: 1,
    why: "Motier founding partner — Mission case programme ownership.",
    desiredAsk:
      "Warm intro via your L1s to confirm La Maison / portfolio programme owner; cohort workshop design chat.",
    killCriteria: "No programme owner after 2 warm attempts.",
  },
  {
    personId: "person:alexis-frentz",
    orgId: "org:elaia",
    priority: 2,
    why: "AI Partner Elaia — path via Sofia (ex-Elaia) already in private graph.",
    desiredAsk:
      "Technical portfolio mobilisation / evaluation workshop design.",
    killCriteria: "Partner declines; try programme ops.",
  },
  {
    personId: "person:jean-de-la-rochebrochard",
    orgId: "org:kima",
    priority: 3,
    why: "Kima MP — seed velocity + AI density.",
    desiredAsk: "Who can convene technical founders from portfolio.",
    killCriteria: "Announcement-only access.",
  },
  {
    personId: "person:roxanne-varza",
    orgId: "org:station-f",
    priority: 4,
    why: "Campus programmes — path via Pénélope (Noël FT) / Corentin (Station F).",
    desiredAsk: "Intro to technical programme leads.",
    killCriteria: "Logo-only conversation.",
  },
  {
    personId: "person:romain-lavault",
    orgId: "org:partech",
    priority: 5,
    why: "Partech Seed GP.",
    desiredAsk: "Platform/portfolio engagement owner.",
    killCriteria: "No portfolio hop.",
  },
  {
    personId: "person:nicolas-martineau",
    orgId: "org:isai",
    priority: 6,
    why: "ISAI — Pierre Hébrard’s Series A lead; concrete founder→investor bridge.",
    desiredAsk:
      "Warm intro via Pierre to the ISAI partner who owns founder programmes / portfolio engagement.",
    killCriteria: "Intro stays fundraising-only with no activation angle.",
  },
  {
    personId: "person:xavier-lorphelin",
    orgId: "org:serena",
    priority: 7,
    why: "Serena MP + Squad community.",
    desiredAsk: "How Serena Squad mobilises AI founders.",
    killCriteria: "No community access path.",
  },
  {
    personId: "person:charles-letourneur",
    orgId: "org:alven",
    priority: 8,
    why: "Alven MP.",
    desiredAsk: "Portfolio technical engagement owner.",
    killCriteria: "Check-writing only.",
  },
  {
    personId: "person:pierre-entremont",
    orgId: "org:frst",
    priority: 9,
    why: "Frst Day One.",
    desiredAsk: "Seed founder mobilisation chat.",
    killCriteria: "No path.",
  },
  {
    personId: "person:nicolas-rose",
    orgId: "org:xange",
    priority: 10,
    why: "XAnge MP.",
    desiredAsk: "Software/AI portfolio engagement.",
    killCriteria: "No path.",
  },
];

graph.meta.version = "0.3.1-own-network";
graph.meta.generatedAt = new Date().toISOString();
graph.meta.disclaimer =
  "People layer for FR AI activation. Bridges are YOUR L1s (Sofia, Harold, Thomas, Pierre, Elsa, Pénélope, …). Targets are activation counterparts at funds/hubs. Map coverage from your network — do not ask bridges to invent your graph. No emails/phones.";

// Private: strong L1 edges + hypothesized CAN_INTRO from own network
upsertPrivNode({
  id: "person:pierre-hebrard",
  kind: "person",
  name: "Pierre Hébrard",
  publicRole: "CEO & Co-Founder, Pricemoov",
  orgIds: ["org:pricemoov"],
  identificationStatus: "confirmed",
  networkRole: "bridge",
  linkedinUrl: "https://www.linkedin.com/in/pierre-hebrard",
  notes: "L1 since 14 Aug 2011 — founder bridge into ISAI.",
  sources: src("https://www.linkedin.com/in/pierre-hebrard", "LinkedIn"),
});
upsertPrivNode({
  id: "person:elsa-sammari",
  kind: "person",
  name: "Elsa Sammari",
  publicRole: "Partner, Aleph Avocats",
  orgIds: ["org:aleph-avocats"],
  identificationStatus: "confirmed",
  networkRole: "bridge",
  linkedinUrl: "https://www.linkedin.com/in/elsasammari",
  notes: "L1 since 19 Apr 2013.",
  sources: src("https://www.linkedin.com/in/elsasammari", "LinkedIn"),
});
upsertPrivNode({
  id: "person:penelope-liot",
  kind: "person",
  name: "Pénélope Liot",
  publicRole: "Directrice produit Agora, DITP; Noël de la French Tech",
  orgIds: ["org:ditp"],
  identificationStatus: "confirmed",
  networkRole: "bridge",
  linkedinUrl: "https://www.linkedin.com/in/penelopeliot",
  notes: "L1 since 18 Apr 2013 — French Tech mobilisation.",
  sources: src("https://www.linkedin.com/in/penelopeliot", "LinkedIn"),
});

upsertPrivEdge({
  id: "e:maxime-pierre",
  from: "person:maxime",
  to: "person:pierre-hebrard",
  rel: "KNOWS",
  linkedinDegree: 1,
  strength: "strong",
  basis: "LinkedIn L1 since 14 Aug 2011 (Connections.csv)",
  confidence: "confirmed",
});
upsertPrivEdge({
  id: "e:maxime-elsa",
  from: "person:maxime",
  to: "person:elsa-sammari",
  rel: "KNOWS",
  linkedinDegree: 1,
  strength: "strong",
  basis: "LinkedIn L1 since 19 Apr 2013 (Connections.csv)",
  confidence: "confirmed",
});
upsertPrivEdge({
  id: "e:maxime-penelope",
  from: "person:maxime",
  to: "person:penelope-liot",
  rel: "KNOWS",
  linkedinDegree: 1,
  strength: "strong",
  basis: "LinkedIn L1 since 18 Apr 2013 (Connections.csv)",
  confidence: "confirmed",
});
upsertPrivEdge({
  id: "e:pierre-can-intro-martineau",
  from: "person:pierre-hebrard",
  to: "person:nicolas-martineau",
  rel: "CAN_INTRO",
  linkedinDegree: 1,
  strength: "warm",
  basis:
    "ISAI co-led Pricemoov Series A (2023) — Pierre can intro his ISAI counterpart; confirm Martineau is the right human / willingness",
  confidence: "likely",
});
upsertPrivEdge({
  id: "e:penelope-can-intro-roxanne",
  from: "person:penelope-liot",
  to: "person:roxanne-varza",
  rel: "CAN_INTRO",
  linkedinDegree: 2,
  strength: "warm",
  basis:
    "Noël de la French Tech / French Tech mobilisation adjacency to Station F — VERIFY shared connection + willingness before claiming",
  confidence: "likely",
});
upsertPrivEdge({
  id: "e:corentin-can-intro-roxanne",
  from: "person:corentin-grenon",
  to: "person:roxanne-varza",
  rel: "CAN_INTRO",
  linkedinDegree: 1,
  strength: "warm",
  basis:
    "Corentin runs ESSEC Incubator at Station F — VERIFY L1 with Roxanne / willingness",
  confidence: "likely",
});

writeFileSync(
  "public/data/network-bridges.json",
  JSON.stringify(graph, null, 2) + "\n",
);
writeFileSync(
  "public/data/network-bridges.private.json",
  JSON.stringify(priv, null, 2) + "\n",
);

console.log(
  "nodes",
  graph.nodes.length,
  "targets",
  graph.targets.length,
  "priv edges",
  priv.edges.length,
);
