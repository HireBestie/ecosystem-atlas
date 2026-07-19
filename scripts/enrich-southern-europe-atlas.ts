/**
 * Southern Europe + FR gap enrichment (Exa-backed, public sources only).
 * Merges entities, key persons, thesis-as-assumptions, and INVESTED_IN edges
 * into atlas.json + expands network-bridges for ES/IT/PT activation targets.
 *
 * Run: bun run scripts/enrich-southern-europe-atlas.ts
 */
import { readFileSync, writeFileSync } from "fs";

const today = "2026-07-19";
const src = (url: string, title: string) => [
  { url, title, accessed: today },
];

type Node = Record<string, unknown> & { id: string };
type Edge = { from: string; to: string; rel: string; sources: ReturnType<typeof src> };

const atlas = JSON.parse(readFileSync("public/data/atlas.json", "utf8")) as {
  meta: Record<string, unknown>;
  nodes: Node[];
  edges: Edge[];
};

const existing = new Set(atlas.nodes.map((n) => n.id));
const edgeKey = new Set(
  atlas.edges.map((e) => `${e.from}|${e.to}|${e.rel}`),
);

let nodesAdded = 0;
let edgesAdded = 0;

function addNode(n: Node): boolean {
  if (existing.has(n.id)) return false;
  atlas.nodes.push(n);
  existing.add(n.id);
  nodesAdded++;
  return true;
}

function addEdge(from: string, to: string, rel: string, sources: ReturnType<typeof src>) {
  if (!existing.has(from) || !existing.has(to)) return false;
  const k = `${from}|${to}|${rel}`;
  if (edgeKey.has(k)) return false;
  atlas.edges.push({ from, to, rel, sources });
  edgeKey.add(k);
  edgesAdded++;
  return true;
}

function entity(
  id: string,
  entityType: string,
  name: string,
  country: string,
  city: string,
  summary: string,
  tags: string[],
  sources: ReturnType<typeof src>,
) {
  addNode({
    id,
    kind: "entity",
    entityType,
    name,
    country,
    city,
    summary,
    tags,
    sources,
  });
}

function assumption(
  id: string,
  statement: string,
  resolveBy: string,
  anchored: { date: string; what: string },
  sources: ReturnType<typeof src>,
  betsOn: string,
) {
  addNode({
    id,
    kind: "assumption",
    statement,
    status: "open",
    resolveBy,
    anchoredToEvent: anchored,
    sources,
  });
  addEdge(id, betsOn, "BETS_ON", sources);
}

// ─── New funds / hubs ───────────────────────────────────────────────────────

entity(
  "entity:nauta-capital",
  "vc_fund",
  "Nauta Capital",
  "ES",
  "Barcelona",
  "Pan-European early-stage B2B software investor; increasing AI/LLM and AI-governance exposure.",
  ["vc", "b2b", "ai"],
  src("https://nautacapital.com/", "Nauta Capital"),
);

entity(
  "entity:kibo-ventures",
  "vc_fund",
  "Kibo Ventures",
  "ES",
  "Madrid",
  "Spanish early-stage VC; 2025 deeptech fund (~€150M) targeting AI, robotics, and cybersecurity.",
  ["vc", "deeptech", "ai"],
  src("https://kiboventures.com/", "Kibo Ventures"),
);

entity(
  "entity:samaipata",
  "vc_fund",
  "Samaipata",
  "ES",
  "Madrid",
  "Iberian early-stage fund with 2025–26 emphasis on AI-powered productivity software.",
  ["vc", "ai", "productivity"],
  src("https://samaipata.substack.com/p/samaipatas-2025-in-review-13-investments", "Samaipata 2025 review"),
);

entity(
  "entity:p101",
  "vc_fund",
  "P101",
  "IT",
  "Milan",
  "Italian VC (Programma 103 ~€250M) focused on AI, machine learning, and SaaS.",
  ["vc", "ai", "saas"],
  src("https://p101.it/", "P101"),
);

entity(
  "entity:primo-capital",
  "vc_fund",
  "Primo Capital",
  "IT",
  "Milan",
  "Italian specialised tech investor spanning AI applications, cybersecurity, and deep tech themes.",
  ["vc", "ai", "deeptech"],
  src("https://primo.capital/", "Primo Capital"),
);

// ─── Portfolio / AI startups ────────────────────────────────────────────────

