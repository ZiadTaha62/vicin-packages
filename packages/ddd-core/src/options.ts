import {
  updateSigilOptions,
  type SigilOptions,
  updateIdGenerator,
  type IdOptions,
  updateStringifyOptions,
  type StringifyOptions,
  updatedJSONSerializationOptions,
  type JSONSerializerOptions,
} from './utils';

interface DddCoreOption extends SigilOptions, IdOptions, StringifyOptions, JSONSerializerOptions {}

export const updateOptions = (opts: DddCoreOption = {}) => {
  updateSigilOptions(opts);
  updateIdGenerator(opts);
  updateStringifyOptions(opts);
  updatedJSONSerializationOptions(opts);
};
