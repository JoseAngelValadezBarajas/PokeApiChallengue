export interface RetryOptions {
  retries: number;
  delayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function retry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { retries, delayMs = 250, backoffFactor = 2, shouldRetry = () => true } = options;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !shouldRetry(error)) {
        throw error;
      }
      const waitTime = delayMs * backoffFactor ** attempt;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt += 1;
    }
  }

  throw lastError;
}
