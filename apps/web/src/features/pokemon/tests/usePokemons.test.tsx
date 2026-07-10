import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

function makePokemons(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    name: `pokemon-${i}`,
    types: ['normal'],
    image: `${i}.png`,
  }));
}

describe('usePokemons', () => {
  beforeEach(() => {
    mockedFetchPokemons.mockReset();
  });

  it('stores error message when fetch throws an Error instance', async () => {
    mockedFetchPokemons.mockRejectedValueOnce(new Error('API down'));

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('API down');
    expect(result.current.visiblePokemons).toHaveLength(0);
  });

  it('sets fallback error message when thrown value is not an Error instance', async () => {
    mockedFetchPokemons.mockRejectedValueOnce('network-down');

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Unknown error');
    expect(result.current.visiblePokemons).toHaveLength(0);
  });

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

  it('loads all pokemons in a single request and shows first page', async () => {
    const allPokemons = makePokemons(50);
    mockedFetchPokemons.mockResolvedValueOnce(allPokemons);

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loadedCount).toBe(50);
    expect(result.current.totalCount).toBe(50);
    expect(result.current.visiblePokemons).toHaveLength(48);
    expect(result.current.hasNextPage).toBe(true);
    expect(mockedFetchPokemons).toHaveBeenCalledTimes(1);
    expect(mockedFetchPokemons).toHaveBeenCalledWith();
  });

  it('loadMore reveals next page client-side without additional network request', async () => {
    const allPokemons = makePokemons(50);
    mockedFetchPokemons.mockResolvedValueOnce(allPokemons);

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.visiblePokemons).toHaveLength(48);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.visiblePokemons).toHaveLength(50);
    expect(result.current.hasNextPage).toBe(false);
    expect(mockedFetchPokemons).toHaveBeenCalledTimes(1);
  });

  it('does not change visible count when there is no next page', async () => {
    mockedFetchPokemons.mockResolvedValueOnce(pokemons);

    const { result } = renderHook(() => usePokemons());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hasNextPage).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.visiblePokemons).toHaveLength(pokemons.length);
    expect(mockedFetchPokemons).toHaveBeenCalledTimes(1);
  });
});
