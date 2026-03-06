import type { TraitsCore } from '../fields';
import type { PhantomCore } from '../phantom';
import type { ErrorType } from '../errors';
import type {
  Equals,
  HandleOriginalType,
  IfNever,
  IntersectOf,
  WithMetadata,
  WithoutMetadata,
} from './helpers';

/**
 * Trait API.
 *
 * Traits are additive capabilities that can be attached
 * or removed independently.
 */
export namespace TraitCore {
  /** Type guard for any trait. */
  export type Any = TraitsCore.Of<string | symbol>;

  /** Declare a trait */
  export type Declare<Tr extends string | symbol> = TraitsCore.Of<Tr>;

  /** Add a trait */
  export type Add<Tr extends Any, T> =
    T extends ErrorType<any> ? T : _Add<Tr, HandleOriginalType<T>>;

  /** Internal implementation of 'Trait.Add' */
  type _Add<Tr extends Any, T> = WithMetadata<
    T,
    TraitsCore.FromMap<
      IfNever<TraitsCore.TraitsOf<T>> & IfNever<TraitsCore.TraitsOf<Tr>>
    >
  >;

  /** Add multiple traits */
  export type AddMulti<Tr extends readonly Any[], T> =
    T extends ErrorType<any> ? T : _AddMulti<Tr, HandleOriginalType<T>>;

  /** Internal implementation of 'Trait.AddMulti' */
  type _AddMulti<Tr extends readonly Any[], T> = WithMetadata<
    T,
    TraitsCore.FromMap<
      IfNever<TraitsCore.TraitsOf<T>> &
        IfNever<TraitsCore.TraitsOf<IntersectOf<Tr[number]>>>
    >
  >;

  /** Remove a trait */
  export type Drop<Tr extends Any, T> =
    T extends ErrorType<any> ? T : _Drop<Tr, HandleOriginalType<T>>;

  /** Internal implementation of 'Trait.Drop' */
  type _Drop<Tr extends Any, T> =
    Equals<TraitsCore.TraitKeysOf<Tr>, TraitsCore.TraitKeysOf<T>> extends true
      ? Equals<
          keyof PhantomCore.PhantomOf<T>,
          '__OriginalType' | '__Traits'
        > extends true
        ? PhantomCore.StripPhantom<T>
        : WithoutMetadata<T, '__Traits'>
      : WithMetadata<
          T,
          TraitsCore.FromMap<
            Omit<TraitsCore.TraitsOf<T>, TraitsCore.TraitKeysOf<Tr>>
          >
        >;

  /** Remove multiple traits */
  export type DropMulti<Tr extends readonly Any[], T> =
    T extends ErrorType<any> ? T : _DropMulti<Tr, HandleOriginalType<T>>;

  /** Internal implementation of 'Trait.DropMulti' */
  type _DropMulti<Tr extends readonly Any[], T> =
    Equals<
      TraitsCore.TraitKeysOf<IntersectOf<Tr[number]>>,
      TraitsCore.TraitKeysOf<T>
    > extends true
      ? Equals<
          keyof PhantomCore.PhantomOf<T>,
          '__OriginalType' | '__Traits'
        > extends true
        ? PhantomCore.StripPhantom<T>
        : WithoutMetadata<T, '__Traits'>
      : WithMetadata<
          T,
          TraitsCore.FromMap<
            Omit<
              TraitsCore.TraitsOf<T>,
              TraitsCore.TraitKeysOf<IntersectOf<Tr[number]>>
            >
          >
        >;

  /** Check whether value has trait */
  export type HasTrait<T, Tr extends Any> = T extends Tr ? true : false;
}
