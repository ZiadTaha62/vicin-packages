import { AttachSigil, type sigil, type ExtendSigil } from '@vicin/sigil';
import { DomainObject } from '../object';
import type { Result, Status } from '../../../external';

type EntityState = {
  [k: string]: any;
};

/**
 * Base class of domain entities
 * @property State - State of entity, should extend 'EntityState'
 */
@AttachSigil('@vicin/ddd-core.EntityBase')
export abstract class EntityBase<State extends EntityState> extends DomainObject<'Entity', State> {
  declare [sigil]: ExtendSigil<'EntityBase', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainEntity';
  }

  static override readonly type: 'Entity' = 'Entity';

  /**
   * Create brand new entity, should accept minimal state needed, can return Entity directly or Result/Status if validation or invariants check took place
   */
  static create(
    ...args: any[]
  ): EntityBase<any> | Result<EntityBase<any>, Error> | Status<EntityBase<any>, Error> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct Entity from untrusted / primitive / external data, returns Result/Status after validation and invariants check
   */
  static from(...args: any[]): Result<EntityBase<any>, Error> | Status<EntityBase<any>, Error> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

  /**
   * Returns string identifier of entity.
   */
  abstract toId(): string;

  /**
   * Check equality between entities by comparing there identifiers
   * @param other - Entity to compare against
   * @returns Boolean
   */
  override equals(other: this): boolean {
    if (!this.isInstance(other)) return false;
    return this.toId() === other.toId();
  }
}
