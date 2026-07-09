import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Pokémon Atlas',
  description: 'Production-oriented Pokémon explorer powered by a Fastify backend.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
