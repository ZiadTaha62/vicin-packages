import { AttachSigil, type SigilOptions } from '@vicin/sigil';
import {
  ValueObjectBase,
  EntityBase,
  AggregateRootBase,
  DomainEventBase,
  SpecificationBase,
  DomainCollectionBase,
} from '../core';
import { register } from '../registry';

/**
 * Marks a class as a Value Object.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function ValueObject<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!ValueObjectBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'ValueObject' decorator can only be used on domain value objects"
      );
    }

    AttachSigil(label, opts)(target as any, context);
    register(target as any, 'ValueObject', true);
  };
}

/**
 * Marks a class as an Entity.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Entity<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!EntityBase.isInstance(target.prototype)) {
      throw new Error("[DDD-core Error] 'Entity' decorator can only be used on domain entities");
    }

    AttachSigil(label, opts)(target as any, context);
    register(target as any, 'Entity', true);
  };
}

/**
 * Marks a class as an Aggeregate root.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function AggregateRoot<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!AggregateRootBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'AggregateRoot' decorator can only be used on domain aggregate roots"
      );
    }

    AttachSigil(label, opts)(target as any, context);
    register(target as any, 'AggregateRoot', true);
  };
}

/**
 * Marks a class as a Domain event.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Event<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!DomainEventBase.isInstance(target.prototype) || target.type !== 'Event') {
      throw new Error("[DDD-core Error] 'Event' decorator can only be used on domain events");
    }

    AttachSigil(label, opts)(target, context);
    register(target as any, 'Event', true);
  };
}

/**
 * Marks a class as a Domain collection.
 *
 * Attaches a sigil label, register class for cloning and serialization
 * and registers the class in the DDD registry.
 *
 * @param clazz - Class constructor
 * @param label - Unique identifier label
 * @param opts - Optional sigil configuration
 */
export function Collection<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: any, context: any) {
    if (!DomainCollectionBase.isInstance(target.prototype)) {
      throw new Error(
        "[DDD-core Error] 'Collection' decorator can only be used on domain collections"
      );
    }

    AttachSigil(label, opts)(target, context);
    register(target as any, 'Collection', true);
  };
}
