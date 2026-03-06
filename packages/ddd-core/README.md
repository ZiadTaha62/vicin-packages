# @vicin/ddd-core

**Production-grade Domain-Driven Design primitives for TypeScript**

Clean, type-safe, immutable-by-default building blocks that make DDD actually enjoyable in TypeScript.

[![npm version](https://img.shields.io/npm/v/@vicin/ddd-core.svg)](https://www.npmjs.com/package/@vicin/ddd-core)
[![License](https://img.shields.io/npm/l/@vicin/ddd-core)](https://github.com/vicin/ddd-core/blob/main/LICENSE)

## Why @vicin/ddd-core?

Most DDD libraries in TS are either too anemic or too magical.  
This one gives you:

- True immutability with `clone()` everywhere
- Built-in identity enforcement in collections
- Configurable ID generation (cuid2, UUIDv7, ULID, Snowflake…)
- First-class `DomainResult` + proper error hierarchy
- Full Specification pattern with combinators
- Excellent JSON serialization / reconstitution story
- Dev-only deep freeze to catch mutations early

## Installation

```bash
npm install @vicin/ddd-core @vicin/sigil
# or
pnpm add @vicin/ddd-core @vicin/sigil
```
