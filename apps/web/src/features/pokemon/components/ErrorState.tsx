import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { PokemonUIMessages } from '../constants/ui-messages';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/**
 * ErrorState displays an error alert when Pokémon data fails to load.
 *
 * Features:
 * - Shows a Material-UI error Alert with severity level
 * - Displays user-friendly error title and technical error message
 * - Includes a Retry button to allow users to re-attempt data fetch
 * - Useful for network failures, API timeouts, or misconfiguration
 *
 * @param props Component props
 * @param props.message Technical error message to display to the user
 * @param props.onRetry Callback when the retry button is clicked
 * @returns A Material-UI Alert component with error details and retry action
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {PokemonUIMessages.ERROR_RETRY}
        </Button>
      }
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {PokemonUIMessages.ERROR_TITLE}
        </Typography>
        <Box>{message}</Box>
      </Stack>
    </Alert>
  );
}
