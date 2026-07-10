import type { PokemonRepository } from '../domain/pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';
import { PokemonCacheService } from '../infrastructure/pokemon-cache.service.js';
import type { PokeApiClient } from '../infrastructure/pokeapi.client.js';
import { PokemonMapper } from '../infrastructure/pokemon.mapper.js';
import { mapWithConcurrency } from '../../../shared/utils/concurrency.js';
import { logger } from '../../../shared/logger/logger.js';

export interface SyncPokemonsUseCaseOptions {
  pokeApiClient: PokeApiClient;
  pokemonMapper?: PokemonMapper;
  pokemonRepository: PokemonRepository;
  cacheService?: PokemonCacheService;
  concurrency?: number;
}

/**
 * SyncPokemonsUseCase refreshes the Pokémon catalog from PokeAPI.
 *
 * Responsibilities:
 * - Fetch the total count of Pokémon from PokeAPI.
 * - Fetch all Pokémon details with bounded concurrency (default 20) to avoid overloading the API.
 * - Gracefully handle per-Pokémon failures without aborting the entire sync.
 * - Map raw PokeAPI responses to domain models.
 * - Write normalized data to the cache.
 *
 * This use case is meant to be triggered by GetPokemonsUseCase on cache miss or
 * by background jobs for periodic refreshes.
 */
export class SyncPokemonsUseCase {
  private readonly pokeApiClient: PokeApiClient;
  private readonly pokemonMapper: PokemonMapper;
  private readonly cacheService: PokemonCacheService;
  private readonly concurrency: number;
  private inFlightSync: Promise<Pokemon[]> | null = null;

  /**
   * Initialize the SyncPokemonsUseCase with dependencies.
   *
   * @param options Configuration object containing the PokeAPI client, mapper, and repository.
   */
  constructor(options: SyncPokemonsUseCaseOptions) {
    this.pokeApiClient = options.pokeApiClient;
    this.pokemonMapper = options.pokemonMapper ?? new PokemonMapper();
    this.cacheService =
      options.cacheService ?? new PokemonCacheService(options.pokemonRepository);
    this.concurrency = options.concurrency ?? 10;
  }

  /**
   * Execute the sync operation.
   *
   * If a sync is already in progress, the caller receives the same promise instead
   * of starting a duplicate fetch. This prevents redundant PokeAPI requests when
   * the background job and an incoming request both trigger a sync simultaneously.
   *
   * Flow:
   * 1. Fetch total Pokémon count from PokeAPI.
   * 2. Fetch list of all Pokémon (summary data).
   * 3. Fetch detailed data for each Pokémon with concurrency control.
   * 4. Filter out failed fetches, map to domain model, and write to cache.
   *
   * @returns Array of fully-mapped Pokémon objects ready for client consumption.
   * @throws Error if the PokeAPI is unreachable or other fatal issues occur.
   */
  execute(): Promise<Pokemon[]> {
    if (this.inFlightSync) {
      return this.inFlightSync;
    }

    this.inFlightSync = this.doSync().finally(() => {
      this.inFlightSync = null;
    });

    return this.inFlightSync;
  }

  private async doSync(): Promise<Pokemon[]> {
    try {
      // Step 1: Get total count.
      const count = await this.pokeApiClient.getPokemonCount();

      // Step 2: Get list (summary URLs).
      const list = await this.pokeApiClient.getPokemonList(count);

      // Step 3: Fetch details with concurrency control.
      // Higher concurrency speeds up the initial warm-up without overwhelming PokeAPI.
      const details = await mapWithConcurrency(
        list.results,
        this.concurrency,
        async (item) => {
          try {
            return await this.pokeApiClient.getPokemonDetail(item.url);
          } catch (error) {
            // Log but don't fail entire sync if one Pokémon fetch fails.
            logger.warn(
              { error, pokemonUrl: item.url },
              'Failed to fetch individual Pokémon detail',
            );
            return null;
          }
        },
      );

      // Step 4: Filter nulls (failed fetches) and map to domain model.
      const pokemons = details
        .filter((detail): detail is NonNullable<typeof detail> => detail !== null)
        .map((detail) => this.pokemonMapper.map(detail));

      // Step 5: Persist to cache.
      await this.cacheService.write(pokemons);

      return pokemons;
    } catch (error) {
      // Log sync failure but re-throw for caller to handle.
      logger.error({ error }, 'Pokémon sync failed');
      throw error;
    }
  }
}
