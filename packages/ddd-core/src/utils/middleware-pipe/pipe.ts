import { TypedMap } from '../typed-classes';
import type { Middleware, MiddlewareContext, MiddlewareMetadata, GlobalErrorMapper } from './types';
import { MiddlewarePipeHistory } from './history';
import { MiddlewarePipeError, ExternalError, MappedError, ProcessedError } from './error';
import type { CombineObject, Status, MaybePromise, UnknownObject } from '../types';

export class MiddlewarePipe<
  In = unknown,
  Upstream extends In = In,
  Downstream = unknown,
  Out extends Downstream = Downstream,
  Errors = never,
  State extends UnknownObject = UnknownObject,
> {
  protected constructor(
    public readonly label: string,
    protected readonly middlewares: ReadonlyArray<Middleware<any, any, any, any, any, any>> = [],
    public readonly state: TypedMap<State> = new TypedMap() as TypedMap<State>,
    protected readonly globalErrorMapper?: GlobalErrorMapper<Errors, State>
  ) {}

  static create<Input, Downstream, State extends UnknownObject = {}>(
    label: string
  ): MiddlewarePipe<Input, Input, Downstream, Downstream, never, State> {
    return new MiddlewarePipe(label);
  }

  setState<NewState extends UnknownObject>(
    state: NewState
  ): MiddlewarePipe<In, Upstream, Downstream, Out, Errors, CombineObject<State, NewState>> {
    const map = new TypedMap<CombineObject<State, NewState>>([
      ...this.state,
      ...Object.entries(state),
    ]);

    return new MiddlewarePipe<
      In,
      Upstream,
      Downstream,
      Out,
      Errors,
      CombineObject<State, NewState>
    >(this.label, this.middlewares, map, this.globalErrorMapper as any);
  }

  setGlobalErrorMapper<NewErrors>(
    mapper: GlobalErrorMapper<NewErrors, State>
  ): MiddlewarePipe<In, Upstream, Downstream, Out, NewErrors | Errors, State> {
    if (this.globalErrorMapper) {
      throw new MiddlewarePipeError(
        `[DDD-core Error] Global error mapper can not be overriden in pipe ${this.label}`
      );
    }

    return new MiddlewarePipe<In, Upstream, Downstream, Out, NewErrors | Errors, State>(
      this.label,
      [...this.middlewares],
      this.state,
      mapper
    );
  }

  use<
    NewUpstream extends Upstream,
    NewOut extends Downstream,
    NewErrors,
    NewState extends UnknownObject,
  >(
    mw: Middleware<Upstream, NewUpstream, Downstream, NewOut, NewErrors, NewState>
  ): MiddlewarePipe<
    In,
    Upstream & NewUpstream,
    Downstream,
    Out & NewOut,
    Errors | NewErrors,
    CombineObject<State, NewState>
  > {
    return new MiddlewarePipe<
      In,
      Upstream & NewUpstream,
      Downstream,
      Out & NewOut,
      Errors | NewErrors,
      CombineObject<State, NewState>
    >(
      this.label,
      [...this.middlewares, mw],
      this.state as unknown as TypedMap<CombineObject<State, NewState>>, // only cast left (unavoidable)
      this.globalErrorMapper as unknown as GlobalErrorMapper<
        Errors | NewErrors,
        CombineObject<State, NewState>
      >
    );
  }

  compose<
    NewUpstream extends Upstream,
    NewOut extends Downstream,
    NewErrors,
    NewState extends UnknownObject,
  >(
    otherBus: MiddlewarePipe<Upstream, NewUpstream, Downstream, NewOut, NewErrors, NewState>,
    globalErrorMapper?: GlobalErrorMapper<Errors | NewErrors, CombineObject<State, NewState>>
  ): MiddlewarePipe<
    In,
    Upstream & NewUpstream,
    Downstream,
    Out & NewOut,
    Errors | NewErrors,
    CombineObject<State, NewState>
  > {
    return new MiddlewarePipe<
      In,
      Upstream & NewUpstream,
      Downstream,
      Out & NewOut,
      Errors | NewErrors,
      CombineObject<State, NewState>
    >(
      `${this.label}::${otherBus.label}`,
      [...this.middlewares, ...otherBus.middlewares],
      new TypedMap<CombineObject<State, NewState>>([...this.state, ...otherBus.state]),
      (globalErrorMapper as any) ?? this.globalErrorMapper
    );
  }

  describe(): string[] {
    return this.middlewares.map((m) => m.meta.label);
  }

  async execute<T extends Downstream>(
    input: In,
    handler: (current: Upstream, ctx: MiddlewareContext<State>) => MaybePromise<T>,
    opts?: {
      signal?: AbortSignal;
      onUpstream?: (
        input: In,
        mw: MiddlewareMetadata<any, any>,
        ctx: MiddlewareContext<State>
      ) => MaybePromise<void>;
      onDownstream?: (
        result: Downstream,
        mw: MiddlewareMetadata<any, any>,
        ctx: MiddlewareContext<State>
      ) => MaybePromise<void>;
    }
  ): Promise<
    Status<
      { result: T & Out; upstream: Upstream; ctx: MiddlewareContext<State> },
      { error: Errors; ctx: MiddlewareContext<State> }
    >
  > {
    // ------------------
    // Destructure passed options
    // ------------------

    const { signal, onUpstream, onDownstream } = opts ?? {};

    // ------------------
    // Init ctx
    // ------------------

    const history = new MiddlewarePipeHistory(this.middlewares);

    const ctx: MiddlewareContext<State> = {
      pipeLabel: this.label,
      history,
      state: new TypedMap(this.state),
    };

    // ------------------
    // Create dispatch function for middlewares
    // ------------------

    // Index to ensure that each middlewere is executed and only once
    let index = -1;

    /** Var to lift last upstream from dispatch function */
    let liftedUpstream: Upstream;

    const dispatch = async (i: number, upstream: In | Upstream): Promise<Out> => {
      if (i <= index) {
        throw new MiddlewarePipeError(
          `[DDD-core Error] 'next()' called multiple times in one of middlewares of mw pipe '${this.label}'`
        );
      }

      try {
        // Break cycle if aborted
        signal?.throwIfAborted();
      } catch (err) {
        throw new ExternalError(err);
      }

      index = i;
      const mw = this.middlewares[i];

      if (!mw) {
        try {
          liftedUpstream = upstream as Upstream;
          return (await handler(upstream as Upstream, ctx)) as any;
        } catch (err) {
          throw new ExternalError(err);
        }
      }

      const { fn, meta } = mw;

      if (meta.guard && !(await meta.guard(upstream, ctx))) {
        return await dispatch(i + 1, upstream);
      }

      const next = async (upstream: Upstream): Promise<Out> => {
        try {
          // Break upStream if aborted
          signal?.throwIfAborted();

          history.add('pre', upstream, meta);
          if (onUpstream) await onUpstream(upstream, meta, ctx);
        } catch (err) {
          throw new ExternalError(err);
        }

        const result = await dispatch(i + 1, upstream);

        try {
          // Break downstream if aborted
          signal?.throwIfAborted();

          history.add('post', result, meta);
          if (onDownstream) await onDownstream(result, meta, ctx);
        } catch (err) {
          throw new ExternalError(err);
        }

        return result;
      };

      try {
        return await fn(upstream, next, ctx);
      } catch (err) {
        // If already handled in previous layer skip
        if (err instanceof ProcessedError) throw err;

        // Handle error and wrap it in ProcessedError so only one layer handle it before globalErrorMapper
        try {
          if (err instanceof ExternalError) throw err;

          if (meta.errorMapper) {
            throw new MappedError(meta.errorMapper(err, upstream, ctx));
          }

          throw err;
        } catch (processedError) {
          throw new ProcessedError(processedError);
        }
      }
    };

    // ------------------
    // Handle result promises
    // ------------------

    const resultPromise = (async () => {
      const result = await dispatch(0, input);
      return { result: result as T & Out, upstream: liftedUpstream!, ctx };
    })();

    let onAbort: () => void;
    let settled = false;
    const abortPromise = new Promise<never>((res, rej) => {
      if (settled) return;

      onAbort = () => {
        rej(signal?.reason);
      };
      signal?.addEventListener('abort', onAbort, { once: true });
    });

    const promise = Promise.race([resultPromise, abortPromise]).then(
      (val) => {
        settled = true;
        signal?.removeEventListener('abort', onAbort);
        return val;
      },
      (err) => {
        settled = true;
        signal?.removeEventListener('abort', onAbort);
        throw err;
      }
    );

    try {
      const result = await promise;
      return { status: true, ...result };
    } catch (err) {
      let unprocessed = err;
      while (unprocessed instanceof ProcessedError) {
        unprocessed = unprocessed.reason;
      }

      if (unprocessed instanceof ExternalError) {
        throw unprocessed.reason;
      }

      if (unprocessed instanceof MappedError) {
        return { status: false, error: unprocessed.reason as Errors, ctx };
      }

      const mapper = this.globalErrorMapper ?? ((err: unknown) => err as Errors);
      return { status: false, error: mapper(unprocessed, ctx), ctx };
    }
  }
}
