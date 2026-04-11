import { MarkFactory, markFactory, AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { type Event, type EventPayload } from './event';
import { EventObject } from './event-object';
import type { IdentityValueObjectBase } from '../domain';

export interface DomainEventI<TPayload extends EventPayload> extends Event<TPayload> {
  aggregateId: IdentityValueObjectBase;
  aggregateType: string;
}

export type DomainEventOptions<TPayload extends EventPayload> = Omit<
  DomainEventI<TPayload>,
  'eventId'
> & {
  eventId?: string;
};

@AttachSigil('@vicin/ddd-core.DomainEventBase')
export abstract class DomainEventBase<
  TPayload extends EventPayload = EventPayload,
> extends EventObject<TPayload> {
  declare [sigil]: ExtendSigil<'DomainEventBase', EventObject<any>>;

  // -------------------------
  // Aggregate linkage
  // -------------------------

  public readonly aggregateId: IdentityValueObjectBase;
  public readonly aggregateType: string;

  constructor(event: DomainEventOptions<TPayload>) {
    super(event);
    this.aggregateId = event.aggregateId;
    this.aggregateType = event.aggregateType;
  }

  toAggregateType(): string {
    return this.aggregateType;
  }

  toAggregateId(): string {
    return this.aggregateId.getState();
  }
}

export const DomainEvent = MarkFactory(DomainEventBase);
export const domainEvent = markFactory(DomainEventBase);
