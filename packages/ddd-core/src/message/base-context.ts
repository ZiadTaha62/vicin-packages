export interface Actor {
  id: string;
  type: 'user' | 'system' | 'service';
  roles: string[];
}

export interface RequestInfo {
  ip: string;
  userAgent: string;
  startTime: number;
}

export interface BaseContext {
  /** Timestamp of message or execution start */
  readonly timestamp: string;

  /** Unique id of HTTP Request */
  readonly traceId: string | undefined;

  /** Unique id to the entire Business Flow */
  readonly correlationId: string | undefined;

  /** The specific service/user performing the current action */
  readonly actor?: Actor | undefined;

  /**
   * The human or system that triggered the very first message.
   * This NEVER changes throughout the entire trace.
   */
  readonly originator?: Actor | undefined;

  /** Multitenancy id (Where) */
  readonly tenantId?: string | undefined;

  /** Locale for distributive systems */
  readonly locale?: string | undefined;

  /** Request specific metadata */
  readonly requestInfo?: RequestInfo | undefined;
}

export interface ExecutionContext extends BaseContext {
  readonly executionId: string;
}

export type MessageMetadata = { [k: string]: unknown };

export interface MessageContext<
  Metadata extends MessageMetadata = MessageMetadata,
> extends BaseContext {
  /** Id of current message */
  readonly messageId: string;

  /** Id of cause (previous message) */
  readonly causationId?: string | undefined;

  /** Metadata object for any additional info */
  readonly metadata: Metadata;
}
