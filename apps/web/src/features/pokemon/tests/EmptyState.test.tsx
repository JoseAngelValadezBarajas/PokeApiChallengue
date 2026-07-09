import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../components/EmptyState';

describe('EmptyState', () => {
  it('renders correctly', () => {
    render(<EmptyState />);

    expect(screen.getByText(/No Pokémon Found/i)).toBeInTheDocument();
  });
});
