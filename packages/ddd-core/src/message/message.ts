import {
  PlainIdentityObjectFactory,
  type sigil,
  type ExtendSigil,
  generateId,
  MarkFactory,
  markFactory,
} from '../utils';

export interface MessageCache {
  [k: string]: unknown;
}

export type MessageContext = {
  [k: string]: unknown;
};

export type MessagePayload = {
  [k: string]: unknown;
};

const IdentityObject = PlainIdentityObjectFactory('Message');
type IdentityObject = InstanceType<typeof IdentityObject>;

export class Message<
  Kind extends string = string,
  Context extends MessageContext = MessageContext,
  Payload extends MessagePayload = MessagePayload,
> extends IdentityObject {
  declare [sigil]: ExtendSigil<'Message', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'Message';
  }

  /** Message kind (e.g. 'Command') */
  readonly messageKind: Kind;

  /** Stable type identity */
  readonly type: string;

  /** Id of message */
  readonly id: string;

  /** Payload of the message (actual propegated data) */
  readonly payload: Payload;

  /** Context of message */
  readonly context: Context;

  constructor(
    kind: Kind,
    type: string,
    props?: {
      id?: string;
      payload?: Payload;
      context?: Context;
    }
  ) {
    super();
    this.messageKind = kind;
    this.type = type;
    this.id = props?.id ?? generateId();
    this.context = props?.context ?? ({} as Context);
    this.payload = props?.payload ?? ({} as Payload);
  }

  updatePayload<NextPayload extends MessagePayload>(
    updater: NextPayload | ((payload: Payload) => NextPayload)
  ): Message<Kind, Context, NextPayload> {
    const payload = typeof updater === 'function' ? updater(this.payload) : updater;
    return new Message(this.messageKind, this.type, {
      id: this.id,
      context: this.context,
      payload,
    });
  }

  getState() {
    return {
      kind: this.messageKind,
      type: this.type,
      id: this.id,
      payload: this.payload,
      context: this.context,
    };
  }

  toId(): string {
    return this.id;
  }
}

export const MessageMark = MarkFactory(Message);
export const messageMark = markFactory(Message);

// Mark current message
messageMark(Message, '@vicin/ddd-core.Message');
