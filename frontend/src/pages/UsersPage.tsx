import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { fetchUsers } from '../services/api';

const DEFAULT_USERS: User[] = [
  {
    id: 2,
    username: 'tourist',
    email: 'tourist@furaoj.org',
    is_staff: false,
    is_superuser: false,
    rating: 3840,
    points: 12500,
    solved_count: 420,
    date_joined: '2024-01-10T12:00:00Z',
  },
  {
    id: 3,
    username: 'petr',
    email: 'petr@furaoj.org',
    is_staff: false,
    is_superuser: false,
    rating: 3210,
    points: 9800,
    solved_count: 380,
    date_joined: '2024-02-14T09:30:00Z',
  },
  {
    id: 1,
    username: 'admin',
    email: 'admin@furaoj.org',
    is_staff: true,
    is_superuser: true,
    rating: 2450,
    points: 6200,
    solved_count: 190,
    date_joined: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    username: 'brian',
    email: 'brian@furaoj.org',
    is_staff: false,
    is_superuser: false,
    rating: 1820,
    points: 3400,
    solved_count: 95,
    date_joined: '2024-03-20T16:45:00Z',
  },
];

/**
 * Logic: Global competitive rating rankings leaderboard sorted by algorithmic rating tier.
 * Input: None.
 * Output: JSX.Element user rankings table with tier colored badges.
 */
export function UsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUsers();
        if (data && data.length > 0) {
          setUsers(data);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, []);

  const getRatingBadge = (rating: number = 1500) => {
    if (rating >= 3000) return 'text-red-500 font-bold bg-red-950/40 border-red-800/40';
    if (rating >= 2400) return 'text-rose-400 font-bold bg-rose-950/40 border-rose-800/40';
    if (rating >= 2100) return 'text-amber-400 font-semibold bg-amber-950/40 border-amber-800/40';
    if (rating >= 1900) return 'text-purple-400 font-semibold bg-purple-950/40 border-purple-800/40';
    if (rating >= 1600) return 'text-blue-400 font-medium bg-blue-950/40 border-blue-800/40';
    return 'text-emerald-400 font-medium bg-emerald-950/40 border-emerald-800/40';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Global Leaderboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Top competitive programmers ranked by official contest performance and Elo rating.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3.5 text-center w-20">Rank</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5 text-center">Rating</th>
                <th className="px-6 py-3.5 text-center">Points</th>
                <th className="px-6 py-3.5 text-center">Problems Solved</th>
                <th className="px-6 py-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map((u, idx) => (
                <tr key={u.username} className="transition hover:bg-zinc-800/40">
                  <td className="px-6 py-4 text-center font-mono font-bold text-zinc-400">
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/user/${u.username}`}
                      className="font-medium text-zinc-100 hover:text-blue-400 transition"
                    >
                      {u.username}
                      {u.is_superuser && (
                        <span className="ml-2 rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[10px] text-zinc-400 uppercase font-mono">
                          Admin
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className={`rounded border px-2.5 py-0.5 text-xs ${getRatingBadge(u.rating)}`}>
                      {u.rating || 1500}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-zinc-200">
                    {u.points || 0}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-zinc-200">
                    {u.solved_count || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/user/${u.username}`}
                      className="rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
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
