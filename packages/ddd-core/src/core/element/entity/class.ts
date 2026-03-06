import { WithSigil, type sigil, type ExtendSigil } from '@vicin/sigil';
import { DomainObject } from '../base';
import { DomainResult } from '../../result';

@WithSigil('@vicin/ddd-core.Entity')
export abstract class Entity extends DomainObject {
  declare [sigil]: ExtendSigil<'Entity', DomainObject>;

  override get [Symbol.toStringTag]() {
    return 'DomainEntity';
  }

  static override readonly domainType: 'Entity' = 'Entity';
  override readonly domainType: 'Entity' = 'Entity';

  public readonly id: InstanceProps['id'];
  protected readonly props: InstanceProps;

  protected constructor(props: InstanceProps) {
    super();
    this.id = props.id as InstanceProps['id'];
    this.props = props;
  }

  static create<T extends EntityStatic<any>>(this: T, ...args: any[]): DomainResult<GetInstance<T>, unknown> {
    throw new Error(
      `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' didn't implement '.create()' static method yet`
    );
  }

  static reconstitute<
    T extends EntityStatic<any>,
    P extends EntityStaticToInstanceProps<T['StaticProps']> = EntityStaticToInstanceProps<T['StaticProps']>,
  >(this: T, props: P): GetInstance<T> {
    return new (this as T & Constructor<EntityInstance<P>>)(props) as unknown as GetInstance<T>;
  }

  static fromJSON<T extends EntityStatic<any>>(
    this: T,
    json: EntityJson<EntityStaticToInstanceProps<T['StaticProps']>>
  ): DomainResult<GetInstance<T>, unknown> {
    if (!this.StaticProps)
      throw new Error(
        `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' doesn't have '.StaticProps' property, make sure to call 'WithEntity' decorator or 'withEntity' HOF on it.`
      );
    const props: Record<string, any> = {};
    for (const [k, v] of Object.entries(this.StaticProps)) {
      const ctor = v as EntityStaticPropsValue;
      const jsonValue = json[k];
      const result = ctor.from(jsonValue);
      if (result.isErr()) return result;
      props[k] = result.value;
    }
    return DomainResult.ok(this.reconstitute(props as any));
  }

  static fromTrustedJSON<T extends EntityStatic<any>>(
    this: T,
    json: EntityJson<EntityStaticToInstanceProps<T['StaticProps']>>
  ): GetInstance<T> {
    if (!this.StaticProps)
      throw new Error(
        `[@vicin/ddd-core] Class '${(this as any).name}' with label '${this.SigilEffectiveLabel}' doesn't have '.StaticProps' property, make sure to call 'WithEntity' decorator or 'withEntity' HOF on it.`
      );
    const props: Record<string, any> = {};
    for (const [k, v] of Object.entries(this.StaticProps)) {
      const ctor = v as EntityStaticPropsValue;
      const jsonValue = json[k];
      const value = ctor.fromTrusted(jsonValue);
      props[k] = value;
    }
    return this.reconstitute(props as any);
  }

  /** Method to return string id of the id value-object. */
  toId(): string {
    return this.id.toId();
  }

  /** Method to check if two entities are equal by comparing there ids. */
  equals<T>(this: T, other: T): boolean {
    if (!(this as _Entity<any>).isOfType(other)) return false;
    return (this as _Entity<any>).id.equals((other as Entity<any>).id);
  }

  /** Serialize object into string. */
  override toString(): string {
    return JSON.stringify(this.toJSON());
  }

  /** Serialize object into Json compatible value. */
  toJSON(): EntityJson<InstanceProps> {
    const out: Record<string, ValueObjectRawType> = {};
    for (const [k, v] of Object.entries(this.props)) out[k] = v.toJSON();
    return out as EntityJson<InstanceProps>;
  }

  clone<T>(this: T): T {
    const t = this as _Entity<any>;
    const ctor = getConstructor(t, 'Entity', t.getSigilEffectiveLabel(), 'clone');
    const clonedProps: Record<string, any> = {};
    for (const [k, v] of Object.entries(t.props)) clonedProps[k] = v.clone();
    return new (ctor as any)(clonedProps);
  }
}
