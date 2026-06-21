# Limitations

- The bundled dataset is the official 2025 two-level dataset (reconciled to 34 provinces / 3,321 wards), but should still be re-verified against `danhmuchanhchinh.nso.gov.vn` for legally critical use.
- **Pre-2025 ward names** (retired in the 2023–2024 intra-province merges, e.g. Nha Trang's "Phước Tiến" → "Tân Tiến" per NQ 1196) are covered via `formerNames` and resolve with `strategy: "former_ward"` — **but only where the official đối chiếu names the successor unambiguously**. Names whose source note does not point to a single successor (partial/area merges, province-ambiguous names) are intentionally not mapped (the kit never guesses) and fall back to province-level candidates; use the current ward name there.
- Ambiguous ward names can return multiple candidates instead of a forced match.
- Missing district or ward fields reduce confidence.
- OCR errors and severe typos may fail or return weak fuzzy matches.
- The parser assumes comma-separated address text and reads province/district/ward from right to left.
- The package does not guarantee legal correctness without verified official data.

Users should verify low-confidence results and all migrations before production use.
