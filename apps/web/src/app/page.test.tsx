import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../features/pokemon/components/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">loading</div>,
}));

vi.mock('../features/pokemon/components/ErrorState', () => ({
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
}));

vi.mock('../features/pokemon/components/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state">empty</div>,
}));

vi.mock('../features/pokemon/components/PokemonGrid', () => ({
  PokemonGrid: ({ pokemons }: { pokemons: Array<{ name: string }> }) => (
    <div data-testid="pokemon-grid">{pokemons.map((pokemon) => pokemon.name).join(',')}</div>
  ),
}));

vi.mock('../features/pokemon/components/PokemonToolbar', () => ({
  PokemonToolbar: () => <div data-testid="pokemon-toolbar">toolbar</div>,
}));

vi.mock('../features/pokemon/hooks/usePokemons', () => ({
  usePokemons: vi.fn(),
}));

import HomePage from './page';
import { usePokemons } from '../features/pokemon/hooks/usePokemons';

const mockedUsePokemons = vi.mocked(usePokemons);
let intersectionCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | undefined;

class MockIntersectionObserver {
  constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
    intersectionCallback = callback;
  }

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

function buildState(overrides?: Partial<ReturnType<typeof usePokemons>>): ReturnType<typeof usePokemons> {
  return {
    visiblePokemons: [],
    loading: false,
    isLoadingMore: false,
    hasNextPage: false,
    error: null,
    search: '',
    selectedType: 'all',
    availableTypes: ['fire'],
    visibleCount: 0,
    loadedCount: 0,
    totalCount: 0,
    setSearch: vi.fn(),
    setSelectedType: vi.fn(),
    clearFilters: vi.fn(),
    loadMore: vi.fn().mockResolvedValue(undefined),
    retry: vi.fn(),
    ...overrides,
  };
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    intersectionCallback = undefined;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('renders loading state when loading is true', () => {
    mockedUsePokemons.mockReturnValue(buildState({ loading: true }));

    render(<HomePage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pokemon-grid')).not.toBeInTheDocument();
  });

  it('renders error state when not loading and there is an error', () => {
    mockedUsePokemons.mockReturnValue(buildState({ error: 'boom' }));

    render(<HomePage />);

    expect(screen.getByTestId('error-state')).toHaveTextContent('boom');
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pokemon-grid')).not.toBeInTheDocument();
  });

  it('renders empty state when no visible pokemons', () => {
    mockedUsePokemons.mockReturnValue(buildState());

    render(<HomePage />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pokemon-grid')).not.toBeInTheDocument();
  });

  it('renders grid when visible pokemons exist', () => {
    mockedUsePokemons.mockReturnValue(
      buildState({
        visiblePokemons: [{ name: 'pikachu', types: ['electric'], image: 'pikachu.png' }],
        visibleCount: 1,
        loadedCount: 1,
      }),
    );

    render(<HomePage />);

    expect(screen.getByTestId('pokemon-grid')).toHaveTextContent('pikachu');
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  it('calls loadMore when sentinel intersects and next page exists', () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);
    mockedUsePokemons.mockReturnValue(
      buildState({
        visiblePokemons: [{ name: 'pikachu', types: ['electric'], image: 'pikachu.png' }],
        visibleCount: 1,
        loadedCount: 1,
        totalCount: 2,
        hasNextPage: true,
        loadMore,
      }),
    );

    render(<HomePage />);

    expect(screen.getByTestId('lazy-load-sentinel')).toBeInTheDocument();
    intersectionCallback?.([{ isIntersecting: true }]);

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('renders loading-more text while incremental fetch is in progress', () => {
    mockedUsePokemons.mockReturnValue(
      buildState({
        visiblePokemons: [{ name: 'pikachu', types: ['electric'], image: 'pikachu.png' }],
        visibleCount: 1,
        loadedCount: 1,
        totalCount: 2,
        hasNextPage: true,
        isLoadingMore: true,
      }),
    );

    render(<HomePage />);

    expect(screen.getByText('Loading more Pokémon...')).toBeInTheDocument();
  });
});
