# Sigil

[![npm version](https://img.shields.io/npm/v/@vicin/sigil.svg)](https://www.npmjs.com/package/@vicin/sigil) [![npm downloads](https://img.shields.io/npm/dm/@vicin/sigil.svg)](https://www.npmjs.com/package/@vicin/sigil) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue) [![Build](https://github.com/ZiadTaha62/sigil/actions/workflows/ci.yml/badge.svg)](https://github.com/ZiadTaha62/sigil/actions/workflows/ci.yml) ![bundle size](https://img.shields.io/bundlephobia/minzip/@vicin/sigil)

> - 🎉 v3.0.0 is out! Happy coding! 😄💻
> - 📄 **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

**Sigil** — bulletproof class identity for large TypeScript projects.

Reliable `instanceof`-style checks that survive bundling, HMR, monorepos and realms + exact/subtype discrimination + lightweight nominal typing + and debug/log friendly labels/lineage.

## Why Sigil?

- Works when `instanceof` breaks (multi-bundle, HMR, separate realms)
- Exact class match (`isExactInstance`) — not just "inherits from"
- One-line nominal branding (`declare [sigil]: ExtendSigil<…>`)
- Human-readable class IDs in logs & debugging (`SigilLabel`/`SigilLineage`)
- Tiny (~0.9 kB brotli) & fast (≈ `instanceof` speed)
- 100% test coverage

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

> Note: Function pattern is susceptible to some [Edge case subtle pitfalls](#edge-cases) if not used appropriately, so we advise to use decorator pattern

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

- **Need for stable class id**: Most large projects implement there own labels (e.g. to be used in logs)

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
console.log(Admin.SigilEffectiveLabel); // '@myorg/Admin'
console.log(Admin.SigilLabelLineage); // ['Sigil', '@myorg/User', '@myorg/Admin']
console.log(admin.SigilLabel); // '@myorg/Admin'
console.log(admin.getSigilEffectiveLabel); // '@myorg/Admin'
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

Decorators ensure that metadata is appended before static blocks or IIFE static initializers, however `attachSigil` function runs after them so accessing label inside them will return auto-generated label or throw:

```ts
class A extends Sigil {
  static IIFE = (() => {
    const label = A.SigilLabel; // returns label of the parent (Sigil in our case)
  })();

  static {
    const label = this.SigilLabel; // returns label of the parent (Sigil in our case)
  }
}

attachSigil(A, 'A');
```

This behavior can't be avoided, so make sure not to call any `Sigil` method inside them or move to decorators (`@AttachSigil`)

---

## Benchmarks

Sigil is built for **real-world performance**. Below are the latest micro-benchmark results (run on **Node.js v20.12.0**).

**Running Tests**

To run benchmarks on your machine fetch source code from [github](https://github.com/ZiadTaha62/sigil) then:

```bash
npm install
npm run bench
```

### 1. Runtime Type Checking

| Depth | `instanceof` (per op) | `isInstance` (ctor) | `isInstance` (instance) | `isExactInstance` (ctor) | `isExactInstance` (instance) |
| ----- | --------------------- | ------------------- | ----------------------- | ------------------------ | ---------------------------- |
| 0     | 0.000009 ms           | 0.000018 ms         | **0.000018 ms**         | 0.000027 ms              | 0.000011 ms                  |
| 3     | 0.000032 ms           | 0.000037 ms         | **0.000027 ms**         | 0.000038 ms              | **0.000058 ms**              |
| 5     | 0.000041 ms           | 0.000036 ms         | **0.000028 ms**         | 0.000037 ms              | **0.000034 ms**              |
| 10    | 0.000048 ms           | 0.000036 ms         | **0.000028 ms**         | 0.000038 ms              | **0.000034 ms**              |
| 15    | 0.000064 ms           | 0.000057 ms         | **0.000050 ms**         | 0.000069 ms              | **0.000075 ms**              |

> **Key takeaway**:  
> `isInstance` & `isExactInstance` has **practically the same performance as native `instanceof`**, slightly **slower** on static calls and slightly **faster** on the instance side.

### 2. Class Definition & Instance Creation

| Scenario                        | Definition (per class) | Instantiation (per instance) |
| ------------------------------- | ---------------------- | ---------------------------- |
| Empty plain class               | 0.0101 ms              | 0.0002 ms                    |
| Empty Sigil class               | 0.0915 ms              | 0.0007 ms                    |
| Small (5 props + 3 methods)     | 0.0177 ms              | 0.0034 ms                    |
| Small Sigil                     | 0.0942 ms              | 0.0051 ms                    |
| Large (15 props + 10 methods)   | 0.0225 ms              | 0.0097 ms                    |
| Large Sigil                     | 0.1034 ms              | 0.0119 ms                    |
| Extended chain depth 3 – plain  | 0.0538 ms              | 0.0085 ms                    |
| Extended chain depth 3 – Sigil  | 0.2328 ms              | 0.0087 ms                    |
| Extended chain depth 5 – plain  | 0.0902 ms              | 0.0177 ms                    |
| Extended chain depth 5 – Sigil  | 0.3686 ms              | 0.0194 ms                    |
| Extended chain depth 10 – plain | 0.1973 ms              | 0.0581 ms                    |
| Extended chain depth 10 – Sigil | 0.7015 ms              | 0.0621 ms                    |

> **Key takeaways**:
>
> - Class definition is a **one-time cost** at module load time. Even at depth 10 the cost stays well under 1 ms per class.
> - Instance creation adds a small fixed overhead of ~0.4–0.6 µs per object, which becomes completely negligible as your classes grow in size and complexity.

---

## Bundle Size

**Less than 1 KB (908 B)** (minified + Brotli, including all dependencies)

This makes Sigil one of the smallest full-featured solutions for nominal typing + reliable runtime identity.

**Running Tests**

To verify bundle size fetch source code from [github](https://github.com/ZiadTaha62/sigil) then:

```bash
npm install
npm run size
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

To run the test suite locally and generate a coverage report, fetch source code from [github](https://github.com/ZiadTaha62/sigil) then:

```bash
npm install
npm run test:unit
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
