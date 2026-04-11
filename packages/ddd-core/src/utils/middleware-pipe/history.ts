import type { MiddlewareMetadata, Middleware } from './types';

export class MiddlewarePipeHistory {
  private _record: {
    pre: { value: unknown; mw: string }[];
    post: { value: unknown; mw: string }[];
  } = {
    pre: [],
    post: [],
  };

  constructor(private readonly middlewares: ReadonlyArray<Middleware<any, any, any, any, any>>) {}

  add(type: 'pre' | 'post', value: unknown, mw: MiddlewareMetadata<any, any>) {
    this._record[type].push({ value, mw: mw.label });
  }

  ran(mw: string, type: 'pre' | 'post'): boolean {
    return this._record[type].some((i) => i.mw === mw);
  }

  next(type: 'pre' | 'post') {
    if (type === 'pre') {
      const idx = this._record.pre.length;
      return this.middlewares[idx]?.meta.label;
    } else {
      const idx = this._record.pre.length - this._record.post.length - 2;
      return this.middlewares[idx]?.meta.label;
    }
  }

  active(type: 'pre' | 'post') {
    if (type === 'pre') {
      const idx = this._record.pre.length - 1;
      return this.middlewares[idx]?.meta.label;
    } else {
      const idx = this._record.pre.length - this._record.post.length - 1;
      return this.middlewares[idx]?.meta.label;
    }
  }

  previous(type: 'pre' | 'post') {
    if (type === 'pre') {
      const idx = this._record.pre.length - 2;
      return this.middlewares[idx]?.meta.label;
    } else {
      const idx = this._record.pre.length - this._record.post.length;
      return this.middlewares[idx]?.meta.label;
    }
  }

  isShortCircuited(): boolean {
    return this._record.pre.length < this.middlewares.length;
  }

  stoppedAt(): string | undefined {
    return this._record.pre[this._record.pre.length - 1]?.mw;
  }

  get record() {
    return { pre: [...this._record.pre], post: [...this._record.post] };
  }
}
