import type { Sigil } from './classes';
import { __SIGIL__ } from './symbols';

/**
 * Runtime predicate that checks whether the provided value is a sigil constructor.
 *
 * @param ctor - Constructor to test.
 * @returns `true` if `value` is a sigil constructor, otherwise `false`.
 */
export function isSigilCtor(ctor: unknown): ctor is typeof Sigil {
  return typeof ctor === 'function' && ctor.prototype && __SIGIL__ in ctor.prototype;
}

/**
 * Runtime predicate that checks whether the provided object is an instance
 * of a sigil class.
 *
 * @param inst - The instanca to test.
 * @returns `true` if `obj` is an instance produced by a sigil constructor.
 */
export function isSigilInstance(inst: unknown): inst is Sigil {
  return !!inst && typeof inst === 'object' && __SIGIL__ in inst;
}
