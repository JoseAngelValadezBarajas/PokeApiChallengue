import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { PokemonUIMessages, PokemonUIDefaults } from '../constants/ui-messages';

interface PokemonTypeFilterProps {
  availableTypes: string[];
  selectedType: string;
  onSelectedTypeChange: (type: string) => void;
}

/**
 * PokemonTypeFilter renders a dropdown select to filter Pokémon by type.
 *
 * Features:
 * - "All types" menu option to show all Pokémon (corresponds to selectedType === 'all').
 * - Dynamically populated with available types (sorted alphabetically from hook).
 * - Calls onSelectedTypeChange callback when selection changes.
 * - Full width dropdown with small size for toolbar integration.
 *
 * @param props Component props
 * @param props.availableTypes Array of unique type names available in the dataset.
 * @param props.selectedType Currently selected type or 'all'.
 * @param props.onSelectedTypeChange Callback when user changes the selected type.
 * @returns A Material-UI FormControl containing a populated Select dropdown.
 */
export function PokemonTypeFilter({
  availableTypes,
  selectedType,
  onSelectedTypeChange,
}: PokemonTypeFilterProps) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="pokemon-type-filter-label">
        {PokemonUIMessages.TYPE_FILTER_LABEL}
      </InputLabel>
      <Select
        labelId="pokemon-type-filter-label"
        label={PokemonUIMessages.TYPE_FILTER_LABEL}
        value={selectedType}
        onChange={(event) => onSelectedTypeChange(String(event.target.value))}
      >
        {/* "All types" option */}
        <MenuItem value={PokemonUIDefaults.ALL_TYPES}>All types</MenuItem>
        {/* Individual type options */}
        {availableTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
