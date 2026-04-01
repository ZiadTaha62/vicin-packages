import { DomainList, AggregateRootBase } from '../domain';
import type { EventPublisherI } from './event-publisher';
import { AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { MarkObjectFactory, MarkFactory, markFactory } from '../extended-classes';

const MarkObject = MarkObjectFactory('ApplicationService');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.ApplicationServiceBase')
export abstract class ApplicationServiceBase extends MarkObject {
  declare [sigil]: ExtendSigil<'ApplicationServiceBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'ApplicationService';
  }

  constructor(protected readonly publisher: EventPublisherI) {
    super();
  }

  protected async publishEvents(events: DomainList<any> | any[]): Promise<void> {
    if (events instanceof DomainList) {
      await this.publisher.publishAll(events.unwrap());
    } else {
      await this.publisher.publishAll(events);
    }
  }

  // Helper to commit changes + publish events in one go
  protected async commit(aggregate: AggregateRootBase<any>): Promise<void> {
    const events = aggregate.pullEvents();
    await this.publishEvents(events);
  }
}

export const ApplicationService = MarkFactory(ApplicationServiceBase);
export const applicationService = markFactory(ApplicationServiceBase);
