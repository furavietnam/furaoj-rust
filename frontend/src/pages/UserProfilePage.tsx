import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Submission } from '../types';
import { fetchUser, fetchSubmissions } from '../services/api';
import { VerdictBadge } from '../components/VerdictBadge';

const DEFAULT_PROFILE: User = {
  id: 1,
  username: 'admin',
  email: 'admin@furaoj.org',
  is_staff: true,
  is_superuser: true,
  rating: 2450,
  points: 6200,
  solved_count: 190,
  date_joined: '2024-01-01T00:00:00Z',
};

const RATING_HISTORY = [
  { contest: 'Round 1', rating: 1500, date: 'Jan 2024' },
  { contest: 'Round 2', rating: 1680, date: 'Feb 2024' },
  { contest: 'Round 3', rating: 1820, date: 'Mar 2024' },
  { contest: 'Round 4', rating: 2050, date: 'Apr 2024' },
  { contest: 'Round 5', rating: 2210, date: 'May 2024' },
  { contest: 'Round 6', rating: 2450, date: 'Jun 2024' },
];

/**
 * Logic: User public profile view with rating tier analytics, interactive SVG rating chart, and submission history.
 * Input: None (URL parameter: `username`).
 * Output: JSX.Element user profile dashboard.
 */
export function UserProfilePage(): JSX.Element {
  const { username = 'admin' } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<User>(DEFAULT_PROFILE);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const u = await fetchUser(username);
        if (u && u.username) {
          setProfile(u);
        }
      } catch {
        // Fallback
      }

      try {
        const subs = await fetchSubmissions({ username });
        if (subs && subs.length > 0) {
          setUserSubmissions(subs);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, [username]);

  // Compute SVG rating chart points
  const minRating = 1400;
  const maxRating = 2600;
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const points = RATING_HISTORY.map((pt, i) => {
    const x = paddingX + (i / (RATING_HISTORY.length - 1)) * (chartWidth - 2 * paddingX);
    const y =
      chartHeight -
      paddingY -
      ((pt.rating - minRating) / (maxRating - minRating)) * (chartHeight - 2 * paddingY);
    return { x, y, ...pt };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-black font-mono text-white shadow-xl shadow-blue-600/30">
            {profile.username.slice(0, 1).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
                {profile.username}
              </h1>
              {profile.is_superuser && (
                <span className="rounded bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 text-xs font-mono font-semibold text-rose-400">
                  Platform Admin
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-400 font-mono">{profile.email}</p>
            <div className="mt-2 text-xs text-zinc-500 font-mono">
              Member since {new Date(profile.date_joined || '2024-01-01').toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4 sm:border-t-0 sm:pt-0 font-mono text-center">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs text-zinc-500 uppercase">Rating</div>
            <div className="text-2xl font-bold text-rose-400">{profile.rating || 2450}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs text-zinc-500 uppercase">Points</div>
            <div className="text-2xl font-bold text-emerald-400">{profile.points || 6200}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs text-zinc-500 uppercase">Solved</div>
            <div className="text-2xl font-bold text-blue-400">{profile.solved_count || 190}</div>
          </div>
        </div>
      </div>

      {/* Interactive SVG Rating Graph */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Contest Rating Trajectory</h2>
          <span className="font-mono text-xs text-zinc-400">Peak Rating: 2,450 (Grandmaster)</span>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
            {/* Grid Lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#27272a" strokeDasharray="4 4" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#27272a" strokeDasharray="4 4" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#27272a" />

            {/* Area Fill */}
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`}
              fill="url(#rating-gradient)"
              opacity="0.2"
            />

            <defs>
              <linearGradient id="rating-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line Path */}
            <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2" />
                <text x={pt.x} y={pt.y - 10} fill="#93c5fd" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  {pt.rating}
                </text>
                <text x={pt.x} y={chartHeight - 4} fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
                  {pt.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100">Recent Submissions</h2>
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3">#ID</th>
                <th className="px-6 py-3">Problem</th>
                <th className="px-6 py-3 text-center">Language</th>
                <th className="px-6 py-3 text-center">Verdict</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(userSubmissions.length > 0 ? userSubmissions : [
                { id: 1042, problem_code: 'aplusb', problem_title: 'A + B Problem', language: 'cpp', verdict: 'AC', score: 100 },
                { id: 1039, problem_code: 'knapsack', problem_title: '0/1 Knapsack Problem', language: 'cpp', verdict: 'WA', score: 40 },
              ]).map((s) => (
                <tr key={s.id} className="transition hover:bg-zinc-800/40">
                  <td className="px-6 py-3 font-mono text-xs text-zinc-400">#{s.id}</td>
                  <td className="px-6 py-3 font-medium text-zinc-200">
                    <Link to={`/problem/${s.problem_code || 'aplusb'}`} className="text-blue-400 hover:underline">
                      {s.problem_code || 'aplusb'}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-center font-mono text-xs uppercase text-zinc-400">{s.language}</td>
                  <td className="px-6 py-3 text-center">
                    <VerdictBadge verdict={s.verdict} size="sm" />
                  </td>
                  <td className="px-6 py-3 text-center font-mono text-xs text-zinc-200">{s.score ?? 0}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      to={`/submission/${s.id}`}
                      className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                    >
                      View &rarr;
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
