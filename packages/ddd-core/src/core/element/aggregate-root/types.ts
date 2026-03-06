import type { GetInstance } from '@vicin/sigil';
import type { DomainObjectStatic, DomainObjectInstance } from '../base';
import type { Entity } from '../entity';
import type { ValueObject, IdValueObject } from '../value-object';
import type { DomainResult } from '../../result';

/** ------------------------------
 *  Props
 * ------------------------------ */

export type AggregateRootStaticPropsValue = typeof ValueObject<any, any> | typeof Entity<any>;
export type AggregateRootStaticProps = Record<string, AggregateRootStaticPropsValue> & {
  id: typeof IdValueObject<any>;
};

export type AggregateRootInstancePropsValue = ValueObject<any, any> | Entity<any>;
export type AggregateRootInstanceProps = Record<string, AggregateRootInstancePropsValue> & {
  id: IdValueObject<any>;
};

export type AggregateRootStaticToInstanceProps<P extends AggregateRootStaticProps> = {
  [K in keyof P]: GetInstance<P[K]>;
} & {
  id: GetInstance<P['id']>;
};

/** ------------------------------
 *  Json
 * ------------------------------ */

export type AggregateRootJson<P extends AggregateRootInstanceProps> = {
  [K in keyof P]: ReturnType<P[K]['toJSON']>;
};

/** ------------------------------
 *  Class
 * ------------------------------ */

export interface AggregateRootStatic<P extends AggregateRootStaticProps> extends DomainObjectStatic {
  readonly domainType: 'AggregateRoot';

  readonly StaticProps: P;

  create<T extends AggregateRootStatic<any>>(this: T, ...args: any[]): DomainResult<GetInstance<T>, unknown>;

  reconstitute<T extends AggregateRootStatic<any>, Pr extends AggregateRootStaticToInstanceProps<P>>(
    this: T,
    props: Pr
  ): GetInstance<T>;

  fromJSON<T extends AggregateRootStatic<any>>(
    this: T,
    json: AggregateRootJson<AggregateRootStaticToInstanceProps<T['StaticProps']>>
  ): DomainResult<GetInstance<T>, unknown>;

  fromTrustedJSON<T extends AggregateRootStatic<any>>(
    this: T,
    json: AggregateRootJson<AggregateRootStaticToInstanceProps<T['StaticProps']>>
  ): GetInstance<T>;
}

export interface AggregateRootInstance<P extends AggregateRootInstanceProps> extends DomainObjectInstance {
  readonly domainType: 'AggregateRoot';

  readonly id: P['id'];

  equals<T>(this: T, other: T): boolean;

  toJSON(): AggregateRootJson<P>;

  toId(): string;

  clone<T>(this: T): T;
}
