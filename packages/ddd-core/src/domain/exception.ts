import { markFactory, MarkFactory } from '../extended-classes';
import { AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { IdentityErrorObjectFactory } from '../extended-classes';
import type { DddCoreErrorI } from '../ddd-core';

const IdentityObject = IdentityErrorObjectFactory('DomainException');
type IdentityObject = InstanceType<typeof IdentityObject>;

@AttachSigil('@vicin/ddd-core.DomainExceptionBase')
export class DomainExceptionBase extends IdentityObject {
  declare [sigil]: ExtendSigil<'DomainExceptionBase', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainException';
  }

  constructor(error: DddCoreErrorI) {
    super(error);
  }

  getState() {
    return {
      // dentity & Metadata
      id: this.id,
      traceId: this.traceId,
      timestamp: this.timestamp,

      // Classification
      domain: this.domain,
      type: this.type,
      name: this.name,

      // Codes & Status
      status: this.status,
      code: this.code,
      subCode: this.subCode,

      // Messages
      message: this.message,
      userMessage: this.userMessage,

      // Operational Flags
      isOperational: this.isOperational,
      retryable: this.retryable,

      // Context & Debugging
      details: this.details,
      context: this.context,
      cause: this.cause,
      stack: this.stack,
    };
  }

  toId(): string {
    return this.id;
  }
}

export const DomainException = MarkFactory(DomainExceptionBase);
export const domainException = markFactory(DomainExceptionBase);

@DomainException('@vicin/ddd-core.ValidationDomainException')
export class ValidationDomainException extends DomainExceptionBase {
  declare [sigil]: ExtendSigil<'ValidationDomainException', DomainExceptionBase>;

  constructor(error: Omit<DddCoreErrorI, 'type'>) {
    super({ ...error, type: 'Validation' });
  }
}

@DomainException('@vicin/ddd-core.InvariantViolationDomainException')
export class InvariantViolationDomainException extends DomainExceptionBase {
  declare [sigil]: ExtendSigil<'InvariantViolationDomainException', DomainExceptionBase>;

  constructor(error: Omit<DddCoreErrorI, 'type'>) {
    super({ ...error, type: 'InvariantViolation' });
  }
}

const error = new ValidationDomainException({
  name: 'VicinError',
  message: 'Invalid vicin passed',
  code: 'INVALID_VICIN',
});

console.debug(error.toString());
