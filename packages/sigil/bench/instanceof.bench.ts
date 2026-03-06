import { bench, describe, test, expect } from 'vitest';
import { Sigil, AttachSigil, attachSigil } from '../src';

const DEPTH = [0, 3, 5, 10, 15];

function uniqueLabel(base: string) {
  return `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a plain inheritance chain of given depth.
 * Returns { BaseCtor, FinalCtor, instance } where BaseCtor is the topmost ancestor.
 */
function buildPlainChain(depth: number) {
  class Base {}
  let Prev = Base;
  for (let i = 0; i < depth; i++) {
    // create subclass that extends Prev
    // keep it simple and small

    const Sub = new Function(
      'Prev',
      `return class extends Prev { constructor(...a){ super(...a); } }`
    )(Prev);
    Prev = Sub;
  }
  const Final = Prev;
  const baseInst = new Base();
  const finalInst = new Final();
  return { BaseCtor: Base, FinalCtor: Final, baseInst, finalInst };
}

/** Build a Sigil chain of given depth where each stage is sigilified.
 * Returns { BaseCtor, FinalCtor, instance } where BaseCtor is the topmost (sigil'd) ancestor.
 */
function buildSigilChain(depth: number) {
  @AttachSigil(uniqueLabel('sigil-base'))
  class Base extends Sigil {}
  let Prev = Base;
  for (let i = 0; i < depth; i++) {
    const Sub = new Function(
      'Prev',
      `return class extends Prev { constructor(...a){ super(...a); } }`
    )(Prev);
    const label = uniqueLabel(`sigil-depth${i}`);
    const SigilSub = attachSigil(Sub, label);
    Prev = SigilSub;
  }
  const Final = Prev;
  const baseInst = new Base();
  const finalInst = new Final();
  return {
    BaseCtor: Base,
    FinalCtor: Final,
    baseInst,
    finalInst,
  };
}

describe('Performance: instance check comparisons (Sigil vs Plain)', () => {
  test('Verify true return of checks', () => {
    const plain = buildPlainChain(5);
    const sig = buildSigilChain(5);
    expect(plain.finalInst instanceof plain.BaseCtor).toBe(true);
    expect(plain.baseInst instanceof plain.BaseCtor).toBe(true);
    expect(sig.BaseCtor.isInstance(sig.finalInst)).toBe(true);
    expect(sig.BaseCtor.isInstance(sig.baseInst)).toBe(true);
    expect(sig.baseInst.isInstance(sig.baseInst)).toBe(true);
    expect(sig.baseInst.isInstance(sig.finalInst)).toBe(true);
    expect(sig.FinalCtor.isExactInstance(sig.finalInst)).toBe(true);
    expect(sig.finalInst.isExactInstance(sig.finalInst)).toBe(true);
  });

  for (const d of DEPTH) {
    const plain = buildPlainChain(d);
    const sig = buildSigilChain(d);
    bench(`instanceof at depth ${d}`, () => {
      plain.finalInst instanceof plain.BaseCtor;
    });
    bench(`isInstance Ctor at depth ${d}`, () => {
      sig.BaseCtor.isInstance(sig.finalInst);
    });
    bench(`isInstance instance at depth ${d}`, () => {
      sig.baseInst.isInstance(sig.finalInst);
    });
    bench(`isExactInstance Ctor at depth ${d}`, () => {
      sig.FinalCtor.isExactInstance(sig.finalInst);
    });
    bench(`isExactInstance instance at depth ${d}`, () => {
      sig.finalInst.isExactInstance(sig.finalInst);
    });
  }
});
