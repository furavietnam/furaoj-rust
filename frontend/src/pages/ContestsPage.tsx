import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Contest } from '../types';
import { fetchContests } from '../services/api';

const DEFAULT_CONTESTS: Contest[] = [
  {
    id: 1,
    title: 'FuraOJ Championship Round 1',
    slug: 'demo',
    description: 'The inaugural competitive round of FuraOJ v2.0 featuring 5 algorithmic challenges.',
    start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    is_visible: true,
    is_frozen: false,
  },
  {
    id: 2,
    title: 'Beginner Algorithmic Cup #4',
    slug: 'beginner-cup-4',
    description: 'An introductory contest designed for programmers new to competitive problem solving.',
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    is_visible: true,
    is_frozen: false,
  },
  {
    id: 3,
    title: 'Grand Prix of Graph Algorithms',
    slug: 'graph-grand-prix',
    description: 'Advanced graph-theoretic puzzles, maximum flow, and shortest path optimizations.',
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    end_time: new Date(Date.now() - 1000 * 60 * 60 * 68).toISOString(),
    is_visible: true,
    is_frozen: false,
  },
];

/**
 * Logic: Contests index listing active, scheduled, and past competitive programming rounds.
 * Input: None.
 * Output: JSX.Element contests catalogue page with status indicators and action buttons.
 */
export function ContestsPage(): JSX.Element {
  const [contests, setContests] = useState<Contest[]>(DEFAULT_CONTESTS);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchContests();
        if (data && data.length > 0) {
          setContests(data);
        }
      } catch {
        // Fallback to initial contests
      }
    }
    load();
  }, []);

  const getStatus = (startStr: string, endStr: string) => {
    const now = new Date().getTime();
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();

    if (now < start) {
      return { label: 'Upcoming', badge: 'bg-blue-950/60 text-blue-400 border-blue-800/40' };
    }
    if (now >= start && now <= end) {
      return { label: 'Running', badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40 animate-pulse' };
    }
    return { label: 'Ended', badge: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Competitive Contests</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Participate in real-time timed contests, earn rating points, and track live standings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contests.map((c) => {
          const status = getStatus(c.start_time, c.end_time);
          const startDate = new Date(c.start_time).toLocaleString();
          const endDate = new Date(c.end_time).toLocaleString();

          return (
            <div
              key={c.slug}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:border-zinc-700 sm:flex-row sm:items-center gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded border px-2.5 py-0.5 font-mono text-xs font-semibold ${status.badge}`}
                  >
                    {status.label}
                  </span>
                  <Link
                    to={`/contest/${c.slug}`}
                    className="text-xl font-bold text-zinc-100 hover:text-blue-400 transition"
                  >
                    {c.title}
                  </Link>
                </div>
                <p className="text-sm text-zinc-400">{c.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
                  <span>Start: {startDate}</span>
                  <span>&bull;</span>
                  <span>End: {endDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                <Link
                  to={`/contest/${c.slug}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
                >
                  Enter Contest &rarr;
                </Link>
                <Link
                  to={`/contest/${c.slug}/scoreboard`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  Scoreboard 📊
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
