import type { Trait } from '../core';

/**
 * Creates a typed caster that adds a single {@link Trait} to a value.
 *
 * Zero-runtime-cost assertion helper.
 *
 * @template Tr - The trait declaration to add.
 * @returns A function that adds the trait to any value.
 */
export const addTrait =
  <Tr extends Trait.Any>() =>
  <V>(value: V): Trait.Add<Tr, V> =>
    value as any;

/**
 * Creates a typed caster that adds multiple {@link Trait}s to a value.
 *
 * Zero-runtime-cost assertion helper.
 *
 * @template Tr - Tuple of trait declarations to add.
 * @returns A function that adds all traits to any value.
 */
export const addTraits =
  <Tr extends Trait.Any[]>() =>
  <V>(value: V): Trait.AddMulti<Tr, V> =>
    value as any;

/**
 * Creates a typed caster that removes a single {@link Trait} from a value.
 *
 * Zero-runtime-cost assertion helper.
 *
 * @template Tr - The trait declaration to remove.
 * @returns A function that drops the trait from any value.
 */
export const dropTrait =
  <Tr extends Trait.Any>() =>
  <V>(value: V): Trait.Drop<Tr, V> =>
    value as any;

/**
 * Creates a typed caster that removes multiple {@link Trait}s from a value.
 *
 * Zero-runtime-cost assertion helper.
 *
 * @template Tr - Tuple of trait declarations to remove.
 * @returns A function that drops all specified traits from any value.
 */
export const dropTraits =
  <Tr extends Trait.Any[]>() =>
  <V>(value: V): Trait.DropMulti<Tr, V> =>
    value as any;
