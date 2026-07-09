import { describe, expect, it } from 'vitest';
import { AppError } from '../../../shared/errors/app-error.js';

describe('AppError', () => {
  it('creates error with message, statusCode, code and details', () => {
    const error = new AppError('Something failed', 502, 'POKEAPI_UNAVAILABLE', { cause: 'timeout' });

    expect(error.message).toBe('Something failed');
    expect(error.statusCode).toBe(502);
    expect(error.code).toBe('POKEAPI_UNAVAILABLE');
    expect(error.details).toEqual({ cause: 'timeout' });
    expect(error.name).toBe('AppError');
  });

  it('uses default statusCode 500 and default code when not provided', () => {
    const error = new AppError('Internal error');

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.details).toBeUndefined();
  });

  it('is an instance of Error', () => {
    const error = new AppError('Test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});
