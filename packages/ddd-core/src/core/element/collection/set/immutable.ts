import { type GetInstance, withSigilTyped } from '@vicin/sigil';
import type { InvariantError } from '../../../error';
import { DomainResult } from '../../../../result';
import { ReadOnlyDomainSet } from './readonly';
import { duplicateIdErr, type DomainSetValue } from './shared';
import { MutableDomainSet } from './mutable';

class _DomainSet<V extends DomainSetValue> extends ReadOnlyDomainSet<V> {
  override readonly isReadOnly: boolean = false;

  add<T>(this: T, value: V, deepClone?: boolean): DomainResult<T, InvariantError> {
    const t = this as _DomainSet<V>;
    const id = value.toId();
    if (t.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, t.getSigilEffectiveLabel()));
    const clone = t.clone();
    clone.addInternal(value, id, deepClone);
    return DomainResult.ok(clone as T);
  }

  upsert<T>(this: T, value: V, deepClone?: boolean): T {
    const t = this as _DomainSet<V>;
    const clone = t.clone();
    clone.addInternal(value, value.toId(), deepClone);
    return clone as T;
  }

  delete(value: V): boolean {
    const clone = this.clone();
    return clone.deleteInternal(value.toId());
  }

  clear(): void {
    const clone = this.clone();
    clone.clearInternal();
  }

  mapValues<U extends DomainSetValue>(fn: (value: V) => U): DomainSet<U> {
    const clone = this.clone();
    for (const v of this.values()) {
      const newValue = fn(v);
      clone.addInternal(newValue as any, newValue.toId());
    }
    return clone as unknown as DomainSet<U>;
  }

  mapEntries<U extends DomainSetValue>(fn: (value: V, key: V) => [U, U]): DomainSet<U> {
    const clone = this.clone();
    for (const v of this.values()) {
      const [newV] = fn(v, v);
      clone.deleteInternal(v.toId());
      clone.addInternal(newV as any, newV.toId());
    }
    return clone as unknown as DomainSet<U>;
  }

  filter<T>(this: T, fn: (value: V) => boolean): T {
    const t = this as _DomainSet<V>;
    const clone = t.clone();
    for (const v of t.values()) {
      const bol = fn(v);
      if (!bol) clone.deleteInternal(v.toId());
    }
    return clone as T;
  }

  merge<T>(this: T, other: DomainSet<V> | MutableDomainSet<V>, deepClone?: boolean): DomainResult<T, InvariantError> {
    const t = this as _DomainSet<V>;
    for (const v of other.values()) {
      const id = v.toId();
      if (t.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, t.getSigilEffectiveLabel()));
    }
    const clone = t.clone();
    for (const v of other.values()) clone.addInternal(v, v.toId(), deepClone);
    return DomainResult.ok(clone as T);
  }

  mergeTrusted<T>(this: T, other: DomainSet<V> | MutableDomainSet<V>, deepClone?: boolean): T {
    const t = this as _DomainSet<V>;
    const clone = t.clone();
    for (const v of other.values()) clone.addInternal(v, v.toId(), deepClone);
    return clone as T;
  }
}

export const DomainSet = withSigilTyped(_DomainSet, '@vicin/ddd-core.DomainSet');
export type DomainSet<V extends DomainSetValue> = GetInstance<typeof DomainSet<V>>;
