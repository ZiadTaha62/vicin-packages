import {
  PlainStateObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
  type JSONValue,
  type StateObjectSerialization,
  isIdentityObject,
  isStateObject,
  DddCoreDevError,
} from '../../utils';

const StateObject = PlainStateObjectFactory('DomainCollection');
type StateObject = InstanceType<typeof StateObject>;

/**
 * Base class for domain collection objects.
 *
 * Collections provide value-based semantics over native JS collections (Map, Set),
 * allowing domain objects to be stored by value (value objects) or ID (entities).
 *
 * @template State - Internal state representation of the collection
 */
@AttachSigil('@vicin/ddd-core.DomainCollection')
// @ts-expect-error Override of static methods with error 'extends but could be instantiated with a different subtype of constraint'
export abstract class DomainCollectionBase extends StateObject {
  declare [sigil]: ExtendSigil<'DomainCollection', StateObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainCollection';
  }

  constructor(private strict: boolean = false) {
    super();
  }

  static override deserialize<C extends DomainCollectionBase>(
    serialization: StateObjectSerialization<C['kind'], ReturnType<C['getState']>>
  ): C {
    return super.reconstitute(serialization.state);
  }

  static override fromJSON<C extends DomainCollectionBase>(json: JSONValue): C {
    return super.fromJSON(json);
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
  if (isStateObject(value)) {
    return value.getState();
  }

  if (isIdentityObject(value)) {
    return value.toId();
  }

  if (typeof value !== 'object' || value == null) {
    return value;
  }

  if (strict) {
    throw new DddCoreDevError(`[DDD-core Error] Value ${value} is stored by reference`);
  }

  return value;
}
