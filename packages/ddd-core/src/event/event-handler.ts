import {
  MarkObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
} from '../../utils';

const MarkObject = MarkObjectFactory('EventHandler');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.EventHandlerBase')
export abstract class EventHandlerBase<E> extends MarkObject {
  declare [sigil]: ExtendSigil<'EventHandlerBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'EventHandlerBase';
  }

  abstract handle(event: E): Promise<void>;
}

export const EventHandler = MarkFactory(EventHandlerBase);
export const eventHandler = markFactory(EventHandlerBase);
