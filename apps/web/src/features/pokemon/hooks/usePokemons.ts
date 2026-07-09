'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Pokemon } from '../types/pokemon';
import { fetchPokemons } from '../services/pokemon-api.service';
import { PokemonUIDefaults } from '../constants/ui-messages';

interface UsePokemonsResult {
  visiblePokemons: Pokemon[];
  loading: boolean;
  error: string | null;
  search: string;
  selectedType: string;
  availableTypes: string[];
  visibleCount: number;
  loadedCount: number;
  setSearch: (search: string) => void;
  setSelectedType: (type: string) => void;
  clearFilters: () => void;
  retry: () => void;
}

/**
 * Custom hook for managing Pokémon data and filtering logic.
 *
 * Responsibilities:
 * - Fetch all Pokémon from backend on mount via fetchPokemons().
 * - Maintain internal state: pokemons (raw data), loading, error, search, selectedType.
 * - Compute derived state: availableTypes (unique types from all Pokémon),
 *   visiblePokemons (filtered by search + type), visibleCount, loadedCount.
 * - Provide filter methods: setSearch, setSelectedType, clearFilters, retry.
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>(PokemonUIDefaults.ALL_TYPES);

  /**
   * Load Pokémon data from the backend.
   * Sets loading state, clears previous errors, and handles exceptions.
   */
  const loadPokemons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPokemons();
      setPokemons(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

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
  const visiblePokemons = useMemo(() => {
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
   * Clear all active filters (search and type selection).
   */
  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedType(PokemonUIDefaults.ALL_TYPES);
  }, []);

  return {
    visiblePokemons,
    loading,
    error,
    search,
    selectedType,
    availableTypes,
    visibleCount: visiblePokemons.length,
    loadedCount: pokemons.length,
    setSearch,
    setSelectedType,
    clearFilters,
    retry: loadPokemons,
  };
}
