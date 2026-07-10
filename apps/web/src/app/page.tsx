'use client';

import { useEffect, useRef } from 'react';
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
    isLoadingMore,
    hasNextPage,
    error,
    search,
    selectedType,
    availableTypes,
    visibleCount,
    loadedCount,
    totalCount,
    setSearch,
    setSelectedType,
    clearFilters,
    loadMore,
    retry,
  } = usePokemons();

  const lazyLoadSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lazyLoadSentinelRef.current || loading || error || isLoadingMore || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: '300px',
      },
    );

    observer.observe(lazyLoadSentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [error, hasNextPage, isLoadingMore, loadMore, loading]);

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
        totalCount={totalCount}
        onSearchChange={setSearch}
        onSelectedTypeChange={setSelectedType}
        onClearFilters={clearFilters}
      />

      <Box sx={{ mt: 4 }}>
        {loading ? <LoadingState /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={retry} /> : null}
        {!loading && !error && visiblePokemons.length === 0 ? <EmptyState /> : null}
        {!loading && !error && visiblePokemons.length > 0 ? (
          <>
            <PokemonGrid pokemons={visiblePokemons} />
            {isLoadingMore ? (
              <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                Loading more Pokémon...
              </Typography>
            ) : null}
            {hasNextPage ? <Box ref={lazyLoadSentinelRef} data-testid="lazy-load-sentinel" sx={{ height: 1, mt: 2 }} /> : null}
          </>
        ) : null}
      </Box>
    </Container>
  );
}
