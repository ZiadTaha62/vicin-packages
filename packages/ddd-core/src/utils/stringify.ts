import { isSigilInstance } from './sigil';
import { isArray, isPlainObject, isPrimitive, isTypedArray, isEntries } from './is';

/** ------------------------------
 *  Options
 * ------------------------------ */

export interface StringifyOptions {
  /** @default false */
  stringifyDedupe?: boolean;

  /** @default () => null */
  stringifyDedupeReplacer?: (object: object, stringified: StringifyResult) => string | null;

  /** @default null */
  stringifyUndefinedReplacer?: string | null;

  /**
   * Which top-level serialization format to use.
   * @default 'json'
   */
  stringifyObjectSerializationSyntax?: 'json' | 'yaml';

  /**
   * Number of spaces to use for JSON indentation.
   * `0` = compact (no whitespace).
   * @default 0
   */
  stringifyJsonSpace?: number;

  /**
   * Number of spaces for each YAML indentation level.
   * @default 2
   */
  stringifyYamlIndentSpace?: number;

  /**
   * How plain JavaScript objects `{}` are serialized in YAML.
   * - `'flow'` → `{ key: value, ... }`
   * - `'block'` → key: value (with newlines + indentation)
   * @default 'block'
   */
  stringifyYamlObjectStyle?: 'flow' | 'block';

  /**
   * How arrays, Sets, and TypedArrays are serialized in YAML.
   * - `'flow'` → `[item1, item2, ...]`
   * - `'block'` → `- item1\n- item2\n...`
   * @default 'block'
   */
  stringifyYamlArrayStyle?: 'flow' | 'block';

  /**
   * How JS `Map` entries are rendered (they are internally turned into `[[key, value], ...]`).
   * - `true`  → compact flow pairs: `[key, value]`
   * - `false` → full block sequences (double-nested `-` style)
   * @default false
   */
  stringifyYamlMapEntriesFlow?: boolean;

  /**
   * Whether to automatically break long flow containers (`{}` and `[]`) onto multiple lines
   * when they exceed `stringifyYamlFlowMaxWidth`.
   * @default true
   */
  stringifyPrettifyYamlFlow?: boolean;

  /**
   * Maximum width (in characters) before a flow container is broken into pretty multiline form.
   * Only used when `stringifyPrettifyYamlFlow` is `true`.
   * @default 80
   */
  stringifyYamlFlowMaxWidth?: number;
}

const STRINGIFY_CONFIG: Required<StringifyOptions> = {
  stringifyDedupe: false,
  stringifyDedupeReplacer: () => null,
  stringifyUndefinedReplacer: null,
  stringifyObjectSerializationSyntax: 'yaml',
  stringifyJsonSpace: 0,
  stringifyYamlIndentSpace: 2,
  stringifyYamlObjectStyle: 'block',
  stringifyYamlArrayStyle: 'block',
  stringifyYamlMapEntriesFlow: false,
  stringifyPrettifyYamlFlow: true,
  stringifyYamlFlowMaxWidth: 80,
};

export function updateStringifyOptions(opts: StringifyOptions) {
  for (const [k, v] of Object.entries(opts)) {
    if (k in STRINGIFY_CONFIG && v !== undefined) (STRINGIFY_CONFIG as any)[k] = v;
  }
}

/** ------------------------------
 *  General helpers
 * ------------------------------ */

type Primitive = string | number | bigint | boolean | symbol | null | undefined;
function handlePrimitiveEdgeCases(value: Primitive, opts: Required<StringifyOptions>) {
  if (value === undefined) return opts.stringifyUndefinedReplacer;
  if (typeof value === 'bigint' || typeof value === 'symbol') return String(value);
  if (typeof value === 'number') {
    if (value === Infinity || value === -Infinity || Number.isNaN(value)) return String(value);
    if (value === 0 && 1 / value === -Infinity) return '-0';
  }
  return value;
}

/** ------------------------------
 *  Main function
 * ------------------------------ */

/** Function used internally to stringify values */
export function stringify(value: unknown, opts?: StringifyOptions): string {
  const options = { ...STRINGIFY_CONFIG, ...opts };
  const output = stringifyWalker(value, new Set(), new Map(), options);

  // If output is not an object return it directly
  if (typeof output !== 'object' || output == null) {
    return String(handlePrimitiveEdgeCases(output, options));
  }

  // If output is object stringify it with supported syntax
  const syntax = options.stringifyObjectSerializationSyntax;
  if (syntax === 'json') {
    return toJSON(output, options);
  }
  if (syntax === 'yaml') {
    return toYAML(output, '', ' '.repeat(options.stringifyYamlIndentSpace), false, options);
  }
  throw new Error(`[DDD-core Error] Invalid object serialization type '${syntax}'`);
}

