import React from 'react';
import { TestCaseResult } from '../types';
import { VerdictBadge } from './VerdictBadge';

interface TestCaseGridProps {
  cases: TestCaseResult[];
}

/**
 * Logic: Displays individual test case execution breakdown cards in a responsive grid.
 * Input: `cases` (array of TestCaseResult items containing runtime, memory, score, verdict).
 * Output: JSX.Element responsive grid showing status, time, memory, and points per case.
 */
export function TestCaseGrid({ cases }: TestCaseGridProps): JSX.Element {
  if (!cases || cases.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-500">
        No test case breakdown available for this submission.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cases.map((c) => (
        <div
          key={c.index}
          className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 transition-colors hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-zinc-300">
              Case #{c.index}
            </span>
            <VerdictBadge verdict={c.verdict} size="sm" />
          </div>

          <div className="mt-3 space-y-1.5 border-t border-zinc-800/80 pt-2 font-mono text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="text-zinc-200">{(c.time_ms / 1000).toFixed(3)}s</span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className="text-zinc-200">{(c.memory_kb / 1024).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Score:</span>
              <span className="font-semibold text-zinc-200">{c.points} pts</span>
            </div>
          </div>

          {c.error && (
            <div className="mt-2 rounded bg-red-950/40 p-1.5 font-mono text-xs text-red-400 border border-red-800/30 truncate">
              {c.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
