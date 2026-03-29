import { DomainObject } from '../object';
import { AttachSigil, type sigil, type ExtendSigil } from '../../../external';
import { ValueObjectBase, EntityBase, AggregateRootBase } from '../elements';

/**
 * Base class for domain collection objects.
 *
 * Collections provide value-based semantics over native JS collections (Map, Set),
 * allowing domain objects to be stored by value (value objects) or ID (entities).
 *
 * @template State - Internal state representation of the collection
 */
@AttachSigil('@vicin/ddd-core.DomainCollection')
export abstract class DomainCollectionBase<State> extends DomainObject<'Collection', State> {
  declare [sigil]: ExtendSigil<'DomainCollection', DomainObject<any, any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainCollection';
  }

  private strict: boolean;

  constructor(strict?: boolean) {
    super();
    this.strict = strict ?? false;
  }

  static override readonly type: 'Collection' = 'Collection';

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
  if (ValueObjectBase.isInstance(value)) return value.getState();
  if (EntityBase.isInstance(value) || AggregateRootBase.isInstance(value)) return value.toId();
  if (typeof value !== 'object' || value == null) return value;

  if (strict) {
    throw new Error(`[DDD-core Error] Value ${value} is stored by reference`);
  }

  return value;
}
