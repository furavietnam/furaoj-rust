import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Logic: Outer application shell layout providing unified navigation bar, responsive content bounds, and footer; renders bare children for /admin and raw/pdf routes to allow authentic WPAdmin layout isolation and clean printable PDF views.
 * Input: `children` (React.ReactNode).
 * Output: JSX.Element structured page layout.
 */
export function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isRaw =
    location.pathname.endsWith('/raw') ||
    location.pathname.endsWith('/raw/') ||
    location.pathname.endsWith('/pdf') ||
    location.pathname.endsWith('/pdf/');

  if (isAdmin || isRaw) {
    return <>{children}</>;
  }

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
