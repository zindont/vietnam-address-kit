# Former ward names cover the pre-2025 reform rounds

Vietnam ran **two** reforms close together: an intra-province commune rearrangement in
2023–2024 (e.g. Nha Trang's NQ 1196, effective 2024-11-01, merged Phước Tiến + Phước Tân +
Tân Lập into Tân Tiến) and then the 2025 two-level reform (Tân Tiến → new ward "Nha Trang").
The primary dataset baselines at the state immediately before 2025, so a stored address using a
name retired in the earlier round ("Phước Tiến") could not resolve.

We model these predecessors as an optional **`formerNames`** array on the surviving `LegacyWard`
(design ① from a "design it twice" exploration — chosen over a separate redirect table, a full
temporal-lineage graph, and synthetic-code rows). Each former name carries `name`,
`normalizedName`, and optional `code`/`decree` for audit. The engine matches former names in
`findBest` (prefix-tolerant) and reports `strategy: "former_ward"` (confidence 0.92) with a
warning naming the retired ward.

## Considered options

- **Redirect/alias table** (`former-wards.json`) — clean separation, but invisible to the `search/`
  module and adds a per-call indirection; rejected because `formerNames` on the ward gives search
  the data for free and the dataset is regenerated wholesale (no hand-maintenance drift).
- **Full temporal lineage graph** — handles N reforms + as-of queries, but over-engineered for a
  2-hop chain and makes determinism depend on per-edge metadata rather than structure.
- **Reuse pipeline with synthetic codes** (`P22366`) — zero engine change, but leaks synthetic
  codes into results and pollutes `getWardByCode`/search with phantom wards.

## Consequences

- Source: `data/source/doi-chieu-2024-09-01.xls` (official GSO đối chiếu, base date 2024-09-01 →
  2025-07-01), ingested by `build:data`. Only **deterministic** predecessors are attached: those
  whose successor is named unambiguously (direct code survival, "Thành lập Y…", or "…vào phường X"
  for a whole merge), disambiguated by unit type (phường vs xã). Partial/area merges and
  province-ambiguous names are skipped, never guessed.
- Determinism gate: a former name is dropped only if, within the same (province, successor-district),
  it spans >1 survivor **and** those survivors resolve to >1 distinct 2025 new ward. The same name in
  different districts (HCMC "Phường 7") is disambiguated by the engine's district filter at query
  time; variants that all land on one new ward (thị trấn + xã "Mađaguôi" → "Đạ Huoai") are kept.
- The retired tail (notes without a clear single destination) stays unconvertible and falls back to
  province-level candidates — consistent with the "never guess when ambiguous" contract.
- Side effect: `clean()` now NFC-normalizes source text, fixing mixed NFC/NFD prefixes (e.g.
  "phường" with a combining grave) so legacy names are clean ("Tân Tiến", not "phường Tân Tiến").
