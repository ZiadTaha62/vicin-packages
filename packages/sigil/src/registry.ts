import { __SIGIL_REGISTRY__ } from './symbols';

interface SigilRegistry {
  registerResolved: (ctor: Function) => void;
  checkResolved: (ctor: Function) => boolean;
  registerHasOwn: (ctor: Function) => void;
  checkHasOwn: (ctor: Function) => boolean;
}

export function getSigilRegistry(): SigilRegistry {
  if ((globalThis as any)[__SIGIL_REGISTRY__]) return (globalThis as any)[__SIGIL_REGISTRY__];

  /** Weak set to ensure that every ctor is handled only once */
  const resolved = new WeakSet<Function>();

  /** Weak set to store ctors that called sigilify function */
  const hasOwnSigil = new WeakSet<Function>();

  /** Registry */
  const registry: SigilRegistry = {
    registerResolved(ctor) {
      resolved.add(ctor);
    },
    checkResolved(ctor) {
      return resolved.has(ctor);
    },
    registerHasOwn(ctor) {
      hasOwnSigil.add(ctor);
    },
    checkHasOwn(ctor) {
      return hasOwnSigil.has(ctor);
    },
  };

  // Freeze registy to prevent any mutations
  Object.freeze(registry);
  // Append registry into globalThis and make it non-writable
  Object.defineProperty(globalThis, __SIGIL_REGISTRY__, {
    value: registry,
    writable: false,
    configurable: false,
    enumerable: false,
  });
  // return registry
  return registry;
}
