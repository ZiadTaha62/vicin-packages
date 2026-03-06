import {
  addTrait,
  addTraits,
  applyTransformation,
  asBrand,
  asIdentity,
  dropTrait,
  dropTraits,
  revertTransformation,
} from './assertors';
import { PhantomChain } from './chain';
import type {
  BaseCore,
  InputCore,
  LabelCore,
  TagCore,
  TraitsCore,
  VariantsCore,
  BrandCore,
  IdentityCore,
  TraitCore,
  TransformationCore,
  ErrorType,
} from './core';
import { PhantomCore } from './core';

const _addTrait = addTrait;
const _addTraits = addTraits;
const _applyTransformation = applyTransformation;
const _asBrand = asBrand;
const _asIdentity = asIdentity;
const _dropTrait = dropTrait;
const _dropTraits = dropTraits;
const _revertTransformation = revertTransformation;
const _PhantomChain = PhantomChain;
type _ErrorType<E> = ErrorType<E>;

export namespace Phantom {
  /** --------------------------------------
   * Types
   * --------------------------------------- */

  /**
   * Optional human-readable label metadata.
   *
   * Labels are descriptive only and do not affect identity.
   */
  export namespace Label {
    /** Marker type for labeled values */
    export type Any = LabelCore.Any;
    /** Extract the label */
    export type LabelOf<T> = LabelCore.LabelOf<T>;
    /** Check whether a label exists */
    export type HasLabel<T, L extends string = string> = LabelCore.HasLabel<
      T,
      L
    >;
  }

  /**
   * Nominal tag metadata.
   *
   * Tags uniquely identify a branded or identified type.
   * A value may only have a single tag.
   */
  export namespace Tag {
    /** Marker type for any tagged value */
    export type Any = TagCore.Any;
    /** Extract the tag from a type */
    export type TagOf<T> = TagCore.TagOf<T>;
    /** Check whether a type is tagged */
    export type HasTag<
      T,
      Ta extends string | symbol = string | symbol,
    > = TagCore.HasTag<T, Ta>;
  }

  /**
   * Variant metadata.
   *
   * Variants represent mutually exclusive states of a type.
   */
  export namespace Variants {
    /** Marker type for variant-bearing values */
    export type Any = VariantsCore.Any;
    /** Extract variant union */
    export type VariantsOf<T> = VariantsCore.VariantsOf<T>;
    /** Check whether variants exist */
    export type HasVariants<T> = VariantsCore.HasVariants<T>;
  }

  /**
   * Base-type metadata.
   *
   * Used to constrain which runtime types a brand, identity,
   * or transformation may be applied to.
   */
  export namespace Base {
    /** Marker type for base constraints */
    export type Any = BaseCore.Any;
    /** Extract the base type */
    export type BaseOf<T> = BaseCore.BaseOf<T>;
    /** Check whether a base constraint exists */
    export type HasBase<T, B = unknown> = BaseCore.HasBase<T, B>;
  }

  /**
   * Input metadata.
   *
   * Utilities for attaching and querying input metadata in transformations.
   */
  export namespace Input {
    /** Marker type for input value */
    export type Any = InputCore.Any;
    /** Extract the input */
    export type InputOf<T> = InputCore.InputOf<T>;
    /** Check whether an input exists */
    export type HasInput<T, I = unknown> = InputCore.HasInput<T, I>;
  }

  /**
   * Trait metadata.
   *
   * Traits behave like a set of capabilities that can be
   * added or removed independently.
   */
  export namespace Traits {
    /** Marker type for trait-bearing values */
    export type Any = TraitsCore.Any;
    /** Extract the trait map */
    export type TraitsOf<T> = TraitsCore.TraitsOf<T>;
    /** Extract trait keys */
    export type TraitKeysOf<T> = TraitsCore.TraitKeysOf<T>;
    /** Check if any traits exist */
    export type HasTraits<
      T,
      Tr extends string | symbol = string | symbol,
    > = TraitsCore.HasTraits<T, Tr>;
  }

  /**
   * Branding API.
   *
   * Brands provide nominal typing for otherwise identical values.
   * A value may only be branded once.
   *
   * @deprecated To unify Api surface 'Identity' should be used instea, will be removed in v2.0.0. for more info check 'https://www.npmjs.com/package/@vicin/phantom#deprecated-api'
   */
  export namespace Brand {
    /** Type guard for any brand. */
    export type Any = BrandCore.Any;
    /** Declare a brand */
    export type Declare<
      T extends string | symbol,
      L extends string = never,
    > = BrandCore.Declare<T, L>;
    /** Assign a brand to a value. Fails if the value is already branded */
    export type Assign<B extends Any, T> = BrandCore.Assign<B, T>;
    /** Assign a brand if possible, otherwise return the original type */
    export type AssignSafe<B extends Any, T> = BrandCore.AssignSafe<B, T>;
    /** Check whether value is branded with */
    export type isBrand<T, B extends Brand.Any> = BrandCore.isBrand<T, B>;
  }

