import { readFileSync, writeFileSync } from "fs";

const today = "2026-07-19";
const src = (url: string, title: string) => [{ url, title, accessed: today }];

type Person = {
  id: string;
  name: string;
  publicRole: string;
  orgIds: string[];
  thesis: string;
  identificationStatus: "confirmed" | "hypothesized";
  networkRole: "target" | "ecosystem" | "bridge" | "ego";
  linkedinUrl?: string;
  notes?: string;
  sources: { url: string; title: string; accessed: string }[];
};

type Org = {
  id: string;
  name: string;
  orgType: "vc_fund" | "hub" | "accelerator" | "community" | "other";
  thesis: string;
  aiStance: "ai_native" | "opportunistic" | "mixed" | "unknown";
  atlasEntityId?: string;
  country?: string;
  sources: { url: string; title: string; accessed: string }[];
};

const orgs: Org[] = [
  { id: "org:motier", name: "Motier Ventures", orgType: "vc_fund", thesis: "Moulin-Houzé family office; La Maison founder hub; high AI portfolio density.", aiStance: "ai_native", atlasEntityId: "entity:motier", country: "FR", sources: src("https://techcrunch.com/2024/10/02/motier-ventures-unveils-la-maison-a-community-space-for-the-french-tech-ecosystem/", "TechCrunch La Maison") },
  { id: "org:elaia", name: "Elaia", orgType: "vc_fund", thesis: "Digital + deep tech early stage; strong AI/ML partnership bench.", aiStance: "ai_native", atlasEntityId: "entity:elaia", country: "FR", sources: src("https://www.elaia.com/team/", "Elaia Team") },
  { id: "org:kima", name: "Kima Ventures", orgType: "vc_fund", thesis: "Xavier Niel seed vehicle; high velocity; AI density (Mistral etc.).", aiStance: "mixed", atlasEntityId: "entity:kima", country: "FR", sources: src("https://dealroom.co/investors/kima-ventures/", "Dealroom Kima") },
  { id: "org:partech", name: "Partech", orgType: "vc_fund", thesis: "Global seed→growth tech platform; operator-heavy.", aiStance: "opportunistic", atlasEntityId: "entity:partech", country: "FR", sources: src("https://partechpartners.com/", "Partech") },
  { id: "org:alven", name: "Alven", orgType: "vc_fund", thesis: "Independent early-stage European builders; vertical AI platforms.", aiStance: "mixed", atlasEntityId: "entity:alven", country: "FR", sources: src("https://alven.co/", "Alven") },
  { id: "org:frst", name: "Frst", orgType: "vc_fund", thesis: "Day One / pre-incorporation seed believer.", aiStance: "mixed", atlasEntityId: "entity:frst", country: "FR", sources: src("https://www.frst.vc/", "Frst") },
  { id: "org:daphni", name: "Daphni", orgType: "vc_fund", thesis: "European tech VC with open LP community (daphnipolis); deep tech + science entrepreneurship.", aiStance: "ai_native", atlasEntityId: "entity:daphni", country: "FR", sources: src("https://www.daphni.com/", "Daphni") },
  { id: "org:starquest", name: "Starquest Capital", orgType: "vc_fund", thesis: "Protect / climate / biodiversity thesis — high-tech low-carbon; disaster prevention & green tech.", aiStance: "opportunistic", atlasEntityId: "entity:starquest", country: "FR", sources: src("https://starquest-capital.com/", "Starquest") },
  { id: "org:serena", name: "Serena", orgType: "vc_fund", thesis: "Operator VC; early Applied AI + energy transition; Serena Squad community platform.", aiStance: "ai_native", atlasEntityId: "entity:serena", country: "FR", sources: src("https://www.serena.vc/", "Serena") },
  { id: "org:breega", name: "Breega", orgType: "vc_fund", thesis: "Digital, climate, deep tech pre-seed→A+.", aiStance: "mixed", atlasEntityId: "entity:breega", country: "FR", sources: src("https://www.breega.com/", "Breega") },
  { id: "org:isai", name: "ISAI", orgType: "vc_fund", thesis: "Tech growth / buyouts; entrepreneur-backed.", aiStance: "opportunistic", atlasEntityId: "entity:isai", country: "FR", sources: src("https://www.isai.fr/", "ISAI") },
  { id: "org:xange", name: "XAnge", orgType: "vc_fund", thesis: "Software / internet early-stage.", aiStance: "mixed", atlasEntityId: "entity:xange", country: "FR", sources: src("https://www.xange.vc/", "XAnge") },
  { id: "org:station-f", name: "Station F", orgType: "hub", thesis: "Largest startup campus; programme owners > logo.", aiStance: "mixed", atlasEntityId: "entity:station-f", country: "FR", sources: src("https://stationf.co/", "Station F") },
  { id: "org:france-digitale", name: "France Digitale", orgType: "community", thesis: "Founders + investors association; mobilisation layer.", aiStance: "mixed", atlasEntityId: "entity:france-digitale", country: "FR", sources: src("https://francedigitale.org/", "France Digitale") },
  { id: "org:open-diplomacy", name: "Open Diplomacy Institute", orgType: "other", thesis: "Geopolitics / business think tank founded by Thomas Friang — Maxime adjacency channel.", aiStance: "unknown", country: "FR", sources: src("https://www.open-diplomacy.fr/thomas-friang", "Open Diplomacy") },
  { id: "org:essec-geopolitics", name: "ESSEC Institute for Geopolitics & Business", orgType: "other", thesis: "Corporate geopolitics institute — network into business + policy.", aiStance: "unknown", country: "FR", sources: src("https://institute-geopolitics-business.essec.edu/experts", "ESSEC Geopolitics") },
];

