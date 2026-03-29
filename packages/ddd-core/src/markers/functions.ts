import { attachSigil, type SigilOptions } from '@vicin/sigil';
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
export function valueObject<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!ValueObjectBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'valueObject' function can only be used on domain value objects"
    );
  }

  attachSigil(clazz, label, opts);
  register(clazz as any, 'ValueObject', true);
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
export function entity<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!EntityBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'entity' function can only be used on domain entities");
  }

  attachSigil(clazz, label, opts);
  register(clazz as any, 'Entity', true);
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
export function aggregateRoot<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!AggregateRootBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'aggregateRoot' function can only be used on domain aggregate roots"
    );
  }

  attachSigil(clazz, label, opts);
  register(clazz as any, 'AggregateRoot', true);
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
export function event<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!DomainEventBase.isInstance(clazz.prototype)) {
    throw new Error("[DDD-core Error] 'domainEvent' function can only be used on domain events");
  }

  attachSigil(clazz, label, opts);
  register(clazz as any, 'Event', true);
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
export function collection<L extends string>(clazz: any, label: L, opts?: SigilOptions) {
  if (!DomainCollectionBase.isInstance(clazz.prototype)) {
    throw new Error(
      "[DDD-core Error] 'collection' function can only be used on domain collections"
    );
  }

  attachSigil(clazz, label, opts);
  register(clazz as any, 'Collection', true);
}
