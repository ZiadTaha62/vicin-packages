export {
  ValueObjectBase,
  EntityBase,
  AggregateRootBase,
  DomainCollectionBase,
  DomainMap,
  MutableDomainMap,
  DomainSet,
  MutableDomainSet,
  DomainEventBase,
  SpecificationBase,
  PredicateSpecification,
  AndSpecification,
  OrSpecification,
  NotSpecification,
  spec,
  invariant,
  ensure,
} from './core';

export {
  ValueObject,
  valueObject,
  Entity,
  entity,
  AggregateRoot,
  aggregateRoot,
  Collection,
  collection,
  Event,
  event,
} from './markers';

export {
  // sigil
  updateSigilOptions,
  type sigil,
  type ExtendSigil,
  SIGIL_RECOMMENDED_LABEL_REGEX,
  Sigil,

  // serialize
  serializer,
  stringify,

  // clone
  clone,
  registerConstructorHandler,

  // deep freeze
  deepFreeze,

  // outcome
  Result,
  ResultAsync,
  Status,

  // equal
  isEqual,
} from './external';
