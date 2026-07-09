import { AppError } from '../../../shared/errors/app-error.js';
import { PokemonErrorMessages, PokemonErrorCodes } from '../domain/pokemon.constants.js';
import type { PokemonRepository } from '../domain/pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';
import { PokemonCacheService } from '../infrastructure/pokemon-cache.service.js';
import type { SyncPokemonsUseCase } from './sync-pokemons.use-case.js';

export interface GetPokemonsUseCaseOptions {
  pokemonRepository: PokemonRepository;
  syncPokemonsUseCase: SyncPokemonsUseCase;
  cacheService?: PokemonCacheService;
}

/**
 * GetPokemonsUseCase implements the cache-aside pattern for Pokémon data retrieval.
 *
 * The cache-aside (lazy-loading) strategy:
 * 1. Check if Pokémon data exists in cache and is fresh.
 * 2. If yes, return cached data immediately (fast path).
 * 3. If no, trigger sync via SyncPokemonsUseCase (refresh path).
 * 4. If sync fails but cache exists, return stale data (resilience).
 * 5. If sync fails and no cache, throw error (error path).
 *
 * This keeps the read path fast while maintaining resilience and allowing
 * background sync to keep data fresh without blocking reads.
 */
export class GetPokemonsUseCase {
  private readonly cacheService: PokemonCacheService;

  constructor(private readonly options: GetPokemonsUseCaseOptions) {
    this.cacheService =
      options.cacheService ?? new PokemonCacheService(options.pokemonRepository);
  }

  /**
   * Execute the cache-aside retrieval logic.
   *
   * @returns A plain array of normalized Pokémon with name, types, and image.
   * @throws AppError if data cannot be retrieved and no cache fallback exists.
   */
  async execute(): Promise<Pokemon[]> {
    // Fast path: return cached data if available and fresh.
    const cachedPokemons = await this.cacheService.read();
    if (cachedPokemons && cachedPokemons.length > 0) {
      return cachedPokemons;
    }

    // Refresh path: sync from PokeAPI if cache is empty.
    try {
      const pokemons = await this.options.syncPokemonsUseCase.execute();
      return pokemons;
    } catch (error) {
      // Resilience: if sync fails but old cache exists, serve stale data.
      if (cachedPokemons && cachedPokemons.length > 0) {
        return cachedPokemons;
      }
      // Error path: no cache and sync failed.
      throw error instanceof AppError
        ? error
        : new AppError(PokemonErrorMessages.UNABLE_TO_RETRIEVE, 502, PokemonErrorCodes.POKEAPI_UNAVAILABLE, {
            cause: error instanceof Error ? error.message : String(error),
          });
    }
  }
}