const startups: [string, string, string, string, string, string, string][] = [
  ["entity:tucuvi", "Tucuvi", "ES", "Madrid", "Voice AI clinical assistant for remote patient monitoring and care workflows.", "https://tucuvi.com/", "tucuvi"],
  ["entity:cicerai", "Cicerai", "ES", "Madrid", "Spanish AI startup in Seaya’s disclosed portfolio set.", "https://seaya.vc/portfolio/", "cicerai"],
  ["entity:adsmurai", "Adsmurai", "ES", "Barcelona", "Marketing / ads platform in Seaya portfolio.", "https://seaya.vc/portfolio/", "adsmurai"],
  ["entity:alinia", "Alinia", "ES", "Madrid", "B2B / ML infrastructure company associated with K Fund.", "https://kfund.vc/", "alinia"],
  ["entity:bdeo", "Bdeo", "ES", "Madrid", "Visual AI for insurance claims; K Fund portfolio adjacency.", "https://kfund.vc/", "bdeo"],
  ["entity:neurolabs", "Neurolabs", "ES", "Barcelona", "Computer-vision AI for retail; Nauta-related portfolio activity.", "https://nautacapital.com/", "neurolabs"],
  ["entity:genesy", "Genesy", "ES", "Madrid", "Sales-focused AI platform; Samaipata 2025 portfolio addition.", "https://samaipata.substack.com/p/samaipatas-2025-in-review-13-investments", "genesy"],
  ["entity:theker-robotics", "THEKER Robotics", "ES", "Spain", "Deep-learning industrial automation robotics; Kibo deeptech theme.", "https://kiboventures.com/", "robotics"],
  ["entity:axyon-ai", "Axyon AI", "IT", "Modena", "AI for investment / financial decision support; CDP VC portfolio adjacency.", "https://www.cdpventurecapital.it/it/portfolio.page", "axyon"],
  ["entity:cyber-guru", "Cyber Guru", "IT", "Rome", "Cybersecurity training platform in P101 portfolio set.", "https://p101.it/", "cybersecurity"],
];

for (const [id, name, country, city, summary, url, tag] of startups) {
  entity(id, "ai_startup", name, country, city, summary, ["ai", tag], src(url, name));
}

// ─── Key persons ────────────────────────────────────────────────────────────

type PersonSpec = {
  id: string;
  name: string;
  country: string;
  city: string;
  summary: string;
  tags: string[];
  org: string;
  url: string;
  title: string;
};

