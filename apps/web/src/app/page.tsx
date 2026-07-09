'use client';

import { Box, Container, Typography } from '@mui/material';
import { ErrorState } from '../features/pokemon/components/ErrorState';
import { EmptyState } from '../features/pokemon/components/EmptyState';
import { LoadingState } from '../features/pokemon/components/LoadingState';
import { PokemonGrid } from '../features/pokemon/components/PokemonGrid';
import { PokemonToolbar } from '../features/pokemon/components/PokemonToolbar';
import { usePokemons } from '../features/pokemon/hooks/usePokemons';

export default function HomePage() {
  const {
    visiblePokemons,
    loading,
    error,
    search,
    selectedType,
    availableTypes,
    visibleCount,
    loadedCount,
    setSearch,
    setSelectedType,
    clearFilters,
    retry,
  } = usePokemons();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{ letterSpacing: 3, color: 'secondary.light', fontWeight: 700 }}
        >
          Pokémon Atlas
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          sx={{ mt: 1, fontWeight: 700, maxWidth: 720, lineHeight: 1.05 }}
        >
          Explore the full Pokémon catalog through one fast, resilient API.
        </Typography>
        <Typography sx={{ mt: 2, maxWidth: 780, color: 'text.secondary' }}>
          Search by name and filter by type
        </Typography>
      </Box>

      <PokemonToolbar
        search={search}
        selectedType={selectedType}
        availableTypes={availableTypes}
        visibleCount={visibleCount}
        loadedCount={loadedCount}
        onSearchChange={setSearch}
        onSelectedTypeChange={setSelectedType}
        onClearFilters={clearFilters}
      />

      <Box sx={{ mt: 4 }}>
        {loading ? <LoadingState /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={retry} /> : null}
        {!loading && !error && visiblePokemons.length === 0 ? <EmptyState /> : null}
        {!loading && !error && visiblePokemons.length > 0 ? (
          <PokemonGrid pokemons={visiblePokemons} />
        ) : null}
      </Box>
    </Container>
  );
}
