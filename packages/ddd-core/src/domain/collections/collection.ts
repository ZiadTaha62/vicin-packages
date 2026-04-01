import { markFactory, MarkFactory, StateObjectFactory } from '../../extended-classes';
import { AttachSigil, type sigil, type ExtendSigil } from '../../utils';
import { ValueObjectBase, EntityBase, AggregateRootBase } from '../elements';
import { DomainEventBase } from '../event';

const StateObject = StateObjectFactory('DomainCollection');
type StateObject = InstanceType<typeof StateObject>;

type DomainCollectionState = unknown;

/**
 * Base class for domain collection objects.
 *
 * Collections provide value-based semantics over native JS collections (Map, Set),
 * allowing domain objects to be stored by value (value objects) or ID (entities).
 *
 * @template State - Internal state representation of the collection
 */
@AttachSigil('@vicin/ddd-core.DomainCollection')
export abstract class DomainCollectionBase<
  State extends DomainCollectionState,
> extends StateObject {
  declare [sigil]: ExtendSigil<'DomainCollection', StateObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainCollection';
  }

  constructor(private strict: boolean = false) {
    super();
  }

  abstract override getState(): State;

  /**
   * Converts a value into a stable key used internally for storage.
   *
   * Rules:
   * - ValueObject → uses its state
   * - Entity / AggregateRoot → uses `toId()`
   * - Other values → stored directly (unless strict mode is enabled throws on objects)
   *
   * @param value - Value to convert
   * @throws Error if strict mode is enabled and value is not supported
   */
  protected toKey(value: any): unknown {
    return toKey(value, this.strict);
  }
}

export const DomainCollection = MarkFactory(DomainCollectionBase);
export const domainCollection = markFactory(DomainCollectionBase);

/**
 * Converts a value into a stable key used internally for storage.
 *
 * Rules:
 * - ValueObject → uses its state
 * - Entity / AggregateRoot → uses `toId()`
 * - Other values → stored directly (unless strict mode is enabled throws on objects)
 *
 * @param value - Value to convert
 * @throws Error if strict mode is enabled and value is not supported
 */
export function toKey(value: any, strict: boolean): unknown {
  if (ValueObjectBase.isInstance(value)) {
    return value.getState();
  }

  if (
    EntityBase.isInstance(value) ||
    AggregateRootBase.isInstance(value) ||
    DomainEventBase.isInstance(value)
  ) {
    return value.toId();
  }

  if (typeof value !== 'object' || value == null) {
    return value;
  }

  if (strict) {
    throw new Error(`[DDD-core Error] Value ${value} is stored by reference`);
  }

  return value;
}
