import { register, type sigil, type ExtendSigil, type SigilOptions } from '../utils';
import { DddCoreError } from '../ddd-core';

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
export function Exception<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!DomainException.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'Exception' decorator can only be used on domain exceptions"
      );
    }

    register(target as any, 'Exception', label, { ...opts, isDomainObject: false });
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
export function exception<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!DomainException.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'exception' function can only be used on domain exceptions");
  }

  register(clazz as any, 'Exception', label, { ...opts, isDomainObject: true });
}

@Exception('@vicin/ddd-core.DomainException')
export class DomainException<Type extends string> extends DddCoreError {
  declare [sigil]: ExtendSigil<'DomainException', DddCoreError>;

  get [Symbol.toStringTag]() {
    return 'DomainException';
  }

  readonly type: Type;

  constructor(type: Type, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.type = type;
  }
}

@Exception('@vicin/ddd-core.ValidationDomainException')
export class ValidationDomainException extends DomainException<'Validation'> {
  declare [sigil]: ExtendSigil<'ValidationDomainException', DomainException<any>>;

  constructor(message?: string, options?: ErrorOptions) {
    super('Validation', message, options);
  }
}

@Exception('@vicin/ddd-core.InvariantDomainException')
export class InvariantDomainException extends DomainException<'Invariant'> {
  declare [sigil]: ExtendSigil<'InvariantDomainException', DomainException<any>>;

  constructor(message?: string, options?: ErrorOptions) {
    super('Invariant', message, options);
  }
}
