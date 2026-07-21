import { readFileSync, writeFileSync } from "fs";

const paths = ["public/data/atlas.json", "src/data/atlas.json"];

for (const path of paths) {
  const atlas = JSON.parse(readFileSync(path, "utf8"));
  let converted = 0;
  atlas.nodes = atlas.nodes.map((n: Record<string, unknown>) => {
    if (n.kind !== "principle") return n;
    converted++;
    return {
      id: String(n.id).replace(/^principle:/, "signal:"),
      kind: "signal",
      signalType: "observed_signal",
      statement: n.statement,
      ...(n.quote ? { quote: n.quote } : {}),
      ...(n.inferred !== undefined ? { inferred: n.inferred } : {}),
      sources: n.sources,
    };
  });
  atlas.edges = atlas.edges.map(
    (e: { from: string; to: string; rel: string; sources: unknown }) => {
      let from = e.from;
      let to = e.to;
      let rel = e.rel;
      if (from.startsWith("principle:"))
        from = from.replace(/^principle:/, "signal:");
      if (to.startsWith("principle:")) to = to.replace(/^principle:/, "signal:");
      if (rel === "HOLDS_PRINCIPLE") rel = "OBSERVES_SIGNAL";
      return { ...e, from, to, rel };
    },
  );
  atlas.meta = {
    ...atlas.meta,
    version: "0.3.0",
    generatedAt: new Date().toISOString(),
    ontologyNote:
      "Descriptive former principles reclassified as signals. Principles reserved for real decision rules.",
  };
  writeFileSync(path, JSON.stringify(atlas, null, 2) + "\n");
  console.log(
    path,
    "converted",
    converted,
    "signals",
    atlas.nodes.filter((n: { kind: string }) => n.kind === "signal").length,
  );
}
