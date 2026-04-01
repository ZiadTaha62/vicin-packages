import { DddCore } from '../ddd-core';
import type { OutboxI } from '../application';
import { DomainList, MutableDomainSet, type DomainEventBase } from '../domain';
import { AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { markFactory, MarkFactory, MarkObjectFactory } from '../extended-classes';

const MarkObject = MarkObjectFactory('Outbox');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.OutboxBase')
export abstract class OutboxBase extends MarkObject implements OutboxI {
  declare [sigil]: ExtendSigil<'OutboxBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'ApplicationOutbox';
  }

  abstract save(events: Iterable<DomainEventBase>): Promise<void>;
  abstract getUnprocessed(): Promise<Iterable<DomainEventBase>>;
  abstract markAsProcessed(events: Iterable<DomainEventBase>): Promise<void>;
}

export const Outbox = MarkFactory(OutboxBase);
export const outbox = markFactory(OutboxBase);

@Outbox('@vicin/ddd-core.InMemoryOutbox')
export class InMemoryOutbox extends OutboxBase {
  declare [sigil]: ExtendSigil<'InMemoryOutbox', OutboxBase>;

  private outbox_table = new MutableDomainSet<DomainEventBase>();

  async save(events: Iterable<DomainEventBase>): Promise<void> {
    for (const e of events) this.outbox_table.add(e);
  }

  async getUnprocessed(): Promise<DomainList<DomainEventBase>> {
    return new DomainList(this.outbox_table);
  }

  async markAsProcessed(events: Iterable<DomainEventBase>, strict: boolean = false): Promise<void> {
    for (const e of events) {
      const deleted = this.outbox_table.delete(e);
      if (!deleted && strict) {
        throw new Error(
          `[DDD-core Error] Event '${e.SigilLabel}' with id '${e.toId()}' is not present in outbox`
        );
      }
    }
  }
}
