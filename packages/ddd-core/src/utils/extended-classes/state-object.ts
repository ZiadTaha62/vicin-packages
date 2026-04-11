import { AttachSigil, type sigil, type ExtendSigil, Sigil } from '../sigil';
import { isEqual } from '../isEqual';
import { JSONSerializer, type JSONValue } from '../json-serializer';
import { stringify } from '../stringify';
import { clone } from '../clone';
import { withDddObject } from './ddd-object';
import { PlainBase } from './plain-base';
import { DddCoreDevError } from '../error';

export interface StateObjectSerialization<Kind extends string = string, State = unknown> {
  kind: Kind;
  label: string;
  state: State;
}

export type StateOf<T extends { getState(): any }> = ReturnType<T['getState']>;

export type StateObjectStatic = ReturnType<typeof withStateObject<string, typeof Sigil>>;
export type StateObject = InstanceType<StateObjectStatic>;

export const withStateObject = <K extends string, B extends typeof Sigil>(kind: K, Base: B) => {
  const DddObject = withDddObject(kind, Base);
  type DddObject = InstanceType<typeof DddObject>;

  @AttachSigil('@vicin/ddd-core.StateObject')
  abstract class StateObject extends DddObject {
    // @ts-expect-error ExtendSigil resolves correctly
    declare [sigil]: ExtendSigil<'StateObject', DddObject>;

    override get [Symbol.toStringTag]() {
      return 'StateObject';
    }

    /**
     * Main kind of object
     *
     * There is tree types of objects in `DDD-core`:
     *
     * - **ddd:** all objects throught the lib extend it, must use mark decorators (e.g. `@ValueObject`) or functions otherwise it throws when ommited
     * - **state:** objects that holds internal state (stateful) and provides `getState`, `reconstiture`,
     * `serialize`/`deserialize`, `toJSON`/`fromJSON`, `clone` and `equals` methods
     * - **identity:** state object that holds identity field (e.g. `Entity`), it exposes `toId` method and equality based on id value
     */
    static override objectKind: 'state' = 'state';

    /**
     * Reconstructs a state object from persisted state (output of `serialize` method)
     *
     * Used internally by cloning and deserialization
     *
     * @param state - Persisted state
     * @param groupKey - Optional key used to wrap state
     * @returns Reconstructed state object
     *
     * @throws Error if state is not an object
     */
    static reconstitute<S extends StateObject>(
      state: ReturnType<S['getState']>,
      groupKey?: string
    ): S {
      const stateObject = groupKey ? { [groupKey]: state } : state;
      if (typeof stateObject === 'object' && !!stateObject && !Array.isArray(stateObject)) {
        return Object.assign(Object.create(this.prototype), stateObject);
      }

      throw new DddCoreDevError(
        `[DDD-core Error] State passed to 'reconstitute' method of class ${this.name} is not an object, must be object or pass a groupKey`
      );
    }

    /**
     * Deserializes a state object from its serialized form
     *
     * @param serialization - Serialized state (output of `serialize()` method)
     * @returns Reconstructed state object
     */
    static deserialize<S extends StateObject>(
      serialization: StateObjectSerialization<K, ReturnType<S['getState']>>
    ): S {
      return this.reconstitute(serialization.state);
    }

    /**
     * Converts a JSON value back into a state object using the internal JSONSerializer
     *
     * @param json - Serialized JSON value (output of `toJSON` method)
     */
    static fromJSON<S extends StateObject>(json: JSONValue): S {
      return JSONSerializer.deserialize(json as any);
    }

    /**
     * Returns the persisted state of the state object
     *
     * This state is used for:
     * - equality comparison
     * - serialization
     * - cloning
     */
    abstract getState(): any;

    /**
     * Compares this state object with another for equality
     *
     * Equality is based on deep comparison of state
     *
     * @param other - State object to compare with
     */
    equals(other: this): boolean {
      if (!this.isInstance(other)) return false;
      return isEqual(this.getState(), other.getState());
    }

    /**
     * Serializes the state object into a transport-friendly format
     *
     * Includes:
     * - kind
     * - sigil label
     * - persisted state
     */
    serialize(): StateObjectSerialization<K, ReturnType<this['getState']>> {
      return {
        kind: this.kind,
        label: this.SigilLabel,
        state: this.getState() as any,
      };
    }

    /**
     * Converts the state object into a JSON-compatible value (used output of `serialize` method)
     *
     * Uses the internal JSONSerializer to preserve types and structure
     */
    toJSON(): JSONValue {
      const result = JSONSerializer.serialize(this);
      if (result.ignored) {
        throw new DddCoreDevError(
          `[DDD-core Error] Serialization result of '${this.SigilLabel}' has ignored classes [ ${result.ignored.join(', ')} ] make sure to pass them to 'JSONSerializer`
        );
      }
      return result as unknown as JSONValue;
    }

    /**
     * Stringify state object
     *
     * Conversion is one-way and should be used for logs only, it supports `JSON` or `YAML` like serialization
     */
    override toString(): string {
      return stringify(this.serialize());
    }

    /**
     * Creates a deep clone of this state object
     *
     * Cloning works by:
     * - cloning the internal state
     * - reconstituting a new instance using static 'reconstitute' method
     */
    clone(): this {
      const clonedState = clone(this.getState());
      return (this.constructor as typeof StateObject).reconstitute(clonedState as any);
    }
  }

  return StateObject;
};

export const PlainStateObjectFactory = <K extends string>(kind: K) =>
  withStateObject(kind, PlainBase);
