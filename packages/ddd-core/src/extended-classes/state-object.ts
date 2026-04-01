import {
  AttachSigil,
  type sigil,
  type ExtendSigil,
  isEqual,
  stringify,
  JSONSerializer,
  type JSONValue,
  clone,
} from '../utils';
import { DddCore, DddCoreError } from '../ddd-core';
import { withMarkObject, type MarkObject, type MarkObjectStatic } from './mark-object';
import type { ObjectKind } from '../registry';

export interface StateObjectSerialization<Kind extends string = string, State = unknown> {
  kind: Kind;
  label: string;
  state: State;
}

export type StateOf<T> = T extends StateObject ? ReturnType<T['getState']> : never;

export interface StateObjectStatic<Kind extends string = string> extends MarkObjectStatic<Kind> {
  new (...args: any[]): StateObject<Kind>;
  reconstitute<S extends StateObject>(state: StateOf<S>, groupKey?: string): S;
  deserialize<S extends StateObject>(serialization: StateObjectSerialization<Kind, StateOf<S>>): S;
  fromJSON<S extends StateObject>(json: any): S;
}

export interface StateObject<Kind extends string = string> extends MarkObject<Kind> {
  getState(): any;
  equals(other: this): boolean;
  serialize(): StateObjectSerialization<Kind, this['getState']>;
  toJSON(): JSONValue;
  toString(): string;
  clone(): this;
}

export const withStateObject = <
  C extends new (...args: any[]) => any,
  L extends string,
  K extends string,
>(
  clazz: C,
  label: L,
  kind: K
) => {
  const MarkObject = withMarkObject(clazz, label, kind);

  @AttachSigil('@vicin/ddd-core.StateObject')
  abstract class StateObject extends MarkObject {
    declare [sigil]: ExtendSigil<'StateObject', InstanceType<typeof MarkObject>>;

    get [Symbol.toStringTag]() {
      return 'StateObject';
    }

    static override objectKind: ObjectKind = 'state';

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
    static reconstitute<S extends StateObject>(
      state: ReturnType<S['getState']>,
      groupKey?: string
    ): S {
      const stateObject = groupKey ? { [groupKey]: state } : state;
      if (typeof stateObject === 'object' && !!stateObject && !Array.isArray(stateObject)) {
        return Object.assign(
          Object.create(this.prototype),
          groupKey ? { [groupKey]: state } : state
        );
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
    static deserialize<S extends StateObject>(
      serialization: StateObjectSerialization<K, ReturnType<S['getState']>>
    ): S {
      return this.reconstitute(serialization.state);
    }

    /**
     * Converts a JSON value back into a domain object using the internal JSONSerializer
     *
     * @param json - Serialized JSON value
     */
    static fromJSON<S extends StateObject>(json: any): S {
      return JSONSerializer.deserialize(json);
    }

    /**
     * Returns the persisted state of the domain object
     *
     * This state is used for:
     * - equality comparison
     * - serialization
     * - cloning
     */
    abstract getState(): any;

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
     * - kind
     * - sigil label
     * - persisted state
     */
    serialize(): StateObjectSerialization<K, ReturnType<this['getState']>> {
      return {
        kind: this.type,
        label: this.SigilLabel,
        state: this.getState() as any,
      };
    }

    /**
     * Converts the domain object into a JSON-compatible value
     *
     * Uses the internal JSONSerializer to preserve types and structure
     */
    toJSON(): JSONValue {
      const result = JSONSerializer.serialize(this);
      if (result.ignored) {
        throw new Error(
          `[DDD-core Error] Serialization result of '${this.SigilLabel}' has ignored classes [ ${result.ignored.join(', ')} ] make sure to pass them to 'JSONSerializer`
        );
      }
      return result as unknown as JSONValue;
    }

    /**
     * Stringify domain state
     */
    toString(): string {
      return stringify(this.serialize());
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
      return (this.constructor as typeof StateObject).reconstitute(clonedState as any);
    }
  }

  return StateObject as typeof StateObject & typeof MarkObject;
};

export const StateObjectFactory = <K extends string>(kind: K) =>
  withStateObject(DddCore, '@vicin/ddd-core.DddCore' as 'DddCore', kind);

export const StateErrorObjectFactory = <K extends string>(kind: K) =>
  withStateObject(DddCoreError, '@vicin/ddd-core.DddCoreError' as 'DddCoreError', kind);
