import { DomainObject } from './base';
import { IdentityValueObjectBase, TimeValueObjectBase } from './elements';
import { register, type sigil, type ExtendSigil, type SigilOptions } from '../../utils';

/**
 * Marks a class as a Domain event.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function DomainEvent<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!DomainEventBase.isInstance(target.prototype)) {
      throw new Error("[DDD-core Error] 'Event' decorator can only be used on domain events");
    }

    register(target as any, 'Event', label, { ...opts, isDomainObject: true });
  };
}

/**
 * Marks a class as a Domain event.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function domainEvent<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!DomainEventBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'domainEvent' function can only be used on domain events");
  }

  register(clazz as any, 'Event', label, { ...opts, isDomainObject: true });
}

type KeyedIdentityValueObject = { [k: string]: IdentityValueObjectBase };

type DomainEventState = KeyedIdentityValueObject & {
  occurredOn: TimeValueObjectBase;
  payload: { [k: string]: any };
  version?: number;
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
@DomainEvent('@vicin/ddd-core.DomainEventBase')
export abstract class DomainEventBase<
  State extends DomainEventState = DomainEventState,
> extends DomainObject<'Event', State> {
  declare [sigil]: ExtendSigil<'DomainEventBase', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainEvent';
  }

  static override readonly type: 'Event' = 'Event';

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
   * Returns the identifier of the aggregate as a string
   */
  toId(): string {
    return this.getId().getState();
  }
}
