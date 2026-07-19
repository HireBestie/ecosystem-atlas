# Network activation protocol

**Purpose:** Build evidence you can activate VCs/actors from *your* network — warm intros at LinkedIn L1 or strong L2 — without Anthropic brand.

**Artifact:** Network tab in Ecosystem Atlas + `public/data/network-bridges.json` (public seed) + optional gitignored private overlay.

---

## 0. Tooling split (Composio LinkedIn + Exa)

| Job | Tool | Why |
|---|---|---|
| **Identify stakeholders + theses + org relationships** | **Exa** via Composio (`EXA_*`) or `COMPOSIO_SEARCH_WEB` (Exa-backed) + official team pages | Public web evidence with citations |
| **Confirm your ego identity** | Composio **LinkedIn** `LINKEDIN_GET_MY_INFO` | OAuth identity only |
| **Measure proximity (L1)** | **LinkedIn Connections.csv export** → `bun run network:import-connections` | LinkedIn’s API (and Composio’s LinkedIn toolkit) **cannot** list connections or mutuals |
| **Measure proximity (L2 / shared)** | Manual: open target → Shared connections → add `CAN_INTRO` in private overlay | No API for mutuals without a sales/outreach product (e.g. HeyReach) |

**Do not expect** Composio LinkedIn to give you a social graph. Its tools are mostly post/profile/ads — not network mapping.

### Auth (Cursor / Composio)

1. Connect **Exa** when prompted (API key in Composio UI).
2. Connect **LinkedIn** (done if `LINKEDIN_GET_MY_INFO` returns your profile).
3. Export Connections: LinkedIn → Settings → Data privacy → Get a copy → **Connections** → save as `data/private/Connections.csv`.
4. Run: `bun run network:import-connections` → writes gitignored `public/data/network-bridges.private.json`.

---

## 1. What “done” looks like for interview evidence

You can show, for each priority fund/hub:

| Layer | Receipt |
|---|---|
| **Identify** | Named human (not “someone at Elaia”), public role, LinkedIn URL, one-sentence thesis |
| **Relate** | How they sit vs other actors (partner / campus / co-invest / programme owner) — sourced |
| **Bridge** | Path: **You → L1 (strong) → Target** or **You → Target** (L1). Prefer strong L2 only if the bridge will actually intro |
| **Ask** | Specific activation ask + kill criteria (when to stop) |

Empty paths and TBD names are **features** until filled. Do not invent bridges for the demo.

---

## 2. Identification pass (Exa / web research)

For each target with status `needs_research` or `hypothesized`:

1. Run Exa / Composio web search: `{fund} team partners AI France`.
2. Prefer **programme / platform / community owner** over a random GP for activation asks; use Partner with AI expertise when the ask is technical portfolio.
3. Confirm on official team page (`elaia.com/team`, `frst.vc`, TechCrunch, etc.).
4. Update `network-bridges.json` — flip to `confirmed` only with a source URL. Never store emails/phones.
5. If you cannot name a human in one focused hour: leave TBD and deprioritise that fund.

**Current named wave (v0.3):** Sofia Dahoune / Harold Dumeurger / Thomas Friang (**your L1 bridges**) → Nicolas Essayan (Motier) → Alexis Frentz (Elaia, L2 via Sofia) → Jean dLR (Kima) → Roxanne → Lavault → Lorphelin (Serena) → Alven / Frst / XAnge.

Atlas gap fixed partially: person entities **3 → 13** + Starquest fund added. Network people layer: **23 people / 16 orgs**.

---

## 3. LinkedIn proximity (CSV + shared connections)

### Rules

- **L1 only** counts as a usable bridge if tie strength is `strong` or `warm` (worked together, repeated contact, shared community with real trust). Weak “connected once” does not count.
- **L2** is usable only if: you have a strong L1 who is **strong L1 with the target**, and you believe they will intro.
- **Do not ask your bridges to invent your graph.** You already have density (Sofia, Harold, Thomas, Pierre Hébrard, Elsa Sammari, Pénélope Liot, …). The job is to **map which of your L1s already reach which targets** (Shared connections), then ask for a specific intro.
- **Anthropic brand is out of scope** for this exercise. Script as yourself / Bestie / operator.

### Procedure

1. Export Connections.csv → `data/private/Connections.csv`.
2. `bun run network:import-connections` — fills bridge slots from org-keyword L1s; flags direct L1 hits to targets.
3. For each priority **target**, open LinkedIn → **Shared connections** with that person.
4. Add `CAN_INTRO` edges in `network-bridges.private.json` from your L1 bridge → target (`strength: strong|warm`, honest `basis`).
5. Re-open Network tab — paths should flip from “no path” / “L2 weak” to real L1/L2.

### Private overlay (do not commit PII)

- Output of the importer is gitignored: `public/data/network-bridges.private.json`
- Example shape: `public/data/network-bridges.private.example.json`

---

## 4. Warm intro rails (no brand leverage)

**To your L1 (bridge):**

> I’m mapping who actually owns portfolio/founder programmes at [Fund]. I’d like a short intro to [Name] — not a pitch for a job via Anthropic, just an operator conversation: how they mobilise technical founders, and whether a small evaluation workshop would be useful. Happy to send a 3-line blurb you can forward.

**Forwardable blurb:**

> [Your name] builds technical products and partnership ops. He’s doing structured homework on FR AI ecosystem activation (public map + operating cases) and wants a short call with [Name] on how [Fund] convenes technical founders — no product pitch, no brand ask.

**Kill if:**

- Intro becomes “can you get me in front of Anthropic”
- Target only offers logo/visibility
- Bridge is uncomfortable → respect and stop

---

## 5. Scoreboard to track weekly

| Metric | Week 0 (seed) | After Exa ID pass | After Connections import |
|---|---|---|---|
| Targets with confirmed/hypothesized human | ~2–3 | ≥6 of 7 | same |
| Targets with strong L1/L2 path | 0 | 0 until CSV + shared | ≥3 |
| Conversations booked | 0 | 0 | ≥2 |

---

## 6. Rails

- Public sources only in committed JSON
- No emails, phones, scraped contact dumps
- Do not present this as Anthropic/Claude official
- Honest “no path” > fake completeness
- Composio LinkedIn ≠ social graph; Connections.csv is the proximity source of truth
