import type {
  Middleware,
  MiddlewareFunction,
  MiddlewareMetadata,
  MiddlewareContext,
} from './types';
import type { UnknownObject, CombineObject } from '../types';

export class MiddlewareFactory<
  State extends UnknownObject = UnknownObject,
  Deps extends UnknownObject = UnknownObject,
> {
  private constructor(private readonly deps: Deps) {}

  /** Create a new factory (optionally with initial State type) */
  static create<State extends UnknownObject>() {
    return new MiddlewareFactory<State>({});
  }

  /** Set the State shape for middlewares created from this factory */
  withState<NewState extends UnknownObject>() {
    return new MiddlewareFactory<CombineObject<State, NewState>, Deps>(this.deps);
  }

  /** Inject dependencies (merges with previous ones) */
  withDeps<NewDeps extends UnknownObject>(newDeps: NewDeps) {
    const merged = { ...this.deps, ...newDeps } as CombineObject<Deps, NewDeps>;
    return new MiddlewareFactory<State, CombineObject<Deps, NewDeps>>(merged);
  }

  /** Create a middleware */
  fn<In, Upstream extends In, Downstream, Out extends Downstream>(
    implementation: (
      input: In,
      next: (upstream: Upstream) => Promise<Downstream>,
      ctx: MiddlewareContext<State>,
      deps: Deps
    ) => Promise<Out>
  ) {
    const wrappedFn: MiddlewareFunction<In, Upstream, Downstream, Out, State> = (
      input,
      next,
      ctx
    ) => implementation(input, next, ctx, this.deps);

    return {
      meta<Errors>(
        meta: MiddlewareMetadata<In, Errors, State>
      ): Middleware<In, Upstream, Downstream, Out, Errors, State> {
        return { fn: wrappedFn, meta };
      },
    };
  }
}
