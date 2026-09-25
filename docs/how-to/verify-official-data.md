# Verify Official Data

Use this guide when you are reviewing a data update or preparing a legally sensitive migration.

## Check The Data Version

```ts
import { getDataVersion } from "vietnam-address-kit";

console.log(getDataVersion());
```

The current official dataset should report `sample: false` and `official-2026.09.25`. This is an as-of date for the current catalog; the old-to-new mapping still describes the 2025 reform.

## Regenerate The Dataset

Install Python spreadsheet dependencies, then run the build script:

```bash
pip install openpyxl xlrd
npm run build:data
```

The script reads the 2025 conversion and former-name files plus the dated 2026 amendments in `data/source/`, then writes generated JSON to `src/data/official/`.

## Review Generated Diffs

After regeneration:

```bash
git diff -- src/data/official docs/explanation/data-sources.md src/data/version.ts
npm run release:check
```

Review:

- Record counts.
- Referential integrity.
- New mapping types.
- New warnings or confidence strategies.
- Source notes and legal references.

## Compare Against Official Sources

For legally critical workflows, compare the generated output against `danhmuchanhchinh.nso.gov.vn` and the relevant legal documents. Keep the verification notes in the pull request or release notes.
