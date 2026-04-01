import type { DomainEventBase } from '../domain';

export interface EventPublisherI {
  publish(event: DomainEventBase): Promise<void>;
  publishAll(events: Iterable<DomainEventBase>): Promise<void>;
}