  /**
   * Identity API.
   *
   * Identities are brands with additional constraints:
   * - Base type
   * - Variants
   */
  export namespace Identity {
    /** Type guard for any identity. */
    export type Any = IdentityCore.Any;
    /** Declare an identity */
    export type Declare<
      T extends string | symbol,
      L extends string = never,
      B extends unknown = never,
      V extends string = never,
    > = IdentityCore.Declare<T, L, B, V>;
    /** Assign an identity to a value. Enforces base-type compatibility */
    export type Assign<I extends Any, T> = IdentityCore.Assign<I, T>;
    /** Safe identity assignment */
    export type AssignSafe<I extends Any, T> = IdentityCore.AssignSafe<I, T>;
    /** Set the active variant on an identity */
    export type WithVariant<
      I extends Any,
      V extends Variants.VariantsOf<I>,
    > = IdentityCore.WithVariant<I, V>;
    /** Set the active variant on a value */
    export type WithTypeVariant<
      T,
      V extends Variants.VariantsOf<T>,
    > = IdentityCore.WithTypeVariant<T, V>;
    /** Check whether value is branded with */
    export type isIdentity<T, I extends Any> = IdentityCore.isIdentity<T, I>;
  }

  /**
   * Trait API.
   *
   * Traits are additive capabilities that can be attached
   * or removed independently.
   */
  export namespace Trait {
    /** Type guard for any trait. */
    export type Any = TraitCore.Any;
    /** Declare a trait */
    export type Declare<Tr extends string | symbol> = TraitCore.Declare<Tr>;
    /** Add a trait */
    export type Add<Tr extends Any, T> = TraitCore.Add<Tr, T>;
    /** Add multiple traits */
    export type AddMulti<Tr extends readonly Any[], T> = TraitCore.AddMulti<
      Tr,
      T
    >;
    /** Remove a trait */
    export type Drop<Tr extends Any, T> = TraitCore.Drop<Tr, T>;
    /** Remove multiple traits */
    export type DropMulti<Tr extends readonly Any[], T> = TraitCore.DropMulti<
      Tr,
      T
    >;
    /** Check whether value has trait */
    export type HasTrait<T, Tr extends Any> = TraitCore.HasTrait<T, Tr>;
  }

  /**
   * Transformation API.
   *
   * Transformations represent reversible operations that
   * change the shape of a value while preserving its origin.
   */
  export namespace Transformation {
    /** Type guard for any transformation. */
    export type Any = TransformationCore.Any;
    /** Declare a transformation */
    export type Declare<
      I,
      T extends string | symbol,
      L extends string = never,
      B extends unknown = never,
      V extends string = never,
    > = TransformationCore.Declare<I, T, L, B, V>;
    /** Apply a transformation to a value. Enforces base-type compatibility */
    export type Apply<Tr extends Any, I, T> = TransformationCore.Apply<
      Tr,
      I,
      T
    >;
    /** Revert a transformation */
    export type Revert<Tr extends Any, T, I> = TransformationCore.Revert<
      Tr,
      T,
      I
    >;
    /** Revert a transformation whatever transformation was */
    export type RevertAny<T, I> = TransformationCore.RevertAny<T, I>;
    /** Check whether value is transformed with */
    export type isTransformed<
      T,
      Tr extends Any,
    > = TransformationCore.isTransformed<T, Tr>;
  }

