import type { DomainEventBase } from '../domain';

export interface OutboxI {
  save(events: Iterable<DomainEventBase>): Promise<void>;
  getUnprocessed(): Promise<Iterable<DomainEventBase>>;
  markAsProcessed(events: Iterable<DomainEventBase>): Promise<void>;
}