const persons: PersonSpec[] = [
  {
    id: "entity:fleur-pellerin",
    name: "Fleur Pellerin",
    country: "FR",
    city: "Paris",
    summary: "Founder & CEO, Korelya Capital — growth platform linking European tech scale-ups with Asian markets.",
    tags: ["person", "korelya", "vc"],
    org: "entity:korelya",
    url: "https://www.korelyacapital.com/team/",
    title: "Korelya team",
  },
  {
    id: "entity:thomas-turelier",
    name: "Thomas Turelier",
    country: "FR",
    city: "Paris",
    summary: "Managing Director, Venture Capital at Eurazeo — AI / defense-adjacent venture investments (e.g. Arcads AI).",
    tags: ["person", "eurazeo", "vc"],
    org: "entity:eurazeo",
    url: "https://www.linkedin.com/in/thomasturelier",
    title: "Thomas Turelier LinkedIn",
  },
  {
    id: "entity:nicolas-celier",
    name: "Nicolas Celier",
    country: "FR",
    city: "Paris",
    summary: "Co-founder & Managing Partner, Ring Capital.",
    tags: ["person", "ring", "vc"],
    org: "entity:ring",
    url: "https://www.ringcp.com/",
    title: "Ring Capital",
  },
  {
    id: "entity:marie-christine-levet",
    name: "Marie-Christine Levet",
    country: "FR",
    city: "Paris",
    summary: "Co-founder, Educapital — edtech / lifelong learning venture thesis.",
    tags: ["person", "educapital", "vc"],
    org: "entity:educapital",
    url: "https://www.educapitalvc.com/about-us",
    title: "Educapital about",
  },
  {
    id: "entity:beatriz-gonzalez",
    name: "Beatriz González",
    country: "ES",
    city: "Madrid",
    summary: "Founding & Managing Partner, Seaya Ventures — multi-stage growth including AI / deep tech.",
    tags: ["person", "seaya", "vc"],
    org: "entity:seaya",
    url: "https://seaya.vc/team/",
    title: "Seaya team",
  },
  {
    id: "entity:miguel-arias",
    name: "Miguel Arias",
    country: "ES",
    city: "Madrid",
    summary: "Partner, K Fund — seed / Series A B2B SaaS, ML infrastructure, and AI.",
    tags: ["person", "k-fund", "vc"],
    org: "entity:k-fund",
    url: "https://www.linkedin.com/in/miguelarias",
    title: "Miguel Arias LinkedIn",
  },
  {
    id: "entity:javier-torremocha",
    name: "Javier Torremocha",
    country: "ES",
    city: "Madrid",
    summary: "Co-founder & Managing Partner, Kibo Ventures — deeptech / AI / robotics fund strategy.",
    tags: ["person", "kibo", "vc"],
    org: "entity:kibo-ventures",
    url: "https://www.linkedin.com/in/javier-torremocha",
    title: "Javier Torremocha LinkedIn",
  },
  {
    id: "entity:jose-del-barrio",
    name: "José del Barrio",
    country: "ES",
    city: "Madrid",
    summary: "Co-founder, Samaipata — AI-powered productivity investment focus.",
    tags: ["person", "samaipata", "vc"],
    org: "entity:samaipata",
    url: "https://medium.com/samaipata-ventures/the-founders-q-a-reloaded-873fb8127512",
    title: "Samaipata founders Q&A",
  },
  {
    id: "entity:andrea-di-camillo",
    name: "Andrea Di Camillo",
    country: "IT",
    city: "Milan",
    summary: "Founder, P101 — Programma 103 AI / ML / SaaS thesis.",
    tags: ["person", "p101", "vc"],
    org: "entity:p101",
    url: "https://p101.it/",
    title: "P101",
  },
  {
    id: "entity:cristina-bini",
    name: "Cristina Bini",
    country: "IT",
    city: "Rome",
    summary: "Senior Partner, CDP Venture Capital — VC funds including AI programme adjacency.",
    tags: ["person", "cdp", "vc"],
    org: "entity:cdp-venture-capital",
    url: "https://www.linkedin.com/in/cristina-bini-9abb50",
    title: "Cristina Bini LinkedIn",
  },
  {
    id: "entity:cristina-fonseca",
    name: "Cristina Fonseca",
    country: "PT",
    city: "Lisbon",
    summary: "General Partner, Indico Capital Partners — Seed→Series B AI / enterprise SaaS / deep tech Iberia.",
    tags: ["person", "indico", "vc"],
    org: "entity:indico-capital",
    url: "https://linkedin.com/in/cristinanfonseca",
    title: "Cristina Fonseca LinkedIn",
  },
  {
    id: "entity:stephan-morais",
    name: "Stephan Morais",
    country: "PT",
    city: "Lisbon",
    summary: "Managing General Partner, Indico Capital Partners.",
    tags: ["person", "indico", "vc"],
    org: "entity:indico-capital",
    url: "https://indicocapital.com/",
    title: "Indico Capital",
  },
];

for (const p of persons) {
  entity(p.id, "person", p.name, p.country, p.city, p.summary, p.tags, src(p.url, p.title));
  addEdge(p.id, p.org, "MEMBER_OF", src(p.url, p.title));
}

// ─── Thesis-as-assumptions (falsifiable fund stance claims) ─────────────────

