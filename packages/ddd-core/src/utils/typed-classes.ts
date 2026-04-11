class TypedMapError extends Error {}

export class TypedMap<
  State extends { [k: string]: unknown } = { [k: string]: unknown },
> extends Map<string, unknown> {
  override set<K extends keyof State, V extends State[K]>(key: K, value: V): this {
    return super.set(key as string, value);
  }

  override delete<K extends keyof State>(key: K): boolean {
    return super.delete(key as string);
  }

  override get<K extends keyof State>(key: K): State[K] | undefined {
    return super.get(key as string) as State[K];
  }

  strictSet<K extends keyof State, V extends State[K]>(key: K, value: V): this {
    if (this.has(key as string)) {
      throw new TypedMapError(`Key '${key as string}' is already registered in the map`);
    }
    return super.set(key as string, value);
  }

  strictGet<K extends keyof State>(key: K): State[K] {
    if (!this.has(key as string)) {
      throw new TypedMapError(`Key '${key as string}' is not registered in the map`);
    }
    return super.get(key as string) as State[K];
  }
}