  /**
   * Inspect API.
   *
   * Inspection helpers of phantom types.
   */
  export namespace Inspect {
    /** Get phantom metadata object from a type */
    export type PhantomOf<T> = PhantomCore.PhantomOf<T>;
    /** Stip phantom metadata object from a type */
    export type StripPhantom<T> = PhantomCore.StripPhantom<T>;
    /** run-time helper for 'StringPhantom', used for debugging mainly */
    export const stripPhantom = PhantomCore.stripPhantom;
    /** Extract the label */
    export type LabelOf<T> = LabelCore.LabelOf<T>;
    /** Check whether a base constraint exists */
    export type HasLabel<T, L extends string = string> = LabelCore.HasLabel<
      T,
      L
    >;
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
    export type HasTraits<
      T,
      Tr extends string | symbol = string | symbol,
    > = TraitsCore.HasTraits<T, Tr>;
    /**
     * Check whether value is branded with
     *
     * @deprecated To unify Api surface 'isIdentity' should be used instea, will be removed in v2.0.0. for more info check 'https://www.npmjs.com/package/@vicin/phantom#deprecated-api'
     */
    export type isBrand<T, B extends Brand.Any> = BrandCore.isBrand<T, B>;
    /** Check whether value is branded with */
    export type isIdentity<T, I extends Identity.Any> = IdentityCore.isIdentity<
      T,
      I
    >;
    /** Check whether value has trait */
    export type HasTrait<T, Tr extends Trait.Any> = TraitCore.HasTrait<T, Tr>;
    /** Check whether value is transformed with */
    export type isTransformed<
      T,
      Tr extends Transformation.Any,
    > = TransformationCore.isTransformed<T, Tr>;
  }

  /** --------------------------------------
   * assertors
   * --------------------------------------- */

  export namespace assertors {
    /**
     * Creates a typed caster that assigns a {@link Brand} to a value.
     *
     * This is a zero-cost runtime assertion helper — it simply returns the value
     * with the brand's nominal type applied. Use it for simple branded primitives
     * where you know the value is valid.
     *
     * @deprecated To unify Api surface 'asIdentity' should be used instea, will be removed in v2.0.0. for more info check 'https://www.npmjs.com/package/@vicin/phantom#deprecated-api'
     *
     * @template B - The brand declaration to assign.
     * @returns A function that casts any value to the branded type.
     */
    export const asBrand = _asBrand;

    /**
     * Creates a typed caster that assigns an {@link Identity} to a value.
     *
     * This is a zero-cost runtime assertion helper — it simply returns the value
     * with the identity's nominal type applied. Use it when you know a value
     * conforms to an identity but need to assert it for the type system.
     *
     * @template I - The identity declaration to assign.
     * @returns A function that casts any value to the assigned identity type.
     */
    export const asIdentity = _asIdentity;

    /**
     * Creates a typed caster that adds a single {@link Trait} to a value.
     *
     * Zero-runtime-cost assertion helper.
     *
     * @template Tr - The trait declaration to add.
     * @returns A function that adds the trait to any value.
     */
    export const addTrait = _addTrait;

    /**
     * Creates a typed caster that adds multiple {@link Trait}s to a value.
     *
     * Zero-runtime-cost assertion helper.
     *
     * @template Tr - Tuple of trait declarations to add.
     * @returns A function that adds all traits to any value.
     */
    export const addTraits = _addTraits;

    /**
     * Creates a typed caster that removes a single {@link Trait} from a value.
     *
     * Zero-runtime-cost assertion helper.
     *
     * @template Tr - The trait declaration to remove.
     * @returns A function that drops the trait from any value.
     */
    export const dropTrait = _dropTrait;

    /**
     * Creates a typed caster that removes multiple {@link Trait}s from a value.
     *
     * Zero-runtime-cost assertion helper.
     *
     * @template Tr - Tuple of trait declarations to remove.
     * @returns A function that drops all specified traits from any value.
     */
    export const dropTraits = _dropTraits;

    /**
     * Creates a typed applicator for a {@link Transformation}.
     *
     * Use this for "forward" operations (e.g., encrypt, encode, wrap).
     * The `input` parameter is only used for type inference — it is not used at runtime.
     *
     * Zero-runtime-cost assertion helper.
     *
     * @template Tr - The transformation declaration.
     * @returns A function that applies the transformation while preserving the input type for later revert.
     */
    export const applyTransformation = _applyTransformation;

    /**
     * Creates a typed reverter for a {@link Transformation}.
     *
     * Use this for "reverse" operations (e.g., decrypt, decode, unwrap).
     * The `transformed` parameter is used for type inference of the expected input,
     * and `input` is the computed result that must match the stored input type.
     *
     * Zero-runtime-cost assertion helper.
     *
     * @template Tr - The transformation declaration.
     * @returns A function that reverts the transformation, stripping phantom metadata.
     */
    export const revertTransformation = _revertTransformation;
  }

  /**
   * Creates a typed caster that assigns a {@link Brand} to a value.
   *
   * This is a zero-cost runtime assertion helper — it simply returns the value
   * with the brand's nominal type applied. Use it for simple branded primitives
   * where you know the value is valid.
   *
   * @deprecated To unify Api surface 'asIdentity' should be used instea, will be removed in v2.0.0. for more info check 'https://www.npmjs.com/package/@vicin/phantom#deprecated-api'
   *
   * @template B - The brand declaration to assign.
   * @returns A function that casts any value to the branded type.
   */
  export const asBrand = _asBrand;

