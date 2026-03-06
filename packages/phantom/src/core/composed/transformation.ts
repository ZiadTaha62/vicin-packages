import type {
  InputCore,
  BaseCore,
  LabelCore,
  TagCore,
  VariantsCore,
} from '../fields';
import type { ErrorType, Errors } from '../errors';
import type {
  HandleOriginalType,
  PatchMetadata,
  Prettify,
  WithMetadata,
  IfNever,
} from './helpers';

/**
 * Transformation API.
 *
 * Transformations represent reversible operations that
 * change the shape of a value while preserving its origin.
 */
export namespace TransformationCore {
  /** Type guard for any transformation. */
  export type Any = InputCore.Of<any> & TagCore.Of<string | symbol>;

  /** Declare a transformation */
  export type Declare<
    I,
    T extends string | symbol,
    L extends string = never,
    B extends unknown = never,
    V extends string = never,
  > = IfNever<B, unknown> &
    Prettify<
      InputCore.Of<I> &
        TagCore.Of<T> &
        LabelCore.OfIfExists<L> &
        BaseCore.OfIfExists<B> &
        VariantsCore.OfIfExists<V>
    >;

  /**
   * Apply a transformation to a value.
   * Enforces base-type compatibility.
   */
  export type Apply<Tr extends Any, I, T> =
    T extends ErrorType<any> ? T : _Apply<Tr, I, HandleOriginalType<T>>;

  /** Internal implementation of 'Transformation.Apply' */
  type _Apply<Tr extends Any, I, T> =
    TagCore.HasTag<T> extends true
      ? ErrorType<Errors<I, T>['alreadyBranded']>
      : T extends BaseCore.BaseOf<I>
        ? WithMetadata<T, PatchMetadata<Tr, InputCore.Of<I>>>
        : ErrorType<Errors<I, T>['typeNotExtendBase']>;

  /** Revert a transformation */
  export type Revert<Tr extends Any, T, I> =
    T extends ErrorType<any> ? T : _Revert<Tr, HandleOriginalType<T>, I>;

  /** Internal implementation of 'Transformation.Revert' */
  type _Revert<Tr extends Any, T, I> =
    InputCore.HasInput<T> extends true
      ? T extends Tr
        ? InputCore.InputOf<T>
        : ErrorType<Errors<Tr, T>['transformationMismatch']>
      : ErrorType<Errors<never, T>['notTransformed']>;

  /** Revert a transformation whatever transformation was */
  export type RevertAny<T, I> =
    T extends ErrorType<any> ? T : _RevertAny<HandleOriginalType<T>>;

  /** Internal implementation of 'Transformation.RevertAny' */
  type _RevertAny<T> =
    InputCore.HasInput<T> extends true
      ? InputCore.InputOf<T>
      : ErrorType<Errors<never, T>['notTransformed']>;

  /** Check whether value is transformed with */
  export type isTransformed<T, Tr extends Any> = T extends Tr ? true : false;
}
