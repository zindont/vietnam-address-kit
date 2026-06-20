# Release Process

This document describes the release checklist for `vn-address-kit`.

## Pre-release Checklist

```bash
npm ci
npm run release:check
node dist/cli/index.js version
node dist/cli/index.js convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
node dist/cli/index.js search province "khanh hoa"
npm pack --pack-destination /tmp
npx --yes --package /tmp/vn-address-kit-*.tgz vn-address-kit version
```

Confirm:

- `npm audit` reports zero vulnerabilities.
- Type declarations are generated in `dist/`.
- CLI entry keeps the shebang.
- README and docs match the published API.
- Sample data warnings remain visible.

## Versioning

Use semantic versioning for package releases.

- Patch: bug fixes and documentation improvements.
- Minor: backward-compatible API additions.
- Major: breaking API, data format, or CLI changes.

Data-only updates should also update `getDataVersion()` and the changelog.

## Publish

```bash
npm publish --access public
```

After publishing, create a GitHub release with the same tag and changelog summary.
