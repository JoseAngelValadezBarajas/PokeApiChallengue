import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingState } from '../components/LoadingState';

describe('LoadingState', () => {
  it('renders a loading spinner', () => {
    render(<LoadingState />);

    expect(screen.getByRole('progressbar')).toBeDefined();
  });
});
