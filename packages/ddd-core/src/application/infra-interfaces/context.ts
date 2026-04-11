export interface ExecutionContextI {
  traceId?: string;
  correlationId?: string;
  actorId?: string;
  tenantId?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}
