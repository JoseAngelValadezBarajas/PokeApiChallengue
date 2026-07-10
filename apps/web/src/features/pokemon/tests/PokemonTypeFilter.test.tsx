import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PokemonTypeFilter } from '../components/PokemonTypeFilter';

describe('PokemonTypeFilter', () => {
  it('calls callback when selected type changes', () => {
    const onSelectedTypeChange = vi.fn();

    render(
      <PokemonTypeFilter
        availableTypes={['fire', 'water']}
        selectedType="all"
        onSelectedTypeChange={onSelectedTypeChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'fire' }));

    expect(onSelectedTypeChange).toHaveBeenCalledWith('fire');
  });
});
