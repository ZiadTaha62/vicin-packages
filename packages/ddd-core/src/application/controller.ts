import {
  PlainDddObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type ExtendSigil,
  generateId,
  type sigil,
} from '../utils';
import type { Message, ExecutionScope } from '../message';

const DddObject = PlainDddObjectFactory('Controller');
type DddObject = InstanceType<typeof DddObject>;

@AttachSigil('@vicin/ddd-core.Controller')
export abstract class Controller extends DddObject {
  declare [sigil]: ExtendSigil<'Controller', DddObject>;

  override get [Symbol.toStringTag]() {
    return 'Controller';
  }

  public scope: ExecutionScope;

  constructor(scope: ExecutionScope) {
    super();
    this.scope = scope;
  }

  /**
   * Spawns a message pre-populated with the gec data
   */
  protected createMessage<M extends Message>(
    type: string,
    kind: M['kind'],
    payload: M['payload']
  ): MessageEnvelope<M> {
    const { signal, abort } = createAbortController();

    const message = {
      type,
      kind,
      payload,
      ctx: {
        messageId: generateId(),
        timestamp: new Date().toISOString(),
        abortSignal: signal,
        traceId: this.gec.traceId,
        correlationId: this.gec.correlationId,
        tenantId: this.gec.tenantId,
        actorId: this.gec.actor?.id,
        metadata: { ...this.gec.requestInfo },
      },
    };

    return {
      // Global GEC
      global: this.gec,

      // Message object
      message: {
        type,
        kind,
        payload,
        ctx: {
          messageId: generateId(),
          timestamp: new Date().toISOString(),
          traceId: this.gec.traceId,
          correlationId: this.gec.correlationId,
          tenantId: this.gec.tenantId,
          actorId: this.gec.actor?.id,
          metadata: { ...this.gec.requestInfo },
        },
      },

      // Helper tools
      tools: {
        abort: (reason) => abort(reason ?? 'unknown reason', message),
        signal,
        delay: (ms) => delay(ms, signal),
        retry: (op, opts) => retry(op, message, opts),
        timeout: (ms, op) => timeout(ms, op, message),
      },
    };
  }
}

export const ControllerMark = MarkFactory(Controller);
export const controllerMark = markFactory(Controller);
