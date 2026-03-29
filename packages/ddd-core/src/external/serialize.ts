import { SuperJSON } from '@vicin/superjson';
import { isSigilInstance } from '@vicin/sigil';
import { isArray, isPlainObject, isPrimitive, isTypedArray } from './is';

/** ----------------------------
 *  Public API
 * ---------------------------- */

// @ts-expect-error Override private 'dedupe' in SuperJSON so it can be updated
class JSONSerializer extends SuperJSON {
  override dedupe: boolean = false;
}

/**
 * Serializer used internally for JSON transformation, uses 'SuperJSON' library but modified for recursive handling.
 *
 * By default all domain objects are registered in the serializer, if you want to use custom classes or symbols in
 * domain object's state make sure to pass it to this serializer.
 */
export const serializer = new JSONSerializer();

/** Function used internally to stringify values */
export function stringify(value: unknown): string {
  const output = stringifyWalker(value);
  return typeof output === 'string' ? output : JSON.stringify(output);
}

/** ----------------------------
 *  Helpers (String)
 * ---------------------------- */

function stringifyWalker(
  value: unknown,
  objectsInThisPath: any[] = [],
  seenObjects = new Map<object, StringifyResult>()
): StringifyResult {
  if (isPrimitive(value)) {
    if (typeof value === 'number' && value === 0 && 1 / value === -Infinity) return '-0';
    return String(value);
  }

  const seen = seenObjects.get(value);
  if (seen !== undefined) return seen;

  if (objectsInThisPath.includes(value)) return '[Circular]';

  objectsInThisPath.push(value);

  let result: StringifyResult;

  if (isArray(value)) {
    result = value.map((v) => stringifyWalker(v, objectsInThisPath, seenObjects));
  } else if (isPlainObject(value)) {
    result = {};
    for (const [k, v] of Object.entries(value))
      result[k] = stringifyWalker(v, objectsInThisPath, seenObjects);
  } else if (value instanceof Map) {
    result = [...value].map(([k, v]) => [stringify(k), stringify(v)]);
  } else if (value instanceof Set) {
    result = [...value].map(stringify);
  } else if (value instanceof Date) {
    result = value.toISOString();
  } else if (value instanceof RegExp) {
    result = '' + value;
  } else if (isTypedArray(value)) {
    result = [...value].map(stringify);
  } else {
    result = stringifyNonPlainObject(value);
  }

  seenObjects.set(value, result);
  objectsInThisPath.pop();

  return result;
}

function stringifyNonPlainObject(value: object) {
  const defaultStr = Object.prototype.toString.call(value); // e.g. "[object Object]" or "[object Date]"
  let result = value.toString();

  if (result === defaultStr || result === '[object Object]') {
    const name =
      isSigilInstance(value) && value.hasOwnSigil
        ? value.SigilLabel
        : (value.constructor?.name ?? 'Object');
    result = `[object ${name}]`;
  }

  return result;
}

/** ----------------------------
 *  Types (JSON)
 * ---------------------------- */

type JSONPrimitive = string | number | boolean | null;
type JSONArray = JSONValue[] | readonly JSONValue[];
type JSONObject = {
  [key: string]: JSONValue;
};

export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

/** ----------------------------
 *  Types (String)
 * ---------------------------- */

type StringifyResultItem = string;
type StringifyResultArray = StringifyResult[];
interface StringifyResultObject {
  [k: string]: StringifyResult;
}
type StringifyResult = StringifyResultItem | StringifyResultObject | StringifyResultArray;
