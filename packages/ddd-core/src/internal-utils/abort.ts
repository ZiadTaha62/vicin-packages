import { type sigil, type ExtendSigil } from '../utils';
import type { Message } from '../controller';
import { ApplicationError, ApplicationErrorMark } from '../error';

@ApplicationErrorMark('@vicin/ddd-core.AbortedError')
class AbortedError extends ApplicationError {
  declare [sigil]: ExtendSigil<'AbortedError', ApplicationError>;

  constructor(reason: string, msg: Message) {
    super({
      type: 'Abort',
      name: 'AbortedError',
      message: `Message '${msg.type}' with kind '${msg.kind}' is interrupted due to ${reason}`,
      code: 'ABORTED',
      context: msg.ctx,
      details: {
        metadata: { msg },
      },
    });
  }
}

export interface TypedAbortSignal extends AbortSignal {
  readonly reason: AbortedError;
}

export const runWithAbort = async <T>(
  fn: () => Promise<T> | T,
  signal: AbortSignal,
  onAbort?: () => Promise<void> | void
): Promise<T> => {
  if (signal.aborted) {
    if (onAbort) await onAbort();
    throw signal.reason;
  }

  let removeListener: () => void;
  let settled = false;

  const abortPromise = new Promise<never>((_, reject) => {
    const handleAbort = async () => {
      if (settled) return;

      try {
        if (onAbort) await onAbort();
      } finally {
        reject(signal.reason);
      }
    };

    signal.addEventListener('abort', handleAbort, { once: true });
    removeListener = () => signal.removeEventListener('abort', handleAbort);
  });

  try {
    return await Promise.race([
      Promise.resolve()
        .then(fn)
        .then(
          (res) => {
            settled = true;
            return res;
          },
          (err) => {
            settled = true;
            throw err;
          }
        ),
      abortPromise,
    ]);
  } finally {
    if (removeListener!) removeListener();
  }
};

export const createAbortScope = () => {
  const controller = new AbortController();
  const signal = controller.signal as TypedAbortSignal;

  const abort = (reason: string, msg: Message) => {
    controller.abort(new AbortedError(reason, msg));
  };

  const withAbort = <T>(fn: () => Promise<T> | T, onAbort?: () => Promise<void> | void) =>
    runWithAbort(fn, signal, onAbort);

  return { abort, signal, withAbort };
};
