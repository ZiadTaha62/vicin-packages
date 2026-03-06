import type {
  BrandCore,
  IdentityCore,
  TraitCore,
  TransformationCore,
} from './composed';
import type {
  BaseCore,
  InputCore,
  LabelCore,
  TagCore,
  TraitsCore,
  VariantsCore,
} from './fields';

/**
 * Inspect API.
 *
 * Inspection helpers of phantom types.
 */
export namespace Inspect {
  /** Extract the label */
  export type LabelOf<T> = LabelCore.LabelOf<T>;
  /** Check whether a base constraint exists */
  export type HasLabel<T, L extends string = string> = LabelCore.HasLabel<T, L>;
  /** Extract the tag from a type */
  export type TagOf<T> = TagCore.TagOf<T>;
  /** Check whether a type is tagged */
  export type HasTag<
    T,
    Ta extends string | symbol = string | symbol,
  > = TagCore.HasTag<T, Ta>;
  /** Extract variant union */
  export type VariantsOf<T> = VariantsCore.VariantsOf<T>;
  /** Check whether variants exist */
  export type HasVariants<T> = VariantsCore.HasVariants<T>;
  /** Extract the base type */
  export type BaseOf<T> = BaseCore.BaseOf<T>;
  /** Check whether a base constraint exists */
  export type HasBase<T, B = unknown> = BaseCore.HasBase<T, B>;
  /** Extract the input */
  export type InputOf<T> = InputCore.InputOf<T>;
  /** Check whether an input exists */
  export type HasInput<T, I = unknown> = InputCore.HasInput<T, I>;
  /** Extract the trait map */
  export type TraitsOf<T> = TraitsCore.TraitsOf<T>;
  /** Extract trait keys */
  export type TraitKeysOf<T> = TraitsCore.TraitKeysOf<T>;
  /** Check if any traits exist */
  export type HasTraits<T> = TraitsCore.HasTraits<T>;
  /**
   * Check whether value is branded with
   *
   * @deprecated To unify Api surface 'isIdentity' should be used instea, will be removed in v2.0.0. for more info check 'https://www.npmjs.com/package/@vicin/phantom#deprecated-api'
   */
  export type isBrand<T, B extends BrandCore.Any> = BrandCore.isBrand<T, B>;
  /** Check whether value is branded with */
  export type isIdentity<
    T,
    I extends IdentityCore.Any,
  > = IdentityCore.isIdentity<T, I>;
  /** Check whether value has trait */
  export type HasTrait<T, Tr extends TraitCore.Any> = TraitCore.HasTrait<T, Tr>;
  /** Check whether value is transformed with */
  export type isTransformed<
    T,
    Tr extends TransformationCore.Any,
  > = TransformationCore.isTransformed<T, Tr>;
}
