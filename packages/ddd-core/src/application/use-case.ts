import {
  MarkFactory,
  markFactory,
  AttachSigil,
  type sigil,
  type ExtendSigil,
  ResultAsync,
} from '../../utils';
import { type ErrorObject, isErrorObject } from '../../error';
import { ApplicationServiceBase } from './service';

@AttachSigil('@vicin/ddd-core.UseCaseBase')
export abstract class UseCaseBase<
  Input,
  Output,
  E extends ErrorObject = ErrorObject,
> extends ApplicationServiceBase {
  declare [sigil]: ExtendSigil<'UseCaseBase', ApplicationServiceBase>;

  override get [Symbol.toStringTag]() {
    return 'UseCase';
  }

  protected abstract run(input: Input): ResultAsync<Output, E>;

  execute(input: Input): ResultAsync<Output, E> {
    return this.ResultAsync.fromPromise(
      this.inTransaction(
        async () => (await this.run(input))._unsafeUnwrap() // Throw if error to trigger rollback when error is returned
      ),
      (e: unknown) => {
        if (isErrorObject(e)) return e as E; // if already DddCore error return it directly
        return this.mapUnexpectedError(e) as E; // Map unexpecter error to ApplicationError
      }
    );
  }
}

export const UseCase = MarkFactory(UseCaseBase);
export const useCase = markFactory(UseCaseBase);
