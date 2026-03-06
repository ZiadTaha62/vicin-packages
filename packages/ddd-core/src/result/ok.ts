import type { Err } from './err';
import type { DomainResult } from './result';

export class Ok<T> {
  public readonly _tag = 'Ok' as const;

  constructor(public readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr<U>(_defaultValue: U): T {
    return this.value;
  }

  unwrapOrElse<U>(_fn: (error: never) => U): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Ok<U> {
    return new Ok(fn(this.value));
  }

  mapErr<F>(_fn: (error: never) => F): Ok<T> {
    return this;
  }

  andThen<U, F>(fn: (value: T) => DomainResult<U, F>): DomainResult<U, F> {
    return fn(this.value);
  }

  orElse<U, F>(_fn: (error: never) => DomainResult<U, F>): Ok<T> {
    return this;
  }

  match<A>(okFn: (value: T) => A, _errFn: (error: never) => A): A {
    return okFn(this.value);
  }
}

// === Factory functions (the most ergonomic way to create them) ===
export const ok = <T>(value: T): Ok<T> => new Ok(value);