const people: Person[] = [
  {
    id: "person:maxime",
    name: "Maxime Batandéo",
    publicRole: "Builder / AI agents operator — Hire Bestie",
    orgIds: [],
    thesis: "Warm-intro activation without Anthropic brand.",
    identificationStatus: "confirmed",
    networkRole: "ego",
    linkedinUrl: "https://www.linkedin.com/in/maxime-batandeo",
    sources: src("https://www.linkedin.com/in/maxime-batandeo", "LinkedIn (auth)"),
  },
  {
    id: "person:sofia-dahoune",
    name: "Sofia Dahoune",
    publicRole: "Partner, daphni (deep tech / science entrepreneurship)",
    orgIds: ["org:daphni"],
    thesis: "Deep tech builder challenges; ex-Elaia Partner (Alice&Bob, Aqemia, Harfanglab); ex-Bpifrance; Polytechnique startup programmes; AI@ENS adjacency.",
    identificationStatus: "confirmed",
    networkRole: "bridge",
    linkedinUrl: "https://www.linkedin.com/in/sofiadahoune",
    notes: "PRIMARY WARM BRIDGE. L1 since 2012. Can intro across Elaia alumni + daphni + deep tech scientists.",
    sources: src("https://www.daphni.com/team/sofia-dahoune", "daphni — Sofia Dahoune"),
  },
  {
    id: "person:harold-dumeurger",
    name: "Harold Dumeurger",
    publicRole: "Partner, Starquest Capital",
    orgIds: ["org:starquest"],
    thesis: "Climate / protect / biodiversity VC — mobilises founders in green + risk-tech.",
    identificationStatus: "confirmed",
    networkRole: "bridge",
    linkedinUrl: "https://www.linkedin.com/in/harold-dumeurger-5143b945",
    notes: "PRIMARY WARM BRIDGE. L1 since 2013. Path into Starquest portfolio + climate-tech FR network.",
    sources: src("https://www.linkedin.com/in/harold-dumeurger-5143b945", "Harold Dumeurger LinkedIn"),
  },
  {
    id: "person:thomas-friang",
    name: "Thomas Friang",
    publicRole: "Executive Director, ESSEC Institute for Geopolitics & Business; Founder Open Diplomacy",
    orgIds: ["org:essec-geopolitics", "org:open-diplomacy"],
    thesis: "Geopolitics × business network; Open Diplomacy alumni/community as intro fabric.",
    identificationStatus: "confirmed",
    networkRole: "bridge",
    linkedinUrl: "https://www.linkedin.com/in/thomasfriang",
    notes: "PRIMARY WARM BRIDGE. L1 since 2013. Not a VC GP — high network density across policy/business/tech.",
    sources: [
      ...src("https://www.linkedin.com/in/thomasfriang", "Thomas Friang LinkedIn"),
      ...src("https://pressreleases.responsesource.com/news/106421/thomas-friang-appointed-executive-director-of-the-essec-institute-for/", "ESSEC appointment"),
    ],
  },
  {
    id: "person:nicolas-essayan",
    name: "Nicolas Essayan",
    publicRole: "Founding Partner, Motier Ventures",
    orgIds: ["org:motier"],
    thesis: "Motier founding partner — programme / portfolio mobilisation with Houzé.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/nicolasessayan",
    sources: src("https://www.linkedin.com/in/nicolasessayan", "Nicolas Essayan LinkedIn"),
  },
  {
    id: "person:guillaume-houze",
    name: "Guillaume Houzé",
    publicRole: "Founder, Motier Ventures",
    orgIds: ["org:motier"],
    thesis: "La Maison + family ecosystem play for AI founders.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    sources: src("https://techcrunch.com/2024/10/02/motier-ventures-unveils-la-maison-a-community-space-for-the-french-tech-ecosystem/", "TechCrunch"),
  },
  {
    id: "person:clement-lamolinerie",
    name: "Clément Lamolinerie",
    publicRole: "Team, Motier Ventures (verify title)",
    orgIds: ["org:motier"],
    thesis: "Possible La Maison / ops contact — verify before outreach.",
    identificationStatus: "hypothesized",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/cl%C3%A9ment-lamolinerie-8b39a2b",
    sources: src("https://www.linkedin.com/in/cl%C3%A9ment-lamolinerie-8b39a2b", "LinkedIn"),
  },
  {
    id: "person:alexis-frentz",
    name: "Alexis Frentz",
    publicRole: "Partner, Elaia — AI / SaaS / Data / Fintech",
    orgIds: ["org:elaia"],
    thesis: "AI partner channel into Elaia portfolio.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/alexisfrentz/",
    notes: "Sofia is ex-Elaia Partner — strong potential CAN_INTRO path.",
    sources: src("https://www.elaia.com/team/", "Elaia Team"),
  },
  {
    id: "person:pauline-roux",
    name: "Pauline Roux",
    publicRole: "Managing Partner, Elaia",
    orgIds: ["org:elaia"],
    thesis: "MP — digital venture leadership.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    linkedinUrl: "https://www.linkedin.com/in/paulineroux",
    sources: src("https://www.elaia.com/team/", "Elaia Team"),
  },
  {
    id: "person:xavier-lazarus",
    name: "Xavier Lazarus",
    publicRole: "Managing Partner, Elaia",
    orgIds: ["org:elaia"],
    thesis: "MP — deep tech / digital.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    linkedinUrl: "https://fr.linkedin.com/in/xavier-lazarus-63747",
    sources: src("https://www.elaia.com/team/", "Elaia Team"),
  },
  {
    id: "person:jean-de-la-rochebrochard",
    name: "Jean de La Rochebrochard",
    publicRole: "Managing Partner, Kima Ventures",
    orgIds: ["org:kima"],
    thesis: "Runs Kima seed velocity machine.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/jeandlr",
    sources: src("https://www.linkedin.com/in/jeandlr", "LinkedIn"),
  },
  {
    id: "person:alexis-robert",
    name: "Alexis Robert",
    publicRole: "General Partner, Kima Ventures",
    orgIds: ["org:kima"],
    thesis: "GP — early-stage deal flow.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    linkedinUrl: "https://www.linkedin.com/in/robertalexis",
    sources: src("https://www.linkedin.com/in/robertalexis", "LinkedIn"),
  },
  {
    id: "person:romain-lavault",
    name: "Romain Lavault",
    publicRole: "General Partner, Partech (Seed)",
    orgIds: ["org:partech"],
    thesis: "Seed GP — AI/infra apps in deal flow.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/lavault",
    sources: src("https://www.linkedin.com/in/lavault", "LinkedIn"),
  },
  {
    id: "person:charles-letourneur",
    name: "Charles Letourneur",
    publicRole: "Co-founder & Managing Partner, Alven",
    orgIds: ["org:alven"],
    thesis: "Early-stage software/AI platforms.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/charles-letourneur-347bb233",
    sources: src("https://www.linkedin.com/in/charles-letourneur-347bb233", "LinkedIn"),
  },
  {
    id: "person:pierre-entremont",
    name: "Pierre Entremont",
    publicRole: "Co-Founder & Partner, Frst",
    orgIds: ["org:frst"],
    thesis: "Day One seed believer.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/pierreentremont",
    sources: src("https://www.frst.vc/", "Frst"),
  },
  {
    id: "person:pierre-yves-meerschman",
    name: "Pierre-Yves Meerschman",
    publicRole: "Co-founder & Managing Partner, daphni",
    orgIds: ["org:daphni"],
    thesis: "daphnipolis community facilitation — portfolio mobilisation layer.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    linkedinUrl: "https://www.linkedin.com/in/pierre-yves-meerschman",
    sources: src("https://www.daphni.com/team", "daphni Team"),
  },
  {
    id: "person:pierre-eric-leibovici",
    name: "Pierre-Eric Leibovici",
    publicRole: "Co-founder & Managing Partner, daphni",
    orgIds: ["org:daphni"],
    thesis: "MP — European tech + community LP model.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    linkedinUrl: "https://www.linkedin.com/in/pierre-eric-leibovici",
    sources: src("https://www.daphni.com/team", "daphni Team"),
  },
  {
    id: "person:xavier-lorphelin",
    name: "Xavier Lorphelin",
    publicRole: "Managing Partner, Serena",
    orgIds: ["org:serena"],
    thesis: "Serena leadership; Squad community; AI fund pioneer framing.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://fr.linkedin.com/in/xlorphelin",
    sources: src("https://www.serena.vc/", "Serena"),
  },
  {
    id: "person:nicolas-rose",
    name: "Nicolas Rose",
    publicRole: "Managing Partner, XAnge",
    orgIds: ["org:xange"],
    thesis: "Software / internet early-stage leadership.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/rosenicolas",
    sources: src("https://www.xange.vc/team/nicolas-rose", "XAnge — Nicolas Rose"),
  },
  {
    id: "person:nicolas-martineau",
    name: "Nicolas Martineau",
    publicRole: "Partner, ISAI",
    orgIds: ["org:isai"],
    thesis: "ISAI tech growth / PE adjacency.",
    identificationStatus: "hypothesized",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/nicolas-martineau-1b773aa",
    notes: "Confirm current title on ISAI site before outreach.",
    sources: src("https://www.linkedin.com/in/nicolas-martineau-1b773aa", "LinkedIn"),
  },
  {
    id: "person:benjamin-deplus",
    name: "Benjamin Deplus",
    publicRole: "Partner, Breega",
    orgIds: ["org:breega"],
    thesis: "Breega digital/climate/deeptech partner bench.",
    identificationStatus: "hypothesized",
    networkRole: "target",
    notes: "Confirm on breega.com/team before outreach.",
    sources: src("https://www.breega.com/", "Breega"),
  },
  {
    id: "person:roxanne-varza",
    name: "Roxanne Varza",
    publicRole: "Director, Station F",
    orgIds: ["org:station-f"],
    thesis: "Campus OS — programmes and density.",
    identificationStatus: "confirmed",
    networkRole: "target",
    linkedinUrl: "https://www.linkedin.com/in/roxannevarza/",
    sources: src("https://stationf.co/", "Station F"),
  },
  {
    id: "person:xavier-niel",
    name: "Xavier Niel",
    publicRole: "Entrepreneur; Station F / Kima adjacency",
    orgIds: ["org:station-f", "org:kima"],
    thesis: "French tech density via capital + campus.",
    identificationStatus: "confirmed",
    networkRole: "ecosystem",
    sources: src("https://en.wikipedia.org/wiki/Xavier_Niel", "Wikipedia"),
  },
];

