import type { PhantomCore } from '../phantom';

/** --------------------------------------
 * PhantomCore type helpers
 * --------------------------------------- */

/**
 * Attach or override phantom metadata while preserving
 * the original runtime type.
 */
export type WithMetadata<
  T,
  Change extends object,
> = PhantomCore.StripPhantom<T> & {
  __Phantom: Prettify<
    Merge<
      IfNever<PhantomCore.PhantomOf<T>>,
      Omit<IfNever<PhantomCore.PhantomOf<Change>>, '__Base'> & SetType<T>
    >
  >;
};

/**
 * Patch phantom metadata without touching the original type.
 * Used when mutating metadata declarations themselves.
 */
export type PatchMetadata<T, Change extends object> = {
  __Phantom: Prettify<
    Merge<
      IfNever<PhantomCore.PhantomOf<T>>,
      IfNever<PhantomCore.PhantomOf<Change>>
    >
  >;
};

/**
 * Remove a metadata dimension while preserving the original type.
 */
export type WithoutMetadata<
  T,
  S extends string,
> = PhantomCore.StripPhantom<T> & {
  __Phantom: Prettify<Omit<IfNever<PhantomCore.PhantomOf<T>>, S> & SetType<T>>;
};

/**
 * Remove metadata without preserving original type information.
 * Intended for internal cleanup.
 */
export type StripMetadata<T, S extends string> = {
  __Phantom: Prettify<Omit<IfNever<PhantomCore.PhantomOf<T>>, S>>;
};

/**
 * Update '__OriginalType' if the passed type is changed.
 */
export type HandleOriginalType<T> =
  Equals<
    Omit<PhantomCore.StripPhantom<T>, never>,
    Omit<T, '__Phantom'>
  > extends true
    ? T
    : Omit<T, '__Phantom'> &
        PatchMetadata<
          T,
          {
            __Phantom: {
              __OriginalType?: Omit<T, '__Phantom'>;
            };
          }
        >;

/**
 * Attaches or updates the original runtime type metadata
 * for a nominal value.
 *
 * If the type already carries an `__OriginalType`, it is preserved.
 * Otherwise, the provided type is stored as the original type.
 *
 * This is used to maintain a stable runtime type while layering
 * additional phantom metadata.
 */
type SetType<T> = T extends { __Phantom: { __OriginalType?: infer O } }
  ? { __OriginalType?: O }
  : { __OriginalType?: T };

/** --------------------------------------
 * Generic helpers
 * --------------------------------------- */

/** Prettify type */
export type Prettify<T> = {
  [K in keyof T]: K extends '__Phantom' | '__Traits' ? Prettify<T[K]> : T[K];
} & {};

/** Check equality and returns true or false */
export type Equals<A1 extends any, A2 extends any> =
  (<A>() => A extends A2 ? true : false) extends <A>() => A extends A1
    ? true
    : false
    ? true
    : false;

/** Type to replace 'never' with another type */
export type IfNever<T, R = {}> = [T] extends [never] ? R : T;

/** Get intersection from union */
export type IntersectOf<U extends any> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/** Merge two objects. if matching keys between the two exists, the second object key value is used.  */
type Merge<O1 extends object, O2 extends object> = Prettify<
  Omit<O1, keyof O2> & O2
>;
