import { runWithAbort } from './abort';

export interface ConcurrentlyOptions {
  signal?: AbortSignal;
}

export async function concurrently<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => R | Promise<R>,
  opts?: ConcurrentlyOptions
): Promise<R[]> {
  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new RangeError('concurrency must be >= 1');
  }

  const { signal } = opts ?? {};

  if (signal?.aborted) {
    throw signal.reason;
  }

  const abortableWorker = signal
    ? (item: T, index: number) => runWithAbort(() => worker(item, index), signal)
    : worker;

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const run = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;

      results[index] = await abortableWorker(items[index]!, index);
    }
  };

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());

  await Promise.all(runners);
  return results;
}
