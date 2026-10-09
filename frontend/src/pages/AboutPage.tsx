// Logic: Authentic DMOJ / FuraOJ information and architecture overview page matching /about.
// Input: Architectural specifications, technology stack descriptions, and external links.
// Output: JSX.Element responsive presentation page with modern styling.

import React from 'react';
import { Link } from 'react-router-dom';

// Logic: Renders platform overview, technology highlights, and links to documentation.
// Input: None.
// Output: JSX.Element structured about page.
export function AboutPage(): JSX.Element {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 8px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', color: '#1e293b' }}>
        Thông tin hệ thống FuraOJ
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
        Nền tảng thi đấu lập trình và chấm điểm trực tuyến thế hệ mới Fura Online Judge v2.0.
      </p>
      <hr style={{ margin: '0 0 24px 0', borderColor: '#e2e8f0' }} />

      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          lineHeight: '1.7',
          color: '#334155',
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>
          Giới thiệu chung
        </h3>
        <p>
          <strong>FuraOJ (Fura Online Judge)</strong> là hệ thống chấm bài thi đấu trực tuyến được tái cấu trúc hoàn toàn trên nền tảng <strong>Rust</strong> và <strong>React SPA</strong>, kế thừa 100% lược đồ cơ sở dữ liệu và thuật toán xác thực PBKDF2 của hệ sinh thái DMOJ.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px 0', color: '#0f172a' }}>
          Đặc điểm kiến trúc cốt lõi
        </h3>
        <ul style={{ paddingLeft: '24px', margin: '10px 0' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Backend Axum Asynchronous (<code>furaoj-rust</code>):</strong> Xử lý hàng chục nghìn kết nối đồng thời với thời gian phản hồi dưới 1ms, hỗ trợ REST API v2 và WebSocket streaming điểm số trực tiếp.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Cụm máy chấm phân tán bảo mật (<code>furaoj-judgeserver-rust</code>):</strong> Máy chấm độc lập giao tiếp qua giao thức TCP nén zlib, kiểm soát tài nguyên qua Linux <code>cgroups v2</code> và giới hạn lời gọi hệ thống bằng <code>Seccomp-BPF</code>.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Hỗ trợ 65 môi trường thực thi (TierFuraOJ):</strong> C, C++20, Python 3, PyPy, Rust, Pascal/Themis, Scratch 3.0, Go, Java, Mono C#/F#/VB, Fortran, NASM, và nhiều ngôn ngữ khác.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Frontend Single Page Application:</strong> Tốc độ điều hướng tức thời không reload trang, tích hợp trình soạn thảo Monaco, bộ gõ công thức toán học KaTeX, và giao diện quản trị <strong>WPAdmin</strong> chuyên nghiệp.
          </li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px 0', color: '#0f172a' }}>
          Liên kết & Tài nguyên
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
          <Link
            to="/status"
            className="button-primary-tab"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#0066ff',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Trạng thái máy chấm
          </Link>
          <Link
            to="/custom_checkers"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#f1f5f9',
              color: '#0f172a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid #cbd5e1',
            }}
          >
            Tài liệu Trình chấm tùy biến
          </Link>
          <a
            href="//github.com/furavietnam/furaoj"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#f1f5f9',
              color: '#0f172a',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid #cbd5e1',
            }}
          >
            Mã nguồn Github
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