  /**
   * Creates a typed caster that assigns an {@link Identity} to a value.
   *
   * This is a zero-cost runtime assertion helper — it simply returns the value
   * with the identity's nominal type applied. Use it when you know a value
   * conforms to an identity but need to assert it for the type system.
   *
   * @template I - The identity declaration to assign.
   * @returns A function that casts any value to the assigned identity type.
   */
  export const asIdentity = _asIdentity;

  /**
   * Creates a typed caster that adds a single {@link Trait} to a value.
   *
   * Zero-runtime-cost assertion helper.
   *
   * @template Tr - The trait declaration to add.
   * @returns A function that adds the trait to any value.
   */
  export const addTrait = _addTrait;

  /**
   * Creates a typed caster that adds multiple {@link Trait}s to a value.
   *
   * Zero-runtime-cost assertion helper.
   *
   * @template Tr - Tuple of trait declarations to add.
   * @returns A function that adds all traits to any value.
   */
  export const addTraits = _addTraits;

  /**
   * Creates a typed caster that removes a single {@link Trait} from a value.
   *
   * Zero-runtime-cost assertion helper.
   *
   * @template Tr - The trait declaration to remove.
   * @returns A function that drops the trait from any value.
   */
  export const dropTrait = _dropTrait;

  /**
   * Creates a typed caster that removes multiple {@link Trait}s from a value.
   *
   * Zero-runtime-cost assertion helper.
   *
   * @template Tr - Tuple of trait declarations to remove.
   * @returns A function that drops all specified traits from any value.
   */
  export const dropTraits = _dropTraits;

  /**
   * Creates a typed applicator for a {@link Transformation}.
   *
   * Use this for "forward" operations (e.g., encrypt, encode, wrap).
   * The `input` parameter is only used for type inference — it is not used at runtime.
   *
   * Zero-runtime-cost assertion helper.
   *
   * @template Tr - The transformation declaration.
   * @returns A function that applies the transformation while preserving the input type for later revert.
   */
  export const applyTransformation = _applyTransformation;

  /**
   * Creates a typed reverter for a {@link Transformation}.
   *
   * Use this for "reverse" operations (e.g., decrypt, decode, unwrap).
   * The `transformed` parameter is used for type inference of the expected input,
   * and `input` is the computed result that must match the stored input type.
   *
   * Zero-runtime-cost assertion helper.
   *
   * @template Tr - The transformation declaration.
   * @returns A function that reverts the transformation, stripping phantom metadata.
   */
  export const revertTransformation = _revertTransformation;

  /** --------------------------------------
   * Phantom object manipulators
   * --------------------------------------- */

  /** Get phantom metadata object from a type */
  export type PhantomOf<T> = PhantomCore.PhantomOf<T>;
  /** Stip phantom metadata object from a type */
  export type StripPhantom<T> = PhantomCore.StripPhantom<T>;
  /** run-time helper for 'StringPhantom', used for debugging mainly */
  export const stripPhantom = PhantomCore.stripPhantom;

  /** --------------------------------------
   * Error type
   * --------------------------------------- */

  /** Unique Error type for rules validation in phantom. */
  export type ErrorType<E> = _ErrorType<E>;

  /** --------------------------------------
   * Chain class
   * --------------------------------------- */

  /**
   * A fluent PhantomChain class for chaining Phantom assertors.
   *
   * This provides a better developer experience (DX) by allowing method chaining
   * with `.with(assertor)` instead of nesting function calls or using a variadic chain.
   * Each `.with()` applies the assertor to the current value, updating the type incrementally.
   * Call `.end()` to retrieve the final value.
   *
   * At runtime, assertors are zero-cost casts, so the PhantomChain adds minimal overhead
   * (just object creation and method calls).
   *
   * Example:
   * ```ts
   * const asMyBrand = Phantom.assertors.asBrand<MyBrand>();
   * const asMyTrait = Phantom.assertors.asTrait<MyTrait>();
   * const applyMyTransform = Phantom.assertors.applyTransformation<MyTransform>();
   *
   * const result = new PhantomChain("value")
   *   .with(asMyBrand)
   *   .with(asMyTrait)
   *   .with(applyMyTransform)
   *   .end();
   * ```
   */
  export class PhantomChain<T> extends _PhantomChain<T> {}
}
