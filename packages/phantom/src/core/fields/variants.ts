/**
 * Variant metadata.
 *
 * Variants represent mutually exclusive states of a type.
 */
export namespace VariantsCore {
  /** Marker type for variant-bearing values */
  export type Any = {
    __Phantom: { __Variants: string };
  };

  /** Declare allowed variants */
  export type Of<Variants extends string> = {
    __Phantom: { __Variants: Variants };
  };

  /** Conditionally declare variants */
  export type OfIfExists<Variants extends string> = [Variants] extends [never]
    ? {}
    : Of<Variants>;

  /** Extract variant union */
  export type VariantsOf<T> = T extends {
    __Phantom: { __Variants: infer Variants };
  }
    ? Variants extends string
      ? Variants
      : never
    : never;

  /** Check whether variants exist */
  export type HasVariants<T> = T extends {
    __Phantom: { __Variants: string };
  }
    ? true
    : false;
}
