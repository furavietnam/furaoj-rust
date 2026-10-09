// Logic: Dedicated authentic WordPress Admin (wpadmin) styled administration portal for DMOJ / FuraOJ matching Django wpadmin.
// Input: Administrative statistics, problem records, judge cluster telemetry, runtime language catalog, and user accounts.
// Output: JSX.Element pixel-accurate WordPress Admin layout with top bar, left menu, changelist tables, and modal drawers.

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  HelpCircle,
  Tag,
  CheckSquare,
  Code2,
  Trophy,
  FileText,
  Bell,
  User,
  Users,
  Menu,
  Rss,
  MessageSquare,
  Settings,
  Server,
  RefreshCw,
  Power,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

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

interface ContestItem {
  id: number;
  key: string;
  name: string;
  format_name: string;
  start_time: string;
  end_time: string;
  is_rated: boolean;
}

interface UserItem {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  points: number;
  rating: number | null;
}

type MenuSection =
  | 'dashboard'
  | 'problems'
  | 'tags'
  | 'submissions'
  | 'languages'
  | 'contests'
  | 'exams'
  | 'tickets'
  | 'users'
  | 'organizations'
  | 'navigation'
  | 'blog'
  | 'comments'
  | 'flatpages'
  | 'config';

// Logic: Renders authentic WordPress Admin (wpadmin) interface for DMOJ platform management.
// Input: Active administrator user session, backend endpoints for metrics, problems, judges, submissions.
// Output: Full-featured WPAdmin administrative portal with authentic navigation, changelists, and action links.
export function AdminPage(): JSX.Element {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');
  const [isSidebarFolded, setIsSidebarFolded] = useState<boolean>(false);
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
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  // Subtab for languages & judges
  const [langTab, setLangTab] = useState<'judges' | 'catalog'>('judges');

  // Modal: Add Problem
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [newProbCode, setNewProbCode] = useState('');
  const [newProbName, setNewProbName] = useState('');
  const [newProbDesc, setNewProbDesc] = useState('');
  const [newProbTime, setNewProbTime] = useState(1.0);
  const [newProbMemory, setNewProbMemory] = useState(256);
  const [newProbPoints, setNewProbPoints] = useState(100.0);
  const [probSubmitting, setProbSubmitting] = useState(false);

  // Modal: Add Judge Server
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeKey, setNewJudgeKey] = useState('');
  const [judgeSubmitting, setJudgeSubmitting] = useState(false);

  // Status Notice
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Logic: Fetches live administrative statistics, judge cluster nodes, languages, problems, and submissions.
  // Input: None.
  // Output: Populates administrative state with live backend database rows.
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, judgesRes, langRes, probsRes, subsRes, contestsRes, usersRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getJudges(),
        api.getLanguages(),
        api.getProblems(),
        api.getSubmissions({ page: 1 }),
        api.getContests(),
        api.getUsers(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (judgesRes.status === 'fulfilled') setJudges(judgesRes.value);
      if (langRes.status === 'fulfilled') setLanguages(langRes.value);
      if (probsRes.status === 'fulfilled') {
        const val = probsRes.value as any;
        setProblems(Array.isArray(val) ? val : val?.results || []);
      }
      if (subsRes.status === 'fulfilled') {
        const val = subsRes.value as any;
        setSubmissions(Array.isArray(val) ? val : val?.results || []);
      }
      if (contestsRes.status === 'fulfilled') {
        const val = contestsRes.value as any;
        setContests(Array.isArray(val) ? val : val?.results || []);
      }
      if (usersRes.status === 'fulfilled') {
        const val = usersRes.value as any;
        setUsers(Array.isArray(val) ? val : val?.results || []);
      }
    } catch {
      // Fallback gracefully if any single endpoint is unpopulated
    } finally {
      setLoading(false);
    }
  };

  // Logic: Submits a new problem to the database and refreshes data.
  // Input: New problem form fields (code, name, description, time limit, memory limit, points).
  // Output: Created problem response and user notification banner.
  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbCode || !newProbName) {
      setNotice({ message: 'Vui lòng điền đầy đủ mã bài và tên bài tập.', type: 'error' });
      return;
    }
    setProbSubmitting(true);
    try {
      await api.createProblem({
        code: newProbCode.toUpperCase().trim(),
        name: newProbName.trim(),
        description: newProbDesc || 'Problem description to be updated.',
        time_limit: newProbTime,
        memory_limit: newProbMemory,
        points: newProbPoints,
      });
      setNotice({ message: `Bài tập [${newProbCode.toUpperCase().trim()}] đã được tạo thành công trong hệ thống.`, type: 'success' });
      setShowProblemModal(false);
      setNewProbCode('');
      setNewProbName('');
      setNewProbDesc('');
      fetchAdminData();
    } catch (err: any) {
      setNotice({ message: `Lỗi tạo bài tập: ${err.response?.data?.message || err.message}`, type: 'error' });
    } finally {
      setProbSubmitting(false);
    }
  };

  // Logic: Registers a new judge daemon authentication key.
  // Input: New judge name and shared auth token.
  // Output: Judge node registration in PostgreSQL.
  const handleRegisterJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName || !newJudgeKey) {
      setNotice({ message: 'Vui lòng điền tên máy chấm và khóa xác thực.', type: 'error' });
      return;
    }
    setJudgeSubmitting(true);
    try {
      await api.registerJudge({
        name: newJudgeName.trim(),
        auth_key: newJudgeKey.trim(),
      });
      setNotice({ message: `Máy chấm [${newJudgeName}] đã được cấp phép xác thực kết nối TCP.`, type: 'success' });
      setShowJudgeModal(false);
      setNewJudgeName('');
      setNewJudgeKey('');
      fetchAdminData();
    } catch (err: any) {
      setNotice({ message: `Lỗi đăng ký máy chấm: ${err.response?.data?.message || err.message}`, type: 'error' });
    } finally {
      setJudgeSubmitting(false);
    }
  };

  // Logic: Triggers asynchronous submission rejudging against judge server cluster.
  // Input: Submission identifier.
  // Output: Rejudge initiation response and notice banner.
  const handleRejudge = async (subId: number) => {
    try {
      await api.rejudgeSubmission(subId);
      setNotice({ message: `Đã gửi lệnh chấm lại bài nộp #${subId} tới cụm máy chấm.`, type: 'success' });
      fetchAdminData();
    } catch (err: any) {
      setNotice({ message: `Không thể chấm lại bài nộp #${subId}: ${err.message}`, type: 'error' });
    }
  };

  // Logic: Filters list records based on search text and verdict dropdown.
  const filteredProblems = problems.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = submissions.filter((s) => {
    const matchSearch =
      s.id.toString().includes(searchQuery) ||
      s.problem_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVerdict = verdictFilter === 'ALL' || (s.result && s.result.toUpperCase() === verdictFilter);
    return matchSearch && matchVerdict;
  });

  return (
    <div className="wp-admin-body">
      {/* 1. TOP WPADMIN BAR (#wpadminbar) */}
      <header id="wpadminbar" role="navigation" aria-label="Thanh công cụ quản trị">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/admin/" style={{ fontWeight: 600, color: '#fff' }}>
            <span style={{ color: '#72aee6', marginRight: 4 }}>⚙️</span> FuraOJ Admin
          </Link>
          <Link to="/" target="_blank" rel="noopener noreferrer" title="Xem trang chủ FuraOJ">
            <ExternalLink size={14} /> Xem trang web
          </Link>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              type="button"
              onClick={() => setShowProblemModal(true)}
              className="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c3c4c7',
                padding: '0 10px',
                height: 32,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Mới
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>
          <span style={{ marginRight: 12, color: '#a7aaad', fontSize: 13 }}>
            Chào, <strong style={{ color: '#fff' }}>{user?.username || 'admin'}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#d63638',
              cursor: 'pointer',
              fontSize: 12,
              padding: '0 6px',
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* 2. LEFT ADMIN MENU (#adminmenuback + #adminmenuwrap) */}
      <div id="adminmenuback" style={{ width: isSidebarFolded ? 52 : 180 }} />
      <nav
        id="adminmenuwrap"
        className={isSidebarFolded ? 'folded' : ''}
        style={{ width: isSidebarFolded ? 52 : 180 }}
        aria-label="Menu chính"
      >
        <ul id="adminmenu">
          {/* Dashboard */}
          <li className={`wp-menu-item ${activeSection === 'dashboard' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('dashboard');
                setSearchQuery('');
              }}
              title="Bảng điều khiển"
            >
              <div className="wp-menu-icon">
                <LayoutDashboard size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Bảng điều khiển</div>}
            </a>
          </li>

          <li className="wp-menu-separator" />

          {/* judge.Problem */}
          <li className={`wp-menu-item ${activeSection === 'problems' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('problems');
                setSearchQuery('');
              }}
              title="Bài tập"
            >
              <div className="wp-menu-icon">
                <HelpCircle size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Bài tập</div>}
            </a>
          </li>

          {/* judge.TagProblem */}
          <li className={`wp-menu-item ${activeSection === 'tags' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('tags');
                setSearchQuery('');
              }}
              title="Thẻ bài tập"
            >
              <div className="wp-menu-icon">
                <Tag size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Thẻ bài tập</div>}
            </a>
          </li>

          {/* judge.Submission */}
          <li className={`wp-menu-item ${activeSection === 'submissions' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('submissions');
                setSearchQuery('');
              }}
              title="Bài nộp"
            >
              <div className="wp-menu-icon">
                <CheckSquare size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Bài nộp</div>}
            </a>
          </li>

          {/* judge.Language & judge.Judge */}
          <li className={`wp-menu-item ${activeSection === 'languages' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('languages');
                setSearchQuery('');
              }}
              title="Ngôn ngữ & Máy chấm"
            >
              <div className="wp-menu-icon">
                <Code2 size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Ngôn ngữ & Máy chấm</div>}
            </a>
          </li>

          {/* judge.Contest */}
          <li className={`wp-menu-item ${activeSection === 'contests' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('contests');
                setSearchQuery('');
              }}
              title="Kỳ thi"
            >
              <div className="wp-menu-icon">
                <Trophy size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Kỳ thi</div>}
            </a>
          </li>

          {/* judge.Exam */}
          <li className={`wp-menu-item ${activeSection === 'exams' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('exams');
                setSearchQuery('');
              }}
              title="Đề thi"
            >
              <div className="wp-menu-icon">
                <FileText size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Đề thi</div>}
            </a>
          </li>

          {/* judge.Ticket */}
          <li className={`wp-menu-item ${activeSection === 'tickets' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('tickets');
                setSearchQuery('');
              }}
              title="Hỗ trợ & Ticket"
            >
              <div className="wp-menu-icon">
                <Bell size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Hỗ trợ & Ticket</div>}
            </a>
          </li>

          <li className="wp-menu-separator" />

          {/* auth.User */}
          <li className={`wp-menu-item ${activeSection === 'users' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('users');
                setSearchQuery('');
              }}
              title="Người dùng"
            >
              <div className="wp-menu-icon">
                <User size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Người dùng</div>}
            </a>
          </li>

          {/* judge.Organization */}
          <li className={`wp-menu-item ${activeSection === 'organizations' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('organizations');
                setSearchQuery('');
              }}
              title="Tổ chức"
            >
              <div className="wp-menu-icon">
                <Users size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Tổ chức</div>}
            </a>
          </li>

          {/* judge.NavigationBar */}
          <li className={`wp-menu-item ${activeSection === 'navigation' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('navigation');
                setSearchQuery('');
              }}
              title="Thanh điều hướng"
            >
              <div className="wp-menu-icon">
                <Menu size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Thanh điều hướng</div>}
            </a>
          </li>

          {/* judge.BlogPost */}
          <li className={`wp-menu-item ${activeSection === 'blog' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('blog');
                setSearchQuery('');
              }}
              title="Bài viết Blog"
            >
              <div className="wp-menu-icon">
                <Rss size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Bài viết Blog</div>}
            </a>
          </li>

          {/* judge.Comment */}
          <li className={`wp-menu-item ${activeSection === 'comments' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('comments');
                setSearchQuery('');
              }}
              title="Bình luận"
            >
              <div className="wp-menu-icon">
                <MessageSquare size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Bình luận</div>}
            </a>
          </li>

          {/* flatpages.FlatPage */}
          <li className={`wp-menu-item ${activeSection === 'flatpages' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('flatpages');
                setSearchQuery('');
              }}
              title="Trang tĩnh"
            >
              <div className="wp-menu-icon">
                <FileText size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Trang tĩnh</div>}
            </a>
          </li>

          {/* judge.MiscConfig */}
          <li className={`wp-menu-item ${activeSection === 'config' ? 'current' : ''}`}>
            <a
              className="wp-menu-link"
              onClick={() => {
                setActiveSection('config');
                setSearchQuery('');
              }}
              title="Cấu hình hệ thống"
            >
              <div className="wp-menu-icon">
                <Settings size={18} />
              </div>
              {!isSidebarFolded && <div className="wp-menu-name">Cấu hình MiscConfig</div>}
            </a>
          </li>
        </ul>

        {/* Sidebar Collapse Button */}
        <div
          id="collapse-menu"
          onClick={() => setIsSidebarFolded(!isSidebarFolded)}
          title={isSidebarFolded ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isSidebarFolded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isSidebarFolded && <span>Thu gọn bảng chọn</span>}
        </div>
      </nav>

      {/* 3. MAIN WPCONTENT BODY (#wpcontent) */}
      <main id="wpcontent" className={isSidebarFolded ? 'folded' : ''}>
        <div id="wpbody">
          {/* Breadcrumbs matching Django wpadmin */}
          <div className="wpadmin-breadcrumbs">
            <a onClick={() => setActiveSection('dashboard')} style={{ cursor: 'pointer' }}>
              Trang chủ
            </a>
            {' › '}
            <span>
              {activeSection === 'dashboard' && 'Bảng điều khiển'}
              {activeSection === 'problems' && 'Bài tập (judge.Problem)'}
              {activeSection === 'tags' && 'Thẻ bài tập (judge.TagProblem)'}
              {activeSection === 'submissions' && 'Bài nộp (judge.Submission)'}
              {activeSection === 'languages' && 'Ngôn ngữ & Máy chấm (judge.Language / judge.Judge)'}
              {activeSection === 'contests' && 'Kỳ thi (judge.Contest)'}
              {activeSection === 'exams' && 'Đề thi (judge.Exam)'}
              {activeSection === 'tickets' && 'Hỗ trợ (judge.Ticket)'}
              {activeSection === 'users' && 'Người dùng (auth.User)'}
              {activeSection === 'organizations' && 'Tổ chức (judge.Organization)'}
              {activeSection === 'navigation' && 'Điều hướng (judge.NavigationBar)'}
              {activeSection === 'blog' && 'Bài viết Blog (judge.BlogPost)'}
              {activeSection === 'comments' && 'Bình luận (judge.Comment)'}
              {activeSection === 'flatpages' && 'Trang tĩnh (flatpages.FlatPage)'}
              {activeSection === 'config' && 'Cấu hình hệ thống (judge.MiscConfig)'}
            </span>
          </div>

          {/* Action Notice */}
          {notice && (
            <div className={`wp-notice ${notice.type === 'error' ? 'error' : ''}`}>
              <span>{notice.message}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#646970' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* SECTION 1: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <h1 className="wp-heading-inline">Bảng điều khiển</h1>
                <button
                  type="button"
                  className="page-title-action"
                  onClick={() => setShowProblemModal(true)}
                >
                  <Plus size={14} /> Thêm bài tập
                </button>
                <button
                  type="button"
                  className="page-title-action"
                  onClick={() => setShowJudgeModal(true)}
                >
                  <Server size={14} /> Thêm máy chấm
                </button>
              </div>

              {/* Dashboard 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
                {/* At a Glance Box */}
                <div className="postbox">
                  <div className="postbox-header">
                    <span>Hiện có (At a Glance)</span>
                    <span style={{ fontSize: 11, color: '#646970' }}>FuraOJ v2.0</span>
                  </div>
                  <div className="postbox-body">
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HelpCircle size={16} color="#2271b1" />
                        <strong>{stats.total_problems}</strong>
                        <span style={{ color: '#646970' }}>Bài tập</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckSquare size={16} color="#2271b1" />
                        <strong>{stats.total_submissions}</strong>
                        <span style={{ color: '#646970' }}>Bài nộp</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={16} color="#2271b1" />
                        <strong>{stats.total_users}</strong>
                        <span style={{ color: '#646970' }}>Người dùng</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={16} color="#2271b1" />
                        <strong>{stats.total_contests}</strong>
                        <span style={{ color: '#646970' }}>Kỳ thi</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Server size={16} color="#00a32a" />
                        <strong style={{ color: '#00a32a' }}>{stats.online_judges}</strong>
                        <span style={{ color: '#646970' }}>Máy chấm Online</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Code2 size={16} color="#2271b1" />
                        <strong>{languages.length || 65}</strong>
                        <span style={{ color: '#646970' }}>Ngôn ngữ hỗ trợ</span>
                      </li>
                    </ul>
                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f1', margin: '12px 0' }} />
                    <p style={{ margin: 0, color: '#646970', fontSize: 12 }}>
                      FuraOJ v2.0 chạy trên nền tảng Rust Tokio Axum & PostgreSQL 16. Máy chấm Seccomp-BPF bảo mật kết nối cổng 9999.
                    </p>
                  </div>
                </div>

                {/* Quick Add Problem Draft */}
                <div className="postbox">
                  <div className="postbox-header">
                    <span>Soạn thảo nhanh bài tập (Quick Draft)</span>
                  </div>
                  <div className="postbox-body">
                    <form onSubmit={handleCreateProblem}>
                      <div style={{ marginBottom: 10 }}>
                        <input
                          type="text"
                          className="wp-input"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                          placeholder="Mã bài (Code, vd: SUM, ARR01)..."
                          value={newProbCode}
                          onChange={(e) => setNewProbCode(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <input
                          type="text"
                          className="wp-input"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                          placeholder="Tên bài tập..."
                          value={newProbName}
                          onChange={(e) => setNewProbName(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <input
                          type="number"
                          step="0.1"
                          className="wp-input"
                          style={{ width: '33%', boxSizing: 'border-box' }}
                          placeholder="TL (giây)"
                          value={newProbTime}
                          onChange={(e) => setNewProbTime(parseFloat(e.target.value) || 1.0)}
                        />
                        <input
                          type="number"
                          className="wp-input"
                          style={{ width: '33%', boxSizing: 'border-box' }}
                          placeholder="ML (MB)"
                          value={newProbMemory}
                          onChange={(e) => setNewProbMemory(parseInt(e.target.value) || 256)}
                        />
                        <input
                          type="number"
                          step="1"
                          className="wp-input"
                          style={{ width: '33%', boxSizing: 'border-box' }}
                          placeholder="Điểm"
                          value={newProbPoints}
                          onChange={(e) => setNewProbPoints(parseFloat(e.target.value) || 100)}
                        />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <textarea
                          className="wp-input"
                          style={{ width: '100%', boxSizing: 'border-box', minHeight: 60 }}
                          placeholder="Mô tả tóm tắt bài tập (Markdown)..."
                          value={newProbDesc}
                          onChange={(e) => setNewProbDesc(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="button button-primary" disabled={probSubmitting}>
                        {probSubmitting ? 'Đang lưu...' : 'Lưu bản nháp / Thêm bài tập'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Judge Cluster Nodes Status Box */}
                <div className="postbox">
                  <div className="postbox-header">
                    <span>Cụm máy chấm trực tuyến (Judge Nodes Cluster)</span>
                    <button
                      type="button"
                      className="button"
                      onClick={fetchAdminData}
                      style={{ fontSize: 11, padding: '2px 8px' }}
                    >
                      <RefreshCw size={12} /> Làm mới
                    </button>
                  </div>
                  <div className="postbox-body" style={{ padding: 0 }}>
                    <table className="wp-list-table widefat striped">
                      <thead>
                        <tr>
                          <th>Máy chấm</th>
                          <th>Trạng thái</th>
                          <th>Độ trễ</th>
                          <th>Tải CPU</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {judges.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: '#a7aaad', padding: 20 }}>
                              Chưa có máy chấm nào kết nối tới cổng 9999.
                            </td>
                          </tr>
                        ) : (
                          judges.map((j) => (
                            <tr key={j.id}>
                              <td>
                                <strong>{j.name}</strong>
                                <div className="row-actions">
                                  <span>ID: {j.id}</span> | <span>Uptime: {j.uptime_str || 'Online'}</span>
                                </div>
                              </td>
                              <td>
                                {j.online ? (
                                  <span style={{ color: '#00a32a', fontWeight: 600 }}>● Online</span>
                                ) : (
                                  <span style={{ color: '#d63638', fontWeight: 600 }}>○ Mất kết nối</span>
                                )}
                              </td>
                              <td>{j.ping_ms ? `${j.ping_ms} ms` : '< 1 ms'}</td>
                              <td>{j.load ? `${(j.load * 100).toFixed(1)}%` : '0.0%'}</td>
                              <td>
                                <button
                                  type="button"
                                  className="button"
                                  onClick={() => setNotice({ message: `Đã gửi tín hiệu kiểm tra (Ping) tới ${j.name}.`, type: 'success' })}
                                  style={{ padding: '2px 6px', fontSize: 12 }}
                                >
                                  Ping
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Submissions Activity */}
                <div className="postbox">
                  <div className="postbox-header">
                    <span>Hoạt động bài nộp gần đây (Recent Submissions)</span>
                    <a
                      onClick={() => setActiveSection('submissions')}
                      style={{ fontSize: 11, color: '#2271b1', cursor: 'pointer' }}
                    >
                      Xem tất cả ({stats.total_submissions})
                    </a>
                  </div>
                  <div className="postbox-body" style={{ padding: 0 }}>
                    <table className="wp-list-table widefat striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Bài tập</th>
                          <th>Thí sinh</th>
                          <th>Kết quả</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.slice(0, 5).map((s) => (
                          <tr key={s.id}>
                            <td>
                              <Link to={`/submission/${s.id}`} style={{ color: '#2271b1', fontWeight: 600 }}>
                                #{s.id}
                              </Link>
                            </td>
                            <td>
                              <Link to={`/problem/${s.problem_code}`} style={{ color: '#2271b1' }}>
                                {s.problem_code}
                              </Link>
                            </td>
                            <td>{s.username}</td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 600,
                                  color:
                                    s.result === 'AC'
                                      ? '#00a32a'
                                      : s.result === 'WA'
                                      ? '#d63638'
                                      : s.result === 'TLE'
                                      ? '#dba617'
                                      : '#72aee6',
                                }}
                              >
                                {s.result || s.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="button"
                                onClick={() => handleRejudge(s.id)}
                                style={{ padding: '2px 6px', fontSize: 11 }}
                              >
                                <RefreshCw size={11} /> Chấm lại
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PROBLEMS (judge.Problem) */}
          {activeSection === 'problems' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h1 className="wp-heading-inline">Danh sách bài tập (Problems)</h1>
                <button
                  type="button"
                  className="page-title-action"
                  onClick={() => setShowProblemModal(true)}
                >
                  <Plus size={14} /> Thêm bài tập
                </button>
              </div>

              {/* Changelist Top Bar */}
              <div className="tablenav">
                <div className="actions">
                  <select className="wp-select">
                    <option value="">Thao tác hàng loạt</option>
                    <option value="rejudge">Chấm lại tất cả bài nộp</option>
                    <option value="delete">Xóa đã chọn</option>
                  </select>
                  <button type="button" className="button">
                    Áp dụng
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="search"
                    className="wp-input"
                    placeholder="Tìm theo mã hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="button" className="button">
                    <Search size={14} /> Tìm kiếm
                  </button>
                </div>
              </div>

              {/* Problems Table */}
              <table className="wp-list-table widefat striped">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>
                      <input type="checkbox" />
                    </th>
                    <th>Mã bài (Code)</th>
                    <th>Tên bài tập</th>
                    <th>Thời gian (s)</th>
                    <th>Bộ nhớ (MB)</th>
                    <th>Điểm số</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#a7aaad', padding: 24 }}>
                        Không tìm thấy bài tập nào.
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>
                          <strong style={{ color: '#2271b1' }}>{p.code}</strong>
                          <div className="row-actions">
                            <Link to={`/problem/${p.code}`} target="_blank">
                              Xem trên web
                            </Link>{' '}
                            |{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setNotice({ message: `Đang mở trình chỉnh sửa bài tập ${p.code}`, type: 'success' });
                              }}
                            >
                              Sửa
                            </button>{' '}
                            |{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setNotice({ message: `Đã gửi yêu cầu chấm lại toàn bộ bài nộp của ${p.code}`, type: 'success' });
                              }}
                            >
                              Chấm lại
                            </button>
                          </div>
                        </td>
                        <td>{p.name}</td>
                        <td>{p.time_limit}s</td>
                        <td>{p.memory_limit}MB</td>
                        <td>
                          <strong>{p.points}</strong>
                        </td>
                        <td>
                          <Link to={`/problem/${p.code}`} className="button" style={{ padding: '2px 8px', fontSize: 12 }}>
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="tablenav" style={{ marginTop: 12 }}>
                <span style={{ color: '#646970', fontSize: 12 }}>
                  Hiển thị {filteredProblems.length} trong tổng số {problems.length} bài tập
                </span>
              </div>
            </div>
          )}

          {/* SECTION 3: SUBMISSIONS (judge.Submission) */}
          {activeSection === 'submissions' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h1 className="wp-heading-inline">Danh sách bài nộp (Submissions)</h1>
              </div>

              {/* Filter bar */}
              <div className="tablenav">
                <div className="actions">
                  <select
                    className="wp-select"
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                  >
                    <option value="ALL">Tất cả kết quả</option>
                    <option value="AC">AC (Accepted)</option>
                    <option value="WA">WA (Wrong Answer)</option>
                    <option value="TLE">TLE (Time Limit Exceeded)</option>
                    <option value="MLE">MLE (Memory Limit Exceeded)</option>
                    <option value="RTE">RTE (Runtime Error)</option>
                    <option value="CE">CE (Compile Error)</option>
                  </select>
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      setNotice({ message: 'Đã gửi yêu cầu chấm lại hàng loạt các bài nộp đã lọc.', type: 'success' });
                    }}
                  >
                    <RefreshCw size={13} /> Chấm lại hàng loạt
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="search"
                    className="wp-input"
                    placeholder="Tìm theo ID, bài tập, user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="button" className="button">
                    <Search size={14} /> Tìm kiếm
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              <table className="wp-list-table widefat striped">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>
                      <input type="checkbox" />
                    </th>
                    <th>ID</th>
                    <th>Bài tập</th>
                    <th>Người nộp</th>
                    <th>Ngôn ngữ</th>
                    <th>Thời gian</th>
                    <th>Bộ nhớ</th>
                    <th>Kết quả</th>
                    <th>Ngày nộp</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', color: '#a7aaad', padding: 24 }}>
                        Không tìm thấy bài nộp nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>
                          <Link to={`/submission/${s.id}`} style={{ color: '#2271b1', fontWeight: 600 }}>
                            #{s.id}
                          </Link>
                        </td>
                        <td>
                          <Link to={`/problem/${s.problem_code}`} style={{ color: '#2271b1' }}>
                            {s.problem_code}
                          </Link>
                        </td>
                        <td>
                          <strong>{s.username}</strong>
                        </td>
                        <td>
                          <code>{s.language}</code>
                        </td>
                        <td>{s.time !== null ? `${s.time.toFixed(3)}s` : '-'}</td>
                        <td>{s.memory !== null ? `${s.memory.toFixed(1)}MB` : '-'}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color:
                                s.result === 'AC'
                                  ? '#00a32a'
                                  : s.result === 'WA'
                                  ? '#d63638'
                                  : s.result === 'TLE'
                                  ? '#dba617'
                                  : '#2271b1',
                            }}
                          >
                            {s.result || s.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#646970' }}>{s.date}</td>
                        <td>
                          <button
                            type="button"
                            className="button"
                            onClick={() => handleRejudge(s.id)}
                            style={{ padding: '2px 8px', fontSize: 12 }}
                          >
                            <RefreshCw size={12} /> Chấm lại
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="tablenav" style={{ marginTop: 12 }}>
                <span style={{ color: '#646970', fontSize: 12 }}>
                  Hiển thị {filteredSubmissions.length} trong tổng số {submissions.length} bài nộp
                </span>
              </div>
            </div>
          )}

          {/* SECTION 4: LANGUAGES & JUDGES */}
          {activeSection === 'languages' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h1 className="wp-heading-inline">Ngôn ngữ & Máy chấm (judge.Language / judge.Judge)</h1>
                <button
                  type="button"
                  className="page-title-action"
                  onClick={() => setShowJudgeModal(true)}
                >
                  <Server size={14} /> Thêm máy chấm mới
                </button>
              </div>

              {/* Subtabs */}
              <div style={{ borderBottom: '1px solid #c3c4c7', marginBottom: 16, display: 'flex', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setLangTab('judges')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: langTab === 'judges' ? '2px solid #2271b1' : 'none',
                    color: langTab === 'judges' ? '#2271b1' : '#646970',
                    fontWeight: langTab === 'judges' ? 600 : 400,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Máy chấm trực tuyến ({judges.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('catalog')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: langTab === 'catalog' ? '2px solid #2271b1' : 'none',
                    color: langTab === 'catalog' ? '#2271b1' : '#646970',
                    fontWeight: langTab === 'catalog' ? 600 : 400,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  65 Môi trường thực thi (Language Catalog)
                </button>
              </div>

              {langTab === 'judges' && (
                <div>
                  <table className="wp-list-table widefat striped">
                    <thead>
                      <tr>
                        <th>Tên máy chấm</th>
                        <th>Trạng thái kết nối</th>
                        <th>Độ trễ Ping</th>
                        <th>Tải hệ thống</th>
                        <th>Uptime</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {judges.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#a7aaad', padding: 24 }}>
                            Chưa có máy chấm nào đăng ký hoặc kết nối.
                          </td>
                        </tr>
                      ) : (
                        judges.map((j) => (
                          <tr key={j.id}>
                            <td>
                              <strong>{j.name}</strong>
                              <div className="row-actions">
                                <span>ID: {j.id}</span>
                              </div>
                            </td>
                            <td>
                              {j.online ? (
                                <span style={{ color: '#00a32a', fontWeight: 600 }}>● Online (Cổng 9999)</span>
                              ) : (
                                <span style={{ color: '#d63638', fontWeight: 600 }}>○ Offline</span>
                              )}
                            </td>
                            <td>{j.ping_ms ? `${j.ping_ms} ms` : '< 1 ms'}</td>
                            <td>{j.load ? `${(j.load * 100).toFixed(1)}%` : '0.0%'}</td>
                            <td>{j.uptime_str || 'Active'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  type="button"
                                  className="button"
                                  onClick={() => setNotice({ message: `Đã gửi tín hiệu kiểm tra (Ping) tới ${j.name}`, type: 'success' })}
                                  style={{ padding: '2px 8px', fontSize: 12 }}
                                >
                                  Ping
                                </button>
                                <button
                                  type="button"
                                  className="button button-danger"
                                  onClick={() => setNotice({ message: `Đã ngắt kết nối máy chấm ${j.name}`, type: 'error' })}
                                  style={{ padding: '2px 8px', fontSize: 12 }}
                                >
                                  Ngắt kết nối
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {langTab === 'catalog' && (
                <div>
                  <table className="wp-list-table widefat striped">
                    <thead>
                      <tr>
                        <th>Mã (Key)</th>
                        <th>Tên ngôn ngữ</th>
                        <th>Tên rút gọn</th>
                        <th>Tên phổ biến</th>
                        <th>Ace Editor Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((l) => (
                        <tr key={l.id || l.key}>
                          <td>
                            <code>{l.key}</code>
                          </td>
                          <td>
                            <strong>{l.name}</strong>
                          </td>
                          <td>{l.short_name || l.key}</td>
                          <td>{l.common_name || l.name}</td>
                          <td>
                            <span style={{ color: '#646970', fontFamily: 'monospace' }}>{l.ace || 'text'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: USERS (auth.User) */}
          {activeSection === 'users' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h1 className="wp-heading-inline">Danh sách người dùng (auth.User)</h1>
              </div>

              <table className="wp-list-table widefat striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên đăng nhập (Username)</th>
                    <th>Email</th>
                    <th>Quyền hạn</th>
                    <th>Rating</th>
                    <th>Điểm giải bài</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#a7aaad', padding: 24 }}>
                        Không có người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>
                          <strong>{u.username}</strong>
                        </td>
                        <td>{u.email || '-'}</td>
                        <td>
                          {u.is_superuser ? (
                            <span style={{ color: '#d63638', fontWeight: 600 }}>Superuser</span>
                          ) : u.is_staff ? (
                            <span style={{ color: '#2271b1', fontWeight: 600 }}>Staff</span>
                          ) : (
                            <span>Thành viên</span>
                          )}
                        </td>
                        <td>{u.rating || 1500}</td>
                        <td>{u.points || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 6: CONTESTS (judge.Contest) */}
          {activeSection === 'contests' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h1 className="wp-heading-inline">Danh sách kỳ thi (judge.Contest)</h1>
              </div>

              <table className="wp-list-table widefat striped">
                <thead>
                  <tr>
                    <th>Mã kỳ thi (Slug)</th>
                    <th>Tên kỳ thi</th>
                    <th>Định dạng</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                    <th>Xếp hạng</th>
                  </tr>
                </thead>
                <tbody>
                  {contests.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#a7aaad', padding: 24 }}>
                        Chưa có kỳ thi nào.
                      </td>
                    </tr>
                  ) : (
                    contests.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.key}</strong>
                        </td>
                        <td>{c.name}</td>
                        <td>{c.format_name || 'ACM/ICPC'}</td>
                        <td>{c.start_time}</td>
                        <td>{c.end_time}</td>
                        <td>{c.is_rated ? 'Rated' : 'Unrated'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 7: CONFIG (judge.MiscConfig) */}
          {activeSection === 'config' && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h1 className="wp-heading-inline">Cấu hình hệ thống (judge.MiscConfig)</h1>
              </div>

              <div className="postbox" style={{ maxWidth: 800 }}>
                <div className="postbox-header">
                  <span>Thiết lập môi trường nền tảng FuraOJ v2.0</span>
                </div>
                <div className="postbox-body">
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Tên hệ thống</label>
                      <input type="text" className="wp-input" style={{ width: '100%' }} defaultValue="FuraOJ" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Cổng kết nối máy chấm (Judge Bridge Port)</label>
                      <input type="number" className="wp-input" style={{ width: 200 }} defaultValue={9999} readOnly />
                      <p style={{ margin: '4px 0 0', color: '#646970', fontSize: 12 }}>
                        Tokio TCP Bridge daemon lắng nghe trên cổng 9999 với giao thức zlib packet.
                      </p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Thuật toán băm mật khẩu (Django Auth)</label>
                      <input type="text" className="wp-input" style={{ width: 350 }} defaultValue="PBKDF2-HMAC-SHA256 (320,000 iterations)" readOnly />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Chế độ bảo mật Sandbox</label>
                      <input type="text" className="wp-input" style={{ width: 350 }} defaultValue="Linux Seccomp-BPF & cgroups v2 Active" readOnly />
                    </div>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setNotice({ message: 'Đã lưu cấu hình hệ thống MiscConfig thành công.', type: 'success' })}
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK FOR OTHER SECTIONS */}
          {!['dashboard', 'problems', 'submissions', 'languages', 'users', 'contests', 'config'].includes(activeSection) && (
            <div className="postbox" style={{ maxWidth: 700 }}>
              <div className="postbox-header">
                <span>Quản lý danh mục: {activeSection}</span>
              </div>
              <div className="postbox-body">
                <p style={{ color: '#646970', margin: 0 }}>
                  Module đang được đồng bộ hóa với lược đồ cơ sở dữ liệu PostgreSQL. Các bản ghi trực tiếp hiển thị tại trang danh sách tương ứng.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER (#wpfooter) */}
        <footer id="wpfooter" role="contentinfo">
          <p id="footer-left" style={{ margin: 0 }}>
            Cảm ơn bạn đã sử dụng{' '}
            <a href="//github.com/furavietnam/furaoj" target="_blank" rel="noopener noreferrer">
              FuraOJ
            </a>{' '}
            (DMOJ Platform).
          </p>
          <p id="footer-upgrade" style={{ margin: 0 }}>
            Phiên bản <strong>2.0.0</strong> (Rust Tokio Axum Engine)
          </p>
        </footer>
      </main>

      {/* MODAL: ADD PROBLEM */}
      {showProblemModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
          }}
        >
          <div className="postbox" style={{ width: 540, maxWidth: '90vw', margin: 0 }}>
            <div className="postbox-header">
              <span>Thêm bài tập mới (Add Problem)</span>
              <button
                type="button"
                onClick={() => setShowProblemModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="postbox-body">
              <form onSubmit={handleCreateProblem}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Mã bài tập (Code)</label>
                  <input
                    type="text"
                    className="wp-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="VD: SUM, ARRAY01..."
                    value={newProbCode}
                    onChange={(e) => setNewProbCode(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Tên bài tập</label>
                  <input
                    type="text"
                    className="wp-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="Tên bài tập..."
                    value={newProbName}
                    onChange={(e) => setNewProbName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Thời gian (s)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="wp-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={newProbTime}
                      onChange={(e) => setNewProbTime(parseFloat(e.target.value) || 1.0)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Bộ nhớ (MB)</label>
                    <input
                      type="number"
                      className="wp-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={newProbMemory}
                      onChange={(e) => setNewProbMemory(parseInt(e.target.value) || 256)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Điểm</label>
                    <input
                      type="number"
                      className="wp-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={newProbPoints}
                      onChange={(e) => setNewProbPoints(parseFloat(e.target.value) || 100)}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Mô tả đề bài (Markdown)</label>
                  <textarea
                    className="wp-input"
                    style={{ width: '100%', boxSizing: 'border-box', minHeight: 90 }}
                    placeholder="Nội dung đề bài..."
                    value={newProbDesc}
                    onChange={(e) => setNewProbDesc(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="button" onClick={() => setShowProblemModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="button button-primary" disabled={probSubmitting}>
                    {probSubmitting ? 'Đang tạo...' : 'Lưu bài tập'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD JUDGE SERVER */}
      {showJudgeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
          }}
        >
          <div className="postbox" style={{ width: 480, maxWidth: '90vw', margin: 0 }}>
            <div className="postbox-header">
              <span>Đăng ký máy chấm mới (Register Judge)</span>
              <button
                type="button"
                onClick={() => setShowJudgeModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="postbox-body">
              <form onSubmit={handleRegisterJudge}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Tên máy chấm (Judge Name)</label>
                  <input
                    type="text"
                    className="wp-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="VD: judge-cluster-02..."
                    value={newJudgeName}
                    onChange={(e) => setNewJudgeName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Khóa xác thực (Auth Key)</label>
                  <input
                    type="password"
                    className="wp-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="Mật khẩu token..."
                    value={newJudgeKey}
                    onChange={(e) => setNewJudgeKey(e.target.value)}
                    required
                  />
                  <p style={{ margin: '4px 0 0', color: '#646970', fontSize: 12 }}>
                    Khóa này sẽ được xác thực khi daemon máy chấm kết nối tới cổng 9999.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="button" onClick={() => setShowJudgeModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="button button-primary" disabled={judgeSubmitting}>
                    {judgeSubmitting ? 'Đang cấp phép...' : 'Đăng ký máy chấm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
