# Contributing to Phantom

Thanks for your interest! We welcome contributions.

## How to Contribute

- **Issues**: Report bugs or suggest features via GitHub Issues. Use templates if possible.
- **Pull Requests (PRs)**:
  1. Fork the repo and create a branch: `git checkout -b feature/my-new-feature`.
  2. Commit changes: Follow conventional commits (e.g., "feat: add new ValueObject").
  3. Push and open a PR against `develop` branch.
  4. Describe changes, link to issues, and add tests.
- **Code Style**: Use Prettier/ESLint.
- **Tests**: All PRs must pass unit tests.
- **License**: By contributing, you agree to MIT license.

## Setup

- Clone: `git clone https://github.com/ZiadTaha62/vicin-packages.git`
- Install: `pnpm install`
- Build: `pnpm run build --filter @vicin/phantom`
- Test: `pnpm run test --filter @vicin/phantom` coverage should be `>90%` of lines.

Questions? Open an issue!
