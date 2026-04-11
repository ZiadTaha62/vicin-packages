export {
  DomainError,
  domainError,
  DomainErrorBase,
  ValidationDomainError,
  InvariantViolationDomainError,
} from './domain-error';
export {
  ApplicationError,
  ApplicationErrorMark,
  applicationErrorMark,
  NotFoundApplicationError,
  UnauthorizedApplicationError,
  MiddlewareApplicationError,
} from './application-error';
export { InfraStructureError, infraStructureError, InfraStructureErrorBase } from './infra';
export { type ErrorObject, isErrorObject } from './is';
