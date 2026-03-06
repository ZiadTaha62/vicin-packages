/** --------------------------------------
 * Public types
 * --------------------------------------- */

// Error type used in 'never' states
export type { ErrorType } from './errors';

// Public fields and composed types
export type {
  Base,
  Brand,
  Identity,
  Input,
  Label,
  Tag,
  Trait,
  Traits,
  Transformation,
  Variants,
} from './public';

// Helper inspect only types
export type { Inspect } from './inspect';

// Only exposed core type, handles main '__Phantom' field in phantom object
export { PhantomCore, stripPhantom } from './phantom';

/** --------------------------------------
 * Internal types
 * --------------------------------------- */

// Internal core fields
export type {
  BaseCore,
  InputCore,
  LabelCore,
  TagCore,
  TraitsCore,
  VariantsCore,
} from './fields';

// Internal core composed
export type {
  BrandCore,
  IdentityCore,
  TraitCore,
  TransformationCore,
} from './composed';
