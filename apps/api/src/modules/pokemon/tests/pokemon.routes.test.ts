import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildServer } from '../../../server.js';
import { AppError } from '../../../shared/errors/app-error.js';

const pokemons = [{ name: 'charizard', types: ['fire', 'flying'], image: 'image.png' }];

afterEach(async () => {
  vi.restoreAllMocks();
});

describe('pokemon routes', () => {
  it('returns health ok', async () => {
    const app = await buildServer({
      getPokemonsUseCase: {
        execute: vi.fn().mockResolvedValue(pokemons),
      } as never,
    });

    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    await app.close();
  });

  it('returns an array from GET /pokemons', async () => {
    const execute = vi.fn().mockResolvedValue(pokemons);
    const app = await buildServer({
      getPokemonsUseCase: { execute } as never,
    });

    const response = await app.inject({ method: 'GET', url: '/pokemons' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(pokemons);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith();

    await app.close();
  });

  it('returns 502 when use case throws AppError', async () => {
    const execute = vi.fn().mockRejectedValue(new AppError('Unavailable', 502, 'POKEAPI_UNAVAILABLE'));
    const app = await buildServer({
      getPokemonsUseCase: { execute } as never,
    });

    const response = await app.inject({ method: 'GET', url: '/pokemons' });
    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ code: 'POKEAPI_UNAVAILABLE' });

    await app.close();
  });

  it('returns 502 when use case throws unexpected error (wrapped by controller)', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('unexpected crash'));
    const app = await buildServer({
      getPokemonsUseCase: { execute } as never,
    });

    const response = await app.inject({ method: 'GET', url: '/pokemons' });
    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ code: 'POKEAPI_UNAVAILABLE' });

    await app.close();
  });

  it('starts background sync job when startBackgroundSync is true', async () => {
    const execute = vi.fn().mockResolvedValue(pokemons);
    const app = await buildServer({
      getPokemonsUseCase: { execute } as never,
      syncPokemonsUseCase: { execute: vi.fn().mockResolvedValue([]) } as never,
      startBackgroundSync: true,
    });

    await app.ready();
    await app.close();
  });
});
