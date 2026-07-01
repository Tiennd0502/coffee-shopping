import { ERROR_MESSAGES } from '@/constants/messages';
import type { ApiErrorResponse } from '@repo/types';

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  query?: Record<string, QueryValue>;
}

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

  private parseErrorResponse(body: unknown): ApiErrorResponse | undefined {
    if (!body || typeof body !== 'object') return;

    const root = body as Record<string, unknown>;
    const statusCode = root.statusCode;
    const message = root.message;
    const errors = root.errors;

    if (typeof statusCode !== 'number' || typeof message !== 'string' || !Array.isArray(errors)) {
      return;
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

  private async request<T>({
    url,
    method = 'GET',
    body,
    query,
  }: {
    url: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    query?: Record<string, QueryValue>;
  }): Promise<T | undefined> {
    const requestUrl = this.buildUrlWithQuery(url, query);

    try {
      const response = await fetch(requestUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const { message } = await this.readErrorPayload(response, response.statusText);
        throw new Error(message);
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined;
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  async get<T>(url: string, options?: ApiRequestOptions) {
    return this.request<T>({
      url,
      ...options,
    });
  }

  async post<T>(url: string, body: unknown) {
    return this.request<T>({
      url,
      method: 'POST',
      body,
    });
  }

  async patch<T>(url: string, body: unknown) {
    return this.request<T>({
      url,
      method: 'PATCH',
      body,
    });
  }

  async put<T>(url: string, body: unknown) {
    return this.request<T>({
      url,
      method: 'PUT',
      body,
    });
  }

  async delete(url: string) {
    return this.request<undefined>({
      url,
      method: 'DELETE',
    });
  }
}
export const apiClient = new ApiClient();
