import { ApplicationErrorBase } from './application-error';
import { DomainErrorBase } from './domain-error';
import { InfraStructureErrorBase } from './infra';
import { ErrorObject as InternalErrorObject } from './error-object';

export type ErrorObject = ApplicationErrorBase | DomainErrorBase | InfraStructureErrorBase;

export function isErrorObject(value: unknown): value is ErrorObject {
  return InternalErrorObject.isInstance(value);
}