const edgeTuples = [
  ["e:sofia-daphni", "person:sofia-dahoune", "org:daphni", "PARTNER_AT", "Listed Partner on daphni.com/team/sofia-dahoune", "confirmed"],
  ["e:harold-starquest", "person:harold-dumeurger", "org:starquest", "PARTNER_AT", "Partner at Starquest Capital (LinkedIn + firm)", "confirmed"],
  ["e:thomas-essec", "person:thomas-friang", "org:essec-geopolitics", "WORKS_AT", "Executive Director since 2025", "confirmed"],
  ["e:thomas-opendip", "person:thomas-friang", "org:open-diplomacy", "FOUNDED", "Founder Open Diplomacy Institute", "confirmed"],
  ["e:essayan-motier", "person:nicolas-essayan", "org:motier", "PARTNER_AT", "Founding partner Motier", "confirmed"],
  ["e:houze-motier", "person:guillaume-houze", "org:motier", "FOUNDED", "Founder Motier / La Maison", "confirmed"],
  ["e:clement-motier", "person:clement-lamolinerie", "org:motier", "WORKS_AT", "Public Motier association — title TBD", "likely"],
  ["e:frentz-elaia", "person:alexis-frentz", "org:elaia", "PARTNER_AT", "Elaia team page", "confirmed"],
  ["e:roux-elaia", "person:pauline-roux", "org:elaia", "PARTNER_AT", "Elaia team page", "confirmed"],
  ["e:lazarus-elaia", "person:xavier-lazarus", "org:elaia", "PARTNER_AT", "Elaia team page", "confirmed"],
  ["e:jean-kima", "person:jean-de-la-rochebrochard", "org:kima", "PARTNER_AT", "Managing Partner", "confirmed"],
  ["e:alexis-robert-kima", "person:alexis-robert", "org:kima", "PARTNER_AT", "GP Kima", "confirmed"],
  ["e:lavault-partech", "person:romain-lavault", "org:partech", "PARTNER_AT", "GP Partech Seed", "confirmed"],
  ["e:charles-alven", "person:charles-letourneur", "org:alven", "PARTNER_AT", "MP Alven", "confirmed"],
  ["e:pierre-frst", "person:pierre-entremont", "org:frst", "PARTNER_AT", "Co-founder Frst", "confirmed"],
  ["e:pym-daphni", "person:pierre-yves-meerschman", "org:daphni", "PARTNER_AT", "Co-founder MP daphni", "confirmed"],
  ["e:pel-daphni", "person:pierre-eric-leibovici", "org:daphni", "PARTNER_AT", "Co-founder MP daphni", "confirmed"],
  ["e:lorphelin-serena", "person:xavier-lorphelin", "org:serena", "PARTNER_AT", "MP Serena", "confirmed"],
  ["e:rose-xange", "person:nicolas-rose", "org:xange", "PARTNER_AT", "MP XAnge", "confirmed"],
  ["e:martineau-isai", "person:nicolas-martineau", "org:isai", "PARTNER_AT", "Partner ISAI — verify", "likely"],
  ["e:deplus-breega", "person:benjamin-deplus", "org:breega", "PARTNER_AT", "Partner Breega — verify", "likely"],
  ["e:roxanne-stationf", "person:roxanne-varza", "org:station-f", "WORKS_AT", "Director Station F", "confirmed"],
  ["e:niel-stationf", "person:xavier-niel", "org:station-f", "FOUNDED", "Station F backer", "confirmed"],
  ["e:niel-kima", "person:xavier-niel", "org:kima", "FOUNDED", "Kima association", "confirmed"],
  ["e:sofia-ex-elaia", "person:sofia-dahoune", "org:elaia", "ADVISES", "Former Partner Elaia 2018–2023 — alumni path", "confirmed"],
  ["e:daphni-coinvest-elaia", "org:daphni", "org:elaia", "CO_INVESTS_WITH", "Overlapping deep-tech FR dealflow; Sofia bridges both — verify deal-by-deal", "likely"],
] as const;

