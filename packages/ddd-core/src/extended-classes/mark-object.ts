import { Sigilify, type Sigil, AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { isMarkObject, type ObjectKind } from '../registry';
import { DddCore, DddCoreError } from '../ddd-core';

type SigilStatic = typeof Sigil;
export interface MarkObjectStatic<Kind extends string = string> extends SigilStatic {
  new (...args: any[]): MarkObject<Kind>;
  kind: Kind;
}
export interface MarkObject<Kind extends string = string> extends Sigil {
  kind: Kind;
}

export const withMarkObject = <
  C extends new (...args: any[]) => any,
  L extends string,
  K extends string,
>(
  clazz: C,
  label: L,
  kind: K
) => {
  const Sigilified = Sigilify(clazz, label);

  @AttachSigil('@vicin/ddd-core.MarkObject')
  abstract class MarkObject extends Sigilified {
    declare [sigil]: ExtendSigil<'MarkObject', InstanceType<typeof Sigilified>>;

    get [Symbol.toStringTag]() {
      return 'MarkObject';
    }

    static objectKind: ObjectKind = 'mark';

    static kind: K = kind;
    get kind(): K {
      return kind;
    }

    constructor(...args: any[]) {
      super(...args);
      if (!isMarkObject(this)) {
        throw new Error(
          `[DDD-core Error] Class ${this.constructor.name} is not marked, must use one of the decorators (ValueObject, Entity, AggregateRoot, Event, etc...)`
        );
      }
    }
  }

  return MarkObject as typeof Sigilified & typeof MarkObject;
};

export const MarkObjectFactory = <K extends string>(kind: K) =>
  withMarkObject(DddCore, '@vicin/ddd-core.DddCore' as 'DddCore', kind);

export const MarkErrorObjectFactory = <K extends string>(kind: K) =>
  withMarkObject(DddCoreError, '@vicin/ddd-core.DddCoreError' as 'DddCoreError', kind);
