import { runWithAbort } from './abort';

export interface DelayOptions {
  signal?: AbortSignal | null;
}

export function delay(ms: number, opts?: DelayOptions): Promise<void> {
  if (ms < 0) {
    throw new RangeError(`'ms' argument to 'delay()' must be non-negative, received ${ms}`);
  }

  const { signal } = opts ?? {};

  if (signal?.aborted) {
    throw signal.reason;
  }

  let timer: NodeJS.Timeout;
  const cleanup = () => {
    clearTimeout(timer);
  };

  const timerPromise = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      resolve();
    }, ms);
  });

  return signal ? runWithAbort(() => timerPromise, signal, cleanup) : timerPromise;
}
