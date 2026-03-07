// import { type GetInstance, withSigilTyped } from '@vicin/sigil';
// import { DomainObject } from '../base';
// import type { DomainEventStatic, DomainEventInstance, DomainEventJson } from './types';
// import { IdValueObject, DateValueObject } from '../buildingBlocks/value-object';
// import type { Assert, Constructor } from '../../types';
// import { DomainResult } from '../../result';
// import { getConstructor } from '../helpers';

// type ConstructableDomainEvent = Constructor<
//   DomainEvent,
//   [aggregateId: IdValueObject<any>, occurredOn: DateValueObject<any>, version?: number | null]
// >;

// abstract class _DomainEvent extends DomainObject implements DomainEventInstance {
//   override get [Symbol.toStringTag]() {
//     return 'DomainEvent';
//   }

//   static override readonly domainType: 'Event' = 'Event';
//   override readonly domainType: 'Event' = 'Event';

//   public readonly occurredOn: DateValueObject<any>;
//   public readonly aggregateId: IdValueObject<any>;
//   public readonly version: number | null;

//   protected constructor(aggregateId: IdValueObject<any>, occurredOn: DateValueObject<any>, version?: number | null) {
//     super();
//     this.aggregateId = aggregateId;
//     this.occurredOn = occurredOn;
//     this.version = version ?? null;
//   }

//   static create<T extends DomainEventStatic>(this: T, ...args: any[]): GetInstance<T> {
//     throw new Error(
//       `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' didn't implement '.create()' static method yet`
//     );
//   }

//   static fromJSON<T extends DomainEventStatic, E>(this: T, json: DomainEventJson): DomainResult<GetInstance<T>, E> {
//     const aggregateIdResult = IdValueObject.from(json.aggregateId);
//     const occurredOnResult = DateValueObject.from(json.occurredOn);
//     return DomainResult.combineWith(aggregateIdResult, occurredOnResult).map(([aggregateId, occurredOn]) => {
//       return new (this as T & ConstructableDomainEvent)(
//         aggregateId,
//         occurredOn,
//         json.version
//       ) as unknown as GetInstance<T>;
//     }) as DomainResult<GetInstance<T>, E>;
//   }

//   static fromTrustedJSON<T extends DomainEventStatic, E>(this: T, json: DomainEventJson): GetInstance<T> {
//     const aggregateId = IdValueObject.fromTrusted(json.aggregateId);
//     const occurredOn = DateValueObject.fromTrusted(json.occurredOn);
//     return new (this as T & ConstructableDomainEvent)(
//       aggregateId,
//       occurredOn,
//       json.version
//     ) as unknown as GetInstance<T>;
//   }

//   /** Default JSON shape. Subclasses should override and call `super.toJSON()`. */
//   toJSON(): DomainEventJson {
//     return {
//       domainType: this.domainType,
//       eventLabel: this.getSigilEffectiveLabel(),
//       aggregateId: this.aggregateId.toJSON(),
//       occurredOn: this.occurredOn.toJSON(),
//       version: this.version ?? null,
//     };
//   }

//   clone<T>(this: T): T {
//     const t = this as _DomainEvent;
//     const ctor = getConstructor(t, 'DomainEvent', t.getSigilEffectiveLabel(), 'clone');
//     return new (ctor as any)(t.aggregateId.clone(), t.occurredOn.clone(), t.version);
//   }
// }

// export const DomainEvent = withSigilTyped(_DomainEvent, '@vicin/ddd-core.DomainEvent');
// export type DomainEvent = GetInstance<typeof DomainEvent>;

// type AssertStatic = Assert<typeof DomainEvent extends DomainEventStatic ? true : false>;
export {};
