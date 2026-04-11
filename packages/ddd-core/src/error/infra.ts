import { AttachSigil, type sigil, type ExtendSigil, MarkFactory, markFactory } from '../utils';
import { ErrorObject, type ErrorObjectOptions } from './error-object';

@AttachSigil('@vicin/ddd-core.InfraStructureErrorBase')
export abstract class InfraStructureErrorBase extends ErrorObject {
  declare [sigil]: ExtendSigil<'InfraStructureErrorBase', ErrorObject>;

  override get [Symbol.toStringTag]() {
    return 'InfraStructureError';
  }

  constructor(error: ErrorObjectOptions) {
    super(error);
  }
}

export const InfraStructureError = MarkFactory(InfraStructureErrorBase);
export const infraStructureError = markFactory(InfraStructureErrorBase);
