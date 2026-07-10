/**
 * Pokemon domain constants and error messages.
 * Centralized strings to avoid hardcoding across the module.
 */

export const PokemonErrorMessages = {
  FAILED_TO_FETCH: 'Failed to fetch Pokémon data',
  UNABLE_TO_RETRIEVE: 'Unable to retrieve Pokémon data',
  POKEAPI_UNAVAILABLE: 'PokeAPI is currently unavailable',
  INVALID_PAGINATION: 'Invalid pagination parameters',
} as const;

export const PokemonErrorCodes = {
  POKEAPI_UNAVAILABLE: 'POKEAPI_UNAVAILABLE',
  SYNC_FAILED: 'SYNC_FAILED',
  INVALID_PAGINATION: 'INVALID_PAGINATION',
} as const;

export const PokemonControllerMessages = {
  HEALTH_STATUS_OK: 'ok',
} as const;
