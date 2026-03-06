import { sigil, WithSigil, type ExtendSigil } from '@vicin/sigil';
import type { InvariantError } from '../../../error';
import { DomainResult } from '../../../../result';
import { duplicateIdErr, type DomainMapKey, type DomainMapValue } from './shared';
import { ReadOnlyDomainMap } from './readonly';
import type { MutableDomainMap } from './mutable';
import { getConstructor } from '../../../../helpers';

class _DomainMap<K extends DomainMapKey, V extends DomainMapValue> extends ReadOnlyDomainMap<K, V> {
  override readonly isReadOnly: boolean = false;

  set(key: K, value: V, deepClone?: boolean): DomainResult<this, InvariantError> {
    // get id and check if it's duplicated
    const id = key.toId();
    if (this.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, this.getSigilEffectiveLabel()));

    // clone and set
    const clone = this.clone();
    clone.setInternal(key, value, id, deepClone);

    // return clone
    return DomainResult.ok(clone);
  }

  upsert(key: K, value: V, deepClone?: boolean): this {
    // clone and set
    const clone = this.clone();
    clone.setInternal(key, value, key.toId(), deepClone);

    // return clone
    return clone;
  }

  delete(key: K): this {
    // clone and delete
    const clone = this.clone();
    clone.deleteInternal(key.toId());

    // return clone
    return clone;
  }

  clear(): this {
    // clone and clear
    const clone = this.clone();
    clone.clearInternal();

    // return clone
    return clone;
  }

  mapValues<U extends DomainMapValue>(fn: (value: V, key: K) => U): DomainMap<K, U> {
    // create map that will hold mapped values
    const map: Map<K, U> = new Map();

    // populate map
    for (const [k, v] of this.entries()) map.set(k, fn(v, k));

    // get constructor and create new clone
    const ctor = getConstructor(this, 'DomainMap', this.getSigilEffectiveLabel(), 'mapValues') as typeof DomainMap<
      K,
      U
    >;
    const clone = ctor.fromTrusted(map);

    // return clone
    return clone;
  }

  mapEntries<K2 extends DomainMapKey, V2 extends DomainMapValue>(
    fn: (value: V, key: K) => [K2, V2]
  ): DomainMap<K2, V2> {
    // create map that will hold mapped values
    const map: Map<K2, V2> = new Map();

    // populate map
    for (const [k, v] of this.entries()) {
      const [newKey, newValue] = fn(v, k);
      map.set(newKey, newValue);
    }

    // get constructor and create new clone
    const ctor = getConstructor(this, 'DomainMap', this.getSigilEffectiveLabel(), 'mapValues') as typeof DomainMap<
      K2,
      V2
    >;
    const clone = ctor.fromTrusted(map);

    return clone;
  }

  filter(fn: (value: V, key: K) => boolean): this {
    // clone and filter
    const clone = this.clone();
    for (const [k, v] of this.entries()) {
      const bol = fn(v, k);
      if (!bol) clone.deleteInternal(k.toId());
    }

    // return clone
    return clone;
  }

  merge(other: DomainMap<K, V> | MutableDomainMap<K, V>, deepClone?: boolean): DomainResult<this, InvariantError> {
    // loop and make sure no ids are duplicated
    for (const [k] of other.entries())
      if (this.hasInternal(k.toId())) return DomainResult.err(duplicateIdErr(k.toId(), this.getSigilEffectiveLabel()));

    // clone this and add other into it
    const clone = this.clone();
    for (const pair of other.entries()) clone.setInternal(pair[0], pair[1], pair[0].toId(), deepClone);

    // return clone
    return DomainResult.ok(clone);
  }

  mergeTrusted(other: DomainMap<K, V> | MutableDomainMap<K, V>, deepClone?: boolean): this {
    // clone this and add other into it
    const clone = this.clone();
    for (const pair of other.entries()) clone.setInternal(pair[0], pair[1], pair[0].toId(), deepClone);

    // return clone
    return clone;
  }
}

export const DomainMap = withSigilTyped(_DomainMap, '@vicin/ddd-core.DomainMap');
export type DomainMap<K extends DomainMapKey, V extends DomainMapValue> = GetInstance<typeof DomainMap<K, V>>;
