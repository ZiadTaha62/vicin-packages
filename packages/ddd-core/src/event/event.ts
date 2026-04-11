import type { Message, MessagePayload } from '../message';

export type EventPayload = MessagePayload;

export interface Event<TPayload extends EventPayload = EventPayload> extends Message<
  'event',
  TPayload
> {
  /**
   * Id of event
   */
  eventId: string;

  /**
   * Aggregate version (event stream position)
   */
  version: number;

  /**
   * Event schema version (for evolution)
   */
  schemaVersion?: number;
}
