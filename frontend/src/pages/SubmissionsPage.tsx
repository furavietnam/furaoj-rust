import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Submission } from '../types';
import { fetchSubmissions } from '../services/api';
import { VerdictBadge } from '../components/VerdictBadge';
import { useLiveWebSocket } from '../hooks/useWebSocket';

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 1042,
    problem_id: 1,
    user_id: 1,
    language: 'cpp',
    verdict: 'AC',
    time_taken: 12,
    memory_used: 1840,
    score: 100,
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    problem_code: 'aplusb',
    problem_title: 'A + B Problem',
    username: 'admin',
  },
  {
    id: 1041,
    problem_id: 2,
    user_id: 2,
    language: 'rust',
    verdict: 'AC',
    time_taken: 45,
    memory_used: 4210,
    score: 200,
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    problem_code: 'primesieve',
    problem_title: 'Prime Number Sieve',
    username: 'tourist',
  },
  {
    id: 1040,
    problem_id: 3,
    user_id: 3,
    language: 'python',
    verdict: 'TLE',
    time_taken: 2000,
    memory_used: 12840,
    score: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    problem_code: 'shortestpath',
    problem_title: 'Dijkstra Shortest Path',
    username: 'petr',
  },
  {
    id: 1039,
    problem_id: 4,
    user_id: 1,
    language: 'cpp',
    verdict: 'WA',
    time_taken: 18,
    memory_used: 2100,
    score: 40,
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    problem_code: 'knapsack',
    problem_title: '0/1 Knapsack Problem',
    username: 'admin',
  },
];

/**
 * Logic: Global and filtered submission feed with live WebSocket verdict synchronization.
 * Input: None.
 * Output: JSX.Element submission list table with real-time status transitions.
 */
export function SubmissionsPage(): JSX.Element {
  const [submissions, setSubmissions] = useState<Submission[]>(DEFAULT_SUBMISSIONS);
  const [verdictFilter, setVerdictFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [problemFilter, setProblemFilter] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSubmissions({
          verdict: verdictFilter || undefined,
          username: userFilter || undefined,
          problem_code: problemFilter || undefined,
        });
        if (data && data.length > 0) {
          setSubmissions(data);
        }
      } catch {
        // Fallback to initial submissions
      }
    }
    load();
  }, [verdictFilter, userFilter, problemFilter]);

  const { lastPacket } = useLiveWebSocket();

  useEffect(() => {
    if (lastPacket && lastPacket.submission_id) {
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id === lastPacket.submission_id) {
            return {
              ...s,
              verdict: lastPacket.verdict || s.verdict,
              time_taken: lastPacket.time_ms ?? s.time_taken,
              memory_used: lastPacket.memory_kb ?? s.memory_used,
              score: lastPacket.score ?? s.score,
            };
          }
          return s;
        })
      );
    }
  }, [lastPacket]);

  const filtered = submissions.filter((s) => {
    if (verdictFilter && s.verdict !== verdictFilter) return false;
    if (userFilter && s.username && !s.username.toLowerCase().includes(userFilter.toLowerCase())) return false;
    if (problemFilter && s.problem_code && !s.problem_code.toLowerCase().includes(problemFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Submissions Stream</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time evaluation verdicts streaming directly from the Rust Judge Server.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <input
          type="text"
          placeholder="Filter by problem code..."
          value={problemFilter}
          onChange={(e) => setProblemFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none w-48"
        />

        <input
          type="text"
          placeholder="Filter by username..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none w-44"
        />

        <select
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Verdicts</option>
          <option value="AC">Accepted (AC)</option>
          <option value="WA">Wrong Answer (WA)</option>
          <option value="TLE">Time Limit Exceeded (TLE)</option>
          <option value="MLE">Memory Limit Exceeded (MLE)</option>
          <option value="CE">Compilation Error (CE)</option>
          <option value="RTE">Runtime Error (RTE)</option>
          <option value="QU">Queued (QU)</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 font-mono text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-3.5">#ID</th>
                <th className="px-6 py-3.5">Problem</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5 text-center">Lang</th>
                <th className="px-6 py-3.5 text-center">Verdict</th>
                <th className="px-6 py-3.5 text-center">Time</th>
                <th className="px-6 py-3.5 text-center">Memory</th>
                <th className="px-6 py-3.5 text-center">Score</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((sub) => (
                <tr key={sub.id} className="transition hover:bg-zinc-800/40">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-zinc-400">
                    #{sub.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    <Link
                      to={`/problem/${sub.problem_code || 'aplusb'}`}
                      className="font-mono text-blue-400 hover:underline"
                    >
                      {sub.problem_code || 'aplusb'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-300">
                    <Link to={`/user/${sub.username || 'admin'}`} className="hover:text-blue-400">
                      {sub.username || 'admin'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs uppercase text-zinc-400">
                    {sub.language}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <VerdictBadge verdict={sub.verdict} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">
                    {sub.time_taken != null ? `${(sub.time_taken / 1000).toFixed(3)}s` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs text-zinc-300">
                    {sub.memory_used != null ? `${(sub.memory_used / 1024).toFixed(1)} MB` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs font-semibold text-zinc-200">
                    {sub.score ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/submission/${sub.id}`}
                      className="rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-zinc-500">
                    No submissions matched the specified filter criteria.
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
