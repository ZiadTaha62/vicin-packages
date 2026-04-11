import type { ResultAsync } from 'neverthrow';
import type { Message, MiddlewareContext, Middleware, MiddlewareMetadata } from '../../message';
import type { Result } from '../../utils';

type Validator = <E>(
  msg: Message,
  ctx: MiddlewareContext
) => Result<void, E> | ResultAsync<void, E>;

export const validationMiddleware = <I extends Message>(
  validator: Validator,
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, ctx) => {
    const out = await validator(msg, ctx);
    if (out.isErr()) throw out.error;
    return next(msg);
  },
  { id: meta.id, name: meta.name ?? 'Validation' },
];
