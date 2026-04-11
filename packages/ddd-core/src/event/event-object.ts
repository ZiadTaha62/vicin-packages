import {
  AttachSigil,
  DddCoreDevError,
  generateId,
  PlainIdentityObjectFactory,
  type ExtendSigil,
  type sigil,
} from '../utils';
import type { MessageContext } from '../message';
import type { Event, EventPayload } from './event';

const IdentityObject = PlainIdentityObjectFactory('EventObject');
type IdentityObject = InstanceType<typeof IdentityObject>;

export type EventObjectOptions<TPayload extends EventPayload> = Omit<Event<TPayload>, 'eventId'> & {
  eventId?: string;
};

@AttachSigil('@vicin/ddd-core.EventObject')
export abstract class EventObject<TPayload extends EventPayload> extends IdentityObject {
  declare [sigil]: ExtendSigil<'EventObject', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'EventObject';
  }

  // -------------------------
  // Core event identity
  // -------------------------

  public readonly eventId: string;
  public readonly type: string;

  // -------------------------
  // Event context
  // -------------------------

  public readonly ctx: MessageContext;

  // -------------------------
  // Versioning
  // -------------------------

  public version: number; // Not readonly as it can be updated in 'apply' method of aggregate root
  public readonly schemaVersion: number;

  // -------------------------
  // Payload
  // -------------------------

  public readonly payload: TPayload;

  protected constructor(event: EventObjectOptions<TPayload>) {
    super();

    if (event.kind !== 'event') {
      throw new DddCoreDevError(
        `[DDD-core Error] Invalid message passed to event object with kind: '${event.kind}'`
      );
    }

    this.eventId = event.eventId ?? generateId();
    this.type = event.type;

    this.payload = event.payload;

    this.version = event.version;
    this.schemaVersion = event.schemaVersion ?? 0;

    this.ctx = event.ctx;
  }

  // -------------------------
  // Accessors
  // -------------------------

  getState() {
    return {
      eventId: this.eventId,
      type: this.type,
      payload: this.payload,
      version: this.version,
      schemaVersion: this.schemaVersion,
      ctx: this.ctx,
    };
  }

  toId(): string {
    return this.eventId;
  }

  toEventId(): string {
    return this.toId();
  }

  // -------------------------
  // Type guard
  // -------------------------

  static isOfType<T extends EventObject<any>>(
    event: EventObject<any>,
    type: typeof EventObject
  ): event is T {
    return type.isInstance(event);
  }
}
