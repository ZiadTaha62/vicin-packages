import { type GetInstance, withSigilTyped } from '@vicin/sigil';
import type { InvariantError } from '../../../error';
import { DomainResult } from '../../../../result';
import { duplicateIdErr, type DomainMapKey, type DomainMapValue } from './shared';
import { ReadOnlyDomainMap } from './readonly';
import type { DomainMap } from './immutable';

class _MutableDomainMap<K extends DomainMapKey, V extends DomainMapValue> extends ReadOnlyDomainMap<K, V> {
  override readonly isReadOnly: boolean = false;

  set<T>(this: T, key: K, value: V): DomainResult<T, InvariantError> {
    const t = this as _MutableDomainMap<K, V>;
    const id = key.toId();
    if (t.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, t.getSigilEffectiveLabel()));
    t.setInternal(key, value, id);
    return DomainResult.ok(this);
  }

  upsert(key: K, value: V): this {
    this.setInternal(key, value, key.toId());
    return this;
  }

  delete(key: K): boolean {
    return this.deleteInternal(key.toId());
  }

  clear(): void {
    this.clearInternal();
  }

  mapValues<U extends DomainMapValue>(fn: (value: V, key: K) => U): MutableDomainMap<K, U> {
    for (const [k, v] of this.entries()) {
      const newValue = fn(v, k);
      this.setInternal(k, newValue as any, k.toId());
    }
    return this as unknown as MutableDomainMap<K, U>;
  }

  mapEntries<K2 extends DomainMapKey, V2 extends DomainMapValue>(
    fn: (value: V, key: K) => [K2, V2]
  ): MutableDomainMap<K2, V2> {
    const snapshot = Array.from(this.entries());
    for (const [k, v] of snapshot) {
      const [newKey, newValue] = fn(v, k);
      this.deleteInternal(k.toId());
      this.setInternal(newKey as any, newValue as any, newKey.toId());
    }

    return this as unknown as MutableDomainMap<K2, V2>;
  }

  filter<T>(this: T, fn: (value: V, key: K) => boolean): T {
    const t = this as _MutableDomainMap<K, V>;
    const snapshot = Array.from(t.entries());
    for (const [k, v] of snapshot) {
      const bol = fn(v, k);
      if (!bol) t.deleteInternal(k.toId());
    }
    return this;
  }

  merge<T>(this: T, other: DomainMap<K, V> | MutableDomainMap<K, V>): DomainResult<T, InvariantError> {
    const t = this as _MutableDomainMap<K, V>;
    for (const pair of other.entries()) {
      const id = pair[0].toId();
      if (t.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, t.getSigilEffectiveLabel()));
      t.setInternal(pair[0], pair[1], id);
    }
    return DomainResult.ok(this);
  }

  mergeTrusted<T>(this: T, other: DomainMap<K, V> | MutableDomainMap<K, V>): T {
    const t = this as _MutableDomainMap<K, V>;
    for (const pair of other.entries()) t.setInternal(pair[0], pair[1], pair[0].toId());
    return this;
  }
}

export const MutableDomainMap = withSigilTyped(_MutableDomainMap, '@vicin/ddd-core.MutableDomainMap');
export type MutableDomainMap<K extends DomainMapKey, V extends DomainMapValue> = GetInstance<
  typeof MutableDomainMap<K, V>
>;
