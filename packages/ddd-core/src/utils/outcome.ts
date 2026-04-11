import {
  Result as _Result,
  ResultAsync as _ResultAsync,
  err as _err,
  errAsync as _errAsync,
  ok as _ok,
  okAsync as _okAsync,
} from 'neverthrow';

export type Result<T, E> = _Result<T, E>;

/**
 * Namespace for synchronous result handling, wrapping and extending neverthrow's Result.
 */
export namespace Result {
  /**
   * Creates a Result from a throwable function, catching errors.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   * @param fn The function that may throw.
   * @param errorFn Optional function to transform caught errors.
   * @returns A Result<T, E>.
   */
  export const fromThrowable = _Result.fromThrowable;

  /**
   * Combines multiple Results into one, returning the first error if any.
   * @template T The type of the successful values.
   * @template E The type of the error values.
   * @param results Array of Results.
   * @returns A Result<T[], E>.
   */
  export const combine = _Result.combine;

  /**
   * Combines multiple Results, collecting all errors if present.
   * @template T The type of the successful values.
   * @template E The type of the error values.
   * @param results Array of Results.
   * @returns A Result<T[], E[]>.
   */
  export const combineWithAllErrors = _Result.combineWithAllErrors;

  /**
   * Creates a successful Result.
   * @template T The type of the value.
   * @param value The successful value.
   * @returns A Result<T, never>.
   */
  export const ok = _ok;

  /**
   * Creates a failed Result.
   * @template E The type of the error.
   * @param error The error value.
   * @returns A Result<never, E>.
   */
  export const err = _err;
}

export type ResultAsync<T, E> = _ResultAsync<T, E>;

/**
 * Namespace for asynchronous result handling, wrapping and extending neverthrow's ResultAsync.
 */
export namespace ResultAsync {
  export const fromPromise = _ResultAsync.fromPromise;

  export const fromSafePromise = _ResultAsync.fromSafePromise;

  export const fromThrowable = _ResultAsync.fromThrowable;

  export const fromResult = <T, E>(v: Promise<Result<T, E>> | ResultAsync<T, E>) => {
    if (v instanceof _ResultAsync) return v;
    return new _ResultAsync(v);
  };

  export const combine = _ResultAsync.combine;

  export const combineWithAllErrors = _ResultAsync.combineWithAllErrors;

  export const constructor = _ResultAsync;

  /**
   * Creates a successful async Result.
   * @template T The type of the value.
   * @param value The successful value or Promise resolving to it.
   * @returns A ResultAsync<T, never>.
   */
  export const ok = _okAsync;

  /**
   * Creates a failed async Result.
   * @template E The type of the error.
   * @param error The error value or Promise resolving to it.
   * @returns A ResultAsync<never, E>.
   */
  export const err = _errAsync;
}
