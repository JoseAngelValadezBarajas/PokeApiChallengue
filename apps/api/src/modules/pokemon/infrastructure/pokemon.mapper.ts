import type { Pokemon, PokemonDetailResponse } from '../domain/pokemon.types.js';

/**
 * PokemonMapper transforms raw PokeAPI responses into normalized domain models.
 *
 * This mapper handles:
 * - Type sorting by slot order (ensures consistent type ordering across API calls).
 * - Image fallback strategy: prefers official artwork, falls back to standard sprite.
 * - Name normalization (PokeAPI names are already normalized).
 */
export class PokemonMapper {
  /**
   * Map a PokeAPI detail response to a normalized Pokemon domain model.
   *
   * Image selection priority:
   * 1. Official artwork front image (official-artwork.front_default)
   * 2. Standard front sprite (sprites.front_default)
   * 3. Empty string if neither available
   *
   * Types are sorted by their slot value to ensure consistent ordering
   * (e.g., Fire/Flying instead of Flying/Fire for the same Pokémon).
   *
   * @param detail Raw PokeAPI detail response object.
   * @returns Normalized Pokémon object with name, sorted types, and image URL.
   */
  map(detail: PokemonDetailResponse): Pokemon {
    // Determine best available image URL with fallback logic.
    const image =
      detail.sprites.other?.['official-artwork']?.front_default ??
      detail.sprites.front_default ??
      '';

    return {
      name: detail.name,
      // Sort types by slot to ensure consistency.
      types: detail.types
        .slice()
        .sort((left, right) => left.slot - right.slot)
        .map((slot) => slot.type.name),
      image,
    };
  }
}
