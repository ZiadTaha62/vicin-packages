import { withStateObject } from './state-object';
import { AttachSigil, type Sigil, type sigil, type ExtendSigil } from '../sigil';
import { PlainBase } from './plain-base';

export type IdentityObjectStatic = ReturnType<typeof withIdentityObject<string, typeof Sigil>>;
export type IdentityObject = InstanceType<IdentityObjectStatic>;

export const withIdentityObject = <K extends string, B extends typeof Sigil>(kind: K, Base: B) => {
  const StateObject = withStateObject(kind, Base);
  type StateObject = InstanceType<typeof StateObject>;

  @AttachSigil('@vicin/ddd-core.IdentityObject')
  abstract class IdentityObject extends StateObject {
    // @ts-expect-error ExtendSigil resolves correctly
    declare [sigil]: ExtendSigil<'IdentityObject', StateObject>;

    override get [Symbol.toStringTag]() {
      return 'IdentityObject';
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
    static override objectKind: 'identity' = 'identity';

    /** Identity string of the object */
    abstract toId(): string;

    /**
     * Compares this identity object with another for equality
     *
     * Equality is based on id value
     *
     * @param other - Identity object to compare with
     */
    override equals(other: this): boolean {
      if (!this.isInstance(other)) return false;
      return this.toId() === other.toId();
    }
  }

  return IdentityObject;
};

export const PlainIdentityObjectFactory = <K extends string>(kind: K) =>
  withIdentityObject(kind, PlainBase);
