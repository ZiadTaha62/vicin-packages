import { SigilError, withSigilTyped, type GetInstance } from '@vicin/sigil';
import type { JsonValue, Serializable } from '../../types';

export type DomainErrorName = 'DomainError' | 'InvariantError' | 'ValidationError';

export interface DomainErrorJson {
  name: DomainErrorName;
  code: string;
  message: string;
  [x: string]: JsonValue;
}

abstract class _DomainError extends SigilError implements Serializable {
  get [Symbol.toStringTag]() {
    return 'DomainError';
  }

  override name: DomainErrorName;

  constructor(
    public readonly code: string,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'DomainError';
  }

  toJSON(): DomainErrorJson {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
    };
  }

  override toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

export const DomainError = withSigilTyped(_DomainError, '@vicin/ddd-core.DomainError');
export type DomainError = GetInstance<typeof DomainError>;
