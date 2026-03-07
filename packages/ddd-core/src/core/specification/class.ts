// import { type GetInstance, withSigilTyped } from '@vicin/sigil';
// import { DomainObject } from '../base';
// import type {
//   AndSpecificationJson,
//   NotSpecificationJson,
//   OrSpecificationJson,
//   PredicateSpecificationJson,
//   SpecificationInstance,
//   SpecificationJson,
//   SpecificationType,
// } from './types';

// /** ------------------------------
//  *  Base
//  * ------------------------------ */

// abstract class _Specification<T> extends DomainObject implements SpecificationInstance<T> {
//   override get [Symbol.toStringTag]() {
//     return 'DomainSpecification';
//   }

//   static override readonly domainType: 'Specification' = 'Specification';
//   override readonly domainType: 'Specification' = 'Specification';

//   abstract type: SpecificationType;

//   abstract isSatisfiedBy(candidate: T): boolean;

//   and(other: Specification<T>): AndSpecification<T> {
//     return new AndSpecification(this as unknown as Specification<T>, other);
//   }

//   or(other: Specification<T>): OrSpecification<T> {
//     return new OrSpecification(this as unknown as Specification<T>, other);
//   }

//   not(): NotSpecification<T> {
//     return new NotSpecification(this as unknown as Specification<T>);
//   }

//   abstract override toJSON(): SpecificationJson;

//   toString(): string {
//     return JSON.stringify(this.toJSON());
//   }
// }

// export const Specification = withSigilTyped(_Specification, '@vicin/ddd-core.Specification');
// export type Specification<T> = GetInstance<typeof Specification<T>>;

// /** ------------------------------
//  *  Predicate
//  * ------------------------------ */

// class _PredicateSpecification<T> extends Specification<T> {
//   override type: 'Predicate' = 'Predicate';

//   constructor(
//     private readonly predicate: (candidate: T) => boolean,
//     private readonly name: string
//   ) {
//     super();
//   }

//   isSatisfiedBy(candidate: T): boolean {
//     return this.predicate(candidate);
//   }

//   toJSON(): PredicateSpecificationJson {
//     return { type: this.type, name: this.name };
//   }
// }

// export const PredicateSpecification = withSigilTyped(_PredicateSpecification, '@vicin/ddd-core.PredicateSpecification');
// export type PredicateSpecification<T> = GetInstance<typeof PredicateSpecification<T>>;

// /** ------------------------------
//  *  And
//  * ------------------------------ */

// class _AndSpecification<T> extends Specification<T> {
//   override type: 'And' = 'And';

//   constructor(
//     private readonly leftSpec: Specification<T>,
//     private readonly rightSpec: Specification<T>
//   ) {
//     super();
//   }

//   isSatisfiedBy(candidate: T): boolean {
//     return this.leftSpec.isSatisfiedBy(candidate) && this.rightSpec.isSatisfiedBy(candidate);
//   }

//   toJSON(): AndSpecificationJson {
//     return { type: this.type, leftSpec: this.leftSpec.toJSON(), rightSpec: this.rightSpec.toJSON() };
//   }
// }

// export const AndSpecification = withSigilTyped(_AndSpecification, '@vicin/ddd-core.AndSpecification');
// export type AndSpecification<T> = GetInstance<typeof AndSpecification<T>>;

// /** ------------------------------
//  *  Or
//  * ------------------------------ */

// class _OrSpecification<T> extends Specification<T> {
//   override type: 'Or' = 'Or';

//   constructor(
//     private readonly leftSpec: Specification<T>,
//     private readonly rightSpec: Specification<T>
//   ) {
//     super();
//   }

//   isSatisfiedBy(candidate: T): boolean {
//     return this.leftSpec.isSatisfiedBy(candidate) || this.rightSpec.isSatisfiedBy(candidate);
//   }

//   toJSON(): OrSpecificationJson {
//     return { type: this.type, leftSpec: this.leftSpec.toJSON(), rightSpec: this.rightSpec.toJSON() };
//   }
// }

// export const OrSpecification = withSigilTyped(_OrSpecification, '@vicin/ddd-core.OrSpecification');
// export type OrSpecification<T> = GetInstance<typeof OrSpecification<T>>;

// /** ------------------------------
//  *  Not
//  * ------------------------------ */

// class _NotSpecification<T> extends Specification<T> {
//   override type: 'Not' = 'Not';

//   constructor(private readonly spec: Specification<T>) {
//     super();
//   }

//   isSatisfiedBy(candidate: T): boolean {
//     return !this.spec.isSatisfiedBy(candidate);
//   }

//   toJSON(): NotSpecificationJson {
//     return { type: this.type, spec: this.spec.toJSON() };
//   }
// }

// export const NotSpecification = withSigilTyped(_NotSpecification, '@vicin/ddd-core.NotSpecification');
// export type NotSpecification<T> = GetInstance<typeof NotSpecification<T>>;
