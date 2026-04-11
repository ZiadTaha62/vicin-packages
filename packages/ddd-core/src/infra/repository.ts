import {
  MarkObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
} from '../utils';
import {
  type RepositoryI,
  AggregateRootBase,
  IdentityValueObjectBase,
  DomainList,
  MutableDomainMap,
} from '../domain';

const MarkObject = MarkObjectFactory('Repository');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.RepositoryBase')
export abstract class RepositoryBase<T extends AggregateRootBase<any>>
  extends MarkObject
  implements RepositoryI<T>
{
  declare [sigil]: ExtendSigil<'RepositoryBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainRepository';
  }

  abstract getById(id: IdentityValueObjectBase): Promise<T | null>;
  abstract save(aggregate: T): Promise<void>;
  abstract delete(id: IdentityValueObjectBase): Promise<void>;
  abstract exists(id: IdentityValueObjectBase): Promise<boolean>;
  abstract getAll(): Promise<DomainList<T>>;
}

export const Repository = MarkFactory(RepositoryBase);
export const repository = markFactory(RepositoryBase);

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
