export class MiddlewarePipeError extends Error {}

export class ExternalError<T = unknown> {
  constructor(public reason: T) {}
}

export class MappedError<T = unknown> {
  constructor(public reason: T) {}
}

export class ProcessedError<T = unknown> {
  constructor(public reason: T) {}
}
