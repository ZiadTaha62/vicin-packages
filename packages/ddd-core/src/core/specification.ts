import { stringify } from '../external';

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
export abstract class SpecificationBase<T, Type extends SpecificationType = SpecificationType> {
  get [Symbol.toStringTag]() {
    return 'DomainSpecification';
  }

  static type: SpecificationType;
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
  toString(): string {
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
export class PredicateSpecification<T> extends SpecificationBase<T, 'Predicate'> {
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
export class AndSpecification<T> extends SpecificationBase<T, 'And'> {
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
export class OrSpecification<T> extends SpecificationBase<T, 'Or'> {
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
export class NotSpecification<T> extends SpecificationBase<T, 'Not'> {
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

/** ------------------------------
 *  Json types
 * ------------------------------ */

export type SpecificationType = 'Predicate' | 'And' | 'Or' | 'Not';

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

export type SpecificationJson =
  | PredicateSpecificationJson
  | AndSpecificationJson
  | OrSpecificationJson
  | NotSpecificationJson;
