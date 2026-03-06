import { bench, describe } from 'vitest';
import { Sigil, Sigilify, attachSigil } from '../src';

const uniqueLabel = (base: string) =>
  `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Create a plain (normal) class factory with given props & methods counts */
function createPlainClassFactory(
  propsCount: number,
  methodsCount: number
): new (...args: any[]) => any {
  // create named dynamic class
  // Use Function constructor so we can generate different shapes programmatically
  const propAssignments = Array.from({ length: propsCount })
    .map((_, i) => `this.p${i} = ${i};`)
    .join('\n');

  const methodDefs = Array.from({ length: methodsCount })
    .map((_, i) => `m${i}(){return ${i};}`)
    .join('\n');

  // Create class source
  const src = `
    return class {
      constructor(){ ${propAssignments} }
      ${methodDefs}
    }
  `;

  return new Function(src)() as any;
}

/** Create a Sigilized class by wrapping the plain class using attachSigil or Sigilify */
function createSigilClassFactory(
  propsCount: number,
  methodsCount: number,
  label: string
): new (...args: any[]) => any {
  const Plain = createPlainClassFactory(propsCount, methodsCount);
  // Use Sigilify to attach sigil metadata directly to an ad-hoc class
  return Sigilify(Plain, label);
}

/** Create an extended plain class chain of given depth.
 * Each stage adds 2 props and 1 method (cumulative).
 */
function createPlainExtendedChain(depth: number) {
  let Prev: any = class {};
  let totalProps = 0;
  let totalMethods = 0;

  for (let d = 1; d <= depth; d++) {
    totalProps += 2;
    totalMethods += 1;

    // make subclass extending Prev with added props & methods
    const propAssignments = Array.from({ length: totalProps })
      .map((_, i) => `this.p${i} = ${i};`)
      .join('\n');

    const methodDefs = Array.from({ length: totalMethods })
      .map((_, i) => `m${i}(){return ${i};}`)
      .join('\n');

    const cls = new Function(
      'Prev',
      `return class extends Prev {
         constructor(...args){
           super(...args);
           ${propAssignments}
         }
         ${methodDefs}
       }`
    )(Prev);

    Prev = cls;
  }
  return Prev;
}

/** Create an extended sigilified class chain of given depth.
 * Each stage adds 2 props and 1 method (cumulative).
 * Each created class is wrapped with attachSigil.
 */
function createSigilExtendedChain(depth: number, baseLabel: string) {
  // base must extend Sigil
  class Base extends Sigil {}
  const labeledBase = attachSigil(Base, uniqueLabel(`${baseLabel}-base`));
  let Prev = labeledBase;
  let totalProps = 0;
  let totalMethods = 0;

  for (let d = 1; d <= depth; d++) {
    totalProps += 2;
    totalMethods += 1;

    // create subclass extending Prev
    const clsFactory = new Function(
      'Prev',
      `return class extends Prev {
         constructor(...args){
           super(...args);
           ${Array.from({ length: totalProps })
             .map((_, i) => `this.p${i} = ${i};`)
             .join('\n')}
         }
         ${Array.from({ length: totalMethods })
           .map((_, i) => `m${i}(){return ${i};}`)
           .join('\n')}
       }`
    );

    const Sub = clsFactory(Prev);
    const label = uniqueLabel(`${baseLabel}-depth${d}`);
    const SigilSub = attachSigil(Sub, label);
    Prev = SigilSub;
  }

  return Prev;
}

describe('Performance: class creation comparisons (Sigil vs Plain)', () => {
  // ====================== DEFINITION ======================
  bench('Define Empty Plain Class', () => {
    createPlainClassFactory(0, 0);
  });

  bench('Define Empty Sigil Class', () => {
    createSigilClassFactory(0, 0, uniqueLabel('sigil-empty'));
  });

  bench('Define Small Plain (5 props, 3 methods)', () => {
    createPlainClassFactory(5, 3);
  });

  bench('Define Small Sigil (5 props, 3 methods)', () => {
    createSigilClassFactory(5, 3, uniqueLabel('sigil-small'));
  });

  bench('Define Large Plain (15 props, 10 methods)', () => {
    createPlainClassFactory(15, 10);
  });

  bench('Define Large Sigil (15 props, 10 methods)', () => {
    createSigilClassFactory(15, 10, uniqueLabel('sigil-large'));
  });

  bench('Define Extended Depth 3 Plain', () => {
    createPlainExtendedChain(3);
  });

  bench('Define Extended Depth 3 Sigil', () => {
    createSigilExtendedChain(3, uniqueLabel('sigil-chain3'));
  });

  bench('Define Extended Depth 5 Plain', () => {
    createPlainExtendedChain(5);
  });

  bench('Define Extended Depth 5 Sigil', () => {
    createSigilExtendedChain(5, uniqueLabel('sigil-chain5'));
  });

  bench('Define Extended Depth 10 Plain', () => {
    createPlainExtendedChain(10);
  });

  bench('Define Extended Depth 10 Sigil', () => {
    createSigilExtendedChain(10, uniqueLabel('sigil-chain10'));
  });

  // ====================== INSTANTIATION ======================
  const Ctor1 = createPlainClassFactory(0, 0);
  bench('Instantiate Empty Plain Class', () => {
    new Ctor1();
  });

  const Ctor2 = createSigilClassFactory(0, 0, uniqueLabel('sigil-empty'));
  bench('Instantiate Empty Sigil Class', () => {
    new Ctor2();
  });

  const Ctor3 = createPlainClassFactory(5, 3);
  bench('Instantiate Small Plain (5 props, 3 methods)', () => {
    new Ctor3();
  });

  const Ctor4 = createSigilClassFactory(5, 3, uniqueLabel('sigil-small'));
  bench('Instantiate Small Sigil (5 props, 3 methods)', () => {
    new Ctor4();
  });

  const Ctor5 = createPlainClassFactory(15, 10);
  bench('Instantiate Large Plain (15 props, 10 methods)', () => {
    new Ctor5();
  });

  const Ctor6 = createSigilClassFactory(15, 10, uniqueLabel('sigil-large'));
  bench('Instantiate Large Sigil (15 props, 10 methods)', () => {
    new Ctor6();
  });

  const Ctor7 = createPlainExtendedChain(3);
  bench('Instantiate Extended Depth 3 Plain', () => {
    new Ctor7();
  });

  const Ctor8 = createSigilExtendedChain(3, uniqueLabel('sigil-chain3'));
  bench('Instantiate Extended Depth 3 Sigil', () => {
    new Ctor8();
  });

  const Ctor9 = createPlainExtendedChain(5);
  bench('Instantiate Extended Depth 5 Plain', () => {
    new Ctor9();
  });

  const Ctor10 = createSigilExtendedChain(5, uniqueLabel('sigil-chain5'));
  bench('Instantiate Extended Depth 5 Sigil', () => {
    new Ctor10();
  });

  const Ctor11 = createPlainExtendedChain(10);
  bench('Instantiate Extended Depth 10 Plain', () => {
    new Ctor11();
  });

  const Ctor12 = createSigilExtendedChain(10, uniqueLabel('sigil-chain10'));
  bench('Instantiate Extended Depth 10 Sigil', () => {
    new Ctor12();
  });
});
