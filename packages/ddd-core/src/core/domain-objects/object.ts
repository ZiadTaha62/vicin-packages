import { Sigil, AttachSigil, type sigil, type ExtendSigil } from '@vicin/sigil';
import { serializer, type JSONValue, clone, stringify, isEqual } from '../../external';
import { isRegistered } from '../../registry';

export type DomainObjectType = 'ValueObject' | 'Entity' | 'AggregateRoot' | 'Event' | 'Collection';

export interface DomainObjectSerialization<T extends DomainObjectType, S> {
  type: T;
  label: string;
  state: S;
}

export type TypeOf<D extends DomainObject<any, any>> =
  D extends DomainObject<infer Type, any> ? Type : never;

export type StateOf<D extends DomainObject<any, any>> =
  D extends DomainObject<any, infer State> ? State : never;

/**
 * Base class for all domain objects
 *
 * Provides:
 * - Serialization / deserialization
 * - Deep equality semantics
 * - Cloning support
 * - Sigil-based identity
 *
 * @template Type - Domain object type (ValueObject, Entity, etc.)
 * @template State - Internal persisted state
 */
@AttachSigil('@vicin/lib-core.DomainObject')
export abstract class DomainObject<Type extends DomainObjectType, State> extends Sigil {
  declare [sigil]: ExtendSigil<'DomainObject', Sigil>;

  get [Symbol.toStringTag]() {
    return 'DomainObject';
  }

  static readonly type: DomainObjectType;
  get type(): Type {
    return (this.constructor as typeof DomainObject).type as Type;
  }

  constructor() {
    super();
    if (!isRegistered(this)) {
      throw new Error(
        `[DDD-core Error] Class ${(this as any).constructor.name} is not registered, must use one of the decorators (ValueObject, Entity, AggregateRoot, Event, etc...)`
      );
    }
  }

  /**
   * Reconstructs a domain object from persisted state
   *
   * Used internally by cloning and deserialization
   *
   * @param state - Persisted state
   * @param groupKey - Optional key used to wrap state
   * @returns Reconstructed domain object
   *
   * @throws Error if state is not an object
   */
  static reconstitute<D extends DomainObject<any, any>>(state: StateOf<D>, groupKey?: string): D {
    const stateObject = groupKey ? { [groupKey]: state } : state;
    if (typeof stateObject === 'object' && !!stateObject && !Array.isArray(stateObject)) {
      return Object.assign(Object.create(this.prototype), groupKey ? { [groupKey]: state } : state);
    }

    throw new Error(
      `[DDD-core Error] State passed to 'reconstitute' method of class ${this.name} is not an object, must be object or pass a groupKey`
    );
  }

  /**
   * Deserializes a domain object from its serialized form
   *
   * @param serialization - Output of `serialize()`
   * @returns Reconstructed domain object
   */
  static deserialize<D extends DomainObject<any, any>>(
    serialization: DomainObjectSerialization<TypeOf<D>, StateOf<D>>
  ): D {
    return this.reconstitute(serialization.state);
  }

  /**
   * Check equality between two domain objects
   * @param value1 - Domain object to check
   * @param value2 - Domain object to compare against
   * @returns Boolean
   */
  static equals<T extends DomainObject<any, any>>(value1: T, value2: T): boolean {
    return value1.equals(value2);
  }

  /**
   * Returns the persisted state of the domain object
   *
   * This state is used for:
   * - equality comparison
   * - serialization
   * - cloning
   */
  abstract getState(): State;

  /**
   * Compares this domain object with another for equality
   *
   * By default, equality is based on deep comparison of state
   * Entities and aggregate roots are compared by id
   *
   * @param other - Domain object to compare with
   */
  equals(other: this): boolean {
    if (!this.isInstance(other)) return false;
    return isEqual(this.getState(), other.getState());
  }

  /**
   * Serializes the domain object into a transport-friendly format
   *
   * Includes:
   * - type
   * - sigil label
   * - persisted state
   */
  serialize(): DomainObjectSerialization<Type, State> {
    return {
      type: this.type,
      label: this.SigilLabel,
      state: this.getState(),
    };
  }

  /**
   * Converts a JSON value back into a domain object using the internal serializer
   *
   * @param json - Serialized JSON value
   */
  static fromJSON(json: any) {
    return serializer.deserialize(json);
  }

  /**
   * Converts the domain object into a JSON-compatible value
   *
   * Uses the internal serializer to preserve types and structure
   */
  toJSON(): JSONValue {
    const result = serializer.serialize(this);
    if (result.ignored) {
      throw new Error(
        `[DDD-core Error] Serialization retsult of '${this.SigilLabel}' has ignored classes [ ${result.ignored.join(', ')} ] make sure to pass them to 'serializer`
      );
    }
    return result as unknown as JSONValue;
  }

  /**
   * Stringify domain state
   */
  override toString(): string {
    return stringify(this.getState());
  }

  /**
   * Creates a deep clone of this domain object
   *
   * Cloning preserves domain semantics by:
   * - cloning the internal state
   * - reconstituting a new instance using static 'reconstitute' method
   */
  clone(): this {
    const clonedState = clone(this.getState());
    return (this.constructor as typeof DomainObject).reconstitute(clonedState as any);
  }
}
