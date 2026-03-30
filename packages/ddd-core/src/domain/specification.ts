import { register, type sigil, type ExtendSigil, type SigilOptions, stringify } from '../utils';
import { DddCore } from '../ddd-core';

/**
 * Marks a class as a Domain specification.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Specification<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!SpecificationBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'Specification' decorator can only be used on domain specifications"
      );
    }

    register(target as any, 'Specification', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as a Domain specification.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function specification<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!SpecificationBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'Specification' function can only be used on domain specifications"
    );
  }

  register(clazz as any, 'Specification', label, { ...opts, isDomainObject: false });
}

/** ------------------------------
 *  Base
 * ------------------------------ */

/**
 * Base class for domain specifications
 *
 * Specifications encapsulate business rules and can be:
 * - evaluated via `isSatisfiedBy`
 * - composed using logical operators (`and`, `or`, `not`)
 *
 * @template T - Type of candidate being evaluated
 * @template Type - Discriminator of specification type
 */
@Specification('@vicin/ddd-core.SpecificationBase')
export abstract class SpecificationBase<T, Type extends string = string> extends DddCore {
  declare [sigil]: ExtendSigil<'SpecificationBase', DddCore>;

  get [Symbol.toStringTag]() {
    return 'DomainSpecification';
  }

  static type: string;
  get type(): Type {
    return (this.constructor as typeof SpecificationBase).type as Type;
  }

  /**
   * Evaluates whether the given candidate satisfies this specification
   *
   * @param candidate - Value to evaluate
   * @returns True if the specification is satisfied
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * Combines this specification with another using logical AND
   *
   * @param other - Specification to combine with
   * @returns A new AndSpecification
   */
  and(other: SpecificationBase<T>): AndSpecification<T> {
    return new AndSpecification(this as unknown as SpecificationBase<T>, other);
  }

  /**
   * Combines this specification with another using logical OR
   *
   * @param other - Specification to combine with
   * @returns A new OrSpecification
   */
  or(other: SpecificationBase<T>): OrSpecification<T> {
    return new OrSpecification(this as unknown as SpecificationBase<T>, other);
  }

  /**
   * Negates this specification
   *
   * @returns A new NotSpecification
   */
  not(): NotSpecification<T> {
    return new NotSpecification(this as unknown as SpecificationBase<T>);
  }

  /**
   * Serializes the specification into a JSON-compatible structure
   */
  abstract toJSON(): SpecificationJson;

  /**
   * Serializes the specification into a string
   */
  override toString(): string {
    return stringify(this.toJSON());
  }
}

/** ------------------------------
 *  Predicate
 * ------------------------------ */

/**
 * Specification based on a predicate function
 *
 * Useful for defining simple, inline business rules
 *
 * @template T - Type of candidate being evaluated
 */
@Specification('@vicin/ddd-core.PredicateSpecification')
export class PredicateSpecification<T> extends SpecificationBase<T, 'Predicate'> {
  declare [sigil]: ExtendSigil<'PredicateSpecification', SpecificationBase<any, any>>;

  static override type: 'Predicate' = 'Predicate';

  /**
   * @param predicate - Function used to evaluate the candidate
   * @param name - Human-readable name for debugging/serialization
   */
  constructor(
    private readonly predicate: (candidate: T) => boolean,
    private readonly name: string
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.predicate(candidate);
  }

  toJSON(): PredicateSpecificationJson {
    return { type: this.type, name: this.name };
  }
}

/** ------------------------------
 *  And
 * ------------------------------ */

/**
 * Composite specification that requires both specifications to be satisfied
 *
 * @template T - Type of candidate being evaluated
 */
@Specification('@vicin/ddd-core.AndSpecification')
export class AndSpecification<T> extends SpecificationBase<T, 'And'> {
  declare [sigil]: ExtendSigil<'AndSpecification', SpecificationBase<any, any>>;

  static override type: 'And' = 'And';

  constructor(
    private readonly leftSpec: SpecificationBase<T>,
    private readonly rightSpec: SpecificationBase<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.leftSpec.isSatisfiedBy(candidate) && this.rightSpec.isSatisfiedBy(candidate);
  }

