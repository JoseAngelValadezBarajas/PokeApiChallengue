import { describe, expect, it } from 'vitest';
import { PokemonMapper } from '../infrastructure/pokemon.mapper.js';

describe('PokemonMapper', () => {
  it('maps PokeAPI types correctly', () => {
    const mapper = new PokemonMapper();

    const mapped = mapper.map({
      id: 6,
      name: 'charizard',
      types: [
        { slot: 2, type: { name: 'flying' } },
        { slot: 1, type: { name: 'fire' } },
      ],
      sprites: {
        front_default: 'front.png',
        other: {
          'official-artwork': {
            front_default: 'artwork.png',
          },
        },
      },
    });

    expect(mapped.types).toEqual(['fire', 'flying']);
  });

  it('uses official artwork first', () => {
    const mapper = new PokemonMapper();

    const mapped = mapper.map({
      id: 1,
      name: 'bulbasaur',
      types: [{ slot: 1, type: { name: 'grass' } }],
      sprites: {
        front_default: 'front.png',
        other: {
          'official-artwork': {
            front_default: 'artwork.png',
          },
        },
      },
    });

    expect(mapped.image).toBe('artwork.png');
  });

  it('falls back to front_default', () => {
    const mapper = new PokemonMapper();

    const mapped = mapper.map({
      id: 25,
      name: 'pikachu',
      types: [{ slot: 1, type: { name: 'electric' } }],
      sprites: {
        front_default: 'front.png',
        other: {},
      },
    });

    expect(mapped.image).toBe('front.png');
  });
});
