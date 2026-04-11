import { AttachSigil, type sigil, type ExtendSigil, MarkFactory, markFactory } from '../utils';
import { ErrorObject, type ErrorObjectOptions } from './error-object';

@AttachSigil('@vicin/ddd-core.DomainErrorBase')
export abstract class DomainErrorBase extends ErrorObject {
  declare [sigil]: ExtendSigil<'DomainErrorBase', ErrorObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainError';
  }
}

export const DomainError = MarkFactory(DomainErrorBase);
export const domainError = markFactory(DomainErrorBase);

@DomainError('@vicin/ddd-core.ValidationDomainError')
export class ValidationDomainError extends DomainErrorBase {
  declare [sigil]: ExtendSigil<'ValidationDomainError', DomainErrorBase>;

  constructor(error: Omit<ErrorObjectOptions, 'type'>) {
    super({ ...error, type: 'Validation' });
  }
}

@DomainError('@vicin/ddd-core.InvariantViolationDomainError')
export class InvariantViolationDomainError extends DomainErrorBase {
  declare [sigil]: ExtendSigil<'InvariantViolationDomainError', DomainErrorBase>;

  constructor(error: Omit<ErrorObjectOptions, 'type'>) {
    super({ ...error, type: 'InvariantViolation' });
  }
}
