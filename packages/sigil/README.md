# Sigil

[![npm version](https://img.shields.io/npm/v/@vicin/sigil.svg)](https://www.npmjs.com/package/@vicin/sigil) [![npm downloads](https://img.shields.io/npm/dm/@vicin/sigil.svg)](https://www.npmjs.com/package/@vicin/sigil) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue) [![Build](https://github.com/ZiadTaha62/vicin-packages/actions/workflows/ci.yml/badge.svg)](https://github.com/ZiadTaha62/vicin-packages/actions/workflows/ci.yml) ![bundle size](https://img.shields.io/bundlephobia/minzip/@vicin/sigil)

> - 🎉 v4.0.0 is out! Happy coding! 😄💻
> - 📄 **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

**Sigil** — bulletproof class identity for large TypeScript projects.

Reliable `instanceof`-style checks that survive bundling, HMR, monorepos and realms + exact/subtype discrimination + lightweight nominal typing + and debug/log friendly labels/lineage.

## Why Sigil?

- **Works when `instanceof` breaks** (multi-bundle, HMR, separate realms)
- **Exact class match (`isExactInstance`)** — not just "inherits from"
- **One-line nominal branding** (`declare [sigil]: ExtendSigil<…>`)
- **Human-readable class IDs in logs & debugging** (`SigilLabel`/`SigilLineage`)
- **Tiny (~0.9 kB brotli)**
- **Fast (near native `instanceof` speed)**
- **100% test coverage**

## Limitations

- **Identity is explicit and dependent on passed labels**, If same label is passed to two different classes `Sigil` will treat them as one
- **Identity is updated with every new label passed only**, If you stopped passing labels to child classes their identity will stop at last passed label
- **`Sigil` is not built for security**, identity can be forged

Earlier versions of `Sigil` tried to solve these limitations, however it was not `100%` reliable, so we decided to make this package minimal and stable, while adding new features in future package `@vicin/sigil-extend`

---

## Table of contents

- [Quick start](#quick-start)
  - [Install](#install)
  - [Basic usage](#basic-usage)
  - [Decorator pattern](#decorator-pattern)
  - [Function pattern](#function-pattern)
  - [Migration](#migration)
- [Core concepts](#core-concepts)
  - [Terminology](#terminology)
  - [Purpose and Origins](#purpose-and-origins)
  - [Implementation Mechanics](#implementation-mechanics)
  - [Example](#example)
  - [Errors & throws](#errors--throws)
- [API reference](#api-reference)
- [Options & configuration](#options--configuration)
- [Minimal mode](#minimal-mode)
- [Strict mode](#strict-mode)
- [Hot module reload](#hot-module-reload)
- [Edge cases](#edge-cases)
- [Benchmarks](#benchmarks)
- [Bundle Size](#bundle-size)
- [Tests](#tests)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Quick start

### Install

```bash
npm install @vicin/sigil
# or
yarn add @vicin/sigil
# or
pnpm add @vicin/sigil
```

Requires TypeScript 5.0+ for decorators; attach functions work on older versions. Node.js 18+ recommended.

> No tsconfig changes are needed as we use **Stage 3 decorators** which are supported by default in TypeScript 5.0+

### Basic usage

#### Opt into `Sigil`

Use the `Sigil` base class or the `Sigilify` mixin to opt a class into the Sigil runtime contract.

```ts
import { Sigil, Sigilify } from '@vicin/sigil';

// Using the pre-sigilified base class:
class User extends Sigil {}

// Or use Sigilify when you want an ad-hoc class:
const MyClass = Sigilify(class {}, '@myorg/mypkg.MyClass');
```

If your class is marked with `abstract`:

```ts
import { Sigil, SigilifyAbstract } from '@vicin/sigil';

abstract class User extends Sigil {}

const MyClass = SigilifyAbstract(abstract class {}, '@myorg/mypkg.MyClass');
```

#### Extend `Sigil` classes

After opting into the `Sigil` contract, labels are passed to child classes to uniquely identify them, they can be supplied using two patterns:

##### Decorator pattern

Apply a label with the `@AttachSigil` decorator:

```ts
import { Sigil, AttachSigil } from '@vicin/sigil';

@AttachSigil('@myorg/mypkg.User')
class User extends Sigil {}
```

##### Function pattern

Apply a label using `attachSigil` function:

```ts
import { Sigil, attachSigil } from '@vicin/sigil';

class User extends Sigil {}
attachSigil(User, '@myorg/mypkg.User');
```

### Migration

1. Pass your base class to `Sigilify` mixin:

```ts
import { Sigilify } from '@vicin/sigil';

const MySigilBaseClass = Sigilify(MyBaseClass);
```

2. Or extend it with `Sigil`:

```ts
import { Sigil } from '@vicin/sigil';

class MyBaseClass extends Sigil {} // <-- add 'extends Sigil' here
```

Congratulations — you’ve opted into `Sigil`, now you can start giving your classes identity by using `attachSigil` or `AttachSigil` helpers.

---

## Core concepts

### Terminology

- **Label**: An identity (string) such as `@scope/pkg.ClassName`, must be unique for each `Sigil` class otherwise error is thrown.
- **isInstance**: Takes object argument and check if this object is an instance of calling class or it's children. Can be called from class instances as well.
- **isExactInstance**: Takes object argument and check if this object is an instance of calling class only. Can be called from class instances as well.
- **[sigil]**: TypeScript symbol marker for nominal types.

---

### Purpose and Origins

Sigil addresses issues in large codebases and monorepos:

- **Unreliable `instanceof`:** Bundling cause class redefinitions, breaking checks.

```ts
// Can be broken in monorepo or HMR set-ups
if (obj instanceof User) { ... }

// With Sigil
if (User.isInstance(obj)) { ... } // This still works even if User was bundled twice.
if (User.isExactInstance(obj)) { ... } // Or check for exactly same constructor not its children
```

Also by utilizing unique passed labels it solves another problem in Domain-Driven Design (DDD):

- **Manual Branding Overhead:** Custom identifiers lead to boilerplate and maintenance issues, `Sigil` adds reliable inheritance-aware nominal branding with just one line of code.

```ts
import { sigil } from '@vicin/sigil';

class User extends Sigil {
  declare [sigil]: ExtendSigil<'User', Sigil>; // <-- Update nominal brand with this line
}

type test1 = User extends Sigil ? true : false; // true
type test2 = Sigil extends User ? true : false; // false
```

- **Need for stable class id**: Most large projects implement their own labels (e.g. to be used in logs)

### Implementation Mechanics

- **Runtime Contract:** Established via extending `Sigil` or using `Sigilify` mixin.
- **Update metadata:** With each new child, use decorator (`AttachSigil`) or function (`attachSigil`) to attach run-time metadata, also use `ExtendSigil` on `[sigil]` field to update nominal type.

```ts
import { Sigil, AttachSigil, sigil, ExtendSigil } from '@vicin/sigil';

@AttachSigil('@scope/package.MyClass') // <-- Run-time values update
class MyClass extends Sigil {
  declare [sigil]: ExtendSigil<'MyClass', Sigil>; // <-- compile-time type update
}
```

You can avoid decorators and use normal functions if needed:

```ts
import { Sigil, attachSigil, sigil, ExtendSigil } from '@vicin/sigil';

class MyClass extends Sigil {
  declare [sigil]: ExtendSigil<'MyClass', Sigil>;
}

attachSigil(MyClass, '@scope/package.MyClass');
```

### Example

```ts
import { Sigil, AttachSigil } from '@vicin/sigil';

@AttachSigil('@myorg/User')
class User extends Sigil {
  declare [sigil]: ExtendSigil<'User', Sigil>;
}

@AttachSigil('@myorg/Admin')
class Admin extends User {
  declare [sigil]: ExtendSigil<'Admin', User>;
}

const admin = new Admin();
const user = new User();

// Instanceof like behavior
console.log(Admin.isInstance(admin)); // true
console.log(Admin.isInstance(user)); // false
console.log(User.isInstance(admin)); // true
console.log(User.isInstance(user)); // true

// Exact checks
console.log(Admin.isExactInstance(admin)); // true
console.log(Admin.isExactInstance(user)); // false
console.log(User.isExactInstance(user)); // true
console.log(User.isExactInstance(admin)); // false (Admin is child indeed but this checks for user specifically)

// Can use checks from instances
console.log(admin.isInstance(user)); // false
console.log(user.isInstance(admin)); // true
console.log(admin.isExactInstance(user)); // false
console.log(user.isExactInstance(admin)); // false

// Type checks are nominal
type test1 = Admin extends User ? true : false; // true
type test2 = User extends Admin ? true : false; // false

// Passed label must be unique (enforced by Sigil) so can be used as stable Id for class
// Also 'SigilLabelLineage' is useful for logging & debugging
console.log(Admin.SigilLabel); // '@myorg/Admin'
console.log(Admin.SigilLabelLineage); // ['Sigil', '@myorg/User', '@myorg/Admin']
console.log(admin.SigilLabel); // '@myorg/Admin'
console.log(admin.SigilLabelLineage); // ['Sigil', '@myorg/User', '@myorg/Admin']
```

### Errors & throws

Run-time errors that can be thrown by `Sigil`:

#### Double Sigilify

```ts
class A {}
Sigilify(Sigilify(A, 'A'), 'B'); // Throws: [Sigil Error] Class 'Sigilified' with label 'A' is already sigilified

@AttachSigil('B')
@AttachSigil('A')
class A extends Sigil {} // Throws: [Sigil Error] Class 'A' with label 'A' is already sigilified

class A extends Sigil {}
attachSigil(attachSigil(A, 'A'), 'B'); // Throws: [Sigil Error] Class 'A' with label 'A' is already sigilified
```

#### `@AttachSigil() / attachSigil()` on non-Sigil class

```ts
@AttachSigil('A') // Throws: [Sigil Error] 'AttachSigil' decorator accept only Sigil classes but used on class 'A'
class A {}

attachSigil(class A {}); // Throws: [Sigil Error] 'AttachSigil' function accept only Sigil classes but used on class 'A'
```

#### Invalid label format

```ts
updateSigilOptions({ labelValidation: RECOMMENDED_LABEL_REGEX });

@AttachSigil('InvalidLabel')
class A extends Sigil {} // Throws: [Sigil Error] Invalid Sigil label 'InvalidLabel'. Make sure that supplied label matches validation regex or function
```

#### Attach sigil to parent after child

```ts
class Parent extends Sigil {}
class Child extends Parent {}

attachSigil(Child, 'Child');
attachSigil(Parent, 'Parent'); // Throws: [Sigil Error] Class 'Parent' with label 'Sigil' is already sigilified
```

---

## API reference

### Primary Exports

- **Mixins:**
  - `Sigilify(Base, label, opts?)`
  - `SigilifyAbstract(Base, label, opts?)`

- **Classes:**
  - `Sigil`
  - `SigilError`

- **Decorator:**
  - `AttachSigil(label, opts?)`

- **Attach function:**
  - `attachSigil(Class, label, opts?)`

- **Helpers:**
  - `isSigilCtor(ctor)`
  - `isSigilInstance(inst)`
  - `hasOwnSigil(ctor)`

- **Options:**
  - `updateSigilOptions(opts)`
  - `RECOMMENDED_LABEL_REGEX`

- **Types:**
  - `SigilOf<T>`
  - `ExtendSigil<Label, Parent>`
  - `GetPrototype<Class>`
  - `SigilOptions`

### Key helpers (runtime)

- `Sigil`: a minimal sigilified base class you can extend from.
- `SigilError`: an `Error` class decorated with a `Sigil` so it can be identified at runtime.
- `Sigilify(Base, label, opts?)`: mixin function that returns a new constructor with `Sigil` types and instance helpers.
- `SigilifyAbstract(Base, label, opts?)`: Same as `Sigilify` but for abstract classes.
- `AttachSigil(label, opts?)`: class decorator that attaches `Sigil` metadata at declaration time.
- `attachSigil(Class, label, opts?)`: function that validates and decorates an existing class constructor.
- `isSigilCtor(value)`: `true` if `value` is a `Sigil` constructor.
- `isSigilInstance(value)`: `true` if `value` is an instance of a `Sigil` constructor.
- `hasOwnSigil(ctor)`: `true` if new sigil label is attached to `ctor`
- `updateSigilOptions(opts)`: change global runtime options of `Sigil` library (e.g., `labelValidation`).
- `RECOMMENDED_LABEL_REGEX`: regex that ensures structure of `@scope/package.ClassName` to all labels, it's advised to use it as your `SigilOptions.labelValidation`

### Instance & static helpers provided by Sigilified constructors

When a constructor is sigilified it will expose the following **static** getters/methods:

- `SigilLabel` — the identity label string.
- `SigilLabelLineage` — readonly array of labels representing parent → child for debugging.
- `hasOwnSigil` — check if new sigil label is attached to this class.
- `isInstance(other)` — check if other is an instance of this constructor or its children.
- `isExactInstance(other) `— check if other is an instance exactly this constructor.

Instances of sigilified classes expose instance helpers:

- `SigilLabel` — the identity label string.
- `SigilLabelLineage` — readonly array of labels representing parent → child for debugging.
- `hasOwnSigil` — check if new sigil label is attached to this class.
- `isInstance(other)` — check if other is an instance of the same class or its children as this.
- `isExactInstance(other) `— check if other is an instance exactly the same constructor.

---

## Options & configuration

Customize behavior globally at startup:

```ts
import { updateSigilOptions } from '@vicin/sigil';

updateSigilOptions({
  labelValidation: null, // Function or regex, Enforce label format
});
```

Values defined in previous example are defaults, per-class overrides available in mixin and attach function / decorator.

---

## Edge cases

### Attach sigil to parent after child

When attaching `Sigil` labels to classes order from parent -> child must be respected

```ts
class Parent extends Sigil {}
class Child extends Parent {}

attachSigil(Child, 'Child');
attachSigil(Parent, 'Parent'); // Throws: [Sigil Error] Class 'Parent' with label 'Sigil' is already sigilified
```

### Accessing Sigil `metadata` before running `attachSigil` function

If you didn't make sure that `attachSigil` runs right after class declaration and used one of `Sigil` methods this will occur:

```ts
class A extends Sigil {}

console.log(A.SigilLabel); // returns label of the parent (Sigil in our case)

attachSigil(A, 'A');

console.log(A.SigilLabel); // A
```

To avoid this bug entirely you can use the return of `attachSigil` in your code so you are enforced to respect order:

```ts
class _A extends Sigil {}

const A = attachSigil(_A, 'A');
type A = InstanceType<typeof A>;

console.log(A.SigilLabel); // A
```

Note that you can't use `InstanceType` on `private` or `protected` classes, however you can use `GetPrototype<T>` in such cases.

#### Static blocks & IIFE static initializer

Stage 3 decorators (`AttachSigil`) and function (`attachSigil`) runs after IIFE and static blocks, so accessing `Sigil` metadata inside them should be avoided

```ts
@AttachSigil('A')
class A extends Sigil {
  static IIFE = (() => {
    const label = A.SigilLabel; // returns label of the parent (Sigil in our case)
  })();

  static {
    const label = this.SigilLabel; // returns label of the parent (Sigil in our case)
  }
}
```

---

## Benchmarks

Sigil is built for **real-world performance**. Below are the latest micro-benchmark results (run on **Node.js v20.12.0**).

**Running Tests**

To run benchmarks on your machine fetch source code from [github](https://github.com/ZiadTaha62/vicin-packages) then:

```bash
pnpm install
pnpm run bench --filter @vicin/sigil
```

### 1. Runtime Type Checking

| Test Name                  | Ops/sec (hz) | Mean (ms) | p99 (ms) | RME    | Samples   |
| -------------------------- | ------------ | --------- | -------- | ------ | --------- |
| **Depth 0**                |              |           |          |        |           |
| instanceof                 | 11,986,628   | 0.0001    | 0.0002   | ±0.58% | 5,993,314 |
| isInstance (Ctor)          | 8,848,040    | 0.0001    | 0.0003   | ±0.63% | 4,424,020 |
| isInstance (instance)      | 9,246,878    | 0.0001    | 0.0002   | ±0.86% | 4,623,440 |
| isExactInstance (Ctor)     | 5,114,916    | 0.0002    | 0.0003   | ±0.44% | 2,557,459 |
| isExactInstance (instance) | 5,553,370    | 0.0002    | 0.0003   | ±0.41% | 2,776,686 |
| **Depth 5**                |              |           |          |        |           |
| instanceof                 | 8,399,150    | 0.0001    | 0.0002   | ±0.48% | 4,199,651 |
| isInstance (Ctor)          | 7,385,890    | 0.0001    | 0.0003   | ±2.01% | 3,692,945 |
| isInstance (instance)      | 7,862,474    | 0.0001    | 0.0003   | ±0.77% | 3,931,238 |
| isExactInstance (Ctor)     | 4,433,700    | 0.0002    | 0.0004   | ±0.64% | 2,216,851 |
| isExactInstance (instance) | 4,898,498    | 0.0002    | 0.0004   | ±0.34% | 2,449,249 |
| **Depth 10**               |              |           |          |        |           |
| instanceof                 | 7,144,486    | 0.0001    | 0.0003   | ±0.63% | 3,572,243 |
| isInstance (Ctor)          | 7,165,920    | 0.0001    | 0.0003   | ±0.49% | 3,582,960 |
| isInstance (instance)      | 7,834,056    | 0.0001    | 0.0003   | ±1.16% | 3,917,029 |
| isExactInstance (Ctor)     | 4,292,578    | 0.0002    | 0.0004   | ±0.34% | 2,146,290 |
| isExactInstance (instance) | 5,020,923    | 0.0002    | 0.0004   | ±0.28% | 2,510,462 |
| **Depth 15**               |              |           |          |        |           |
| instanceof                 | 7,116,266    | 0.0001    | 0.0002   | ±0.38% | 3,558,134 |
| isInstance (Ctor)          | 6,308,498    | 0.0002    | 0.0003   | ±0.41% | 3,154,249 |
| isInstance (instance)      | 6,403,126    | 0.0002    | 0.0003   | ±0.70% | 3,201,564 |
| isExactInstance (Ctor)     | 3,678,280    | 0.0003    | 0.0005   | ±0.37% | 1,839,141 |
| isExactInstance (instance) | 3,753,618    | 0.0003    | 0.0005   | ±0.39% | 1,876,810 |

> **Key takeaway**:
>
> `isInstance` Efficiency: Demonstrates high parity with native instanceof, maintaining a minimal performance delta (approx. 15% overhead).
> `isExactInstance` Cost-Benefit: While introducing a ~2x overhead compared to native operations, it remains performant in absolute terms. The throughput cost is a deliberate trade-off for the increased precision required for exact matching.

### 2. Class Definition & Instance Creation

| Test Name                             | Ops/sec (hz)      | Mean (ms)        | p99 (ms)         | RME     | Samples   |
| ------------------------------------- | ----------------- | ---------------- | ---------------- | ------- | --------- |
| **Definition (Module Load Time)**     |                   |                  |                  |         |           |
| Define Empty (Plain vs Sigil)         | 122,640 vs 13,154 | 0.0082 vs 0.0760 | 0.0206 vs 0.1413 | ±11.36% | 6,578     |
| Define Small (Plain vs Sigil)         | 75,363 vs 12,003  | 0.0133 vs 0.0833 | 0.0267 vs 0.1596 | ±5.98%  | 6,002     |
| Define Large (Plain vs Sigil)         | 53,392 vs 11,978  | 0.0187 vs 0.0835 | 0.0352 vs 0.1471 | ±6.13%  | 5,990     |
| Define Depth 3 (Plain vs Sigil)       | 22,802 vs 5,205   | 0.0439 vs 0.1921 | 0.0850 vs 0.3139 | ±14.68% | 2,603     |
| Define Depth 5 (Plain vs Sigil)       | 12,003 vs 3,369   | 0.0833 vs 0.2968 | 0.1864 vs 0.5488 | ±7.31%  | 1,685     |
| Define Depth 10 (Plain vs Sigil)      | 5,477 vs 1,758    | 0.1826 vs 0.5685 | 0.3402 vs 1.1148 | ±9.62%  | 880       |
| **Instantiation (Runtime/Hot Path)**  |                   |                  |                  |         |           |
| Instantiate Empty (Plain vs Sigil)    | 12.0M vs 11.9M    | 0.0001 vs 0.0001 | 0.0002 vs 0.0002 | ±0.76%  | 5,999,555 |
| Instantiate Small (Plain vs Sigil)    | 12.5M vs 11.4M    | 0.0001 vs 0.0001 | 0.0001 vs 0.0002 | ±0.89%  | 5,739,986 |
| Instantiate Large (Plain vs Sigil)    | 12.4M vs 12.4M    | 0.0001 vs 0.0001 | 0.0002 vs 0.0001 | ±0.74%  | 6,205,306 |
| Instantiate Depth 3 (Plain vs Sigil)  | 12.0M vs 12.1M    | 0.0001 vs 0.0001 | 0.0002 vs 0.0002 | ±1.01%  | 6,092,517 |
| Instantiate Depth 5 (Plain vs Sigil)  | 9.09M vs 8.54M    | 0.0001 vs 0.0001 | 0.0002 vs 0.0003 | ±2.24%  | 4,272,328 |
| Instantiate Depth 10 (Plain vs Sigil) | 2.87M vs 1.72M    | 0.0003 vs 0.0006 | 0.0008 vs 0.0011 | ±0.75%  | 862,564   |

> **Key takeaways**:
>
> Front-Loaded Definition Overhead: Sigil introduces main overhead during the class definition phase (roughly 6x to 10x slower than plain classes). This is a one-time cost per class, typically occurring during module evaluation or registry setup.
>
> Runtime Performance Parity: Once the class is defined, Sigil achieves near-native instantiation throughput. For standard object creation, the delta is negligible, ensuring that the library does not bottleneck high-frequency allocation patterns.
>
> Scale Stability: The overhead of Sigil remains constant regardless of the number of properties or methods added (Small vs. Large). The definition speed for a "Small Sigil" and a "Large Sigil" is nearly identical (~12k hz), suggesting that the setup logic is O(1) relative to class member count.

---

## Bundle Size

**Less than 1 KB (908 B)** (minified + Brotli, including all dependencies)

This makes Sigil one of the smallest full-featured solutions for nominal typing + reliable runtime identity.

**Running Tests**

To verify bundle size fetch source code from [github](https://github.com/ZiadTaha62/vicin-packages) then:

```bash
pnpm install
pnpm run size --filter @vicin/sigil
```

---

## Tests

**Coverage Status**

We maintain **100%** test coverage across the entire codebase to ensure that runtime metadata remains consistent and predictable.

| Metric | Score |
| ------ | ----- |
| Stmts  | 100%  |
| Branch | 100%  |
| Funcs  | 100%  |
| Lines  | 100%  |

**Running Tests**

To run the test suite locally and generate a coverage report, fetch source code from [github](https://github.com/ZiadTaha62/vicin-packages) then:

```bash
pnpm install
pnpm run test --filter @vicin/sigil
```

---

## Contributing

Any contributions you make are **greatly appreciated**.

Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Reporting bugs

If you encounter a bug:

- 1. Check existing issues first
- 2. Open a new issue with:
  - Minimal reproduction
  - Expected vs actual behavior
  - Environment (Node, TS version)

Bug reports help improve Sigil — thank you! 🙏

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

Built with ❤️ by **Ziad Taha**.

- **GitHub: [@ZiadTaha62](https://github.com/ZiadTaha62)**
- **NPM: [@ziadtaha62](https://www.npmjs.com/~ziadtaha62)**
- **Vicin: [@vicin](https://www.npmjs.com/org/vicin)**
