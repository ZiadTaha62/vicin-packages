// import { AggregateRoot } from '../../aggregate-root';
// import { Entity } from '../../entity';
// import { IdValueObject, ValueObject } from '../../value-object';
// import { InvariantError } from '../../../error';

// export type DomainMapKey = IdValueObject<any>;
// export type DomainMapValue = ValueObject<any, any> | Entity<any> | AggregateRoot<any>;

// export const duplicateIdErr = (id: string, label: string): InvariantError =>
//   new InvariantError(
//     'DuplicateMapId',
//     `Duplicate key with id '${id}' detected while constructing DomainMap with label '${label}', A DomainMap cannot contain multiple key objects with the same identity`
//   );