const theses: {
  id: string;
  statement: string;
  resolveBy: string;
  anchored: { date: string; what: string };
  url: string;
  title: string;
  fund: string;
}[] = [
  {
    id: "assumption:seaya-ai-deeptech-growth",
    statement:
      "Through 2026 Seaya continues writing growth checks (€2–20M class) into AI, deep tech, and fintech scale-ups as a core Southern Europe thesis.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-01-01", what: "Seaya Growth Tech Fund / EIF ETCI commitment communications" },
    url: "https://seaya.vc/",
    title: "Seaya",
    fund: "entity:seaya",
  },
  {
    id: "assumption:k-fund-ai-seed-a",
    statement:
      "K Fund remains an active seed–Series A investor in Spanish B2B SaaS / ML infra / AI through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-01-01", what: "K Fund Spain ecosystem report / fund positioning" },
    url: "https://kfund.vc/",
    title: "K Fund",
    fund: "entity:k-fund",
  },
  {
    id: "assumption:kibo-deeptech-150m",
    statement:
      "Kibo’s ~€150M deeptech fund deploys meaningfully into AI, robotics, and cybersecurity Iberian startups by end-2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-03-25", what: "Public reporting on Kibo deeptech fund launch" },
    url: "https://www.elconfidencial.com/mercados/2025-03-25/kibo-ventures-fondo-capital-riesgo-deeptech-millones_4093045/",
    title: "El Confidencial — Kibo deeptech",
    fund: "entity:kibo-ventures",
  },
  {
    id: "assumption:samaipata-ai-productivity",
    statement:
      "Samaipata’s 2025–26 new investments stay concentrated in AI-powered productivity software.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-12-23", what: "Samaipata 2025 in review (13 investments)" },
    url: "https://samaipata.substack.com/p/samaipatas-2025-in-review-13-investments",
    title: "Samaipata 2025 review",
    fund: "entity:samaipata",
  },
  {
    id: "assumption:cdp-ai-fund-1b",
    statement:
      "CDP Venture Capital’s dedicated AI envelope (~€1B under 2024–28 plan) continues deploying across tech transfer, industrial AI startups, and national champions through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2024-01-01", what: "CDP VC 2024–2028 industrial plan / AI fund materials" },
    url: "https://www.cdpventurecapital.it/en/fondo.page?contentId=FND50514",
    title: "CDP Artificial Intelligence fund",
    fund: "entity:cdp-venture-capital",
  },
  {
    id: "assumption:p101-programma-103-ai",
    statement:
      "P101 Programma 103 (~€250M) continues prioritising AI / ML / SaaS deals as a primary Italian thesis through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-04-25", what: "P101 Programma 103 close reporting" },
    url: "https://vcwire.tech/2025/04/25/p101-closes-programma-103-fund-at-e250m/",
    title: "VCWire — P101 Programma 103",
    fund: "entity:p101",
  },
  {
    id: "assumption:indico-fund-iii-ai",
    statement:
      "Indico Capital Fund III (~€125M) keeps Seed→Series B AI / enterprise SaaS / deep tech as a core Southern Europe mandate through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-11-28", what: "Indico Fund III launch / EIF commitment coverage" },
    url: "https://tech.eu/2025/11/28/indico-capital-partners-launches-eur125m-fund/",
    title: "Tech.eu — Indico Fund III",
    fund: "entity:indico-capital",
  },
  {
    id: "assumption:armilar-fund-iv-iberia-deeptech",
    statement:
      "Armilar Fund IV (~€120M) continues backing Iberian deep tech including AI, cybersecurity, and data infrastructure through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-11-05", what: "Armilar Fund IV close coverage" },
    url: "https://techfundingnews.com/armilar-venture-partners-raises-120m-fund-iv-iberian-deep-tech/",
    title: "TFN — Armilar Fund IV",
    fund: "entity:armilar",
  },
  {
    id: "assumption:korelya-eu-asia-ai-scale",
    statement:
      "Korelya remains a relevant growth partner for European AI scale-ups seeking Asia market bridges through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-01-01", what: "Korelya public positioning / AI portfolio disclosures" },
    url: "https://www.korelyacapital.com/",
    title: "Korelya Capital",
    fund: "entity:korelya",
  },
  {
    id: "assumption:eurazeo-ai-venture-density",
    statement:
      "Eurazeo’s venture strategies keep material AI exposure (models, vertical AI, applied AI) in active portfolios through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-01-01", what: "Eurazeo venture / AI portfolio public profiles" },
    url: "https://goldi.ai/intelligence/vc/eurazeo",
    title: "Eurazeo AI portfolio profile",
    fund: "entity:eurazeo",
  },
  {
    id: "assumption:motier-ai-portfolio-density",
    statement:
      "Motier Ventures maintains high AI portfolio density (incl. Dust, Mistral) and La Maison as a founder mobilisation surface through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2024-10-02", what: "TechCrunch La Maison / Motier portfolio disclosures" },
    url: "https://techcrunch.com/2024/10/02/motier-ventures-unveils-la-maison-a-community-space-for-the-french-tech-ecosystem/",
    title: "TechCrunch — Motier La Maison",
    fund: "entity:motier",
  },
  {
    id: "assumption:serena-applied-ai-fund",
    statement:
      "Serena continues operator-led Applied AI investing (and Squad community mobilisation) as a durable FR thesis through 2026.",
    resolveBy: "2026-12-31",
    anchored: { date: "2025-01-01", what: "Serena public AI fund / portfolio positioning" },
    url: "https://serena.vc/",
    title: "Serena",
    fund: "entity:serena",
  },
];

for (const t of theses) {
  assumption(t.id, t.statement, t.resolveBy, t.anchored, src(t.url, t.title), t.fund);
}

// ─── INVESTED_IN edges ──────────────────────────────────────────────────────

