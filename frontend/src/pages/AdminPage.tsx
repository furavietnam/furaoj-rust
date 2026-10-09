// Logic: Dedicated Django / DMOJ style administration portal matching /admin/.
// Input: Admin statistics, problem registry, judge cluster metrics, and user management APIs.
// Output: JSX.Element full administrative dashboard with problem creation, judge configuration, and rejudging tools.

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface AdminStats {
  total_problems: number;
  total_submissions: number;
  total_users: number;
  total_contests: number;
  online_judges: number;
}

interface JudgeItem {
  id: number;
  name: string;
  is_blocked: boolean;
  online: boolean;
  uptime_str: string;
  ping_ms: number;
  load: number;
}

interface LanguageItem {
  id: number;
  key: string;
  name: string;
  short_name: string;
  common_name: string;
  ace: string;
}

interface ProblemItem {
  id: number;
  code: string;
  name: string;
  points: number;
  time_limit: number;
  memory_limit: number;
}

interface SubmissionItem {
  id: number;
  problem_code: string;
  username: string;
  language: string;
  date: string;
  time: number | null;
  memory: number | null;
  status: string;
  result: string | null;
}

// Logic: Renders Django/DMOJ styled administration portal with model management tables and quick actions.
// Input: Active administrator credentials and backend management endpoints.
// Output: Comprehensive responsive admin dashboard with problem, judge, submission, and language modules.
export function AdminPage(): JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'problems' | 'judges' | 'submissions' | 'languages'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    total_problems: 0,
    total_submissions: 0,
    total_users: 0,
    total_contests: 0,
    online_judges: 0,
  });

  const [judges, setJudges] = useState<JudgeItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New problem modal state
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [newProbCode, setNewProbCode] = useState('');
  const [newProbName, setNewProbName] = useState('');
  const [newProbDesc, setNewProbDesc] = useState('');
  const [newProbTime, setNewProbTime] = useState(1.0);
  const [newProbMemory, setNewProbMemory] = useState(256);
  const [newProbPoints, setNewProbPoints] = useState(100.0);
  const [probSubmitting, setProbSubmitting] = useState(false);

  // New judge modal state
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeKey, setNewJudgeKey] = useState('');
  const [judgeSubmitting, setJudgeSubmitting] = useState(false);

  // Notification message
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, judgesRes, langsRes, probsRes, subsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/judges'),
        api.get('/languages'),
        api.get('/problems'),
        api.get('/submissions'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (judgesRes.status === 'fulfilled') setJudges(judgesRes.value.data);
      if (langsRes.status === 'fulfilled') setLanguages(langsRes.value.data);
      if (probsRes.status === 'fulfilled') setProblems(probsRes.value.data);
      if (subsRes.status === 'fulfilled') setSubmissions(subsRes.value.data);
    } catch {
      // Ignore background fetch error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbCode.trim() || !newProbName.trim()) return;

    setProbSubmitting(true);
    try {
      await api.post('/problems', {
        code: newProbCode.trim().toLowerCase(),
        name: newProbName.trim(),
        description: newProbDesc.trim() || 'Mô tả bài tập...',
        time_limit: newProbTime,
        memory_limit: newProbMemory,
        points: newProbPoints,
      });
      setNotice(`Bài tập ${newProbCode.toUpperCase()} đã được tạo thành công!`);
      setShowProblemModal(false);
      setNewProbCode('');
      setNewProbName('');
      setNewProbDesc('');
      fetchAdminData();
    } catch {
      setNotice('Không thể tạo bài tập. Vui lòng kiểm tra lại mã bài hoặc quyền hạn.');
    } finally {
      setProbSubmitting(false);
    }
  };

  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName.trim() || !newJudgeKey.trim()) return;

    setJudgeSubmitting(true);
    try {
      await api.post('/admin/judges', {
        name: newJudgeName.trim(),
        auth_key: newJudgeKey.trim(),
      });
      setNotice(`Máy chấm ${newJudgeName.trim()} đã được thêm thành công!`);
      setShowJudgeModal(false);
      setNewJudgeName('');
      setNewJudgeKey('');
      fetchAdminData();
    } catch {
      setNotice('Không thể thêm máy chấm. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setJudgeSubmitting(false);
    }
  };

  return (
    <div className="admin-portal" style={{ minHeight: '80vh', padding: '16px 0' }}>
      {/* Django Admin Style Header */}
      <div
        className="admin-header-strip"
        style={{
          background: '#417690',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fa fa-cogs" style={{ fontSize: '24px' }}></i>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              Quản trị Hệ thống FuraOJ
            </h1>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>
              FuraOJ Administration (Django &amp; Rust Engine Parity)
            </span>
          </div>
        </div>
        <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>
            Xin chào, <strong>{user?.username || 'admin'}</strong>.
          </span>
          <Link to="/" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}>
            Xem trang web
          </Link>
          <span style={{ opacity: 0.6 }}>|</span>
          <Link to="/status" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}>
            Cụm máy chấm
          </Link>
        </div>
      </div>

      {notice && (
        <div
          className="alert alert-success"
          style={{
            padding: '12px 18px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            color: '#10b981',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            <i className="fa fa-check-circle"></i> {notice}
          </span>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="header-segmented-control" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`seg-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <i className="fa fa-dashboard"></i> <span>Tổng quan</span>
        </button>
        <button
          onClick={() => setActiveTab('problems')}
          className={`seg-btn ${activeTab === 'problems' ? 'active' : ''}`}
        >
          <i className="fa fa-code"></i> <span>Bài tập ({stats.total_problems})</span>
        </button>
        <button
          onClick={() => setActiveTab('judges')}
          className={`seg-btn ${activeTab === 'judges' ? 'active' : ''}`}
        >
          <i className="fa fa-server"></i> <span>Máy chấm ({judges.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`seg-btn ${activeTab === 'submissions' ? 'active' : ''}`}
        >
          <i className="fa fa-tasks"></i> <span>Bài nộp ({stats.total_submissions})</span>
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`seg-btn ${activeTab === 'languages' ? 'active' : ''}`}
        >
          <i className="fa fa-terminal"></i> <span>Ngôn ngữ ({languages.length || 65})</span>
        </button>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="admin-metric-card" style={{ padding: '16px 20px', borderRadius: '8px', background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Bài tập</span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', color: '#0066ff' }}>{stats.total_problems}</h2>
              </div>
              <i className="fa fa-code" style={{ fontSize: '32px', color: 'rgba(0, 102, 255, 0.2)' }}></i>
            </div>
            <div style={{ marginTop: '12px' }}>
              <button onClick={() => setShowProblemModal(true)} className="btn btn-sm" style={{ padding: '4px 10px', fontSize: '12px', background: '#0066ff', color: '#ffffff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                + Thêm bài mới
              </button>
            </div>
          </div>

          <div className="admin-metric-card" style={{ padding: '16px 20px', borderRadius: '8px', background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Bài nộp</span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', color: '#10b981' }}>{stats.total_submissions}</h2>
              </div>
              <i className="fa fa-tasks" style={{ fontSize: '32px', color: 'rgba(16, 185, 129, 0.2)' }}></i>
            </div>
            <div style={{ marginTop: '12px' }}>
              <Link to="/submissions" style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Xem tất cả bài nộp &rarr;</Link>
            </div>
          </div>

          <div className="admin-metric-card" style={{ padding: '16px 20px', borderRadius: '8px', background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Thành viên</span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', color: '#f59e0b' }}>{stats.total_users}</h2>
              </div>
              <i className="fa fa-users" style={{ fontSize: '32px', color: 'rgba(245, 158, 11, 0.2)' }}></i>
            </div>
            <div style={{ marginTop: '12px' }}>
              <Link to="/users" style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>Quản lý người dùng &rarr;</Link>
            </div>
          </div>

          <div className="admin-metric-card" style={{ padding: '16px 20px', borderRadius: '8px', background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Máy chấm trực tuyến</span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0', color: '#8b5cf6' }}>{judges.filter(j => j.online).length}</h2>
              </div>
              <i className="fa fa-server" style={{ fontSize: '32px', color: 'rgba(139, 92, 246, 0.2)' }}></i>
            </div>
            <div style={{ marginTop: '12px' }}>
              <button onClick={() => setShowJudgeModal(true)} className="btn btn-sm" style={{ padding: '4px 10px', fontSize: '12px', background: '#8b5cf6', color: '#ffffff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                + Thêm máy chấm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problems Tab */}
      {activeTab === 'problems' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Danh sách bài tập trong hệ thống</h2>
            <button
              onClick={() => setShowProblemModal(true)}
              className="btn"
              style={{
                padding: '8px 16px',
                background: '#0066ff',
                color: '#ffffff',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-plus"></i> Thêm bài tập mới
            </button>
          </div>
          <div className="h-scrollable-table">
            <table className="table striped">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Mã bài</th>
                  <th>Tên bài tập</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Điểm</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Giới hạn thời gian</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Bộ nhớ</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0066ff' }}>
                      <Link to={`/problem/${p.code}`}>{p.code}</Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ textAlign: 'center' }}>{p.points}</td>
                    <td style={{ textAlign: 'center' }}>{p.time_limit}s</td>
                    <td style={{ textAlign: 'center' }}>{p.memory_limit} MB</td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/problem/${p.code}`} className="btn-sm" style={{ padding: '2px 8px', fontSize: '12px', color: '#0066ff', textDecoration: 'underline' }}>
                        Xem / Nộp
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Judges Tab */}
      {activeTab === 'judges' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Quản lý cụm máy chấm (Judge Daemon Registry)</h2>
            <button
              onClick={() => setShowJudgeModal(true)}
              className="btn"
              style={{
                padding: '8px 16px',
                background: '#8b5cf6',
                color: '#ffffff',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-plus"></i> Thêm máy chấm mới
            </button>
          </div>
          <div className="h-scrollable-table">
            <table className="table striped">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Tên máy chấm</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ width: '160px' }}>Thời gian chạy</th>
                  <th style={{ width: '100px' }}>Độ trễ</th>
                  <th style={{ width: '90px' }}>Tải</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Khóa chặn</th>
                </tr>
              </thead>
              <tbody>
                {judges.map((j) => (
                  <tr key={j.id}>
                    <td>{j.id}</td>
                    <td style={{ fontWeight: 700, color: '#0066ff' }}>{j.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      {j.online ? (
                        <span style={{ color: '#44AD41', fontWeight: 600 }}><i className="fa fa-check-circle"></i> Trực tuyến</span>
                      ) : (
                        <span style={{ color: '#DE2121', fontWeight: 600 }}><i className="fa fa-minus-circle"></i> Ngoại tuyến</span>
                      )}
                    </td>
                    <td>{j.uptime_str}</td>
                    <td className="font-mono">{j.ping_ms.toFixed(2)} ms</td>
                    <td className="font-mono">{j.load.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {j.is_blocked ? (
                        <span style={{ color: '#DE2121' }}>Đã chặn</span>
                      ) : (
                        <span style={{ color: '#44AD41' }}>Cho phép</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>Danh sách bài nộp và quản lý chấm lại</h2>
          <div className="h-scrollable-table">
            <table className="table striped">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>ID</th>
                  <th>Bài tập</th>
                  <th>Người nộp</th>
                  <th>Ngôn ngữ</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Kết quả</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thời gian</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Bộ nhớ</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 30).map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono">
                      <Link to={`/submission/${s.id}`}>#{s.id}</Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/problem/${s.problem_code}`}>{s.problem_code}</Link>
                    </td>
                    <td>
                      <Link to={`/user/${s.username}`}>{s.username}</Link>
                    </td>
                    <td>{s.language}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`verdict-badge verdict-${s.result || s.status}`}>
                        {s.result || s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{s.time ? `${s.time.toFixed(2)}s` : '-'}</td>
                    <td style={{ textAlign: 'center' }}>{s.memory ? `${s.memory} KB` : '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/submission/${s.id}`} style={{ fontSize: '12px', color: '#0066ff' }}>
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>
            Ngôn ngữ lập trình được hỗ trợ ({languages.length || 65} Ngôn ngữ)
          </h2>
          <div className="h-scrollable-table">
            <table className="table striped">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th style={{ width: '120px' }}>Mã khóa</th>
                  <th>Tên đầy đủ</th>
                  <th style={{ width: '140px' }}>Tên ngắn</th>
                  <th style={{ width: '140px' }}>Nhóm ngôn ngữ</th>
                  <th style={{ width: '120px' }}>Ace Mode</th>
                </tr>
              </thead>
              <tbody>
                {languages.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#0066ff' }}>
                      {l.key}
                    </td>
                    <td style={{ fontWeight: 600 }}>{l.name}</td>
                    <td>{l.short_name}</td>
                    <td>{l.common_name}</td>
                    <td className="font-mono">{l.ace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Problem Modal */}
      {showProblemModal && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 700 }}>Thêm bài tập mới vào hệ thống</h3>
            <form onSubmit={handleCreateProblem}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Mã bài tập (Code, ví dụ: aplusb, primes, solve):</label>
                <input
                  type="text"
                  required
                  value={newProbCode}
                  onChange={(e) => setNewProbCode(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  placeholder="aplusb"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Tên bài tập:</label>
                <input
                  type="text"
                  required
                  value={newProbName}
                  onChange={(e) => setNewProbName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  placeholder="A Plus B"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Thời gian (s):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newProbTime}
                    onChange={(e) => setNewProbTime(parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Bộ nhớ (MB):</label>
                  <input
                    type="number"
                    min="16"
                    value={newProbMemory}
                    onChange={(e) => setNewProbMemory(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Điểm:</label>
                  <input
                    type="number"
                    min="1"
                    value={newProbPoints}
                    onChange={(e) => setNewProbPoints(parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Mô tả đề bài (Markdown &amp; LaTeX KaTeX):</label>
                <textarea
                  rows={4}
                  value={newProbDesc}
                  onChange={(e) => setNewProbDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
                  placeholder="Cho hai số nguyên $a$ và $b$. Hãy in ra tổng $a + b$."
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={probSubmitting}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#0066ff', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {probSubmitting ? 'Đang tạo...' : 'Lưu bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Judge Modal */}
      {showJudgeModal && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 700 }}>Thêm máy chấm (Judge Server) mới</h3>
            <form onSubmit={handleCreateJudge}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Tên định danh máy chấm (Name):</label>
                <input
                  type="text"
                  required
                  value={newJudgeName}
                  onChange={(e) => setNewJudgeName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  placeholder="default-judge"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Khóa xác thực (Auth Key):</label>
                <input
                  type="text"
                  required
                  value={newJudgeKey}
                  onChange={(e) => setNewJudgeKey(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  placeholder="judge_secret_auth_key"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowJudgeModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={judgeSubmitting}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#8b5cf6', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {judgeSubmitting ? 'Đang thêm...' : 'Lưu máy chấm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
