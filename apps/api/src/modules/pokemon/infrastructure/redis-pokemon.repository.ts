import type { PokemonRepository } from '../domain/pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';

export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

export class RedisPokemonRepository implements PokemonRepository {
  constructor(
    private readonly client: RedisLikeClient,
    private readonly key = 'pokemon-app:pokemons',
    private readonly ttlSeconds = 3600,
  ) {}

  async getAll(): Promise<Pokemon[] | null> {
    const rawValue = await this.client.get(this.key);
    if (!rawValue) {
      return null;
    }
    return JSON.parse(rawValue) as Pokemon[];
  }

  async saveAll(pokemons: Pokemon[]): Promise<void> {
    await this.client.set(this.key, JSON.stringify(pokemons), this.ttlSeconds);
  }
}
