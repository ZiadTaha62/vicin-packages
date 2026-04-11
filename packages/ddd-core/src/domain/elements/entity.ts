import {
  PlainIdentityObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
  type Result,
  type JSONValue,
  type StateObjectSerialization,
  type StateOf,
  DddCoreDevError,
} from '../../utils';
import type { IdentityValueObjectBase } from './value-object';
import type { DomainErrorBase } from '../../error';

const IdentityObject = PlainIdentityObjectFactory('Entity');
type IdentityObject = InstanceType<typeof IdentityObject>;

type EntityState = {
  [k: string]: any;
};

/**
 * Base class of domain entities
 * @property State - State of entity, should extend 'EntityState'
 */
@AttachSigil('@vicin/ddd-core.EntityBase')
// @ts-expect-error Override of static methods with error 'extends but could be instantiated with a different subtype of constraint'
export abstract class EntityBase<State extends EntityState> extends IdentityObject {
  declare [sigil]: ExtendSigil<'EntityBase', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainEntity';
  }

  static override reconstitute<E extends EntityBase<any>>(state: StateOf<E>): E {
    return super.reconstitute(state);
  }

  static override deserialize<E extends EntityBase<any>>(
    serialization: StateObjectSerialization<E['kind'], ReturnType<E['getState']>>
  ): E {
    return super.reconstitute(serialization.state) as E;
  }

  static override fromJSON<E extends EntityBase<any>>(json: JSONValue): E {
    return super.fromJSON(json);
  }

  /**
   * Create brand new entity with default state, returns entity directly
   */
  static create(...args: any[]): EntityBase<any> {
    throw new DddCoreDevError(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct Entity from untrusted / primitive / external data, returns `Result` after validation and invariants check
   */
  static from(...args: any[]): Result<EntityBase<any>, DomainErrorBase> {
    throw new DddCoreDevError(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

  abstract override getState(): State;

  /**
   * Returns identity value object of entity.
   */
  abstract getId(): IdentityValueObjectBase;

  /**
   * Returns string identifier of entity.
   */
  toId(): string {
    return this.getId().getState();
  }
}

export const Entity = MarkFactory(EntityBase);
export const entity = markFactory(EntityBase);
