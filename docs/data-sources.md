# Data Sources

The repository bundles the **official national dataset** for the 2025 two-level reform in
`src/data/official/*.json`, generated from the authoritative conversion table.

## Source of truth

The dataset is built from two official GSO files in `data/source/`:

- `conversion-table.xlsx` — "Bảng chuyển đổi ĐVHC mới/cũ", the 2025 baseline (legacy + current + mappings).
- `doi-chieu-2024-09-01.xls` — đối chiếu cấp Xã 01/09/2024 → 01/07/2025, the source of `formerNames`
  (pre-2025 ward names from the 2023–2024 rounds, e.g. "Phước Tiến" → "Tân Tiến" → "Nha Trang").

Both derive from:

- **Quyết định 19/2025/QĐ-TTg** — list and codes of Vietnamese administrative units from 01/07/2025.
- **Nghị quyết của Ủy ban Thường vụ Quốc hội** on the rearrangement of commune-level units (2023–2025).
- **Tổng cục Thống kê** — `danhmuchanhchinh.nso.gov.vn` (Đối Chiếu Đơn Vị Hành Chính).

See [ADR-0001](adr/0001-official-conversion-table-as-single-source-of-truth.md) for why this single
table is the source of truth rather than community APIs (which are used only for cross-checking).

## Coverage (reconciled against official totals)

| File | Records |
|---|---|
| `current-provinces.json` | 34 |
| `current-wards.json` | 3,321 (691 phường, 2,617 xã, 13 đặc khu) |
| `legacy-provinces.json` | 63 |
| `legacy-districts.json` | 698 |
| `legacy-wards.json` | 10,033 |
| `mappings.json` | 10,571 edges |

Codes follow the official bare GSO scheme: province `NN` (2 digits), legacy district `NNN`
(3 digits), legacy/new ward `NNNNN` (5 digits), stored as strings with leading zeros preserved.

## Regenerating the dataset

The dataset is produced by a dev-only script (Python, not a runtime dependency):

```bash
pip install openpyxl xlrd
npm run build:data    # parses data/source/*.{xlsx,xls} → src/data/official/*.json
```

The script enforces a validation gate (34 provinces, referential integrity, official total
reconciliation) and fails the build on violations. Only the generated JSON is read at runtime,
so the library core stays dependency-free. To update for a future reform, replace the source
xlsx and re-run `build:data`; the JSON diff is the review surface.

## Mapping shape

Each mapping record carries old unit codes, new unit codes, a `type`, and an optional note.
See [confidence.md](confidence.md) for how `type` (including `split_population`) maps to outcomes.

## Guarantees

The dataset reconciles to official totals, but users should still verify low-confidence and
candidate-only results before production use; see [limitations.md](limitations.md).
