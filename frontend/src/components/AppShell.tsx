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
    <>
      <Navbar />
      <div id="page-container">
        <main id="content">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
