import { describe, expect, it, vi } from 'vitest';
import { PokemonSyncJob } from '../jobs/pokemon-sync.job.js';

describe('PokemonSyncJob', () => {
  it('does not crash when background sync fails', async () => {
    const syncPokemonsUseCase = {
      execute: vi.fn().mockRejectedValue(new Error('background sync failed')),
    };

    const job = new PokemonSyncJob(syncPokemonsUseCase as never);

    expect(() => job.start()).not.toThrow();
  });
});
