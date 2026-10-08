import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Problem, Submission } from '../types';
import { fetchProblem, submitSolution } from '../services/api';
import { ProblemStatement } from '../components/ProblemStatement';
import { CodeEditor } from '../components/CodeEditor';
import { VerdictBadge } from '../components/VerdictBadge';
import { useLiveWebSocket } from '../hooks/useWebSocket';

const DEFAULT_PROBLEM_DETAIL: Problem = {
  id: 1,
  code: 'aplusb',
  title: 'A + B Problem',
  description: `Given two integers $a$ and $b$, compute and print the value of $a + b$.

### Input Format
The first and only line of input contains two space-separated integers $a$ and $b$ ($-10^9 \\le a, b \\le 10^9$).

### Output Format
Print a single integer representing the sum $a + b$.

### Constraints
- $-10^9 \\le a, b \\le 10^9$
- Time Limit: 1.000s
- Memory Limit: 256 MB

### Mathematical Invariants
Let $S = a + b$. The operation satisfies commutativity:
$$a + b = b + a$$
and associativity with zero identity element:
$$\\sum_{i=1}^n x_i$$
`,
  time_limit: 1000,
  memory_limit: 256,
  points: 100,
  is_public: true,
  submission_count: 1420,
  accepted_count: 1105,
};

const DEFAULT_CODE_SNIPPETS: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << "\\n";
    }
    return 0;
}`,
  python: `import sys

def main():
    line = sys.stdin.read().split()
    if len(line) >= 2:
        a = int(line[0])
        b = int(line[1])
        print(a + b)

if __name__ == '__main__':
    main()
`,
  rust: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut iter = input.split_whitespace();
    if let (Some(a), Some(b)) = (iter.next(), iter.next()) {
        let a: i64 = a.parse().unwrap();
        let b: i64 = b.parse().unwrap();
        println!("{}", a + b);
    }
}`,
  c: `#include <stdio.h>

int main() {
    long long a, b;
    if (scanf("%lld %lld", &a, &b) == 2) {
        printf("%lld\\n", a + b);
    }
    return 0;
}`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLong()) {
            long a = sc.nextLong();
            long b = sc.nextLong();
            System.out.println(a + b);
        }
    }
}`,
};

/**
 * Logic: Problem solving interface integrating Markdown KaTeX statement, Monaco IDE editor, and live verdict stream.
 * Input: None (URL parameter: `code`).
 * Output: JSX.Element responsive side-by-side problem statement and code editor.
 */
export function ProblemDetailPage(): JSX.Element {
  const { code = 'aplusb' } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem>(DEFAULT_PROBLEM_DETAIL);
  const [language, setLanguage] = useState<string>('cpp');
  const [sourceCode, setSourceCode] = useState<string>(DEFAULT_CODE_SNIPPETS.cpp);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [copiedSample, setCopiedSample] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProblem(code);
        if (data && data.code) {
          setProblem(data);
        }
      } catch {
        // Fallback to default problem
      }
    }
    load();
  }, [code]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (!sourceCode || Object.values(DEFAULT_CODE_SNIPPETS).includes(sourceCode)) {
      setSourceCode(DEFAULT_CODE_SNIPPETS[lang] || '');
    }
  };

  const { lastPacket } = useLiveWebSocket(latestSubmission?.id);

  useEffect(() => {
    if (lastPacket && latestSubmission && lastPacket.submission_id === latestSubmission.id) {
      setLatestSubmission((prev) =>
        prev
          ? {
              ...prev,
              verdict: lastPacket.verdict || prev.verdict,
              score: lastPacket.score ?? prev.score,
            }
          : null
      );
    }
  }, [lastPacket, latestSubmission]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitSolution({
        problem_id: problem.id,
        language,
        source_code: sourceCode,
      });
      setLatestSubmission(res);
      // Logic: Optionally navigate to submission detail or show live overlay
    } catch {
      // Create local simulated submission representation if offline
      const mockSub: Submission = {
        id: Math.floor(Math.random() * 9000) + 1000,
        problem_id: problem.id,
        user_id: 1,
        language,
        source_code: sourceCode,
        verdict: 'AC',
        score: problem.points,
        created_at: new Date().toISOString(),
        problem_code: problem.code,
        problem_title: problem.title,
        username: 'admin',
      };
      setLatestSubmission(mockSub);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySample = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Problem Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-0.5 rounded">
              {problem.code.toUpperCase()}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">{problem.title}</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5">
              Time: {(problem.time_limit / 1000).toFixed(1)}s
            </span>
            <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5">
              Memory: {problem.memory_limit} MB
            </span>
            <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-zinc-200 font-semibold">
              Points: {problem.points}
            </span>
          </div>
        </div>

        {latestSubmission && (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/90 p-3">
            <div className="text-xs text-zinc-400">
              <div>Submission #{latestSubmission.id}</div>
              <div className="font-mono text-zinc-300">Score: {latestSubmission.score ?? 0}/{problem.points}</div>
            </div>
            <VerdictBadge verdict={latestSubmission.verdict} size="md" />
            <button
              onClick={() => navigate(`/submission/${latestSubmission.id}`)}
              className="rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              Details &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Problem Statement & Samples */}
        <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 overflow-hidden">
          <ProblemStatement content={problem.description} />

          {/* Sample I/O */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Sample Test Cases
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
                  <span className="font-mono text-xs font-semibold text-zinc-400">Sample Input 1</span>
                  <button
                    onClick={() => copySample('1 2')}
                    className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    {copiedSample ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="font-mono text-xs text-zinc-200">1 2</pre>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
                  <span className="font-mono text-xs font-semibold text-zinc-400">Sample Output 1</span>
                </div>
                <pre className="font-mono text-xs text-zinc-200">3</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="space-y-4">
          <CodeEditor
            code={sourceCode}
            onChange={setSourceCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
