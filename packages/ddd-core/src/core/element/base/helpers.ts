import type { DomainElementValue, DomainElementSerializer } from './types';

export function toValue(
  value: DomainElementValue | DomainElementSerializer,
  seen = new WeakSet<object>()
): DomainElementValue {
  // If primitive or null return directly
  if (value === null || typeof value !== 'object') return value;

  // Detect circular reference in objects
  if (seen.has(value as object)) throw new Error('[toValue] Circular reference detected');
  seen.add(value);

  // Use 'toValue' if serializable
  if ('toValue' in value && typeof value.toValue === 'function') return value.toValue();

  // If array handle each item
  if (Array.isArray(value)) return value.map((v) => toValue(v, seen)) as DomainElementValue;

  // If object handle key-value pairs
  let out: Record<string, DomainElementValue> = {};
  for (const [k, v] of Object.entries(value)) out[k] = toValue(v, seen);
  return out as DomainElementValue;
}
