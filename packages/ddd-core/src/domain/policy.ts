import { MarkFactory, markFactory, type sigil, type ExtendSigil, Result } from '../utils';
import { SpecificationBase } from './specification';
import { DomainServiceBase, DomainService } from './service';
import { DomainErrorBase } from '../error';

@DomainService('@vicin/ddd-core.PolicyBase')
export abstract class PolicyBase extends DomainServiceBase {
  declare [sigil]: ExtendSigil<'PolicyBase', DomainServiceBase>;

  override get [Symbol.toStringTag]() {
    return 'DomainPolicy';
  }

  /** Enforce a policy and return Result (recommended pattern) */
  abstract enforce(...args: any[]): Result<void, DomainErrorBase>;

  /** Quick boolean check (convenience) */
  protected isSatisfiedBy<T>(spec: SpecificationBase<T>, candidate: T): boolean {
    return spec.isSatisfiedBy(candidate);
  }
}

export const Policy = MarkFactory(PolicyBase);
export const policy = markFactory(PolicyBase);
