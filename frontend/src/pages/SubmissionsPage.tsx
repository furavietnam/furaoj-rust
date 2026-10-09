// Logic: Authentic DMOJ / FuraOJ submissions stream page matching oj.fura.io.vn/submissions/.
// Input: Live submissions feed from REST API, filter parameters (status, problem, username).
// Output: Two-column layout with #submissions-table, .submission-row items, and sidebox filter.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Submission } from '../types';

export function SubmissionsPage(): JSX.Element {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [problemFilter, setProblemFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error('Failed to load submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = submissions.filter((s) => {
    const verdict = s.result || s.verdict || '';
    if (statusFilter && verdict !== statusFilter) return false;
    if (problemFilter && s.problem_code && !s.problem_code.toLowerCase().includes(problemFilter.toLowerCase())) return false;
    if (userFilter && s.username && !s.username.toLowerCase().includes(userFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-paper-plane"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">Danh sách bài nộp</h1>
            <span className="problem-header-subtitle">
              Theo dõi trạng thái chấm bài thời gian thực
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button className="seg-btn active">
              <i className="fa fa-list"></i> <span>Tất cả</span>
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        <div id="common-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Main Left Column: Submissions rows list */}
          <div id="content-left" className="submission" style={{ flex: 1, minWidth: 0 }}>
            <div
              id="submissions-table"
              style={{
                borderRadius: '16px',
                border: '1px solid #edf2f7',
                overflow: 'hidden',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
              }}
            >
              {filtered.map((sub) => {
                const verdict = sub.result || sub.verdict || 'QU';
                const score = sub.points ?? sub.score ?? 0;
                const timeSec = sub.time != null ? sub.time : (sub.time_taken ? sub.time_taken / 1000 : 0);
                const memMb = sub.memory != null ? (sub.memory / 1024).toFixed(2) : (sub.memory_used ? (sub.memory_used / 1024).toFixed(2) : '2.00');

                return (
                  <div className="submission-row" id={String(sub.id)} key={sub.id}>
                    <div className={`sub-result ${verdict}`}>
                      <div className="score font-mono" style={{ fontWeight: 800, fontSize: '13px' }}>
                        {score.toFixed(0)} / 100
                      </div>
                      <div className="state" style={{ fontSize: '12px', fontWeight: 600 }}>
                        <span className="status font-mono">{verdict}</span> |{' '}
                        <span className="language">{sub.language}</span>
                      </div>
                    </div>

                    <div className="sub-main">
                      <div className="sub-info">
                        <div className="name" style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                          <Link
                            to={`/submission/${sub.id}`}
                            style={{ color: '#0066ff', textDecoration: 'none' }}
                          >
                            [{sub.problem_code || 'aplusb'}] &middot; Bài nộp #{sub.id}
                          </Link>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          <span className="rating rate-none user">
                            <Link
                              to={`/user/${sub.username || 'admin'}`}
                              style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}
                            >
                              {sub.username || 'admin'}
                            </Link>
                          </span>
                          <span className="time" style={{ marginLeft: '10px' }}>
                            <i className="fa fa-clock-o" style={{ marginRight: '4px' }}></i>
                            {sub.date ? new Date(sub.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Vừa xong'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sub-usage font-mono" style={{ fontSize: '12.5px', color: '#64748b' }}>
                      <div className="time" style={{ fontWeight: 600 }}>
                        {timeSec.toFixed(3)}s
                      </div>
                      <div className="memory">
                        {memMb} MB
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && !loading && (
                <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Không có bài nộp nào phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Filter sidebox */}
          <div id="content-right" className="submission" style={{ width: '300px', flexShrink: 0 }}>
            <div className="info-float">
              <div className="sidebox submission-filter-box">
                <h3>
                  <span>Lọc các bài nộp</span>
                  <i className="fa fa-search"></i>
                </h3>
                <div className="sidebox-content">
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                      <i className="fa fa-check-circle-o" style={{ marginRight: '4px' }}></i> Trạng thái
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                      }}
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="AC">Kết quả đúng (AC)</option>
                      <option value="WA">Kết quả sai (WA)</option>
                      <option value="TLE">Quá thời gian (TLE)</option>
                      <option value="MLE">Tràn bộ nhớ (MLE)</option>
                      <option value="CE">Lỗi biên dịch (CE)</option>
                      <option value="RTE">Lỗi thực thi (RTE)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                      <i className="fa fa-code" style={{ marginRight: '4px' }}></i> Mã bài
                    </label>
                    <input
                      type="text"
                      placeholder="vd: fibonacci..."
                      value={problemFilter}
                      onChange={(e) => setProblemFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                      <i className="fa fa-user" style={{ marginRight: '4px' }}></i> Thành viên
                    </label>
                    <input
                      type="text"
                      placeholder="vd: admin..."
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
