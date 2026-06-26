# Contributing

Thank you for helping improve `vietnam-address-kit`. This project aims to be a reliable open-source toolkit for Vietnam administrative address workflows.

## Development Setup

```bash
git clone https://github.com/zindont/vietnam-address-kit.git
cd vietnam-address-kit
npm install
npm run release:check
```

## Contribution Guidelines

- Keep library functions deterministic and free of `console.log` calls.
- Return structured failures instead of throwing for normal match misses.
- Add tests for every behavior change.
- Keep runtime dependencies small and justified.
- Do not add unverified administrative data as if it were official.
- Document any new data source, mapping rule, or confidence strategy.
- Follow [the documentation language policy](docs/language-policy.md): English is canonical, Vietnamese user-facing docs should live in dedicated localized files.

## Data Contributions

Administrative data contributions must include:

1. Source name and URL or legal document reference.
2. Data extraction date.
3. Transformation notes.
4. Validation coverage for hierarchy and mapping rules.
5. Changelog entry describing the data change.

Sample records may be used for tests, but they must be clearly marked as sample data.

## Pull Requests

Before opening a pull request, run:

```bash
npm run typecheck
npm test
npm run build
npm audit
```

Use clear PR descriptions with motivation, approach, tests, and any limitations.
