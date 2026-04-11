import { updateSigilOptions, type SigilOptions } from './sigil';
import { updateIdGenerator, type IdOptions } from './id';
import { updateStringifyOptions, type StringifyOptions } from './stringify';
import { updatedJSONSerializationOptions, type JSONSerializerOptions } from './json-serializer';

interface DddCoreOption extends SigilOptions, IdOptions, StringifyOptions, JSONSerializerOptions {}

export const updateOptions = (opts: DddCoreOption = {}) => {
  updateSigilOptions(opts);
  updateIdGenerator(opts);
  updateStringifyOptions(opts);
  updatedJSONSerializationOptions(opts);
};
