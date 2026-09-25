# Changelog

## 1.2.1 - 2026-09-25

### Fixed

- Infer an omitted province when the trailing legacy district and ward form a unique pair. For example, `58 doan tran nghiep vinh phuoc nha trang` now resolves to Vĩnh Phước, Nha Trang, Khánh Hòa, preserving `58 doan tran nghiep` as the street address.
- Add an inference warning and cap confidence at `0.8` (`0.7` if a name also needs spelling correction). Do not infer a province from a district alone or from ambiguous district/ward pairs.
- Expose `inferredProvince` on `ParsedAddress` so callers can distinguish inferred input from explicit province input.

## 1.2.0 - 2026-09-25

### Added

- Detect legacy province, district, and ward names in free-text addresses even when administrative units are separated only by spaces. Prefixes such as `P.` and `TP.` are optional; comma-separated input continues to work.
- Recover small spelling errors in structured and free-text administrative names. Matching remains conservative: ambiguous names do not force a single result.
- Expose `approximate` on `ParsedAddress` when a separator-free parse uses a spelling correction.

### Changed

- Mark approximate conversions with a warning and the `fuzzy` strategy, with confidence capped at `0.7`.
- Recognize abbreviations directly attached to names, such as `P.Vinh Hoa` and `TP.Nha Trang`. Fixed prefix normalization so place names beginning with `Q`, such as Quảng Ninh, are not misread as `Quận`.
- Avoid interpreting a bare street name after a house number as a ward when parsing text without commas.
- Updated English and Vietnamese usage examples and the API, conversion, data-source, and verification guides.
- Updated Vitest to 4.1.11 and refreshed transitive build/test dependencies to resolve npm audit findings. CI runs tests on Node.js 20 and 22 and separately verifies the published runtime on Node.js 18.

### Data

- Updated the current administrative catalog through 2026-09-25: Đồng Nai (`75`), Quảng Ninh (`22`), and Bắc Ninh (`24`) are centrally governed cities under resolutions `30/2026/QH16`, `36/2026/QH16`, and `39/2026/QH16`.
- Reclassified 10 communes in Đồng Nai and 12 in Bắc Ninh as wards under resolutions `237/NQ-UBTVQH16` and `388/NQ-UBTVQH16`. Their codes and province assignments are unchanged.
- Added `data/source/current-amendments-2026.json` to the data build because the official 2025 conversion workbook has not incorporated the 2026 amendments. The 2025 legacy data and 10,571 mapping edges are unchanged.
- Advanced `getDataVersion()` to `official-2026.09.25`. Totals remain 34 province-level units and 3,321 commune-level units: 9 cities, 25 provinces, 710 wards, 2,598 communes, and 13 special zones.

## 1.1.1 - 2026-06-26

### Fixed

- Fixed the CLI `--version` output so it uses `package.json` instead of a hardcoded version.

### Changed

- Renamed the npm package to `vietnam-address-kit` for better npm and Google discoverability.
- Added the `vietnam-address-kit` CLI binary while keeping the short `vn-address` alias.
- Added npm-focused package keywords for address parsing, conversion, administrative units, CSV migration, and the 2025 reform.
- Added direct public links to npm, GitHub, and the browser playground in both English and Vietnamese READMEs.

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

- Published the first stable open-source release.
- Added TypeScript APIs for data lookup, normalization, search, validation, conversion, parsing, and batch conversion.
- Added the `vn-address` CLI with `version`, `convert`, `search`, and `migrate` commands.
- Added sample data for Khánh Hòa, Hà Nội, and TP. Hồ Chí Minh for tests and examples.
- Added documentation, examples, tests, release checklist, and open-source community files.
- Added zero-vulnerability dependency baseline with Node.js 18+ compatible dev tooling.
