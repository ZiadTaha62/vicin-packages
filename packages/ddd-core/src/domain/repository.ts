import {
  AggregateRootBase,
  MutableDomainMap,
  DomainList,
  IdentityValueObjectBase,
} from './domain-objects';
import { register, type sigil, type ExtendSigil, type SigilOptions } from '../utils';
import { DddCore } from '../ddd-core';

/**
 * Marks a class as a Domain repository.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Repository<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!RepositoryBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'Repository' decorator can only be used on domain repositories"
      );
    }

    register(target as any, 'Repository', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as a Domain repository.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function repository<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!RepositoryBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'repository' function can only be used on domain repositories"
    );
  }

  register(clazz as any, 'Repository', label, { ...opts, isDomainObject: false });
}

@Repository('@vicin/ddd-core.RepositoryBase')
export abstract class RepositoryBase<T extends AggregateRootBase<any>> extends DddCore {
  declare [sigil]: ExtendSigil<'RepositoryBase', DddCore>;

  get [Symbol.toStringTag]() {
    return 'DomainRepository';
  }

  abstract getById(id: IdentityValueObjectBase): Promise<T | null>;
  abstract save(aggregate: T): Promise<void>;
  abstract delete(id: IdentityValueObjectBase): Promise<void>;
  abstract exists(id: IdentityValueObjectBase): Promise<boolean>;
  abstract getAll(): Promise<DomainList<T>>;
}

/** In-memory repository for tests */
@Repository('@vicin/ddd-core.InMemoryRepository')
export class InMemoryRepository<T extends AggregateRootBase<any>> extends RepositoryBase<T> {
  declare [sigil]: ExtendSigil<'InMemoryRepository', RepositoryBase<any>>;

  protected items = new MutableDomainMap<IdentityValueObjectBase, T>();

  constructor(initialData: T[] = []) {
    super();
    for (const item of initialData) {
      this.items.set(item.getId(), item);
    }
  }

  async getById(id: IdentityValueObjectBase): Promise<T | null> {
    return this.items.get(id) ?? null;
  }

  async save(aggregate: T): Promise<void> {
    this.items.set(aggregate.getId(), aggregate);
  }

  async delete(id: IdentityValueObjectBase): Promise<void> {
    this.items.delete(id);
  }

  async exists(id: IdentityValueObjectBase): Promise<boolean> {
    return this.items.has(id);
  }

  async getAll(): Promise<DomainList<T>> {
    return DomainList.from(this.items.values());
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}
