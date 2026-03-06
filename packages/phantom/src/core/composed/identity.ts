import type { BaseCore, LabelCore, TagCore, VariantsCore } from '../fields';
import type { ErrorType, Errors } from '../errors';
import type {
  HandleOriginalType,
  PatchMetadata,
  Prettify,
  WithMetadata,
  IfNever,
} from './helpers';

/**
 * Identity API.
 *
 * Identities are brands with additional constraints:
 * - Base type
 * - Variants
 */
export namespace IdentityCore {
  /** Type guard for any identity. */
  export type Any = TagCore.Of<string | symbol>;

  /** Declare an identity */
  export type Declare<
    T extends string | symbol,
    L extends string = never,
    B extends unknown = never,
    V extends string = never,
  > = IfNever<B, unknown> &
    Prettify<
      TagCore.Of<T> &
        LabelCore.OfIfExists<L> &
        BaseCore.OfIfExists<B> &
        VariantsCore.OfIfExists<V>
    >;

  /**
   * Assign an identity to a value.
   * Enforces base-type compatibility.
   */
  export type Assign<I extends Any, T> =
    T extends ErrorType<any> ? T : _Assign<I, HandleOriginalType<T>>;

  /** Internal implementation of 'Identity.Assign' */
  type _Assign<I extends Any, T> =
    TagCore.HasTag<T> extends true
      ? ErrorType<Errors<I, T>['alreadyBranded']>
      : T extends BaseCore.BaseOf<I>
        ? WithMetadata<T, I>
        : ErrorType<Errors<I, T>['typeNotExtendBase']>;

  /** Safe identity assignment */
  export type AssignSafe<I extends Any, T> =
    T extends ErrorType<any> ? T : _AssignSafe<I, HandleOriginalType<T>>;

  /** Internal implementation of 'Identity.AssignSafe' */
  type _AssignSafe<I extends Any, T> =
    TagCore.HasTag<T> extends true
      ? T
      : T extends BaseCore.BaseOf<I>
        ? WithMetadata<T, I>
        : ErrorType<Errors<I, T>['typeNotExtendBase']>;

  /** Set the active variant on an identity */
  export type WithVariant<
    I extends Any,
    V extends VariantsCore.VariantsOf<I>,
  > = PatchMetadata<I, VariantsCore.Of<V>>;

  /** Set the active variant on a value */
  export type WithTypeVariant<T, V extends VariantsCore.VariantsOf<T>> =
    T extends ErrorType<any> ? T : _WithTypeVariant<HandleOriginalType<T>, V>;

  /** Internal implementation of 'Identity.WithTypeVariant' */
  type _WithTypeVariant<T, V extends VariantsCore.VariantsOf<T>> = WithMetadata<
    T,
    VariantsCore.Of<V>
  >;

  /** Check whether value is branded with */
  export type isIdentity<T, I extends Any> = T extends I ? true : false;
}
