import { describe, expect, it, vi } from 'vitest';
import { retry } from '../../../shared/utils/retry.js';

describe('retry', () => {
  it('returns result when operation succeeds on first try', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await retry(operation, { retries: 2 });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries and returns result when operation fails then succeeds', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValueOnce('ok');

    const result = await retry(operation, { retries: 2, delayMs: 0 });

    expect(result).toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting all retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('persistent error'));

    await expect(retry(operation, { retries: 2, delayMs: 0 })).rejects.toThrow('persistent error');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('stops retrying when shouldRetry returns false', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('fatal'));

    await expect(
      retry(operation, { retries: 3, delayMs: 0, shouldRetry: () => false }),
    ).rejects.toThrow('fatal');

    expect(operation).toHaveBeenCalledTimes(1);
  });
});
