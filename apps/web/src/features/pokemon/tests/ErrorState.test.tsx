import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from '../components/ErrorState';

describe('ErrorState', () => {
  it('renders retry button', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Network failed" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
