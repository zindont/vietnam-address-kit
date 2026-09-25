# Limitations

`vietnam-address-kit` is designed for deterministic migration workflows, but it cannot remove every data-quality risk.

## Data Limits

- The current dataset reconciles to official totals as of 2026-09-25, but legally critical workflows should still verify against official state sources.
- Pre-2025 ward names are covered only when the official reconciliation source names the successor unambiguously.
- Partial merges and province-ambiguous historical names are intentionally not guessed.

## Parsing Limits

- Free-text parsing reads from right to left. It also supports unit names separated only by spaces, but arbitrary concatenation with no word boundaries is not supported.
- OCR errors and severe typos may fail or return weak fuzzy matches.
- Missing province, district, or ward fields reduce confidence.

## Product Limits

- `confidence` is an engineering signal, not a legal guarantee.
- Candidate order is not a final decision.
- Production migrations should preserve audit fields and review low-confidence rows.
