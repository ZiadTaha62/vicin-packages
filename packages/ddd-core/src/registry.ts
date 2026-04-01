import {
  attachSigil,
  JSONSerializer,
  registerConstructorHandler,
  type ConstructorHandlerConfig,
} from './utils';
import type { StateObject } from './extended-classes';

interface Registry {
  setMarkObject(clazz: any, type: string): void;
  hasMarkObject(clazz: any): boolean;
  getMarkObjectType(clazz: any): string | undefined;
  addStateObject(clazz: any): void;
  hasStateObject(clazz: any): boolean;
  addIdentityObject(clazz: any): void;
  hasIdentityObject(clazz: any): boolean;
}

const DDD_CORE_REGISTRY_SYMBOL = Symbol.for('@vicin/ddd-core.DDD_CORE_REGISTRY_SYMBOL');

function getRegistry(): Registry {
  if ((globalThis as any)[DDD_CORE_REGISTRY_SYMBOL])
    return (globalThis as any)[DDD_CORE_REGISTRY_SYMBOL];

  const markObjectMap = new WeakMap();

  const stateObjectSet = new WeakSet();

  const identityObjectSet = new WeakSet();

  const registry: Registry = {
    setMarkObject(clazz: any, type: string): void {
      markObjectMap.set(clazz, type);
    },

    hasMarkObject(clazz: any): boolean {
      return markObjectMap.has(clazz);
    },

    getMarkObjectType(clazz: any): string | undefined {
      return markObjectMap.get(clazz);
    },

    addStateObject(clazz: any): void {
      stateObjectSet.add(clazz);
    },

    hasStateObject(clazz: any): boolean {
      return stateObjectSet.has(clazz);
    },

    addIdentityObject(clazz: any): void {
      identityObjectSet.add(clazz);
    },

    hasIdentityObject(clazz: any): boolean {
      return identityObjectSet.has(clazz);
    },
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

export type ObjectKind = 'mark' | 'state' | 'identity';

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
export function register(clazz: any, label: string, kind: string, objectKind: ObjectKind) {
  if (registry.hasMarkObject(clazz)) {
    throw new Error(
      `[DDD-core Error] Class ${clazz.name} with label ${clazz.SigilLabel} is already registered`
    );
  }

  registry.setMarkObject(clazz, kind);
  attachSigil(clazz, label);

  // If extra includes state handle state
  if (objectKind === 'state' || objectKind === 'identity') {
    JSONSerializer.registerClass(clazz, {
      identifier: clazz.SigilLabel,
      custom: {
        serialize: (v: typeof clazz) => v.serialize(),
        deserialize: (v) => clazz.deserialize(v),
        recursive: true,
      },
    });

    const handler: ConstructorHandlerConfig<StateObject> = [clazz, (inst) => inst.clone()];

    registerConstructorHandler(handler);

    registry.addStateObject(clazz);
  }

  if (objectKind === 'identity') {
    registry.addIdentityObject(clazz);
  }
}

/**
 * Checks whether a given object instance belongs to a mark object.
 *
 * @param value - Object instance to check
 * @returns True if the object's constructor is mark object
 */
export function isMarkObject(value: object): boolean {
  return registry.hasMarkObject(value.constructor);
}

/**
 * Checks whether a given object is a state object.
 *
 * @param value - Object instance to check
 * @returns True if the object is a state object
 */
export function isStateObject(value: object): boolean {
  return registry.hasStateObject(value.constructor);
}

/**
 * Checks whether a given object is an identity object.
 *
 * @param value - Object instance to check
 * @returns True if the object is an identity object
 */
export function isIdentityObject(value: object): boolean {
  return registry.hasIdentityObject(value.constructor);
}
