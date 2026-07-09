import { AppError } from '../errors/app-error.js';

export interface HttpClientOptions {
  timeoutMs?: number;
  retries?: number;
}

export interface HttpClient {
  getJson<T>(url: string, options?: HttpClientOptions): Promise<T>;
}

export class FetchHttpClient implements HttpClient {
  async getJson<T>(url: string, options: HttpClientOptions = {}): Promise<T> {
    const { timeoutMs = 10000 } = options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new AppError(`Request failed with status ${response.status}`, 502, 'HTTP_ERROR', {
          url,
          status: response.status,
        });
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('External request failed', 502, 'HTTP_ERROR', { url, cause: String(error) });
    } finally {
      clearTimeout(timeout);
    }
  }
}
