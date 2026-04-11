import { MarkFactory, markFactory, type sigil, type ExtendSigil, type ResultAsync } from '../utils';
import { ApplicationServiceBase, ApplicationService } from '../application/general';
import { isErrorObject, type ErrorObject } from '../error';
import type { Command } from './command';

@ApplicationService('@vicin/ddd-core.CommandHandlerBase')
export abstract class CommandHandlerBase<
  Com extends Command,
  Res = void,
  E extends ErrorObject = ErrorObject,
> extends ApplicationServiceBase {
  declare [sigil]: ExtendSigil<'CommandHandlerBase', ApplicationServiceBase>;

  override get [Symbol.toStringTag]() {
    return 'CommandHandler';
  }

  abstract messageType: Com['type'];

  abstract run(command: Com): ResultAsync<Res, E>;

  handle(command: Com): ResultAsync<Res, ErrorObject> {
    return this.ResultAsync.fromPromise(
      this.inTransaction(
        async () => (await this.run(command))._unsafeUnwrap() // Throw if error to trigger rollback when error is returned
      ),
      (e: unknown) => {
        if (isErrorObject(e)) return e as E; // if already DddCore error return it directly
        return this.mapUnexpectedError(e) as E; // Map unexpecter error to ApplicationError
      }
    );
  }
}

export const CommandHandler = MarkFactory(CommandHandlerBase);
export const commandHandler = markFactory(CommandHandlerBase);
