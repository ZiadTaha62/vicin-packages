import type { DomainEventBase, DomainList } from '../../domain';

export interface EventStoreI {
  save(events: Iterable<DomainEventBase>): Promise<void>;
  getByAggregateId(id: string): Promise<DomainList<DomainEventBase>>;
  getAllAfter(version: number): Promise<DomainList<DomainEventBase>>;
}
