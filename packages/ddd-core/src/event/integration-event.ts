import { type Event, type EventPayload } from './event';
import { EventObject } from './event-object';
import { MarkFactory, markFactory, AttachSigil, type sigil, type ExtendSigil } from '../utils';

export interface IntegrationEventI<TPayload extends EventPayload> extends Event<TPayload> {}

export type IntegrationEventOptions<TPayload extends EventPayload> = Omit<
  IntegrationEventI<TPayload>,
  'eventId'
> & {
  eventId?: string;
};

@AttachSigil('@vicin/ddd-core.IntegrationEventBase')
export abstract class IntegrationEventBase<
  TPayload extends EventPayload = EventPayload,
> extends EventObject<TPayload> {
  declare [sigil]: ExtendSigil<'IntegrationEventBase', EventObject<any>>;

  constructor(event: IntegrationEventOptions<TPayload>) {
    super(event);
  }
}

export const IntegrationEvent = MarkFactory(IntegrationEventBase);
export const integrationEvent = markFactory(IntegrationEventBase);
