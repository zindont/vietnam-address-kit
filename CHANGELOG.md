# Changelog

## 1.1.0 - 2026-06-21

### Added

- Added the official 2025 current dataset: 34 provinces/cities and 3,321 wards/communes/special zones.
- Added legacy administrative data: 63 legacy provinces, 698 legacy districts, 10,033 legacy wards, and 10,571 mapping edges.
- Added `build:data` pipeline backed by official source files in `data/source/`.
- Added `formerNames` support for deterministic pre-2025 ward names from the 2023–2024 rearrangement rounds.
- Added `split_population` handling for official split cases where the entire population moved to one successor ward.
- Added ADRs documenting the data source-of-truth decision, split-population rule, and former-name model.
- Added Diátaxis-based documentation structure with tutorials, how-to guides, reference docs, explanations, and Vietnamese user-facing docs.

### Changed

- Replaced the development sample dataset with the official 2025 two-level Vietnam administrative dataset.
- Switched dataset codes to the official bare GSO code scheme: province `NN`, legacy district `NNN`, and ward `NNNNN` as strings with leading zeroes preserved.
- Updated conversion behavior to return deterministic official mappings where possible and candidate suggestions when the source data remains ambiguous.
- Updated data source documentation to describe official GSO conversion and reconciliation files.
- Improved package build output to keep the published bundle compact while still bundling official runtime data.

### Verified

- Dataset reconciles to the official 2025 totals used by the build pipeline.
- `npm run release:check` passes with typecheck, tests, build, audit, and package dry-run.

## 1.0.0 - 2026-06-20

- Published the first stable open-source release of `vn-address-kit`.
- Added TypeScript APIs for data lookup, normalization, search, validation, conversion, parsing, and batch conversion.
- Added the `vn-address` CLI with `version`, `convert`, `search`, and `migrate` commands.
- Added sample data for Khánh Hòa, Hà Nội, and TP. Hồ Chí Minh for tests and examples.
- Added documentation, examples, tests, release checklist, and open-source community files.
- Added zero-vulnerability dependency baseline with Node.js 18+ compatible dev tooling.
