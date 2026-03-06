/**
 * Nominal tag metadata.
 *
 * Tags uniquely identify a branded or identified type.
 * A value may only have a single tag.
 */
export namespace TagCore {
  /** Marker type for any tagged value */
  export type Any = {
    __Phantom: { __Tag: string | symbol };
  };

  /** Attach a specific tag */
  export type Of<Tag extends string | symbol> = {
    __Phantom: { __Tag: Tag };
  };

  /** Conditionally attach a tag if it exists */
  export type OfIfExists<Tag extends string | symbol> = [Tag] extends [never]
    ? {}
    : Of<Tag>;

  /** Extract the tag from a type */
  export type TagOf<T> = T extends { __Phantom: { __Tag: infer Tag } }
    ? Tag
    : never;

  /** Check whether a type is tagged */
  export type HasTag<
    T,
    Ta extends string | symbol = string | symbol,
  > = T extends { __Phantom: { __Tag: Ta } } ? true : false;
}
