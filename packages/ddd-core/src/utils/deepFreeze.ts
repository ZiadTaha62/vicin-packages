/**
 * Recursively freezes an object and all nested values.
 *
 * Handles:
 * - Plain objects
 * - Arrays
 * - Maps (keys and values)
 * - Sets
 *
 * @param value - Value to deep freeze
 * @param seen - Internal WeakSet to track visited objects
 * @returns The same value, now deeply frozen
 */
export function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return value;
  }

  if (seen.has(value)) return value;

  seen.add(value);

  for (const key of Reflect.ownKeys(value)) {
    const child = (value as any)[key];
    deepFreeze(child, seen);
  }

  if (value instanceof Map) {
    for (const [k, v] of value) {
      deepFreeze(k, seen);
      deepFreeze(v, seen);
    }
  }

  if (value instanceof Set) {
    for (const v of value) {
      deepFreeze(v, seen);
    }
  }

  Object.freeze(value);
  return value;
}
