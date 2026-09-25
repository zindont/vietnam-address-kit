# Data Sources

The repository bundles the current national two-level dataset in `src/data/official/*.json`, generated from the 2025 official conversion table and dated amendments through 2026-09-25.

## Source Of Truth

The dataset is built from two official files in `data/source/`:

- `conversion-table.xlsx` — the official old/new administrative-unit conversion table for the 2025 baseline.
- `doi-chieu-2024-09-01.xls` — the commune-level reconciliation table from 2024-09-01 to 2025-07-01, used for `formerNames`.
- `current-amendments-2026.json` — post-2025 province and ward type changes transcribed from the Cục Thống kê [comparison table](https://danhmuchanhchinh.nso.gov.vn/Doi_Chieu_Moi.aspx) and [resolution list](https://danhmuchanhchinh.nso.gov.vn/NghiDinh.aspx). The baseline conversion spreadsheet on the portal remains byte-identical to the bundled 2025 file, so these changes must be applied separately.

These sources derive from:

- `Quyết định 19/2025/QĐ-TTg` for administrative unit codes from 2025-07-01.
- National Assembly Standing Committee resolutions (`Nghị quyết của Ủy ban Thường vụ Quốc hội`) for commune-level rearrangements.
- General Statistics Office (`Tổng cục Thống kê`) reconciliation data at `danhmuchanhchinh.nso.gov.vn`.
- 2026 resolutions `30/2026/QH16`, `36/2026/QH16`, `39/2026/QH16`, `237/NQ-UBTVQH16`, and `388/NQ-UBTVQH16` for three province-to-city changes and 22 commune-to-ward changes.

See [ADR-0001](../adr/0001-official-conversion-table-as-single-source-of-truth.md) for the source-of-truth decision.

## Coverage

| File | Records |
|---|---:|
| `current-provinces.json` | 34 (9 cities, 25 provinces) |
| `current-wards.json` | 3,321 (710 wards, 2,598 communes, 13 special zones) |
| `legacy-provinces.json` | 63 |
| `legacy-districts.json` | 698 |
| `legacy-wards.json` | 10,033 |
| `mappings.json` | 10,571 edges |

## Regeneration

```bash
pip install openpyxl xlrd
npm run build:data
```

The build script validates official totals and referential integrity. Runtime code reads only generated JSON.

## Legal Caution

The dataset reconciles to official totals, but legally critical workflows should re-check records against official state sources and keep verification notes.
