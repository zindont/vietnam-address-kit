import type { MatchStrategy } from "../types/result";

const BASE_SCORES: Record<MatchStrategy, number> = {
  old_ward_district_province_exact: 0.98,
  old_ward_province_exact: 0.8,
  former_ward: 0.92,
  split_population: 0.9,
  normalized_exact: 0.93,
  no_diacritics: 0.88,
  abbreviation: 0.85,
  fuzzy: 0.7,
  candidate_suggestion: 0.55,
  failed: 0
};

export function calculateConfidence(strategy: MatchStrategy, candidateCount = 1): number {
  const base = BASE_SCORES[strategy];
  if (candidateCount > 1) return Math.min(0.7, base);
  return Math.max(0, Math.min(1, base));
}
