import type { MiddlewarePipeHistory } from './history';
import type { TypedMap } from '../typed-classes';
import type { MaybePromise, UnknownObject } from '../types';

export type Middleware<
  In = unknown,
  Upstream extends In = In,
  Downstream = unknown,
  Out extends Downstream = Downstream,
  E = never,
  State extends UnknownObject = UnknownObject,
> = {
  fn: MiddlewareFunction<In, Upstream, Downstream, Out, State>;
  meta: MiddlewareMetadata<In, E, State>;
};

export type MiddlewareFunction<
  In = unknown,
  Upstream extends In = In,
  Downstream = unknown,
  Out extends Downstream = Downstream,
  State extends UnknownObject = UnknownObject,
> = (
  input: In,
  next: (upstream: Upstream) => Promise<Downstream>,
  ctx: MiddlewareContext<State>
) => Promise<Out>;

export interface MiddlewareMetadata<
  In = unknown,
  Errors = never,
  State extends UnknownObject = UnknownObject,
> {
  readonly label: string;
  readonly errorMapper?:
    | ((err: unknown, input: In, ctx: MiddlewareContext<State>) => Errors)
    | undefined;
  readonly guard?:
    | ((input: In, ctx: MiddlewareContext<State>) => MaybePromise<boolean>)
    | undefined;
}

export type MiddlewareContext<State extends UnknownObject = UnknownObject> = {
  readonly pipeLabel: string;
  readonly history: MiddlewarePipeHistory;
  readonly state: TypedMap<State>;
};

export type GlobalErrorMapper<Errors, State extends UnknownObject = UnknownObject> = (
  err: unknown,
  ctx: MiddlewareContext<State>
) => Errors;
