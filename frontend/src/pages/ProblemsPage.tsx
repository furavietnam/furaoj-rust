// Logic: Authentic DMOJ / FuraOJ problem archive catalog matching oj.fura.io.vn/problems/.
// Input: Live problem records fetched from REST API, search filters.
// Output: Two-column problem archive with #problem-table, status indicators, and sidebox search filters.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProblemListItem } from '../types';

export function ProblemsPage(): JSX.Element {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'random'>('list');

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

  const filtered = problems.filter(
    (p) =>
      p.code.toLowerCase().includes(keyword.toLowerCase()) ||
      p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-list-ul"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">Danh sách bài</h1>
            <span className="problem-header-subtitle">
              {problems.length} bài
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => setActiveTab('list')}
              className={`seg-btn ${activeTab === 'list' ? 'active' : ''}`}
            >
              <i className="fa fa-bars"></i> Danh sách
            </button>
            <button
              onClick={() => setActiveTab('random')}
              className={`seg-btn ${activeTab === 'random' ? 'active' : ''}`}
            >
              <i className="fa fa-lightbulb-o"></i> Đề xuất
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        <div id="common-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Main Table Column */}
          <div id="content-left" style={{ flex: 1, minWidth: 0 }}>
            <table id="problem-table" className="table striped">
              <thead>
                <tr>
                  <th className="status-col" style={{ width: '40px', textAlign: 'center' }}>
                    <span className="status-circle-th"></span>
                  </th>
                  <th className="problem-code" style={{ width: '130px' }}>
                    <span>ID</span>
                  </th>
                  <th className="problem-name">
                    <span>Bài <i className="fa fa-sort sort-caret"></i></span>
                  </th>
                  <th className="category" style={{ width: '140px' }}>
                    <span>Nhóm</span>
                  </th>
                  <th className="points" style={{ width: '80px', textAlign: 'right' }}>
                    <span>Điểm <i className="fa fa-sort sort-caret"></i></span>
                  </th>
                  <th className="ac-rate" style={{ width: '85px', textAlign: 'right' }}>
                    <span>% AC <i className="fa fa-sort sort-caret"></i></span>
                  </th>
                  <th className="users" style={{ width: '70px', textAlign: 'right' }}>
                    <span># AC <i className="fa fa-sort sort-caret"></i></span>
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
                        [{problem.code}] - {problem.name}
                      </Link>
                    </td>
                    <td className="category" style={{ color: '#64748b', fontSize: '13px' }}>
                      Toán học &amp; Giải thuật
                    </td>
                    <td className="points font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                      {problem.points.toFixed(0)}
                    </td>
                    <td className="ac-rate font-mono" style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                      100%
                    </td>
                    <td className="users font-mono" style={{ textAlign: 'right', color: '#64748b' }}>
                      2
                    </td>
                    <td className="editorial" style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <i className="fa fa-file-text-o"></i>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      Không tìm thấy bài tập nào phù hợp với từ khóa '{keyword}'.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right Filter Sidebar */}
          <div id="content-right" className="problems" style={{ width: '300px', flexShrink: 0 }}>
            <div className="info-float">
              <div className="sidebox problem-search-box">
                <h3>
                  <span>Tìm kiếm bài tập</span>
                  <i className="fa fa-search"></i>
                </h3>
                <div className="sidebox-content">
                  <div className="filter-search-input-wrap" style={{ position: 'relative', marginBottom: '14px' }}>
                    <i
                      className="fa fa-search"
                      style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
                    ></i>
                    <input
                      type="text"
                      name="search"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm bài..."
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Tìm kiếm theo mã và tên bài</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span>Có lời giải</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span>Hiện dạng bài</span>
                    </label>
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
