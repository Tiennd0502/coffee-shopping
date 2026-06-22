import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request values propagated through async call chains for logging and tracing.
 */
export interface RequestContextStore {
  readonly requestId: string;
}

/**
 * Holds the active request context (for example request ID) for the current async execution.
 */
export const requestAsyncContext = new AsyncLocalStorage<RequestContextStore>();
