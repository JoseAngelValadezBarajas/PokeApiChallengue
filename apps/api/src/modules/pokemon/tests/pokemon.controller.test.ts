import { describe, expect, it, vi } from 'vitest';
import { PokemonController } from '../presentation/pokemon.controller.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { GetPokemonsUseCase } from '../application/get-pokemons.use-case.js';
import type { Pokemon } from '../domain/pokemon.types.js';

const pokemons: Pokemon[] = [
  { name: 'pikachu', types: ['electric'], image: 'pikachu.png' },
];

describe('PokemonController', () => {
  it('getHealth returns status ok', async () => {
    const useCase = { execute: vi.fn() } as unknown as GetPokemonsUseCase;
    const controller = new PokemonController(useCase);

    await expect(controller.getHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('getPokemons returns pokemon list from use case', async () => {
    const useCase = {
      execute: vi.fn().mockResolvedValue(pokemons),
    } as unknown as GetPokemonsUseCase;
    const controller = new PokemonController(useCase);

    await expect(controller.getPokemons()).resolves.toEqual(pokemons);
  });

  it('getPokemons re-throws AppError from use case', async () => {
    const appError = new AppError('Unavailable', 502, 'POKEAPI_UNAVAILABLE');
    const useCase = {
      execute: vi.fn().mockRejectedValue(appError),
    } as unknown as GetPokemonsUseCase;
    const controller = new PokemonController(useCase);

    await expect(controller.getPokemons()).rejects.toBe(appError);
  });

  it('getPokemons wraps unknown error in AppError', async () => {
    const useCase = {
      execute: vi.fn().mockRejectedValue(new Error('unexpected')),
    } as unknown as GetPokemonsUseCase;
    const controller = new PokemonController(useCase);

    await expect(controller.getPokemons()).rejects.toBeInstanceOf(AppError);
  });
});
