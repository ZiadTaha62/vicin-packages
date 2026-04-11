import {
  PlainDddObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
} from '../utils';
import { AggregateRootBase, DomainEventBase } from '../domain';
import type { LoggerI, ExecutionContextI, UnitOfWorkI, EventPublisherI } from './infra-interfaces';
import type { ApplicationErrorBase } from '../error';

const DddObject = PlainDddObjectFactory('ApplicationService');
type DddObject = InstanceType<typeof DddObject>;

export interface ApplicationServiceDeps {
  publisher?: EventPublisherI;
  uow?: UnitOfWorkI;
  logger?: LoggerI;
  context?: ExecutionContextI;
}

@AttachSigil('@vicin/ddd-core.ApplicationServiceBase')
export abstract class ApplicationServiceBase extends DddObject {
  declare [sigil]: ExtendSigil<'ApplicationServiceBase', DddObject>;

  override get [Symbol.toStringTag]() {
    return 'ApplicationService';
  }

  constructor(protected readonly deps: ApplicationServiceDeps) {
    super();
  }

  abstract mapUnexpectedError(error: unknown): ApplicationErrorBase;

  protected async inTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.getUnitOfWork().run(work);
  }

  protected async publishEvents(events: Iterable<DomainEventBase>): Promise<void> {
    await this.getPublisher().publishAll(events);
  }

  protected async commit(aggregate: AggregateRootBase<any>): Promise<void> {
    const events = aggregate.pullEvents();
    await this.publishEvents(events);
  }

  protected logDebug(message: string, meta?: Record<string, unknown>) {
    this.getLogger().debug(message, meta);
  }

  protected logInfo(message: string, meta?: Record<string, unknown>) {
    this.getLogger().info(message, meta);
  }

  protected logWarn(message: string, meta?: Record<string, unknown>) {
    this.getLogger().warn(message, meta);
  }

  protected logError(message: string, meta?: Record<string, unknown>) {
    this.getLogger().error(message, meta);
  }

  protected getPublisher() {
    const pub = this.deps.publisher;
    if (!pub) throw new Error(this.missingMessage('Publisher'));
    return pub;
  }

  protected getLogger() {
    const log = this.deps.logger;
    if (!log) throw new Error(this.missingMessage('Logger'));
    return log;
  }

  protected getUnitOfWork() {
    const uow = this.deps.uow;
    if (!uow) throw new Error(this.missingMessage('UnitOfWork'));
    return uow;
  }

  protected getContext() {
    const ctx = this.deps.context;
    if (!ctx) throw new Error(this.missingMessage('Context'));
    return ctx;
  }

  private missingMessage(missing: string) {
    return `[DDD-core Error] '${missing}' is missing in '${this.SigilLabel}'`;
  }
}

export const ApplicationService = MarkFactory(ApplicationServiceBase);
export const applicationService = markFactory(ApplicationServiceBase);
