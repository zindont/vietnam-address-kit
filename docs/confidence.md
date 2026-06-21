# Confidence And Strategies

`confidence` is a pragmatic score from `0` to `1`. It explains how strongly the toolkit trusts a conversion.

## Suggested Scores

- `old_ward_district_province_exact`: `0.98`
- `normalized_exact`: `0.93`
- `split_population`: `0.90` — an old ward was split, but the entire population moved to this successor (see [ADR-0002](adr/0002-population-determined-split-resolution.md))
- `no_diacritics`: `0.88`
- `abbreviation`: `0.85`
- `old_ward_province_exact`: `0.80`
- `fuzzy`: `0.65` to `0.78`
- `candidate_suggestion`: up to `0.70`
- `failed`: `0`

## Review Guidance

Treat low-confidence and candidate-only results as requiring human or upstream-system review. The library intentionally avoids forcing a single answer when input is ambiguous.
