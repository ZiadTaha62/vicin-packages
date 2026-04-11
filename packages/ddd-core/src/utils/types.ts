export type Prettify<T extends object> = { [K in keyof T]: T[K] } & {};

export type CombineObject<O1 extends object, O2 extends object> = Prettify<Omit<O1, keyof O2> & O2>;

export type Status<T extends object, E extends object> =
  | Prettify<{ status: true } & T>
  | Prettify<{ status: false } & E>;

export type MaybePromise<T> = Promise<T> | T;

export type UnknownObject = { [k: string]: unknown };
