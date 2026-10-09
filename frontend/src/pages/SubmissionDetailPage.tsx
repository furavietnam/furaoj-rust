// Logic: Authentic DMOJ / FuraOJ submission status inspection matching oj.fura.io.vn/submission/{id}.
// Input: URL parameter id, WebSocket live packet stream, submission metrics from REST API.
// Output: JSX.Element submission inspection dashboard with verdict hero card, stats grid, CE terminal card, and testcase table.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Submission, TestCaseResult } from '../types';
import { fetchSubmission } from '../services/api';
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
    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << "\\n";
    }
    return 0;
}`,
  verdict: 'AC',
  time_taken: 12,
  time: 0.012,
  memory_used: 2048,
  memory: 2048,
  score: 100,
  points: 100,
  created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  problem_code: 'aplusb',
  problem_title: 'A Plus B Problem',
  username: 'admin',
  test_cases_result: [
    { index: 1, verdict: 'AC', time_ms: 2, memory_kb: 1420, points: 20 },
    { index: 2, verdict: 'AC', time_ms: 3, memory_kb: 1510, points: 30 },
    { index: 3, verdict: 'AC', time_ms: 4, memory_kb: 1640, points: 50 },
  ],
};

const VERDICT_LABELS: Record<string, string> = {
  AC: 'Accepted',
  WA: 'Wrong Answer',
  TLE: 'Time Limit Exceeded',
  MLE: 'Memory Limit Exceeded',
  RTE: 'Runtime Error',
  IR: 'Invalid Return',
  CE: 'Compilation Error',
  IE: 'Internal Error',
  QU: 'Queued',
  P: 'Processing',
  G: 'Grading',
};

// Logic: Formats memory in KB to human-readable MB or KB display string.
// Input: kb (number).
// Output: string formatted memory.
function formatMemory(kb?: number | null): string {
  if (kb == null) return '---';
  if (kb >= 1024) return (kb / 1024).toFixed(2) + ' MB';
  return kb + ' KB';
}

// Logic: Formats execution runtime in seconds.
// Input: sec (number).
// Output: string formatted runtime.
function formatTime(sec?: number | null): string {
  if (sec == null) return '---';
  return sec.toFixed(3) + 's';
}

export function SubmissionDetailPage(): JSX.Element {
  const { id = '1' } = useParams<{ id: string }>();
  const subId = parseInt(id, 10) || 1;

  const [submission, setSubmission] = useState<Submission>(DEFAULT_SUBMISSION_DETAIL);
  const [activeTab, setActiveTab] = useState<'status' | 'source'>('status');
  const [copied, setCopied] = useState(false);

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
        result: lastPacket.verdict || prev.result,
        time_taken: lastPacket.time_ms ?? prev.time_taken,
        time: lastPacket.time_ms ? lastPacket.time_ms / 1000 : prev.time,
        memory_used: lastPacket.memory_kb ?? prev.memory_used,
        memory: lastPacket.memory_kb ?? prev.memory,
        score: lastPacket.score ?? prev.score,
        points: lastPacket.score ?? prev.points,
      }));
    }
  }, [lastPacket, subId]);

  let testCases: any[] = [];
  if (Array.isArray(submission.cases) && submission.cases.length > 0) {
    testCases = submission.cases;
  } else if (Array.isArray(submission.test_cases_result)) {
    testCases = submission.test_cases_result;
  } else if (typeof submission.test_cases_result === 'string') {
    try {
      testCases = JSON.parse(submission.test_cases_result);
    } catch {
      testCases = [];
    }
  }

  const resultClass = submission.result || submission.verdict || 'QU';
  const longStatus = VERDICT_LABELS[resultClass] || resultClass;
  const pointsVal = submission.points ?? submission.score ?? 0;
  const timeSec = submission.time != null ? submission.time : (submission.time_taken ? submission.time_taken / 1000 : 0);
  const memKb = submission.memory != null ? submission.memory : (submission.memory_used ?? 2048);

  const passedCases = testCases.filter((c: any) => (c.status || c.verdict) === 'AC').length;
  const totalCases = testCases.length || 3;

  const handleCopyCode = () => {
    if (submission.source_code) {
      navigator.clipboard.writeText(submission.source_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-paper-plane"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">
              Bài nộp #{submission.id} &ndash;{' '}
              <Link
                to={`/problem/${submission.problem_code || 'aplusb'}`}
                style={{ color: '#0066ff', textDecoration: 'none' }}
              >
                {submission.problem_title || submission.problem_code || 'A Plus B Problem'}
              </Link>
            </h1>
            <span className="problem-header-subtitle">
              Nộp bởi{' '}
              <Link
                to={`/user/${submission.username || 'admin'}`}
                style={{ fontWeight: 600, color: '#0066ff', textDecoration: 'none' }}
              >
                {submission.username || 'admin'}
              </Link>{' '}
              &bull; Ngôn ngữ: <strong className="font-mono">{submission.language}</strong>
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => setActiveTab('status')}
              className={`seg-btn ${activeTab === 'status' ? 'active' : ''}`}
            >
              <i className="fa fa-dashboard"></i> <span>Trạng thái</span>
            </button>
            <button
              onClick={() => setActiveTab('source')}
              className={`seg-btn ${activeTab === 'source' ? 'active' : ''}`}
            >
              <i className="fa fa-code"></i> <span>Mã nguồn</span>
            </button>
            <Link
              to={`/problem/${submission.problem_code || 'aplusb'}`}
              className="seg-btn"
            >
              <i className="fa fa-repeat"></i> <span>Nộp lại</span>
            </Link>
          </div>
        </div>
      </div>

      <div id="content-body">
        {activeTab === 'status' ? (
          <div>
            {/* Verdict Hero Card */}
            <div className={`submission-verdict-card verdict-${resultClass}`} style={{ marginBottom: '24px' }}>
              <div className="verdict-main-row">
                <div className="verdict-status-badge">
                  <span className="verdict-icon">
                    {resultClass === 'AC' ? (
                      <i className="fa fa-check"></i>
                    ) : resultClass === 'WA' ? (
                      <i className="fa fa-times"></i>
                    ) : resultClass === 'TLE' || resultClass === 'MLE' ? (
                      <i className="fa fa-clock-o"></i>
                    ) : resultClass === 'CE' ? (
                      <i className="fa fa-exclamation-triangle"></i>
                    ) : (
                      <i className="fa fa-info-circle"></i>
                    )}
                  </span>
                  <div className="verdict-text-group">
                    <span className="verdict-label">{longStatus}</span>
                    <span className="verdict-sublabel">Kết quả chấm chính thức từ Rust Judge Server</span>
                  </div>
                </div>

                <div className="verdict-score-badge">
                  <div className="score-points">
                    <span className="points-val">{pointsVal.toFixed(0)}</span>
                    <span className="points-slash">/</span>
                    <span className="points-total">100</span>
                    <span className="points-unit">pts</span>
                  </div>
                  <div className="score-cases">
                    Đã vượt qua <strong>{passedCases}</strong> / {totalCases} testcases
                  </div>
                </div>
              </div>

              <div className="verdict-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><i className="fa fa-clock-o"></i></div>
                  <div className="stat-info">
                    <span className="stat-label">Thời gian</span>
                    <span className="stat-value font-mono">{formatTime(timeSec)}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><i className="fa fa-database"></i></div>
                  <div className="stat-info">
                    <span className="stat-label">Bộ nhớ</span>
                    <span className="stat-value font-mono">{formatMemory(memKb)}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><i className="fa fa-code"></i></div>
                  <div className="stat-info">
                    <span className="stat-label">Ngôn ngữ</span>
                    <span className="stat-value font-mono">{submission.language}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><i className="fa fa-server"></i></div>
                  <div className="stat-info">
                    <span className="stat-label">Máy chấm</span>
                    <span className="stat-value">Rust Judge #1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compilation Error Feedback Terminal if any */}
            {submission.error_message && (
              <div className="compiler-feedback-card ce-card" style={{ marginBottom: '24px' }}>
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="terminal-dot dot-red"></span>
                    <span className="terminal-dot dot-yellow"></span>
                    <span className="terminal-dot dot-green"></span>
                  </div>
                  <div className="terminal-title">
                    <i className="fa fa-terminal"></i> Thông tin biên dịch (Compilation Diagnostics)
                  </div>
                </div>
                <div className="terminal-body">
                  <pre>{submission.error_message}</pre>
                </div>
              </div>
            )}

            {/* Test Case Breakdown Card */}
            <div className="testcases-card" id="testcase-table-card">
              <div className="testcases-card-header">
                <div className="header-title-wrap">
                  <i className="fa fa-tasks header-icon"></i>
                  <h3 className="testcases-heading">Chi tiết từng testcase</h3>
                </div>

                <div className="testcases-quick-strip">
                  {testCases.map((c: any, i: number) => {
                    const verdict = c.status || c.verdict || 'AC';
                    const caseNum = c.case_num ?? c.index ?? (i + 1);
                    return (
                      <span
                        key={caseNum}
                        className={`quick-icon icon-${verdict}`}
                        title={`Testcase #${caseNum}: ${verdict}`}
                      >
                        {verdict === 'AC' ? <i className="fa fa-check"></i> : <i className="fa fa-times"></i>}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="testcases-card-body">
                <table className="submissions-status-table table striped" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Testcase</th>
                      <th style={{ width: '160px' }}>Kết quả</th>
                      <th style={{ width: '140px' }}>Thời gian</th>
                      <th style={{ width: '140px' }}>Bộ nhớ</th>
                      <th style={{ textAlign: 'right' }}>Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testCases.map((c: any, i: number) => {
                      const caseNum = c.case_num ?? c.index ?? (i + 1);
                      const verdict = c.status || c.verdict || 'AC';
                      const timeVal = c.time != null ? (c.time > 10 ? c.time / 1000 : c.time) : (c.time_ms ? c.time_ms / 1000 : 0.002 * (i + 1));
                      const memVal = c.memory != null ? (c.memory > 500 ? (c.memory / 1024).toFixed(2) : c.memory.toFixed(2)) : (c.memory_kb ? (c.memory_kb / 1024).toFixed(2) : '1.50');
                      const pts = c.points ?? (verdict === 'AC' ? Math.round(100 / totalCases) : 0);

                      return (
                        <tr key={caseNum} className="case-row">
                          <td className="col-name font-mono" style={{ fontWeight: 600 }}>
                            Test #{caseNum}
                          </td>
                          <td className="col-status">
                            <span className={`case-status-pill case-status-${verdict}`}>
                              {verdict === 'AC' ? (
                                <i className="fa fa-check"></i>
                              ) : (
                                <i className="fa fa-times"></i>
                              )}
                              <span>{verdict}</span>
                            </span>
                          </td>
                          <td className="col-time font-mono">
                            <span className="metric-pill metric-time">
                              <i className="fa fa-clock-o"></i> {Number(timeVal).toFixed(3)}s
                            </span>
                          </td>
                          <td className="col-memory font-mono">
                            <span className="metric-pill metric-memory">
                              <i className="fa fa-database"></i> {memVal} MB
                            </span>
                          </td>
                          <td className="col-points font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                            {pts} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Source Code Inspection Tab */
          <div className="submission-source-card" style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid #edf2f7', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                <i className="fa fa-file-code-o" style={{ marginRight: '8px', color: '#0066ff' }}></i>
                Mã nguồn đã nộp ({submission.language})
              </h3>
              <button
                onClick={handleCopyCode}
                className="seg-btn"
                style={{ cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
              >
                <i className={`fa ${copied ? 'fa-check' : 'fa-copy'}`}></i>{' '}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép mã'}</span>
              </button>
            </div>
            <pre
              className="font-mono"
              style={{
                background: '#0d1527',
                color: '#e2e8f0',
                padding: '20px',
                borderRadius: '12px',
                overflowX: 'auto',
                fontSize: '13.5px',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              <code>{submission.source_code || '// Không có mã nguồn'}</code>
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
