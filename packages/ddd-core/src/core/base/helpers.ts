import type { JsonValue, JsonSerializer, StringValue, StringSerializer, JsonDeserializer } from './types';

export function toJSON(value: JsonValue | JsonSerializer, seen = new WeakSet<object>()): JsonValue {
  // If primitive or null return directly
  if (value === null || typeof value !== 'object') return value;

  // Detect circular reference in objects
  if (seen.has(value as object)) throw new Error('[toJSON] Circular reference detected');
  seen.add(value);

  // Use 'toJSON' if serializable
  if ('toJSON' in value && typeof value.toJSON === 'function') return value.toJSON();

  // If array handle each item
  if (Array.isArray(value)) return value.map((v) => toJSON(v, seen));

  // If object handle key-value pairs
  const out: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(value)) out[k] = toJSON(v, seen);
  return out;
}

export function fromJSON(deserializer: JsonDeserializer, json: JsonValue, seen = new WeakSet<object>()): unknown {
  // Use 'fromJSON' if deserializer item
  if ('fromJSON' in deserializer && typeof deserializer.fromJSON === 'function') return deserializer.fromJSON(json);

  // If array handle each item
  if (Array.isArray(deserializer)) {
    if (!Array.isArray(json)) throw new Error();
    return deserializer.map((d, i) => fromJSON(d, json[i], seen));
  }

  // If object handle key-value pairs
  const out: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(deserializer)) out[k] = fromJSON(v, json[k], seen);
  return out;
}

export function toString(value: StringValue | StringSerializer | JsonValue, seen = new WeakSet<object>()): string {
  // If primitive or null return directly
  if (typeof value !== 'object') return String(value);
  if (value === null) return 'null';

  // Detect circular reference in objects
  if (seen.has(value as object)) throw new Error('[toJSON] Circular reference detected');
  seen.add(value);

  // Use 'toString' if serializable
  if ('toString' in value && typeof value.toString === 'function') return value.toString();

  // If array handle each item
  if (Array.isArray(value)) return JSON.stringify(value.map((v) => toString(v, seen)));

  // If object handle key-value pairs
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) out[k] = toString(v, seen);
  return JSON.stringify(out);
}
