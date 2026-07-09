import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { env, allowedCorsOrigins } from './shared/config/env.js';
import { logger } from './shared/logger/logger.js';
import { AppError } from './shared/errors/app-error.js';
import { PokemonController } from './modules/pokemon/presentation/pokemon.controller.js';
import { pokemonRoutes } from './modules/pokemon/presentation/pokemon.routes.js';
import { InMemoryPokemonRepository } from './modules/pokemon/infrastructure/in-memory-pokemon.repository.js';
import { PokeApiClient } from './modules/pokemon/infrastructure/pokeapi.client.js';
import { SyncPokemonsUseCase } from './modules/pokemon/application/sync-pokemons.use-case.js';
import { GetPokemonsUseCase } from './modules/pokemon/application/get-pokemons.use-case.js';
import { PokemonSyncJob } from './modules/pokemon/jobs/pokemon-sync.job.js';
import type { PokemonRepository } from './modules/pokemon/domain/pokemon.repository.js';

export interface BuildServerOptions {
  pokeApiClient?: PokeApiClient;
  pokemonRepository?: PokemonRepository;
  syncPokemonsUseCase?: SyncPokemonsUseCase;
  getPokemonsUseCase?: GetPokemonsUseCase;
  controller?: PokemonController;
  startBackgroundSync?: boolean;
}

/**
 * Factory function to build and configure the Fastify server.
 *
 * Responsibilities:
 * - Wire all dependencies (inversion of control).
 * - Register CORS middleware with allowed origins from env config.
 * - Register Pokémon routes and controllers.
 * - Set up error handler for AppError conversion to HTTP responses.
 * - Optionally start background sync job on server ready.
 *
 * Dependency Injection Strategy:
 * All major components (repository, client, use cases, controller)
 * can be injected via options for flexibility in testing and deployment.
 * If not provided, sensible defaults are created.
 *
 * @param options Optional dependency injection configuration.
 * @param options.pokeApiClient Custom PokeAPI client (default: FetchHttpClient-backed).
 * @param options.pokemonRepository Custom repository implementation (default: in-memory).
 * @param options.syncPokemonsUseCase Custom sync use case (default: orchestrates API + repository).
 * @param options.getPokemonsUseCase Custom get use case (default: implements cache-aside).
 * @param options.controller Custom controller (default: delegates to use cases).
 * @param options.startBackgroundSync Whether to start background sync job on ready (default: false).
 * @returns A configured Fastify instance ready to listen.
 */
export async function buildServer(
  options: BuildServerOptions = {},
): Promise<FastifyInstance> {
  // Initialize Fastify with pino logger instance.
  const app = Fastify({ loggerInstance: logger }) as unknown as FastifyInstance;

  // Wire dependencies with defaults (strategy: injected first, then created).
  const pokemonRepository =
    options.pokemonRepository ??
    new InMemoryPokemonRepository({ ttlSeconds: env.CACHE_TTL_SECONDS });
  const pokeApiClient =
    options.pokeApiClient ?? new PokeApiClient({ baseUrl: env.POKEAPI_BASE_URL });
  const syncPokemonsUseCase =
    options.syncPokemonsUseCase ??
    new SyncPokemonsUseCase({
      pokeApiClient,
      pokemonRepository,
    });
  const getPokemonsUseCase =
    options.getPokemonsUseCase ??
    new GetPokemonsUseCase({ pokemonRepository, syncPokemonsUseCase });
  const controller = options.controller ?? new PokemonController(getPokemonsUseCase);
  const startBackgroundSync = options.startBackgroundSync ?? false;

  // Register CORS plugin with configured allowed origins.
  await app.register(cors, {
    origin: allowedCorsOrigins,
  });

  // Register all Pokemon routes (GET /pokemons, GET /health).
  await pokemonRoutes(app, controller);

  // Global error handler: converts AppError instances to HTTP responses.
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ error }, 'request failed');
    if (error instanceof AppError) {
      void reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
      });
      return;
    }

    // Unhandled errors: return 500 generic response.
    void reply.status(500).send({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  // Optionally start background sync job when server is ready.
  if (startBackgroundSync) {
    app.addHook('onReady', async () => {
      const job = new PokemonSyncJob(syncPokemonsUseCase);
      job.start();
    });
  }

  return app;
}
