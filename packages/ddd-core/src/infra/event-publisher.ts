import type { EventPublisherI } from '../application';
import type { DomainEventBase } from '../domain';
import { AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { MarkObjectFactory, MarkFactory, markFactory } from '../extended-classes';

const MarkObject = MarkObjectFactory('EventPublisher');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.EventPublisherBase')
export abstract class EventPublisherBase extends MarkObject implements EventPublisherI {
  declare [sigil]: ExtendSigil<'EventPublisherBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'EventPublisher';
  }

  abstract publish(event: DomainEventBase): Promise<void>;
  abstract publishAll(events: Iterable<DomainEventBase>): Promise<void>;
}

export const EventPublisher = MarkFactory(EventPublisherBase);
export const eventPublisher = markFactory(EventPublisherBase);

/** Simple in-memory publisher for tests */
@EventPublisher('@vicin/ddd-core.InMemoryEventPublisher')
export class InMemoryEventPublisher extends EventPublisherBase {
  declare [sigil]: ExtendSigil<'InMemoryEventPublisher', EventPublisherBase>;

  private events: DomainEventBase[] = [];

  async publish(event: DomainEventBase): Promise<void> {
    this.events.push(event);
  }

  async publishAll(events: Iterable<DomainEventBase>): Promise<void> {
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

  async publishAll(events: Iterable<DomainEventBase>): Promise<void> {
    for (const event of events) await this.publish(event);
  }
}
