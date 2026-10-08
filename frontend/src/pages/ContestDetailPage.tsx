import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Contest } from '../types';
import { fetchContest } from '../services/api';

const DEFAULT_CONTEST: Contest = {
  id: 1,
  title: 'FuraOJ Championship Round 1',
  slug: 'demo',
  description: 'The inaugural competitive round of FuraOJ v2.0 featuring 5 algorithmic challenges.',
  start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  end_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  is_visible: true,
  is_frozen: false,
};

const CONTEST_PROBLEMS = [
  { code: 'A', title: 'A + B Problem', points: 100, problem_code: 'aplusb' },
  { code: 'B', title: 'Prime Number Sieve', points: 200, problem_code: 'primesieve' },
  { code: 'C', title: '0/1 Knapsack Problem', points: 300, problem_code: 'knapsack' },
  { code: 'D', title: 'Dijkstra Shortest Path', points: 400, problem_code: 'shortestpath' },
];

/**
 * Logic: Contest arena dashboard showing active contest status, countdown timer, and problem challenge matrix.
 * Input: None (URL parameter: `slug`).
 * Output: JSX.Element contest challenge view.
 */
export function ContestDetailPage(): JSX.Element {
  const { slug = 'demo' } = useParams<{ slug: string }>();
  const [contest, setContest] = useState<Contest>(DEFAULT_CONTEST);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchContest(slug);
        if (data && data.slug) {
          setContest(data);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, [slug]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-950/70 border border-emerald-600/40 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-400 animate-pulse">
              Running
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">{contest.title}</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-400">{contest.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/contest/${contest.slug}/scoreboard`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-sm"
          >
            Live Scoreboard 📊
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-200">Contest Problems</h2>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3.5">#</th>
                <th className="px-6 py-3.5">Problem Title</th>
                <th className="px-6 py-3.5 text-center">Points</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {CONTEST_PROBLEMS.map((p) => (
                <tr key={p.code} className="transition hover:bg-zinc-800/40">
                  <td className="px-6 py-4 font-mono font-bold text-blue-400">
                    {p.code}
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    <Link to={`/problem/${p.problem_code}`} className="hover:text-blue-400">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs font-semibold text-zinc-300">
                    {p.points} pts
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/problem/${p.problem_code}`}
                      className="rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-400 transition hover:bg-blue-600 hover:text-white"
                    >
                      Solve Problem &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
