import { type sigil, type ExtendSigil, isEqual } from '../../utils';
import { DomainCollectionBase, DomainCollection } from './collection';
import type { StateOf } from '../../extended-classes';

@DomainCollection('@vicin/ddd-core.SharedDomainList')
// @ts-expect-error Override of static 'reconstitute' method with error 'extends but could be instantiated with a different subtype of constraint'
abstract class SharedDomainList<V> extends DomainCollectionBase<V[]> {
  declare [sigil]: ExtendSigil<'SharedDomainList', DomainCollectionBase<any>>;

  protected array: V[] = [];

  constructor(value?: V[] | Iterable<V>) {
    super();
    if (value) this.array = Array.from(value);
  }

  static override reconstitute<D extends SharedDomainList<any>>(state: StateOf<D>): D {
    return super.reconstitute(state, 'items');
  }

  /** Helper that respects domain equality (VO by value, Entity/AR by ID) */
  protected itemEquals(a: V, b: V): boolean {
    return isEqual(a, b);
  }

  get length(): number {
    return this.array.length;
  }

  get size(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  at(index: number): V | undefined {
    return this.array.at(index);
  }

  [Symbol.iterator](): IterableIterator<V> {
    return this.array[Symbol.iterator]();
  }

  *entries(): IterableIterator<[number, V]> {
    yield* this.array.entries();
  }

  forEach(callback: (value: V, index: number, list: this) => void): void {
    this.array.forEach((v, i) => callback(v, i, this));
  }

  includes(value: V): boolean {
    return this.array.some((item) => this.itemEquals(item, value));
  }

  indexOf(value: V): number {
    return this.array.findIndex((item) => this.itemEquals(item, value));
  }

  find(predicate: (value: V, index: number, list: this) => boolean): V | undefined {
    return this.array.find((v, i) => predicate(v, i, this));
  }

  findIndex(predicate: (value: V, index: number, list: this) => boolean): number {
    return this.array.findIndex((v, i) => predicate(v, i, this));
  }

  some(predicate: (value: V, index: number, list: this) => boolean): boolean {
    return this.array.some((v, i) => predicate(v, i, this));
  }

  every(predicate: (value: V, index: number, list: this) => boolean): boolean {
    return this.array.every((v, i) => predicate(v, i, this));
  }

  override equals(other: this): boolean {
    if (!SharedDomainList.isInstance(other)) return false;
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; i++) {
      if (!isEqual(this.array[i], other.array[i])) return false;
    }
    return true;
  }

  getState(): V[] {
    return [...this.array];
  }

  unwrap(): V[] {
    return [...this.array];
  }
}

@DomainCollection('@vicin/ddd-core.ReadOnlyDomainList')
export class ReadOnlyDomainList<V> extends SharedDomainList<V> {
  declare [sigil]: ExtendSigil<'ReadOnlyDomainList', SharedDomainList<any>>;

  override get [Symbol.toStringTag]() {
    return 'ReadOnlyDomainList';
  }

  static from<V>(value: V[] | Iterable<V> = []): ReadOnlyDomainList<V> {
    return new ReadOnlyDomainList(value);
  }

  static merge<V>(
    lists: (DomainList<V> | MutableDomainList<V> | ReadOnlyDomainList<V> | any[])[]
  ): ReadOnlyDomainList<V> {
    const total: V[] = [];
    for (const list of lists) total.push(...list);
    return new ReadOnlyDomainList(total);
  }
}

@DomainCollection('@vicin/ddd-core.DomainList')
export class DomainList<V> extends SharedDomainList<V> {
  declare [sigil]: ExtendSigil<'DomainList', SharedDomainList<any>>;

  override get [Symbol.toStringTag]() {
    return 'DomainList';
  }

  static from<V>(value: V[] | Iterable<V> = []): DomainList<V> {
    return new DomainList(value);
  }

