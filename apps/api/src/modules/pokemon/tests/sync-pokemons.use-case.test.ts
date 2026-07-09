import { describe, expect, it, vi } from 'vitest';
import { SyncPokemonsUseCase } from '../application/sync-pokemons.use-case.js';
import type { PokemonRepository } from '../domain/pokemon.repository.js';

const repository: PokemonRepository = {
  getAll: vi.fn(),
  saveAll: vi.fn(),
};

describe('SyncPokemonsUseCase', () => {
  it('fetches data and saves to repository', async () => {
    const pokeApiClient = {
      getPokemonCount: vi.fn().mockResolvedValue(1),
      getPokemonList: vi.fn().mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1' }],
      }),
      getPokemonDetail: vi.fn().mockResolvedValue({
        id: 1,
        name: 'bulbasaur',
        types: [{ slot: 1, type: { name: 'grass' } }],
        sprites: { front_default: 'image.png', other: {} },
      }),
    } as const;

    const useCase = new SyncPokemonsUseCase({
      pokeApiClient: pokeApiClient as never,
      pokemonRepository: repository,
      concurrency: 1,
    });

    const result = await useCase.execute();

    expect(result).toEqual([
      { name: 'bulbasaur', types: ['grass'], image: 'image.png' },
    ]);
    expect(repository.saveAll).toHaveBeenCalledWith(result);
  });

  it('logs warning and continues when a single detail fetch fails', async () => {
    const pokeApiClient = {
      getPokemonCount: vi.fn().mockResolvedValue(2),
      getPokemonList: vi.fn().mockResolvedValue({
        count: 2,
        next: null,
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2' },
        ],
      }),
      getPokemonDetail: vi
        .fn()
        .mockResolvedValueOnce({
          id: 1,
          name: 'bulbasaur',
          types: [{ slot: 1, type: { name: 'grass' } }],
          sprites: { front_default: 'image.png', other: {} },
        })
        .mockRejectedValueOnce(new Error('Network error')),
    } as const;

    const useCase = new SyncPokemonsUseCase({
      pokeApiClient: pokeApiClient as never,
      pokemonRepository: repository,
      concurrency: 1,
    });

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('bulbasaur');
  });

  it('throws when getPokemonCount fails', async () => {
    const pokeApiClient = {
      getPokemonCount: vi.fn().mockRejectedValue(new Error('API down')),
      getPokemonList: vi.fn(),
      getPokemonDetail: vi.fn(),
    } as const;

    const useCase = new SyncPokemonsUseCase({
      pokeApiClient: pokeApiClient as never,
      pokemonRepository: repository,
      concurrency: 1,
    });

    await expect(useCase.execute()).rejects.toThrow('API down');
  });
});
