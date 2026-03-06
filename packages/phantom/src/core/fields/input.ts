/**
 * Input metadata.
 *
 * Utilities for attaching and querying input metadata in transformations.
 */
export namespace InputCore {
  /** Marker type for input value */
  export type Any = { __Phantom: { __Input: unknown } };

  /** Set input */
  export type Of<Input> = { __Phantom: { __Input: Input } };

  /** Conditionally set input */
  export type OfIfExists<Input> = [Input] extends [never]
    ? {}
    : { __Phantom: { __Input: Input } };

  /** Extract the input */
  export type InputOf<T> = T extends { __Phantom: { __Input: infer Input } }
    ? Input
    : never;

  /** Check whether an input exists */
  export type HasInput<T, I = unknown> = T extends {
    __Phantom: { __Input: I };
  }
    ? true
    : false;
}
