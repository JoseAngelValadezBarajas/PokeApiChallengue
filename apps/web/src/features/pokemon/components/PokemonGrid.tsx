import Grid from '@mui/material/Grid';
import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';

interface PokemonGridProps {
  pokemons: Pokemon[];
}

/**
 * PokemonGrid displays a responsive grid of Pokémon cards.
 *
 * Features:
 * - Responsive breakpoints: 1 col on xs, 2 on sm, 3 on md, 4 on lg.
 * - Maps each Pokémon to a PokemonCard component.
 * - Uses Pokémon name as unique key (names are guaranteed unique).
 * - Maintains consistent 2px spacing between cards.
 *
 * @param props Component props
 * @param props.pokemons Array of Pokémon to display.
 * @returns A Material-UI Grid container with PokemonCard children.
 */
export function PokemonGrid({ pokemons }: PokemonGridProps) {
  return (
    <Grid container spacing={2}>
      {pokemons.map((pokemon) => (
        <Grid key={pokemon.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <PokemonCard pokemon={pokemon} />
        </Grid>
      ))}
    </Grid>
  );
}
