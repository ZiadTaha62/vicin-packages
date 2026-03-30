import { DomainObject } from '../base';
import { DomainEventBase } from '../event';
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
import { DomainList } from '../collections';

/**
 * Marks a class as an Aggeregate root.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function AggregateRoot<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!AggregateRootBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'AggregateRoot' decorator can only be used on domain aggregate roots"
      );
    }

    register(target as any, 'AggregateRoot', label, { ...opts, isDomainObject: true });
  };
}

/**
 * Marks a class as an Aggeregate root.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function aggregateRoot<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!AggregateRootBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'aggregateRoot' function can only be used on domain aggregate roots"
    );
  }

  register(clazz as any, 'AggregateRoot', label, { ...opts, isDomainObject: true });
}

/**
 * Marks a method as an event handler for a specific domain event.
 * Used in EventSourced Aggregate Roots to register 'when' handlers.
 *
 * @param eventClass - The domain event class this method handles
 */
export function When(eventClass: any) {
  return function (target: any, context: ClassMethodDecoratorContext) {
    if (!DomainEventBase.isInstance(eventClass.prototype)) {
      throw new Error(`[DDD-core Error] Value passed to '@When' decorator must be domain event`);
    }

    if (context.kind !== 'method') {
      throw new Error("[DDD-core Error] '@When' decorator can only be used on methods");
    }

    const aggregateClass = target.constructor as typeof AggregateRootBase;

    const handlerName = context.name as string;
    const handlerFn = target[handlerName] as DomainEventHandler;

    if (typeof handlerFn !== 'function') {
      throw new Error(`[DDD-core Error] '@When' was applied to non-method: ${handlerName}`);
    }

    aggregateClass.when(eventClass, handlerFn);
  };
}

type AggregateRootState = {
  [k: string]: any;
};

type DomainEventHandler = (event: DomainEventBase) => void;

/**
 * Base class of domain aggregate roots
 * @property State - State of aggregate root, should extend 'EntityState'
 */
@AggregateRoot('@vicin/ddd-core.AggregateRootBase')
export abstract class AggregateRootBase<State extends AggregateRootState> extends DomainObject<
  'AggregateRoot',
  State
> {
  declare [sigil]: ExtendSigil<'AggregateRootBase', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainAggregateRoot';
  }

  static override readonly type: 'AggregateRoot' = 'AggregateRoot';

  /** Static registry: EventConstructor → handler method */
  protected static readonly whenHandlers = new Map<Function, DomainEventHandler>();

  /** Version of aggregate root for event sourcing */
  protected version: number = 0;

  /** List of fired domain events */
  private domainEvents: DomainList<DomainEventBase> = new DomainList();

  /** Register a handler for a specific event type */
  static when<E extends DomainEventBase>(
    eventClass: new (...args: any[]) => E,
    handler: (this: any, event: E) => void
  ) {
    this.whenHandlers.set(eventClass, handler as DomainEventHandler);
  }

  /** Replay history to reconstitute aggregate */
  static reconstituteFromHistory<D extends AggregateRootBase<any>>(events: DomainEventBase[]): D {
    if (events.length === 0) {
      throw new Error(`[DDD-core Error] Cannot reconstitute ${this.name} from empty event stream`);
    }

    const aggregate = this.create(); // empty state, will be filled by replay
    aggregate.replay(events);
    return aggregate as D;
  }

  /**
   * Create brand new aggregate root with default state, returns aggregate root directly
   */
  static create(): AggregateRootBase<any> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct aggregate root from untrusted / primitive / external data, returns Result/Status after validation and invariants check
   */
  static from(
    ...args: any[]
  ):
    | Result<AggregateRootBase<any>, DomainException<any>>
    | Status<AggregateRootBase<any>, DomainException<any>> {
    throw new Error(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

  /**
   * Returns identity value object of aggregate root.
   */
  abstract getId(): IdentityValueObjectBase;

  /**
   * Returns string identifier of aggregate root.
   */
  toId(): string {
    return this.getId().getState();
  }

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

  private invokeHandler(event: DomainEventBase): void {
    const handler = (this.constructor as typeof AggregateRootBase).whenHandlers.get(
      event.constructor
    );

    if (typeof handler === 'function') {
      handler.call(this, event);
    } else {
      throw new Error(
        `[DDD-core Error] No handler registered for event ${event.SigilLabel || event.constructor.name}`
      );
    }
  }

  /**
   * Push new domain event into domainEvents array
   * @param event - Event to add
   */
  protected pushEvent(event: DomainEventBase): void {
    this.domainEvents.push(event);
  }

  protected apply(event: DomainEventBase): void {
    this.invokeHandler(event);
    this.version++;
    event.version = this.version;
    this.pushEvent(event);
  }

  protected replay(events: DomainEventBase[]): void {
    for (const event of events) {
      this.invokeHandler(event);
      this.version = event.version ?? this.version + 1;
    }
  }

  /** Get all uncommitted events */
  getUncommittedEvents(): DomainList<DomainEventBase> {
    return this.domainEvents.clone();
  }

  /** Convenience: mark events as committed */
  markEventsAsCommitted(): void {
    this.domainEvents.clear();
  }

  /** Pull and clear events from event queue */
  pullEvents() {
    const events = this.getUncommittedEvents();
    this.markEventsAsCommitted();
    return events;
  }
}
