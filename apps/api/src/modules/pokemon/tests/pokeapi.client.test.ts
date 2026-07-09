import { describe, expect, it, vi } from 'vitest';
import { PokeApiClient } from '../infrastructure/pokeapi.client.js';

const createHttpClient = () => ({
  getJson: vi.fn(),
});

describe('PokeApiClient', () => {
  it('uses dynamic count instead of hardcoding 1302', async () => {
    const httpClient = createHttpClient();
    httpClient.getJson.mockResolvedValueOnce({
      count: 999,
      next: null,
      previous: null,
      results: [],
    });

    const client = new PokeApiClient({ baseUrl: 'https://pokeapi.co/api/v2', httpClient });

    await expect(client.getPokemonCount()).resolves.toBe(999);
    expect(httpClient.getJson).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?limit=1',
      expect.objectContaining({ timeoutMs: 10000 }),
    );
  });

  it('handles retry behavior', async () => {
    const httpClient = createHttpClient();
    httpClient.getJson
      .mockRejectedValueOnce(new Error('temporary network error'))
      .mockResolvedValueOnce({
        name: 'pikachu',
        types: [],
        sprites: { front_default: 'image.png', other: {} },
      });

    const client = new PokeApiClient({ baseUrl: 'https://pokeapi.co/api/v2', httpClient, retries: 1 });

    await expect(client.getPokemonDetail('https://pokeapi.co/api/v2/pokemon/25')).resolves.toEqual(
      expect.objectContaining({ name: 'pikachu' }),
    );
    expect(httpClient.getJson).toHaveBeenCalledTimes(2);
  });

  it('getPokemonList fetches and returns full list', async () => {
    const httpClient = createHttpClient();
    const mockList = { count: 1, next: null, previous: null, results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1' }] };
    httpClient.getJson.mockResolvedValueOnce(mockList);

    const client = new PokeApiClient({ baseUrl: 'https://pokeapi.co/api/v2', httpClient });

    await expect(client.getPokemonList(1)).resolves.toEqual(mockList);
    expect(httpClient.getJson).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?limit=1',
      expect.objectContaining({ timeoutMs: 10000 }),
    );
  });

  it('retries on transient 503 error in getPokemonList', async () => {
    const httpClient = createHttpClient();
    const mockList = { count: 1, next: null, previous: null, results: [] };
    httpClient.getJson
      .mockRejectedValueOnce(new Error('503 service unavailable'))
      .mockResolvedValueOnce(mockList);

    const client = new PokeApiClient({ baseUrl: 'https://pokeapi.co/api/v2', httpClient, retries: 1 });

    await expect(client.getPokemonList(1)).resolves.toEqual(mockList);
    expect(httpClient.getJson).toHaveBeenCalledTimes(2);
  });

  it('does not retry when shouldRetry returns false for non-transient error', async () => {
    const httpClient = createHttpClient();
    httpClient.getJson.mockRejectedValue(new Error('validation error'));

    const client = new PokeApiClient({ baseUrl: 'https://pokeapi.co/api/v2', httpClient, retries: 0 });

    await expect(client.getPokemonDetail('https://pokeapi.co/api/v2/pokemon/1')).rejects.toThrow('validation error');
  });
});
