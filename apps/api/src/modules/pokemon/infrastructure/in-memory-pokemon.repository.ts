import type { PokemonRepository } from '../domain/pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';

export interface InMemoryPokemonRepositoryOptions {
  ttlSeconds: number;
  now?: () => number;
}

/**
 * InMemoryPokemonRepository provides a simple, fast cache for Pokémon data in-memory.
 *
 * Cache Strategy (Cache-Aside):
 * - Data is stored as a snapshot with an expiration timestamp.
 * - On read (getAll), checks if data exists and has not expired.
 * - Expired data returns null, signaling the caller to refresh from source.
 * - On write (saveAll), replaces all data and resets the expiration timer.
 *
 * TTL Management:
 * - ttlSeconds converted to milliseconds internally.
 * - now() function allows injection of time (for testing) or defaults to Date.now.
 * - Expiration calculated as: now() + ttlMilliseconds.
 *
 * Use Cases:
 * - Perfect for single-process, local development (docker-compose).
 * - Production: replace with RedisPokemonRepository for distributed cache.
 * - Tests: inject a custom now() function to control time without waiting.
 */
export class InMemoryPokemonRepository implements PokemonRepository {
  private pokemons: Pokemon[] | null = null;
  private expiresAt = 0;
  private readonly ttlMilliseconds: number;
  private readonly now: () => number;

  /**
   * Initialize the in-memory repository.
   *
   * @param options Configuration object.
   * @param options.ttlSeconds Cache time-to-live in seconds.
   * @param options.now Optional function to get current time (defaults to Date.now).
   *                     Useful for testing time-dependent behavior.
   */
  constructor(options: InMemoryPokemonRepositoryOptions) {
    this.ttlMilliseconds = options.ttlSeconds * 1000;
    this.now = options.now ?? Date.now;
  }

  /**
   * Retrieve all cached Pokémon if they exist and have not expired.
   *
   * @returns Array of cached Pokémon if fresh, null if expired or never written.
   */
  async getAll(): Promise<Pokemon[] | null> {
    // No data stored.
    if (!this.pokemons) {
      return null;
    }

    // Check expiration: if past expires-at time, clear and return null.
    if (this.now() > this.expiresAt) {
      this.pokemons = null;
      return null;
    }

    // Data is fresh, return it.
    return this.pokemons;
  }

  /**
   * Write Pokémon data to cache and set expiration timer.
   *
   * @param pokemons Array of Pokémon to cache.
   */
  async saveAll(pokemons: Pokemon[]): Promise<void> {
    this.pokemons = pokemons;
    this.expiresAt = this.now() + this.ttlMilliseconds;
  }
}
