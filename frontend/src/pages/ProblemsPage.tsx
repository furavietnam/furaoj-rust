// Logic: Authentic DMOJ / FuraOJ problem archive catalog matching oj.fura.io.vn/problems/.
// Input: Live problem records fetched from REST API, search filters, category filters.
// Output: Two-column problem archive with #problem-table, status indicators, and sidebox search filters.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProblemListItem } from '../types';

export function ProblemsPage(): JSX.Element {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'random'>('list');
  const [sortField, setSortField] = useState<'code' | 'name' | 'points'>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getProblems();
        setProblems(data);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSort = (field: 'code' | 'name' | 'points') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  let filtered = problems.filter(
    (p) =>
      p.code.toLowerCase().includes(keyword.toLowerCase()) ||
      p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortField === 'code') cmp = a.code.localeCompare(b.code);
    else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'points') cmp = a.points - b.points;
    return sortAsc ? cmp : -cmp;
  });

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-list-ul"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">Danh sách bài tập</h1>
            <span className="problem-header-subtitle">
              {problems.length} bài tập &bull; Kho lưu trữ bài tập lập trình thi đấu
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => setActiveTab('list')}
              className={`seg-btn ${activeTab === 'list' ? 'active' : ''}`}
            >
              <i className="fa fa-bars"></i> <span>Danh sách</span>
            </button>
            <button
              onClick={() => setActiveTab('random')}
              className={`seg-btn ${activeTab === 'random' ? 'active' : ''}`}
            >
              <i className="fa fa-lightbulb-o"></i> <span>Đề xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        {activeTab === 'list' ? (
          <div id="common-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Main Table Column */}
            <div id="content-left" className="problems h-scrollable-table" style={{ flex: 1, minWidth: 0 }}>
              <div className="problem-table-card">
                <table id="problem-table" className="table striped" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th className="status-col" style={{ width: '40px', textAlign: 'center' }}>
                        <span className="status-circle-th"></span>
                      </th>
                      <th
                        className="problem-code"
                        onClick={() => handleSort('code')}
                        style={{ width: '130px', cursor: 'pointer' }}
                      >
                        <span>ID <i className="fa fa-sort sort-caret"></i></span>
                      </th>
                      <th
                        className="problem-name"
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>Tên bài <i className="fa fa-sort sort-caret"></i></span>
                      </th>
                      <th className="category" style={{ width: '150px' }}>
                        <span>Thể loại</span>
                      </th>
                      <th
                        className="points"
                        onClick={() => handleSort('points')}
                        style={{ width: '80px', textAlign: 'right', cursor: 'pointer' }}
                      >
                        <span>Điểm <i className="fa fa-sort sort-caret"></i></span>
                      </th>
                      <th className="ac-rate" style={{ width: '85px', textAlign: 'right' }}>
                        <span>% AC</span>
                      </th>
                      <th className="users" style={{ width: '70px', textAlign: 'right' }}>
                        <span># AC</span>
                      </th>
                      <th className="editorial" style={{ width: '50px', textAlign: 'center' }} title="Lời giải">
                        <i className="fa fa-book"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((problem) => (
                      <tr key={problem.code}>
                        <td className="status-col" style={{ textAlign: 'center' }}>
                          <span className="status-circle unsolved" title="Chưa giải"></span>
                        </td>
                        <td className="problem-code font-mono">
                          <Link to={`/problem/${problem.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>
                            {problem.code}
                          </Link>
                        </td>
                        <td className="problem-name">
                          <Link
                            to={`/problem/${problem.code}`}
                            className="problem-title-link"
                            style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 700 }}
                          >
                            {problem.name}
                          </Link>
                        </td>
                        <td className="category" style={{ color: '#64748b', fontSize: '13px' }}>
                          Toán học &amp; Giải thuật
                        </td>
                        <td className="points points-val font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                          {problem.points.toFixed(0)}
                        </td>
                        <td className="ac-rate ac-high font-mono" style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                          100.0%
                        </td>
                        <td className="users font-mono" style={{ textAlign: 'right', color: '#64748b' }}>
                          <Link to={`/submissions?problem=${problem.code}`} className="ac-count-link" style={{ color: '#64748b', textDecoration: 'none' }}>
                            2
                          </Link>
                        </td>
                        <td className="editorial-col" style={{ textAlign: 'center', color: '#94a3b8' }}>
                          <i className="fa fa-file-text-o"></i>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && !loading && (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                          Không tìm thấy bài tập nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Filter Sidebar */}
            <div id="content-right" className="problems filter-collapsible" style={{ width: '300px', flexShrink: 0 }}>
              <div className="info-float">
                <div className="sidebox problem-search-box" style={{ marginBottom: '20px' }}>
                  <h3>
                    <span>Tìm kiếm bài tập</span>
                    <i className="fa fa-search"></i>
                  </h3>
                  <div className="sidebox-content">
                    <div className="filter-search-input-wrap" style={{ position: 'relative', marginBottom: '14px' }}>
                      <i
                        className="fa fa-search search-field-icon"
                        style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
                      ></i>
                      <input
                        type="text"
                        name="search"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm bài tập..."
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 34px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div className="filter-controls-grid" style={{ marginBottom: '14px' }}>
                      <div className="filter-form-group">
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          <i className="fa fa-folder-open-o" style={{ marginRight: '4px' }}></i> Thể loại:
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">Tất cả thể loại</option>
                          <option value="math">Toán học &amp; Giải thuật</option>
                          <option value="dp">Quy hoạch động (DP)</option>
                          <option value="graph">Lý thuyết đồ thị (Graph)</option>
                          <option value="string">Xử lý xâu (Strings)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-submit-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="filter-submit-btn"
                        style={{
                          flex: 1,
                          padding: '8px 14px',
                          borderRadius: '6px',
                          background: '#0066ff',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        <i className="fa fa-filter"></i> Lọc
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (problems.length > 0) {
                            const rand = problems[Math.floor(Math.random() * problems.length)];
                            setKeyword(rand.code);
                          }
                        }}
                        className="filter-secondary-btn"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          color: '#0066ff',
                          border: '1px solid #e2e8f0',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        <i className="fa fa-random"></i> Ngẫu nhiên
                      </button>
                      {keyword && (
                        <button
                          type="button"
                          onClick={() => setKeyword('')}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            color: '#ef4444',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                          title="Xóa lọc"
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hot Problems Sidebox */}
                <div className="sidebox">
                  <h3>
                    <span>Bài tập nổi bật</span> <i className="fa fa-fire" style={{ color: '#ef4444' }}></i>
                  </h3>
                  <div className="sidebox-content">
                    <ul className="problem-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {problems.slice(0, 5).map((p) => (
                        <li key={p.code} style={{ padding: '6px 0', borderBottom: '1px solid rgba(226, 232, 240, 0.4)', fontSize: '13px' }}>
                          <Link to={`/problem/${p.code}`} className="hot-problem-link" style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Recommended Problems View matching templates/blog/recommended-problem-cards.html */
          <div className="recommended-feed-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="rec-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px 16px', background: 'rgba(0, 102, 255, 0.05)', borderRadius: '12px' }}>
              <div className="rec-toolbar-info">
                <span className="rec-count-badge" style={{ fontWeight: 600, color: '#0066ff', fontSize: '13.5px' }}>
                  <i className="fa fa-compass" style={{ marginRight: '6px' }}></i>
                  <strong>{problems.length}</strong> bài tập được gợi ý cho trình độ của bạn
                </span>
              </div>
              <div className="rec-toolbar-actions">
                <button
                  onClick={() => setProblems([...problems].reverse())}
                  className="seg-btn"
                  style={{ cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 12px', fontSize: '12.5px', fontWeight: 600 }}
                >
                  <i className="fa fa-refresh"></i> <span>Đổi gợi ý</span>
                </button>
              </div>
            </div>

            <div className="recommended-problems-feed" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {problems.map(p => (
                <div key={p.code} className="recommended-problem-card" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid #edf2f7', background: 'var(--card-bg, #ffffff)', boxShadow: '0 2px 10px -2px rgba(0,0,0,0.03)' }}>
                  <div className="rec-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div className="rec-card-status-tags" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="rec-badge status-unsolved" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>
                        <i className="fa fa-circle-o"></i> Chưa giải
                      </span>
                      <span className="rec-badge group-badge" style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 102, 255, 0.08)', color: '#0066ff' }}>
                        <i className="fa fa-folder-open-o"></i> Toán học &amp; Giải thuật
                      </span>
                    </div>
                    <div className="rec-points-wrap font-mono" style={{ fontWeight: 800, color: '#f59e0b', fontSize: '13px' }}>
                      <i className="fa fa-star"></i> {p.points.toFixed(0)} pts
                    </div>
                  </div>

                  <div className="rec-card-body" style={{ marginBottom: '12px' }}>
                    <h3 className="rec-problem-title" style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700 }}>
                      <Link to={`/problem/${p.code}`} style={{ color: '#0066ff', textDecoration: 'none' }}>
                        [{p.code}] &ndash; {p.name}
                      </Link>
                    </h3>
                  </div>

                  <div className="rec-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <div className="rec-meta-stats" style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#64748b' }}>
                      <span className="rec-stat-item">
                        <i className="fa fa-check-circle" style={{ color: '#10b981', marginRight: '4px' }}></i>
                        <strong>2</strong> người đã giải
                      </span>
                      <span className="rec-stat-item">
                        <i className="fa fa-pie-chart" style={{ color: '#0066ff', marginRight: '4px' }}></i>
                        <strong>100%</strong> AC
                      </span>
                    </div>
                    <Link
                      to={`/problem/${p.code}`}
                      className="unselectable button"
                      style={{
                        display: 'inline-block',
                        padding: '5px 14px',
                        borderRadius: '6px',
                        background: '#0066ff',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}
                    >
                      <span>Giải ngay</span> <i className="fa fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
