import type { FastifyInstance } from 'fastify';
import type { PokemonController } from './pokemon.controller.js';

/**
 * Register all Pokémon-related HTTP routes.
 *
 * Routes:
 * - GET /health: Simple health check, returns { status: 'ok' }
 * - GET /pokemons: Fetch the full list of Pokémon with normalized data
 *
 * All routes delegate to the controller, which delegates to use cases.
 * This keeps routing logic separate from business logic.
 *
 * @param app Fastify instance (typed narrowly to just the methods we use).
 * @param controller PokemonController instance handling all HTTP logic.
 */
export async function pokemonRoutes(
  app: Pick<FastifyInstance, 'get'>,
  controller: PokemonController,
): Promise<void> {
  // Health check endpoint for service availability and readiness probes.
  app.get('/health', async () => controller.getHealth());

  // Fetch the complete Pokémon list.
  app.get('/pokemons', async () => controller.getPokemons());
}
