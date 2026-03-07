// import { InvariantError } from '../error';

// /**
//  * should only be used for programmer errors and internal consistency checks.
//  * For business rule violations that need to be shown to the user, always return DomainResult.err(...)
//  */
// export function invariant(condition: boolean, message: string, code: string = 'InvariantViolation'): asserts condition {
//   if (!condition) throw new InvariantError(code, message);
// }

// export const ensure = invariant;
