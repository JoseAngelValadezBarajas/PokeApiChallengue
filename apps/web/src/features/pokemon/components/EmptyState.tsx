import { Box, Typography } from '@mui/material';
import { PokemonUIMessages } from '../constants/ui-messages';

/**
 * EmptyState displays a message when no Pokémon match the current filters.
 *
 * Features:
 * - Shows centered message in a dashed border box with glass-morphism background
 * - Suggests user actions to resolve the empty result (clear search or change type filter)
 * - Displayed when visiblePokemons.length === 0 after filters are applied
 * - Distinct from ErrorState (which indicates a fetch failure)
 *
 * @returns A Box component with centered text indicating no matching results
 */
export function EmptyState() {
  return (
    <Box
      sx={{
        p: 6,
        textAlign: 'center',
        border: '1px dashed rgba(255,255,255,0.16)',
        borderRadius: 3,
        background: 'rgba(8, 15, 27, 0.72)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {PokemonUIMessages.EMPTY_TITLE}
      </Typography>
      <Typography color="text.secondary">
        {PokemonUIMessages.EMPTY_MESSAGE}
      </Typography>
    </Box>
  );
}
