import type { Sigil } from './classes';

/** -----------------------------------------
 *  Public
 * ----------------------------------------- */

/**
 * Symbol used for nominal typing
 */
export declare const sigil: unique symbol;

/**
 * Extract the compile-time label map from a sigil instance `S`.
 *
 * @typeParam S - A sigil instance type.
 * @returns The sigil label record (e.g. `{ User: true, Admin: true }`) or never if not Sigil class instance.
 */
export type SigilOf<S> = S extends { readonly [sigil]: infer Sigil } ? Sigil : never;

/**
 * Extract the compile-time label map from a sigil constructor `S`.
 *
 * @typeParam S - A sigil constructor type.
 * @returns The sigil label record (e.g. `{ User: true, Admin: true }`) or never if not Sigil class instance.
 */
export type SigilOfStatic<S> = SigilOf<GetPrototype<S>>;

/** Update '[sigil]' field for nominal typing */
export type ExtendSigil<L extends string, P extends Sigil> = Prettify<
  IfNever<SigilOf<P>, {}> & { [K in L]: true }
>;

/** Update '[sigil]' field for nominal typing, accept constructor type */
export type ExtendSigilStatic<L extends string, P extends typeof Sigil> = ExtendSigil<
  L,
  GetPrototype<P>
>;

/**
 * Helper type to get prototype of class
 *
 * @template T - Class constructor.
 */
export type GetPrototype<T> = T extends { prototype: infer P } ? P : never;

/** -----------------------------------------
 *  Internal
 * ----------------------------------------- */

/**
 * Generic type for class constructors used by the Sigil utilities.
 *
 * - `T` is the instance type produced by the constructor.
 * - `P` is the tuple of parameter types accepted by the constructor.
 *
 * @template T - Instance type produced by the constructor (defaults to `object`).
 * @template P - Parameter tuple type for the constructor.
 */
export type Constructor<T = object, P extends any[] = any[]> = new (...args: P) => T;

/**
 * Generic type for class constructors used by the Sigil utilities. for 'abstract classes'.
 *
 * - `T` is the instance type produced by the constructor.
 * - `P` is the tuple of parameter types accepted by the constructor.
 *
 * @template T - Instance type produced by the constructor (defaults to `object`).
 * @template P - Parameter tuple type for the constructor.
 */
export type ConstructorAbstract<T = object, P extends any[] = any[]> = abstract new (
  ...args: P
) => T;

/** Helper type to prettify value */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Helper type to replace 'never' with another type */
type IfNever<T, R = {}> = [T] extends [never] ? R : T;
