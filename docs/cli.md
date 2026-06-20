# CLI

Build first when running from source:

```bash
npm run build
```

## Version

```bash
vn-address version
node dist/cli/index.js version
npx vn-address-kit@latest version
```

Prints package and data version.

## Convert

```bash
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa"
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
npx vn-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
npx vn-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
```

## Search

```bash
vn-address search province "khanh hoa"
vn-address search ward "loc tho"
vn-address search ward "loc tho" --province 56
npx vn-address-kit@latest search province "khanh hoa"
```

## Migrate CSV

```bash
vn-address migrate customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json

npx vn-address-kit@latest migrate customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

The migrated CSV adds `vn_address_*` audit columns for success, confidence, strategy, normalized new units, street address, and warnings.
