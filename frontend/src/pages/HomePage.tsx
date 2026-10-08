import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logic: Landing home page introducing platform features, architecture, and quick access navigation cards.
 * Input: None.
 * Output: JSX.Element landing page.
 */
export function HomePage(): JSX.Element {
  const stats = [
    { label: 'Submissions Graded', value: '1,200,000+' },
    { label: 'Judge Response Latency', value: '< 15 ms' },
    { label: 'Active Algorithmic Problems', value: '450+' },
    { label: 'PostgreSQL Native Speed', value: '100% Rust' },
  ];

  const features = [
    {
      title: 'Algorithmic Problem Archive',
      description: 'Explore hundreds of competitive programming challenges from beginner syntax to advanced graph theory and dynamic programming.',
      link: '/problems',
      linkText: 'Browse Problems',
      icon: '📚',
    },
    {
      title: 'Scheduled Contests',
      description: 'Compete in rated algorithmic contests featuring real-time scoreboard standings, penalties, and post-contest rating adjustments.',
      link: '/contests',
      linkText: 'View Contests',
      icon: '🏆',
    },
    {
      title: 'Live Real-Time Submissions',
      description: 'Watch submission verdicts stream live through WebSockets with sub-millisecond status transitions from Rust Judge Server.',
      link: '/submissions',
      linkText: 'Live Stream',
      icon: '⚡',
    },
    {
      title: 'Global Competitive Rankings',
      description: 'Climb the global rating leaderboard, earn points, track your problem-solving streak, and review performance graphs.',
      link: '/users',
      linkText: 'View Leaderboard',
      icon: '📊',
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-900/40 to-zinc-950 p-8 sm:p-12 text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono font-medium text-blue-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
          FuraOJ v2.0 &middot; Powered by Rust &amp; Linux Seccomp
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
          The Next-Generation <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Online Judge</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Blazing-fast execution, zero full-page reloads, sandboxed Linux cgroups v2 isolation, and real-time WebSocket feedback.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/problems"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
          >
            Start Solving
          </Link>
          <Link
            to="/contests"
            className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-6 py-3 font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Join a Contest
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center backdrop-blur"
          >
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-zinc-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:border-zinc-700"
          >
            <div>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
            <div className="mt-6">
              <Link
                to={f.link}
                className="inline-flex items-center gap-1.5 font-medium text-sm text-blue-400 hover:text-blue-300"
              >
                {f.linkText} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
