import { SpecificationBase } from './specification';
import {
  register,
  type sigil,
  type ExtendSigil,
  type SigilOptions,
  Result,
  Status,
} from '../utils';
import { DomainServiceBase } from './service';
import { DomainException } from './exception';

/**
 * Marks a class as a Domain policy.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Policy<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!PolicyBase.isInstance(target.prototype)) {
      throw new Error("[DDD-core Error] 'Policy' decorator can only be used on domain policies");
    }

    register(target as any, 'Policy', label, { ...opts, isDomainObject: false });
  };
}

/**
 * Marks a class as a Domain policy.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function policy<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!PolicyBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'policy' function can only be used on domain policies");
  }

  register(clazz as any, 'Policy', label, { ...opts, isDomainObject: false });
}

@Policy('@vicin/ddd-core.PolicyBase')
export abstract class PolicyBase extends DomainServiceBase {
  declare [sigil]: ExtendSigil<'PolicyBase', DomainServiceBase>;

  override get [Symbol.toStringTag]() {
    return 'DomainPolicy';
  }

  /** Enforce a policy and return Result (recommended pattern) */
  abstract enforce(
    ...args: any[]
  ): Result<void, DomainException<any>> | Status<void, DomainException<any>>;

  /** Quick boolean check (convenience) */
  protected isSatisfiedBy<T>(spec: SpecificationBase<T>, candidate: T): boolean {
    return spec.isSatisfiedBy(candidate);
  }
}