const targets = [
  { personId: "person:sofia-dahoune", orgId: "org:daphni", priority: 1, why: "Your strongest ecosystem bridge: daphni Partner + ex-Elaia + deep tech. Use as introducer first.", desiredAsk: "Map who she can warm-intro among Motier/Elaia/Kima/Serena/Station F; then one intro.", killCriteria: "She declines intros — still keep as advisor on deep-tech activation design." },
  { personId: "person:harold-dumeurger", orgId: "org:starquest", priority: 2, why: "L1 Partner at Starquest — climate/protect portfolio + FR VC peer intros.", desiredAsk: "Intros to peers who run founder programmes; Starquest portfolio technical founders.", killCriteria: "Only climate-narrow intros with no AI activation angle." },
  { personId: "person:thomas-friang", orgId: "org:essec-geopolitics", priority: 3, why: "L1 since 2013; Open Diplomacy + ESSEC geopolitics network density.", desiredAsk: "Intros into FR tech/policy operators between campus, corporates, and funds.", killCriteria: "Intros stay purely academic/policy with no founder mobilisation." },
  { personId: "person:nicolas-essayan", orgId: "org:motier", priority: 4, why: "Motier founding partner — Mission case programme ownership.", desiredAsk: "Who owns La Maison / portfolio founder programmes; cohort workshop design chat.", killCriteria: "No programme owner after 2 warm attempts." },
  { personId: "person:alexis-frentz", orgId: "org:elaia", priority: 5, why: "AI Partner Elaia — Sofia alumni path likely.", desiredAsk: "How Elaia mobilises AI portfolio for technical evaluation workshops.", killCriteria: "Partner declines; try programme ops." },
  { personId: "person:jean-de-la-rochebrochard", orgId: "org:kima", priority: 6, why: "Kima MP — seed velocity + AI density.", desiredAsk: "Who can convene technical founders from portfolio.", killCriteria: "Announcement-only access." },
  { personId: "person:roxanne-varza", orgId: "org:station-f", priority: 7, why: "Campus programmes.", desiredAsk: "Intro to technical programme leads.", killCriteria: "Logo-only conversation." },
  { personId: "person:romain-lavault", orgId: "org:partech", priority: 8, why: "Partech Seed GP.", desiredAsk: "Platform/portfolio engagement owner.", killCriteria: "No portfolio hop." },
  { personId: "person:xavier-lorphelin", orgId: "org:serena", priority: 9, why: "Serena MP + Squad community — operator activation model.", desiredAsk: "How Serena Squad mobilises AI founders.", killCriteria: "No community access path." },
  { personId: "person:charles-letourneur", orgId: "org:alven", priority: 10, why: "Alven MP.", desiredAsk: "Portfolio technical engagement owner.", killCriteria: "Check-writing only." },
  { personId: "person:pierre-entremont", orgId: "org:frst", priority: 11, why: "Frst Day One.", desiredAsk: "Seed founder mobilisation chat.", killCriteria: "No path." },
  { personId: "person:nicolas-rose", orgId: "org:xange", priority: 12, why: "XAnge MP.", desiredAsk: "Software/AI portfolio engagement.", killCriteria: "No path." },
];

