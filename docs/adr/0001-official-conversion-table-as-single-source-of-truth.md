# Official conversion table is the single source of truth for the dataset

The 2025 reform's hard artifact is the **old→new ward mapping**; it exists cleanly only in
the official conversion table `BangChuyendoiĐVHCmoi_cu_final.xlsx` (sheet `Tổng hợp_không merge`,
the flat one-row-per-edge variant derived from QĐ 19/2025/QĐ-TTg + 34 Nghị quyết UBTVQH).
We build **all six** dataset files (`current-*`, `legacy-*`, `mappings`) from this one file rather
than stitching together community APIs (provinces.open-api.vn, ThangLeQuoc DB, addresskit.cas.so).

## Considered options

- **Derived community sources as the mapping origin** — structured and ready, but not legally
  authoritative and we'd inherit their errors. Demoted to a *cross-check only* role (see ADR-0003 gate).
- **Parse the 34 UBTVQH resolutions directly** — maximally authoritative but unstructured prose;
  error-prone and not reproducibly automatable.
- **Algorithmic inference from two catalogs** — rejected outright: it would *guess* a single answer,
  contradicting the library's deterministic/auditable contract.

## Consequences

- Codes follow the official bare GSO scheme verbatim: province `NN`, old district `NNN`,
  old/new ward `NNNNN` (string, leading zeros preserved). Old- and new-ward code spaces overlap
  numerically but never collide because mappings always carry direction. This is a breaking change
  vs the fabricated sample codes (`56001`), which were never production-correct.
- The source `.xlsx`, the build script, and the generated JSON are all committed (ADR via build
  pipeline); runtime only ever reads the JSON, keeping the core dependency-free.
