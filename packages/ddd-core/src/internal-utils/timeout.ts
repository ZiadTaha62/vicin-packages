import { type sigil, type ExtendSigil } from '../utils';
import type { Message } from '../controller';
import { ApplicationError, ApplicationErrorMark } from '../error';
import { runWithAbort } from './abort';

@ApplicationErrorMark('@vicin/ddd-core.ApplicationTimeoutError')
class ApplicationTimeoutError extends ApplicationError {
  declare [sigil]: ExtendSigil<'ApplicationTimeoutError', ApplicationError>;

  constructor(msg: Message, ms: number, taskName: string) {
    super({
      type: 'Timeout',
      name: 'TimeoutError',
      message: `Task '${taskName}' on message '${msg.type}' with kind '${msg.kind}' timeout after ${ms}ms`,
      code: 'TIMEOUT',
      context: msg.ctx,
      details: {
        metadata: { msg },
      },
    });
  }
}

export interface TimeoutOptions {
  taskName?: string;
  onTimeout?: () => void;
  signal?: AbortSignal | null;
}

export async function timeout<T>(
  ms: number,
  fn: () => T | Promise<T>,
  msg: Message,
  opts?: TimeoutOptions
): Promise<T> {
  const { taskName, onTimeout, signal } = opts ?? {};

  if (signal?.aborted) {
    throw signal.reason;
  }

  let timer: NodeJS.Timeout;
  let settled = false;

  const cleanup = () => {
    if (timer!) clearTimeout(timer);
  };

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new ApplicationTimeoutError(msg, ms, taskName || fn.name));

      void Promise.resolve()
        .then(() => onTimeout?.())
        .catch(() => {});
    }, ms);
  });

  const workPromise = signal ? runWithAbort(fn, signal, cleanup) : Promise.resolve().then(fn);

  try {
    return await Promise.race([workPromise, timeoutPromise]);
  } finally {
    cleanup();
  }
}
