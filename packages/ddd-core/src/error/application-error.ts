import { AttachSigil, type sigil, type ExtendSigil, MarkFactory, markFactory } from '../utils';
import { ErrorObject, type ErrorObjectOptions } from './error-object';

@AttachSigil('@vicin/ddd-core.ApplicationError')
export abstract class ApplicationError extends ErrorObject {
  declare [sigil]: ExtendSigil<'ApplicationError', ErrorObject>;

  override get [Symbol.toStringTag]() {
    return 'ApplicationError';
  }

  constructor(error: ErrorObjectOptions) {
    super(error);
  }
}

export const ApplicationErrorMark = MarkFactory(ApplicationError);
export const applicationErrorMark = markFactory(ApplicationError);

@ApplicationErrorMark('@vicin/ddd-core.NotFoundApplicationError')
export class NotFoundApplicationError extends ApplicationError {
  declare [sigil]: ExtendSigil<'NotFoundApplicationError', ApplicationError>;
  constructor(error: Omit<ErrorObjectOptions, 'type'>) {
    super({ ...error, type: 'NotFound' });
  }
}

@ApplicationErrorMark('@vicin/ddd-core.UnauthorizedApplicationError')
export class UnauthorizedApplicationError extends ApplicationError {
  declare [sigil]: ExtendSigil<'UnauthorizedApplicationError', ApplicationError>;
  constructor(error: Omit<ErrorObjectOptions, 'type'>) {
    super({ ...error, type: 'Unauthorized' });
  }
}

@ApplicationErrorMark('@vicin/ddd-core.MiddlewareApplicationError')
export class MiddlewareApplicationError extends ApplicationError {
  declare [sigil]: ExtendSigil<'MiddlewareApplicationError', ApplicationError>;
  constructor(error: Omit<ErrorObjectOptions, 'type'>) {
    super({ ...error, type: 'Middleware' });
  }
}
