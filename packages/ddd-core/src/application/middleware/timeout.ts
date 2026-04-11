import { type sigil, type ExtendSigil } from '../../utils';
import type { Message, Middleware, MiddlewareContext, MiddlewareMetadata } from '../../message';
import { MiddlewareApplicationError, ApplicationError } from '../../error';

@ApplicationError('@vicin/ddd-core.MiddlewareTimeoutError')
class MiddlewareTimeoutError extends MiddlewareApplicationError {
  declare [sigil]: ExtendSigil<'MiddlewareTimeoutError', MiddlewareApplicationError>;

  constructor(msg: Message, ctx: MiddlewareContext, ms: number) {
    super({
      name: 'TimeoutError',
      message: `Middleware '${ctx.getActiveMW()?.name ?? 'UNKNOWN'}' timeout after ${ms}ms on message '${msg.type}' with kind '${msg.kind}'`,
      code: 'TIMEOUT',
    });
  }
}

export const timeoutMiddleware = <I extends Message>(
  ms: number,
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, ctx) => {
    const { abort, abortSignal } = ctx;

    const timeout = setTimeout(abort, ms);

    const promise = new Promise<never>((_, reject) => {
      const onAbort = () => reject(new MiddlewareTimeoutError(msg, ctx, ms));
      if (abortSignal.aborted) {
        onAbort();
        return;
      }
      abortSignal.addEventListener('abort', onAbort, { once: true });
    });

    try {
      return await Promise.race([next(msg), promise]);
    } finally {
      clearTimeout(timeout);
    }
  },
  { id: meta.id, name: meta.name ?? 'Timeout' },
];
