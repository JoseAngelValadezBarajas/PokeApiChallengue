import { afterEach, describe, expect, it, vi } from 'vitest';

describe('fetchPokemons', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('throws when base URL is not configured', async () => {
    const { fetchPokemons } = await import('../services/pokemon-api.service');

    await expect(fetchPokemons()).rejects.toThrow('NEXT_PUBLIC_API_BASE_URL is not configured');
  });

  it('throws when API response is not ok', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { fetchPokemons } = await import('../services/pokemon-api.service');

    await expect(fetchPokemons()).rejects.toThrow('Failed to load Pokémon: 500');
  });

  it('returns parsed pokemon array and strips trailing slash from base URL', async () => {
    const apiResponse = [
      { name: 'pikachu', types: ['electric'], image: 'pikachu.png' },
    ];

    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(apiResponse),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { fetchPokemons } = await import('../services/pokemon-api.service');

    await expect(fetchPokemons()).resolves.toEqual(apiResponse);
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/pokemons', {
      cache: 'no-store',
    });
  });
});
