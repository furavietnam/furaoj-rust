import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Logic: Outer application shell layout providing unified navigation bar, responsive content bounds, and footer.
 * Input: `children` (React.ReactNode).
 * Output: JSX.Element structured page layout.
 */
export function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
