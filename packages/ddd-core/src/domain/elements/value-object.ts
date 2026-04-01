import {
  AttachSigil,
  type sigil,
  type ExtendSigil,
  deepFreeze,
  type Result,
  type Status,
} from '../../utils';
import type { DomainExceptionBase } from '../exception';
import { StateObjectFactory, MarkFactory, markFactory, type StateOf } from '../../extended-classes';

const StateObject = StateObjectFactory('ValueObject');
type StateObject = InstanceType<typeof StateObject>;

type ValueObjectState = unknown;

/**
 * Base class of domain value objects
 * @property State - State of value object, should extend 'ValueObjectState'
 */

@AttachSigil('@vicin/ddd-core.ValueObjectBase')
// @ts-expect-error Override of static 'reconstitute' method with error 'extends but could be instantiated with a different subtype of constraint'
export abstract class ValueObjectBase<State extends ValueObjectState> extends StateObject {
  declare [sigil]: ExtendSigil<'ValueObjectBase', StateObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainValueObject';
  }

  /**
   * @param state - State of value object
   */
  protected constructor(protected state: State) {
    super();
    if (process.env.NODE_ENV !== 'production') {
      deepFreeze(state);
    }
  }

  static override reconstitute<V extends ValueObjectBase<any>>(state: StateOf<V>): V {
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
    | Result<ValueObjectBase<any>, DomainExceptionBase>
    | Status<ValueObjectBase<any>, DomainExceptionBase> {
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

export const ValueObject = MarkFactory(ValueObjectBase);
export const valueObject = markFactory(ValueObjectBase);

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
