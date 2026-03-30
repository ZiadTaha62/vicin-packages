import { DomainObject } from '../base';
import {
  register,
  type sigil,
  type ExtendSigil,
  type SigilOptions,
  type Result,
  type Status,
} from '../../../utils';
import type { IdentityValueObjectBase } from './value-object';
import type { DomainException } from '../../exception';

/**
 * Marks a class as an Entity.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Entity<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!EntityBase.isInstance(target.prototype)) {
      throw new Error("[DDD-core Error] 'Entity' decorator can only be used on domain entities");
    }

    register(target as any, 'Entity', label, { ...opts, isDomainObject: true });
  };
}

/**
 * Marks a class as an Entity.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function entity<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!EntityBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'entity' function can only be used on domain entities");
  }

  register(clazz as any, 'Entity', label, { ...opts, isDomainObject: true });
}

type EntityState = {
  [k: string]: any;
};

/**
 * Base class of domain entities
 * @property State - State of entity, should extend 'EntityState'
 */
@Entity('@vicin/ddd-core.EntityBase')
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
  ):
    | EntityBase<any>
    | Result<EntityBase<any>, DomainException<any>>
    | Status<EntityBase<any>, DomainException<any>> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct Entity from untrusted / primitive / external data, returns Result/Status after validation and invariants check
   */
  static from(
    ...args: any[]
  ): Result<EntityBase<any>, DomainException<any>> | Status<EntityBase<any>, DomainException<any>> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

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
