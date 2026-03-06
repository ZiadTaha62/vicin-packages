import { describe, beforeEach, afterEach, test, expect } from 'vitest';
import {
  Sigil,
  SigilError,
  Sigilify,
  SigilifyAbstract,
  attachSigil,
  AttachSigil,
  isSigilCtor,
  isSigilInstance,
  updateSigilOptions,
  RECOMMENDED_LABEL_REGEX,
  hasOwnSigil,
} from '../../src';

const labels = new Set<string>();

function generateRandomLabel(): string {
  const label = Math.random().toString(36).slice(2, 10);
  if (labels.has(label)) return generateRandomLabel();
  labels.add(label);
  return label;
}

describe('Sigil core runtime behavior', () => {
  beforeEach(() => {
    updateSigilOptions({
      labelValidation: null,
    });
  });

  afterEach(() => {
    updateSigilOptions({
      labelValidation: null,
    });
  });

  /** ----------------------
   *  Inspection
   * ---------------------- */

  test("[Inspection] 'isSigilCtor' and 'isSigilInstance' helpers", () => {
    @AttachSigil(generateRandomLabel())
    class X extends Sigil {}
    class Y {}

    const x = new X();
    const y = new Y();

    expect(isSigilCtor(X)).toBe(true);
    expect(isSigilInstance(x)).toBe(true);

    // Plain object is not a sigil instance
    expect(isSigilCtor(Y)).toBe(false);
    expect(isSigilInstance(y)).toBe(false);
  });

  test("[Inspection] 'hasOwnSigil'", () => {
    class X extends Sigil {}
    @AttachSigil(generateRandomLabel())
    class Y extends X {}

    expect(hasOwnSigil(X)).toBe(false);
    expect(hasOwnSigil(Y)).toBe(true);
  });

  /** ----------------------
   *  Mixin
   * ---------------------- */

  test('[Mixin] Sigilify factory returns a sigilified constructor', () => {
    const label = '@test/[Mixin] Ctor';
    const absLabel = '@test/[Mixin] AbsCtor';

    class Class {}
    const Ctor = Sigilify(Class, label);

    abstract class AbsClass {}
    const AbsCtor = SigilifyAbstract(AbsClass, absLabel);

    expect(Ctor).toBeDefined();
    expect(AbsCtor).toBeDefined();
    expect(Ctor.SigilLabel).toBe(label);
    expect(AbsCtor.SigilLabel).toBe(absLabel);
    expect(Ctor.SigilLabelLineage).toEqual(['Sigil', label]);
    expect(AbsCtor.SigilLabelLineage).toEqual(['Sigil', absLabel]);
    expect(Ctor.hasOwnSigil).toBe(true);
    expect(AbsCtor.hasOwnSigil).toBe(true);

    const inst = new Ctor();
    //@ts-expect-error - Extending abstract class
    const absInst = new AbsCtor() as InstanceType<typeof AbsCtor>;

    expect(inst).toBeDefined();
    expect(absInst).toBeDefined();
    expect(inst.SigilLabel).toBe(label);
    expect(absInst.SigilLabel).toBe(absLabel);
    expect(inst.SigilLabelLineage).toEqual(['Sigil', label]);
    expect(absInst.SigilLabelLineage).toEqual(['Sigil', absLabel]);
    expect(inst.hasOwnSigil).toBe(true);
    expect(absInst.hasOwnSigil).toBe(true);
  });

  /** ----------------------
   *  Attach function and decorator
   * ---------------------- */

  test("[Attach function and decorator] 'AttachSigil' decorator attaches runtime metadata", () => {
    const label = "@test/[Attach function and decorator] 'AttachSigil'";

    @AttachSigil(label)
    class X extends Sigil {}

    expect(X).toBeDefined();
    expect(X.SigilLabel).toBe(label);
    expect(X.SigilLabelLineage).toEqual(['Sigil', label]);
    expect(X.hasOwnSigil).toBe(true);

    const x = new X();
    expect(x).toBeDefined();
    expect(x.SigilLabel).toBe(label);
    expect(x.SigilLabelLineage).toEqual(['Sigil', label]);
    expect(x.hasOwnSigil).toBe(true);
  });

  test("[Attach function and decorator] 'attachSigil' function attaches runtime metadata", () => {
    const label = "@test/[Attach function and decorator] 'attachSigil'";

    class X extends Sigil {}
    attachSigil(X, label);

    expect(X).toBeDefined();
    expect(X.SigilLabel).toBe(label);
    expect(X.SigilLabelLineage).toEqual(['Sigil', label]);
    expect(X.hasOwnSigil).toBe(true);

    const x = new X();
    expect(x).toBeDefined();
    expect(x.SigilLabel).toBe(label);
    expect(x.SigilLabelLineage).toEqual(['Sigil', label]);
    expect(x.hasOwnSigil).toBe(true);
  });

  /** ----------------------
   *  Options
   * ---------------------- */

  test('[Options] Empty options object', () => {
    updateSigilOptions();
    updateSigilOptions({});
  });

  test('[Options] LabelValidation', () => {
    const validRegexLabel = '@test/Options.LabelValidation';
    const validFuncLabel = 'SomeLabelMoreThan10';
    const randomLabel = generateRandomLabel();

    updateSigilOptions({ labelValidation: RECOMMENDED_LABEL_REGEX });

    expect(() => {
      @AttachSigil(validRegexLabel)
      class A extends Sigil {}
    }).not.toThrow();
    expect(() => {
      @AttachSigil(randomLabel)
      class A extends Sigil {}
    }).toThrow(
      `[Sigil Error] Invalid Sigil label '${randomLabel}'. Make sure that supplied label matches validation regex or function`
    );

    updateSigilOptions({ labelValidation: (l: string) => l.length > 10 });

    expect(() => {
      @AttachSigil(validFuncLabel)
      class X extends Sigil {}
    }).not.toThrow();
    expect(() => {
      @AttachSigil(randomLabel)
      class X extends Sigil {}
    }).toThrow(
      `[Sigil Error] Invalid Sigil label '${randomLabel}'. Make sure that supplied label matches validation regex or function`
    );
  });

  test('[Options] passed per-function options override global options', () => {
    expect(() => {
      class X {}
      Sigilify(X, generateRandomLabel(), { labelValidation: RECOMMENDED_LABEL_REGEX });
    }).toThrow();
    expect(() => {
      abstract class X {}
      SigilifyAbstract(X, generateRandomLabel(), { labelValidation: RECOMMENDED_LABEL_REGEX });
    }).toThrow();
    expect(() => {
      class X extends Sigil {}
      attachSigil(X, generateRandomLabel(), { labelValidation: RECOMMENDED_LABEL_REGEX });
    }).toThrow();
    expect(() => {
      @AttachSigil(generateRandomLabel(), { labelValidation: RECOMMENDED_LABEL_REGEX })
      class X extends Sigil {}
    }).toThrow();
  });

  /** ----------------------
   *  Lineage
   * ---------------------- */

  test('[Lineage] Normal, constructors', () => {
    // create classes
    @AttachSigil(generateRandomLabel())
    class Base extends Sigil {}
    @AttachSigil(generateRandomLabel())
    class Sub extends Base {}
    @AttachSigil(generateRandomLabel())
    class Grand extends Sub {}

    // create instances
    const baseInst = new Base();
    const subInst = new Sub();
    const grandInst = new Grand();

    // normal instanceof like checks
    expect(Base.isInstance(baseInst)).toBe(true);
    expect(Base.isInstance(subInst)).toBe(true);
    expect(Base.isInstance(grandInst)).toBe(true);
    expect(Sub.isInstance(baseInst)).toBe(false);
    expect(Sub.isInstance(subInst)).toBe(true);
    expect(Sub.isInstance(grandInst)).toBe(true);
    expect(Grand.isInstance(baseInst)).toBe(false);
    expect(Grand.isInstance(subInst)).toBe(false);
    expect(Grand.isInstance(grandInst)).toBe(true);

    // Exact checks
    expect(Base.isExactInstance(baseInst)).toBe(true);
    expect(Base.isExactInstance(subInst)).toBe(false);
    expect(Base.isExactInstance(grandInst)).toBe(false);
    expect(Sub.isExactInstance(baseInst)).toBe(false);
    expect(Sub.isExactInstance(subInst)).toBe(true);
    expect(Sub.isExactInstance(grandInst)).toBe(false);
    expect(Grand.isExactInstance(baseInst)).toBe(false);
    expect(Grand.isExactInstance(subInst)).toBe(false);
    expect(Grand.isExactInstance(grandInst)).toBe(true);
  });

  test('[Lineage] Normal, instances', () => {
    // create classes
    @AttachSigil(generateRandomLabel())
    class Base extends Sigil {}
    @AttachSigil(generateRandomLabel())
    class Sub extends Base {}
    @AttachSigil(generateRandomLabel())
    class Grand extends Sub {}

    // create instances
    const baseInst = new Base();
    const subInst = new Sub();
    const grandInst = new Grand();

    // normal instanceof like checks
    expect(baseInst.isInstance(baseInst)).toBe(true);
    expect(baseInst.isInstance(subInst)).toBe(true);
    expect(baseInst.isInstance(grandInst)).toBe(true);
    expect(subInst.isInstance(baseInst)).toBe(false);
    expect(subInst.isInstance(subInst)).toBe(true);
    expect(subInst.isInstance(grandInst)).toBe(true);
    expect(grandInst.isInstance(baseInst)).toBe(false);
    expect(grandInst.isInstance(subInst)).toBe(false);
    expect(grandInst.isInstance(grandInst)).toBe(true);

    // Exact checks
    expect(baseInst.isExactInstance(baseInst)).toBe(true);
    expect(baseInst.isExactInstance(subInst)).toBe(false);
    expect(baseInst.isExactInstance(grandInst)).toBe(false);
    expect(subInst.isExactInstance(baseInst)).toBe(false);
    expect(subInst.isExactInstance(subInst)).toBe(true);
    expect(subInst.isExactInstance(grandInst)).toBe(false);
    expect(grandInst.isExactInstance(baseInst)).toBe(false);
    expect(grandInst.isExactInstance(subInst)).toBe(false);
    expect(grandInst.isExactInstance(grandInst)).toBe(true);
  });

  test('[Lineage] Abstract, constructors', () => {
    abstract class Abs {}
    const AbsSigil = SigilifyAbstract(Abs, generateRandomLabel());

    // create classes
    @AttachSigil(generateRandomLabel())
    class Base extends AbsSigil {}
    @AttachSigil(generateRandomLabel())
    class Sub extends Base {}
    @AttachSigil(generateRandomLabel())
    class Grand extends Sub {}

    // create instances
    const baseInst = new Base();
    const subInst = new Sub();
    const grandInst = new Grand();

    // normal instanceof like checks
    expect(Base.isInstance(baseInst)).toBe(true);
    expect(Base.isInstance(subInst)).toBe(true);
    expect(Base.isInstance(grandInst)).toBe(true);
    expect(Sub.isInstance(baseInst)).toBe(false);
    expect(Sub.isInstance(subInst)).toBe(true);
    expect(Sub.isInstance(grandInst)).toBe(true);
    expect(Grand.isInstance(baseInst)).toBe(false);
    expect(Grand.isInstance(subInst)).toBe(false);
    expect(Grand.isInstance(grandInst)).toBe(true);

    // Exact checks
    expect(Base.isExactInstance(baseInst)).toBe(true);
    expect(Base.isExactInstance(subInst)).toBe(false);
    expect(Base.isExactInstance(grandInst)).toBe(false);
    expect(Sub.isExactInstance(baseInst)).toBe(false);
    expect(Sub.isExactInstance(subInst)).toBe(true);
    expect(Sub.isExactInstance(grandInst)).toBe(false);
    expect(Grand.isExactInstance(baseInst)).toBe(false);
    expect(Grand.isExactInstance(subInst)).toBe(false);
    expect(Grand.isExactInstance(grandInst)).toBe(true);
  });

  test('[Lineage] Abstract, instances', () => {
    abstract class Abs {}
    const AbsSigil = SigilifyAbstract(Abs, generateRandomLabel());

    // create classes
    @AttachSigil(generateRandomLabel())
    class Base extends AbsSigil {}
    @AttachSigil(generateRandomLabel())
    class Sub extends Base {}
    @AttachSigil(generateRandomLabel())
    class Grand extends Sub {}

    // create instances
    const baseInst = new Base();
    const subInst = new Sub();
    const grandInst = new Grand();

    // normal instanceof like checks
    expect(baseInst.isInstance(baseInst)).toBe(true);
    expect(baseInst.isInstance(subInst)).toBe(true);
    expect(baseInst.isInstance(grandInst)).toBe(true);
    expect(subInst.isInstance(baseInst)).toBe(false);
    expect(subInst.isInstance(subInst)).toBe(true);
    expect(subInst.isInstance(grandInst)).toBe(true);
    expect(grandInst.isInstance(baseInst)).toBe(false);
    expect(grandInst.isInstance(subInst)).toBe(false);
    expect(grandInst.isInstance(grandInst)).toBe(true);

    // Exact checks
    expect(baseInst.isExactInstance(baseInst)).toBe(true);
    expect(baseInst.isExactInstance(subInst)).toBe(false);
    expect(baseInst.isExactInstance(grandInst)).toBe(false);
    expect(subInst.isExactInstance(baseInst)).toBe(false);
    expect(subInst.isExactInstance(subInst)).toBe(true);
    expect(subInst.isExactInstance(grandInst)).toBe(false);
    expect(grandInst.isExactInstance(baseInst)).toBe(false);
    expect(grandInst.isExactInstance(subInst)).toBe(false);
    expect(grandInst.isExactInstance(grandInst)).toBe(true);
  });

  test('[Lineage] Normal, Return false on non objects', () => {
    @AttachSigil(generateRandomLabel())
    class A extends Sigil {}
    const a = new A();

    expect(A.isInstance('str')).toBe(false);
    expect(A.isInstance(1)).toBe(false);
    expect(A.isInstance(true)).toBe(false);
    expect(A.isInstance(null)).toBe(false);
    expect(A.isInstance(undefined)).toBe(false);
    expect(A.isExactInstance('str')).toBe(false);
    expect(A.isExactInstance(1)).toBe(false);
    expect(A.isExactInstance(true)).toBe(false);
    expect(A.isExactInstance(null)).toBe(false);
    expect(A.isExactInstance(undefined)).toBe(false);
    expect(a.isInstance('str')).toBe(false);
    expect(a.isInstance(1)).toBe(false);
    expect(a.isInstance(true)).toBe(false);
    expect(a.isInstance(null)).toBe(false);
    expect(a.isInstance(undefined)).toBe(false);
    expect(a.isExactInstance('str')).toBe(false);
    expect(a.isExactInstance(1)).toBe(false);
    expect(a.isExactInstance(true)).toBe(false);
    expect(a.isExactInstance(null)).toBe(false);
    expect(a.isExactInstance(undefined)).toBe(false);
  });

  test('[Lineage] Abstract, Return false on non objects', () => {
    abstract class Abs {}
    const AbsSigil = SigilifyAbstract(Abs, generateRandomLabel());

    @AttachSigil(generateRandomLabel())
    class A extends AbsSigil {}
    const a = new A();

    expect(A.isInstance('str')).toBe(false);
    expect(A.isInstance(1)).toBe(false);
    expect(A.isInstance(true)).toBe(false);
    expect(A.isInstance(null)).toBe(false);
    expect(A.isInstance(undefined)).toBe(false);
    expect(A.isExactInstance('str')).toBe(false);
    expect(A.isExactInstance(1)).toBe(false);
    expect(A.isExactInstance(true)).toBe(false);
    expect(A.isExactInstance(null)).toBe(false);
    expect(A.isExactInstance(undefined)).toBe(false);
    expect(a.isInstance('str')).toBe(false);
    expect(a.isInstance(1)).toBe(false);
    expect(a.isInstance(true)).toBe(false);
    expect(a.isInstance(null)).toBe(false);
    expect(a.isInstance(undefined)).toBe(false);
    expect(a.isExactInstance('str')).toBe(false);
    expect(a.isExactInstance(1)).toBe(false);
    expect(a.isExactInstance(true)).toBe(false);
    expect(a.isExactInstance(null)).toBe(false);
    expect(a.isExactInstance(undefined)).toBe(false);
  });

  /** ----------------------
   *  Errors
   * ---------------------- */

  test('[Errors] Throw on double sigilify', () => {
    const label = generateRandomLabel();
    const absLabel = generateRandomLabel();

    class Class {}
    const Ctor = Sigilify(Class, label);
    abstract class AbsClass {}
    const AbsCtor = SigilifyAbstract(AbsClass, absLabel);

    expect(() => Sigilify(Ctor, label)).toThrow(
      `[Sigil Error] Class 'Sigilified' with label '${label}' is already sigilified`
    );
    expect(() => SigilifyAbstract(AbsCtor, absLabel)).toThrow(
      `[Sigil Error] Class 'Sigilified' with label '${absLabel}' is already sigilified`
    );

    const labelDec = generateRandomLabel();
    expect(() => {
      @AttachSigil(labelDec)
      @AttachSigil(labelDec)
      class A extends Sigil {}
    }).toThrow(`[Sigil Error] Class 'A' with label '${labelDec}' is already sigilified`);

    const labelFun = generateRandomLabel();
    expect(() => {
      class A extends Sigil {}
      attachSigil(A, labelFun);
      attachSigil(A, labelFun);
    }).toThrow(`[Sigil Error] Class 'A' with label '${labelFun}' is already sigilified`);
  });

  test('[Errors] Throw when decorator or function is used on non-sigil class', () => {
    expect(() => {
      @AttachSigil(generateRandomLabel())
      class X {}
    }).toThrow(
      "[Sigil Error] 'AttachSigil' decorator accept only Sigil classes but used on class 'X'"
    );

    expect(() => {
      attachSigil(class X {}, generateRandomLabel());
    }).toThrow(
      "[Sigil Error] 'attachSigil' function accept only Sigil classes but used on class 'X'"
    );
  });

  test('[Errors] Throw on invalid label format', () => {
    updateSigilOptions({ labelValidation: RECOMMENDED_LABEL_REGEX });

    const randomLabel = generateRandomLabel();

    expect(() => {
      @AttachSigil(randomLabel)
      class X extends Sigil {}
    }).toThrow(
      `[Sigil Error] Invalid Sigil label '${randomLabel}'. Make sure that supplied label matches validation regex or function`
    );
  });

  test('[Errors] Throw on sigilify parent after child', () => {
    const parentLabel = generateRandomLabel();
    const childLabel = generateRandomLabel();

    class Parent extends Sigil {}
    class Child extends Parent {}

    attachSigil(Child, childLabel);

    expect(() => attachSigil(Parent, parentLabel)).toThrow(
      `[Sigil Error] Class 'Parent' with label 'Sigil' is already sigilified`
    );
  });

  /** ----------------------
   *  Classes
   * ---------------------- */

  test("[Classes] 'Sigil'", () => {
    expect(Sigil).toBeDefined();
    expect(Sigil.SigilLabel).toBe('Sigil');
    expect(Sigil.SigilLabelLineage).toEqual(['Sigil']);

    const inst = new Sigil();

    expect(inst).toBeDefined();
    expect(inst.SigilLabel).toBe('Sigil');
    expect(inst.SigilLabelLineage).toEqual(['Sigil']);
  });

  test("[Classes] 'SigilError'", () => {
    expect(SigilError).toBeDefined();
    expect(SigilError.SigilLabel).toBe('SigilError');
    expect(SigilError.SigilLabelLineage).toEqual(['Sigil', 'SigilError']);

    const inst = new SigilError();

    expect(inst).toBeDefined();
    expect(inst.SigilLabel).toBe('SigilError');
    expect(inst.SigilLabelLineage).toEqual(['Sigil', 'SigilError']);
    expect(inst instanceof Error).toBe(true);
  });

  /** ----------------------
   *  Edge cases
   * ---------------------- */

  test('[Edge cases] Sigilify parent after child', () => {
    const parentLabel = generateRandomLabel();
    const childLabel = generateRandomLabel();

    class Parent extends Sigil {}
    class Child extends Parent {}

    attachSigil(Child, childLabel);

    expect(() => attachSigil(Parent, parentLabel)).toThrow(
      `[Sigil Error] Class 'Parent' with label 'Sigil' is already sigilified`
    );
  });

  test("[Edge cases] 'attachSigil' function access label before sigilify", () => {
    const label = generateRandomLabel();

    class A extends Sigil {}
    new A();

    expect(A.SigilLabel).toMatch('Sigil');

    expect(() => {
      attachSigil(A, label);
    }).not.toThrow();

    expect(A.SigilLabel).toBe(label);
  });

  test("[Edge cases] 'attachSigil' function append metadate only and can be treated as side-effect", () => {
    const label = generateRandomLabel();
    class A extends Sigil {}
    attachSigil(A, label);

    expect(A.SigilLabel).toBe(label);
  });

  test("[Edge cases] 'attachSigil' function using IIFE static initializer", () => {
    const label = generateRandomLabel();
    let labelInsideIIF: string = '';

    class A extends Sigil {
      static M = (() => {
        labelInsideIIF = A.SigilLabel;
      })();
    }

    attachSigil(A, label);

    expect(A.SigilLabel).toBe(label);
    expect(labelInsideIIF).toMatch('Sigil');

    @AttachSigil(label)
    class B extends Sigil {
      static M = (() => {
        labelInsideIIF = B.SigilLabel;
      })();
    }

    expect(B.SigilLabel).toBe(label);
    expect(labelInsideIIF).toMatch('Sigil');
  });

  test('[Edge cases] static block', () => {
    const label = generateRandomLabel();
    let labelInsideBlock: string = '';
    let labelInsideBlockThis: string = '';

    class A extends Sigil {
      static {
        labelInsideBlock = A.SigilLabel;
        labelInsideBlockThis = this.SigilLabel;
      }
    }

    attachSigil(A, label);

    expect(A.SigilLabel).toBe(label);
    expect(labelInsideBlock).toMatch('Sigil');
    expect(labelInsideBlockThis).toMatch('Sigil');

    @AttachSigil(label)
    class B extends Sigil {
      static {
        labelInsideBlock = B.SigilLabel;
        labelInsideBlockThis = this.SigilLabel;
      }
    }

    expect(B.SigilLabel).toBe(label);
    expect(labelInsideBlock).toMatch('Sigil');
    expect(labelInsideBlockThis).toMatch('Sigil');
  });
});
