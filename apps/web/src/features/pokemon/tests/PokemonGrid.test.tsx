import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PokemonGrid } from '../components/PokemonGrid';

const pokemons = [
  { name: 'bulbasaur', types: ['grass', 'poison'], image: 'bulba.png' },
  { name: 'charmander', types: ['fire'], image: 'char.png' },
];

describe('PokemonGrid', () => {
  it('renders multiple Pokémon', () => {
    render(<PokemonGrid pokemons={pokemons} />);

    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('charmander')).toBeInTheDocument();
  });
});
