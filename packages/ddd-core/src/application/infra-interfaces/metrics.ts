export interface MetricsI {
  // For counting occurrences (e.g., "message_processed_total")
  increment: (name: string, tags: Record<string, unknown>) => void;
  // For measuring time/values (e.g., "message_duration_seconds")
  observe: (name: string, value: number, tags: Record<string, unknown>) => void;
}
