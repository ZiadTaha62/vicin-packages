import {
  PlainIdentityObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
  type Result,
  type StateOf,
  type JSONValue,
  type StateObjectSerialization,
  DddCoreDevError,
} from '../../utils';
import { DomainEventBase } from '../../event';
import { DomainList } from '../collections';
import type { IdentityValueObjectBase } from './value-object';
import type { DomainErrorBase } from '../../error';

const IdentityObject = PlainIdentityObjectFactory('AggregateRoot');
type IdentityObject = InstanceType<typeof IdentityObject>;

type AggregateRootState = {
  [k: string]: any;
};

type DomainEventHandler = (event: DomainEventBase) => void;

/**
 * Base class of domain aggregate roots
 * @property State - State of aggregate root, should extend 'EntityState'
 */
@AttachSigil('@vicin/ddd-core.AggregateRootBase')
// @ts-expect-error Override of static methods with error 'extends but could be instantiated with a different subtype of constraint'
export abstract class AggregateRootBase<State extends AggregateRootState> extends IdentityObject {
  declare [sigil]: ExtendSigil<'AggregateRootBase', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainAggregateRoot';
  }

  static override reconstitute<A extends AggregateRootBase<any>>(state: StateOf<A>): A {
    return super.reconstitute(state);
  }

  static override deserialize<A extends AggregateRootBase<any>>(
    serialization: StateObjectSerialization<A['kind'], ReturnType<A['getState']>>
  ): A {
    return super.reconstitute(serialization.state) as A;
  }

  static override fromJSON<A extends AggregateRootBase<any>>(json: JSONValue): A {
    return super.fromJSON(json);
  }

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
    const aggregate = this.create(); // empty state, will be filled by replay
    aggregate.replay(events);
    return aggregate as D;
  }

  /**
   * Create brand new aggregate root with default state, returns aggregate root directly
   */
  static create(): AggregateRootBase<any> {
    throw new DddCoreDevError(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.create()' static method yet`
    );
  }

  /**
   * Construct aggregate root from untrusted / primitive / external data, returns `Result` after validation and invariants check
   */
  static from(...args: any[]): Result<AggregateRootBase<any>, DomainErrorBase> {
    throw new DddCoreDevError(
      `[DDD-core Error] Class '${this.name}' with label '${this.SigilLabel}' didn't implement '.from()' static method yet`
    );
  }

  abstract override getState(): State;

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
      throw new DddCoreDevError(
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

export const AggregateRoot = MarkFactory(AggregateRootBase);
export const aggregateRoot = markFactory(AggregateRootBase);

/**
 * Marks a method as an event handler for a specific domain event.
 * Used in EventSourced Aggregate Roots to register 'when' handlers.
 *
 * @param eventClass - The domain event class this method handles
 */
export function When(eventClass: any) {
  return function (target: any, context: ClassMethodDecoratorContext) {
    if (!DomainEventBase.isInstance(eventClass.prototype)) {
      throw new DddCoreDevError(
        `[DDD-core Error] Value passed to '@When' decorator must be domain event`
      );
    }

    if (context.kind !== 'method') {
      throw new DddCoreDevError("[DDD-core Error] '@When' decorator can only be used on methods");
    }

    const aggregateClass = target.constructor as typeof AggregateRootBase;

    const handlerName = context.name as string;
    const handlerFn = target[handlerName] as DomainEventHandler;

    if (typeof handlerFn !== 'function') {
      throw new DddCoreDevError(
        `[DDD-core Error] '@When' was applied to non-method: ${handlerName}`
      );
    }

    aggregateClass.when(eventClass, handlerFn);
  };
}
