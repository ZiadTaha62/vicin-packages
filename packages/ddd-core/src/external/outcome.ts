import {
  Result as _Result,
  ResultAsync as _ResultAsync,
  err as _err,
  errAsync as _errAsync,
  ok as _ok,
  okAsync as _okAsync,
} from 'neverthrow';

// Re-aliased to survive bundling and prevent circular-reference inside namespace
const __ok = _ok;
const __err = _err;
const __okAsync = _okAsync;
const __errAsync = _errAsync;
type __Result<T, E> = _Result<T, E>;
type __ResultAsync<T, E> = _ResultAsync<T, E>;

export type Result<T, E> = __Result<T, E>;

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
  export const ok = __ok;

  /**
   * Creates a failed Result.
   * @template E The type of the error.
   * @param error The error value.
   * @returns A Result<never, E>.
   */
  export const err = __err;

  /**
   * Type alias for a generic Result from neverthrow.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   */
  export type Of<T, E> = _Result<T, E>;

  /**
   * Converts a Result to a Status object.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   * @param result The Result to convert.
   * @returns A Status object representing the outcome.
   */
  export const toStatus = <T, E>(result: Result.Of<T, E>): Status.Of<T, E> => {
    return result.isOk()
      ? { status: true, value: result.value }
      : { status: false, error: result.error };
  };
}

export type ResultAsync<T, E> = __ResultAsync<T, E>;

/**
 * Namespace for asynchronous result handling, wrapping and extending neverthrow's ResultAsync.
 */
export namespace ResultAsync {
  /**
   * Creates a successful async Result.
   * @template T The type of the value.
   * @param value The successful value or Promise resolving to it.
   * @returns A ResultAsync<T, never>.
   */
  export const ok = __okAsync;

  /**
   * Creates a failed async Result.
   * @template E The type of the error.
   * @param error The error value or Promise resolving to it.
   * @returns A ResultAsync<never, E>.
   */
  export const err = __errAsync;

  /**
   * Class wrapper for a generic async Result from neverthrow.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   */
  export class Of<T, E> extends _ResultAsync<T, E> {}

  /**
   * Converts an async Result to a Status object asynchronously.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   * @param result The ResultAsync to convert.
   * @returns A Promise resolving to a Status object.
   */
  export const toStatus = async <T, E>(result: ResultAsync.Of<T, E>): Promise<Status.Of<T, E>> => {
    const r = await result;
    return r.isOk() ? { status: true, value: r.value } : { status: false, error: r.error };
  };
}

export type Status<T, E> = { status: true; value: T } | { status: false; error: E };

/**
 * Namespace for simple status objects, providing a lightweight alternative to Results for success/failure representation.
 */
export namespace Status {
  /**
   * Creates a successful Status.
   * @template T The type of the value.
   * @param value The successful value.
   * @returns A successful Status object.
   */
  export const ok = <T>(value: T) =>
    ({
      status: true,
      value,
    }) as const;

  /**
   * Creates a failed Status.
   * @template E The type of the error.
   * @param error The error value.
   * @returns A failed Status object.
   */
  export const err = <E>(error: E) =>
    ({
      status: false,
      error,
    }) as const;

  /**
   * Type for a generic Status union.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   */
  export type Of<T, E> = { status: true; value: T } | { status: false; error: E };

  /**
   * Converts a Status to a Result.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   * @param status The Status to convert.
   * @returns A Result representing the outcome.
   */
  export const toResult = <T, E>(status: Status.Of<T, E>): Result.Of<T, E> => {
    return status.status ? Result.ok(status.value) : Result.err(status.error);
  };

  /**
   * Converts a Status to an async Result.
   * @template T The type of the successful value.
   * @template E The type of the error value.
   * @param status The Status to convert.
   * @returns A ResultAsync representing the outcome.
   */
  export const toResultAsync = <T, E>(status: Status.Of<T, E>): ResultAsync.Of<T, E> => {
    return status.status ? ResultAsync.ok(status.value) : ResultAsync.err(status.error);
  };
}
