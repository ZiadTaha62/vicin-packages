import { Phantom } from '../../dist';

describe('Zero runtime effect of assertors', () => {
  test('Brand', () => {
    type X = Phantom.Brand.Declare<'X'>;
    const asX = Phantom.assertors.asBrand<X>();

    const value = 'some value';
    expect(asX(value)).toBe(value);
  });

  test('Identity', () => {
    type X = Phantom.Identity.Declare<'X'>;

    const asX = Phantom.assertors.asIdentity<X>();

    const value = 'some value';

    expect(asX(value)).toBe(value);
  });

  test('Traits', () => {
    type X = Phantom.Trait.Declare<'X'>;
    type Y = Phantom.Trait.Declare<'Y'>;

    const addX = Phantom.assertors.addTrait<X>();
    const dropX = Phantom.assertors.dropTrait<X>();
    const addXY = Phantom.assertors.addTraits<[X, Y]>();
    const dropXY = Phantom.assertors.dropTraits<[X, Y]>();

    const value = 'some value';

    expect(addX(value)).toBe(value);
    expect(dropX(value)).toBe(value);
    expect(addXY(value)).toBe(value);
    expect(dropXY(value)).toBe(value);
  });

  test('Transformations', () => {
    type X<T = unknown> = Phantom.Transformation.Declare<T, 'X'>;

    const applyX = Phantom.assertors.applyTransformation<X>();
    const revertX = Phantom.assertors.revertTransformation<X>();

    function apply<T extends number>(value: T) {
      const applied = value + 1;
      return applyX(value, applied);
    }

    function revert<T extends number & X>(applied: T) {
      const original = applied - 1;
      return revertX(applied, original);
    }

    expect(apply(1)).toBe(2);
    expect(revert(2 as any)).toBe(1);
  });

  test('Chain', () => {
    type X = Phantom.Identity.Declare<'X'>;
    type Y = Phantom.Trait.Declare<'Y'>;

    const asX = Phantom.assertors.asIdentity<X>();
    const addY = Phantom.assertors.addTrait<Y>();
    const dropY = Phantom.assertors.dropTrait<Y>();

    const value = 'some value';
    const chain = new Phantom.PhantomChain(value)
      .with(asX)
      .with(addY)
      .with(dropY)
      .end();

    expect(chain).toBe(value);
  });

  test('StripPhantom', () => {
    const value = 'some value';
    expect(Phantom.stripPhantom(value)).toBe(value);
  });
});
