export interface DddCoreError {
  // Build in Error props
  /** Error name */
  readonly name: string;
  /** Error message */
  readonly message: string;
  /** Error cause */
  readonly cause?: unknown | undefined;
  /** Error stack */
  readonly stack?: string | undefined;

  // Added error props
  /** Identifier of error */
  readonly id: string;
  /** Type of error (e.g. "Validation", "VariantViolation") */
  readonly type: string;
  /** Client-facing friendly message (i18n ready) */
  readonly userMessage?: string | undefined;
  /** Error code (e.g. "USER_NOT_FOUND", "ORDER_INVALID_STATE") */
  readonly code: string;
  /** More granular error code (e.g. "EMAIL_TAKEN", "PAYMENT_DECLINED") */
  readonly subCode?: string | undefined;
  /** HTTP status */
  readonly status?: number | undefined;
  /** Error details (fields or metadata) */
  readonly details: ErrorDetails;
  /** ISO string timestamp of error */
  readonly timestamp: string;
  /** Trace id for microservices */
  readonly traceId?: string | undefined;
  /** true = expected/handled error (default false) */
  readonly isOperational: boolean;
  /** Useful for background jobs, queues, etc. (default false) */
  readonly retryable: boolean;
  /** DDD context (e.g. "user", "order", "payment") */
  readonly domain?: string | undefined;
  /** Extra context that is NOT metadata (e.g. userId, orderId) */
  readonly context: Record<string, unknown>;
}

/** Error details of DDD-core error (fields or metadata) */
export interface ErrorDetails {
  /** Single field errors (validation errors) */
  fieldErrors?: FieldError[];
  /** Metadata object of error */
  metadata?: Record<string, unknown>;
}

/** Validation error single field details */
export interface FieldError {
  /** Field of error */
  field: string;
  /** Error message of field */
  message: string;
  /** Error code of field */
  code?: string;
  /** Value of the field */
  value?: unknown;
  /** Constraint of validation (e.g. "isEmail", "minLength", "isPositive") */
  constraint?: string;
}
