import type { Message, Middleware, MiddlewareMetadata } from '../../message';
import type { MetricsI } from '../infra-interfaces';

export const metricsMiddleware = <I extends Message>(
  metrics: MetricsI,
  meta: MiddlewareMetadata
): Middleware<I, I> => [
  async (msg, next, ctx) => {
    const tags = {
      message_type: msg.type,
      message_kind: msg.kind,
    };

    const startTime = performance.now();

    try {
      const out = await next(msg);

      // Success Metrics
      const duration = performance.now() - startTime;
      metrics.observe('message_duration_ms', duration, { ...tags, status: 'success' });
      metrics.increment('message_processed_total', { ...tags, status: 'success' });

      return out;
    } catch (err: unknown) {
      // Failure Metrics
      const duration = performance.now() - startTime;

      metrics.observe('message_duration_ms', duration, {
        ...tags,
        status: 'error',
        error: err,
      });
      metrics.increment('message_processed_total', {
        ...tags,
        status: 'error',
        error: err,
      });

      throw err;
    }
  },
  { id: meta.id, name: meta.name ?? 'Metrics' },
];
