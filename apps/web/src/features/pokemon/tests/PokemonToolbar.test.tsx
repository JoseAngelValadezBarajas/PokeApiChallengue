import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PokemonToolbar } from '../components/PokemonToolbar';
import { useState } from 'react';

function ToolbarHarness() {
  const [search, setSearch] = useState('');

  return (
    <PokemonToolbar
      search={search}
      selectedType="all"
      availableTypes={['fire']}
      visibleCount={1}
      loadedCount={1}
      onSearchChange={setSearch}
      onSelectedTypeChange={vi.fn()}
      onClearFilters={vi.fn()}
    />
  );
}

describe('PokemonToolbar', () => {
  it('updates search input', async () => {
    const user = userEvent.setup();

    render(<ToolbarHarness />);

    await user.type(screen.getByLabelText('Search Pokémon'), 'pika');

    expect(screen.getByLabelText('Search Pokémon')).toHaveValue('pika');
  });
});
