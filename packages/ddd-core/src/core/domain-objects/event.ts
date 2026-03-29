import { DomainObject } from './object';
import { IdentityValueObjectBase, TimeValueObjectBase } from './elements';
import { AttachSigil, type sigil, type ExtendSigil } from '../../external';

type DomainEventState = {
  aggregateId: IdentityValueObjectBase;
  version: number | null;
  occurredOn: TimeValueObjectBase;
  payload: { [k: string]: any };
};

/**
 * Base class for domain events
 *
 * Domain events represent something that happened within the domain
 * and are typically used for:
 * - side effects
 * - integrations
 * - event sourcing
 *
 * @template State - Event state shape
 */
@AttachSigil('@vicin/ddd-core.DomainEventBase')
export abstract class DomainEventBase<
  State extends DomainEventState = DomainEventState,
> extends DomainObject<'Event', State> {
  declare [sigil]: ExtendSigil<'DomainEventBase', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainEvent';
  }

  static override readonly type: 'Event' = 'Event';

  /**
   * Identifier of the aggregate that emitted this event
   */
  public readonly aggregateId: State['aggregateId'];

  /**
   * Timestamp indicating when the event occurred
   */
  public readonly occurredOn: State['occurredOn'];

  /**
   * Optional version number for versioned events
   */
  public readonly version: number | null = null;

  /**
   * Event payload containing domain-specific data
   */
  protected readonly payload: State['payload'];

  protected constructor(state: DomainEventState) {
    super();
    this.aggregateId = state.aggregateId;
    this.occurredOn = state.occurredOn;
    this.payload = state.payload;
    this.version = state.version;
  }

  /**
   * Type guard to check if an event is of a specific domain event type
   *
   * @param event - Event instance to check
   * @param type - Target event class
   */
  static isOfType<T extends DomainEventBase>(
    event: DomainEventBase,
    type: typeof DomainEventBase
  ): event is T {
    return type.isInstance(event);
  }

  /**
   * Returns the identifier of the aggregate as a string
   */
  toId(): string {
    return this.aggregateId.getState();
  }

  /**
   * Indicates whether this event has versioning enabled
   */
  isVersioned(): boolean {
    return this.version !== null;
  }

  getState(): State {
    return {
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn,
      payload: this.payload,
      version: this.version,
    } as State;
  }
}
