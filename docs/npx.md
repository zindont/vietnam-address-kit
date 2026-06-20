# Run With npx

`vn-address-kit` exposes a package-name binary so users can run quick address tasks without installing the package globally.

## From npm Registry

After the package is published to npm:

```bash
npx vn-address-kit@latest version
npx vn-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
npx vn-address-kit@latest search province "khanh hoa"
npx vn-address-kit@latest search ward "loc tho" --province 56
```

You can also use the shorter CLI binary name through `--package`:

```bash
npx --package vn-address-kit@latest vn-address version
npx --package vn-address-kit@latest vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --pretty --json
```

## From GitHub Before npm Publish

If the package is not published to npm yet, run it directly from GitHub:

```bash
npx github:zindont/vn-address-kit version
npx github:zindont/vn-address-kit convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
```

GitHub execution clones the repository and runs the package `prepare` script, so it can be slower than npm registry execution.

## Quick CSV Migration

```bash
npx vn-address-kit@latest migrate customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

## Notes

- `npx` still downloads a temporary package cache; it does not install the package globally or add it to your project.
- The bundled dataset is sample-only. Replace it with verified administrative data before production use.
- Use `--json` for scripting and automation.
