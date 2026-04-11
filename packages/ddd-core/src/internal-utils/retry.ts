import { Result, type sigil, type ExtendSigil } from '../utils';
import { ApplicationError, ApplicationErrorMark } from '../error';
import type { Message } from '../controller';
import type { ResultAsync } from 'neverthrow';
import { runWithAbort } from './abort';
import { delay } from './delay';

@ApplicationErrorMark('@vicin/ddd-core.ApplicationRetryError')
export class ApplicationRetryError extends ApplicationError {
  declare [sigil]: ExtendSigil<'ApplicationRetryError', ApplicationError>;

  constructor(msg: Message, attempts: number, lastError: unknown) {
    super({
      type: 'Infrastructure',
      name: 'RetryError',
      message: `Operation on message '${msg.type}' failed after ${attempts} attempts.`,
      code: 'RETRY_EXHAUSTED',
      context: msg.ctx,
      details: { metadata: { lastError, attempts } },
    });
  }
}

export function exponentialBackoff(delayMs: number, attempt: number) {
  return delayMs * Math.pow(2, attempt - 1);
}

function addJitter(baseMs: number, factor = 0.1): number {
  return Math.floor(baseMs * (1 + Math.random() * factor));
}

export function fullJitter(delayMs: number, attempt: number) {
  return addJitter(delayMs * Math.pow(2, attempt - 1));
}

export interface RetryOptions {
  attempts?: number;
  delayMs?: number;
  delayFn?: (delayMs: number, attempt: number, error: unknown) => Promise<number> | number;
  signal?: AbortSignal | null;
  onRetry?: (error: unknown, attempt: number) => void;
  shouldRetry?: (error: unknown, attempt: number) => boolean | Promise<boolean>;
}

export async function retry<T, E>(
  fn: () => ResultAsync<T, E> | Promise<Result<T, E>> | Result<T, E>,
  msg: Message,
  opts?: RetryOptions
): Promise<Result<T, E | ApplicationRetryError>> {
  const {
    attempts = 1,
    delayMs = 1000,
    delayFn = fullJitter,
    signal,
    onRetry,
    shouldRetry,
  } = opts ?? {};

  if (attempts < 0) throw new RangeError('attempts must be >= 0');
  if (attempts === 0) return Result.err(new ApplicationRetryError(msg, 0, undefined));

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (signal?.aborted) throw signal.reason;

    const result = await (signal ? runWithAbort(fn, signal) : fn());

    if (result.isOk()) return result;

    lastError = result.error;

    if (attempt === attempts) {
      return Result.err(new ApplicationRetryError(msg, attempts, lastError));
    }

    const retryAllowed = shouldRetry ? await shouldRetry(lastError, attempt) : true;
    if (!retryAllowed) {
      return Result.err(new ApplicationRetryError(msg, attempts, lastError));
    }

    if (onRetry) onRetry(lastError, attempt);

    const waitTime = await delayFn(delayMs, attempt, lastError);
    await delay(waitTime, { signal: signal ?? null });
  }

  // unreachable
  return Result.err(new ApplicationRetryError(msg, attempts, lastError));
}
