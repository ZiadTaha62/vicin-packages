import { type sigil, type ExtendSigil, isEqual } from '../../../utils';
import type { DomainObject, StateOf } from '../base';
import { DomainCollectionBase, toKey, DomainCollection } from './collection';

@DomainCollection('@vicin/ddd-core.SharedDomainSet')
abstract class SharedDomainSet<V> extends DomainCollectionBase<V[]> {
  declare [sigil]: ExtendSigil<'SharedDomainSet', DomainCollectionBase<any>>;

  protected map: Map<unknown, V> = new Map();

  constructor(value?: Set<V> | V[]) {
    super();
    if (value) {
      for (const v of value) this.map.set(this.toKey(v), v);
    }
  }

  static override reconstitute<D extends DomainObject<any, any>>(state: StateOf<D>): D {
    const mappedState = new Map();
    for (const value of state as unknown[]) {
      mappedState.set(toKey(value, false), value);
    }

    return super.reconstitute(mappedState as any, 'map');
  }

  has(value: V): boolean {
    return this.map.has(this.toKey(value));
  }

  get(value: V): V | undefined {
    return this.map.get(this.toKey(value));
  }

  *keys(): IterableIterator<V> {
    for (const v of this.map.values()) yield v;
  }

  *values(): IterableIterator<V> {
    for (const v of this.map.values()) yield v;
  }

  *entries(): IterableIterator<[V, V]> {
    for (const v of this.map.values()) yield [v, v];
  }

  forEach(fn: (value1: V, value2: V, set: this) => void): void {
    for (const v of this) fn(v, v, this);
  }

  isEmpty(): boolean {
    return this.map.size === 0;
  }

  get size(): number {
    return this.map.size;
  }

  [Symbol.iterator]() {
    return this.values();
  }

  override equals(other: this): boolean {
    if (!SharedDomainSet.isInstance(other)) return false;
    if (this.size !== other.size) return false;
    for (const v of this) {
      if (!other.has(v)) return false;
      if (!isEqual(v, other.get(v))) return false;
    }
    return true;
  }

  getState(): V[] {
    return [...this];
  }

  unwrap(): Set<V> {
    return new Set<V>([...this]);
  }
}

/**
 * Readonly domain set, read only without write methods
 *
 * Provides value-based semantics over a Set:
 * - Values are normalized using domain rules
 */
@DomainCollection('@vicin/ddd-core.ReadOnlyDomainSet')
export class ReadOnlyDomainSet<V> extends SharedDomainSet<V> {
  declare [sigil]: ExtendSigil<'ReadOnlyDomainSet', SharedDomainSet<any>>;

  override get [Symbol.toStringTag]() {
    return 'ReadOnlyDomainSet';
  }

  /**
   * Creates a ReadOnlyDomainSet from a native Set or array.
   *
   * @param value - Initial array
   */
  static from<V>(value: Set<V> | V[]): ReadOnlyDomainSet<V> {
    return new ReadOnlyDomainSet(value);
  }

  /**
   * Merge multiple domain or native sets or arrays into ReadOnlyDomainSet
   *
   * @param maps - Maps to merge
   */
  static merge<V>(
    sets: (DomainSet<V> | MutableDomainSet<V> | ReadOnlyDomainSet<V> | Set<V> | V[])[]
  ): ReadOnlyDomainSet<V> {
    const total: V[] = [];
    for (const s of sets) total.push(...s);
    return new ReadOnlyDomainSet(total);
  }
}

/**
 * Immutable domain set.
 *
 * Provides value-based semantics over a Set:
 * - Adding/removing values returns a new instance
 * - Values are normalized using domain rules
 */
@DomainCollection('@vicin/ddd-core.DomainSet')
export class DomainSet<V> extends SharedDomainSet<V> {
  declare [sigil]: ExtendSigil<'DomainSet', SharedDomainSet<any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainSet';
  }

  /**
   * Creates a DomainSet from a native Set or array.
   *
   * @param value - Initial array
   */
  static from<V>(value: Set<V> | V[]): DomainSet<V> {
    return new DomainSet(value);
  }

  /**
   * Merge multiple domain or native sets or arrays into DomainSet
   *
   * @param maps - Maps to merge
   */
  static merge<V>(
    sets: (DomainSet<V> | MutableDomainSet<V> | ReadOnlyDomainSet<V> | Set<V> | V[])[]
  ): DomainSet<V> {
    const total: V[] = [];
    for (const s of sets) total.push(...s);
    return new DomainSet(total);
  }

  /**
   * Adds a value and returns a new DomainSet.
   */
  add(value: V): DomainSet<V> {
    return new DomainSet([...this, value]);
  }

  /**
   * Removes a value and returns a new DomainSet.
   */
  delete(value: V): DomainSet<V> {
    const clone = this.clone();
    clone.map.delete(this.toKey(value));
    return clone;
  }

  /**
   * Returns an empty DomainSet.
   */
  clear(): DomainSet<V> {
    return new DomainSet();
  }
}

@DomainCollection('@vicin/ddd-core.MutableDomainSet')
export class MutableDomainSet<V> extends SharedDomainSet<V> {
  declare [sigil]: ExtendSigil<'MutableDomainSet', SharedDomainSet<any>>;

  override get [Symbol.toStringTag]() {
    return 'MutableDomainSet';
  }

  /**
   * Creates a DomainSet from a native Set or array.
   *
   * @param value - Initial array
   */
  static from<V>(value: Set<V> | V[]): MutableDomainSet<V> {
    return new MutableDomainSet(value);
  }

  /**
   * Merge multiple domain or native sets or arrays into MutableDomainSet
   *
   * @param maps - Maps to merge
   */
  static merge<V>(
    sets: (DomainSet<V> | MutableDomainSet<V> | ReadOnlyDomainSet<V> | Set<V> | V[])[]
  ): MutableDomainSet<V> {
    const total: V[] = [];
    for (const s of sets) total.push(...s);
    return new MutableDomainSet(total);
  }

  add(value: V): MutableDomainSet<V> {
    this.map.set(this.toKey(value), value);
    return this;
  }

  delete(value: V): boolean {
    return this.map.delete(this.toKey(value));
  }

  clear(): void {
    this.map.clear();
  }
}
