import { DddCore } from '../ddd-core';
import { DomainEventBase } from '../domain';
import { register, type sigil, type ExtendSigil, type SigilOptions } from '../utils';

/**
 * Marks a class as an Event publisher.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function EventPublisher<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!EventPublisherBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'EventPublisher' decorator can only be used on event publishers"
      );
    }

    register(target as any, 'EventPublisher', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as an Event publisher.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function eventPublisher<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!EventPublisherBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'eventPublisher' function can only be used on event publishers"
    );
  }

  register(clazz as any, 'EventPublisher', label, { ...opts, isDomainObject: false });
}

@EventPublisher('@vicin/ddd-core.EventPublisherBase')
export abstract class EventPublisherBase extends DddCore {
  declare [sigil]: ExtendSigil<'EventPublisherBase', DddCore>;

  get [Symbol.toStringTag]() {
    return 'EventPublisher';
  }

  abstract publish(event: DomainEventBase): Promise<void>;
  abstract publishAll(events: DomainEventBase[]): Promise<void>;
}

/** Simple in-memory publisher for tests */
@EventPublisher('@vicin/ddd-core.InMemoryEventPublisher')
export class InMemoryEventPublisher extends EventPublisherBase {
  declare [sigil]: ExtendSigil<'InMemoryEventPublisher', EventPublisherBase>;

  private events: DomainEventBase[] = [];

  async publish(event: DomainEventBase): Promise<void> {
    this.events.push(event);
  }

  async publishAll(events: DomainEventBase[]): Promise<void> {
    this.events.push(...events);
  }

  getPublishedEvents(): DomainEventBase[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

/** Console publisher for development / debugging */
@EventPublisher('@vicin/ddd-core.ConsoleEventPublisher')
export class ConsoleEventPublisher extends EventPublisherBase {
  declare [sigil]: ExtendSigil<'ConsoleEventPublisher', EventPublisherBase>;

  async publish(event: DomainEventBase): Promise<void> {
    // eslint-disable-next-line
    console.log(`[DomainEvent] ${event.SigilLabel}`, event.toJSON());
  }

  async publishAll(events: DomainEventBase[]): Promise<void> {
    for (const event of events) await this.publish(event);
  }
}
