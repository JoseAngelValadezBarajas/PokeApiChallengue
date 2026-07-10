import type { Pokemon } from '../types/pokemon';
import { PokemonAPIErrors } from '../constants/ui-messages';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch the complete list of Pokémon from the backend API.
 *
 * This is the single point of integration between the frontend and backend.
 * The function:
 * - Validates that the API base URL is configured (via NEXT_PUBLIC_API_BASE_URL environment variable)
 * - Makes a GET request to the /pokemons endpoint
 * - Disables caching via fetch cache: 'no-store' to ensure fresh data
 * - Throws descriptive errors if the API is misconfigured or returns non-OK status
 *
 * @returns A promise resolving to the full array of Pokémon from the backend.
 * @throws Error if NEXT_PUBLIC_API_BASE_URL is not configured or if the API request fails.
 */
export async function fetchPokemons(): Promise<Pokemon[]> {
  if (!baseUrl) {
    throw new Error(PokemonAPIErrors.BASE_URL_NOT_CONFIGURED);
  }

  const url = `${baseUrl.replace(/\/$/, '')}/pokemons`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`${PokemonAPIErrors.FAILED_TO_LOAD}: ${response.status}`);
  }

  return (await response.json()) as Pokemon[];
}
