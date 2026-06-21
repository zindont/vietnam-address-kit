# Population-determined splits resolve deterministically

When an old ward is **split** across multiple new wards (the "Nhập một phần" cases, 441 of them),
the conversion is normally `ambiguous` — we return all candidates rather than guess. But 58 of those
splits carry the official note **"Nhập một phần diện tích, toàn bộ dân số"**: the *entire population*
goes to one specific new ward, only land/area is redistributed. Because an address is a *residence*
(it tracks population, not empty land), we resolve these to the population-target ward with high
confidence (`success`) plus a `warning` listing the area-only siblings for audit.

## Consequences

- This is **official data, not a guess**, so it stays within the deterministic/auditable contract.
- Requires an engine rule in `convertOldToNew`: when exactly one candidate edge is the
  population-full target, pick it instead of collecting all edges as candidates.
- Adds a `MatchStrategy` / `MappingType` `split_population` with its own base score in
  `confidence.ts` (`src/types/result.ts`). Area-only splits remain `ambiguous` (confidence capped at 0.7).
