/**
 * should only be used for programmer errors and internal consistency checks.
 * For business rule violations that need to be shown to the user, always return DomainResult.err(...)
 */
export function invariant(condition: boolean, error: Error): asserts condition {
  if (!condition) throw error;
}

/** Alias for 'invariant' function for convenience */
export const ensure = invariant;
