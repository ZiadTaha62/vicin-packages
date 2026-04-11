export interface LoggerI<M> {
  debug(message: M): void;
  info(message: M): void;
  warn(message: M): void;
  error(message: M): void;
}

export type LogLevel = keyof LoggerI<any>;
