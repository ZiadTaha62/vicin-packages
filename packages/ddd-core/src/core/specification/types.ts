// import type { DomainObjectStatic, DomainObjectInstance } from '../base';
// import type { Specification, AndSpecification, OrSpecification, NotSpecification } from './class';

// /** ------------------------------
//  *  General
//  * ------------------------------ */

// export type SpecificationType = 'Predicate' | 'And' | 'Or' | 'Not';

// /** ------------------------------
//  *  Json
//  * ------------------------------ */

// export type PredicateSpecificationJson = { type: 'Predicate'; name: string };

// export type AndSpecificationJson = {
//   type: 'And';
//   leftSpec: SpecificationJson;
//   rightSpec: SpecificationJson;
// };

// export type OrSpecificationJson = {
//   type: 'Or';
//   leftSpec: SpecificationJson;
//   rightSpec: SpecificationJson;
// };

// export type NotSpecificationJson = { type: 'Not'; spec: SpecificationJson };

// export type SpecificationJson =
//   | PredicateSpecificationJson
//   | AndSpecificationJson
//   | OrSpecificationJson
//   | NotSpecificationJson;

// /** ------------------------------
//  *  Class
//  * ------------------------------ */

// export interface SpecificationStatic extends DomainObjectStatic {
//   readonly domainType: 'Specification';
// }

// export interface SpecificationInstance<T> extends DomainObjectInstance {
//   readonly domainType: 'Specification';

//   readonly type: SpecificationType;

//   isSatisfiedBy(candidate: T): boolean;

//   and(other: Specification<T>): AndSpecification<T>;

//   or(other: Specification<T>): OrSpecification<T>;

//   not(): NotSpecification<T>;

//   toJSON(): SpecificationJson;
// }
