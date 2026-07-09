import type { SyncPokemonsUseCase } from '../application/sync-pokemons.use-case.js';

/**
 * PokemonSyncJob runs the background synchronization of Pokémon data from PokeAPI.
 *
 * Responsibilities:
 * - Execute the sync process asynchronously without blocking server startup.
 * - Log any failures that occur during sync.
 * - Ensure the server remains operational even if sync fails.
 */
export class PokemonSyncJob {
  constructor(private readonly syncPokemonsUseCase: SyncPokemonsUseCase) {}

  /**
   * Start the background sync job.
   * Executes asynchronously and logs errors without crashing the server.
   */
  start(): void {
    void Promise.resolve()
      .then(() => this.syncPokemonsUseCase.execute())
      .catch((error) => {
        // Error already logged in SyncPokemonsUseCase; log here for job lifecycle tracking
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(`[PokemonSyncJob] Background sync failed: ${message}`);
      });
  }
}
