import {
  PlainIdentityObjectFactory,
  MarkFactory,
  markFactory,
  type sigil,
  type ExtendSigil,
  generateId,
  TypedMap,
} from '../utils';

const IdentityObject = PlainIdentityObjectFactory('ExecutionScope');
type IdentityObject = InstanceType<typeof IdentityObject>;

export type ExecutionCache = {
  [k: string]: unknown;
};

export type ExecutionContext = {
  [k: string]: unknown;
};

export class ExecutionScope<
  Context extends ExecutionContext = ExecutionContext,
  Cache extends ExecutionCache = ExecutionCache,
> extends IdentityObject {
  declare [sigil]: ExtendSigil<'ExecutionScope', IdentityObject>;

  override get [Symbol.toStringTag]() {
    return 'ExecutionScope';
  }

  readonly context: Context;

  readonly cache: TypedMap<Cache>;

  readonly id: string;

  constructor(context: Context, props?: { id?: string; cache?: Cache }) {
    super();
    this.context = context;
    this.id = props?.id ?? generateId();
    this.cache = new TypedMap(Object.entries(props?.cache ?? ({} as Cache)));
  }

  getState() {
    return {
      id: this.id,
      context: this.context,
    };
  }

  toId(): string {
    return this.id;
  }
}

export const ExecutionScopeMark = MarkFactory(ExecutionScope);
export const executionScopeMark = markFactory(ExecutionScope);

// Mark current execution scope
executionScopeMark(ExecutionScope, '@vicin/ddd-core.ExecutionScope');
