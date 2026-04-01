import { withStateObject, type StateObject, type StateObjectStatic } from './state-object';
import { AttachSigil, type sigil, type ExtendSigil } from '../utils';
import { DddCore, DddCoreError } from '../ddd-core';
import type { ObjectKind } from '../registry';

export interface IdentityObjectStatic<
  Kind extends string = string,
> extends StateObjectStatic<Kind> {
  new (...args: any[]): IdentityObject<Kind>;
}

export interface IdentityObject<Kind extends string = string> extends StateObject<Kind> {
  toId(): string;
}

export const withIdentityObject = <
  C extends new (...args: any[]) => any,
  L extends string,
  K extends string,
>(
  clazz: C,
  label: L,
  kind: K
) => {
  const StateObject = withStateObject(clazz, label, kind);

  @AttachSigil('@vicin/ddd-core.IdentityObject')
  // @ts-expect-error Unknown error cause, every thing should be fine :)
  abstract class IdentityObject extends StateObject {
    declare [sigil]: ExtendSigil<'IdentityObject', InstanceType<typeof StateObject>>;

    get [Symbol.toStringTag]() {
      return 'IdentityObject';
    }

    static override objectKind: ObjectKind = 'identity';

    abstract toId(): string;

    equals(other: this): boolean {
      if (!this.isInstance(other)) return false;
      return this.toId() === other.toId();
    }
  }

  return IdentityObject as typeof IdentityObject & typeof StateObject;
};

export const IdentityObjectFactory = <K extends string>(kind: K) =>
  withIdentityObject(DddCore, '@vicin/ddd-core.DddCore' as 'DddCore', kind);

export const IdentityErrorObjectFactory = <K extends string>(kind: K) =>
  withIdentityObject(DddCoreError, '@vicin/ddd-core.DddCoreError' as 'DddCoreError', kind);
