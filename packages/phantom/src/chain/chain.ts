/**
 * A fluent PhantomChain class for chaining Phantom assertors.
 *
 * This provides a better developer experience (DX) by allowing method chaining
 * with `.with(assertor)` instead of nesting function calls or using a variadic chain.
 * Each `.with()` applies the assertor to the current value, updating the type incrementally.
 * Call `.end()` to retrieve the final value.
 *
 * At runtime, assertors are zero-cost casts, so the PhantomChain adds minimal overhead
 * (just object creation and method calls).
 *
 * Example:
 * ```ts
 * const asMyBrand = Phantom.assertors.asBrand<MyBrand>();
 * const asMyTrait = Phantom.assertors.asTrait<MyTrait>();
 * const applyMyTransform = Phantom.assertors.applyTransformation<MyTransform>();
 *
 * const result = new PhantomChain("value")
 *   .with(asMyBrand)
 *   .with(asMyTrait)
 *   .with(applyMyTransform)
 *   .end();
 * ```
 */
export class PhantomChain<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Apply the next assertor in the chain.
   *
   * @param assertor A function that takes the current value and returns the updated value (with new type).
   * @returns A new PhantomChain instance with the updated value and type.
   */
  with<U>(assertor: (value: T) => U): PhantomChain<U> {
    return new PhantomChain(assertor(this.value));
  }

  /**
   * End the chain and return the final value.
   *
   * @returns The value after all transformations.
   */
  end(): T {
    return this.value;
  }
}
