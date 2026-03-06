import { WithSigil, sigil, type ExtendSigil } from '@vicin/sigil';
import { deepFreeze, toJSON } from '../../../helpers';
import { OPTIONS } from '../../../options';
import { DomainObject } from '../../base';
import type { JsonValue } from '../../../types';
import type { ValueObjectRawValue, ValueObjectSerializable } from './types';

@WithSigil('@vicin/ddd-core.ValueObject')
export abstract class ValueObject<RawValue extends ValueObjectRawValue>
  extends DomainObject
  implements ValueObjectSerializable
{
  declare [sigil]: ExtendSigil<'ValueObject', DomainObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainValueObject';
  }

  static override readonly domainType: 'ValueObject' = 'ValueObject';
  override readonly domainType: 'ValueObject' = 'ValueObject';

  protected readonly value: RawValue;

  protected constructor(value: RawValue) {
    super();
    this.value = value;
    deepFreeze(this.value);
  }

  static create(): ValueObject<ValueObjectRawValue> {
    throw new Error(
      `[@vicin/ddd-core] Class '${this.name}' with label '${this.SigilEffectiveLabel}' didn't implement '.create()' static method yet`
    );
  }

  static from(value: unknown): ValueObject<ValueObjectRawValue> {
    throw new Error(
      `[@vicin/ddd-core] Class '${this.name}' with label '${this.SigilEffectiveLabel}' didn't implement '.from()' static method yet`
    );
  }

  static reconstitute<V extends ValueObjectRawValue>(value: V): ValueObject<V> {
    throw new Error(
      `[@vicin/ddd-core] Class '${this.name}' with label '${this.SigilEffectiveLabel}' didn't implement '.reconstitute()' static method yet`
    );
  }

  static fromJSON<V extends JsonValue>(value: V): ValueObject<V> {
    throw new Error(
      `[@vicin/ddd-core] Class '${this.name}' with label '${this.SigilEffectiveLabel}' didn't implement '.fromJSON()' static method yet`
    );
  }

  /** Method to check if two value-objects store the same value. */
  equals<T extends ValueObject<RawValue>>(this: T, other: T): boolean {
    if (!this.isOfType(other)) return false;
    if (typeof this.value !== 'object') return this.value === other.toRawValue();
    return OPTIONS.isEqual(this.toJSON(), other.toJSON());
  }

  toRawValue(): RawValue {
    return this.value;
  }

  toJSON(): JsonValue {
    return toJSON(this.value);
  }

  abstract clone<T extends ValueObject<RawValue>>(this: T): T;
}
