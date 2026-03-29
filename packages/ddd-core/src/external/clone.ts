import rfdc from 'rfdc';

/** ----------------------------
 *  Handlers
 * ---------------------------- */

type Constructor<T> = { new (...args: any[]): T };
type ConstructorHandlerConfig<T = any> = [Constructor<T>, (o: T) => T];

const constructorHandlers: ConstructorHandlerConfig[] = [];

/**
 * Deep clone function used across the library.
 *
 * Uses `rfdc` internally and supports:
 * - Circular references
 * - Custom constructor handlers
 * - Domain object cloning via `.clone()`
 *
 * @param value - Value to clone
 * @returns Deep cloned value
 */
export const clone = rfdc({ circles: true, constructorHandlers });

/**
 * Registers a custom constructor handler for the clone function.
 *
 * This allows defining how instances of a class should be cloned.
 *
 * @param handler - Tuple of [Constructor, cloneFunction]
 */
export function registerConstructorHandler(handler: ConstructorHandlerConfig) {
  constructorHandlers.push(handler);
}

/**
 * Registers a class as cloneable using its `.clone()` method.
 *
 * This is used internally for domain objects so they preserve identity semantics.
 *
 * @param v - Class constructor implementing `.clone()`
 */
export function registerCloneableClass(v: CloneableClass) {
  const handler: ConstructorHandlerConfig<CloneableClassInstance> = [v, (inst) => inst.clone()];
  registerConstructorHandler(handler);
}

/** ----------------------------
 *  Types
 * ---------------------------- */

export interface CloneableClass {
  new (...args: any[]): CloneableClassInstance;
}

export interface CloneableClassInstance {
  clone(): this;
}
