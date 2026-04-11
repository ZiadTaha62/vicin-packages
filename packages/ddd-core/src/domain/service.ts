import {
  MarkObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
} from '../utils';

const MarkObject = MarkObjectFactory('DomainService');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.DomainServiceBase')
export abstract class DomainServiceBase extends MarkObject {
  declare [sigil]: ExtendSigil<'DomainServiceBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainService';
  }
}

export const DomainService = MarkFactory(DomainServiceBase);
export const domainService = markFactory(DomainServiceBase);
