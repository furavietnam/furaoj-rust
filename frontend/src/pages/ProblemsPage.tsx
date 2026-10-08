import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Problem } from '../types';
import { fetchProblems } from '../services/api';

const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: 1,
    code: 'aplusb',
    title: 'A + B Problem',
    description: 'Calculate the sum of two integers $a$ and $b$. Given two integers $a, b \\in [-10^9, 10^9]$, output $a + b$.',
    time_limit: 1000,
    memory_limit: 256,
    points: 100,
    is_public: true,
    submission_count: 1420,
    accepted_count: 1105,
  },
  {
    id: 2,
    code: 'primesieve',
    title: 'Prime Number Sieve',
    description: 'Count the number of prime numbers strictly less than $N$. Find all primes $p < N$ where $N \\le 10^7$.',
    time_limit: 2000,
    memory_limit: 256,
    points: 200,
    is_public: true,
    submission_count: 850,
    accepted_count: 530,
  },
  {
    id: 3,
    code: 'shortestpath',
    title: 'Dijkstra Shortest Path',
    description: 'Find the length of the shortest path from vertex $1$ to all other vertices in a directed weighted graph with non-negative edge weights.',
    time_limit: 1500,
    memory_limit: 512,
    points: 300,
    is_public: true,
    submission_count: 610,
    accepted_count: 310,
  },
  {
    id: 4,
    code: 'knapsack',
    title: '0/1 Knapsack Problem',
    description: 'Maximize the total value of items placed into a knapsack of capacity $W$, where each item $i$ has weight $w_i$ and value $v_i$.',
    time_limit: 1000,
    memory_limit: 256,
    points: 150,
    is_public: true,
    submission_count: 940,
    accepted_count: 620,
  },
];

/**
 * Logic: Problem archive catalog page with search filtering and direct solver navigation.
 * Input: None.
 * Output: JSX.Element problem listing page with tabular problem metrics.
 */
export function ProblemsPage(): JSX.Element {
  const [problems, setProblems] = useState<Problem[]>(DEFAULT_PROBLEMS);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProblems(1, keyword || undefined);
        if (data && data.length > 0) {
          setProblems(data);
        }
      } catch {
        // Fallback to initial seed problems
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [keyword]);

  const filtered = problems.filter(
    (p) =>
      p.code.toLowerCase().includes(keyword.toLowerCase()) ||
      p.title.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Problem Archive</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse and practice programming challenges across various difficulty levels.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search problems by code or title..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Problem Title</th>
                <th className="px-6 py-3.5 text-center">Limits</th>
                <th className="px-6 py-3.5 text-center">Points</th>
                <th className="px-6 py-3.5 text-center">Acceptance</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((problem) => {
                const subCount = problem.submission_count || 1;
                const acCount = problem.accepted_count || 0;
                const acRate = ((acCount / subCount) * 100).toFixed(1);

                return (
                  <tr key={problem.code} className="transition hover:bg-zinc-800/40">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-400">
                      <Link to={`/problem/${problem.code}`} className="hover:underline">
                        {problem.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-100">
                      <Link to={`/problem/${problem.code}`} className="hover:text-blue-400 transition">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-zinc-400">
                      <span>{(problem.time_limit / 1000).toFixed(1)}s</span> &middot; <span>{problem.memory_limit}MB</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-300">
                        {problem.points} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-zinc-400">
                      <span>{acRate}%</span>
                      <span className="text-zinc-600 ml-1">({acCount}/{subCount})</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/problem/${problem.code}`}
                        className="rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-400 transition hover:bg-blue-600 hover:text-white"
                      >
                        Solve
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No problems found matching '{keyword}'.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
