import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePokemons } from '../hooks/usePokemons';

vi.mock('../services/pokemon-api.service', () => ({
  fetchPokemons: vi.fn(),
}));

import { fetchPokemons } from '../services/pokemon-api.service';

const mockedFetchPokemons = vi.mocked(fetchPokemons);

const pokemons = [
  { name: 'charizard', types: ['fire', 'flying'], image: 'char.png' },
  { name: 'bulbasaur', types: ['grass', 'poison'], image: 'bulba.png' },
];

describe('usePokemons', () => {
  it('search by name filters correctly', async () => {
    mockedFetchPokemons.mockResolvedValueOnce(pokemons);

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch('char'));

    expect(result.current.visiblePokemons).toHaveLength(1);
    expect(result.current.visiblePokemons[0].name).toBe('charizard');
  });

  it('type filter filters correctly', async () => {
    mockedFetchPokemons.mockResolvedValueOnce(pokemons);

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSelectedType('grass'));

    expect(result.current.visiblePokemons).toHaveLength(1);
    expect(result.current.visiblePokemons[0].name).toBe('bulbasaur');
  });

  it('clear filters resets filters', async () => {
    mockedFetchPokemons.mockResolvedValueOnce(pokemons);

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearch('char');
      result.current.setSelectedType('fire');
    });

    expect(result.current.visiblePokemons).toHaveLength(1);

    act(() => result.current.clearFilters());

    expect(result.current.search).toBe('');
    expect(result.current.selectedType).toBe('all');
    expect(result.current.visiblePokemons).toHaveLength(2);
  });
});
