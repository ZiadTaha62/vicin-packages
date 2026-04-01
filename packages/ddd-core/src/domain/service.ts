import { AttachSigil, type sigil, type ExtendSigil, Result, Status } from '../utils';
import { markFactory, MarkFactory, MarkObjectFactory } from '../extended-classes';

const MarkObject = MarkObjectFactory('DomainService');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.DomainServiceBase')
export abstract class DomainServiceBase extends MarkObject {
  declare [sigil]: ExtendSigil<'DomainServiceBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainService';
  }

  // Convenient helpers
  protected readonly Result = Result;
  protected ok = Result.ok;
  protected err = Result.err;
  protected readonly Status = Status;
  protected success = Status.success;
  protected failure = Status.failure;
}

export const DomainService = MarkFactory(DomainServiceBase);
export const domainService = markFactory(DomainServiceBase);
