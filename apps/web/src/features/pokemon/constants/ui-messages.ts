/**
 * Frontend UI constants and messages for Pokemon feature.
 * Centralized strings to avoid hardcoding across components.
 */

export const PokemonUIMessages = {
  SEARCH_LABEL: 'Search Pokémon',
  SEARCH_PLACEHOLDER: 'Search by name...',
  TYPE_FILTER_LABEL: 'Filter by Type',
  CLEAR_FILTERS: 'Clear Filters',
  LOADING: 'Loading Pokémon...',
  ERROR_TITLE: 'Failed to Load',
  ERROR_RETRY: 'Retry',
  EMPTY_TITLE: 'No Pokémon Found',
  EMPTY_MESSAGE: 'Try adjusting your search or filters',
} as const;

export const PokemonImageDefaults = {
  PLACEHOLDER_PATH: '/pokemon-placeholder.svg',
} as const;

export const PokemonAPIErrors = {
  BASE_URL_NOT_CONFIGURED: 'NEXT_PUBLIC_API_BASE_URL is not configured',
  FAILED_TO_LOAD: 'Failed to load Pokémon',
} as const;

export const PokemonUIDefaults = {
  ALL_TYPES: 'all',
} as const;
