import { AttachSigil, type sigil, type ExtendSigil, type Result, type Status } from '../../utils';
import type { IdentityValueObjectBase } from './value-object';
import type { DomainExceptionBase } from '../exception';
import { IdentityErrorObjectFactory, markFactory, MarkFactory } from '../../extended-classes';

const IdentityObject = IdentityErrorObjectFactory('Entity');
type IdentityObject = InstanceType<typeof IdentityObject>;

type EntityState = {
  [k: string]: any;
};

/**
 * Base class of domain entities
 * @property State - State of entity, should extend 'EntityState'
 */
@AttachSigil('@vicin/ddd-core.EntityBase')
export abstract class EntityBase<State extends EntityState> extends IdentityObject {
  declare [sigil]: ExtendSigil<'EntityBase', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainEntity';
  }

  /**
   * Create brand new entity, should accept minimal state needed, can return Entity directly or Result/Status if validation or invariants check took place
   */
  static create(
    ...args: any[]
  ):
    | EntityBase<any>
    | Result<EntityBase<any>, DomainExceptionBase>
    | Status<EntityBase<any>, DomainExceptionBase> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct Entity from untrusted / primitive / external data, returns Result/Status after validation and invariants check
   */
  static from(
    ...args: any[]
  ): Result<EntityBase<any>, DomainExceptionBase> | Status<EntityBase<any>, DomainExceptionBase> {
    throw new Error(
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
