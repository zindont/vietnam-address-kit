# vn-address-kit

[![npm version](https://img.shields.io/npm/v/vn-address-kit.svg)](https://www.npmjs.com/package/vn-address-kit) [![CI](https://github.com/zindont/vn-address-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/zindont/vn-address-kit/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Vietnam address migration toolkit for the 2025 two-level administrative reform.

`vn-address-kit` là toolkit TypeScript-first giúp developer Việt Nam chuẩn hóa, tìm kiếm, validate và migrate địa chỉ hành chính từ mô hình cũ 3 cấp sang mô hình mới 2 cấp.

## What It Solves

Many systems still store addresses as `street, ward, district, province`, while the newer model removes the district level. This package provides deterministic APIs and CLI tools for migration workflows with confidence scoring, warnings, strategies, and candidates for audit.

## Release Status

`vn-address-kit` is published as a stable open-source package with a documented API, CLI, tests, release checklist, and community files. The bundled dataset is intentionally small and sample-only until verified official administrative data is imported.

## Installation

```bash
npm install vn-address-kit
```

For local development:

```bash
npm install
npm run release:check
```

## Quick Start

```ts
import { convertAddressText } from "vn-address-kit";

const result = convertAddressText("123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa");
console.log(result.newAddress, result.confidence);
```

## Run Without Installing

Use `npx` for quick one-off tasks without adding the package to a project:

```bash
npx vn-address-kit@latest version
npx vn-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
npx vn-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
npx vn-address-kit@latest search province "khanh hoa"
```

Before the npm package is published, you can run from GitHub:

```bash
npx github:zindont/vn-address-kit version
npx github:zindont/vn-address-kit convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
npx github:zindont/vn-address-kit convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
```

## Convert Address Text

```ts
import { convertAddressText } from "vn-address-kit";

convertAddressText("123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa");
```

## Convert Structured Address

```ts
import { convertOldToNew } from "vn-address-kit";

convertOldToNew({
  province: "Khánh Hòa",
  district: "Nha Trang",
  ward: "Lộc Thọ",
  streetAddress: "123 Lê Lợi"
});
```

## Search Province And Ward

```ts
import { searchProvince, searchWard } from "vn-address-kit";

searchProvince("khanh hoa");
searchWard("loc tho", { provinceCode: "56" });
```

## Validate Hierarchy

```ts
import { validateHierarchy } from "vn-address-kit";

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

Results include `confidence` from `0` to `1`, a `strategy`, `warnings`, and `candidates`. High confidence means exact or normalized mapping; lower confidence means fuzzy/candidate-only output that should be reviewed.

## Data Source Warning

This project starts with sample data for development. Do not use the sample dataset in production. Replace it with verified administrative data and mapping rules before production use.

The initial repository uses sample data for development. Replace `src/data/sample/*.json` with verified official data before production use.

## Open Source Standards

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Release Process](RELEASE.md)

## Documentation

- [API Reference](docs/api.md)
- [CLI Usage](docs/cli.md)
- [Run With npx](docs/npx.md)
- [Data Sources](docs/data-sources.md)
- [Confidence Strategy](docs/confidence.md)
- [Limitations](docs/limitations.md)

## Limitations

- Sample data covers only a few Khánh Hòa, Hà Nội, and TP. Hồ Chí Minh examples.
- Free-text parsing is practical but not exhaustive.
- Ambiguous or low-confidence results are not forced into a single answer.
- This package does not guarantee legal correctness until verified official data is imported.

## Roadmap

- Import verified official administrative datasets.
- Add richer mapping types for merge/split cases.
- Improve OCR typo handling and benchmarks.
- Add Excel and JSON migration helpers.
- Publish a browser playground.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Official data imports should include source documentation and changelog entries.

## License

MIT
