import {
  MiddlewareFactory,
  type MiddlewareContext,
  type UnknownObject,
  type MaybePromise,
} from '../../utils';
import type { Message } from '../../message';

export const exceptionFilterMiddleware = <
  State extends UnknownObject,
  Input extends Message,
  Out,
  Errors,
>(
  factory: MiddlewareFactory<State>,
  label: string,
  filterFn: (err: unknown, input: Input, ctx: MiddlewareContext<State>) => MaybePromise<Out>,
  opts?: {
    guard?: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<boolean>;
    errorMapper?: (err: unknown, input: Input, ctx: MiddlewareContext<State>) => Errors;
  }
) => {
  return factory
    .fn(async (input: Input, next, ctx) => {
      try {
        return await next(input);
      } catch (err) {
        return await filterFn(err, input, ctx);
      }
    })
    .meta({ label, guard: opts?.guard, errorMapper: opts?.errorMapper });
};
