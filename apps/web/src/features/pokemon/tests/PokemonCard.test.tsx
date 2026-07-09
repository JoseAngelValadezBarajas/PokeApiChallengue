import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PokemonCard } from '../components/PokemonCard';

describe('PokemonCard', () => {
  it('renders name, image, and types', () => {
    render(
      <PokemonCard
        pokemon={{
          name: 'charizard',
          types: ['fire', 'flying'],
          image: 'https://example.com/charizard.png',
        }}
      />,
    );

    expect(screen.getByText('charizard')).toBeInTheDocument();
    expect(screen.getByAltText('charizard')).toHaveAttribute(
      'src',
      expect.stringContaining('https://example.com/charizard.png'),
    );
    expect(screen.getByText('fire')).toBeInTheDocument();
    expect(screen.getByText('flying')).toBeInTheDocument();
  });
});
