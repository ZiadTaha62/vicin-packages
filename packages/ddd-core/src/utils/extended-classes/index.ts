export { PlainDddObjectFactory, type DddObject, type DddObjectStatic } from './ddd-object';

export {
  PlainStateObjectFactory,
  type StateObject,
  type StateObjectStatic,
  type StateOf,
  type StateObjectSerialization,
} from './state-object';

export {
  PlainIdentityObjectFactory,
  type IdentityObject,
  type IdentityObjectStatic,
  withIdentityObject,
} from './identity-object';

export { MarkFactory, markFactory } from './mark';

export { register, isDddObject, isStateObject, isIdentityObject } from './registry';
