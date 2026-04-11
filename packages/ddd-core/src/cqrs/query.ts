import { MarkFactory, markFactory, type sigil, type ExtendSigil, type ResultAsync } from '../utils';
import { isErrorObject, type ErrorObject } from '../error';
import { ApplicationService, ApplicationServiceBase } from '../application/general';
import type { Message, MessagePayload } from '../message';

export type QueryPayload = MessagePayload;

export interface Query<TPayload extends QueryPayload = QueryPayload> extends Message<TPayload> {
  readonly kind: 'query';
}

@ApplicationService('@vicin/ddd-core.QueryHandlerBase')
export abstract class QueryHandlerBase<
  Qry extends Query = Query,
  Res = unknown,
  E extends ErrorObject = ErrorObject,
> extends ApplicationServiceBase {
  declare [sigil]: ExtendSigil<'QueryHandlerBase', ApplicationServiceBase>;

  override get [Symbol.toStringTag]() {
    return 'QueryHandlerBase';
  }

  abstract run(command: Qry): ResultAsync<Res, E>;

  execute(query: Qry): ResultAsync<Res, E> {
    return this.ResultAsync.fromPromise(
      this.inTransaction(
        async () => (await this.run(query))._unsafeUnwrap() // Throw if error to trigger rollback when error is returned
      ),
      (e: unknown) => {
        if (isErrorObject(e)) return e as E; // if already DddCore error return it directly
        return this.mapUnexpectedError(e) as E; // Map unexpecter error to ApplicationError
      }
    );
  }
}

export const QueryHandler = MarkFactory(QueryHandlerBase);
export const queryHandler = markFactory(QueryHandlerBase);