const nodes = [
  ...orgs.map((o) => ({ kind: "org" as const, ...o })),
  ...people.map((p) => ({ kind: "person" as const, ...p })),
];

const network = {
  meta: {
    version: "0.3.0-people-layer",
    title: "Activation network — FR entities + key persons + warm bridges",
    generatedAt: new Date().toISOString(),
    disclaimer:
      "People layer for FR AI activation. Public roles only. Sofia/Harold/Thomas are confirmed ecosystem actors; KNOWS edges to ego live in private overlay from Connections.csv. No emails/phones.",
    enrichment: {
      stakeholderSource: "exa + official team pages",
      proximitySource: "linkedin_connections_csv",
      atlasGap:
        "Atlas had ~119 entities but only 3 person entities — this file is the activation people layer.",
    },
  },
  egoPersonId: "person:maxime",
  nodes,
  edges: edgeTuples.map(([id, from, to, rel, basis, confidence]) => ({
    id,
    from,
    to,
    rel,
    basis,
    confidence,
  })),
  targets,
};

writeFileSync(
  "public/data/network-bridges.json",
  JSON.stringify(network, null, 2) + "\n",
);
console.log(
  "network nodes",
  nodes.length,
  "people",
  people.length,
  "orgs",
  orgs.length,
  "targets",
  targets.length,
);

