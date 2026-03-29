import { AttachSigil, sigil, type ExtendSigil } from '@vicin/sigil';
import { DomainObject, type StateOf } from '../object';
import { deepFreeze, type Result, type Status } from '../../../external';

/**
 * Base class of domain value objects
 * @property State - State of value object, should extend 'ValueObjectState'
 */
@AttachSigil('@vicin/ddd-core.ValueObjectBase')
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
  ): Result<ValueObjectBase<any>, Error> | Status<ValueObjectBase<any>, Error> {
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

@AttachSigil('@vicin/ddd-core.IdValueObjectBase')
export abstract class IdentityValueObjectBase<
  State extends string = string,
> extends ValueObjectBase<State> {
  declare [sigil]: ExtendSigil<'ValueObjectBase', ValueObjectBase<any>>;
}

@AttachSigil('@vicin/ddd-core.IdValueObjectBase')
export abstract class TimeValueObjectBase<
  State extends Date | bigint | number = Date | bigint | number,
> extends ValueObjectBase<State> {
  declare [sigil]: ExtendSigil<'TimeValueObject', ValueObjectBase<any>>;
}
