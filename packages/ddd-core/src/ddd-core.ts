import {
  isRegistered,
  Sigil,
  SigilError,
  AttachSigil,
  type sigil,
  type ExtendSigil,
} from './utils';

const ERROR_MESSAGE = (name: string) =>
  `[DDD-core Error] Class ${name} is not registered, must use one of the decorators (ValueObject, Entity, AggregateRoot, Event, etc...)`;

@AttachSigil('@vicin/ddd-core.DddCore')
export class DddCore extends Sigil {
  declare [sigil]: ExtendSigil<'DddCore', Sigil>;

  constructor() {
    super();
    if (!isRegistered(this)) throw new Error(ERROR_MESSAGE(this.constructor.name));
  }
}

@AttachSigil('@vicin/ddd-core.DddCoreError')
export class DddCoreError extends SigilError {
  declare [sigil]: ExtendSigil<'DddCoreError', SigilError>;

  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    if (!isRegistered(this)) throw new Error(ERROR_MESSAGE(this.constructor.name));
  }
}
