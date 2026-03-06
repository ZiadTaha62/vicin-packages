/**
 * Optional human-readable label metadata.
 *
 * Labels are descriptive only and do not affect identity.
 */
export namespace LabelCore {
  /** Marker type for labeled values */
  export type Any = {
    __Phantom: { __Label?: string };
  };

  /** Attach a label */
  export type Of<Label extends string> = {
    __Phantom: { __Label?: Label };
  };

  /** Conditionally attach a label */
  export type OfIfExists<Label extends string> = [Label] extends [never]
    ? {}
    : Of<Label>;

  /** Extract the label */
  export type LabelOf<T> = T extends {
    __Phantom: { __Label?: infer Label };
  }
    ? Exclude<Label, undefined>
    : never;

  /** Check whether a label exists */
  export type HasLabel<T, L extends string = string> = T extends {
    __Phantom: { __Label?: L };
  }
    ? true
    : false;
}
