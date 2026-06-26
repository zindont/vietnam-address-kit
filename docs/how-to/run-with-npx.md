# Run Quick Tasks With npx

Use `npx` when you want to run `vietnam-address-kit` without installing it globally or adding it to a project.

## Print Version

```bash
npx vietnam-address-kit@latest version
```

## Convert One Address

```bash
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa"
```

For machine-readable output:

```bash
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
```

For readable terminal JSON:

```bash
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
```

## Search

```bash
npx vietnam-address-kit@latest search province "khanh hoa"
npx vietnam-address-kit@latest search ward "loc tho" --province 56
```

## Migrate CSV

```bash
npx vietnam-address-kit@latest migrate customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

## Use The Short Binary Name

The package exposes `vietnam-address-kit` and `vn-address` binaries. With `npx`, use `--package` when you want the short name:

```bash
npx --package vietnam-address-kit@latest vn-address version
```
