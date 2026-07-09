import { describe, expect, it, vi } from 'vitest';
import { RedisPokemonRepository } from '../infrastructure/redis-pokemon.repository.js';
import type { Pokemon } from '../domain/pokemon.types.js';

const pokemons: Pokemon[] = [
  { name: 'snorlax', types: ['normal'], image: 'snorlax.png' },
];

describe('RedisPokemonRepository', () => {
  it('returns null when key does not exist', async () => {
    const client = { get: vi.fn().mockResolvedValue(null), set: vi.fn() };
    const repo = new RedisPokemonRepository(client);

    await expect(repo.getAll()).resolves.toBeNull();
  });

  it('returns parsed pokemon list when key exists', async () => {
    const client = {
      get: vi.fn().mockResolvedValue(JSON.stringify(pokemons)),
      set: vi.fn(),
    };
    const repo = new RedisPokemonRepository(client);

    await expect(repo.getAll()).resolves.toEqual(pokemons);
  });

  it('saveAll serializes and calls client set with correct ttl', async () => {
    const client = { get: vi.fn(), set: vi.fn().mockResolvedValue(undefined) };
    const repo = new RedisPokemonRepository(client, 'custom-key', 1800);

    await repo.saveAll(pokemons);

    expect(client.set).toHaveBeenCalledWith(
      'custom-key',
      JSON.stringify(pokemons),
      1800,
    );
  });
});
