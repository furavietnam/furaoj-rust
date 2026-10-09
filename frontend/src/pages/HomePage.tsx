// Logic: Authentic FuraOJ / DMOJ homepage layout matching oj.fura.io.vn.
// Input: Active problems and contests from API.
// Output: Two-column blog container with news feed, post voting, and authentic sidebar widgets.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProblemListItem } from '../types';

export function HomePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'news' | 'blog' | 'recommended'>('news');
  const [recentProblems, setRecentProblems] = useState<ProblemListItem[]>([]);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    api.getProblems()
      .then((data: ProblemListItem[]) => setRecentProblems(data.slice(0, 7)))
      .catch((err: Error) => console.error('Failed to load recent problems:', err));
  }, []);

  return (
    <>
      <div className="problem-list-header">
        <div className="problem-header-left">
          <div className="problem-header-icon">
            <i className="fa fa-newspaper-o"></i>
          </div>
          <div className="problem-header-title-block">
            <h1 className="problem-header-title">Bảng tin &amp; Thông báo</h1>
            <span className="problem-header-subtitle">
              Cập nhật tin tức, thông báo và bài viết chia sẻ kiến thức
            </span>
          </div>
        </div>
        <div className="problem-header-actions">
          <div className="header-segmented-control">
            <button
              onClick={() => setActiveTab('news')}
              className={`seg-btn ${activeTab === 'news' ? 'active' : ''}`}
            >
              <i className="fa fa-newspaper-o"></i> <span>Tin tức</span>
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`seg-btn ${activeTab === 'blog' ? 'active' : ''}`}
            >
              <i className="fa fa-rss"></i> <span>Blog</span>
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`seg-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            >
              <i className="fa fa-lightbulb-o"></i> <span>Đề xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div id="content-body">
        <div id="blog-container" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Main Blog / News Stream */}
          <div className="blog-content" style={{ flex: 1, minWidth: '300px' }}>
            <div className="blog-content-inner">
              <section className="sticky post" id="post-1" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div className="vote" style={{ textAlign: 'center', minWidth: '32px' }}>
                    <button
                      onClick={() => setScore(s => s + 1)}
                      title="Bình chọn thích"
                      className="upvote-link fa fa-chevron-up fa-fw"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto', color: '#64748b' }}
                    />
                    <div id="post-score" className="comment-score" style={{ fontWeight: 700, fontSize: '15px', margin: '4px 0' }}>
                      {score}
                    </div>
                    <button
                      onClick={() => setScore(s => Math.max(0, s - 1))}
                      title="Bình chọn không thích"
                      className="downvote-link fa fa-chevron-down fa-fw"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto', color: '#64748b' }}
                    />
                  </div>
                  <div>
                    <h2 className="title" style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800 }}>
                      <Link to="/" style={{ color: '#0066ff', textDecoration: 'none' }}>
                        Chào mừng bạn đến với FuraOJ
                      </Link>
                    </h2>
                    <span className="time" style={{ fontSize: '13px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <i title="Sticky" className="fa fa-star fa-fw" style={{ color: '#f59e0b' }}></i>
                      <span className="post-authors">
                        <span className="rating rate-none admin">
                          <Link to="/user/admin" style={{ fontWeight: 700, color: '#0066ff', textDecoration: 'none' }}>
                            admin
                          </Link>
                        </span>
                      </span>
                      <span className="time-with-rel">
                        &middot; đã đăng vào 31, Tháng 8, 2026, 5:00
                      </span>
                    </span>
                  </div>
                </div>

                <div className="summary content-description blog-body" style={{ margin: '16px 0', fontSize: '14.5px', lineHeight: 1.6 }}>
                  <p>Chào mừng bạn đến với FuraOJ.</p>
                  <p>
                    FuraOJ - Fura Online Judge - là hệ thống online judge thế hệ mới xây dựng trên nền tảng Rust hiệu năng cao,
                    tích hợp sandbox bảo mật Linux cgroups v2, hỗ trợ chấm bài thi đấu trực tiếp theo chuẩn quốc tế.
                  </p>
                </div>

                <div className="meta" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)', paddingTop: '12px' }}>
                  <div className="post-meta-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="post-meta-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#0066ff',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        A
                      </span>
                      <Link to="/user/admin" style={{ fontSize: '13px', fontWeight: 600, color: '#0066ff', textDecoration: 'none' }}>
                        admin
                      </Link>
                    </div>
                    <div className="post-meta-right" style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#64748b' }}>
                      <span>
                        <i className="fa fa-clock-o"></i> vào lúc 31, Tháng 8, 2026
                      </span>
                      <span className="comment-data">
                        <i className="fa fa-comments comment-icon"></i> <span className="comment-count">0</span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Second introductory post */}
              <section className="post" id="post-2" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div className="vote" style={{ textAlign: 'center', minWidth: '32px' }}>
                    <div className="comment-score" style={{ fontWeight: 700, fontSize: '15px', margin: '4px 0' }}>
                      5
                    </div>
                  </div>
                  <div>
                    <h2 className="title" style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800 }}>
                      <Link to="/problems" style={{ color: '#0066ff', textDecoration: 'none' }}>
                        Kho bài tập toán học &amp; giải thuật đã sẵn sàng
                      </Link>
                    </h2>
                    <span className="time" style={{ fontSize: '13px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span className="post-authors">
                        <span className="rating rate-none admin">
                          <Link to="/user/admin" style={{ fontWeight: 700, color: '#0066ff', textDecoration: 'none' }}>
                            admin
                          </Link>
                        </span>
                      </span>
                      <span className="time-with-rel">
                        &middot; đã cập nhật bộ test case thực tế
                      </span>
                    </span>
                  </div>
                </div>

                <div className="summary content-description blog-body" style={{ margin: '16px 0', fontSize: '14.5px', lineHeight: 1.6 }}>
                  <p>
                    Các bài tập thuật toán kinh điển như <b>A Plus B</b>, <b>Số Fibonacci</b>, <b>Giai Thừa Lấy Dư</b>, <b>Dãy Con Tổng Lớn Nhất</b>, và <b>Kiểm Tra Xâu Đối Xứng</b> đã được cập nhật bộ test case thực tế đầy đủ.
                  </p>
                  <p>
                    Hệ thống máy chấm hỗ trợ biên dịch và thực thi an toàn với các ngôn ngữ C++20, Python 3, Java, C, Pascal.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Right Sidebar Widgets */}
          <div className="blog-sidebar" style={{ width: '320px', minWidth: '280px', flexShrink: 0 }}>
            {/* Ongoing Contests Sidebox */}
            <div className="blog-sidebox sidebox" style={{ marginBottom: '20px' }}>
              <h3>
                <span>Các kỳ thi đang diễn ra</span> <i className="fa fa-trophy" style={{ color: '#fbbf24' }}></i>
              </h3>
              <div className="sidebox-content sidebox-ongoing-contest">
                <div className="contest" style={{ padding: '6px 0' }}>
                  <div className="contest-list-title" style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                    <Link to="/contests" style={{ color: '#0066ff', textDecoration: 'none' }}>
                      PL Chuyên Tin 12 2026
                    </Link>
                  </div>
                  <div className="time" style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Kết thúc trong <span className="time-remaining" style={{ fontWeight: 600, color: '#ef4444' }}>335 ngày 21:15:55</span>.
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Problems Sidebox */}
            <div className="blog-sidebox sidebox" style={{ marginBottom: '20px' }}>
              <h3>
                <span>Bài mới</span> <i className="fa fa-puzzle-piece" style={{ color: '#a78bfa' }}></i>
              </h3>
              <div className="sidebox-content">
                <ul className="problem-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentProblems.length > 0 ? (
                    recentProblems.map(p => (
                      <li key={p.code} style={{ padding: '7px 0', borderBottom: '1px solid rgba(226, 232, 240, 0.4)', fontSize: '13.5px' }}>
                        <Link to={`/problem/${p.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>
                          [{p.code}]
                        </Link>{' '}
                        - <span>{p.name}</span>
                      </li>
                    ))
                  ) : (
                    <li style={{ padding: '8px 0', color: '#94a3b8' }}>Đang tải bài tập...</li>
                  )}
                </ul>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                  <span className="rssatom">
                    <Link to="/problems" style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>
                      Xem tất cả bài tập &rarr;
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* Comments sidebox */}
            <div className="blog-sidebox sidebox">
              <h3>
                <span>Dòng bình luận</span> <i className="fa fa-comments" style={{ color: '#38bdf8' }}></i>
              </h3>
              <div className="sidebox-content" style={{ fontSize: '13px', color: '#64748b' }}>
                <p style={{ margin: '8px 0' }}>Chưa có bình luận mới nào.</p>
                <span className="rssatom" style={{ fontSize: '12px' }}>
                  <a href="//github.com/furavietnam/furaoj" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>
                    <i className="fa fa-rss"></i> RSS / Atom
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
