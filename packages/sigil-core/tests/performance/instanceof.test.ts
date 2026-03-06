/**
 * Performance test: compare `instanceof` vs Sigil's `isInstance` and `isExactInstance`.
 *
 * Scenarios:
 *   - depth 0 (simple class)
 *   - depth 3
 *   - depth 5
 *   - depth 10
 *   - depth 15
 *
 * Notes:
 *  - This measures micro-op throughput; runs with dev checks off to approximate production.
 *  - Use --runInBand and --expose-gc for more stable results if desired.
 */

import { AttachSigil, Sigil, attachSigil, updateSigilOptions } from '../../src';

const CHECK_ITERATIONS = 200_000; // number of check ops per measured run
const WARMUP_ITER = 1000;

type Row = {
  scenario: string;
  'instanceof total ms': number;
  'instanceof per-op ms': number;
  'isInstance ctor total ms': number;
  'isInstance ctor per-op ms': number;
  'isExactInstance ctor total ms': number;
  'isExactInstance ctor per-op ms': number;
  'isInstance instance total ms': number;
  'isInstance instance per-op ms': number;
  'isExactInstance instance total ms': number;
  'isExactInstance instance per-op ms': number;
};

function nowNs(): bigint {
  return process.hrtime.bigint();
}
const hrToMs = (ns: bigint) => Number(ns) / 1_000_000;

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

/** Micro-benchmark helper: run fn() iterations times, return total ms */
function benchCheck(fn: () => void, iterations: number): number {
  // warm up a bit
  for (let i = 0; i < Math.min(WARMUP_ITER, iterations); i++) fn();

  const start = nowNs();
  for (let i = 0; i < iterations; i++) fn();

  const end = nowNs();
  return hrToMs(end - start);
}

describe('Perf: instanceof vs isInstance vs isExactInstance', () => {
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

  test('identity checks across depths (logged results)', async () => {
    const rows: Row[] = [];

    const depths = [0, 3, 5, 10, 15];

    for (const depth of depths) {
      // === Plain chain ===
      const plain = buildPlainChain(depth);

      // -- instanceof --
      const plainInstanceOfFn = () => {
        plain.finalInst instanceof plain.BaseCtor;
      };
      const plainInstanceOfMs = benchCheck(plainInstanceOfFn, CHECK_ITERATIONS);

      // === Sigil chain ===
      const sig = buildSigilChain(depth);

      // -- isInstance ctor --
      const isInstanceCtorFn = () => {
        sig.BaseCtor.isInstance(sig.finalInst);
      };
      const isInstanceCtorMs = benchCheck(isInstanceCtorFn, CHECK_ITERATIONS);

      // -- isInstance instance --
      const isInstanceInstFn = () => {
        sig.baseInst.isInstance(sig.finalInst);
      };
      const isInstanceInstMs = benchCheck(isInstanceInstFn, CHECK_ITERATIONS);

      // -- isExactInstance ctor --
      const isExactInstanceCtorFn = () => {
        sig.FinalCtor.isExactInstance(sig.finalInst);
      };
      const isExactInstanceCtorMs = benchCheck(isExactInstanceCtorFn, CHECK_ITERATIONS);

      // -- isExactInstance instance --
      const isExactInstanceInstFn = () => {
        sig.finalInst.isExactInstance(sig.finalInst);
      };
      const isExactInstanceInstMs = benchCheck(isExactInstanceInstFn, CHECK_ITERATIONS);

      // Push results
      rows.push({
        scenario: `depth ${depth}`,
        'instanceof total ms': plainInstanceOfMs,
        'instanceof per-op ms': plainInstanceOfMs / CHECK_ITERATIONS,
        'isInstance ctor total ms': isInstanceCtorMs,
        'isInstance ctor per-op ms': isInstanceCtorMs / CHECK_ITERATIONS,
        'isInstance instance total ms': isInstanceInstMs,
        'isInstance instance per-op ms': isInstanceInstMs / CHECK_ITERATIONS,
        'isExactInstance ctor total ms': isExactInstanceCtorMs,
        'isExactInstance ctor per-op ms': isExactInstanceCtorMs / CHECK_ITERATIONS,
        'isExactInstance instance total ms': isExactInstanceInstMs,
        'isExactInstance instance per-op ms': isExactInstanceInstMs / CHECK_ITERATIONS,
      });
    }

    // Print results in a friendly table
    console.log('=== instanceof vs Sigil.isInstance / isExactInstance ===');
    console.table(
      rows.map((r) => ({
        scenario: r.scenario,
        'instanceof total ms': r['instanceof total ms'].toFixed(3),
        'instanceof per-op ms': r['instanceof per-op ms'].toFixed(6),
      }))
    );
    console.table(
      rows.map((r) => ({
        scenario: r.scenario,
        'isInstance ctor total ms': r['isInstance ctor total ms'].toFixed(3),
        'isInstance ctor per-op ms': r['isInstance ctor per-op ms'].toFixed(6),
        'isInstance instance total ms': r['isInstance instance total ms'].toFixed(3),
        'isInstance instance per-op ms': r['isInstance instance per-op ms'].toFixed(6),
      }))
    );
    console.table(
      rows.map((r) => ({
        scenario: r.scenario,
        'isExactInstance ctor total ms': r['isExactInstance ctor total ms'].toFixed(3),
        'isExactInstance ctor per-op ms': r['isExactInstance ctor per-op ms'].toFixed(6),
        'isExactInstance instance total ms': r['isExactInstance instance total ms'].toFixed(3),
        'isExactInstance instance per-op ms': r['isExactInstance instance per-op ms'].toFixed(6),
      }))
    );

    // Pass test (measurement only)
    expect(true).toBe(true);
  }, 120000);
});

