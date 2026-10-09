// Logic: Authentic DMOJ / FuraOJ users leaderboard matching oj.fura.io.vn/users/.
// Input: User leaderboard records from REST API.
// Output: Two-column / full-width DMOJ table with rank, user rating tier, and problem points.

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
];

export function UsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState<boolean>(true);

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
            <button className="seg-btn active">
              <i className="fa fa-trophy"></i> <span>Xếp hạng</span>
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        <table id="users-table" className="table striped">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Hạng</th>
              <th>Thành viên</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Đánh giá</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Điểm</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Số bài giải</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.username}>
                <td style={{ textAlign: 'center', fontWeight: 700 }} className="font-mono">
                  {idx + 1}
                </td>
                <td>
                  <Link
                    to={`/user/${u.username}`}
                    style={{ textDecoration: 'none', fontWeight: 600, color: '#0066ff' }}
                  >
                    <span className="rating rate-none admin">
                      {u.username}
                    </span>
                    {u.is_superuser && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(0,102,255,0.1)',
                          color: '#0066ff',
                          fontWeight: 700,
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                  </Link>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700 }} className="font-mono">
                  <span style={{ color: u.rating && u.rating >= 2400 ? '#ef4444' : '#10b981' }}>
                    {u.rating || 1500}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }} className="font-mono">
                  {u.points || 0}
                </td>
                <td style={{ textAlign: 'right', color: '#64748b' }} className="font-mono">
                  {u.solved_count || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
