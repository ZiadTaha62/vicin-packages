import { OPTIONS, type SigilOptions } from './options';
import { __LABEL__, __SIGIL__, __SIGIL_LINEAGE__, __DEPTH__ } from './symbols';

/** -----------------------------------------
 *  Maps
 * ----------------------------------------- */

/** Weak set to ensure that every ctor is handled only once */
const resolved = new WeakSet<Function>();

/** Weak set to store ctors that called sigilify function */
const hasOwnSigilRegistry = new WeakSet<Function>();

/** -----------------------------------------
 *  Main helpers
 * ----------------------------------------- */

/** Main function to handle 'Sigil' and attach its metadata to the class when label is passed */
export function sigilify(ctor: Function, label: string, opts?: SigilOptions): void {
  // throw if already seen
  if (resolved.has(ctor))
    throw new Error(
      `[Sigil Error] Class '${ctor.name}' with label '${(ctor as any).SigilLabel}' is already sigilified`
    );
  // verify label
  verifyLabel(label, opts);
  // handle ancestors (add them to seen)
  handleAncestors(ctor);
  // sigilify ctor
  updateSigil(ctor, label);
  // mark as seen and register in hasOwnSigil set
  resolved.add(ctor);
  hasOwnSigilRegistry.add(ctor);
}

export function hasOwnSigil(ctor: Function) {
  return hasOwnSigilRegistry.has(ctor);
}

/** -----------------------------------------
 *  Generic helpers
 * ----------------------------------------- */

/** Helper function to validate passed label */
export function verifyLabel<L extends string>(label: L, opts?: SigilOptions): void {
  // If validation regex or function is defined validate
  const labelValidation = opts?.labelValidation ?? OPTIONS.labelValidation;
  if (labelValidation) {
    let valid: boolean;
    if (labelValidation instanceof RegExp) valid = labelValidation.test(label);
    else valid = labelValidation(label);

    if (!valid)
      throw new Error(
        `[Sigil Error] Invalid Sigil label '${label}'. Make sure that supplied label matches validation regex or function`
      );
  }
}

function handleAncestors(ctor: Function) {
  let a = Object.getPrototypeOf(ctor);
  while (a && typeof a === 'function' && a.prototype[__SIGIL__]) {
    resolved.add(a);
    a = Object.getPrototypeOf(a);
  }
}

function updateSigil(ctor: Function, label: string) {
  // -------------------------
  // Get symbol from label
  // -------------------------

  const sym = Symbol.for(label);

  // -------------------------
  // Populate 'Sigil' symbols
  // -------------------------

  Object.defineProperty(ctor.prototype, __SIGIL__, {
    value: sym,
    configurable: false,
    enumerable: false,
    writable: false,
  });
  Object.defineProperty(ctor.prototype, __LABEL__, {
    value: label,
    configurable: false,
    enumerable: false,
    writable: false,
  });
  Object.defineProperty(ctor.prototype, __SIGIL_LINEAGE__, {
    value: [...(Object.getPrototypeOf(ctor)?.prototype[__SIGIL_LINEAGE__] ?? []), sym],
    configurable: false,
    enumerable: false,
    writable: false,
  });
  Object.defineProperty(ctor.prototype, __DEPTH__, {
    value: (ctor.prototype[__DEPTH__] ?? -1) + 1,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  // -------------------------
  // Add { symbol: ture } pair
  // -------------------------

  Object.defineProperty(ctor.prototype, sym, {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
