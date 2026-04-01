import { SpecificationBase } from './specification';
import { type sigil, type ExtendSigil, Result, Status } from '../utils';
import { DomainServiceBase, DomainService } from './service';
import { DomainExceptionBase } from './exception';
import { markFactory, MarkFactory } from '../extended-classes';

@DomainService('@vicin/ddd-core.PolicyBase')
export abstract class PolicyBase extends DomainServiceBase {
  declare [sigil]: ExtendSigil<'PolicyBase', DomainServiceBase>;

  override get [Symbol.toStringTag]() {
    return 'DomainPolicy';
  }

  /** Enforce a policy and return Result (recommended pattern) */
  abstract enforce(
    ...args: any[]
  ): Result<void, DomainExceptionBase> | Status<void, DomainExceptionBase>;

  /** Quick boolean check (convenience) */
  protected isSatisfiedBy<T>(spec: SpecificationBase<T>, candidate: T): boolean {
    return spec.isSatisfiedBy(candidate);
  }
}

export const Policy = MarkFactory(PolicyBase);
export const policy = markFactory(PolicyBase);
