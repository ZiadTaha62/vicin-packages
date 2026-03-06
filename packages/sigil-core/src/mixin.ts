import { isSigilCtor } from './is';
import { sigilify, hasOwnSigil } from './sigilify';
import type { SigilOptions } from './options';
import { __LABEL__, __SIGIL__, __SIGIL_LINEAGE__, __DEPTH__ } from './symbols';
import type { Constructor, ConstructorAbstract, GetPrototype, sigil, ExtendSigil } from './types';

/**
 * Helper function to extend Base class with Sigil Class that should be present at the start of each Sigil chain
 * @param Base - The base constructor to extend.
 * @returns Base Sigil class at the start of each Sigil chain
 */
export function BaseSigilify(Base: ConstructorAbstract) {
  class Sigil extends Base {
    /**
     * Class-level identity label constant for this sigil constructor.
     */
    static get SigilLabel(): string {
      return (this as any).prototype[__LABEL__];
    }

    /**
     * Copy of the sigil label lineage for this instance's constructor.
     *
     * Useful for debugging and logging.
     *
     * @returns An array of sigil labels representing parent → child labels.
     */
    static get SigilLabelLineage(): readonly string[] {
      return (this as any).prototype[__SIGIL_LINEAGE__].map((v: symbol) => v.description);
    }

    /** Check if sigil label has been attached to this class */
    static get hasOwnSigil(): boolean {
      return hasOwnSigil(this);
    }

    /**
     * Compile-time nominal brand that encodes the class sigil labels object.
     */
    declare readonly [sigil]: {
      Sigil: true;
    };

    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Check whether `other` is (or inherits from) the instance represented by the
     * calling constructor.
     *
     * This replaces `instanceof` so that checks remain valid across bundles/realms
     * and when subclassing.
     *
     * @typeParam T - The specific sigil constructor (`this`).
     * @param this - The constructor performing the type check.
     * @param other - The object to test.
     * @returns A type guard asserting `other` is an instance of the constructor.
     */
    static isInstance<T>(this: T, other: any): other is GetPrototype<T> {
      if (other == null || typeof other !== 'object') return false;
      return other[(this as any).prototype[__SIGIL__]] === true;
    }

    /**
     * Check whether `other` is exactly the same instance represented by the
     * calling constructor.
     *
     * @typeParam T - The specific sigil constructor (`this`).
     * @param this - The constructor performing the type check.
     * @param other - The object to test.
     * @returns A type guard asserting `other` is an instance of the constructor.
     */
    static isExactInstance<T>(this: T, other: any): other is GetPrototype<T> {
      if (other == null || typeof other !== 'object') return false;
      if ((this as any).prototype[__DEPTH__] !== other[__DEPTH__]) return false;
      return other[(this as any).prototype[__SIGIL__]] === true;
    }

    /**
     * Check whether `other` is (or inherits from) the instance represented by the
     * calling constructor.
     *
     * This replaces `instanceof` so that checks remain valid across bundles/realms
     * and when subclassing.
     *
     * @typeParam T - The specific sigil constructor (`this`).
     * @param this - The constructor performing the type check.
     * @param other - The object to test.
     * @returns A type guard asserting `other` is an instance of the constructor.
     */
    isInstance<T>(this: T, other: any): other is T {
      if (other == null || typeof other !== 'object') return false;
      return other[(this as any)[__SIGIL__]] === true;
    }

    /**
     * Check whether `other` is exactly the same instance represented by the
     * calling constructor.
     *
     * @typeParam T - The specific sigil constructor (`this`).
     * @param this - The constructor performing the type check.
     * @param other - The object to test.
     * @returns A type guard asserting `other` is an instance of the constructor.
     */
    isExactInstance<T>(this: T, other: any): other is T {
      if (other == null || typeof other !== 'object') return false;
      if ((this as any)[__DEPTH__] !== (other as any)[__DEPTH__]) return false;
      return other[(this as any)[__SIGIL__]] === true;
    }

    /**
     * Returns the identity sigil label of this instance's constructor.
     *
     * @returns The label string if passed (e.g. '@scope/pkg.ClassName'), random label if not passed (e.g. '@Sigil-auto:ClassName:1:pnf11bgl').
     */
    get SigilLabel(): string {
      return (this as any)[__LABEL__];
    }

    /**
     * Copy of the sigil label lineage for this instance's constructor.
     *
     * Useful for debugging and logging.
     *
     * @returns An array of sigil labels representing parent → child labels.
     */
    get SigilLabelLineage(): readonly string[] {
      return (this as any)[__SIGIL_LINEAGE__].map((v: symbol) => v.description);
    }

    /** Check if sigil label has been attached to this class */
    get hasOwnSigil(): boolean {
      return (this.constructor as unknown as Sigil).hasOwnSigil;
    }
  }

  sigilify(Sigil, 'Sigil');
  return Sigil;
}

/**
 * Mixin factory that augments an existing class with Sigil runtime metadata and helpers.
 *
 * @param Base - The base constructor to extend.
 * @param label - Identity label to attach to the resulting class (e.g. '@scope/pkg.ClassName').
 * @param opts - Options object to override any global options if needed.
 * @returns A new constructor that extends `Base` and includes Sigil statics/instance methods.
 * @throws Error if `Base` is already sigilified.
 */
export function Sigilify<L extends string>(Base: Constructor, label: L, opts?: SigilOptions) {
  if (isSigilCtor(Base))
    throw new Error(
      `[Sigil Error] Class '${Base.name}' with label '${Base.SigilLabel}' is already sigilified`
    );

  const BaseSigil = BaseSigilify(Base);
  class Sigilified extends BaseSigil {
    declare [sigil]: ExtendSigil<L, InstanceType<typeof BaseSigil>>;
  }

  sigilify(Sigilified, label, opts);
  return Sigilified;
}

/**
 * Mixin factory that augments an existing class with Sigil runtime metadata and helpers. Accept and return 'abstract' class.
 *
 * @param Base - The base constructor to extend.
 * @param label - Identity label to attach to the resulting class (e.g. '@scope/pkg.ClassName').
 * @param opts - Options object to override any global options if needed.
 * @returns A new abstract constructor that extends `Base` and includes Sigil statics/instance methods.
 * @throws Error if `Base` is already sigilified.
 */
export function SigilifyAbstract<L extends string>(
  Base: ConstructorAbstract,
  label: L,
  opts?: SigilOptions
) {
  if (isSigilCtor(Base))
    throw new Error(
      `[Sigil Error] Class '${Base.name}' with label '${Base.SigilLabel}' is already sigilified`
    );

  const BaseSigil = BaseSigilify(Base);
  abstract class Sigilified extends BaseSigil {
    declare [sigil]: ExtendSigil<L, InstanceType<typeof BaseSigil>>;
  }

  sigilify(Sigilified, label, opts);
  return Sigilified;
}
