import { SuperJSON } from '@vicin/superjson';

export interface JSONSerializerOptions {
  jsonDedupe?: boolean;
}

export function updatedJSONSerializationOptions(opts: JSONSerializerOptions) {
  if (opts.jsonDedupe !== undefined) JSONSerializer.dedupe = opts.jsonDedupe;
}

// @ts-expect-error Override private 'dedupe' in SuperJSON so it can be updated
class JSONSerializerClass extends SuperJSON {
  override dedupe: boolean = false;
}

/**
 * Serializer used internally for JSON transformation, uses 'SuperJSON' library but modified for recursive handling.
 *
 * By default all domain objects are registered in the JSONSerializer, if you want to use custom classes or symbols in
 * domain object's state make sure to pass it to this JSONSerializer.
 */
export const JSONSerializer = new JSONSerializerClass();

type JSONPrimitive = string | number | boolean | null;
type JSONArray = JSONValue[] | readonly JSONValue[];
type JSONObject = {
  [key: string]: JSONValue;
};

export type JSONValue = JSONPrimitive | JSONArray | JSONObject;
