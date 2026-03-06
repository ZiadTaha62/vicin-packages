import type { Ok } from './ok';
import type { DomainResult } from './result';

export class Err<E> {
  public readonly _tag = 'Err' as const;

  constructor(public readonly error: E) {}

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  unwrap(): never {
    throw new Error(`Called unwrap() on an Err: ${String(this.error)}`);
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(fn: (error: E) => T): T {
    return fn(this.error);
  }

  map<U>(_fn: (value: never) => U): Err<E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): Err<F> {
    return new Err(fn(this.error));
  }

  andThen<U, F>(_fn: (value: never) => DomainResult<U, F>): Err<E> {
    return this;
  }

  orElse<U, F>(fn: (error: E) => DomainResult<U, F>): DomainResult<U, F> {
    return fn(this.error);
  }

  match<A>(_okFn: (value: never) => A, errFn: (error: E) => A): A {
    return errFn(this.error);
  }
}

export const err = <E>(error: E): Err<E> => new Err(error);
