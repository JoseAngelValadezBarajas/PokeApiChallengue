'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Pokemon } from '../types/pokemon';
import { fetchPokemons } from '../services/pokemon-api.service';
import { PokemonUIDefaults } from '../constants/ui-messages';

interface UsePokemonsResult {
  visiblePokemons: Pokemon[];
  loading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  search: string;
  selectedType: string;
  availableTypes: string[];
  visibleCount: number;
  loadedCount: number;
  totalCount: number;
  setSearch: (search: string) => void;
  setSelectedType: (type: string) => void;
  clearFilters: () => void;
  loadMore: () => Promise<void>;
  retry: () => void;
}

const PAGE_LIMIT = 48;

/**
 * Custom hook for managing Pokémon data and filtering logic.
 *
 * Responsibilities:
 * - Fetch all Pokémon from the backend on mount via fetchPokemons().
 * - Maintain internal state: pokemons (full list), loading, error, search, selectedType.
 * - Compute derived state: availableTypes (unique types from all Pokémon),
 *   filteredPokemons (filtered by search + type), visiblePokemons (paginated client-side slice).
 * - Provide filter methods: setSearch, setSelectedType, clearFilters, loadMore, retry.
 *
 * Pagination Strategy:
 * - All Pokémon are loaded from the backend in a single request.
 * - Client-side pagination controls how many filtered results are rendered at once.
 * - loadMore expands the visible window without triggering additional network requests.
 * - Filter changes reset the visible window to the first page.
 *
 * Filtering Strategy:
 * - Search: case-insensitive substring match on pokemon.name
 * - Type filter: matches if selectedType === 'all' or pokemon.types includes selectedType
 * - Both filters are ANDed: Pokémon must match both search AND type to be visible
 *
 * @returns UsePokemonsResult containing all state and filter controls.
 */
export function usePokemons(): UsePokemonsResult {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [visiblePageSize, setVisiblePageSize] = useState(PAGE_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchState] = useState('');
  const [selectedType, setSelectedTypeState] = useState<string>(PokemonUIDefaults.ALL_TYPES);

  /**
   * Normalize unknown thrown values into a user-friendly message.
   */
  const getErrorMessage = useCallback(
    (loadError: unknown) => (loadError instanceof Error ? loadError.message : 'Unknown error'),
    [],
  );

  /**
   * Load all Pokémon data from the backend.
   * Sets loading state, clears previous errors, and handles exceptions.
   */
  const loadPokemons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPokemons();
      setPokemons(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  // Load Pokémon on component mount (empty dependency array).
  useEffect(() => {
    void loadPokemons();
  }, [loadPokemons]);

  /**
   * Extract unique types from all loaded Pokémon and sort alphabetically.
   * Recomputed only when the pokemons array changes.
   */
  const availableTypes = useMemo(
    () => Array.from(new Set(pokemons.flatMap((pokemon) => pokemon.types))).sort(),
    [pokemons],
  );

  /**
   * Filter Pokémon based on search and type filters.
   * Applied only when pokemons, search, or selectedType changes.
   */
  const filteredPokemons = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return pokemons.filter((pokemon) => {
      // Match search: empty search matches all; otherwise substring match on name.
      const matchesSearch =
        normalizedSearch.length === 0 || pokemon.name.toLowerCase().includes(normalizedSearch);
      // Match type: 'all' matches all; otherwise check if type in list.
      const matchesType =
        selectedType === PokemonUIDefaults.ALL_TYPES || pokemon.types.includes(selectedType);
      return matchesSearch && matchesType;
    });
  }, [pokemons, search, selectedType]);

  /**
   * Slice filtered results to the current visible page size.
   */
  const visiblePokemons = useMemo(
    () => filteredPokemons.slice(0, visiblePageSize),
    [filteredPokemons, visiblePageSize],
  );

  const hasNextPage = useMemo(
    () => visiblePokemons.length < filteredPokemons.length,
    [visiblePokemons.length, filteredPokemons.length],
  );

  /**
   * Expand the visible window by one page (client-side, no network request).
   */
  const loadMore = useCallback(async () => {
    if (!hasNextPage) return;
    setVisiblePageSize((prev) => prev + PAGE_LIMIT);
  }, [hasNextPage]);

  /**
   * Update search and reset visible page so results start from the beginning.
   */
  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setVisiblePageSize(PAGE_LIMIT);
  }, []);

  /**
   * Update type filter and reset visible page so results start from the beginning.
   */
  const setSelectedType = useCallback((newType: string) => {
    setSelectedTypeState(newType);
    setVisiblePageSize(PAGE_LIMIT);
  }, []);

  /**
   * Clear all active filters (search and type selection) and reset visible page.
   */
  const clearFilters = useCallback(() => {
    setSearchState('');
    setSelectedTypeState(PokemonUIDefaults.ALL_TYPES);
    setVisiblePageSize(PAGE_LIMIT);
  }, []);

  return {
    visiblePokemons,
    loading,
    isLoadingMore: false,
    hasNextPage,
    error,
    search,
    selectedType,
    availableTypes,
    visibleCount: visiblePokemons.length,
    loadedCount: pokemons.length,
    totalCount: pokemons.length,
    setSearch,
    setSelectedType,
    clearFilters,
    loadMore,
    retry: loadPokemons,
  };
}
