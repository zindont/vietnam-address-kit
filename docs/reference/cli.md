# CLI Reference

The package exposes two equivalent binaries:

- `vietnam-address-kit`
- `vn-address`

Use `vietnam-address-kit` for `npx` package-name execution and `vn-address` for shorter local/global usage.

## `version`

Print package and data version.

```bash
vn-address version
npx vietnam-address-kit@latest version
```

## `convert <address>`

Convert one free-text address.

```bash
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa"
```

Options:

| Option | Description |
|---|---|
| `--json` | Print the full `ConversionResult` as JSON. |
| `--pretty` | Pretty-print JSON when used with `--json`. |

Examples:

```bash
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
```

## `search <kind> <keyword>`

Search current administrative units.

`kind` must be `province` or `ward`.

```bash
vn-address search province "khanh hoa"
vn-address search ward "loc tho"
vn-address search ward "loc tho" --province 56
```

Options:

| Option | Description |
|---|---|
| `--province <code>` | Filter ward search by current province code. |
| `--json` | Print scored results as JSON. |
| `--pretty` | Pretty-print JSON when used with `--json`. |

## `migrate <file>`

Migrate a CSV file by converting one address column.

```bash
vn-address migrate customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

Required options:

| Option | Description |
|---|---|
| `--address-column <column>` | Name of the CSV column containing address text. |
| `--out <file>` | Output CSV path. |

Optional options:

| Option | Description |
|---|---|
| `--report <file>` | Write summary JSON report. |
| `--pretty` | Pretty-print summary JSON to terminal. |

## Exit Behavior

The CLI does not throw for normal failed matches. Failed or ambiguous conversions are written as structured results. Programmer errors, such as an unreadable input file, can still make the command exit with an error.
