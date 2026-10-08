import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ScoreboardData } from '../types';
import { fetchScoreboard } from '../services/api';
import { useLiveWebSocket } from '../hooks/useWebSocket';

const DEFAULT_SCOREBOARD: ScoreboardData = {
  contest: {
    id: 1,
    title: 'FuraOJ Championship Round 1',
    slug: 'demo',
    description: 'The inaugural competitive round of FuraOJ v2.0.',
    start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    is_visible: true,
    is_frozen: false,
  },
  problems: [
    { code: 'A', title: 'A + B Problem', points: 100 },
    { code: 'B', title: 'Prime Number Sieve', points: 200 },
    { code: 'C', title: '0/1 Knapsack Problem', points: 300 },
    { code: 'D', title: 'Dijkstra Shortest Path', points: 400 },
  ],
  rows: [
    {
      rank: 1,
      user_id: 2,
      username: 'tourist',
      score: 1000,
      penalty: 142,
      problem_results: {
        A: { solved: true, attempts: 1, time_minutes: 5, points: 100 },
        B: { solved: true, attempts: 1, time_minutes: 18, points: 200 },
        C: { solved: true, attempts: 2, time_minutes: 42, points: 300 },
        D: { solved: true, attempts: 1, time_minutes: 57, points: 400 },
      },
    },
    {
      rank: 2,
      user_id: 3,
      username: 'petr',
      score: 600,
      penalty: 85,
      problem_results: {
        A: { solved: true, attempts: 1, time_minutes: 8, points: 100 },
        B: { solved: true, attempts: 1, time_minutes: 24, points: 200 },
        C: { solved: true, attempts: 1, time_minutes: 53, points: 300 },
        D: { solved: false, attempts: 3, time_minutes: 0, points: 0 },
      },
    },
    {
      rank: 3,
      user_id: 1,
      username: 'admin',
      score: 300,
      penalty: 45,
      problem_results: {
        A: { solved: true, attempts: 1, time_minutes: 12, points: 100 },
        B: { solved: true, attempts: 2, time_minutes: 33, points: 200 },
        C: { solved: false, attempts: 1, time_minutes: 0, points: 0 },
        D: { solved: false, attempts: 0, time_minutes: 0, points: 0 },
      },
    },
    {
      rank: 4,
      user_id: 4,
      username: 'brian',
      score: 100,
      penalty: 15,
      problem_results: {
        A: { solved: true, attempts: 1, time_minutes: 15, points: 100 },
        B: { solved: false, attempts: 2, time_minutes: 0, points: 0 },
        C: { solved: false, attempts: 0, time_minutes: 0, points: 0 },
        D: { solved: false, attempts: 0, time_minutes: 0, points: 0 },
      },
    },
  ],
};

/**
 * Logic: Real-time contest scoreboard table displaying rankings, penalties, and per-problem solved status.
 * Input: None (URL parameter: `slug`).
 * Output: JSX.Element responsive competitive programming standings matrix.
 */
export function ScoreboardPage(): JSX.Element {
  const { slug = 'demo' } = useParams<{ slug: string }>();
  const [data, setData] = useState<ScoreboardData>(DEFAULT_SCOREBOARD);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchScoreboard(slug);
        if (res && res.contest) {
          setData(res);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, [slug]);

  // Live WebSocket stream updates
  useLiveWebSocket();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {data.contest.title} - Scoreboard
            </h1>
            {data.contest.is_frozen && (
              <span className="rounded bg-cyan-950/70 border border-cyan-600/40 px-2.5 py-0.5 font-mono text-xs font-semibold text-cyan-400">
                Scoreboard Frozen ❄️
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time standings computed with standard ICPC/OI penalty and score formulas.
          </p>
        </div>

        <div>
          <Link
            to={`/contest/${data.contest.slug}`}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
          >
            &larr; Back to Contest
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3.5 text-center w-16">Rank</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-4 py-3.5 text-center font-bold text-zinc-200">Score</th>
                <th className="px-4 py-3.5 text-center">Penalty</th>
                {data.problems.map((prob) => (
                  <th key={prob.code} className="px-4 py-3.5 text-center">
                    <div>{prob.code}</div>
                    <div className="text-[10px] text-zinc-500 font-normal">{prob.points}p</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {data.rows.map((row) => (
                <tr key={row.username} className="transition hover:bg-zinc-800/40">
                  <td className="px-4 py-4 text-center font-bold text-zinc-300">
                    {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}
                  </td>
                  <td className="px-6 py-4 font-sans font-medium text-zinc-100">
                    <Link to={`/user/${row.username}`} className="hover:text-blue-400">
                      {row.username}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-lg text-emerald-400">
                    {row.score}
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-zinc-400">
                    {row.penalty} min
                  </td>
                  {data.problems.map((prob) => {
                    const result = row.problem_results[prob.code];
                    if (!result) {
                      return (
                        <td key={prob.code} className="px-4 py-4 text-center text-zinc-600">
                          -
                        </td>
                      );
                    }

                    if (result.solved) {
                      return (
                        <td key={prob.code} className="px-4 py-4 text-center bg-emerald-950/20 text-emerald-400">
                          <div className="font-bold">+{result.attempts > 1 ? result.attempts - 1 : ''}</div>
                          <div className="text-[10px] text-emerald-500">{result.time_minutes}'</div>
                        </td>
                      );
                    }

                    if (result.attempts > 0) {
                      return (
                        <td key={prob.code} className="px-4 py-4 text-center bg-rose-950/20 text-rose-400">
                          <div className="font-bold">-{result.attempts}</div>
                        </td>
                      );
                    }

                    return (
                      <td key={prob.code} className="px-4 py-4 text-center text-zinc-600">
                        .
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
