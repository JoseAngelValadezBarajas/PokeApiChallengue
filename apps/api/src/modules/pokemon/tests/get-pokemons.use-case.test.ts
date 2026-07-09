import { describe, expect, it, vi } from 'vitest';
import { GetPokemonsUseCase } from '../application/get-pokemons.use-case.js';
import { SyncPokemonsUseCase } from '../application/sync-pokemons.use-case.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { PokemonRepository } from '../domain/pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';

const pokemons: Pokemon[] = [
  { name: 'charizard', types: ['fire', 'flying'], image: 'image.png' },
];

describe('GetPokemonsUseCase', () => {
  it('returns cached data when cache exists', async () => {
    const pokemonRepository: PokemonRepository = {
      getAll: vi.fn().mockResolvedValue(pokemons),
      saveAll: vi.fn(),
    };
    const syncPokemonsUseCase = {
      execute: vi.fn(),
    } as unknown as SyncPokemonsUseCase;

    const useCase = new GetPokemonsUseCase({ pokemonRepository, syncPokemonsUseCase });

    await expect(useCase.execute()).resolves.toEqual(pokemons);
    expect(syncPokemonsUseCase.execute).not.toHaveBeenCalled();
  });

  it('fetches and caches data when cache is empty', async () => {
    const pokemonRepository: PokemonRepository = {
      getAll: vi.fn().mockResolvedValue(null),
      saveAll: vi.fn(),
    };
    const syncPokemonsUseCase = {
      execute: vi.fn().mockResolvedValue(pokemons),
    } as unknown as SyncPokemonsUseCase;

    const useCase = new GetPokemonsUseCase({ pokemonRepository, syncPokemonsUseCase });

    await expect(useCase.execute()).resolves.toEqual(pokemons);
    expect(syncPokemonsUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('throws AppError when sync fails and cache is empty', async () => {
    const pokemonRepository: PokemonRepository = {
      getAll: vi.fn().mockResolvedValue(null),
      saveAll: vi.fn(),
    };
    const syncPokemonsUseCase = {
      execute: vi.fn().mockRejectedValue(new Error('PokeAPI down')),
    } as unknown as SyncPokemonsUseCase;

    const useCase = new GetPokemonsUseCase({ pokemonRepository, syncPokemonsUseCase });

    await expect(useCase.execute()).rejects.toBeInstanceOf(AppError);
  });

  it('re-throws AppError directly when sync fails with AppError', async () => {
    const appError = new AppError('Custom error', 502, 'POKEAPI_UNAVAILABLE');
    const pokemonRepository: PokemonRepository = {
      getAll: vi.fn().mockResolvedValue(null),
      saveAll: vi.fn(),
    };
    const syncPokemonsUseCase = {
      execute: vi.fn().mockRejectedValue(appError),
    } as unknown as SyncPokemonsUseCase;

    const useCase = new GetPokemonsUseCase({ pokemonRepository, syncPokemonsUseCase });

    await expect(useCase.execute()).rejects.toBe(appError);
  });
});