  toJSON(): AndSpecificationJson {
    return {
      type: this.type,
      leftSpec: this.leftSpec.toJSON(),
      rightSpec: this.rightSpec.toJSON(),
    };
  }
}

/** ------------------------------
 *  Or
 * ------------------------------ */

/**
 * Composite specification that requires at least one specification to be satisfied
 *
 * @template T - Type of candidate being evaluated
 */
@Specification('@vicin/ddd-core.OrSpecification')
export class OrSpecification<T> extends SpecificationBase<T, 'Or'> {
  declare [sigil]: ExtendSigil<'OrSpecification', SpecificationBase<any, any>>;

  static override type: 'Or' = 'Or';

  constructor(
    private readonly leftSpec: SpecificationBase<T>,
    private readonly rightSpec: SpecificationBase<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.leftSpec.isSatisfiedBy(candidate) || this.rightSpec.isSatisfiedBy(candidate);
  }

  toJSON(): OrSpecificationJson {
    return {
      type: this.type,
      leftSpec: this.leftSpec.toJSON(),
      rightSpec: this.rightSpec.toJSON(),
    };
  }
}

/** ------------------------------
 *  Not
 * ------------------------------ */

/**
 * Negated specification that inverts the result of another specification
 *
 * @template T - Type of candidate being evaluated
 */
@Specification('@vicin/ddd-core.NotSpecification')
export class NotSpecification<T> extends SpecificationBase<T, 'Not'> {
  declare [sigil]: ExtendSigil<'NotSpecification', SpecificationBase<any, any>>;

  static override type: 'Not' = 'Not';

  constructor(private readonly spec: SpecificationBase<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }

  toJSON(): NotSpecificationJson {
    return { type: this.type, spec: this.spec.toJSON() };
  }
}

/** ------------------------------
 *  AllOf (logical AND of many specifications)
 * ------------------------------ */

@Specification('@vicin/ddd-core.AllOfSpecification')
export class AllOfSpecification<T> extends SpecificationBase<T, 'AllOf'> {
  declare [sigil]: ExtendSigil<'AllOfSpecification', SpecificationBase<any, any>>;

  static override type: 'AllOf' = 'AllOf';

  constructor(private readonly specs: SpecificationBase<T>[]) {
    super();
    if (specs.length === 0) {
      throw new Error('[DDD-core Error] AllOfSpecification must have at least one specification');
    }
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.specs.every((spec) => spec.isSatisfiedBy(candidate));
  }

  toJSON(): AllOfSpecificationJson {
    return {
      type: this.type,
      specs: this.specs.map((s) => s.toJSON()),
    };
  }
}

/** ------------------------------
 *  AnyOf (logical OR of many specifications)
 * ------------------------------ */

@Specification('@vicin/ddd-core.AnyOfSpecification')
export class AnyOfSpecification<T> extends SpecificationBase<T, 'AnyOf'> {
  declare [sigil]: ExtendSigil<'AnyOfSpecification', SpecificationBase<any, any>>;

  static override type: 'AnyOf' = 'AnyOf';

  constructor(private readonly specs: SpecificationBase<T>[]) {
    super();
    if (specs.length === 0) {
      throw new Error('[DDD-core Error] AnyOfSpecification must have at least one specification');
    }
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.specs.some((spec) => spec.isSatisfiedBy(candidate));
  }

  toJSON(): AnyOfSpecificationJson {
    return {
      type: this.type,
      specs: this.specs.map((s) => s.toJSON()),
    };
  }
}

/** ------------------------------
 *  NoneOf (none of the specifications are satisfied)
 * ------------------------------ */

@Specification('@vicin/ddd-core.NoneOfSpecification')
export class NoneOfSpecification<T> extends SpecificationBase<T, 'NoneOf'> {
  declare [sigil]: ExtendSigil<'NoneOfSpecification', SpecificationBase<any, any>>;

  static override type: 'NoneOf' = 'NoneOf';