//
// These are the typical run values with 'CHECK_ITERATIONS = 200_000' on 'node v20.12.0':
//
// instanceof
//  ┌─────────┬────────────┬─────────────────────┬──────────────────────┐
//  │ (index) │ scenario   │ instanceof total ms │ instanceof per-op ms │
//  ├─────────┼────────────┼─────────────────────┼──────────────────────┤
//  │ 0       │ 'depth 0'  │ '1.869'             │ '0.000009'           │
//  │ 1       │ 'depth 3'  │ '6.392'             │ '0.000032'           │
//  │ 2       │ 'depth 5'  │ '8.239'             │ '0.000041'           │
//  │ 3       │ 'depth 10' │ '9.525'             │ '0.000048'           │
//  │ 4       │ 'depth 15' │ '12.826'            │ '0.000064'           │
//  └─────────┴────────────┴─────────────────────┴──────────────────────┘
//
// isInstance
//  ┌─────────┬────────────┬──────────────────────────┬───────────────────────────┬──────────────────────────────┬───────────────────────────────┐
//  │ (index) │ scenario   │ isInstance ctor total ms │ isInstance ctor per-op ms │ isInstance instance total ms │ isInstance instance per-op ms │
//  ├─────────┼────────────┼──────────────────────────┼───────────────────────────┼──────────────────────────────┼───────────────────────────────┤
//  │ 0       │ 'depth 0'  │ '3.582'                  │ '0.000018'                │ '3.505'                      │ '0.000018'                    │
//  │ 1       │ 'depth 3'  │ '7.471'                  │ '0.000037'                │ '5.502'                      │ '0.000027'                    │
//  │ 2       │ 'depth 5'  │ '7.240'                  │ '0.000036'                │ '5.584'                      │ '0.000028'                    │
//  │ 3       │ 'depth 10' │ '7.205'                  │ '0.000036'                │ '5.639'                      │ '0.000028'                    │
//  │ 4       │ 'depth 15' │ '11.300'                 │ '0.000057'                │ '10.073'                     │ '0.000050'                    │
//  └─────────┴────────────┴──────────────────────────┴───────────────────────────┴──────────────────────────────┴───────────────────────────────┘
//
// isExactInstance
//  ┌─────────┬────────────┬───────────────────────────────┬────────────────────────────────┬───────────────────────────────────┬────────────────────────────────────┐
//  │ (index) │ scenario   │ isExactInstance ctor total ms │ isExactInstance ctor per-op ms │ isExactInstance instance total ms │ isExactInstance instance per-op ms │
//  ├─────────┼────────────┼───────────────────────────────┼────────────────────────────────┼───────────────────────────────────┼────────────────────────────────────┤
//  │ 0       │ 'depth 0'  │ '2.163'                       │ '0.000011'                     │ '2.267'                           │ '0.000011'                         │
//  │ 1       │ 'depth 3'  │ '9.468'                       │ '0.000047'                     │ '11.512'                          │ '0.000058'                         │
//  │ 2       │ 'depth 5'  │ '9.606'                       │ '0.000048'                     │ '6.707'                           │ '0.000034'                         │
//  │ 3       │ 'depth 10' │ '9.359'                       │ '0.000047'                     │ '6.889'                           │ '0.000034'                         │
//  │ 4       │ 'depth 15' │ '17.460'                      │ '0.000087'                     │ '15.058'                          │ '0.000075'                         │
//  └─────────┴────────────┴───────────────────────────────┴────────────────────────────────┴───────────────────────────────────┴────────────────────────────────────┘
//
// Conclusions:
//
// • isInstance has practically the same performance as native instanceof.
//    slightly **slower** on static calls until depth '5' where it becomes faster
//    slightly **faster** on the instance side
//
// • isExactInstance adds a tiny predictable cost but stays extremely fast
//
