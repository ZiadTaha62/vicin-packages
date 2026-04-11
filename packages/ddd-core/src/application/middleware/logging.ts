export const logMiddleware = <I extends Message>(
  logger: LoggerI<I>,
  before: (
    msg: I,
    ctx: MiddlewareContext
  ) => Promise<LogLevel | LogLevel[]> | LogLevel | LogLevel[] = () => [],
  after: (
    msg: I,
    ctx: MiddlewareContext
  ) => Promise<LogLevel | LogLevel[]> | LogLevel | LogLevel[] = () => [],
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, ctx) => {
    let levels: LogLevel[] | LogLevel;

    try {
      levels = await before(msg, ctx);
      if (!Array.isArray(levels)) levels = [levels];
      for (const l of levels) logger[l](msg);

      return await next(msg);
    } finally {
      levels = await after(msg, ctx);
      if (!Array.isArray(levels)) levels = [levels];
      for (const l of levels) logger[l](msg);
    }
  },
  { id: meta.id, name: meta.name ?? 'Log' },
];

export const logOutMiddleware = <I extends Message>(
  logger: LoggerI<unknown>,
  fn: (
    out: unknown,
    ctx: MiddlewareContext
  ) => Promise<LogLevel | LogLevel[]> | LogLevel | LogLevel[] = () => [],
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, ctx) => {
    const out = await next(msg);

    let levels = await fn(msg, ctx);
    if (!Array.isArray(levels)) levels = [levels];
    for (const l of levels) logger[l](out);

    return out;
  },
  { id: meta.id, name: meta.name ?? 'LogOut' },
];

import { MiddlewareFactory } from '../../utils/middleware-pipe/factory';
import type {
  MaybePromise,
  MiddlewareContext,
  UnknownObject,
} from '../../utils/middleware-pipe/types';

export const guardMiddleware = <State extends UnknownObject, Upstream, Errors>(
  factory: MiddlewareFactory<State>,
  label: string,
  check: (upStream: Upstream, ctx: MiddlewareContext<State>) => MaybePromise<boolean>,
  onFailure: (upStream: Upstream, ctx: MiddlewareContext<State>) => MaybePromise<Error>,
  opts?: {
    guard?: (upstream: Upstream, ctx: MiddlewareContext<State>) => MaybePromise<boolean>;
    errorMapper?: (err: unknown, upstream: Upstream, ctx: MiddlewareContext<State>) => Errors;
  }
) => {
  factory
    .fn(async (upstream: Upstream, next, ctx) => {
      const passed = await check(upstream, ctx);

      if (!passed) {
        throw await onFailure(upstream, ctx);
      }

      return await next(upstream);
    })
    .meta({ label, guard: opts?.guard, errorMapper: opts?.errorMapper });
};
