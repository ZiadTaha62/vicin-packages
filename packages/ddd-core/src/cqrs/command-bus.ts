import type {} from './command-handler';
import { DddCoreDevError } from '../utils';
import type { Command } from './command';
import type { MessageMiddlewarePipeBase } from '../message';

export class CommandBus {
  private handlers = new Map<string, CommandHandler<any, any>>();

  constructor(private readonly pipeline: MessageMiddlewarePipeBase) {}

  register<C extends Command, R>(handler: CommandHandler<C, R>) {
    this.handlers.set(handler.messageType, handler);
  }

  async send<C extends Command, R = unknown>(command: C): Promise<R> {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      throw new DddCoreDevError(`No handler for command ${command.type}`);
    }

    return this.pipeline.execute(command, () => handler.handle(command));
  }
}
