import type { Message } from '../../message';
import {
  MiddlewareFactory,
  type MaybePromise,
  type MiddlewareContext,
  type UnknownObject,
} from '../../utils';

export const preTransformerMiddleware = <
  State extends UnknownObject,
  Input extends Message,
  Upstream extends Input,
  Errors,
>(
  factory: MiddlewareFactory<State>,
  label: string,
  fn: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<Upstream>,
  opts?: {
    guard?: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<boolean>;
    errorMapper?: (err: unknown, input: Input, ctx: MiddlewareContext<State>) => Errors;
  }
) => {
  return factory
    .fn(async (input: Input, next: (up: Upstream) => unknown, ctx) => {
      return await next(await fn(input, ctx));
    })
    .meta({ label, guard: opts?.guard, errorMapper: opts?.errorMapper });
};

export const preObserverMiddleware = <State extends UnknownObject, Input extends Message, Errors>(
  factory: MiddlewareFactory<State>,
  label: string,
  fn: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<void>,
  opts?: {
    guard?: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<boolean>;
    errorMapper?: (err: unknown, input: Input, ctx: MiddlewareContext<State>) => Errors;
  }
) => {
  return factory
    .fn(async (input: Input, next, ctx) => {
      await fn(input, ctx);
      return await next(input);
    })
    .meta({ label, guard: opts?.guard, errorMapper: opts?.errorMapper });
};

export const postTransformerMiddleware = <
  State extends UnknownObject,
  Input extends Message,
  Downstream,
  Out extends Downstream,
  Errors,
>(
  factory: MiddlewareFactory<State>,
  label: string,
  fn: (downstream: Downstream, input: Input, ctx: MiddlewareContext) => MaybePromise<Out>,
  opts?: {
    guard?: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<boolean>;
    errorMapper?: (err: unknown, input: Input, ctx: MiddlewareContext<State>) => Errors;
  }
) => {
  return factory
    .fn(async (input: Input, next: (up: Input) => Promise<Downstream>, ctx) => {
      return await fn(await next(input), input, ctx);
    })
    .meta({ label, guard: opts?.guard, errorMapper: opts?.errorMapper });
};

export const finallyObserverMiddleware = <I extends Message>(
  fn: (out: Result<unknown, unknown>, msg: I, ctx: MiddlewareContext) => void | Promise<void>,
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, ctx) => {
    try {
      const out = await next(msg);
      await fn(Result.ok(out), msg, ctx);
      return out;
    } catch (err: unknown) {
      await fn(Result.err(err), msg, ctx);
      throw err;
    }
  },
  { id: meta.id, name: meta.name ?? 'finallyObserver' },
];
