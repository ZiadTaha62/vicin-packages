import type { Transformation } from '../core';

/**
 * Creates a typed applicator for a {@link Transformation}.
 *
 * Use this for "forward" operations (e.g., encrypt, encode, wrap).
 * The `input` parameter is only used for type inference — it is not used at runtime.
 *
 * Zero-runtime-cost assertion helper.
 *
 * @template Tr - The transformation declaration.
 * @returns A function that applies the transformation while preserving the input type for later revert.
 */
export const applyTransformation =
  <Tr extends Transformation.Any>() =>
  <I, T>(input: I, transformed: T) =>
    transformed as Transformation.Apply<Tr, I, T>;

/**
 * Creates a typed reverter for a {@link Transformation}.
 *
 * Use this for "reverse" operations (e.g., decrypt, decode, unwrap).
 * The `transformed` parameter is used for type inference of the expected input,
 * and `input` is the computed result that must match the stored input type.
 *
 * Zero-runtime-cost assertion helper.
 *
 * @template Tr - The transformation declaration.
 * @returns A function that reverts the transformation, stripping phantom metadata.
 */
export const revertTransformation =
  <Tr extends Transformation.Any>() =>
  <T, I>(transformed: T, input: I) =>
    input as Transformation.Revert<Tr, T, I>;
