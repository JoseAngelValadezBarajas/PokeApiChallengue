import { describe, expect, it } from 'vitest';
import { InMemoryPokemonRepository } from '../infrastructure/in-memory-pokemon.repository.js';

describe('InMemoryPokemonRepository', () => {
  it('expires cached data', async () => {
    let currentTime = 0;
    const repository = new InMemoryPokemonRepository({ ttlSeconds: 5, now: () => currentTime });

    await repository.saveAll([{ name: 'pikachu', types: ['electric'], image: 'image.png' }]);
    expect(await repository.getAll()).toHaveLength(1);

    currentTime = 6000;
    expect(await repository.getAll()).toBeNull();
  });
});
