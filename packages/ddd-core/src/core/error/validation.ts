import { withSigilTyped, type GetInstance } from '@vicin/sigil';
import { DomainError } from './base';

class _ValidationError extends DomainError {
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = 'ValidationError';
  }
}

export const ValidationError = withSigilTyped(_ValidationError, '@vicin/ddd-core.ValidationError');
export type ValidationError = GetInstance<typeof ValidationError>;
