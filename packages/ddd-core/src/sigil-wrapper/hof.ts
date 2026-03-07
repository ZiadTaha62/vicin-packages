// import { withSigilTyped, type SigilOptions } from '@vicin/sigil';
// import type { ValueObjectStatic, EntityStatic, EntityStaticProps } from '../core';
// import type { AggregateRootStatic, AggregateRootStaticProps } from '../core/aggregate-root';

// export function withValueObject<VO extends Function & ValueObjectStatic, L extends string>(
//   vo: VO,
//   label: L,
//   opts?: SigilOptions
// ) {
//   if (vo.domainType !== 'ValueObject')
//     throw new Error("[@vicin/ddd-core] 'withValueObject' HOF can only be used on value-objects");
//   return withSigilTyped(vo, label, opts);
// }

// export function withEntity<E extends Function & EntityStatic<any>, L extends string>(
//   entity: E,
//   label: L,
//   props: EntityStaticProps,
//   opts?: SigilOptions
// ) {
//   if (entity.domainType !== 'Entity')
//     throw new Error("[@vicin/ddd-core] 'withEntity' HOF can only be used on entities");
//   Object.defineProperty(entity, 'StaticProps', {
//     value: props,
//     writable: false,
//     configurable: false,
//   });
//   return withSigilTyped(entity, label, opts);
// }

// export function withAggregateRoot<A extends Function & AggregateRootStatic<any>, L extends string>(
//   entity: A,
//   label: L,
//   props: AggregateRootStaticProps,
//   opts?: SigilOptions
// ) {
//   if (entity.domainType !== 'AggregateRoot')
//     throw new Error("[@vicin/ddd-core] 'withAggregateRoot' HOF can only be used on aggregate roots");
//   Object.defineProperty(entity, 'StaticProps', {
//     value: props,
//     writable: false,
//     configurable: false,
//   });
//   return withSigilTyped(entity, label, opts);
// }
