/**
 * Symbol to uniquely identify sigil classes.
 *
 * @constant {symbol}
 */
export const __SIGIL__ = Symbol.for('@vicin/sigil.__SIGIL__');

/**
 * Symbol to store sigil lineage of a class
 *
 * @constant {symbol}
 */
export const __SIGIL_LINEAGE__ = Symbol.for('@vicin/sigil.__SIGIL_LINEAGE__');

/**
 * Symbol used to store the identity label for a sigil constructor.
 *
 * Stored on the constructor as a non-enumerable property.
 *
 * @constant {symbol}
 */
export const __LABEL__ = Symbol.for('@vicin/sigil.__LABEL__');

/**
 * Symbol used to store the depth inside Sigil chain. used in exact checks
 *
 * @constant {symbol}
 */
export const __DEPTH__ = Symbol.for('@vicin/sigil.__DEPTH__');
