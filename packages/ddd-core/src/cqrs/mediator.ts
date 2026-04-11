import {
  MarkObjectFactory,
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
  type ResultAsync,
} from '../utils';
import { CommandHandlerBase, type Command } from './command';
import { QueryHandlerBase, type Query } from './query';
import type { ApplicationErrorBase } from '../error';

const MarkObject = MarkObjectFactory('Mediator');
type MarkObject = InstanceType<typeof MarkObject>;

@AttachSigil('@vicin/ddd-core.MediatorBase')
export class MediatorBase extends MarkObject {
  declare [sigil]: ExtendSigil<'MediatorBase', MarkObject>;

  override get [Symbol.toStringTag]() {
    return 'Mediator';
  }

  private commandHandlers = new Map<Function, CommandHandlerBase<any, any>>();
  private queryHandlers = new Map<Function, QueryHandlerBase<any, any>>();

  registerCommandHandler<C extends Command, R, E extends ApplicationErrorBase>(
    commandType: new (...args: any[]) => C,
    handler: CommandHandlerBase<C, R, E>
  ): void {
    this.commandHandlers.set(commandType, handler);
  }

  registerQueryHandler<Q extends Query, R, E extends ApplicationErrorBase>(
    queryType: new (...args: any[]) => Q,
    handler: QueryHandlerBase<Q, R, E>
  ): void {
    this.queryHandlers.set(queryType, handler);
  }

  async send<C extends Command, R = void, E extends ApplicationErrorBase = ApplicationErrorBase>(
    command: C
  ): Promise<ResultAsync<R, E>> {
    const handler = this.commandHandlers.get(command.constructor);
    if (!handler) {
      throw new Error(
        `[DDD-core Error] No command handler registered for ${command.constructor.name}`
      );
    }
    return handler.execute(command) as any;
  }

  async query<Q extends Query, R = unknown, E extends ApplicationErrorBase = ApplicationErrorBase>(
    query: Q
  ): Promise<ResultAsync<R, E>> {
    const handler = this.queryHandlers.get(query.constructor);
    if (!handler) {
      throw new Error(`[DDD-core Error] No query handler registered for ${query.constructor.name}`);
    }
    return handler.execute(query) as any;
  }
}

export const Mediator = MarkFactory(MediatorBase);
export const mediator = markFactory(MediatorBase);
