import React from 'react';

/**
 * Logic: Application footer rendering copyright, version metadata, and system architectural specifications.
 * Input: None.
 * Output: JSX.Element footer component.
 */
export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300">FuraOJ v2.0.0</span>
          <span>&bull;</span>
          <span>Rust Backend &middot; React SPA &middot; Linux Seccomp Sandbox</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>High Performance Online Judge Platform</span>
          <span>&bull;</span>
          <span>PostgreSQL Schema Native</span>
        </div>
      </div>
    </footer>
  );
}
