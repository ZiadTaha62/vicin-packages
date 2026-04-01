import rfdc from 'rfdc';

/** ----------------------------
 *  Handlers
 * ---------------------------- */

type Constructor<T> = { new (...args: any[]): T };
export type ConstructorHandlerConfig<T = any> = [Constructor<T>, (o: T) => T];

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

/** ----------------------------
 *  Types
 * ---------------------------- */

export interface CloneableClass {
  new (...args: any[]): CloneableClassInstance;
}

export interface CloneableClassInstance {
  clone(): this;
}
