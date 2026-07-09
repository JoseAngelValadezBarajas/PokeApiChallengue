import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { PokemonTypeFilter } from './PokemonTypeFilter';
import { PokemonUIMessages } from '../constants/ui-messages';

interface PokemonToolbarProps {
  search: string;
  selectedType: string;
  availableTypes: string[];
  visibleCount: number;
  loadedCount: number;
  onSearchChange: (value: string) => void;
  onSelectedTypeChange: (value: string) => void;
  onClearFilters: () => void;
}

/**
 * PokemonToolbar provides filtering and search controls for the Pokémon list.
 *
 * Features:
 * - Search input field for filtering by Pokémon name (case-insensitive)
 * - Type filter dropdown to narrow results by Pokémon type
 * - Clear filters button to reset both search and type selection
 * - Counter display showing visible vs. total loaded Pokémon
 * - Responsive layout: stacked on mobile, row on desktop
 * - Dark themed with glass-morphism effect
 *
 * @param props Component props
 * @param props.search Current search query string
 * @param props.selectedType Currently selected type filter (or 'all')
 * @param props.availableTypes List of unique Pokémon types to display in filter
 * @param props.visibleCount Number of Pokémon matching current filters
 * @param props.loadedCount Total number of loaded Pokémon
 * @param props.onSearchChange Callback when search value changes
 * @param props.onSelectedTypeChange Callback when type filter selection changes
 * @param props.onClearFilters Callback to clear all active filters
 * @returns A Material-UI Paper component containing filter controls and counters
 */
export function PokemonToolbar({
  search,
  selectedType,
  availableTypes,
  visibleCount,
  loadedCount,
  onSearchChange,
  onSelectedTypeChange,
  onClearFilters,
}: PokemonToolbarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(8, 15, 27, 0.82)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <Stack spacing={2}>
        {/* Filter controls row */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          {/* Search input */}
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={PokemonUIMessages.SEARCH_LABEL}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </Box>
          {/* Type filter dropdown */}
          <Box sx={{ width: { xs: '100%', md: 240 } }}>
            <PokemonTypeFilter
              availableTypes={availableTypes}
              selectedType={selectedType}
              onSelectedTypeChange={onSelectedTypeChange}
            />
          </Box>
          {/* Clear filters button */}
          <Button variant="outlined" color="secondary" onClick={onClearFilters}>
            {PokemonUIMessages.CLEAR_FILTERS}
          </Button>
        </Stack>

        {/* Display counters */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Typography variant="body2" color="text.secondary">
            Visible: <strong>{visibleCount}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loaded: <strong>{loadedCount}</strong>
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
