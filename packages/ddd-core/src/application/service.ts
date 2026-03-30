import { DddCore } from '../ddd-core';
import { DomainList, AggregateRootBase } from '../domain';
import { type EventPublisherBase } from './event-publisher';
import { register, type sigil, type ExtendSigil, type SigilOptions } from '../utils';

/**
 * Marks a class as an Application serive.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function ApplicationService<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!ApplicationServiceBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'ApplicationService' decorator can only be used on application serives"
      );
    }

    register(target as any, 'ApplicationService', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as an Application serive.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function applicationService<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!ApplicationServiceBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'applicationService' function can only be used on application serives"
    );
  }

  register(clazz as any, 'ApplicationService', label, { ...opts, isDomainObject: false });
}

@ApplicationService('@vicin/ddd-core.ApplicationServiceBase')
export abstract class ApplicationServiceBase extends DddCore {
  declare [sigil]: ExtendSigil<'ApplicationServiceBase', DddCore>;

  get [Symbol.toStringTag]() {
    return 'ApplicationService';
  }

  constructor(protected readonly publisher: EventPublisherBase) {
    super();
  }

  protected async publishEvents(events: DomainList<any> | any[]): Promise<void> {
    if (events instanceof DomainList) {
      await this.publisher.publishAll(events.unwrap());
    } else {
      await this.publisher.publishAll(events);
    }
  }

  // Helper to commit changes + publish events in one go
  protected async commit(aggregate: AggregateRootBase<any>): Promise<void> {
    const events = aggregate.pullEvents();
    await this.publishEvents(events);
  }
}
