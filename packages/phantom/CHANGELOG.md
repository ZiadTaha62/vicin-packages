# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-02-13

### Changed

- `StripPhantom` works on declarations (`Identity.Declare<>` ,`Trait.Declare<>` and `Transformation.Declare<>`), returns `unknown` if `__Base?` is not defined.

## [1.1.0] - 2026-02-13

### Added

- Now `Identity.Declare` add `Base?` value to output type, so no more `type X = string & Identity.Declare<X, 'LabelX', string>`, you just need to pass `type X = Identity.Declare<X, 'LabelX', string>`
- Exposed `stripPhantom` in exports as single function.

### Deprecated

`Brand` is just a subset of `Identity`, that's why library moved towards using `Identity` only to unify API surface.

- `Brand` namespace, **marked with `deprecated` and will be removed in v2.0.0**
- `asBrand` assertor, **marked with `deprecated` and will be removed in v2.0.0**
- `isBrand` inspector, **marked with `deprecated` and will be removed in v2.0.0**

## [1.0.7] - 2026-02-10

**Stable release**

### Changed

- Documentation updates (README)

## [1.0.6] - 2026-02-10

### Changed

- Documentation updates (README)

## [1.0.5] - 2026-02-08

### Added

- Single assertor import

## [1.0.4] - 2026-02-07

### Changed

- Documentation updates (README)

## [1.0.2] - 2026-02-07

### Changed

- Unit tests
- Documentation updates (README)

## [1.0.1] - 2026-02-07

### Changed

- Documentation updates (README)
