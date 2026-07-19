/**
 * Import LinkedIn Connections.csv → network-bridges.private.json
 *
 * Why CSV: Composio LinkedIn toolkit cannot list connections or mutuals
 * (LinkedIn API restriction). Official data export is the honest L1 source.
 *
 * Export path (LinkedIn):
 *   Settings → Data privacy → Get a copy of your data → Connections
 *   Place file at: data/private/Connections.csv
 *
 * Usage:
 *   bun run scripts/import-linkedin-connections.ts
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

type NetworkNode = {
  id: string;
  kind: "person" | "org";
  name: string;
  publicRole?: string;
  orgIds?: string[];
  identificationStatus?: string;
  networkRole?: string;
  linkedinUrl?: string;
  notes?: string;
  sources?: { url: string; title?: string; accessed?: string }[];
};

type NetworkEdge = {
  id: string;
  from: string;
  to: string;
  rel: string;
  linkedinDegree?: number | null;
  strength?: string;
  basis: string;
  confidence: string;
};

type NetworkGraph = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  targets: { personId: string; orgId: string; priority: number }[];
};

type ConnectionRow = {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  connectedOn: string;
  url: string;
  email: string;
};

const ROOT = path.resolve(import.meta.dir, "..");
const CSV_PATH = path.join(ROOT, "data/private/Connections.csv");
const PUBLIC_GRAPH = path.join(ROOT, "public/data/network-bridges.json");
const OUT_PATH = path.join(ROOT, "public/data/network-bridges.private.json");
const REPORT_PATH = path.join(ROOT, "data/private/proximity-report.json");

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      if (ch === "\r") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseConnections(csvText: string): ConnectionRow[] {
  // LinkedIn exports often have Notes rows before the header
  const lines = parseCsv(csvText.replace(/^\uFEFF/, ""));
  let headerIdx = lines.findIndex((r) =>
    r.some((c) => normalizeHeader(c) === "first name"),
  );
  if (headerIdx < 0) {
    throw new Error("Could not find Connections.csv header (First Name)");
  }
  const header = lines[headerIdx]!.map(normalizeHeader);
  const idx = (name: string) => header.indexOf(name);
  const iFirst = idx("first name");
  const iLast = idx("last name");
  const iUrl = header.findIndex(
    (h) => h === "url" || h === "profile url" || h.includes("linkedin"),
  );
  const iEmail = idx("email address");
  const iCompany = idx("company");
  const iPosition = idx("position");
  const iConnected = idx("connected on");

  const out: ConnectionRow[] = [];
  for (const r of lines.slice(headerIdx + 1)) {
    if (r.every((c) => !c.trim())) continue;
    const firstName = (r[iFirst] ?? "").trim();
    const lastName = (r[iLast] ?? "").trim();
    if (!firstName && !lastName) continue;
    out.push({
      firstName,
      lastName,
      company: iCompany >= 0 ? (r[iCompany] ?? "").trim() : "",
      position: iPosition >= 0 ? (r[iPosition] ?? "").trim() : "",
      connectedOn: iConnected >= 0 ? (r[iConnected] ?? "").trim() : "",
      url: iUrl >= 0 ? (r[iUrl] ?? "").trim() : "",
      // Email kept only in-memory for matching — never written to output
      email: iEmail >= 0 ? (r[iEmail] ?? "").trim() : "",
    });
  }
  return out;
}

function vanity(url: string): string | null {
  const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]!).toLowerCase() : null;
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function namesMatch(
  aFirst: string,
  aLast: string,
  bName: string,
): boolean {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const full = norm(`${aFirst} ${aLast}`);
  const target = norm(bName);
  if (!full || !target) return false;
  if (full === target) return true;
  // last-name + first-token match
  const [tf, ...trest] = target.split(" ");
  const tl = trest[trest.length - 1] ?? "";
  const af = norm(aFirst).split(" ")[0] ?? "";
  const al = norm(aLast);
  return Boolean(af && al && tf === af && tl === al);
}

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`Missing ${CSV_PATH}`);
    console.error(
      "Export LinkedIn Connections and place the file there, then re-run.",
    );
    process.exit(1);
  }

  const csvText = await readFile(CSV_PATH, "utf8");
  const connections = parseConnections(csvText);
  const graph = JSON.parse(await readFile(PUBLIC_GRAPH, "utf8")) as NetworkGraph;

  const targets = graph.targets
    .map((t) => graph.nodes.find((n) => n.id === t.personId && n.kind === "person"))
    .filter((n): n is NetworkNode => Boolean(n));

  const directHits: {
    targetId: string;
    targetName: string;
    connection: ConnectionRow;
    match: "url" | "name";
  }[] = [];

  for (const target of targets) {
    const targetVanity = target.linkedinUrl
      ? vanity(target.linkedinUrl)
      : null;
    for (const c of connections) {
      const cVanity = c.url ? vanity(c.url) : null;
      if (targetVanity && cVanity && targetVanity === cVanity) {
        directHits.push({
          targetId: target.id,
          targetName: target.name,
          connection: c,
          match: "url",
        });
        break;
      }
      if (namesMatch(c.firstName, c.lastName, target.name)) {
        directHits.push({
          targetId: target.id,
          targetName: target.name,
          connection: c,
          match: "name",
        });
        break;
      }
    }
  }

  // Bridge candidates ranked by activation usefulness (not just keyword hits).
  // Prefer target funds / hubs / Motier-adjacent portfolio over broad Bpifrance.
  const rankedKeywords: { key: string; weight: number }[] = [
    { key: "motier", weight: 100 },
    { key: "elaia", weight: 95 },
    { key: "kima vent", weight: 95 },
    { key: "partech", weight: 90 },
    { key: "alven", weight: 90 },
    { key: "frst", weight: 85 },
    { key: "station f", weight: 90 },
    { key: "stationf", weight: 90 },
    { key: "france digitale", weight: 70 },
    { key: "mistral", weight: 75 },
    { key: "photoroom", weight: 70 },
    { key: "hugging face", weight: 70 },
    { key: "huggingface", weight: 70 },
    { key: "eurazeo", weight: 55 },
    { key: "bpifrance", weight: 35 },
  ];

  function companyExactDust(company: string): boolean {
    return company.trim().toLowerCase() === "dust";
  }

  function bridgeScore(c: ConnectionRow): number {
    const hay = `${c.company} ${c.position}`.toLowerCase();
    let score = 0;
    if (companyExactDust(c.company)) score = Math.max(score, 80);
    for (const { key, weight } of rankedKeywords) {
      if (hay.includes(key)) score = Math.max(score, weight);
    }
    if (
      /\b(founder|partner|gp|managing|head of|director|programme|program|incubator)\b/i.test(
        c.position,
      )
    ) {
      score += 8;
    }
    if (/\b(talent acquisition|contentieux|legal|avocat)\b/i.test(c.position)) {
      score -= 20;
    }
    return score;
  }

  const bridgeCandidates = connections
    .map((c) => ({ c, score: bridgeScore(c) }))
    .filter((x) => x.score >= 55)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c)
    .slice(0, 40);

  const overlayNodes: NetworkNode[] = [];
  const overlayEdges: NetworkEdge[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // Direct L1 to targets
  for (const hit of directHits) {
    overlayEdges.push({
      id: `e:maxime-direct-${hit.targetId.replace("person:", "")}`,
      from: "person:maxime",
      to: hit.targetId,
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "warm",
      basis: `LinkedIn Connections.csv L1 match (${hit.match}) — review strength before outreach`,
      confidence: hit.match === "url" ? "confirmed" : "likely",
    });
  }

  // Fill bridge slots with top org-keyword L1s
  const slots = ["person:bridge-slot-1", "person:bridge-slot-2", "person:bridge-slot-3"];
  for (let i = 0; i < Math.min(slots.length, bridgeCandidates.length); i++) {
    const c = bridgeCandidates[i]!;
    const id = slots[i]!;
    const fullName = `${c.firstName} ${c.lastName}`.trim();
    overlayNodes.push({
      id,
      kind: "person",
      name: fullName,
      publicRole: [c.position, c.company].filter(Boolean).join(" @ ") || "LinkedIn L1",
      orgIds: [],
      identificationStatus: "confirmed",
      networkRole: "bridge",
      linkedinUrl: c.url || undefined,
      notes: `Imported from Connections.csv on ${today}. Mark strength strong/warm after you verify willingness to intro.`,
      sources: c.url
        ? [{ url: c.url, title: "LinkedIn (from Connections export)", accessed: today }]
        : [{ url: "https://www.linkedin.com/mypreferences/d/download-my-data", title: "LinkedIn data export", accessed: today }],
    });
    overlayEdges.push({
      id: `e:maxime-bridge${i + 1}`,
      from: "person:maxime",
      to: id,
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "warm",
      basis: `LinkedIn L1 since ${c.connectedOn || "unknown"} — company/position keyword match`,
      confidence: "confirmed",
    });
  }

  // Extra bridge people beyond slots (for report / manual CAN_INTRO wiring)
  const extraBridges = bridgeCandidates.slice(slots.length, slots.length + 15);
  for (const c of extraBridges) {
    const fullName = `${c.firstName} ${c.lastName}`.trim();
    const id = `person:l1-${slugify(fullName)}`;
    overlayNodes.push({
      id,
      kind: "person",
      name: fullName,
      publicRole: [c.position, c.company].filter(Boolean).join(" @ ") || "LinkedIn L1",
      orgIds: [],
      identificationStatus: "confirmed",
      networkRole: "bridge",
      linkedinUrl: c.url || undefined,
      notes: "Extra L1 bridge candidate — add CAN_INTRO edges manually after checking shared connections on LinkedIn.",
      sources: c.url
        ? [{ url: c.url, title: "LinkedIn", accessed: today }]
        : [],
    });
    overlayEdges.push({
      id: `e:maxime-${id.replace("person:", "")}`,
      from: "person:maxime",
      to: id,
      rel: "KNOWS",
      linkedinDegree: 1,
      strength: "unknown",
      basis: `LinkedIn L1 keyword candidate @ ${c.company}`,
      confidence: "confirmed",
    });
  }

  const overlay = {
    nodes: overlayNodes,
    edges: overlayEdges,
  };

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(overlay, null, 2) + "\n", "utf8");

  const report = {
    importedAt: new Date().toISOString(),
    connectionCount: connections.length,
    directL1Targets: directHits.map((h) => ({
      targetId: h.targetId,
      targetName: h.targetName,
      match: h.match,
      company: h.connection.company,
      // no email
    })),
    bridgeSlotFills: bridgeCandidates.slice(0, 3).map((c) => ({
      name: `${c.firstName} ${c.lastName}`.trim(),
      company: c.company,
      position: c.position,
    })),
    extraBridgeCandidates: extraBridges.map((c) => ({
      name: `${c.firstName} ${c.lastName}`.trim(),
      company: c.company,
      position: c.position,
    })),
    nextManualStep:
      "Open each target on LinkedIn → Shared connections → add CAN_INTRO edges from your L1 bridges to targets in network-bridges.private.json",
  };
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(
    `Connections: ${connections.length} · Direct L1 targets: ${directHits.length} · Bridge slots filled: ${Math.min(3, bridgeCandidates.length)}`,
  );
  if (directHits.length === 0) {
    console.log(
      "No direct L1 to targets — expected. Use Shared connections on LinkedIn to wire CAN_INTRO.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
