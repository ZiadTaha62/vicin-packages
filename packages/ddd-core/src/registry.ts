import { serializer, registerCloneableClass } from './external';

interface Registry {
  set(clazz: any, type: string): void;
  get(clazz: any): string | undefined;
  has(clazz: any): boolean;
  hasDomainObject(clazz: any): boolean;
  addDomainObject(clazz: any): void;
}

const DDD_CORE_REGISTRY_SYMBOL = Symbol.for('@vicin/ddd-core.DDD_CORE_REGISTRY_SYMBOL');

function getRegistry(): Registry {
  if ((globalThis as any)[DDD_CORE_REGISTRY_SYMBOL])
    return (globalThis as any)[DDD_CORE_REGISTRY_SYMBOL];

  const registryMap: WeakMap<any, string> = new WeakMap();
  const domainObjectSet: WeakSet<any> = new WeakSet();

  const registry: Registry = {
    set: (clazz, type) => registryMap.set(clazz, type),
    get: (clazz) => registryMap.get(clazz),
    has: (clazz) => registryMap.has(clazz),
    hasDomainObject: (clazz) => domainObjectSet.has(clazz),
    addDomainObject: (clazz) => domainObjectSet.add(clazz),
  };

  Object.defineProperty(globalThis, DDD_CORE_REGISTRY_SYMBOL, {
    value: registry,
    writable: false,
    configurable: false,
    enumerable: false,
  });

  return registry;
}

const registry = getRegistry();

/**
 * Registers a class inside the global DDD registry.
 *
 * This is used internally by decorators and marker functions to:
 * - Track domain object types
 * - Enable serialization/deserialization
 * - Enable cloning support
 *
 * @param clazz - The class constructor to register
 * @param type - Logical DDD type (ValueObject, Entity, etc.)
 * @param isDomainObject - Whether this class should be treated as a domain object
 *
 * @throws Error if the class is already registered
 */
export function register(clazz: any, type: string, isDomainObject: boolean) {
  if (registry.has(clazz)) {
    throw new Error(
      `[DDD-core Error] Class ${clazz.name} with label ${clazz.SigilLabel} is already registered`
    );
  }

  if (isDomainObject) {
    serializer.registerClass(clazz, {
      identifier: clazz.SigilLabel,
      custom: {
        serialize: (v: typeof clazz) => v.serialize(),
        deserialize: (v) => clazz.deserialize(v),
        recursive: true,
      },
    });

    registerCloneableClass(clazz);

    registry.addDomainObject(clazz);
  }

  registry.set(clazz, type);
}

/**
 * Checks whether a given object instance belongs to a registered class.
 *
 * @param value - Object instance to check
 * @returns True if the object's constructor is registered
 */
export function isRegistered(value: object): boolean {
  return registry.has(value.constructor);
}

/**
 * Checks whether a given object is a domain object.
 *
 * Domain objects are classes registered with `isDomainObject = true`.
 *
 * @param value - Object instance to check
 * @returns True if the object is a domain object
 */
export function isDomainObject(value: object): boolean {
  return registry.hasDomainObject(value.constructor);
}
