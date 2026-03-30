export * from './domain';
export * from './application';

export {
  // sigil
  updateSigilOptions,
  type sigil,
  type ExtendSigil,
  SIGIL_RECOMMENDED_LABEL_REGEX,

  // serialize
  serializer,
  stringify,

  // clone
  clone,
  registerConstructorHandler,

  // deep freeze
  deepFreeze,

  // outcome
  Result,
  ResultAsync,
  Status,

  // equal
  isEqual,
} from './utils';
