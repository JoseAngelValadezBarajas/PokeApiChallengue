import type { GetPokemonsUseCase } from '../application/get-pokemons.use-case.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { PokemonErrorMessages, PokemonErrorCodes, PokemonControllerMessages } from '../domain/pokemon.constants.js';

/**
 * PokemonController handles HTTP presentation layer for Pokémon endpoints.
 * It receives HTTP requests, delegates to use cases, and returns responses.
 * All business logic is isolated in the application layer.
 */
export class PokemonController {
  constructor(private readonly getPokemonsUseCase: GetPokemonsUseCase) {}

  /**
   * Health check endpoint.
   * Returns a simple status response to verify the service is alive.
   *
   * @returns A status object confirming the service is healthy.
   */
  async getHealth(): Promise<{ status: 'ok' }> {
    return { status: PokemonControllerMessages.HEALTH_STATUS_OK };
  }

  /**
   * Retrieve the full list of Pokémon with normalized data (name, types, image).
   * Delegates to GetPokemonsUseCase which handles caching and sync logic.
   *
   * @returns Array of all Pokémon objects.
   * @throws AppError with status 502 if data cannot be retrieved.
   */
  async getPokemons() {
    try {
      return await this.getPokemonsUseCase.execute();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        PokemonErrorMessages.FAILED_TO_FETCH,
        502,
        PokemonErrorCodes.POKEAPI_UNAVAILABLE,
      );
    }
  }
}
