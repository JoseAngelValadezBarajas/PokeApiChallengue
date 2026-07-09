'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PropsWithChildren } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#22d3ee',
    },
    secondary: {
      main: '#f59e0b',
    },
    background: {
      default: '#07111f',
      paper: 'rgba(8, 15, 27, 0.92)',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: 'var(--font-body), system-ui, sans-serif',
    h1: {
      fontFamily: 'var(--font-heading), system-ui, sans-serif',
    },
    h2: {
      fontFamily: 'var(--font-heading), system-ui, sans-serif',
    },
    h3: {
      fontFamily: 'var(--font-heading), system-ui, sans-serif',
    },
    h4: {
      fontFamily: 'var(--font-heading), system-ui, sans-serif',
    },
    h5: {
      fontFamily: 'var(--font-heading), system-ui, sans-serif',
    },
    h6: {
      fontFamily: 'var(--font-heading), system-ui, sans-serif',
    },
  },
});

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
