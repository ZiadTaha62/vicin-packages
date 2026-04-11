import { Result, ResultAsync } from '../utils';
import { runWithAbort } from './abort';

export interface FallbackOptions {
  signal?: AbortSignal | null;
}

/**
 * Wraps an operation and returns a fallback value if it fails.
 */
export function fallback<T, E, F>(
  fn: () => Promise<Result<T, E>> | ResultAsync<T, E> | Result<T, E>,
  fallbackValue: F,
  opts?: FallbackOptions
): ResultAsync<T | F, never> {
  const { signal } = opts ?? {};

  const operation = async () => {
    const result = await fn();
    return result.isOk() ? (result as Result<T | F, never>) : Result.ok(fallbackValue);
  };

  return signal
    ? new ResultAsync.constructor(runWithAbort(operation, signal))
    : new ResultAsync.constructor(operation());
}
