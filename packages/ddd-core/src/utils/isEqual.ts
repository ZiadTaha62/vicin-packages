import { isDomainObject } from './registry';

/** Function used internally for equality, its a copy of 'fast-deep-equal' library but modified to call 'equals' method of domain objects */
/**
 * Deep equality check used across the domain layer. Uses 'fast-deep-equal' function code
 *
 * Features:
 * - Structural deep equality (objects, arrays, maps, sets, typed arrays)
 * - Domain-aware: calls `.equals()` for domain objects
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    // Check for domain objects
    if (isDomainObject(a)) return a.equals(b);

    if (a.constructor !== b.constructor) return false;

    let length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!isEqual(a[i], b[i])) return false;
      return true;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (i of a.entries()) if (!b.has(i[0])) return false;
      for (i of a.entries()) if (!isEqual(i[1], b.get(i[0]))) return false;
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (i of a.entries()) if (!b.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = (a as any).length;
      if (length != (b as any).length) return false;
      for (i = length; i-- !== 0; ) if ((a as any)[i] !== (b as any)[i]) return false;
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    // eslint-disable-next-line prefer-const
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i]!)) return false;

    for (i = length; i-- !== 0; ) {
      const key = keys[i]!;

      if (!isEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}