  static merge<V>(
    lists: (DomainList<V> | MutableDomainList<V> | ReadOnlyDomainList<V> | any[])[]
  ): DomainList<V> {
    const total: V[] = [];
    for (const list of lists) total.push(...list);
    return new DomainList(total);
  }

  filter(predicate: (value: V, index: number, list: this) => boolean): DomainList<V> {
    return new DomainList(this.array.filter((v, i) => predicate(v, i, this)));
  }

  map<U>(callback: (value: V, index: number, list: this) => U): DomainList<U> {
    return new DomainList(this.array.map((v, i) => callback(v, i, this)));
  }

  slice(start?: number, end?: number): DomainList<V> {
    return new DomainList(this.array.slice(start, end));
  }

  splice(start: number, deleteCount?: number, ...items: V[]): this {
    this.array.splice(start, deleteCount ?? 0, ...items);
    return this;
  }

  concat(...items: (V | ConcatArray<V>)[]): DomainList<V> {
    return new DomainList(this.array.concat(...items));
  }

  reverse(): DomainList<V> {
    return new DomainList([...this.array].reverse());
  }

  sort(compareFn?: (a: V, b: V) => number): DomainList<V> {
    return new DomainList([...this.array].sort(compareFn));
  }

  push(...values: V[]): DomainList<V> {
    return new DomainList([...this.array, ...values]);
  }

  pop(): DomainList<V> {
    return new DomainList(this.array.slice(0, -1));
  }

  shift(): DomainList<V> {
    return new DomainList(this.array.slice(1));
  }

  unshift(...values: V[]): DomainList<V> {
    return new DomainList([...values, ...this.array]);
  }

  clear(): DomainList<V> {
    return new DomainList();
  }
}

@DomainCollection('@vicin/ddd-core.MutableDomainList')
export class MutableDomainList<V> extends SharedDomainList<V> {
  declare [sigil]: ExtendSigil<'MutableDomainList', SharedDomainList<any>>;

  override get [Symbol.toStringTag]() {
    return 'MutableDomainList';
  }

  static from<V>(value: V[] | Iterable<V> = []): MutableDomainList<V> {
    return new MutableDomainList(value);
  }

  static merge<V>(
    lists: (DomainList<V> | MutableDomainList<V> | ReadOnlyDomainList<V> | any[])[]
  ): MutableDomainList<V> {
    const total: V[] = [];
    for (const list of lists) total.push(...list);
    return new MutableDomainList(total);
  }

  filter(predicate: (value: V, index: number, list: this) => boolean): MutableDomainList<V> {
    const filtered = this.array.filter((v, i) => predicate(v, i, this));
    return new MutableDomainList(filtered);
  }

  map<U>(callback: (value: V, index: number, list: this) => U): MutableDomainList<U> {
    const mapped = this.array.map((v, i) => callback(v, i, this));
    return new MutableDomainList(mapped);
  }

  slice(start?: number, end?: number): MutableDomainList<V> {
    return new MutableDomainList(this.array.slice(start, end));
  }

  splice(start: number, deleteCount?: number, ...items: V[]): this {
    this.array.splice(start, deleteCount ?? 0, ...items);
    return this;
  }

  concat(...items: (V | ConcatArray<V>)[]): MutableDomainList<V> {
    return new MutableDomainList(this.array.concat(...items));
  }

  reverse(): this {
    this.array.reverse();
    return this;
  }

  sort(compareFn?: (a: V, b: V) => number): this {
    this.array.sort(compareFn);
    return this;
  }

  push(...values: V[]): this {
    this.array.push(...values);
    return this;
  }

  pop(): V | undefined {
    return this.array.pop();
  }

  shift(): V | undefined {
    return this.array.shift();
  }

  unshift(...values: V[]): number {
    return this.array.unshift(...values);
  }

  clear(): this {
    this.array = [];
    return this;
  }
}

export type AnyDomainList<V> = DomainList<V> | MutableDomainList<V> | ReadOnlyDomainList<V>;
