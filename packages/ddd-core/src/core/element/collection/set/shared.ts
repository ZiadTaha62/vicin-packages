import type { AggregateRoot } from '../../aggregate-root';
import type { Entity } from '../../entity';
import { InvariantError } from '../../../error';
import type { IdValueObject } from '../../value-object';

export type DomainSetValue = IdValueObject<any> | Entity<any> | AggregateRoot<any>;

export const duplicateIdErr = (id: string, label: string): InvariantError =>
  new InvariantError(
    'DuplicateSetId',
    `Duplicate value with id '${id}' detected while constructing DomainSet with label '${label}', A DomainSet cannot contain multiple objects with the same identity`
  );
