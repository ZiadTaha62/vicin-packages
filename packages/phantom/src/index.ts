export {
  assertors,
  addTrait,
  addTraits,
  applyTransformation,
  asIdentity,
  dropTrait,
  dropTraits,
  revertTransformation,
} from './assertors';
export { PhantomChain } from './chain';
export { Phantom } from './phantom';
export type {
  Base,
  ErrorType,
  Identity,
  Input,
  Inspect,
  Label,
  Tag,
  Trait,
  Traits,
  Transformation,
  Variants,
  __Base,
  __Input,
  __Label,
  __OriginalType,
  __Phantom,
  __Tag,
  __Traits,
  __Variants,
} from './core';
export { PhantomCore, stripPhantom } from './core';
import { Phantom } from './phantom';
export default Phantom;
