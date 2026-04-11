import { DomainEventBase } from './domain-event';
import { IntegrationEventBase } from './integration-event';
import { EventObject as InternalEventObject, type EventPayload } from './event';

export type EventObject<Payload extends EventPayload> =
  | DomainEventBase<Payload>
  | IntegrationEventBase<Payload>;

export function isEventObject<Payload extends EventPayload = EventPayload>(
  value: unknown
): value is EventObject<Payload> {
  return InternalEventObject.isInstance(value);
}
