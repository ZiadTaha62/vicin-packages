import type { LabelCore, TagCore } from '../fields';
import type { ErrorType, Errors } from '../errors';
import type { HandleOriginalType, Prettify, WithMetadata } from './helpers';

/**
 * Branding API.
 *
 * Brands provide nominal typing for otherwise identical values.
 * A value may only be branded once.
 *
 * @deprecated To unify Api surface 'Identity' should be used instea, will be removed in v2.0.0. for more info check 'https://www.npmjs.com/package/@vicin/phantom#deprecated-api'
 */
export namespace BrandCore {
  /** Type guard for any brand. */
  export type Any = TagCore.Of<string | symbol>;

  /** Declare a brand */
  export type Declare<
    T extends string | symbol,
    L extends string = never,
  > = Prettify<TagCore.Of<T> & LabelCore.OfIfExists<L>>;

  /**
   * Assign a brand to a value.
   * Fails if the value is already branded.
   */
  export type Assign<B extends Any, T> =
    T extends ErrorType<any> ? T : _Assign<B, HandleOriginalType<T>>;

  /** Internal implementation of 'Brand.Assign' */
  type _Assign<B extends Any, T> =
    TagCore.HasTag<T> extends true
      ? ErrorType<Errors<B, T>['alreadyBranded']>
      : WithMetadata<T, B>;

  /**
   * Assign a brand if possible, otherwise return the original type.
   */
  export type AssignSafe<B extends Any, T> =
    T extends ErrorType<any> ? T : _AssignSafe<B, HandleOriginalType<T>>;

  /** Internal implementation of 'Brand.AssignSafe' */
  type _AssignSafe<B extends Any, T> =
    TagCore.HasTag<T> extends true ? T : WithMetadata<T, B>;

  /** Check whether value is branded with */
  export type isBrand<T, B extends Any> = T extends B ? true : false;
}
