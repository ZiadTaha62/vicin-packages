# Phantom

[![npm version](https://img.shields.io/npm/v/@vicin/phantom.svg)](https://www.npmjs.com/package/@vicin/phantom) [![npm downloads](https://img.shields.io/npm/dm/@vicin/phantom.svg)](https://www.npmjs.com/package/@vicin/phantom) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue) [![Build](https://github.com/ZiadTaha62/phantom/actions/workflows/ci.yml/badge.svg)](https://github.com/ZiadTaha62/phantom/actions/workflows/ci.yml)

> - 🎉 First stable release — v1.0! Happy coding! 😄💻
> - 📄 **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

`Phantom` is a powerful, lightweight TypeScript library for nominal typing. it uses **type-only** metadata object that can be attached to any type with clean IDE. It enables compile-time distinctions between structurally identical types (e.g., `Email` vs. `Username` as branded strings) while supporting advanced features like **constrained identities**,**state variants**, **additive traits**, and **reversible transformations**. making it ideal for domain-driven design (DDD), APIs, and type-safe primitives with near zero performance overhead.

---

## Table of contents

- [Features](#features)
- [Install](#install)
- [Core concepts](#core-concepts)
  - [Terminology](#terminology)
  - [\_\_Phantom object](#__phantom-object)
- [Type constructs](#type-constructs)
  - [Identities with constraints](#identities-with-constraints)
  - [Traits (additive capabilities)](#traits-additive-capabilities)
  - [Transformations (Type pipe-like behavior)](#transformations-type-pipe-like-behavior)
  - [Errors](#errors)
  - [Symbols](#symbols)
  - [Imports](#imports)
- [Chaining](#chaining)
- [Hot-path code ( truly type-only pattern )](#hot-path-code--truly-type-only-pattern-)
- [Debugging](#debugging)
- [API reference](#api-reference)
- [Full examples](#full-examples)
- [Deprecated API](#deprecated-api)
- [Sigil](#sigil)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Features

- **Nominal branding for primitives and objects to prevent accidental misuse (e.g., UserId ≠ PostId).**

- **Constrained identities with base types and variants for enforced type safety.**

- **Traits as independent, additive metadata sets for capabilities or flags.**

- **Transformations for reversible type changes (e.g., encrypt/decrypt) while tracking origins.**

- **assertors as zero-cost runtime helpers for applying metadata via type casts.**

- **Modular namespaces: So all devs are happy.**

---

## Install

```Bash
npm install @vicin/phantom
# or
yarn add @vicin/phantom
# or
pnpm add @vicin/phantom
```

**Requirements:** TypeScript 5.0+ recommended.

---

## Core concepts

### Terminology

- **Label:** Optional human-readable description (e.g., "User ID")—does not affect typing.

- **Tag:** Unique nominal identifier (string/symbol) for brands/identities/transformations.

- **Variants:** Mutually exclusive states (e.g., "Verified" | "Unverified") for identities/transformations.

- **Base:** Runtime type constraint (e.g., string) enforced on assignment.

- **Input:** Original type preserved in transformations for reversion.

- **Traits:** Key-value map of capabilities (e.g., { PII: true }) that can be added/removed independently.

- **Brand:** Basic nominal tag with optional label.

- **Identity:** Brand + base/variants for constrained nominals.

- **Trait:** Additive metadata flag.

- **Transformation:** Reversible change with input tracking.

---

### \_\_Phantom object

Under the hood `Phantom` is just **type-only** metadata object appended to your types and gets updated every time one of phantom types is used. This allows mimicking nominal typing inside TypeScript's structural typing.

When `Phantom` is used with it's full potential the IDE will show you something like this:

```ts
type X = string & {
  __Phantom: {
    __Tag: 'X';
    __Label?: 'Label of X';
    __Base?: string;
    __Variants: 'Variant1' | 'Variant2';
    __Traits: {
      trait1: true;
      trait2: true;
    };
    __Input: SomeInput;
    __OriginalType?: string;
  };
};
```

From the first glance you can spot that`Phantom` is designed to separate original type `string` from `__Phantom` metadata object so your IDE can stay clean, each Phantom object will have these fields:

- **\_\_Tag:** Nominal tag (**identity**) of the type which tells who this value is. can be `string` | `symbol`.

- **\_\_Label?:** Optional label describing this nominal identity.

- **\_\_Base?:** Optional constraint to nominal identity, so only values that extend this type can be branded.

- **\_\_Variants:** Optional states of the nominal identity.

- **\_\_Traits:** Additional properties the type holds, unlike `__Tag` that tells who `__Traits` tell what this type hold or can do (e.g. `Validated`, `PII` etc...).

- **\_\_Input:** Input type in transformations (e.g. Transformation `Encrypted` can have `__Input: string` which means that encrypted value is `string`).

- **\_\_OriginalType?:** Type without `__Phantom` metadata object. related to internal implementation only and is crucial to keep clean IDE messages.

More details of these properties will be discussed later.

---

## Type constructs

---

### Identities with constraints

`Identity` is just `Brand` with extra capabilities as `Base` and `Variants` for more complex use cases.

#### Structure

**`Identity.Declare<Tag, Label?, Base?, Variants?>`**

- **Tag:** Unique identifier which can string or symbol.
- **Label?:** Optional label description. can be set to `never`.
- **Base?:** Optional base that constrains identity so only `string` for example can be casted as `Email`. can be set to `never` or `unknown`.
  Type passed is also added to declared `Identity` (`<Base> & <PhantomObject>`).
- **Variants?:** Optional variants (states) of the identity. can be set to `never`.

#### Basic example

```ts
import { Phantom } from '@vicin/phantom';

// Declare an identity with base (string) and variants
type Email = Phantom.Identity.Declare<
  'Email',
  'User email address',
  string,
  'Verified' | 'Unverified'
>;

// Assertor
const asEmail = Phantom.assertors.asIdentity<Email>();

// Usage
const email = asEmail('user@example.com'); // type: string & { __Phantom: { __Tag: "Email"; __Label?: "User email address"; __Variants: "Verified" | "Unverified"; __OriginalType: string; } }
```

#### Re-brand

Branding already branded value is prohibited and results in Error type:

```ts
const value = '123';

// Branding string as UserId
const userId = asUserId(value);

// Trying to brand userId as PostId returns type error
const postId = asPostId(userId); // type: Flow.TypeError<{ code: "ALREADY_BRANDED"; message: "Type already branded"; context: { type: <userId type>; }; }>
```

#### Base

```ts
const validBase = asEmail('user@example.com');

const inValidBase = asEmail(123); // type:  Flow.TypeError<{ code: "TYPE_NOT_EXTEND_BASE"; message: "Type not extend base"; context: { type: 123; base: string; }; }>
```

#### Variants

```ts
// With variant
type VerifiedEmail = Phantom.Identity.WithVariant<Email, 'Verified'>;
const asVerifiedEmail = Phantom.assertors.asIdentity<VerifiedEmail>();

// Usage
const verifiedEmail = asVerifiedEmail('user@verified.com'); // type: string & { __Phantom: { __Tag: "Email"; __Label?: "User email address"; __Variants: "Verified"; __OriginalType: string; } }

// Behavior
type test1 = VerifiedEmail extends Email ? true : false; // true as all VerifiedEmails are Emails
type test2 = Email extends VerifiedEmail ? true : false; // false as not all Emails are VerifiedEmails
```

---

### Traits (additive capabilities)

Traits allow independent metadata addition/removal.

#### Structure

**`Trait.Declare<Trait>`**

- **Trait:** Unique identifier which can string or symbol.

#### Basic example

```ts
import { Phantom } from '@vicin/phantom';

// types
type PII = Phantom.Trait.Declare<'PII'>;

// assertors
const addPII = Phantom.assertors.addTrait<PII>();
const dropPII = Phantom.assertors.dropTrait<PII>();

// add trait
let location = 'location';
location = addPII(location); // type: string & { __Phantom: { __Traits: { PII: true; }; __OriginalType: string; } }

// drop trait
location = dropPII(location); // type: string
```

#### Multi add and drop

```ts
// types
type PII = Phantom.Trait.Declare<'PII'>;
type Validated = Phantom.Trait.Declare<'Validated'>;

// assertors
const addValidatedPII = Phantom.assertors.addTraits<[PII, Validated]>();
const dropValidatedPII = Phantom.assertors.dropTraits<[PII, Validated]>();

// add traits
let location = 'location';
location = addValidatedPII(location); // type: string & { __Phantom: { __Traits: { PII: true; Validated: true; }; __OriginalType: string; } }

// drop traits
location = dropValidatedPII(location); // type: string
```

---

### Transformations (Type pipe-like behavior)

Traits allow complex type transformations that remember original value, it defines new identity of the value (e.g. `Encoded`) while storing original input type (e.g. `string`).

So basically you have:

- **Transformed:** New type after transformation (e.g. `Uint8Array` after `Encoding`).
- **Input:** Original type of value (e.g. `string`, `number` or whatever value that is `Encoded`).

Type identity is `Transformed` and stores `Input` under special field inside `__Phantom` which is `__Input`.

#### Structure

**`Transformation.Declare<Input, Tag, Label?, Base?, Variants?>`**

- **Input:** Type input to the transformation.
- **Tag:** Unique identifier of transformed which can string or symbol.
- **Label?:** Optional label description of transformed. can be set to `never`.
- **Base?:** Optional base that constrains identity of transformed so only `Uint8Array` for example can be casted as `Encoded`. can be set to `never` or `unknown`.
  Type passed is also added to declared `Transformation` (`<Base> & <PhantomObject>`).
- **Variants?:** Optional variants (states) of the identity. can be set to `never`.

#### Basic example

```ts
import { Phantom } from '@vicin/phantom';

// type
type Encoded<I = unknown> = Phantom.Transformation.Declare<
  I,
  'Encoded',
  'Encoded value',
  Uint8Array // Encoded value should be 'Uint8Array'
>;

// assertors
const applyEncode = Phantom.assertors.applyTransformation<Encoded>();
const revertEncode = Phantom.assertors.revertTransformation<Encoded>();
```

As you have seen the type `Encoded` is generic, so we can pass `Input` to it and represent any type we want to mark as being `Encoded`.

#### Apply / Revert pattern

Now we define our `Encode` function to apply and revert transformation:

```ts
function encode<V>(value: V) {
  const encoded = value as Uint8Array; // replace with actual encoding
  return applyEncode(value, encoded);
}

function decode<E extends Encoded>(encoded: E) {
  const decoded = encoded; // replace with actual decoding
  return revertEncode(encoded, decoded);
}

const value = 'some value';
const encoded = encode(value); // type: Uint8Array<ArrayBufferLike> & { __Phantom: { __Input: string; __Tag: "Encoded"; __Label?: "Encoded value"; __OriginalType?: Uint8Array<ArrayBufferLike>; }; }
const decoded = decode(encoded); // type: string
```

#### Repeated Apply / Revert

You can apply single transformation multiple times on a value and `Phantom` will store value from each step as an `Input` to the next step, so if you encoded single value 2 times you will need to decode it 2 times as well to get the original type.

```ts
const value = 'some value';
const encoded1 = encode(value); // '__Input' here is 'string'
const encoded2 = encode(encoded1); // '__Input' here is 'typeof encoded1'
const decoded1 = decode(encoded2); // type here is 'typeof encoded2'
const original = decode(decoded1); // type here is 'string'
```

Same applies to different transformations, so if you `Encoded` then `Encrypted` a value, you will need to `Decrypt` first then `Decode`.

#### Base

Same behavior as [`Identity`](#identities-with-constraints)

#### Variants

Same behavior as [`Identity`](#identities-with-constraints)

---

### Errors

This library return `ErrorType` instead of using type constraints or returning `never` which makes debugging for errors much easier.
When passed value violate specific rule, descripted `ErrorType` is returned.

**ErrorTypes:**

- **ALREADY_BRANDED:** Error returned if already branded value (with `Identity`) is passed to `.Assign<>` again.

- **TYPE_NOT_EXTEND_BASE:** Error returned if type not extend `Base` constraint of `Identity`.

- **TRANSFORMATION_MISMATCH:** Error returned if type passed to `Transformation.Revert<>` is different from `Transformation` intended.

- **NOT_TRANSFORMED:** Error returned if you tried to revert a non-transformed type.

All the types inside `Phantom` check for `ErrorType` first before applying any change, so if you tried to pass `ErrorType` to `Identity.Assign<>` or `asIdentity<B>()` for example the error will return unchanged.

---

### Symbols

In earlier examples we used strings as our tags just for simplicity, this is acceptable but in real-life projects it's better to use `unique symbol` as a tag so your types are truly unique.

```ts
import { Phantom } from '@vicin/phantom';

// type
declare const __UserId: unique symbol;
type UserId = Phantom.Identity.Declare<typeof __UserId, 'User id'>;

// assertor
export const asUserId = Phantom.assertors.asBrand<UserId>();
```

Now `UserId` can't be re-defined anywhere else in the codebase.

---

### Imports

Some devs (including me) may find `Phantom` namespace everywhere repetitive and prefer using `Brand` or `assertors` directly, every namespace under `Phantom` can be imported alone:

```ts
import { Identity, assertors } from '@vicin/phantom';

// type
declare const __UserId: unique symbol; // declare type only unique symbol to be our tag
type UserId = Identity.Declare<typeof __UserId, 'User id'>;

// assertor
export const asUserId = assertors.asBrand<UserId>();
```

If you prefer default imports you can just:

```ts
import P from '@vicin/phantom';

// type
declare const __UserId: unique symbol; // declare type only unique symbol to be our tag
type UserId = P.Identity.Declare<typeof __UserId, 'User id'>;

// assertor
export const asUserId = P.assertors.asBrand<UserId>();
```

Also you can import single run-time function as `assertor functions` and `stripPhantom` function:

```ts
import { asBrand } from '@vicin/phantom';

export const asUserId = assertors.asBrand<UserId>();
```

You are free to pick whatever pattern you are comfortable with.

---

## Chaining

If you need to call multiple assertors on a single value (e.g. mark brand and attach two traits) the code can get messy:

```ts
import { Identity, Trait, assertors } from '@vicin/phantom';

type UserId = Identity.Declare<'UserId', 'User id', string>;
const asUserId = assertors.asBrand<UserId>();

type PII = Trait.Declare<'PII'>;
const addPII = assertors.addTrait<PII>();

type Validated = Trait.Declare<'Validated'>;
const addValidated = assertors.addTrait<Validated>();

const userId = addValidated(addPII(asUserId('123'))); // <-- ugly nesting
```

Instead you can use `PhantomChain` class:

```ts
import { PhantomChain } from '@vicin/phantom';

const userId = new PhantomChain('123')
  .with(asUserId)
  .with(addPII)
  .with(addValidated)
  .end();
```

The `.with()` is order sensitive, so previous example is equivalent to `addValidated(addPII(asUserId("123")))`. also if any `ErrorType` is retuned at any stage of the chain, the chain will break and error will propagate unchanged making debugging much easier.

**Note:**

- With every step new `PhantomChain` instance is created, in most apps this is negligible as `PhantomChain` is just simple object with two methods but avoid using it in hot paths.

---

## Hot-path code ( truly type-only pattern )

In hot-path code every function call matters, and although assertor functions makes code much cleaner but you may prefer to use `as` in performance critical situations so `Phantom` lives in type system entirely and have zero run-time trace, these examples defines best practices to do so:

**Identity**:

```ts
import { Identity } from '@vicin/phantom';

type PostId = Identity.Declare<'PostId'>;
type AsPostId<T> = Identity.Assign<UserId, T>;

const postId = '123' as AsPostId<string>;
```

**Trait**:

```ts
import { Trait } from '@vicin/phantom';

type PII = Trait.Declare<'PII'>;
type AddPII<T> = Trait.Add<PII, T>;
type DropPII<T> = Trait.Drop<PII, T>;

let location1 = 'location' as AddPII<string>;
let location2 = location1 as DropPII<typeof location1>;
```

**Transformation**:

```ts
import { Transformation } from '@vicin/phantom';

type Encoded<T> = Transformation.Declare<T, 'Encoded'>;
type ApplyEncoded<I, T> = Transformation.Apply<Encoded<any>, I, T>;
type RevertEncoded<T, I> = Transformation.Revert<Encoded<any>, T, I>;

function encode<V>(value: V) {
  const encoded = value as Uint8Array; // replace with actual encoding
  return encoded as ApplyEncoded<V, typeof encoded>;
}

function decode<E extends Encoded>(encoded: E) {
  const decoded = encoded as string; // replace with actual decoding
  return decoded as RevertEncoded<E, typeof decoded>;
}
```

**Chaining**:

Chaining is not supported in **type-only pattern** and nesting is the only way to reliably calculate types:

```ts
import { Identity, Trait, assertors } from '@vicin/phantom';

type UserId = Identity.Declare<'UserId', 'User id', string>;
type AsUserId<T> = Identity.Assign<UserId, T>;

type PII = Trait.Declare<'PII'>;
type AddPII<T> = Trait.Add<PII, T>;

type Validated = Trait.Declare<'Validated'>;
type AddValidated<T> = Trait.Add<Validated, T>;

const userId = '123' as AddValidated<AddPII<AsUserId<string>>>;
```

**Note:**

- Maintainability of code is crucial, Use **type-only pattern** only when you have to, but in most cases it's adviced to use assertor functions.

---

## Debugging

When debugging the `__Phantom` object can complicate IDE messages, you can temporarly add `StripPhantom` type or `stripPhantom` function.

---

## API reference

### Core Metadata Namespaces

These handle individual metadata fields in the `__Phantom` object.

- **Label:** Descriptive strings (optional).
  - `Any`: Marker for labeled types.
  - `LabelOf<T>`: Extract label from `T`.
  - `HasLabel<T, L>`: Check if `T` has label `L`.

- **Tag:** Unique nominal identifiers (string/symbol).
  - `Any`: Marker for tagged types.
  - `TagOf<T>`: Extract tag from `T`.
  - `HasTag<T, Ta>`: Check if `T` has tag `Ta`.

- **Variants:** Mutually exclusive states (string unions).
  - `Any`: Marker for variant-bearing types.
  - `VariantsOf<T>`: Extract variant union from `T`.
  - `HasVariants<T>`: Check if `T` has variants.

- **Base:** Runtime type constraints.
  - `Any`: Marker for base-constrained types.
  - `BaseOf<T>`: Extract base from `T`.
  - `HasBase<T, B>`: Check if `T` has base `B`.

- **Input:** Original types in transformations.
  - `Any`: Marker for input-bearing types.
  - `InputOf<T>`: Extract input from `T`.
  - `HasInput<T, I>`: Check if `T` has input `I`.

- **Traits:** Additive capability maps (e.g., `{ TraitKey: true }`).
  - `Any`: Marker for trait-bearing types.
  - `TraitsOf<T>`: Extract trait map from `T`.
  - `TraitKeysOf<T>`: Extract trait keys from `T`.
  - `HasTraits<T, Tr>`: Check if `T` has trait `Tr`.

### Feature Namespaces

These provide nominal typing and metadata operations.

- **Identity**: Brands with bases and variants.
  - `Any`: Marker for identity types.
  - `Declare<T, L, B, V>`: Declare identity with tag `T`, label `L`, base `B`, variants `V`.
  - `Assign<I, T>`: Assign identity `I` to `T` (fails if already branded).
  - `AssignSafe<I, T>`: Safe assignment, return `T` is already has identity.
  - `WithVariant<I, V>`: Set variant `V` on identity `I`.
  - `WithTypeVariant<T, V>`: Set variant `V` on type `T`.
  - `isIdentity<T, I>`: Check if `T` matches identity `I`.

- **Trait:** Additive/removable capabilities.
  - `Any`: Marker for trait types.
  - `Declare<Tr>`: Declare trait with key `Tr`.
  - `Add<Tr, T>`: Add trait `Tr` to `T`.
  - `AddMulti<Tr[], T>`: Add multiple traits to `T`.
  - `Drop<Tr, T>`: Remove trait `Tr` from `T`.
  - `DropMulti<Tr[], T>`: Remove multiple traits from `T`.
  - `HasTrait<T, Tr>`: Check if `T` has trait `Tr`.

- **Transformation:** Reversible type changes with input tracking.
  - `Any`: Marker for transformation types.
  - `Declare<I, T, L, B, V>`: Declare transformation with input `I`, tag `T`, label `L`, base `B`, variants `V`.
  - `Apply<Tr, I, T>`: Apply transformation `Tr` from input `I` to `T`.
  - `Revert<Tr, T, I>`: Revert transformation `Tr` from `T` to input `I`.
  - `RevertAny<T, I>`: Revert any transformation from `T` to `I`.
  - `isTransformed<T, Tr>`: Check if `T` is transformed with `Tr`.

### Inspect Namespace

Query utilities for metadata.

- `PhantomOf<T>`: Extract full `__Phantom` object from `T`.
- `StripPhantom<T>`: Remove `__Phantom` from `T`.
- `stripPhantom(value)`: Runtime helper to strip metadata (for debugging).

Aliases for core and feature extractors: `LabelOf<T>`, `HasLabel<T, L>`, `TagOf<T>`, `HasTag<T, Ta>`, `VariantsOf<T>`, `HasVariants<T>`, `BaseOf<T>`, `HasBase<T, B>`, `InputOf<T>`, `HasInput<T>`, `TraitsOf<T>`, `TraitKeysOf<T>`, `HasTraits<T, Tr>`, `isBrand<T, B>`, `isIdentity<T, I>`, `HasTrait<T, Tr>`, `isTransformed<T, Tr>`.

### assertors Namespace

Zero-cost casting functions.

`asIdentity<I>()`: Assign identity `I`.
`addTrait<Tr>()`: Add trait `Tr`.
`addTraits<Tr[]>()`: Add multiple traits `Tr[]`.
`dropTrait<Tr>()`: Remove trait `Tr`.
`dropTraits<Tr[]>()`: Remove multiple traits `Tr[]`.
`applyTransformation<Tr>()`: Apply transformation `Tr` (takes `input`, `transformed`).
`revertTransformation<Tr>()`: Revert transformation `Tr` (takes `transformed`, `input`).

### Other Utilities

`ErrorType<E>`: Unique error type for violations (e.g., `already branded`).
`PhantomChain`: Fluent class for chaining assertors (`.with(assertor)` and `.end()`).

---

## Full examples

### Brand & Identity

Defining brands and identities at our app entry points after validation:

```ts
import { Identity, assertors } from '@vicin/phantom';

declare const __UserId: unique symbol;
type UserId = Identity.Declare<typeof __UserId, 'UserId', string>;
const asUserId = assertors.asBrand<UserId>();

function validateUserId(userId: string) {
  const valid = userId; // replace with actual validation
  return asUserId(valid);
}

// Function guarded by UserId so only return of asUserId in our validation function can be passed here
function registerUser(userId: UserId) {
  // handle registring
}

const input = 'some user id';
const validUserId = validateUserId(input);
registerUser(validUserId); // no error
registerUser('Invalid user id'); // throws an error: Argument of type 'string' is not assignable to parameter of type '{ __Phantom: { __Tag: unique symbol; __Label?: "UserId"; }; }'.
```

---

### Traits

Marking values with special traits, for example 'PII' to avoid logging personal information:

```ts
import { Trait, assertors } from '@vicin/phantom';

declare const __PII: unique symbol;
type PII = Phantom.Trait.Declare<typeof __PII>;
const addPII = Phantom.assertors.addTrait<PII>();

function log<T>(value: T extends PII ? never : T) {}

const publicValue = 'some value';
const secretValue = addPII('secret value');

log(publicValue); // no error
log(secretValue); // throws an error: Argument of type '_Add<PII, "secret value">' is not assignable to parameter of type 'never'.
```

---

### Transformation

Transformations shine in pipelines, typically `apply`/`revert` assertors are used inside `apply`/`revert` functions, which creates full type-safe pipe that remember type before each step:

```ts
import { Transformation, assertors } from '@vicin/phantom';

/** --------------------------
 * Encode type and functions
 * -------------------------- */

declare const __Encoded: unique symbol;
type Encoded<I = unknown> = Transformation.Declare<
  I,
  typeof __Encoded,
  'Encoded value',
  Uint8Array
>;
const applyEncode = assertors.applyTransformation<Encoded>();
const revertEncode = assertors.revertTransformation<Encoded>();

function encode<V>(value: V) {
  const encoded = value as Uint8Array; // replace with actual encoding
  return applyEncode(value, encoded);
}

function decode<E extends Encoded>(encoded: E) {
  const decoded = encoded; // replace with actual decoding
  return revertEncode(encoded, decoded);
}

/** --------------------------
 * Encrypt type and functions
 * -------------------------- */

declare const __Encrypted: unique symbol;
type Encrypted<I = unknown> = Transformation.Declare<
  I,
  typeof __Encrypted,
  'Encrypted value',
  Uint8Array
>;
const applyEncrypt = assertors.applyTransformation<Encrypted>();
const revertEncrypt = assertors.revertTransformation<Encrypted>();

function encrypt<V>(value: V) {
  const encrypted = value as Uint8Array; // replace with actual encryption
  return applyEncrypt(value, encrypted);
}

function decrypt<E extends Encrypted>(encrypted: E) {
  const decrypted = encrypted; // replace with actual decryption
  return revertEncrypt(encrypted, decrypted);
}

/** --------------------------
 * Usage: encode then encrypt a value
 * -------------------------- */

const value = 'some value';

// apply
const encoded = encode(value);
const encrypted = encrypt(encoded);

// revert
const decrypted = decrypt(encrypted);
const orignalValue = decode(decrypted);

// if you tried to decode for example before decrypting:
const originalValue = decode(encrypted); // throws an error: Type 'typeof __Encrypted' is not assignable to type 'typeof __Encoded' in the last line.

/** --------------------------
 * Usage: safe-guards
 * -------------------------- */

// if we need encoded then encrypted string in our function we can just:
function save(enc: Encrypted<Encoded<string>>) {
  // handle save into db here
}

save(encrypted); // no errors
save(encoded); // throws an error: Type 'string' is not assignable to type '{ __Phantom: { __Input: string; __Tag: unique symbol; __Label?: "Encoded value"; __Base?: Uint8Array<ArrayBufferLike>; }; }'.
save('some string'); // throws an error: Argument of type 'string' is not assignable to parameter of type '{ __Phantom: { __Input: { __Phantom: { __Input: string; __Tag: unique symbol; __Label?: "Encoded value"; __Base?: Uint8Array<ArrayBufferLike>; }; }; __Tag: unique symbol; __Label?: "Encrypted value"; __Base?: Uint8Array<...>; }; }'.
```

Also it can be used in one-way transformations (e.g. `Hashed`):

```ts
import { Transformation, assertors } from '@vicin/phantom';

declare const __Hashed: unique symbol;
type Hashed<I = unknown> = Transformation.Declare<
  I,
  typeof __Hashed,
  'Hashed value',
  string
>;
const applyHash = assertors.applyTransformation<Hashed>();

function hash<V>(value: V) {
  const hashed = value as string; // replace with actual hash
  return applyHash(value, hashed);
}
```

---

## Deprecated API

### Brand

To unify Api surface `Identity` should be used instead. **marked with `deprecated` and will be removed in v2.0.0**

### asBrand

To unify Api surface `asIdentity` should be used instead. **marked with `deprecated` and will be removed in v2.0.0**

### isBrand

To unify Api surface `isIdentity` should be used instead. **marked with `deprecated` and will be removed in v2.0.0**

---

## Sigil

`Sigil` is another lightweight TypeScript library I created for **nominal identity on classes**, providing compile-time branding and reliable runtime type checks. It solves the unreliability of `instanceof` in monorepos, bundled/HMR environments (where classes can duplicate), and manual branding boilerplate in DDD by using `symbols`, `lineages`, and a `centralized registry` for stable identity across codebases.

`Sigil` works seamlessly in conjunction with `Phantom`,use `Phantom` for nominal typing on primitives/objects (type-only metadata), and `Sigil` for classes. Together, they enable comprehensive domain modeling: e.g., a Phantom-branded `UserId` could be a property in a Sigil-branded `User` class, combining zero-runtime primitive safety with robust class-level checks.

- **GitHub: [@sigil](https://github.com/ZiadTaha62/sigil)**
- **NPM: [@sigil](https://www.npmjs.com/package/@vicin/sigil)**

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
