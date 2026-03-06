import type { Identity } from '../core';

/**
 * Creates a typed caster that assigns an {@link Identity} to a value.
 *
 * This is a zero-cost runtime assertion helper — it simply returns the value
 * with the identity's nominal type applied. Use it when you know a value
 * conforms to an identity but need to assert it for the type system.
 *
 * @template I - The identity declaration to assign.
 * @returns A function that casts any value to the assigned identity type.
 */
export const asIdentity =
  <I extends Identity.Any>() =>
  <V>(value: V): Identity.Assign<I, V> =>
    value as any;
