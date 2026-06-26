import { ERROR_MESSAGES } from '@/constants/messages';
import type { ApiErrorResponse } from '@/types/api';

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  query?: Record<string, QueryValue>;
}

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | {
      ok: false;
      error: string;
      status?: number;
      errorResponse?: ApiErrorResponse;
    };

export class ApiClient {
  private buildUrlWithQuery(url: string, query?: Record<string, QueryValue>): string {
    if (!query) return url;

    const next = new URL(url);
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      next.searchParams.set(key, String(value));
    }

    return next.toString();
  }

  private parseErrorResponse(body: unknown): ApiErrorResponse | null {
    if (!body || typeof body !== 'object') return null;

    const root = body as Record<string, unknown>;
    const statusCode = root.statusCode;
    const message = root.message;
    const errors = root.errors;

    if (typeof statusCode !== 'number' || typeof message !== 'string') {
      return null;
    }
    if (!Array.isArray(errors)) {
      return null;
    }

    return {
      statusCode,
      message,
      errors,
    };
  }

  private async readErrorPayload(
    response: globalThis.Response,
    fallback: string,
  ): Promise<{ message: string; errorResponse?: ApiErrorResponse }> {
    try {
      const body: unknown = await response.json();
      const errorResponse = this.parseErrorResponse(body);
      if (errorResponse) {
        const first = errorResponse.errors?.[0];
        const description = first?.description?.trim();
        const message = first?.message?.trim();
        return {
          message: description ?? message ?? errorResponse.message ?? fallback,
          errorResponse,
        };
      }

      if (body && typeof body === 'object') {
        const root = body as Record<string, unknown>;
        const message = root.message ?? root.error;
        if (typeof message === 'string' && message.trim()) {
          return { message: message.trim() };
        }
      }
    } catch {
      // Keep fallback when body is empty or non-JSON.
    }

    return { message: fallback };
  }

  private async createHeaders(options?: { jsonBody?: boolean }): Promise<Headers> {
    const headers = new Headers({ Accept: 'application/json' });
    if (options?.jsonBody) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  private async request<TResponse>({
    url,
    method = 'GET',
    body,
    query,
  }: {
    url: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    query?: Record<string, QueryValue>;
  }): Promise<ApiResult<TResponse>> {
    const headers = await this.createHeaders({
      jsonBody: body !== undefined,
    });
    const requestUrl = this.buildUrlWithQuery(url, query);

    try {
      const response = await fetch(requestUrl, {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorPayload = await this.readErrorPayload(response, response.statusText);

        return {
          ok: false,
          error: errorPayload.message,
          status: response.status,
          errorResponse: errorPayload.errorResponse,
        };
      }

      const data = await response.json();
      return { ok: true, data, status: response.status };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
      };
    }
  }

  async get<T>(url: string, options?: ApiRequestOptions): Promise<ApiResult<T>> {
    const query = options?.query ?? {};

    return this.request<T>({
      url,
      query,
    });
  }

  async post<TResponse>(url: string, body: unknown): Promise<ApiResult<TResponse>> {
    return this.request<TResponse>({
      url,
      method: 'POST',
      body,
    });
  }

  async patch<TResponse>(url: string, body: unknown): Promise<ApiResult<TResponse>> {
    return this.request<TResponse>({
      url,
      method: 'PATCH',
      body,
    });
  }

  async put<TResponse>(url: string, body: unknown): Promise<ApiResult<TResponse>> {
    return this.request<TResponse>({
      url,
      method: 'PUT',
      body,
    });
  }

  async delete(url: string): Promise<ApiResult<undefined>> {
    return this.request<undefined>({
      url,
      method: 'DELETE',
    });
  }
}
export const apiClient = new ApiClient();
