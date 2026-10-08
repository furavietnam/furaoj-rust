import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLiveWebSocket } from '../hooks/useWebSocket';

/**
 * Logic: Top navigation bar displaying branding, primary navigation links, live socket status, and user session controls.
 * Input: None.
 * Output: JSX.Element responsive header navigation bar.
 */
export function Navbar(): JSX.Element {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useLiveWebSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/problems', label: 'Problems' },
    { path: '/submissions', label: 'Submissions' },
    { path: '/contests', label: 'Contests' },
    { path: '/users', label: 'Rankings' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white hover:opacity-90">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 font-mono text-lg font-black text-white shadow-lg shadow-blue-500/20">
              ⚡
            </span>
            <span>Fura<span className="text-blue-500">OJ</span></span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-zinc-800 text-blue-400 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-mono text-zinc-400" title={isConnected ? 'Live WebSocket Connected' : 'WebSocket Reconnecting'}>
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="hidden sm:inline">{isConnected ? 'LIVE' : 'SYNCING'}</span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/user/${user.username}`}
                className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-200 transition hover:border-zinc-700"
              >
                <div className="h-6 w-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-bold font-mono">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-md border border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-rose-400"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
              >
                Sign In
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded p-1 text-zinc-400 hover:text-zinc-100"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
