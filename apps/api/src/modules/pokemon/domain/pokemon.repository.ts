import type { Pokemon } from './pokemon.types.js';

export interface PokemonRepository {
  getAll(): Promise<Pokemon[] | null>;
  saveAll(pokemons: Pokemon[]): Promise<void>;
}