const invested: [string, string, string, string][] = [
  ["entity:motier", "entity:dust", "https://www.gp-intel.com/company/dust", "Dust · Motier"],
  ["entity:motier", "entity:mistral-ai", "https://motier.vc/", "Motier portfolio"],
  ["entity:eurazeo", "entity:mistral-ai", "https://goldi.ai/intelligence/vc/eurazeo", "Eurazeo AI portfolio"],
  ["entity:korelya", "entity:mistral-ai", "https://www.gp-intel.com/gp/korelya-capital", "Korelya portfolio"],
  ["entity:serena", "entity:dataiku", "https://serena.vc/", "Serena portfolio"],
  ["entity:elaia", "entity:shift-technology", "https://tracxn.com/d/venture-capital/elaia/__R59ESo4GNZjGlOHdvcDQZHcf8wBKWxvKXM4wFN0HFY8", "Elaia · Shift"],
  ["entity:elaia", "entity:mirakl", "https://tracxn.com/d/venture-capital/elaia/__R59ESo4GNZjGlOHdvcDQZHcf8wBKWxvKXM4wFN0HFY8", "Elaia · Mirakl"],
  ["entity:seaya", "entity:clarity-ai", "https://seaya.vc/portfolio/", "Seaya portfolio"],
  ["entity:seaya", "entity:tucuvi", "https://seaya.vc/portfolio/", "Seaya portfolio"],
  ["entity:seaya", "entity:cicerai", "https://seaya.vc/portfolio/", "Seaya portfolio"],
  ["entity:seaya", "entity:adsmurai", "https://seaya.vc/portfolio/", "Seaya portfolio"],
  ["entity:k-fund", "entity:alinia", "https://kfund.vc/", "K Fund"],
  ["entity:k-fund", "entity:bdeo", "https://kfund.vc/", "K Fund"],
  ["entity:nauta-capital", "entity:neurolabs", "https://nautacapital.com/", "Nauta"],
  ["entity:samaipata", "entity:genesy", "https://samaipata.substack.com/p/samaipatas-2025-in-review-13-investments", "Samaipata 2025"],
  ["entity:kibo-ventures", "entity:theker-robotics", "https://kiboventures.com/", "Kibo"],
  ["entity:cdp-venture-capital", "entity:axyon-ai", "https://www.cdpventurecapital.it/it/portfolio.page", "CDP portfolio"],
  ["entity:p101", "entity:cyber-guru", "https://p101.it/", "P101"],
  ["entity:armilar", "entity:feedzai", "https://techfundingnews.com/armilar-venture-partners-raises-120m-fund-iv-iberian-deep-tech/", "Armilar · Feedzai adjacency"],
];

for (const [from, to, url, title] of invested) {
  addEdge(from, to, "INVESTED_IN", src(url, title));
}

atlas.meta = {
  ...atlas.meta,
  version: "0.2.0",
  generatedAt: new Date().toISOString(),
  scope: "FR deep · ES/IT/PT comprehensive pass (Exa 2026-07-19)",
  enrichmentNote:
    "Southern Europe funds/people/theses/portfolios + FR GP gap fill via Exa public sources; no PII enrichment.",
};

const atlasJson = JSON.stringify(atlas, null, 2) + "\n";
writeFileSync("public/data/atlas.json", atlasJson);
writeFileSync("src/data/atlas.json", atlasJson);

