import { Result, ResultAsync } from '../outcome';
import { AttachSigil, Sigil, type sigil, type ExtendSigil } from '../sigil';
import { isDddObject } from './registry';
import { PlainBase } from './plain-base';
import { DddCoreDevError } from '../error';

export type DddObjectStatic = ReturnType<typeof withDddObject<string, typeof Sigil>>;
export type DddObject = InstanceType<DddObjectStatic>;

export const withDddObject = <K extends string, B extends typeof Sigil>(kind: K, Base: B) => {
  @AttachSigil('@vicin/ddd-core.DddObject')
  abstract class DddObject extends Base {
    // @ts-expect-error ExtendSigil resolves correctly
    declare [sigil]: ExtendSigil<'DddObject', InstanceType<B>>;

    get [Symbol.toStringTag]() {
      return 'DddObject';
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
    static readonly objectKind: 'ddd' = 'ddd';

    /** Kind of object (e.g. `ValueObject`, `ApplicationService` etc...) */
    static readonly kind: K = kind;

    /** Kind of object (e.g. `ValueObject`, `ApplicationService` etc...) */
    get kind(): K {
      return kind;
    }

    constructor(...args: any[]) {
      super(...args);
      if (!isDddObject(this)) {
        throw new DddCoreDevError(
          `[DDD-core Error] Class ${this.constructor.name} is not marked, must use one of the markers (e.g. @ValueObject, @Entity, @Event, etc...)`
        );
      }
    }

    readonly Result = Result;
    readonly ok = Result.ok;
    readonly err = Result.err;
    readonly ResultAsync = ResultAsync;
    readonly okAsync = ResultAsync.ok;
    readonly errAsync = ResultAsync.err;
  }

  return DddObject;
};

export const PlainDddObjectFactory = <K extends string>(kind: K) => withDddObject(kind, PlainBase);
