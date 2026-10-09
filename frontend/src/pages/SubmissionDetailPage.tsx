import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Submission, TestCaseResult } from '../types';
import { fetchSubmission } from '../services/api';
import { VerdictBadge } from '../components/VerdictBadge';
import { TestCaseGrid } from '../components/TestCaseGrid';
import { useLiveWebSocket } from '../hooks/useWebSocket';

const DEFAULT_SUBMISSION_DETAIL: Submission = {
  id: 1,
  problem_id: 1,
  user_id: 1,
  language: 'cpp',
  source_code: `#include <iostream>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (cin >> n) {
        while (n--) {
            long long a, b;
            cin >> a >> b;
            cout << a + b << "\\n";
        }
    }
    return 0;
}`,
  verdict: 'AC',
  time_taken: 14,
  memory_used: 1980,
  score: 100,
  created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  problem_code: 'aplusb',
  problem_title: 'A + B Problem',
  username: 'admin',
  test_cases_result: [
    { index: 1, verdict: 'AC', time_ms: 2, memory_kb: 1420, points: 5 },
    { index: 2, verdict: 'AC', time_ms: 3, memory_kb: 1510, points: 20 },
    { index: 3, verdict: 'AC', time_ms: 4, memory_kb: 1640, points: 75 },
  ],
};

/**
 * Logic: Submission inspection view showing verdict status, test case breakdown grid, and submitted source code.
 * Input: None (URL parameter: `id`).
 * Output: JSX.Element submission inspection dashboard.
 */
export function SubmissionDetailPage(): JSX.Element {
  const { id = '1' } = useParams<{ id: string }>();
  const subId = parseInt(id, 10) || 1;

  const [submission, setSubmission] = useState<Submission>(DEFAULT_SUBMISSION_DETAIL);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSubmission(subId);
        if (data && data.id) {
          setSubmission(data);
        }
      } catch {
        // Fallback to default
      }
    }
    load();
  }, [subId]);

  const { lastPacket } = useLiveWebSocket(subId);

  useEffect(() => {
    if (lastPacket && lastPacket.submission_id === subId) {
      setSubmission((prev) => ({
        ...prev,
        verdict: lastPacket.verdict || prev.verdict,
        time_taken: lastPacket.time_ms ?? prev.time_taken,
        memory_used: lastPacket.memory_kb ?? prev.memory_used,
        score: lastPacket.score ?? prev.score,
      }));
    }
  }, [lastPacket, subId]);

  let testCases: TestCaseResult[] = [];
  if (Array.isArray(submission.test_cases_result)) {
    testCases = submission.test_cases_result as TestCaseResult[];
  } else if (typeof submission.test_cases_result === 'string') {
    try {
      testCases = JSON.parse(submission.test_cases_result);
    } catch {
      testCases = [];
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              Submission #{submission.id}
            </h1>
            <VerdictBadge verdict={submission.verdict} size="lg" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <div>
              Problem:{' '}
              <Link
                to={`/problem/${submission.problem_code || 'aplusb'}`}
                className="font-bold text-blue-400 hover:underline"
              >
                {submission.problem_code || 'aplusb'} - {submission.problem_title || 'A + B Problem'}
              </Link>
            </div>
            <span>&bull;</span>
            <div>
              User:{' '}
              <Link
                to={`/user/${submission.username || 'admin'}`}
                className="font-bold text-zinc-200 hover:text-blue-400"
              >
                {submission.username || 'admin'}
              </Link>
            </div>
            <span>&bull;</span>
            <div>Language: <span className="uppercase text-zinc-200">{submission.language}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-lg border border-zinc-800 bg-zinc-950/80 px-6 py-3 font-mono text-center">
          <div>
            <div className="text-xs text-zinc-500 uppercase">Score</div>
            <div className="text-xl font-bold text-zinc-100">{submission.score ?? 0} pts</div>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div>
            <div className="text-xs text-zinc-500 uppercase">Runtime</div>
            <div className="text-xl font-bold text-zinc-100">
              {submission.time_taken != null ? `${(submission.time_taken / 1000).toFixed(3)}s` : '-'}
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div>
            <div className="text-xs text-zinc-500 uppercase">Memory</div>
            <div className="text-xl font-bold text-zinc-100">
              {submission.memory_used != null ? `${(submission.memory_used / 1024).toFixed(1)} MB` : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Output block if any */}
      {submission.error_message && (
        <div className="rounded-xl border border-red-800/40 bg-red-950/20 p-4">
          <div className="font-mono text-xs font-semibold uppercase text-red-400 mb-2">
            Compilation / Runtime Diagnostics
          </div>
          <pre className="overflow-x-auto font-mono text-xs text-red-300 leading-relaxed">
            {submission.error_message}
          </pre>
        </div>
      )}

      {/* Test Cases Breakdown */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-200">Execution Test Cases</h2>
        <TestCaseGrid cases={testCases} />
      </div>

      {/* Source Code Viewer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-200">Submitted Solution Source</h2>
          <button
            onClick={() => navigator.clipboard.writeText(submission.source_code || '')}
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            Copy Code
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-inner">
          <pre className="overflow-x-auto font-mono text-xs text-zinc-200 leading-relaxed">
            {submission.source_code || '// No source code available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
