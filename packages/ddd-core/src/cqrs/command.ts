import type { Message, MessagePayload } from '../message';

export type CommandPayload = MessagePayload;

export interface Command<
  TPayload extends CommandPayload = CommandPayload,
> extends Message<TPayload> {
  readonly kind: 'command';
}
