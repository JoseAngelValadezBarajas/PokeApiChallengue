import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingState } from '../components/LoadingState';

describe('LoadingState', () => {
  it('renders skeletons', () => {
    const { container } = render(<LoadingState />);

    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });
});
