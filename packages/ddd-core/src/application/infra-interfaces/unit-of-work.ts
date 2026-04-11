import type { AggregateRootBase, RepositoryI } from '../../domain';

export interface UnitOfWorkI {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getRepository<T extends AggregateRootBase<any>>(token: symbol | string): RepositoryI<T>;
  run<T>(work: (uow: UnitOfWorkI) => Promise<T>): Promise<T>;
}
