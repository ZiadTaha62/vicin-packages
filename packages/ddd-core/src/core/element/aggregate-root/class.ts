// import { type GetInstance, withSigilTyped } from '@vicin/sigil';
// import type { DomainEvent } from '../event';
// import type {
//   AggregateRootStatic,
//   AggregateRootInstance,
//   AggregateRootStaticProps,
//   AggregateRootStaticToInstanceProps,
//   AggregateRootJson,
//   AggregateRootStaticPropsValue,
// } from './types';
// import { DomainObject } from '../base';
// import { DomainResult } from '../../result';
// import type { Assert, Constructor } from '../../types';
// import type { ValueObjectRawType } from '../value-object';
// import { getConstructor } from '../../helpers';

// abstract class _AggregateRoot<
//   StaticProps extends AggregateRootStaticProps,
//   InstanceProps extends AggregateRootStaticToInstanceProps<StaticProps> =
//     AggregateRootStaticToInstanceProps<StaticProps>,
// >
//   extends DomainObject
//   implements AggregateRootInstance<InstanceProps>
// {
//   override get [Symbol.toStringTag]() {
//     return 'DomainAggregateRoot';
//   }

//   static override readonly domainType: 'AggregateRoot' = 'AggregateRoot';
//   override readonly domainType: 'AggregateRoot' = 'AggregateRoot';

//   static readonly StaticProps: AggregateRootStaticProps;

//   public readonly id: InstanceProps['id'];
//   protected readonly props: InstanceProps;

//   private domainEvents: DomainEvent[] = [];

//   protected constructor(props: InstanceProps) {
//     super();
//     this.id = props.id as InstanceProps['id'];
//     this.props = props;
//   }

//   static create<T extends AggregateRootStatic<any>>(this: T, ...args: any[]): DomainResult<GetInstance<T>, unknown> {
//     throw new Error(
//       `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' didn't implement '.create()' static method yet`
//     );
//   }

//   static reconstitute<
//     T extends AggregateRootStatic<any>,
//     P extends AggregateRootStaticToInstanceProps<T['StaticProps']> = AggregateRootStaticToInstanceProps<
//       T['StaticProps']
//     >,
//   >(this: T, props: P): GetInstance<T> {
//     return new (this as T & Constructor<AggregateRootInstance<P>>)(props) as unknown as GetInstance<T>;
//   }

//   static fromJSON<T extends AggregateRootStatic<any>>(
//     this: T,
//     json: AggregateRootJson<AggregateRootStaticToInstanceProps<T['StaticProps']>>
//   ): DomainResult<GetInstance<T>, unknown> {
//     if (!this.StaticProps)
//       throw new Error(
//         `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' doesn't have '.StaticProps' property, make sure to call 'WithAggregateRoot' decorator or 'withAggregateRoot' HOF on it.`
//       );
//     const props: Record<string, any> = {};
//     for (const [k, v] of Object.entries(this.StaticProps)) {
//       const ctor = v as AggregateRootStaticPropsValue;
//       const jsonValue = json[k];
//       let result;
//       if (ctor.domainType === 'ValueObject') result = ctor.from(jsonValue);
//       else result = ctor.fromJSON(jsonValue!);
//       if (result.isErr()) return result;
//       props[k] = result.value;
//     }
//     return DomainResult.ok(this.reconstitute(props as any));
//   }

//   static fromTrustedJSON<T extends AggregateRootStatic<any>>(
//     this: T,
//     json: AggregateRootJson<AggregateRootStaticToInstanceProps<T['StaticProps']>>
//   ): GetInstance<T> {
//     if (!this.StaticProps)
//       throw new Error(
//         `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' doesn't have '.StaticProps' property, make sure to call 'WithAggregateRoot' decorator or 'withAggregateRoot' HOF on it.`
//       );
//     const props: Record<string, any> = {};
//     for (const [k, v] of Object.entries(this.StaticProps)) {
//       const ctor = v as AggregateRootStaticPropsValue;
//       const jsonValue = json[k];
//       let value;
//       if (ctor.domainType === 'ValueObject') value = ctor.fromTrusted(jsonValue);
//       else value = ctor.fromTrustedJSON(jsonValue!);
//       props[k] = value;
//     }
//     return this.reconstitute(props as any);
//   }

//   toId(): string {
//     return this.id.toId();
//   }

//   equals<T>(this: T, other: T): boolean {
//     if (!(this as _AggregateRoot<any>).isOfType(other)) return false;
//     return (this as _AggregateRoot<any>).id.equals((other as AggregateRoot<any>).id);
//   }

//   override toString(): string {
//     return JSON.stringify(this.toJSON());
//   }

//   toJSON(): AggregateRootJson<InstanceProps> {
//     const out: Record<string, ValueObjectRawType> = {};
//     for (const [k, v] of Object.entries(this.props)) out[k] = v.toJSON();
//     return out as AggregateRootJson<InstanceProps>;
//   }

//   clone<T>(this: T): T {
//     const t = this as _AggregateRoot<any>;
//     const ctor = getConstructor(t, 'AggregateRoot', t.getSigilEffectiveLabel(), 'clone');
//     const clonedProps: Record<string, any> = {};
//     for (const [k, v] of Object.entries(t.props)) clonedProps[k] = v.clone();
//     return new (ctor as any)(clonedProps);
//   }

//   //////////////////////////////
//   //////////////////////////////
//   //////////////////////////////
//   //////////////////////////////

//   protected addDomainEvent(event: DomainEvent): void {
//     this.domainEvents.push(event);
//   }
//   getDomainEvents(): DomainEvent[] {
//     return [...this.domainEvents];
//   }
//   clearDomainEvents(): void {
//     this.domainEvents = [];
//   }
// }

// export const AggregateRoot = withSigilTyped(_AggregateRoot, '@vicin/ddd-core.AggregateRoot');
// export type AggregateRoot<Props extends AggregateRootStaticProps> = GetInstance<typeof AggregateRoot<Props>>;

// type AssertStatic = Assert<typeof AggregateRoot<any> extends AggregateRootStatic<any> ? true : false>;
