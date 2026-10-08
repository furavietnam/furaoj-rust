import React from 'react';

interface VerdictBadgeProps {
  verdict: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Logic: Formats and displays standardized competitive programming verdict badges with theme colors.
 * Input: `verdict` (string status code e.g. AC, WA, TLE, MLE, CE, RTE, QU, G), `size` (optional sm/md/lg).
 * Output: JSX.Element pill badge with high-contrast styling and animations for queued/grading states.
 */
export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps): JSX.Element {
  const v = (verdict || 'QU').toUpperCase();

  let colorClasses = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let label = v;
  let isGrading = false;

  switch (v) {
    case 'AC':
      colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-600/40';
      label = 'Accepted';
      break;
    case 'WA':
      colorClasses = 'bg-rose-950/70 text-rose-400 border-rose-600/40';
      label = 'Wrong Answer';
      break;
    case 'TLE':
      colorClasses = 'bg-amber-950/70 text-amber-400 border-amber-600/40';
      label = 'Time Limit Exceeded';
      break;
    case 'MLE':
      colorClasses = 'bg-purple-950/70 text-purple-400 border-purple-600/40';
      label = 'Memory Limit Exceeded';
      break;
    case 'OLE':
      colorClasses = 'bg-pink-950/70 text-pink-400 border-pink-600/40';
      label = 'Output Limit Exceeded';
      break;
    case 'CE':
      colorClasses = 'bg-cyan-950/70 text-cyan-400 border-cyan-600/40';
      label = 'Compilation Error';
      break;
    case 'RTE':
      colorClasses = 'bg-red-950/70 text-red-400 border-red-600/40';
      label = 'Runtime Error';
      break;
    case 'QU':
      colorClasses = 'bg-blue-950/70 text-blue-400 border-blue-600/40 animate-pulse';
      label = 'Queued';
      isGrading = true;
      break;
    case 'G':
    case 'GRADING':
      colorClasses = 'bg-blue-950/70 text-blue-400 border-blue-600/40 animate-pulse';
      label = 'Grading...';
      isGrading = true;
      break;
    default:
      colorClasses = 'bg-zinc-800 text-zinc-300 border-zinc-700';
      label = v;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono font-medium ${sizeClasses} ${colorClasses}`}
    >
      {isGrading && (
        <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
      )}
      {label}
    </span>
  );
}