  constructor(private readonly specs: SpecificationBase<T>[]) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.specs.every((spec) => !spec.isSatisfiedBy(candidate));
  }

  toJSON(): NoneOfSpecificationJson {
    return {
      type: this.type,
      specs: this.specs.map((s) => s.toJSON()),
    };
  }
}

/** ------------------------------
 *  Unless (if condition is false, then the main spec must be satisfied)
 * ------------------------------ */

@Specification('@vicin/ddd-core.UnlessSpecification')
export class UnlessSpecification<T> extends SpecificationBase<T, 'Unless'> {
  declare [sigil]: ExtendSigil<'UnlessSpecification', SpecificationBase<any, any>>;

  static override type: 'Unless' = 'Unless';

  constructor(
    private readonly condition: SpecificationBase<T>,
    private readonly thenSpec: SpecificationBase<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.condition.isSatisfiedBy(candidate) || this.thenSpec.isSatisfiedBy(candidate);
  }

  toJSON(): UnlessSpecificationJson {
    return {
      type: this.type,
      condition: this.condition.toJSON(),
      thenSpec: this.thenSpec.toJSON(),
    };
  }
}

/** ------------------------------
 *  Factory
 * ------------------------------ */

/**
 * Factory function for creating a PredicateSpecification
 *
 * @param predicate - Function used to evaluate candidates
 * @param name - Optional name for debugging/serialization
 * @returns A PredicateSpecification instance
 */
export function spec<T>(
  predicate: (candidate: T) => boolean,
  name = 'PredicateSpecification'
): PredicateSpecification<T> {
  return new PredicateSpecification(predicate, name);
}

export function and<T>(leftSpec: SpecificationBase<T>, rightSpec: SpecificationBase<T>) {
  return new AndSpecification(leftSpec, rightSpec);
}

export function or<T>(leftSpec: SpecificationBase<T>, rightSpec: SpecificationBase<T>) {
  return new OrSpecification(leftSpec, rightSpec);
}

export function not<T>(spec: SpecificationBase<T>) {
  return new NotSpecification(spec);
}

export function allOf<T>(...specs: SpecificationBase<T>[]): AllOfSpecification<T> {
  return new AllOfSpecification(specs);
}

export function anyOf<T>(...specs: SpecificationBase<T>[]): AnyOfSpecification<T> {
  return new AnyOfSpecification(specs);
}

export function noneOf<T>(...specs: SpecificationBase<T>[]): NoneOfSpecification<T> {
  return new NoneOfSpecification(specs);
}

export function unless<T>(
  condition: SpecificationBase<T>,
  thenSpec: SpecificationBase<T>
): UnlessSpecification<T> {
  return new UnlessSpecification(condition, thenSpec);
}

/** ------------------------------
 *  Json types
 * ------------------------------ */

type PredicateSpecificationJson = {
  type: 'Predicate';
  name: string;
};

type AndSpecificationJson = {
  type: 'And';
  leftSpec: SpecificationJson;
  rightSpec: SpecificationJson;
};

type OrSpecificationJson = {
  type: 'Or';
  leftSpec: SpecificationJson;
  rightSpec: SpecificationJson;
};

type NotSpecificationJson = {
  type: 'Not';
  spec: SpecificationJson;
};

type AllOfSpecificationJson = {
  type: 'AllOf';
  specs: SpecificationJson[];
};

type AnyOfSpecificationJson = {
  type: 'AnyOf';
  specs: SpecificationJson[];
};

type NoneOfSpecificationJson = {
  type: 'NoneOf';
  specs: SpecificationJson[];
};

type UnlessSpecificationJson = {
  type: 'Unless';
  condition: SpecificationJson;
  thenSpec: SpecificationJson;
};

export type SpecificationJson =
  | PredicateSpecificationJson
  | AndSpecificationJson
  | OrSpecificationJson
  | NotSpecificationJson
  | AllOfSpecificationJson
  | AnyOfSpecificationJson
  | NoneOfSpecificationJson
  | UnlessSpecificationJson;
