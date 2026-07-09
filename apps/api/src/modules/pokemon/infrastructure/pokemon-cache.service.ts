import type { PokemonRepository } from '../domain/pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';

/**
 * PokemonCacheService provides a thin abstraction over the repository.
 *
 * Purpose:
 * - Decouples cache-aside logic in use cases from repository implementation details.
 * - Allows swapping repository implementations (in-memory, Redis, database) without touching use cases.
 * - Simplifies testing by allowing mock repositories.
 *
 * This is a simple wrapper but crucial for architectural layering:
 * use cases work with PokemonCacheService, not directly with PokemonRepository.
 */
export class PokemonCacheService {
  constructor(private readonly repository: PokemonRepository) {}

  /**
   * Read cached Pokémon data.
   *
   * @returns Array of Pokémon if cache is fresh, null if expired or empty.
   */
  read(): Promise<Pokemon[] | null> {
    return this.repository.getAll();
  }

  /**
   * Write Pokémon data to cache.
   *
   * @param pokemons Array of Pokémon to cache.
   */
  write(pokemons: Pokemon[]): Promise<void> {
    return this.repository.saveAll(pokemons);
  }
}
