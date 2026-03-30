export function isPlainObject(payload: any): payload is { [key: string]: any } {
  if (typeof payload !== 'object' || payload === null) return false;
  if (payload === Object.prototype) return false;
  if (Object.getPrototypeOf(payload) === null) return true;

  return Object.getPrototypeOf(payload) === Object.prototype;
}

export function isArray(value: unknown) {
  return Array.isArray(value);
}

export function isPrimitive(v: unknown) {
  return (
    typeof v === 'bigint' ||
    typeof v === 'boolean' ||
    typeof v === 'number' ||
    typeof v === 'string' ||
    typeof v === 'symbol' ||
    v == null
  );
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
