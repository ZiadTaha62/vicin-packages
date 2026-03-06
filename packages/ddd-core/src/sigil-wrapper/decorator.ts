import { WithSigil, type SigilOptions } from '@vicin/sigil-core';
import { ValueObject, Entity } from '../core';
import type { AggregateRootStatic } from '../core/aggregate-root';

export function WithValueObject<L extends string>(label: L, opts?: SigilOptions) {
  return function (target: typeof ValueObject<any, any>, context: any) {
    if (target.domainType !== 'ValueObject')
      throw new Error(
        "[@vicin/ddd-core] 'WithValueObject' decorator can only be used on value-objects"
      );
    return WithSigil(label, opts)(target as any, context);
  };
}

export function WithEntity<L extends string>(
  label: L,
  props: EntityStaticProps,
  opts?: SigilOptions
) {
  return function (target: Entity<any>, context: any) {
    if (target.domainType !== 'Entity')
      throw new Error("[@vicin/ddd-core] 'WithEntity' decorator can only be used on entities");
    Object.defineProperty(target, 'StaticProps', {
      value: props,
      writable: false,
      configurable: false,
    });
    return WithSigil(label, opts)(target as any, context);
  };
}

export function WithAggregateRoot<L extends string>(
  label: L,
  props: EntityStaticProps,
  opts?: SigilOptions
) {
  return function (target: AggregateRootStatic<any>, context: any) {
    if (target.domainType !== 'AggregateRoot')
      throw new Error(
        "[@vicin/ddd-core] 'WithAggregateRoot' decorator can only be used on aggregate roots"
      );
    Object.defineProperty(target, 'StaticProps', {
      value: props,
      writable: false,
      configurable: false,
    });
    return WithSigil(label, opts)(target as any, context);
  };
}
