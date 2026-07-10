import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';

vi.mock('next/font/google', () => ({
  Space_Grotesk: () => ({ variable: '--font-heading' }),
  Inter: () => ({ variable: '--font-body' }),
}));

vi.mock('./providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>,
}));

import RootLayout, { metadata } from './layout';

describe('RootLayout', () => {
  it('exports expected metadata', () => {
    expect(metadata.title).toBe('Pokémon Atlas');
    expect(metadata.description).toBe(
      'Production-oriented Pokémon explorer powered by a Fastify backend.',
    );
  });

  it('renders html/body structure with providers wrapper', () => {
    const tree = RootLayout({ children: <main>content</main> }) as ReactElement;

    expect(tree.type).toBe('html');
    expect(tree.props.lang).toBe('en');
    expect(tree.props.className).toContain('--font-heading');
    expect(tree.props.className).toContain('--font-body');

    const body = tree.props.children as ReactElement;
    expect(body.type).toBe('body');

    const providers = body.props.children as ReactElement;
    expect(providers.props.children.type).toBe('main');
    expect(providers.props.children.props.children).toBe('content');
  });
});
