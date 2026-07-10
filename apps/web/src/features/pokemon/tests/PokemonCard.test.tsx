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

  it('uses placeholder image when pokemon image is empty', () => {
    render(
      <PokemonCard
        pokemon={{
          name: 'missingno',
          types: ['normal'],
          image: '',
        }}
      />,
    );

    expect(screen.getByAltText('missingno')).toHaveAttribute(
      'src',
      expect.stringContaining('/pokemon-placeholder.svg'),
    );
  });
});
