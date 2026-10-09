// Logic: Authentic DMOJ / FuraOJ submissions stream page matching oj.fura.io.vn/submissions/.
// Input: Live submissions feed from REST API, filter parameters (status, problem, username).
// Output: Two-column layout with #submissions-table, .submission-row items, segmented tabs, and sidebox filter.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Submission } from '../types';

export function SubmissionsPage(): JSX.Element {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'best'>('all');
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

  const handleTabChange = (tab: 'all' | 'mine' | 'best') => {
    setActiveTab(tab);
    if (tab === 'all') {
      setUserFilter('');
      setStatusFilter('');
    } else if (tab === 'mine') {
      setUserFilter('admin');
      setStatusFilter('');
    } else if (tab === 'best') {
      setUserFilter('');
      setStatusFilter('AC');
    }
  };

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
              Theo dõi trạng thái chấm bài thời gian thực &bull; {submissions.length} bài nộp được ghi nhận
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => handleTabChange('all')}
              className={`seg-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              <i className="fa fa-list"></i> <span>Tất cả</span>
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={`seg-btn ${activeTab === 'mine' ? 'active' : ''}`}
            >
              <i className="fa fa-user"></i> <span>Của tôi</span>
            </button>
            <button
              onClick={() => handleTabChange('best')}
              className={`seg-btn ${activeTab === 'best' ? 'active' : ''}`}
            >
              <i className="fa fa-trophy"></i> <span>Tốt nhất</span>
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
                            {sub.problem_title || sub.problem_code || `Bài #${sub.problem_id}`}
                          </Link>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          <span className="rating rate-none admin">
                            <Link
                              to={`/user/${sub.username || 'admin'}`}
                              style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}
                            >
                              {sub.username || 'admin'}
                            </Link>
                          </span>
                          <span style={{ margin: '0 6px', color: '#cbd5e1' }}>&bull;</span>
                          <span className="time">{sub.date ? new Date(sub.date).toLocaleTimeString('vi-VN') : 'vừa xong'}</span>
                        </div>
                      </div>

                      <div className="sub-prop sub-actions-dropdown">
                        <Link
                          to={`/submission/${sub.id}`}
                          className="sub-menu-item"
                          style={{
                            padding: '6px 12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            color: '#0066ff',
                            textDecoration: 'none',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="fa fa-eye"></i> <span>Xem chi tiết</span>
                        </Link>
                      </div>
                    </div>

                    <div className="sub-usage font-mono" style={{ textAlign: 'right' }}>
                      <div className="time" style={{ fontWeight: 700, fontSize: '13px' }}>
                        {timeSec.toFixed(3)}s
                      </div>
                      <div className="memory" style={{ fontSize: '12px', color: '#64748b' }}>
                        {memMb} MB
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && !loading && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy bài nộp nào phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Filter Sidebox */}
          <div id="content-right" style={{ width: '280px', flexShrink: 0 }}>
            <div className="sidebox" style={{ padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800 }}>
                <i className="fa fa-filter" style={{ marginRight: '6px', color: '#0066ff' }}></i> Bộ lọc bài nộp
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    Mã bài tập:
                  </label>
                  <input
                    type="text"
                    value={problemFilter}
                    onChange={(e) => setProblemFilter(e.target.value)}
                    placeholder="Ví dụ: aplusb"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    Thành viên:
                  </label>
                  <input
                    type="text"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    placeholder="Ví dụ: admin"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    Trạng thái kết quả:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Tất cả kết quả</option>
                    <option value="AC">Accepted (AC)</option>
                    <option value="WA">Wrong Answer (WA)</option>
                    <option value="TLE">Time Limit Exceeded (TLE)</option>
                    <option value="MLE">Memory Limit Exceeded (MLE)</option>
                    <option value="CE">Compilation Error (CE)</option>
                    <option value="RTE">Runtime Error (RTE)</option>
                  </select>
                </div>

                {(problemFilter || userFilter || statusFilter) && (
                  <button
                    onClick={() => {
                      setProblemFilter('');
                      setUserFilter('');
                      setStatusFilter('');
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#ef4444',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fa fa-times"></i> Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
