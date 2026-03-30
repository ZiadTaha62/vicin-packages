import {
  register,
  type sigil,
  type ExtendSigil,
  type SigilOptions,
  Result,
  Status,
} from '../utils';
import { DddCore } from '../ddd-core';

/**
 * Marks a class as a Domain service.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function DomainService<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!DomainServiceBase.isInstance(target.prototype)) {
      throw new Error("[DDD-core Error] 'Service' decorator can only be used on domain services");
    }

    register(target as any, 'Service', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as a Domain exception.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function domainService<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!DomainServiceBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'service' function can only be used on domain services");
  }

  register(clazz as any, 'Service', label, { ...opts, isDomainObject: false });
}

@DomainService('@vicin/ddd-core.DomainServiceBase')
export abstract class DomainServiceBase extends DddCore {
  declare [sigil]: ExtendSigil<'DomainServiceBase', DddCore>;

  get [Symbol.toStringTag]() {
    return 'DomainService';
  }

  // Convenient helpers
  protected readonly Result = Result;
  protected ok = Result.ok;
  protected err = Result.err;
  protected readonly Status = Status;
  protected success = Status.success;
  protected failure = Status.failure;
}
