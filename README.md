# Ecosystem Atlas

Interactive knowledge graph of the **France & Southern Europe AI** ecosystem — entities, assumptions (dated bets), and principles (quoted theses). Independent Next.js app; no monorepo dependencies.

## Stack

- Next.js 16 · React 19 · TypeScript
- [React Flow](https://reactflow.dev) (`@xyflow/react`) with **Zustand** for graph state
- [shadcn/ui](https://ui.shadcn.com) · Tailwind CSS 4
- Dagre layout

## Run

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Graph lives in `src/data/atlas.json` (mirrored under `public/data/`). Every node/edge carries public sources. **No enrichment PII.**

| Layer | Count (current seed) |
|-------|----------------------|
| Entities | ~119 |
| Assumptions | 25 |
| Principles | 27 |
| Edges | 207 |

## Rails

1. Public sources only — click any node for URLs
2. Zero emails / phones / scraped contacts
3. Principles are quoted, not imagined
4. Assumptions are falsifiable and dated
5. This is an independent atlas — not an Anthropic/Claude product

## UI

- **Graph** — filter by kind / country / entity type; click node → sources panel
- **Timeline** — assumptions ordered by anchoring event
- **Mission** — one complete Mission Graph stress case (Motier): goal → milestones → rebuttals → evidence → operating theorem → intervention → metric, with worldview counterfactuals
- Selection dims non-neighbors so relationships stay readable

## Mission Graph (v0.2)

`public/data/mission-motier.json` is a self-contained stress case:

World model + objectives + interventions + decision policy — without letting intention corrupt belief.

Switch worldviews in the Mission tab: the same facts produce different selected recommendations.