/** ------------------------------
 *  Stringify walker
 * ------------------------------ */

type StringifyResultItem = Primitive;
type StringifyResultArray = StringifyResult[];
interface StringifyResultObject {
  [k: string]: StringifyResult;
}
type StringifyResult = StringifyResultItem | StringifyResultObject | StringifyResultArray;

function stringifyWalker(
  value: unknown,
  objectsInThisPath: Set<object>,
  seenObjects: Map<object, StringifyResult>,
  opts: Required<StringifyOptions>
): StringifyResult {
  if (isPrimitive(value)) {
    return value;
  }

  let seen;
  if ((seen = seenObjects.get(value)) !== undefined) {
    if (opts.stringifyDedupe) {
      return opts.stringifyDedupeReplacer(value, seen);
    }
    return seen;
  }

  if (objectsInThisPath.has(value)) return '[Circular]';

  objectsInThisPath.add(value);

  let result: StringifyResult;

  if (isArray(value)) {
    result = value.map((v) => stringifyWalker(v, objectsInThisPath, seenObjects, opts));
  } else if (isPlainObject(value)) {
    result = {};
    for (const [k, v] of Object.entries(value))
      result[k] = stringifyWalker(v, objectsInThisPath, seenObjects, opts);
  } else if (value instanceof Map) {
    result = [...value].map(([k, v]) => [
      stringifyWalker(k, objectsInThisPath, seenObjects, opts),
      stringifyWalker(v, objectsInThisPath, seenObjects, opts),
    ]);
  } else if (value instanceof Set) {
    result = [...value].map((v) => stringifyWalker(v, objectsInThisPath, seenObjects, opts));
  } else if (value instanceof Date) {
    result = value.toISOString();
  } else if (value instanceof RegExp) {
    result = '' + value;
  } else if (value instanceof URL) {
    result = value.toString();
  } else if (isTypedArray(value)) {
    result = [...value].map(String);
  } else {
    result = stringifyNonPlainObject(value, opts);
  }

  seenObjects.set(value, result);
  objectsInThisPath.delete(value);

  return result;
}

function stringifyNonPlainObject(value: object, opts: Required<StringifyOptions>) {
  const defaultStr = Object.prototype.toString.call(value);
  let result = value.toString();

  if (result === defaultStr || result === '[object Object]') {
    const name =
      isSigilInstance(value) && value.hasOwnSigil ? value.SigilLabel : value.constructor.name;
    result = `[object ${name}]`;
  }

  return result;
}

/** ------------------------------
 *  JSON syntax
 * ------------------------------ */

function toJSON(value: StringifyResult, opts: Required<StringifyOptions>): string {
  return JSON.stringify(
    value,
    (k, v) => {
      return handlePrimitiveEdgeCases(v, opts);
    },
    opts.stringifyJsonSpace
  );
}

/** ------------------------------
 *  YAML syntax
 * ------------------------------ */

