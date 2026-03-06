import { Err } from './err';
import { Ok } from './ok';

/**
 * Main Result type used everywhere in your domain
 */
export type DomainResult<T, E = Error> = Ok<T> | Err<E>;

export namespace DomainResult {
  export function combine<T, E>(results: DomainResult<T, E>[]): DomainResult<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isErr()) return err(result.error);
      values.push(result.value);
    }
    return ok(values);
  }
  export function combineWith<T1, T2, E>(r1: DomainResult<T1, E>, r2: DomainResult<T2, E>): DomainResult<[T1, T2], E> {
    if (r1.isErr()) return err(r1.error);
    if (r2.isErr()) return err(r2.error);
    return ok([r1.value, r2.value]);
  }
  export function combineAll<T, E>(results: DomainResult<T, E>[]): DomainResult<T[], E[]> {
    const values: T[] = [];
    const errors: E[] = [];
    for (const r of results) {
      if (r.isErr()) errors.push(r.error);
      else values.push(r.value);
    }
    return errors.length ? DomainResult.err(errors) : DomainResult.ok(values);
  }
  export const ok = <T>(value: T): Ok<T> => new Ok(value);
  export const err = <E>(error: E): Err<E> => new Err(error);
}
