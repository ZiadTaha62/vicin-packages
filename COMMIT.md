# Commits

This file summarizes commit structure to follow

## Structure

`<type>(<scope>): <short description>`

- **type** → category of change (required)
- **scope** → optional, usually package or feature affected
- **short description** → imperative, concise summary (≤72 chars)
- **Optional body** → longer explanation if needed
- **Optional footer** → breaking changes or issue references

## Types & Version Bumps

| type            | usage                              | example                                | version bump |
| --------------- | ---------------------------------- | -------------------------------------- | ------------ |
| feat            | A new feature                      | feat(ui): add button component         | minor        |
| fix             | A bug fix                          | fix(api): handle null response         | patch        |
| chore           | Maintenance / tooling              | chore: update dependencies             | patch        |
| docs            | Documentation changes              | docs: update README                    | patch        |
| style           | Formatting / code style (no logic) | style: fix indentation                 | none         |
| refactor        | Code restructure (no feature/bug)  | refactor(utils): simplify logic        | none         |
| test            | Add or fix tests                   | test(ui): add unit tests for button    | patch        |
| perf            | Performance improvement            | perf(utils): optimize search algorithm | patch        |
| ci              | CI/CD configuration                | ci: add turbo caching                  | none         |
| build           | Build system / packaging           | build: update webpack config           | none         |
| BREAKING CHANGE | Changes that break old code        | BREAKING CHANGE: Button API changed    | major        |
