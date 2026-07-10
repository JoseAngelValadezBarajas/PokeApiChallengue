import { Box, CircularProgress } from '@mui/material';

export function LoadingState() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40vh',
      }}
    >
      <CircularProgress color="secondary" size={64} thickness={3} />
    </Box>
  );
}
