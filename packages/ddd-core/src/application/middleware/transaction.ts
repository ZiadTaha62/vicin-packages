import type { Middleware, MiddlewareMetadata, Message } from '../../message';
import type { UnitOfWorkI } from '../infra-interfaces';

export const transactionMiddleware = <I extends Message>(
  uow: UnitOfWorkI,
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, _ctx) => {
    return uow.run(async () => {
      return next(msg);
    });
  },
  { id: meta.id, name: meta.name ?? 'Transaction' },
];
