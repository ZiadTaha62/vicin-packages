import type { AggregateRootBase, IdentityValueObjectBase } from './elements';
import type { DomainList } from './collections';

export interface RepositoryI<T extends AggregateRootBase<any>> {
  getById(id: IdentityValueObjectBase): Promise<T | null>;
  save(aggregate: T): Promise<void>;
  delete(id: IdentityValueObjectBase): Promise<void>;
  exists(id: IdentityValueObjectBase): Promise<boolean>;
  getAll(): Promise<DomainList<T>>;
}
