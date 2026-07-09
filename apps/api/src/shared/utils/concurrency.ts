/**
 * Apply an async mapper function to an array with bounded concurrency.
 *
 * Concurrency Control Strategy:
 * - Creates a pool of workers (limited to min(concurrency, items.length)).
 * - Each worker pulls from a shared nextIndex counter, avoiding race conditions.
 * - Workers process items until the queue is exhausted.
 * - All workers run in parallel up to the concurrency limit.
 *
 * Benefits:
 * - Prevents overwhelming external APIs (e.g., PokeAPI) with too many parallel requests.
 * - Maintains order of results (results[i] corresponds to items[i]).
 * - Simpler and more predictable than Promise.all() for rate-limiting scenarios.
 *
 * Example:
 * const pokemons = await mapWithConcurrency(
 *   pokemonUrls,
 *   20, // max 20 concurrent HTTP requests
 *   url => fetchPokemonDetails(url)
 * );
 *
 * @param items Array of items to process.
 * @param concurrency Maximum number of concurrent operations.
 * @param mapper Async function that processes an item and returns a result.
 * @returns Array of results in the same order as items.
 */
export async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  mapper: (item: TInput, index: number) => Promise<TOutput>,
): Promise<TOutput[]> {
  const results: TOutput[] = new Array(items.length);
  let nextIndex = 0;

  // Worker function: pulls items from the shared queue and processes them.
  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  // Create worker pool with concurrency limit.
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );

  // Wait for all workers to complete.
  await Promise.all(workers);
  return results;
}