const YAML_SPECIAL_CHAR_REGEX = /: |#|[,[\]{}|]/;
const YAML_SPECIAL_FIRST_CHAR_REGEX = /^[-?:,[\]{}#&*!|>'"%@` ]/;
const YAML_EMPTY_NESTED_REGEX = /^[[\]{}]+$/;
const YAML_RESERVED_WORDS = new Set([
  // true values
  'y',
  'Y',
  'yes',
  'Yes',
  'YES',
  'true',
  'True',
  'TRUE',
  'on',
  'On',
  'ON',

  // false values
  'n',
  'N',
  'no',
  'No',
  'NO',
  'false',
  'False',
  'FALSE',
  'off',
  'Off',
  'OFF',

  // null values
  'null',
  '~',
  '.',
]);
const LINE_SPLIT_REGEX = /\r?\n/g;

function canBePlainScalar(s: string): boolean {
  if (s === '') return false;
  if (s.trim() !== s) return false;
  if (YAML_SPECIAL_CHAR_REGEX.test(s)) return false;
  if (YAML_SPECIAL_FIRST_CHAR_REGEX.test(s)) return false;
  if (YAML_RESERVED_WORDS.has(s)) return false;
  if (!Number.isNaN(Number(s))) return false;

  return true;
}

function escapeScalar(s: string): string {
  if (canBePlainScalar(s)) return s;
  return JSON.stringify(s);
}

function toPrettyFlow(
  open: string,
  close: string,
  items: string[],
  indent: string,
  indentStep: string,
  opts: Required<StringifyOptions>
): string {
  // Generate compact string
  const compact = open + items.join(', ') + close;

  // If prettify is false or compact less than max width return directly
  if (!opts.stringifyPrettifyYamlFlow || compact.length <= opts.stringifyYamlFlowMaxWidth) {
    return compact;
  }

  // Too wide → multiline flow
  indent += indentStep;
  const innerIndent = indent + indentStep;
  const inner = items.map((item) => innerIndent + item).join(',\n');
  return open + '\n' + inner + '\n' + indent + close;
}

function toYAML(
  value: StringifyResult,
  indent: string,
  indentStep: string,
  inFlow: boolean, //  tracks whether we are inside a flow container
  opts: Required<StringifyOptions>
): string {
  // ==================== PRIMITIVES ====================

  if (isPrimitive(value)) {
    // Handle string primitives
    if (typeof value === 'string') {
      // Handle multiline
      if (value.includes('\n')) {
        // Inside flow → must stay inline
        if (inFlow) return JSON.stringify(value);
        // Return multiline YAML scalar block
        const blockContent = value
          .split(LINE_SPLIT_REGEX)
          .map((line) => indent + line)
          .join('\n');
        return '|\n' + blockContent;
      }
      // Escape single line
      return escapeScalar(value);
    }

    // Handle other primitives
    return String(handlePrimitiveEdgeCases(value, opts));
  }

  // ==================== ARRAY ====================

  if (isArray(value)) {
    if (value.length === 0) return '[]';

    const effectiveSyntax = inFlow ? 'flow' : opts.stringifyYamlArrayStyle;
    const isEnt = opts.stringifyYamlMapEntriesFlow && isEntries(value);

    if (effectiveSyntax === 'flow') {
      const items = value.map((v) => {
        if (isEnt) {
          const [e1, e2] = v as [StringifyResult, StringifyResult];
          return (
            '[' +
            toYAML(e1, '', indentStep, true, opts) +
            ', ' +
            toYAML(e2, '', indentStep, true, opts) +
            ']'
          );
        }
        return toYAML(v, '', indentStep, true, opts);
      });
      return toPrettyFlow('[', ']', items, indent, indentStep, opts);
    }

    return value
      .map((v) => {
        if (isEnt) {
          const [e1, e2] = v as [StringifyResult, StringifyResult];
          return (
            indent +
            '- ' +
            '[' +
            toYAML(e1, '', indentStep, true, opts) +
            ', ' +
            toYAML(e2, '', indentStep, true, opts) +
            ']'
          );
        }

        const isNested = typeof v === 'object' && v !== null;
        const childIndent = isNested ? indent + indentStep : indent;
        const YamlValue = toYAML(v, childIndent, indentStep, false, opts);
        const isEmptyNested = YAML_EMPTY_NESTED_REGEX.test(YamlValue);

        if (value.length === 1 && isEmptyNested) {
          return '[' + YamlValue + ']';
        }

        const isNestedArray = isArray(v) && !isEmptyNested;
        if (isNestedArray) {
          return indent + '-\n' + YamlValue;
        }

        const relativeYamlValue = YamlValue.startsWith(childIndent)
          ? YamlValue.slice(childIndent.length)
          : YamlValue;

        return indent + '- ' + relativeYamlValue;
      })
      .join('\n');
  }

  // ==================== OBJECT ====================

  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';

  const effectiveSyntax = inFlow ? 'flow' : opts.stringifyYamlObjectStyle;

  if (effectiveSyntax === 'flow') {
    const items = entries.map(
      ([k, v]) => escapeScalar(k) + ': ' + toYAML(v, '', indentStep, true, opts)
    );

    return toPrettyFlow('{', '}', items, indent, indentStep, opts);
  }

  return entries
    .map(([k, v]) => {
      const isNested = typeof v === 'object' && v !== null;
      const YamlValue = toYAML(v, indent + indentStep, indentStep, false, opts);
      const separator = isNested && !YAML_EMPTY_NESTED_REGEX.test(YamlValue) ? '\n' : ' ';
      return indent + escapeScalar(k) + ':' + separator + YamlValue;
    })
    .join('\n');
}
