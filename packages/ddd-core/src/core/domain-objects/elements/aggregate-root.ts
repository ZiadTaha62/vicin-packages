import { AttachSigil, type sigil, type ExtendSigil } from '@vicin/sigil';
import { DomainObject } from '../object';
import { DomainEventBase } from '../event';
import type { Result, Status } from '../../../external';

type AggregateRootState = {
  [k: string]: any;
};

/**
 * Base class of domain aggregate roots
 * @property State - State of aggregate root, should extend 'EntityState'
 */
@AttachSigil('@vicin/ddd-core.AggregateRootBase')
export abstract class AggregateRootBase<State extends AggregateRootState> extends DomainObject<
  'AggregateRoot',
  State
> {
  declare [sigil]: ExtendSigil<'AggregateRootBase', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainAggregateRoot';
  }

  static override readonly type: 'AggregateRoot' = 'AggregateRoot';

  /**
   * Create brand new aggregate root, should accept minimal state needed, can return aggregate root directly or Result/Status if validation or invariants check took place
   */
  static create(
    ...args: any[]
  ):
    | AggregateRootBase<any>
    | Result<AggregateRootBase<any>, Error>
    | Status<AggregateRootBase<any>, Error> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct aggregate root from untrusted / primitive / external data, returns Result/Status after validation and invariants check
   */
  static from(
    ...args: any[]
  ): Result<AggregateRootBase<any>, Error> | Status<AggregateRootBase<any>, Error> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

  /**
   * Returns string identifier of entity.
   */
  abstract toId(): string;

  /**
   * Check equality between aggregate roots by comparing there identifiers
   * @param other - Aggregate root to compare against
   * @returns Boolean
   */
  override equals(other: this): boolean {
    if (!this.isInstance(other)) return false;
    return this.toId() === other.toId();
  }

  // -----------------
  // Events
  // -----------------

  /** Array of fired domain events */
  private domainEvents: DomainEventBase[] = [];

  /**
   * Push new domain event into domainEvents array
   * @param event - Event to add
   */
  protected addDomainEvent(event: DomainEventBase): void {
    this.domainEvents.push(event);
  }

  /**
   * Returns domain events added to this aggregate.
   * @returns Array of domain events took place
   */
  getDomainEvents(): DomainEventBase[] {
    return [...this.domainEvents];
  }

  /**
   * Clear all domain events stored
   */
  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
