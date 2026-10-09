// Logic: Authentic DMOJ / FuraOJ users leaderboard matching templates/user/base-users.html.
// Input: User leaderboard records from REST API, tabs for Leaderboard, Contributors, and Organizations.
// Output: Two-column / full-width DMOJ table with rank, user rating tier, points, and solved count.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { api } from '../services/api';

const DEFAULT_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@furaoj.org',
    is_staff: true,
    is_superuser: true,
    rating: 2450,
    points: 6200,
    solved_count: 190,
  },
  {
    id: 2,
    username: 'tourist',
    email: 'tourist@furaoj.org',
    is_staff: false,
    is_superuser: false,
    rating: 3840,
    points: 12500,
    solved_count: 420,
  },
  {
    id: 3,
    username: 'petr',
    email: 'petr@furaoj.org',
    is_staff: false,
    is_superuser: false,
    rating: 3100,
    points: 9800,
    solved_count: 310,
  },
];

export function UsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'contributors' | 'organizations'>('leaderboard');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getUsers();
        if (data && data.length > 0) {
          setUsers(data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-users"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">Thành viên</h1>
            <span className="problem-header-subtitle">
              Bảng xếp hạng thành viên theo điểm số và hiệu năng giải thuật
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`seg-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            >
              <i className="fa fa-trophy"></i> <span>Bảng xếp hạng</span>
            </button>
            <button
              onClick={() => setActiveTab('contributors')}
              className={`seg-btn ${activeTab === 'contributors' ? 'active' : ''}`}
            >
              <i className="fa fa-thumbs-up"></i> <span>Đóng góp</span>
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`seg-btn ${activeTab === 'organizations' ? 'active' : ''}`}
            >
              <i className="fa fa-university"></i> <span>Tổ chức</span>
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        {activeTab === 'leaderboard' && (
          <table id="users-table" className="table striped" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Hạng</th>
                <th>Thành viên</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Đánh giá</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Điểm</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Số bài giải</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.username}>
                  <td style={{ textAlign: 'center', fontWeight: 800 }} className="font-mono">
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0066ff 0%, #38bdf8 100%)',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {u.username.slice(0, 1).toUpperCase()}
                      </span>
                      <Link
                        to={`/user/${u.username}`}
                        style={{ textDecoration: 'none', fontWeight: 700, color: '#0066ff', fontSize: '14.5px' }}
                      >
                        {u.username}
                      </Link>
                      {u.is_superuser && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                          }}
                        >
                          ADMIN
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontWeight: 800,
                        color: (u.rating ?? 1500) >= 3000 ? '#ef4444' : (u.rating ?? 1500) >= 2400 ? '#f59e0b' : '#0066ff',
                      }}
                    >
                      {u.rating ?? 1500}
                    </span>
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: '#0066ff' }}>
                    {(u.points ?? 0).toFixed(0)}
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                    {u.solved_count ?? 0} bài
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'contributors' && (
          <div className="sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>
              <i className="fa fa-thumbs-up" style={{ marginRight: '8px', color: '#0066ff' }}></i> Danh sách đóng góp
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Vinh danh các thành viên có đóng góp đề xuất bài tập, kiểm thử test case và xây dựng cộng đồng FuraOJ.
            </p>
          </div>
        )}

        {activeTab === 'organizations' && (
          <div className="sidebox" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>
              <i className="fa fa-university" style={{ marginRight: '8px', color: '#0066ff' }}></i> Tổ chức &amp; Trường học
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Các trường chuyên, câu lạc bộ tin học và tổ chức thành viên trên nền tảng FuraOJ.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
