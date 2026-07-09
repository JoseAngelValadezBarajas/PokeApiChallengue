import { Card, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import type { Pokemon } from '../types/pokemon';
import { PokemonImageDefaults } from '../constants/ui-messages';

interface PokemonCardProps {
  pokemon: Pokemon;
}

/**
 * PokemonCard displays a single Pokémon in a visually appealing card layout.
 *
 * Features:
 * - Displays Pokémon image (with fallback to placeholder if unavailable)
 * - Shows Pokémon name (capitalized)
 * - Renders type chips for each type the Pokémon has (color-coded)
 * - Responsive design with dark theme and glass-morphism effects
 *
 * @param props Component props
 * @param props.pokemon The Pokemon object containing name, types, and image URL
 * @returns A Material-UI Card component displaying the Pokémon data
 */
export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: 'rgba(8, 15, 27, 0.88)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Image section with aspect ratio and fallback handling */}
      <CardMedia
        component="img"
        image={pokemon.image || PokemonImageDefaults.PLACEHOLDER_PATH}
        alt={pokemon.name}
        sx={{
          aspectRatio: '1 / 1',
          objectFit: 'contain',
          p: 2,
          background: 'rgba(255,255,255,0.02)',
        }}
      />

      {/* Content section with name and type chips */}
      <CardContent>
        <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
          {pokemon.name}
        </Typography>
        {/* Type chips in a flexible row layout */}
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {pokemon.types.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
