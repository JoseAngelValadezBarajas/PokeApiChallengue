import Grid from '@mui/material/Grid';
import { Skeleton, Stack } from '@mui/material';

/**
 * LoadingState displays a skeleton loading placeholder while Pokémon data is being fetched.
 *
 * Features:
 * - Shows 8 skeleton cards in a responsive grid layout (matching final grid structure)
 * - Each skeleton has a rectangular placeholder for image, text for name, and rounded for chips
 * - Provides visual feedback that data is loading without blocking the UI
 * - Responsive: 1 col on xs, 2 on sm, 3 on md, 4 on lg
 *
 * @returns A Grid component with skeleton placeholders
 */
export function LoadingState() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Stack spacing={1} sx={{ p: 2, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3 }}>
            <Skeleton variant="rectangular" height={220} />
            <Skeleton variant="text" height={32} width="60%" />
            <Skeleton variant="rounded" height={28} width="40%" />
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
