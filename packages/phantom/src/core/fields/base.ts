/**
 * Base-type metadata.
 *
 * Used to constrain which runtime types a brand, identity,
 * or transformation may be applied to.
 */
export namespace BaseCore {
  /** Marker type for base constraints */
  export type Any = {
    __Phantom: { __Base?: unknown };
  };

  /** Declare a base type */
  export type Of<Base> = {
    __Phantom: { __Base?: Base };
  };

  /** Conditionally declare a base type */
  export type OfIfExists<Base> = [Base] extends [never] ? {} : Of<Base>;

  /** Extract the base type */
  export type BaseOf<T> = T extends { __Phantom: { __Base?: infer Base } }
    ? Exclude<Base, undefined>
    : unknown;

  /** Check whether a base constraint exists */
  export type HasBase<T, B = unknown> = T extends { __Phantom: { __Base?: B } }
    ? true
    : false;
}
