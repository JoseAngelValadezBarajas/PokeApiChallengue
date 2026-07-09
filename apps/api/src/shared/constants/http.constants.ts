/**
 * HTTP-related constants for external API calls.
 */

export const HttpDefaults = {
  DEFAULT_TIMEOUT_MS: 10000,
  DEFAULT_RETRIES: 2,
} as const;

export const PokeApiDefaults = {
  POKEMON_LIST_LIMIT_PARAM: 'limit',
  DEFAULT_POKEMON_DETAIL_LIMIT: 1,
} as const;

export const HttpErrorPatterns = {
  TRANSIENT_ERRORS_REGEX: /abort|timeout|fetch|network|502|503|504/i,
} as const;