console.log(
  JSON.stringify(
    {
      nodesAdded,
      edgesAdded,
      totals: {
        nodes: atlas.nodes.length,
        entities: atlas.nodes.filter((n) => n.kind === "entity").length,
        persons: atlas.nodes.filter((n) => n.entityType === "person").length,
        assumptions: atlas.nodes.filter((n) => n.kind === "assumption").length,
        investedIn: atlas.edges.filter((e) => e.rel === "INVESTED_IN").length,
        byCountry: ["FR", "ES", "IT", "PT"].reduce(
          (acc, c) => {
            acc[c] = atlas.nodes.filter(
              (n) => n.kind === "entity" && n.country === c,
            ).length;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    },
    null,
    2,
  ),
);

// ─── Network bridges expansion (public) ─────────────────────────────────────

const network = JSON.parse(
  readFileSync("public/data/network-bridges.json", "utf8"),
) as {
  meta: Record<string, unknown>;
  egoPersonId: string;
  nodes: Node[];
  edges: Edge[];
  targets: Record<string, unknown>[];
};

const nExisting = new Set(network.nodes.map((n) => n.id));
const nEdgeKey = new Set(
  network.edges.map((e) => `${e.from}|${e.to}|${e.rel}`),
);

function addNetNode(n: Node) {
  if (nExisting.has(n.id)) return;
  network.nodes.push(n);
  nExisting.add(n.id);
}

function addNetEdge(
  id: string,
  from: string,
  to: string,
  rel: string,
  basis: string,
  sources: ReturnType<typeof src>,
) {
  const k = `${from}|${to}|${rel}`;
  if (nEdgeKey.has(k)) return;
  network.edges.push({
    id,
    from,
    to,
    rel,
    basis,
    confidence: "confirmed",
    sources,
  } as Edge & { id: string; basis: string; confidence: string });
  nEdgeKey.add(k);
}

const netOrgs: {
  id: string;
  name: string;
  thesis: string;
  aiStance: string;
  atlasEntityId: string;
  country: string;
  url: string;
  title: string;
}[] = [
  {
    id: "org:eurazeo",
    name: "Eurazeo",
    thesis: "Growth / venture with material AI portfolio density.",
    aiStance: "mixed",
    atlasEntityId: "entity:eurazeo",
    country: "FR",
    url: "https://www.eurazeo.com/",
    title: "Eurazeo",
  },
  {
    id: "org:korelya",
    name: "Korelya Capital",
    thesis: "EU↔Asia growth; AI scale-ups (e.g. Mistral).",
    aiStance: "ai_native",
    atlasEntityId: "entity:korelya",
    country: "FR",
    url: "https://www.korelyacapital.com/",
    title: "Korelya",
  },
  {
    id: "org:ring",
    name: "Ring Capital",
    thesis: "Impact / growth equity in European software scale-ups.",
    aiStance: "opportunistic",
    atlasEntityId: "entity:ring",
    country: "FR",
    url: "https://www.ringcp.com/",
    title: "Ring",
  },
  {
    id: "org:educapital",
    name: "Educapital",
    thesis: "Edtech / lifelong learning specialist VC.",
    aiStance: "opportunistic",
    atlasEntityId: "entity:educapital",
    country: "FR",
    url: "https://www.educapitalvc.com/",
    title: "Educapital",
  },
  {
    id: "org:seaya",
    name: "Seaya Ventures",
    thesis: "Multi-stage Iberian growth incl. AI / deep tech / fintech.",
    aiStance: "ai_native",
    atlasEntityId: "entity:seaya",
    country: "ES",
    url: "https://seaya.vc/",
    title: "Seaya",
  },
  {
    id: "org:k-fund",
    name: "K Fund",
    thesis: "Seed–A Spanish B2B SaaS / ML / AI.",
    aiStance: "ai_native",
    atlasEntityId: "entity:k-fund",
    country: "ES",
    url: "https://kfund.vc/",
    title: "K Fund",
  },
  {
    id: "org:kibo",
    name: "Kibo Ventures",
    thesis: "Deeptech fund — AI, robotics, cybersecurity.",
    aiStance: "ai_native",
    atlasEntityId: "entity:kibo-ventures",
    country: "ES",
    url: "https://kiboventures.com/",
    title: "Kibo",
  },
  {
    id: "org:samaipata",
    name: "Samaipata",
    thesis: "AI-powered productivity early-stage.",
    aiStance: "ai_native",
    atlasEntityId: "entity:samaipata",
    country: "ES",
    url: "https://samaipata.substack.com/",
    title: "Samaipata",
  },
  {
    id: "org:cdp-vc",
    name: "CDP Venture Capital",
    thesis: "~€1B AI programme under 2024–28 plan.",
    aiStance: "ai_native",
    atlasEntityId: "entity:cdp-venture-capital",
    country: "IT",
    url: "https://www.cdpventurecapital.it/",
    title: "CDP VC",
  },
  {
    id: "org:p101",
    name: "P101",
    thesis: "Programma 103 — AI / ML / SaaS.",
    aiStance: "ai_native",
    atlasEntityId: "entity:p101",
    country: "IT",
    url: "https://p101.it/",
    title: "P101",
  },
  {
    id: "org:indico",
    name: "Indico Capital Partners",
    thesis: "Iberian Seed→B AI / SaaS / deep tech (Fund III ~€125M).",
    aiStance: "ai_native",
    atlasEntityId: "entity:indico-capital",
    country: "PT",
    url: "https://indicocapital.com/",
    title: "Indico",
  },
  {
    id: "org:armilar",
    name: "Armilar Venture Partners",
    thesis: "Iberian deep tech Fund IV (~€120M) — AI / cyber / data infra.",
    aiStance: "ai_native",
    atlasEntityId: "entity:armilar",
    country: "PT",
    url: "https://armilar.com/",
    title: "Armilar",
  },
];

for (const o of netOrgs) {
  addNetNode({
    kind: "org",
    id: o.id,
    name: o.name,
    orgType: "vc_fund",
    thesis: o.thesis,
    aiStance: o.aiStance,
    atlasEntityId: o.atlasEntityId,
    country: o.country,
    sources: src(o.url, o.title),
  });
}

const netPeople: {
  id: string;
  name: string;
  publicRole: string;
  orgIds: string[];
  thesis: string;
  linkedinUrl?: string;
  url: string;
  title: string;
  networkRole: "target" | "ecosystem";
}[] = [
  {
    id: "person:thomas-turelier",
    name: "Thomas Turelier",
    publicRole: "MD Venture Capital, Eurazeo",
    orgIds: ["org:eurazeo"],
    thesis: "AI venture channel inside Eurazeo.",
    linkedinUrl: "https://www.linkedin.com/in/thomasturelier",
    url: "https://www.linkedin.com/in/thomasturelier",
    title: "LinkedIn",
    networkRole: "target",
  },
  {
    id: "person:fleur-pellerin",
    name: "Fleur Pellerin",
    publicRole: "Founder & CEO, Korelya Capital",
    orgIds: ["org:korelya"],
    thesis: "EU↔Asia growth for AI scale-ups.",
    linkedinUrl: "https://fr.linkedin.com/in/fleurpellerin",
    url: "https://www.korelyacapital.com/team/",
    title: "Korelya team",
    networkRole: "target",
  },
  {
    id: "person:nicolas-celier",
    name: "Nicolas Celier",
    publicRole: "Co-founder & MP, Ring Capital",
    orgIds: ["org:ring"],
    thesis: "Growth / impact scale-up mobilisation.",
    url: "https://www.ringcp.com/",
    title: "Ring",
    networkRole: "ecosystem",
  },
  {
    id: "person:marie-christine-levet",
    name: "Marie-Christine Levet",
    publicRole: "Co-founder, Educapital",
    orgIds: ["org:educapital"],
    thesis: "Edtech specialist — lower AI activation priority.",
    url: "https://www.educapitalvc.com/about-us",
    title: "Educapital",
    networkRole: "ecosystem",
  },
  {
    id: "person:beatriz-gonzalez",
    name: "Beatriz González",
    publicRole: "Founding & Managing Partner, Seaya",
    orgIds: ["org:seaya"],
    thesis: "Primary Spain growth AI/deeptech activation target.",
    url: "https://seaya.vc/team/",
    title: "Seaya team",
    networkRole: "target",
  },
  {
    id: "person:miguel-arias",
    name: "Miguel Arias",
    publicRole: "Partner, K Fund",
    orgIds: ["org:k-fund"],
    thesis: "Spanish seed–A AI / ML infra.",
    linkedinUrl: "https://www.linkedin.com/in/miguelarias",
    url: "https://www.linkedin.com/in/miguelarias",
    title: "LinkedIn",
    networkRole: "target",
  },
  {
    id: "person:javier-torremocha",
    name: "Javier Torremocha",
    publicRole: "Co-founder & MP, Kibo Ventures",
    orgIds: ["org:kibo"],
    thesis: "Deeptech / AI / robotics Spain.",
    linkedinUrl: "https://www.linkedin.com/in/javier-torremocha",
    url: "https://www.linkedin.com/in/javier-torremocha",
    title: "LinkedIn",
    networkRole: "target",
  },
  {
    id: "person:jose-del-barrio",
    name: "José del Barrio",
    publicRole: "Co-founder, Samaipata",
    orgIds: ["org:samaipata"],
    thesis: "AI productivity early-stage Spain.",
    url: "https://medium.com/samaipata-ventures/the-founders-q-a-reloaded-873fb8127512",
    title: "Samaipata founders",
    networkRole: "ecosystem",
  },
  {
    id: "person:cristina-bini",
    name: "Cristina Bini",
    publicRole: "Senior Partner, CDP Venture Capital",
    orgIds: ["org:cdp-vc"],
    thesis: "Italy state-backed AI fund mobilisation.",
    linkedinUrl: "https://www.linkedin.com/in/cristina-bini-9abb50",
    url: "https://www.linkedin.com/in/cristina-bini-9abb50",
    title: "LinkedIn",
    networkRole: "target",
  },
  {
    id: "person:andrea-di-camillo",
    name: "Andrea Di Camillo",
    publicRole: "Founder, P101",
    orgIds: ["org:p101"],
    thesis: "Italian AI / SaaS private VC channel.",
    url: "https://p101.it/",
    title: "P101",
    networkRole: "target",
  },
  {
    id: "person:cristina-fonseca",
    name: "Cristina Fonseca",
    publicRole: "General Partner, Indico Capital",
    orgIds: ["org:indico"],
    thesis: "Portugal / Iberia AI Seed→B activation.",
    linkedinUrl: "https://linkedin.com/in/cristinanfonseca",
    url: "https://linkedin.com/in/cristinanfonseca",
    title: "LinkedIn",
    networkRole: "target",
  },
  {
    id: "person:stephan-morais",
    name: "Stephan Morais",
    publicRole: "Managing GP, Indico Capital",
    orgIds: ["org:indico"],
    thesis: "Indico leadership — Portugal AI mandate.",
    url: "https://indicocapital.com/",
    title: "Indico",
    networkRole: "ecosystem",
  },
];

for (const p of netPeople) {
  addNetNode({
    kind: "person",
    id: p.id,
    name: p.name,
    publicRole: p.publicRole,
    orgIds: p.orgIds,
    thesis: p.thesis,
    identificationStatus: "confirmed",
    networkRole: p.networkRole,
    ...(p.linkedinUrl ? { linkedinUrl: p.linkedinUrl } : {}),
    sources: src(p.url, p.title),
  });
  for (const orgId of p.orgIds) {
    addNetEdge(
      `e:${p.id.replace("person:", "")}-${orgId.replace("org:", "")}`,
      p.id,
      orgId,
      "PARTNER_AT",
      "Public role / team page (Exa-backed enrichment)",
      src(p.url, p.title),
    );
  }
}

const newTargets = [
  {
    personId: "person:thomas-turelier",
    orgId: "org:eurazeo",
    priority: 11,
    why: "Eurazeo VC MD — closes FR fund people gap; AI venture channel.",
    desiredAsk: "Who owns portfolio technical engagement for AI companies.",
    killCriteria: "PE-only conversation with no venture path.",
  },
  {
    personId: "person:fleur-pellerin",
    orgId: "org:korelya",
    priority: 12,
    why: "Korelya CEO — EU↔Asia AI scale-up bridge.",
    desiredAsk: "Intro to portfolio / platform owner for applied AI founders.",
    killCriteria: "Asia-only BD with no FR founder mobilisation.",
  },
  {
    personId: "person:beatriz-gonzalez",
    orgId: "org:seaya",
    priority: 13,
    why: "Primary Spain growth AI activation target.",
    desiredAsk: "Warm path to Seaya AI portfolio mobilisation owner.",
    killCriteria: "No Iberia activation angle after 2 attempts.",
    verifySteps: {
      sharedConnectionsHint: "Prefer Iberia / Seaya portfolio founders among Shared connections.",
      introAskDraft:
        "Intro for a short chat on how Seaya mobilises AI / deeptech founders — not a fundraising ask.",
    },
  },
  {
    personId: "person:miguel-arias",
    orgId: "org:k-fund",
    priority: 14,
    why: "Spain seed–A AI / ML.",
    desiredAsk: "Technical founder convening from K Fund portfolio.",
    killCriteria: "Announcement-only access.",
  },
  {
    personId: "person:javier-torremocha",
    orgId: "org:kibo",
    priority: 15,
    why: "Spain deeptech AI / robotics.",
    desiredAsk: "Deeptech portfolio technical session design.",
    killCriteria: "No robotics/AI portfolio hop.",
  },
  {
    personId: "person:cristina-bini",
    orgId: "org:cdp-vc",
    priority: 16,
    why: "Italy CDP AI fund programme adjacency.",
    desiredAsk: "Who runs AI fund founder programmes / technical activation.",
    killCriteria: "Policy-only conversation.",
  },
  {
    personId: "person:andrea-di-camillo",
    orgId: "org:p101",
    priority: 17,
    why: "Italy private AI / SaaS VC.",
    desiredAsk: "Portfolio founder mobilisation for evaluation workshops.",
    killCriteria: "No path into AI portfolio.",
  },
  {
    personId: "person:cristina-fonseca",
    orgId: "org:indico",
    priority: 18,
    why: "Portugal / Iberia AI Seed→B.",
    desiredAsk: "Indico AI portfolio engagement owner.",
    killCriteria: "No Iberia founder path.",
  },
];

const targetIds = new Set(network.targets.map((t) => t.personId as string));
for (const t of newTargets) {
  if (targetIds.has(t.personId)) continue;
  network.targets.push(t);
  targetIds.add(t.personId);
}

network.meta = {
  ...network.meta,
  version: "0.5.0-southern-europe",
  generatedAt: new Date().toISOString(),
  enrichment: {
    ...(network.meta.enrichment as Record<string, string> | undefined),
    southernEuropePass:
      "Exa 2026-07-19 — FR GP gaps + ES/IT/PT funds, people, theses, portfolios",
  },
};

writeFileSync(
  "public/data/network-bridges.json",
  JSON.stringify(network, null, 2) + "\n",
);

console.log(
  "network nodes",
  network.nodes.length,
  "targets",
  network.targets.length,
);
