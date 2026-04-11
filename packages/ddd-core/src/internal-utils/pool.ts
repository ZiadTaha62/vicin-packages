export class AsyncPool<T> {
  private readonly idle: T[] = [];
  private readonly waiters: Array<(value: T) => void> = [];
  private created = 0;

  constructor(
    private readonly factory: () => Promise<T> | T,
    private readonly destroy: (value: T) => Promise<void> | void = async () => {},
    private readonly maxSize: number = 10
  ) {
    if (maxSize < 1) {
      throw new RangeError('maxSize must be >= 1');
    }
  }

  async acquire(): Promise<T> {
    const cached = this.idle.pop();
    if (cached !== undefined) return cached;

    if (this.created < this.maxSize) {
      this.created++;
      try {
        return await this.factory();
      } catch (error) {
        this.created--;
        throw error;
      }
    }

    return new Promise<T>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  async release(resource: T): Promise<void> {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(resource);
      return;
    }

    if (this.idle.length < this.maxSize) {
      this.idle.push(resource);
      return;
    }

    this.created--;
    await this.destroy(resource);
  }

  async withResource<R>(fn: (resource: T) => Promise<R> | R): Promise<R> {
    const resource = await this.acquire();
    try {
      return await fn(resource);
    } finally {
      await this.release(resource);
    }
  }
}
