# vietnam-address-kit

[![npm version](https://img.shields.io/npm/v/vietnam-address-kit.svg)](https://www.npmjs.com/package/vietnam-address-kit) [![CI](https://github.com/zindont/vietnam-address-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/zindont/vietnam-address-kit/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Vietnam address migration toolkit for the 2025 two-level administrative reform.

**Languages:** English | [Tiếng Việt](README.vi.md)

`vietnam-address-kit` is a TypeScript-first toolkit for normalizing, searching, validating, converting, and migrating Vietnamese administrative addresses from the legacy three-level model to the 2025 two-level model.

## What It Solves

Many systems still store addresses as `street, ward, district, province`, while the newer model removes the district level. This package provides deterministic APIs and CLI tools for migration workflows with confidence scoring, warnings, strategies, and candidates for audit.

## Release Status

`vietnam-address-kit` is published as a stable open-source package with a documented API, CLI, tests, release checklist, and community files. It bundles the official 2025 two-level administrative dataset: 34 provinces and 3,321 wards. The dataset is generated from the national conversion table under Quyết định 19/2025/QĐ-TTg and reconciled to official totals.

## Public Links

- NPM package: [https://www.npmjs.com/package/vietnam-address-kit](https://www.npmjs.com/package/vietnam-address-kit)
- Browser playground: [https://zindont.github.io/vietnam-address-kit/](https://zindont.github.io/vietnam-address-kit/)
- GitHub repository: [https://github.com/zindont/vietnam-address-kit](https://github.com/zindont/vietnam-address-kit)

## Installation

```bash
npm install vietnam-address-kit
```

For local development:

```bash
npm install
npm run release:check
```

## Quick Start

```ts
import { convertAddressText } from "vietnam-address-kit";

const result = convertAddressText("123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa");
console.log(result.newAddress, result.confidence);
```

## Run Without Installing

Use `npx` for quick one-off tasks without adding the package to a project:

```bash
npx vietnam-address-kit@latest version
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
npx vietnam-address-kit@latest search province "khanh hoa"
```

## Browser Playground

Try the toolkit in your browser: [vietnam-address-kit Playground](https://zindont.github.io/vietnam-address-kit/).

## Convert Address Text

```ts
import { convertAddressText } from "vietnam-address-kit";

convertAddressText("123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa");
```

## Convert Structured Address

```ts
import { convertOldToNew } from "vietnam-address-kit";

convertOldToNew({
  province: "Khánh Hòa",
  district: "Nha Trang",
  ward: "Lộc Thọ",
  streetAddress: "123 Lê Lợi"
});
```

## Search Province And Ward

```ts
import { searchProvince, searchWard } from "vietnam-address-kit";

searchProvince("khanh hoa");
searchWard("loc tho", { provinceCode: "56" });
```

## Validate Hierarchy

```ts
import { validateHierarchy } from "vietnam-address-kit";

validateHierarchy({ provinceCode: "56", wardCode: "56001" });
```

## Batch Migration CLI

```bash
vn-address migrate examples/migrate-customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

Other CLI commands:

```bash
vn-address version
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
vn-address search province "khanh hoa"
vn-address search ward "loc tho" --province 56
```

## Confidence Score

Results include `confidence` from `0` to `1`, a `strategy`, `warnings`, and `candidates`. High confidence means an exact or deterministic mapping; lower confidence means fuzzy or candidate-only output that should be reviewed.

## Data Source

The bundled dataset in `src/data/official/*.json` is generated from official national conversion files under Quyết định 19/2025/QĐ-TTg, National Assembly Standing Committee resolutions, and General Statistics Office reconciliation tables. Regenerate it with `npm run build:data`. For legally critical use, re-verify against `danhmuchanhchinh.nso.gov.vn`. See [Data Sources](docs/explanation/data-sources.md).

## Documentation

- [Documentation Index](docs/README.md)
- [Getting Started](docs/tutorials/getting-started.md)
- [How-To: Migrate a CSV File](docs/how-to/migrate-csv.md)
- [Reference: API](docs/reference/api.md)
- [Reference: CLI](docs/reference/cli.md)
- [Explanation: Confidence And Strategies](docs/explanation/confidence.md)
- [Explanation: Data Sources](docs/explanation/data-sources.md)
- [Documentation Language Policy](docs/language-policy.md)

## Open Source Standards

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Release Process](RELEASE.md)

## Limitations

- The dataset reconciles to official 2025 totals, but legally critical workflows should still verify against official state sources.
- Free-text parsing is practical but not exhaustive.
- Ambiguous or low-confidence results are not forced into a single answer.
- OCR errors, incomplete addresses, and historical edge cases may require manual review.

## Roadmap

- Expand data quality checks and reproducible source validation.
- Improve OCR typo handling and benchmark coverage.
- Add richer JSON and Excel migration helpers.
- Publish a browser playground.
- Add more localized documentation when the API stabilizes further.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Data changes should include source documentation, validation notes, and changelog entries.

## License

MIT
