import { DddCore } from '../ddd-core';
import type { DomainEventBase } from '../domain';
import { register, type sigil, type ExtendSigil, type SigilOptions } from '../utils';

/**
 * Marks a class as an Application outbox.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Outbox<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!OutboxBase.isInstance(target.prototype)) {
      throw new Error("[DDD-core Error] 'Outbox' decorator can only be used on application outbox");
    }

    register(target as any, 'Outbox', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as an Application outbox.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function outbox<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!OutboxBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'outbox' function can only be used on application outbox");
  }

  register(clazz as any, 'Outbox', label, { ...opts, isDomainObject: false });
}

@Outbox('@vicin/ddd-core.OutboxBase')
export abstract class OutboxBase extends DddCore {
  declare [sigil]: ExtendSigil<'OutboxBase', DddCore>;

  get [Symbol.toStringTag]() {
    return 'ApplicationOutbox';
  }

  abstract save(events: DomainEventBase[]): Promise<void>;
  abstract getUnprocessed(): Promise<DomainEventBase[]>;
  abstract markAsProcessed(events: DomainEventBase[]): Promise<void>;
}
