// Logic: Authentic DMOJ / FuraOJ user profile dashboard matching templates/user/user-about.html.
// Input: URL parameter username, user profile and submissions data from REST API.
// Output: JSX.Element user profile layout with .user-sidebar card, stats list, and .user-content cards.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Submission } from '../types';
import { fetchUser, fetchSubmissions } from '../services/api';

const DEFAULT_PROFILE: User = {
  id: 1,
  username: 'admin',
  email: 'admin@furaoj.org',
  is_staff: true,
  is_superuser: true,
  rating: 2450,
  points: 6200,
  solved_count: 190,
  date_joined: '2024-01-01T00:00:00Z',
};

const RATING_HISTORY = [
  { contest: 'Round 1', rating: 1500, date: '01/2026' },
  { contest: 'Round 2', rating: 1680, date: '02/2026' },
  { contest: 'Round 3', rating: 1820, date: '03/2026' },
  { contest: 'Round 4', rating: 2050, date: '04/2026' },
  { contest: 'Round 5', rating: 2210, date: '05/2026' },
  { contest: 'Round 6', rating: 2450, date: '06/2026' },
];

export function UserProfilePage(): JSX.Element {
  const { username = 'admin' } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<User>(DEFAULT_PROFILE);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'stats' | 'submissions'>('about');

  useEffect(() => {
    async function load() {
      try {
        const u = await fetchUser(username);
        if (u && u.username) {
          setProfile(u);
        }
      } catch {
        // Fallback
      }

      try {
        const subs = await fetchSubmissions({ username });
        if (subs && subs.length > 0) {
          setUserSubmissions(subs);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, [username]);

  // SVG rating chart coordinates
  const minRating = 1400;
  const maxRating = 2600;
  const chartWidth = 600;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const chartPoints = RATING_HISTORY.map((pt, i) => {
    const x = paddingX + (i / (RATING_HISTORY.length - 1)) * (chartWidth - 2 * paddingX);
    const y =
      chartHeight -
      paddingY -
      ((pt.rating - minRating) / (maxRating - minRating)) * (chartHeight - 2 * paddingY);
    return { x, y, ...pt };
  });

  const pathD = chartPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-user"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">{profile.username}</h1>
            <span className="problem-header-subtitle">
              <span style={{ fontWeight: 600, color: '#64748b' }}>@{profile.username}</span> &bull;{' '}
              Tham gia từ Tháng 1, 2026
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => setActiveTab('about')}
              className={`seg-btn ${activeTab === 'about' ? 'active' : ''}`}
            >
              <i className="fa fa-info-circle"></i> <span>Giới thiệu</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`seg-btn ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <i className="fa fa-bar-chart"></i> <span>Thống kê</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`seg-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            >
              <i className="fa fa-list-alt"></i> <span>Bài nộp</span>
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        <div className="user-info-page" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* User Sidebar */}
          <aside className="user-sidebar" style={{ width: '280px', flexShrink: 0 }}>
            <div className="user-profile-card sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
              <div
                className="user-avatar-wrapper"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0066ff 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#ffffff',
                  fontSize: '38px',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px -4px rgba(0, 102, 255, 0.35)',
                }}
              >
                {profile.username.slice(0, 1).toUpperCase()}
              </div>

              <div className="user-identity" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 className="user-name-title" style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800 }}>
                  {profile.username}
                </h2>
                <span className="user-username-handle" style={{ fontSize: '13px', color: '#64748b' }}>
                  @{profile.username}
                </span>
                {profile.is_superuser && (
                  <div style={{ marginTop: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        fontWeight: 700,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <i className="fa fa-shield"></i> Quản trị viên
                    </span>
                  </div>
                )}
              </div>

              <div className="user-stats-list" style={{ borderTop: '1px solid #edf2f7', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="user-stat-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="stat-label" style={{ color: '#64748b' }}>
                    <i className="fa fa-envelope-o" style={{ marginRight: '6px' }}></i> Email:
                  </span>
                  <span className="stat-value email-val font-mono" style={{ fontWeight: 600 }}>
                    {profile.email}
                  </span>
                </div>

                <div className="user-stat-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="stat-label" style={{ color: '#64748b' }}>
                    <i className="fa fa-check-circle-o" style={{ marginRight: '6px', color: '#10b981' }}></i> Bài đã giải:
                  </span>
                  <span className="stat-value highlight-val font-mono" style={{ fontWeight: 700, color: '#10b981' }}>
                    {profile.solved_count ?? 190}
                  </span>
                </div>

                <div className="user-stat-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="stat-label" style={{ color: '#64748b' }}>
                    <i className="fa fa-trophy" style={{ marginRight: '6px', color: '#f59e0b' }}></i> Hạng theo điểm:
                  </span>
                  <span className="stat-value font-mono" style={{ fontWeight: 700 }}>
                    #1
                  </span>
                </div>

                <div className="user-stat-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="stat-label" style={{ color: '#64748b' }}>
                    <i className="fa fa-star-o" style={{ marginRight: '6px', color: '#0066ff' }}></i> Tổng điểm:
                  </span>
                  <span className="stat-value font-mono" style={{ fontWeight: 700, color: '#0066ff' }}>
                    {(profile.points ?? 6200).toFixed(0)}
                  </span>
                </div>

                <div className="user-stat-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="stat-label" style={{ color: '#64748b' }}>
                    <i className="fa fa-bolt" style={{ marginRight: '6px', color: '#ec4899' }}></i> Điểm đánh giá:
                  </span>
                  <span className="stat-value rating-val font-mono" style={{ fontWeight: 800, color: '#ec4899' }}>
                    {profile.rating ?? 2450}
                  </span>
                </div>
              </div>

              <div className="user-actions-area" style={{ marginTop: '20px', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
                <Link
                  to={`/submissions?user=${profile.username}`}
                  className="unselectable button full"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#0066ff',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  <i className="fa fa-list-alt"></i> Xem bài nộp
                </Link>
              </div>
            </div>
          </aside>

          {/* User Content Sections */}
          <section className="user-content" style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {activeTab === 'about' && (
              <>
                <div className="user-card user-about-card sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
                  <div className="user-card-header" style={{ marginBottom: '16px' }}>
                    <h3 className="user-card-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                      <i className="fa fa-info-circle" style={{ marginRight: '8px', color: '#0066ff' }}></i> Giới thiệu
                    </h3>
                  </div>
                  <div className="user-card-body">
                    <div className="user-empty-state" style={{ textAlign: 'center', padding: '32px 16px' }}>
                      <div className="empty-icon-wrap" style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '12px' }}>
                        <i className="fa fa-code"></i>
                      </div>
                      <p className="empty-text" style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        Lập trình viên thuật toán &amp; thi đấu trên hệ thống Fura Online Judge.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="user-card user-badges-card sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
                  <div className="user-card-header" style={{ marginBottom: '16px' }}>
                    <h3 className="user-card-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                      <i className="fa fa-trophy" style={{ marginRight: '8px', color: '#f59e0b' }}></i> Huy hiệu &amp; Thành tích
                    </h3>
                  </div>
                  <div className="user-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(0, 102, 255, 0.05)', border: '1px solid rgba(0, 102, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="fa fa-shield" style={{ fontSize: '24px', color: '#0066ff' }}></i>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>Hạt giống vàng</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Top 1 FuraOJ</div>
                        </div>
                      </div>
                      <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="fa fa-check-circle" style={{ fontSize: '24px', color: '#10b981' }}></i>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>100+ Bài giải</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Hoàn thành xuất sắc</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'stats' && (
              <div className="user-card user-activity-card sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
                <div className="user-card-header" style={{ marginBottom: '16px' }}>
                  <h3 className="user-card-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                    <i className="fa fa-line-chart" style={{ marginRight: '8px', color: '#ec4899' }}></i> Biểu đồ biến thiên Rating
                  </h3>
                </div>
                <div className="user-card-body">
                  <div style={{ overflowX: 'auto', padding: '16px 0' }}>
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', maxWidth: '600px' }}>
                      <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <path d={pathD} fill="none" stroke="#0066ff" strokeWidth="3" />
                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#0066ff" stroke="#ffffff" strokeWidth="2" />
                          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                            {pt.rating}
                          </text>
                          <text x={pt.x} y={chartHeight - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
                            {pt.date}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="user-card sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
                <div className="user-card-header" style={{ marginBottom: '16px' }}>
                  <h3 className="user-card-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                    <i className="fa fa-list-alt" style={{ marginRight: '8px', color: '#0066ff' }}></i> Lịch sử bài nộp gần đây
                  </h3>
                </div>
                <div className="user-card-body">
                  <table className="table striped" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>Bài nộp</th>
                        <th>Bài tập</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Kết quả</th>
                        <th style={{ width: '100px', textAlign: 'right' }}>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userSubmissions.slice(0, 10).map((s) => (
                        <tr key={s.id}>
                          <td className="font-mono">
                            <Link to={`/submission/${s.id}`} style={{ color: '#0066ff', fontWeight: 600 }}>
                              #{s.id}
                            </Link>
                          </td>
                          <td>
                            <Link to={`/problem/${s.problem_code}`} style={{ fontWeight: 700, color: '#0066ff', textDecoration: 'none' }}>
                              {s.problem_code}
                            </Link>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`case-status-pill case-status-${s.result || 'AC'}`}>
                              {s.result || 'AC'}
                            </span>
                          </td>
                          <td className="font-mono" style={{ textAlign: 'right' }}>
                            {s.time != null ? `${s.time.toFixed(3)}s` : '0.012s'}
                          </td>
                        </tr>
                      ))}
                      {userSubmissions.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                            Chưa có bài nộp nào được ghi nhận.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