const atlas = JSON.parse(readFileSync("public/data/atlas.json", "utf8"));
const existing = new Set(atlas.nodes.map((n: { id: string }) => n.id));
const addEntity = (e: Record<string, unknown>) => {
  if (!existing.has(e.id as string)) {
    atlas.nodes.push(e);
    existing.add(e.id as string);
    return true;
  }
  return false;
};

let added = 0;
if (
  addEntity({
    id: "entity:starquest",
    kind: "entity",
    entityType: "vc_fund",
    name: "Starquest Capital",
    country: "FR",
    city: "Paris",
    summary:
      "Paris VC investing in high-tech low-carbon / Protect thesis: climate, disaster prevention, biodiversity, and resource preservation.",
    tags: ["vc", "climate", "protect"],
    sources: src("https://starquest-capital.com/", "Starquest Capital"),
  })
)
  added++;

const atlasPeople: [string, string, string, string[], string, string][] = [
  ["entity:sofia-dahoune", "Sofia Dahoune", "Partner at daphni; former Partner at Elaia; deep tech / science entrepreneurship.", ["person", "daphni", "elaia"], "https://www.daphni.com/team/sofia-dahoune", "daphni — Sofia"],
  ["entity:harold-dumeurger", "Harold Dumeurger", "Partner at Starquest Capital (climate / protect thesis).", ["person", "starquest"], "https://www.linkedin.com/in/harold-dumeurger-5143b945", "LinkedIn"],
  ["entity:thomas-friang", "Thomas Friang", "Executive Director, ESSEC Institute for Geopolitics & Business; founder Open Diplomacy Institute.", ["person", "essec", "open-diplomacy"], "https://www.linkedin.com/in/thomasfriang", "LinkedIn"],
  ["entity:nicolas-essayan", "Nicolas Essayan", "Founding partner, Motier Ventures.", ["person", "motier"], "https://www.linkedin.com/in/nicolasessayan", "LinkedIn"],
  ["entity:jean-de-la-rochebrochard", "Jean de La Rochebrochard", "Managing Partner, Kima Ventures.", ["person", "kima"], "https://www.linkedin.com/in/jeandlr", "LinkedIn"],
  ["entity:alexis-frentz", "Alexis Frentz", "Partner at Elaia focused on AI / SaaS / data / fintech.", ["person", "elaia"], "https://www.elaia.com/team/", "Elaia Team"],
  ["entity:romain-lavault", "Romain Lavault", "General Partner, Partech Seed.", ["person", "partech"], "https://www.linkedin.com/in/lavault", "LinkedIn"],
  ["entity:xavier-lorphelin", "Xavier Lorphelin", "Managing Partner, Serena.", ["person", "serena"], "https://fr.linkedin.com/in/xlorphelin", "LinkedIn"],
  ["entity:pierre-entremont", "Pierre Entremont", "Co-founder & Partner, Frst.", ["person", "frst"], "https://www.frst.vc/", "Frst"],
  ["entity:charles-letourneur", "Charles Letourneur", "Co-founder & Managing Partner, Alven.", ["person", "alven"], "https://www.linkedin.com/in/charles-letourneur-347bb233", "LinkedIn"],
];

