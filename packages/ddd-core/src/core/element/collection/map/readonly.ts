// import { type GetInstance, withSigilTyped } from '@vicin/sigil';
// import { DomainObject } from '../../../base';
// import type { InvariantError } from '../../../error';
// import type { Constructor } from '../../../../types';
// import { DomainResult } from '../../../../result';
// import { getConstructor } from '../../../../helpers';
// import { duplicateIdErr, type DomainMapKey, type DomainMapValue } from './shared';
// import type { DomainMap } from './immutable';
// import type { MutableDomainMap } from './mutable';
// import type { DateValueObject, IdValueObject } from '../../value-object';

// type ConstructableDomainMap<K extends DomainMapKey, V extends DomainMapValue> = Constructor<
//   ReadOnlyDomainMap<K, V>,
//   [value?: Map<K, V> | [K, V][], deepClone?: boolean]
// >;

// class _ReadOnlyDomainMap<K extends DomainMapKey, V extends DomainMapValue> extends DomainObject {
//   override get [Symbol.toStringTag]() {
//     return 'DomainMap';
//   }

//   static override readonly domainType: 'Map' = 'Map';
//   override readonly domainType: 'Map' = 'Map';

//   private readonly internalMap: Map<string, [K, V]> = new Map();

//   readonly isReadOnly: boolean = true;

//   constructor(value?: Map<K, V> | [K, V][], deepClone?: boolean) {
//     super();
//     if (value)
//       for (const [k, v] of value)
//         this.internalMap.set(k.toId(), [deepClone ? k.clone() : k, deepClone ? (v.clone() as V) : v]);
//   }

//   static from<K extends DomainMapKey, V extends DomainMapValue, T extends typeof ReadOnlyDomainMap<K, V>>(
//     this: T,
//     value: Map<K, V> | [K, V][],
//     deepClone?: boolean
//   ): DomainResult<GetInstance<T>, InvariantError> {
//     const seen: Set<string> = new Set();
//     for (const [k] of value) {
//       const id = k.toId();
//       if (seen.has(id)) return DomainResult.err(duplicateIdErr(id, (this as any).SigilEffectiveLabel));
//       seen.add(id);
//     }

//     return DomainResult.ok(new this(value, deepClone) as any);
//   }

//   static fromTrusted<T, K extends DomainMapKey, V extends DomainMapValue>(
//     this: T,
//     value: Map<K, V> | [K, V][],
//     deepClone?: boolean
//   ): GetInstance<T> {
//     return new this(value, deepClone) as any;
//   }

//   static merge<T>(
//     this: T,
//     maps: (ReadOnlyDomainMap<any, any> | DomainMap<any, any> | MutableDomainMap<any, any>)[],
//     deepClone?: boolean
//   ): DomainResult<GetInstance<T>, InvariantError> {
//     const seen: Set<string> = new Set();
//     const merged = new Map();
//     for (const m of maps)
//       for (const [k, v] of m) {
//         const id = k.toId();
//         if (seen.has(id)) return DomainResult.err(duplicateIdErr(id, (this as any).SigilEffectiveLabel));
//         merged.set(k, v);
//         seen.add(id);
//       }
//     return DomainResult.ok(new (this as T & ConstructableDomainMap<any, any>)(merged, deepClone) as GetInstance<T>);
//   }

//   static mergeTrusted<T>(
//     this: T,
//     maps: (ReadOnlyDomainMap<any, any> | DomainMap<any, any> | MutableDomainMap<any, any>)[],
//     deepClone?: boolean
//   ): GetInstance<T> {
//     const merged = new Map();
//     for (const m of maps) for (const [k, v] of m) merged.set(k, v);
//     return new (this as T & ConstructableDomainMap<any, any>)(merged, deepClone) as GetInstance<T>;
//   }

//   has(key: K): boolean {
//     return this.internalMap.has(key.toId());
//   }

//   get(key: K): V | undefined {
//     return this.internalMap.get(key.toId())?.[1];
//   }

//   *keys(): IterableIterator<K> {
//     for (const [k] of this.internalMap.values()) yield k;
//   }

//   *values(): IterableIterator<V> {
//     for (const [, v] of this.internalMap.values()) yield v;
//   }

//   *entries(): IterableIterator<[K, V]> {
//     for (const [k, v] of this.internalMap.values()) yield [k, v];
//   }

//   forEach(fn: (value: V, key: K) => void): void {
//     for (const [k, v] of this.entries()) fn(v, k);
//   }

//   isEmpty(): boolean {
//     return this.internalMap.size === 0;
//   }

//   get size(): number {
//     return this.internalMap.size;
//   }

//   [Symbol.iterator]() {
//     return this.entries();
//   }

//   equals(other: ReadOnlyDomainMap<any, any>): boolean {
//     if (!ReadOnlyDomainMap.isOfType(other)) return false;
//     if (this.size !== other.size) return false;
//     for (const [key, value] of this) {
//       if (!other.has(key)) return false;
//       const otherValue = other.get(key);
//       if (!otherValue || !value.equals(otherValue)) return false;
//     }
//     return true;
//   }

//   override toString(): string {
//     const entries = Array.from(this.internalMap.entries());
//     entries.sort(([a], [b]) => a.localeCompare(b));
//     return entries.map(([, [k, v]]) => `${k.toString()} -> ${v.toString()}`).join(', ');
//   }

//   toJSON(): [ReturnType<K['toJSON']>, ReturnType<V['toJSON']>][] {
//     const entries = Array.from(this.internalMap.entries());
//     entries.sort(([a], [b]) => a.localeCompare(b));
//     return entries.map(([, [k, v]]) => [k.toJSON(), v.toJSON()]) as [
//       ReturnType<K['toJSON']>,
//       ReturnType<V['toJSON']>,
//     ][];
//   }

//   clone(deepClone?: boolean): this {
//     const t = this as _ReadOnlyDomainMap<K, V>;
//     const ctor = getConstructor(t, 'DomainMap', t.getSigilEffectiveLabel(), 'clone') as ConstructableDomainMap<K, V>;
//     return new ctor(Array.from(t.entries()), deepClone) as any;
//   }

//   protected hasInternal(id: string): boolean {
//     return this.internalMap.has(id);
//   }

//   protected setInternal(key: K, value: V, id: string, deepClone?: boolean): void {
//     if (this.isReadOnly) return;
//     this.internalMap.set(id, [deepClone ? key.clone() : key, deepClone ? (value.clone() as V) : value]);
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

// export const ReadOnlyDomainMap = withSigilTyped(_ReadOnlyDomainMap, '@vicin/ddd-core.ReadOnlyDomainMap');
// export type ReadOnlyDomainMap<K extends DomainMapKey, V extends DomainMapValue> = InstanceType<
//   typeof ReadOnlyDomainMap<K, V>
// >;
// type x = ReadOnlyDomainMap<any, any>['__SIGIL_BRAND__'];
