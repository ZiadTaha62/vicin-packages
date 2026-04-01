export function isPlainObject(payload: any): payload is { [key: string]: any } {
  if (typeof payload !== 'object' || payload === null) return false;
  if (payload === Object.prototype) return false;
  if (Object.getPrototypeOf(payload) === null) return true;

  return Object.getPrototypeOf(payload) === Object.prototype;
}

export function isArray(value: unknown) {
  return Array.isArray(value);
}

export function isPrimitive(
  v: unknown
): v is string | boolean | number | bigint | symbol | null | undefined {
  return v == null || (typeof v !== 'object' && typeof v !== 'function');
}

type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

type TypedArray = InstanceType<TypedArrayConstructor>;

export function isTypedArray(payload: any): payload is TypedArray {
  return ArrayBuffer.isView(payload) && !(payload instanceof DataView);
}

export function isEntries<T = unknown>(payload: any): payload is [T, T][] {
  return isArray(payload) && payload.every((v) => isArray(v) && v.length === 2);
}