for (const [id, name, summary, tags, url, title] of atlasPeople) {
  if (
    addEntity({
      id,
      kind: "entity",
      entityType: "person",
      name,
      country: "FR",
      city: "Paris",
      summary,
      tags,
      sources: src(url, title),
    })
  )
    added++;
}

const edgeAdds: [string, string, string][] = [
  ["entity:sofia-dahoune", "entity:daphni", "MEMBER_OF"],
  ["entity:sofia-dahoune", "entity:elaia", "PARTNERS_WITH"],
  ["entity:harold-dumeurger", "entity:starquest", "MEMBER_OF"],
  ["entity:nicolas-essayan", "entity:motier", "MEMBER_OF"],
  ["entity:jean-de-la-rochebrochard", "entity:kima", "MEMBER_OF"],
  ["entity:alexis-frentz", "entity:elaia", "MEMBER_OF"],
  ["entity:romain-lavault", "entity:partech", "MEMBER_OF"],
  ["entity:xavier-lorphelin", "entity:serena", "MEMBER_OF"],
  ["entity:pierre-entremont", "entity:frst", "MEMBER_OF"],
  ["entity:charles-letourneur", "entity:alven", "MEMBER_OF"],
  ["entity:roxanne-varza", "entity:station-f", "MEMBER_OF"],
];
const edgeKey = new Set(
  atlas.edges.map(
    (e: { from: string; to: string; rel: string }) =>
      `${e.from}|${e.to}|${e.rel}`,
  ),
);
let edgesAdded = 0;
for (const [from, to, rel] of edgeAdds) {
  if (!existing.has(from) || !existing.has(to)) continue;
  const k = `${from}|${to}|${rel}`;
  if (edgeKey.has(k)) continue;
  atlas.edges.push({
    from,
    to,
    rel,
    sources: src(
      "https://github.com/HireBestie/ecosystem-atlas",
      "People layer enrichment",
    ),
  });
  edgeKey.add(k);
  edgesAdded++;
}

