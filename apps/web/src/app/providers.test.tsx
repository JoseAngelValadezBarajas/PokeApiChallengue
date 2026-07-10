import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Providers } from './providers';

describe('Providers', () => {
  it('renders children inside ThemeProvider', () => {
    render(
      <Providers>
        <div data-testid="child">hello</div>
      </Providers>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });
});
