// Logic: Standalone printable problem view replicating DMOJ problem/raw.html, providing clean mathematical layout and instant PDF printing.
// Input: URL parameter `code` designating problem slug, optional query param `autoprint`.
// Output: JSX.Element rendering minimalist printable problem view with auto-typeset mathematics and PDF export capabilities.

import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ProblemStatement } from '../components/ProblemStatement';

export function ProblemRawPage(): JSX.Element {
  const { code = '' } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getProblem(code);
        setProblem(data);
      } catch (err) {
        console.error('Failed to load raw problem:', err);
      } finally {
        setLoading(false);
      }
    }
    if (code) {
      load();
    }
  }, [code]);

  useEffect(() => {
    if (problem) {
      document.body.classList.add('math-loaded');
      const autoprint = searchParams.get('print') === '1' || searchParams.get('autoprint') === '1';
      if (autoprint) {
        const timer = setTimeout(() => {
          window.print();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
    return () => {
      document.body.classList.remove('math-loaded');
    };
  }, [problem, searchParams]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
        <i className="fa fa-spinner fa-spin fa-2x"></i>
        <p style={{ marginTop: '12px' }}>Đang tải bài tập...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444', fontFamily: 'sans-serif' }}>
        <h2>Không tìm thấy bài tập</h2>
        <Link to="/problems" style={{ color: '#0066ff' }}>&larr; Quay lại danh sách bài</Link>
      </div>
    );
  }

  return (
    <div className="raw-problem-wrapper" style={{ background: '#ffffff', minHeight: '100vh', color: '#000000' }}>
      {/* Screen toolbar: hidden during print */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Link
          to={`/problem/${problem.code}`}
          style={{
            color: '#0066ff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <i className="fa fa-arrow-left"></i>
          <span>Quay lại bài tập [{problem.code}]</span>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            background: '#0066ff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            boxShadow: '0 2px 6px rgba(0, 102, 255, 0.3)',
          }}
        >
          <i className="fa fa-print"></i>
          <span>In / Lưu PDF</span>
        </button>
      </div>

      {/* Main printable sheet */}
      <div
        className="raw-problem-sheet"
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '36px 28px',
          background: '#ffffff',
          color: '#000000',
        }}
      >
        <h2 style={{ display: 'inline-block', margin: 0, fontSize: '24px', fontWeight: 800, color: '#000000' }}>
          [{problem.code}] - {problem.name}
        </h2>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '14px 0 16px' }} />

        {/* Limits bar replicating DMOJ raw.html info-table */}
        <div
          style={{
            position: 'relative',
            margin: '14px 0',
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '28px',
            flexWrap: 'wrap',
          }}
        >
          <div className="problem-info-entry" style={{ textAlign: 'left', padding: '6px 12px', fontSize: '14px' }}>
            <b>Thời gian giới hạn:</b> {problem.time_limit}s
          </div>
          <div className="problem-info-entry" style={{ textAlign: 'left', padding: '6px 12px', fontSize: '14px' }}>
            <b>Bộ nhớ giới hạn:</b> {problem.memory_limit}M
          </div>
          <div className="problem-info-entry" style={{ textAlign: 'left', padding: '6px 12px', fontSize: '14px' }}>
            <b>Điểm:</b> {problem.points ? problem.points.toFixed(2) : '100.00'} (OI)
          </div>
          <div className="problem-info-entry" style={{ textAlign: 'left', padding: '6px 12px', fontSize: '14px' }}>
            <b>Đầu vào / Đầu ra:</b> stdin / stdout
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '14px 0 24px', clear: 'both' }} />

        <div className="content-description printing">
          <ProblemStatement content={problem.description} />
        </div>
      </div>
    </div>
  );
}

export default ProblemRawPage;
