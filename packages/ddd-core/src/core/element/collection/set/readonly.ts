// import { type GetInstance, withSigilTyped } from '@vicin/sigil';
// import { DomainObject } from '../../../base';
// import type { InvariantError } from '../../../error';
// import { DomainResult } from '../../../../result';
// import type { Constructor } from '../../../../types';
// import { getConstructor } from '../../../../helpers';
// import { duplicateIdErr, type DomainSetValue } from './shared';
// import type { DomainSet } from './immutable';
// import type { MutableDomainSet } from './mutable';

// type ConstructableDomainSet<V extends DomainSetValue> = Constructor<
//   ReadOnlyDomainSet<V>,
//   [value?: Set<V> | V[], deepClone?: boolean]
// >;

// class _ReadOnlyDomainSet<V extends DomainSetValue> extends DomainObject {
//   override get [Symbol.toStringTag]() {
//     return 'DomainSet';
//   }

//   static override readonly domainType: 'Set' = 'Set';
//   override readonly domainType: 'Set' = 'Set';

//   readonly isReadOnly: boolean = true;

//   /** String based set to allow look-ups by value */
//   private readonly internalMap: Map<string, V> = new Map();

//   protected constructor(value?: Set<V> | V[], deepClone?: boolean) {
//     super();
//     if (value) for (const v of value) this.internalMap.set(v.toId(), deepClone ? (v.clone() as V) : v);
//   }

//   static from<T, V extends DomainSetValue>(
//     this: T,
//     value?: Set<V> | V[],
//     deepClone?: boolean
//   ): DomainResult<GetInstance<T>, InvariantError> {
//     const seen: Set<string> = new Set();
//     if (value)
//       for (const v of value) {
//         const id = v.toId();
//         if (seen.has(id)) return DomainResult.err(duplicateIdErr(id, (this as any).SigilEffectiveLabel));
//         seen.add(id);
//       }
//     return DomainResult.ok(new (this as T & ConstructableDomainSet<V>)(value, deepClone) as GetInstance<T>);
//   }

//   static fromTrusted<T, V extends DomainSetValue>(this: T, value?: Set<V> | V[], deepClone?: boolean): GetInstance<T> {
//     return new (this as T & ConstructableDomainSet<V>)(value, deepClone) as GetInstance<T>;
//   }

//   static merge<T>(
//     this: T,
//     sets: (ReadOnlyDomainSet<any> | DomainSet<any> | MutableDomainSet<any>)[],
//     deepClone?: boolean
//   ): DomainResult<GetInstance<T>, InvariantError> {
//     const seen: Set<string> = new Set();
//     const merged = new Set();
//     for (const s of sets)
//       for (const v of s) {
//         const id = v.toId();
//         if (seen.has(id)) return DomainResult.err(duplicateIdErr(id, (this as any).SigilEffectiveLabel));
//         merged.add(v);
//         seen.add(id);
//       }
//     return DomainResult.ok(new (this as T & ConstructableDomainSet<any>)(merged, deepClone) as GetInstance<T>);
//   }

//   static mergeTrusted<T>(
//     this: T,
//     sets: (ReadOnlyDomainSet<any> | DomainSet<any> | MutableDomainSet<any>)[],
//     deepClone?: boolean
//   ): GetInstance<T> {
//     const merged = new Set();
//     for (const s of sets) for (const v of s) merged.add(v);
//     return new (this as T & ConstructableDomainSet<any>)(merged, deepClone) as GetInstance<T>;
//   }

//   // -----------------------------
//   // Set-like public API
//   // -----------------------------

//   has(value: V): boolean {
//     return this.internalMap.has(value.toId());
//   }

//   *keys(): IterableIterator<V> {
//     for (const v of this.internalMap.values()) yield v;
//   }

//   *values(): IterableIterator<V> {
//     for (const v of this.internalMap.values()) yield v;
//   }

//   *entries(): IterableIterator<[V, V]> {
//     for (const v of this.internalMap.values()) yield [v, v];
//   }

//   forEach(fn: (value: V, value2: V) => void): void {
//     for (const v of this) fn(v, v);
//   }

//   isEmpty(): boolean {
//     return this.internalMap.size === 0;
//   }

//   get size(): number {
//     return this.internalMap.size;
//   }

//   [Symbol.iterator]() {
//     return this.values();
//   }

//   equals(other: ReadOnlyDomainSet<any>): boolean {
//     if (!ReadOnlyDomainSet.isOfType(other)) return false;
//     if (this.size !== other.size) return false;
//     for (const v of this) if (!other.has(v)) return false;
//     return true;
//   }

//   override toString(): string {
//     const entries = Array.from(this.internalMap.entries());
//     entries.sort(([a], [b]) => a.localeCompare(b));
//     return entries.map(([, v]) => v.toString()).join(', ');
//   }

//   toJSON(): ReturnType<V['toJSON']>[] {
//     const entries = Array.from(this.internalMap.entries());
//     entries.sort(([a], [b]) => a.localeCompare(b));
//     return entries.map(([, value]) => value.toJSON()) as ReturnType<V['toJSON']>[];
//   }

//   clone<T>(this: T, deepClone?: boolean): T {
//     const t = this as _ReadOnlyDomainSet<V>;
//     const ctor = getConstructor(t, 'DomainSet', t.getSigilEffectiveLabel(), 'clone') as ConstructableDomainSet<V>;
//     return new ctor(Array.from(t.internalMap.values()), deepClone) as T;
//   }

//   protected hasInternal(id: string): boolean {
//     return this.internalMap.has(id);
//   }

//   protected addInternal(value: V, id: string, deepClone?: boolean): void {
//     if (this.isReadOnly) return;
//     this.internalMap.set(id, deepClone ? (value.clone() as V) : value);
//   }

//   protected deleteInternal(id: string): boolean {
//     if (this.isReadOnly) return false;
//     return this.internalMap.delete(id);
//   }

//   protected clearInternal(): void {
//     if (this.isReadOnly) return;
//     this.internalMap.clear();
//   }
// }

// export const ReadOnlyDomainSet = withSigilTyped(_ReadOnlyDomainSet, '@vicin/ddd-core.ReadOnlyDomainSet');
// export type ReadOnlyDomainSet<V extends DomainSetValue> = GetInstance<typeof ReadOnlyDomainSet<V>>;
