import { type GetInstance, withSigilTyped } from '@vicin/sigil';
import type { InvariantError } from '../../../error';
import { DomainResult } from '../../../../result';
import { duplicateIdErr, type DomainSetValue } from './shared';
import { ReadOnlyDomainSet } from './readonly';
import type { DomainSet } from './immutable';

class _MutableDomainSet<V extends DomainSetValue> extends ReadOnlyDomainSet<V> {
  override readonly isReadOnly: boolean = false;

  add<T>(this: T, value: V): DomainResult<T, InvariantError> {
    const t = this as _MutableDomainSet<V>;
    const id = value.toId();
    if (t.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, t.getSigilEffectiveLabel()));
    t.addInternal(value, id);
    return DomainResult.ok(this);
  }

  upsert<T>(this: T, value: V): T {
    const t = this as _MutableDomainSet<V>;
    t.addInternal(value, value.toId());
    return this;
  }

  delete(value: V): boolean {
    return this.deleteInternal(value.toId());
  }

  clear(): void {
    this.clearInternal();
  }

  mapValues<U extends DomainSetValue>(fn: (value: V) => U): MutableDomainSet<U> {
    for (const v of this.values()) {
      const newValue = fn(v);
      this.addInternal(newValue as any, v.toId());
    }
    return this as unknown as MutableDomainSet<U>;
  }

  mapEntries<U extends DomainSetValue>(fn: (value: V) => [U, U]): MutableDomainSet<U> {
    const snapshot = Array.from(this.values());
    for (const v of snapshot) {
      const [newV] = fn(v);
      this.deleteInternal(v.toId());
      this.addInternal(newV as any, newV.toId());
    }

    return this as unknown as MutableDomainSet<U>;
  }

  filter<T>(this: T, fn: (value: V) => boolean): T {
    const t = this as _MutableDomainSet<V>;
    const snapshot = Array.from(t.values());
    for (const v of snapshot) {
      const bol = fn(v);
      if (!bol) t.deleteInternal(v.toId());
    }
    return this;
  }

  merge<T>(this: T, other: DomainSet<V> | MutableDomainSet<V>): DomainResult<T, InvariantError> {
    const t = this as _MutableDomainSet<V>;
    for (const v of other.values()) {
      const id = v.toId();
      if (t.hasInternal(id)) return DomainResult.err(duplicateIdErr(id, t.getSigilEffectiveLabel()));
      t.addInternal(v, id);
    }
    return DomainResult.ok(this);
  }

  mergeTrusted<T>(this: T, other: DomainSet<V> | MutableDomainSet<V>): T {
    const t = this as _MutableDomainSet<V>;
    for (const v of other.values()) t.addInternal(v, v.toId());
    return this;
  }
}

export const MutableDomainSet = withSigilTyped(_MutableDomainSet, '@vicin/ddd-core.MutableDomainSet');
export type MutableDomainSet<V extends DomainSetValue> = GetInstance<typeof MutableDomainSet<V>>;
