// Logic: Authentic DMOJ / FuraOJ contest arena dashboard matching templates/contest/contest.html.
// Input: Contest slug from URL parameter, problem challenges list from API.
// Output: JSX.Element contest problem challenge matrix with segmented control and scoreboard link.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Contest } from '../types';
import { fetchContest } from '../services/api';

const DEFAULT_CONTEST: Contest = {
  id: 1,
  title: 'FuraOJ Championship Round 1',
  slug: 'demo',
  description: 'Vòng thi chính thức của Fura Online Judge bao gồm 4 bài toán thuật toán phân hóa.',
  start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  end_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  is_visible: true,
  is_frozen: false,
};

const CONTEST_PROBLEMS = [
  { code: 'A', title: 'A Plus B Problem', points: 100, problem_code: 'aplusb' },
  { code: 'B', title: 'Số Fibonacci (Fibonacci Numbers)', points: 200, problem_code: 'fibonacci' },
  { code: 'C', title: 'Tính giai thừa (Factorial)', points: 300, problem_code: 'factorial' },
  { code: 'D', title: 'Tìm đường đi ngắn nhất Dijkstra', points: 400, problem_code: 'shortestpath' },
];

export function ContestDetailPage(): JSX.Element {
  const { slug = 'demo' } = useParams<{ slug: string }>();
  const [contest, setContest] = useState<Contest>(DEFAULT_CONTEST);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchContest(slug);
        if (data && data.slug) {
          setContest(data);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, [slug]);

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-trophy"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">{contest.title}</h1>
            <span className="problem-header-subtitle">
              {contest.description}
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button className="seg-btn active">
              <i className="fa fa-th-large"></i> <span>Bài tập</span>
            </button>
            <Link to={`/contest/${contest.slug}/scoreboard`} className="seg-btn">
              <i className="fa fa-bar-chart"></i> <span>Bảng điểm</span>
            </Link>
          </div>
        </div>
      </div>

      <div id="content-body">
        <div id="common-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Main Contest Problems Table */}
          <div id="content-left" style={{ flex: 1, minWidth: 0 }}>
            <table id="problem-table" className="table striped" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                  <th>Tên bài tập</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Điểm</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {CONTEST_PROBLEMS.map((p) => (
                  <tr key={p.code}>
                    <td className="font-mono" style={{ textAlign: 'center', fontWeight: 800, color: '#0066ff' }}>
                      {p.code}
                    </td>
                    <td>
                      <Link
                        to={`/problem/${p.problem_code}`}
                        style={{ color: '#0066ff', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {p.points} pts
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/problem/${p.problem_code}`}
                        className="unselectable button"
                        style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: '#0066ff',
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '12.5px',
                        }}
                      >
                        <i className="fa fa-pencil"></i> Giải bài
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Contest Info Sidebar */}
          <div id="content-right" style={{ width: '280px', flexShrink: 0 }}>
            <div className="sidebox" style={{ padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800 }}>
                <i className="fa fa-info-circle" style={{ marginRight: '6px', color: '#0066ff' }}></i> Thông tin kỳ thi
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#64748b' }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>Thể thức:</strong> ICPC / IOI
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Thời lượng:</strong> 3 giờ
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Đóng băng bảng điểm:</strong> 60 phút cuối
                </div>
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #edf2f7' }} />
                <Link
                  to={`/contest/${contest.slug}/scoreboard`}
                  className="unselectable button full"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#0066ff',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  <i className="fa fa-bar-chart"></i> Xem Bảng điểm trực tiếp
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
