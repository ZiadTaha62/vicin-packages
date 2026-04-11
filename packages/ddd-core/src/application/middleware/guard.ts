import type { Message } from '../../message';
import type {
  MiddlewareFactory,
  MaybePromise,
  MiddlewareContext,
  UnknownObject,
} from '../../utils';

export const guardMiddleware = <State extends UnknownObject, Input extends Message, Errors>(
  factory: MiddlewareFactory<State>,
  label: string,
  check: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<boolean>,
  onFailure: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<Error>,
  opts?: {
    guard?: (input: Input, ctx: MiddlewareContext<State>) => MaybePromise<boolean>;
    errorMapper?: (err: unknown, input: Input, ctx: MiddlewareContext<State>) => Errors;
  }
) => {
  return factory
    .fn(async (input: Input, next, ctx) => {
      const passed = await check(input, ctx);

      if (!passed) {
        throw await onFailure(input, ctx);
      }

      return await next(input);
    })
    .meta({ label, guard: opts?.guard, errorMapper: opts?.errorMapper });
};
