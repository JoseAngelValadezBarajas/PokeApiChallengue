import type { HttpClient } from '../../../shared/http/http-client.js';
import { FetchHttpClient } from '../../../shared/http/http-client.js';
import { retry } from '../../../shared/utils/retry.js';
import { HttpDefaults, HttpErrorPatterns } from '../../../shared/constants/http.constants.js';
import type { PokemonDetailResponse, PokemonListResponse } from '../domain/pokemon.types.js';

export interface PokeApiClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  retries?: number;
  httpClient?: HttpClient;
}

/**
 * PokeApiClient encapsulates all HTTP communication with the PokeAPI service.
 *
 * Features:
 * - Automatic retry logic for transient failures (timeouts, network errors, 5xx status codes).
 * - Configurable timeout and retry counts.
 * - Base URL normalization (removes trailing slashes).
 * - Delegation to a pluggable HttpClient for flexibility in testing and implementation.
 */
export class PokeApiClient {
  private readonly httpClient: HttpClient;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retries: number;

  /**
   * Initialize the PokeAPI client.
   *
   * @param options Configuration object.
   * @param options.baseUrl Base URL of PokeAPI (e.g., 'https://pokeapi.co/api/v2').
   * @param options.timeoutMs HTTP request timeout in milliseconds. Defaults to 10000.
   * @param options.retries Number of retry attempts on transient errors. Defaults to 2.
   * @param options.httpClient Optional custom HttpClient instance for testing.
   */
  constructor(options: PokeApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.timeoutMs = options.timeoutMs ?? HttpDefaults.DEFAULT_TIMEOUT_MS;
    this.retries = options.retries ?? HttpDefaults.DEFAULT_RETRIES;
    this.httpClient = options.httpClient ?? new FetchHttpClient();
  }

  /**
   * Fetch the total count of Pokémon available in PokeAPI.
   * No retry logic is applied since we only need a single count request.
   *
   * @returns Total number of Pokémon in the PokeAPI database.
   */
  async getPokemonCount(): Promise<number> {
    const response = await this.httpClient.getJson<PokemonListResponse>(
      `${this.baseUrl}/pokemon?limit=1`,
      { timeoutMs: this.timeoutMs },
    );
    return response.count;
  }

  /**
   * Fetch the list of all Pokémon (summary data with URLs for detailed fetches).
   *
   * Includes automatic retry on transient errors (network timeouts, 502/503/504 responses).
   *
   * @param limit Maximum number of Pokémon to fetch. Typically the total count.
   * @returns List response containing Pokémon summary items and metadata.
   */
  async getPokemonList(limit: number): Promise<PokemonListResponse> {
    return retry(
      () =>
        this.httpClient.getJson<PokemonListResponse>(
          `${this.baseUrl}/pokemon?limit=${limit}`,
          {
            timeoutMs: this.timeoutMs,
          },
        ),
      {
        retries: this.retries,
        shouldRetry: isTransientError,
      },
    );
  }

  /**
   * Fetch detailed information for a single Pokémon.
   *
   * Includes automatic retry on transient errors.
   *
   * @param url Direct URL to the Pokémon detail endpoint (from list response).
   * @returns Detailed Pokémon data including sprites, types, and all other fields.
   */
  async getPokemonDetail(url: string): Promise<PokemonDetailResponse> {
    return retry(
      () =>
        this.httpClient.getJson<PokemonDetailResponse>(url, {
          timeoutMs: this.timeoutMs,
        }),
      {
        retries: this.retries,
        shouldRetry: isTransientError,
      },
    );
  }
}

/**
 * Determine if an error is transient and should trigger a retry.
 *
 * Transient errors include:
 * - Network timeouts or aborts.
 * - 502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout).
 * - Generic fetch/network errors.
 *
 * @param error The error to check.
 * @returns True if the error is likely transient; false otherwise.
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    return HttpErrorPatterns.TRANSIENT_ERRORS_REGEX.test(error.message);
  }
  // Unknown errors default to true to attempt retry.
  return true;
}
