# Ecosystem coverage — honest status

**Question:** Have we identified all the key people yet?  
**Answer:** **No — but FR + ES/IT/PT first comprehensive pass is in.** Orgs and theses are much denser; people coverage is now multi-country, not FR-only.

---

## Snapshot (after Exa Southern Europe pass · 2026-07-19)

| Layer | Count | Notes |
|---|---|---|
| Atlas nodes | ~221 | Entities + assumptions + principles |
| Atlas entities | ~157 | FR ~95 · ES ~28 · IT ~13 · PT ~12 |
| Atlas person entities | 25 | Was 13 — FR GPs + ES/IT/PT principals |
| Thesis assumptions | 37 | Fund theses encoded as falsifiable assumptions |
| INVESTED_IN edges | 25 | Portfolio links (was ~7) |
| Network people | ~35 | Activation layer |
| Network orgs | ~32 | Incl. Seaya, K Fund, Kibo, CDP, P101, Indico, Armilar… |
| Network targets | 18 | FR core + Eurazeo/Korelya + ES/IT/PT |

---

## Identified well enough (activation homework)

### France
- Motier — Essayan / Houzé (+ Lamolinerie hypothesized)
- Elaia — Frentz, Roux, Lazarus
- Kima — Jean de La Rochebrochard, Alexis Robert
- Partech — Romain Lavault
- Alven — Charles Letourneur
- Frst — Pierre Entremont
- Daphni — Sofia + MPs
- Starquest — Harold
- Serena — Xavier Lorphelin
- Station F — Roxanne Varza
- XAnge — Nicolas Rose
- ISAI — Nicolas Martineau (hypothesized title)
- **Eurazeo** — Thomas Turelier (MD VC)
- **Korelya** — Fleur Pellerin
- **Ring** — Nicolas Celier
- **Educapital** — Marie-Christine Levet

### Spain
- **Seaya** — Beatriz González
- **K Fund** — Miguel Arias
- **Kibo** — Javier Torremocha
- **Samaipata** — José del Barrio
- Orgs also: Wayra, Conector, Nauta (+ portfolio Clarity AI, Tucuvi, Genesy…)

### Italy
- **CDP Venture Capital** — Cristina Bini (+ ~€1B AI programme thesis)
- **P101** — Andrea Di Camillo (Programma 103)
- Primo Capital org in atlas (partner bench still thin)

### Portugal
- **Indico** — Cristina Fonseca, Stephan Morais
- Armilar org + Feedzai adjacency; Faber / Portugal Ventures orgs present
- Hub: Unicorn Factory Lisboa

---

## Still missing / thin

- **Raise** — no confirmed named Ventures partner in this pass (Exa returned empty)
- **Armilar / Faber / Portugal Ventures** — fund entities + theses exist; named GPs incomplete
- **Primo Capital / United Ventures** — Italy private bench incomplete
- **Nauta** — org + Neurolabs edge; partner names not locked
- Second partners at Seaya / Kibo / CDP programme operators
- Portfolio founders as mobilisation targets (Dust/Mistral L1s exist privately but aren’t activation *targets*)
- Per-target Shared-connection verification still required for interview-grade L2 claims

---

## Thesis-as-assumption pattern

Fund theses are stored as `assumption:*` nodes with `BETS_ON` → fund entity. Examples:
- `assumption:seaya-ai-deeptech-growth`
- `assumption:cdp-ai-fund-1b`
- `assumption:indico-fund-iii-ai`
- `assumption:motier-ai-portfolio-density`

Resolve-by dates are end-2026 unless anchored to a multi-year plan (CDP 2024–28).

---

## Proximity presentation (product rule)

1. **Output** — stakeholder + thesis + public org ties + proximity badge. Never name vouchers.
2. **Method** — Exa ID → Connections.csv → Shared connections → private overlay → public Output.
3. **Claimed L2** — label as `claimed` until path-verified. Honesty > false completeness.

---

## How to re-run enrichment

```bash
bun run atlas:enrich-southern-europe
```

Script is idempotent (skips existing ids). Research source: Composio Exa (`EXA_ANSWER`) session on 2026-07-19. Brave toolkit was not available in Composio for this pass.

---

## Definition of “done” for people ID

For each priority fund/hub in FR (+ ES/IT/PT):

- [x] ≥1 confirmed human with public role + source (most priority funds)
- [ ] Preference: programme/platform owner OR AI partner who can mobilise founders (partial)
- [x] Org↔person edge sourced (atlas MEMBER_OF / network PARTNER_AT)
- [ ] Proximity declared or path-verified per target (voucher private) — **open**
