/**
 * Trait metadata.
 *
 * Traits behave like a set of capabilities that can be
 * added or removed independently.
 */
export namespace TraitsCore {
  /** Marker type for trait-bearing values */
  export type Any = {
    __Phantom: { __Traits: {} };
  };

  /** Declare a single trait */
  export type Of<Trait extends string | symbol> = {
    __Phantom: { __Traits: { [K in Trait]: true } };
  };

  /** Construct traits from an explicit trait map */
  export type FromMap<Traits extends Record<string | symbol, true>> = {
    __Phantom: { __Traits: Traits };
  };

  /** Conditionally declare a trait */
  export type OfIfExists<Trait extends string | symbol> = [Trait] extends [
    never,
  ]
    ? {}
    : Of<Trait>;

  /** Extract the trait map */
  export type TraitsOf<T> = T extends {
    __Phantom: { __Traits: infer Traits };
  }
    ? Traits extends Record<string | symbol, true>
      ? Traits
      : never
    : never;

  /** Extract trait keys */
  export type TraitKeysOf<T> = T extends {
    __Phantom: { __Traits: infer Traits };
  }
    ? keyof Traits
    : never;

  /** Check if any traits exist */
  export type HasTraits<
    T,
    Tr extends string | symbol = string | symbol,
  > = T extends {
    __Phantom: { __Traits: Record<Tr, true> };
  }
    ? true
    : false;
}
