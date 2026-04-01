import { IdentityObjectFactory, markFactory, MarkFactory } from '../extended-classes';
import { IdentityValueObjectBase, TimeValueObjectBase } from './elements';
import { AttachSigil, type sigil, type ExtendSigil } from '../utils';

type KeyedIdentityValueObject = { [k: string]: IdentityValueObjectBase };

type DomainEventState = KeyedIdentityValueObject & {
  occurredOn: TimeValueObjectBase;
  payload: { [k: string]: any };
  version?: number;
};

const IdentityObject = IdentityObjectFactory('DomainEvent');
type IdentityObject = InstanceType<typeof IdentityObject>;

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
> extends IdentityObject {
  declare [sigil]: ExtendSigil<'DomainEventBase', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainEvent';
  }

  /**
   * Version number for versioned events
   */
  public version: number;

  /**
   * Timestamp indicating when the event occurred
   */
  public readonly occurredOn: TimeValueObjectBase;

  /**
   * Event payload containing domain-specific data
   */
  protected readonly payload: State['payload'];

  protected constructor(state: DomainEventState) {
    super();
    this.version = state.version ?? 0;
    this.occurredOn = state.occurredOn;
    this.payload = state.payload;
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
   * Returns the identifier value object of event
   */
  abstract getId(): IdentityValueObjectBase;

  /**
   * Returns the identifier of the event as a string
   */
  toId(): string {
    return this.getId().getState();
  }
}

export const DomainEvent = MarkFactory(DomainEventBase);
export const domainEvent = markFactory(DomainEventBase);
