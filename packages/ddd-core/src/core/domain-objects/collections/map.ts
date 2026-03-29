import { AttachSigil, type sigil, type ExtendSigil, isEqual } from '../../../external';
import { DomainCollectionBase, toKey } from './collection';
import { Collection } from '../../../markers';
import type { DomainObject, StateOf } from '../object';

@AttachSigil('@vicin/ddd-core.SharedDomainMap')
abstract class SharedDomainMap<K, V> extends DomainCollectionBase<[K, V][]> {
  declare [sigil]: ExtendSigil<'SharedDomainMap', DomainCollectionBase<any>>;

  protected map: Map<unknown, [K, V]> = new Map();

  constructor(value?: Map<K, V> | [K, V][]) {
    super();
    if (value) {
      for (const [k, v] of value) this.map.set(this.toKey(k), [k, v]);
    }
  }

  static override reconstitute<D extends DomainObject<any, any>>(state: StateOf<D>): D {
    const mappedState = new Map();
    for (const [key, value] of state as [unknown, unknown][]) {
      mappedState.set(toKey(key, false), [key, value]);
    }

    return super.reconstitute(mappedState as any, 'map');
  }

  has(key: K): boolean {
    return this.map.has(this.toKey(key));
  }

  get(key: K): V | undefined {
    return this.map.get(this.toKey(key))?.[1];
  }

  *keys(): IterableIterator<K> {
    for (const [k] of this.map.values()) yield k;
  }

  *values(): IterableIterator<V> {
    for (const [, v] of this.map.values()) yield v;
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [k, v] of this.map.values()) yield [k, v];
  }

  forEach(fn: (value: V, key: K) => void): void {
    for (const [k, v] of this) fn(v, k);
  }

  isEmpty(): boolean {
    return this.map.size === 0;
  }

  get size(): number {
    return this.map.size;
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  override equals(other: this): boolean {
    if (!SharedDomainMap.isInstance(other)) return false;
    if (this.size !== other.size) return false;
    for (const [k, v] of this) {
      if (!other.has(k)) return false;
      if (!isEqual(v, other.get(k))) return false;
    }
    return true;
  }

  getState() {
    return [...this];
  }
}

/**
 * Immutable domain map.
 *
 * Provides value-based semantics over a Map:
 * - Setting a value returns a new instance
 * - Keys are normalized using domain rules
 */
@Collection('@vicin/ddd-core.DomainMap')
export class DomainMap<K, V> extends SharedDomainMap<K, V> {
  declare [sigil]: ExtendSigil<'DomainMap', SharedDomainMap<K, V>>;

  override get [Symbol.toStringTag]() {
    return 'DomainMap';
  }

  /**
   * Creates a DomainMap from a native Map or array of entries.
   *
   * @param value - Initial entries
   */
  static from<K, V>(value: Map<K, V> | [K, V][]): DomainMap<K, V> {
    return new DomainMap(value);
  }

  /**
   * Merge multiple domain or native maps or entiries
   *
   * @param maps - Maps to merge
   */
  static merge<K, V>(
    maps: (DomainMap<K, V> | MutableDomainMap<K, V> | Map<K, V> | [K, V][])[]
  ): DomainMap<K, V> {
    const total: [K, V][] = [];
    for (const m of maps) total.push(...m);
    return new DomainMap(total);
  }

  /**
   * Returns a new DomainMap with the given key/value set.
   */
  set(key: K, value: V): DomainMap<K, V> {
    return new DomainMap([...this, [key, value]]);
  }

  /**
   * Returns a new DomainMap without the given key.
   */
  delete(key: K): DomainMap<K, V> {
    const clone = this.clone();
    clone.map.delete(this.toKey(key));
    return clone;
  }

  /**
   * Returns an empty DomainMap.
   */
  clear(): DomainMap<K, V> {
    return new DomainMap();
  }
}

/**
 * Mutable variant of DomainMap.
 *
 * Unlike DomainMap:
 * - Mutates internal state directly
 * - Returns `this` for chaining
 */
@Collection('@vicin/ddd-core.MutableDomainMap')
export class MutableDomainMap<K, V> extends SharedDomainMap<K, V> {
  declare [sigil]: ExtendSigil<'MutableDomainMap', SharedDomainMap<K, V>>;

  override get [Symbol.toStringTag]() {
    return 'MutableDomainMap';
  }

  /**
   * Creates a DomainMap from a native Map or array of entries.
   *
   * @param value - Initial entries
   */
  static from<K, V>(value: Map<K, V> | [K, V][]): MutableDomainMap<K, V> {
    return new MutableDomainMap(value);
  }

  /**
   * Merge multiple domain or native maps or entiries
   *
   * @param maps - Maps to merge
   */
  static merge<K, V>(
    maps: (DomainMap<K, V> | MutableDomainMap<K, V> | Map<K, V> | [K, V][])[]
  ): MutableDomainMap<K, V> {
    const total: [K, V][] = [];
    for (const m of maps) total.push(...m);
    return new MutableDomainMap(total);
  }

  set(key: K, value: V): MutableDomainMap<K, V> {
    this.map.set(this.toKey(key), [key, value]);
    return this;
  }

  delete(key: K): boolean {
    return this.map.delete(this.toKey(key));
  }

  clear(): void {
    this.map.clear();
  }
}
