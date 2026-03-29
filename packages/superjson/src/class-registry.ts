import { Registry } from './registry.js';
import type { Class, SuperJSONValue, JSONValue } from './types.js';

type NonRecursiveCustomTransformation<I = unknown, O extends JSONValue = JSONValue> = {
  serialize: (v: I) => O;
  deserialize: (v: O) => I;
  recursive?: false;
};

type RecursiveCustomTransformation<I = unknown, O extends SuperJSONValue = SuperJSONValue> = {
  serialize: (v: I) => O;
  deserialize: (v: O) => I;
  recursive: true;
};

type AnyCustomTransformation = NonRecursiveCustomTransformation | RecursiveCustomTransformation;

export interface RegisterOptions {
  identifier?: string;
  allowProps?: string[];
  custom?: AnyCustomTransformation;
}

export class ClassRegistry extends Registry<Class> {
  constructor() {
    super((c) => c.name);
  }

  private classToAllowedProps = new Map<Class, string[]>();
  private classToCustom = new Map<Class, AnyCustomTransformation>();

  override register(value: Class, options?: string | RegisterOptions): void {
    if (typeof options === 'object') {
      if (options.allowProps) {
        this.classToAllowedProps.set(value, options.allowProps);
      } else if (options.custom) {
        this.classToCustom.set(value, options.custom);
      }

      super.register(value, options.identifier);
    } else {
      super.register(value, options);
    }
  }

  getAllowedProps(value: Class): string[] | undefined {
    return this.classToAllowedProps.get(value);
  }

  getCustom(value: Class): AnyCustomTransformation | undefined {
    return this.classToCustom.get(value);
  }
}
