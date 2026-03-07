// /** Deep freeze function. Note that freezing is dev only to catch any errors while preserving performance. */
// export function deepFreeze<T>(obj: T, seen = new WeakSet<object>()): T {
//   if (process.env.NODE_ENV !== 'production') {
//     // 1. Quick exit for primitives
//     if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return obj;

//     // 2. Prevent infinite loops by checking if we've been here before
//     if (seen.has(obj) || Object.isFrozen(obj)) return obj;

//     // 3. Mark this object as visited and freeze it
//     seen.add(obj as object);
//     Object.freeze(obj);

//     // 4. Recurse through properties
//     for (const key of Reflect.ownKeys(obj)) {
//       const value = (obj as any)[key];
//       if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
//         deepFreeze(value, seen);
//       }
//     }
//   }

//   return obj;
// }