atlas.meta = {
  ...atlas.meta,
  generatedAt: new Date().toISOString(),
  peopleLayerNote: "Person entities expanded 2026-07-19 via Exa + team pages",
};
writeFileSync("public/data/atlas.json", JSON.stringify(atlas, null, 2) + "\n");
try {
  writeFileSync("src/data/atlas.json", JSON.stringify(atlas, null, 2) + "\n");
} catch {
  // optional
}
console.log(
  "atlas persons now",
  atlas.nodes.filter((n: { entityType: string }) => n.entityType === "person")
    .length,
  "added entities",
  added,
  "edges",
  edgesAdded,
);

const privateOverlay = {
  nodes: [
    {
      id: "person:corentin-grenon",
      kind: "person",
      name: "Corentin Grenon",
      publicRole: "Head of ESSEC Incubator | Station F",
      orgIds: ["org:station-f"],
      identificationStatus: "confirmed",
      networkRole: "bridge",
      linkedinUrl: "https://www.linkedin.com/in/corentin-grenon",
      notes: "Secondary Station F bridge.",
      sources: src("https://www.linkedin.com/in/corentin-grenon", "LinkedIn"),
    },
  ],
  edges: [
    {
      id: "e:maxime-sofia",
      from: "person:maxime",
      to: "person:sofia-dahoune",
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "strong",
      basis:
        "LinkedIn L1 since 23 Jul 2012 (Connections.csv) — long-standing tie; primary ecosystem introducer",
      confidence: "confirmed",
    },
    {
      id: "e:maxime-harold",
      from: "person:maxime",
      to: "person:harold-dumeurger",
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "strong",
      basis:
        "LinkedIn L1 since 28 Mar 2013 (Connections.csv) — Partner Starquest",
      confidence: "confirmed",
    },
    {
      id: "e:maxime-thomas",
      from: "person:maxime",
      to: "person:thomas-friang",
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "strong",
      basis:
        "LinkedIn L1 since 04 Jun 2013 (Connections.csv) — Open Diplomacy / ESSEC geopolitics",
      confidence: "confirmed",
    },
    {
      id: "e:maxime-corentin",
      from: "person:maxime",
      to: "person:corentin-grenon",
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "warm",
      basis: "LinkedIn L1 — Head of ESSEC Incubator | Station F",
      confidence: "confirmed",
    },
    {
      id: "e:sofia-can-intro-frentz",
      from: "person:sofia-dahoune",
      to: "person:alexis-frentz",
      rel: "CAN_INTRO",
      linkedinDegree: 1,
      strength: "warm",
      basis:
        "Sofia was Elaia Partner 2018–2023; Alexis is current Elaia Partner — VERIFY willingness before claiming",
      confidence: "likely",
    },
  ],
};

writeFileSync(
  "public/data/network-bridges.private.json",
  JSON.stringify(privateOverlay, null, 2) + "\n",
);
console.log("private overlay edges", privateOverlay.edges.length);
