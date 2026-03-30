import { DomainObject, type StateOf } from '../base';
import {
  register,
  type sigil,
  type ExtendSigil,
  type SigilOptions,
  deepFreeze,
  type Result,
  type Status,
} from '../../../utils';
import type { DomainException } from '../../exception';

/**
 * Marks a class as a Value Object.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function ValueObject<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!ValueObjectBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'ValueObject' decorator can only be used on domain value objects"
      );
    }

    register(target as any, 'ValueObject', label, { ...opts, isDomainObject: true });
  };
}

/**
 * Marks a class as a Value Object.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function valueObject<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!ValueObjectBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'valueObject' function can only be used on domain value objects"
    );
  }

  register(clazz as any, 'ValueObject', label, { ...opts, isDomainObject: true });
}

/**
 * Base class of domain value objects
 * @property State - State of value object, should extend 'ValueObjectState'
 */
@ValueObject('@vicin/ddd-core.ValueObjectBase')
export abstract class ValueObjectBase<State> extends DomainObject<'ValueObject', State> {
  declare [sigil]: ExtendSigil<'ValueObjectBase', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainValueObject';
  }

  static override readonly type: 'ValueObject' = 'ValueObject';

  /**
   * @param state - State of value object
   */
  protected constructor(protected state: State) {
    super();
    if (process.env.NODE_ENV !== 'production') {
      deepFreeze(state);
    }
  }

  static override reconstitute<D extends DomainObject<any, any>>(state: StateOf<D>): D {
    return super.reconstitute(state, 'state');
  }

  /**
   * Create value object with default value
   */
  static create(): ValueObjectBase<any> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${(this as any).SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct value object from untrusted / primitive / external data
   */
  static from(
    ...args: any[]
  ):
    | Result<ValueObjectBase<any>, DomainException<any>>
    | Status<ValueObjectBase<any>, DomainException<any>> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

  /**
   * @returns Stored state of value object
   */
  getState(): State {
    return this.state;
  }
}

@ValueObject('@vicin/ddd-core.IdValueObjectBase')
export abstract class IdentityValueObjectBase<
  State extends string = string,
> extends ValueObjectBase<State> {
  declare [sigil]: ExtendSigil<'ValueObjectBase', ValueObjectBase<any>>;
}

@ValueObject('@vicin/ddd-core.IdValueObjectBase')
export abstract class TimeValueObjectBase<
  State extends Date | bigint | number = Date | bigint | number,
> extends ValueObjectBase<State> {
  declare [sigil]: ExtendSigil<'TimeValueObject', ValueObjectBase<any>>;
}
