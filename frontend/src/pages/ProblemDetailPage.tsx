// Logic: Authentic DMOJ / FuraOJ problem detail interface matching oj.fura.io.vn/problem/{code}.
// Input: Problem code slug from URL, active source code edits, language selection, and submit modal state.
// Output: Two-column problem detail with statement KaTeX rendering, info sidebar metadata, comments area, and submit modal.

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProblemStatement } from '../components/ProblemStatement';
import { CodeEditor } from '../components/CodeEditor';

const DEFAULT_SNIPPETS: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write solution here
    return 0;
}`,
  python: `import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    # Write solution here

if __name__ == '__main__':
    main()`,
  c: `#include <stdio.h>

int main() {
    // Write solution here
    return 0;
}`,
  pascal: `program Solution;
begin
  // Write solution here
end.`,
};

export function ProblemDetailPage(): JSX.Element {
  const { code = 'aplusb' } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('cpp');
  const [sourceCode, setSourceCode] = useState<string>(DEFAULT_SNIPPETS.cpp);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestSubmission, setLatestSubmission] = useState<any>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getProblem(code);
        setProblem(data);
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (!sourceCode || Object.values(DEFAULT_SNIPPETS).includes(sourceCode)) {
      setSourceCode(DEFAULT_SNIPPETS[lang] || '');
    }
  };

  const handleSubmit = async () => {
    if (!sourceCode.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitProblem({
        problem_code: code,
        language,
        source_code: sourceCode,
      });
      setLatestSubmission(res);
      setSubmitModalOpen(false);
      if (res && res.submission_id) {
        navigate(`/submission/${res.submission_id}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <i className="fa fa-spinner fa-spin fa-2x"></i>
        <p style={{ marginTop: '12px' }}>Đang tải bài tập...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
        <h2>Không tìm thấy bài tập</h2>
        <Link to="/problems" style={{ color: '#0066ff' }}>&larr; Quay lại danh sách bài</Link>
      </div>
    );
  }

  return (
    <>
      <div className="problem-title">
        <h2 style={{ display: 'inline-block', margin: 0, fontSize: '24px', fontWeight: 800 }}>
          [{problem.code}] - {problem.name}
        </h2>
        <span className="spacer"></span>
        <a id="pdf_button" className="view-pdf" href="#" onClick={(e) => e.preventDefault()}>
          <span className="pdf-icon">
            <span className="fa fa-file-pdf-o pdf-icon-logo"></span>
            <span className="pdf-icon-bar"></span>
          </span>
          Xem dạng PDF
        </a>
      </div>
      <hr style={{ margin: '14px 0 20px 0' }} />

      <div id="content-body">
        <div id="common-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Left Column: Problem statement & submission box */}
          <div id="content-left" className="split-common-content" style={{ flex: 1, minWidth: 0 }}>
            {/* Statement card */}
            <div className="content content-description screen" style={{ marginBottom: '24px' }}>
              <ProblemStatement content={problem.description} />
            </div>

            {/* Submission feedback banner if present */}
            {latestSubmission && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(0, 102, 255, 0.08)',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>
                    Bài nộp #{latestSubmission.submission_id || latestSubmission.id}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Trạng thái: {latestSubmission.status}
                  </div>
                </div>
                <Link
                  to={`/submission/${latestSubmission.submission_id || latestSubmission.id}`}
                  style={{
                    background: '#0066ff',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  Xem kết quả &rarr;
                </Link>
              </div>
            )}

            {/* Code Editor submission card */}
            <div
              id="submission-editor-card"
              style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid #edf2f7',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fa fa-code" style={{ marginRight: '8px', color: '#0066ff' }}></i>
                Nộp bài giải
              </h3>
              <CodeEditor
                code={sourceCode}
                onChange={setSourceCode}
                language={language}
                onLanguageChange={handleLanguageChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Discussion & Comments Area */}
            <div id="comments" style={{ marginTop: '24px' }}>
              <div className="sidebox" style={{ borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>
                  <i className="fa fa-comments" style={{ marginRight: '8px', color: '#0066ff' }}></i>
                  Bình luận &amp; Thảo luận
                </h3>
                <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
                  Chưa có bình luận nào cho bài tập này. Hãy trao đổi và chia sẻ hướng giải tại đây!
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Problem Metadata Sidebar */}
          <div id="content-right" style={{ width: '300px', flexShrink: 0 }}>
            <div className="info-float">
              {/* Authentic Submit Solution Button */}
              <a
                href="javascript:void(0)"
                onClick={() => setSubmitModalOpen(true)}
                className="unselectable button full submit-solution-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '14px',
                  boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)',
                  marginBottom: '14px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-paper-plane"></i> <span>Nộp bài giải</span>
              </a>

              <hr style={{ paddingTop: '0.3em', margin: '10px 0' }} />

              <div style={{ marginBottom: '6px' }}>
                <Link to={`/submissions?problem=${problem.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600, fontSize: '13.5px' }}>
                  <i className="fa fa-list-alt" style={{ marginRight: '6px' }}></i> Bài nộp của tôi
                </Link>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <Link to={`/submissions?problem=${problem.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600, fontSize: '13.5px' }}>
                  <i className="fa fa-clock-o" style={{ marginRight: '6px' }}></i> Tất cả bài nộp
                </Link>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <Link to={`/submissions?problem=${problem.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600, fontSize: '13.5px' }}>
                  <i className="fa fa-trophy" style={{ marginRight: '6px' }}></i> Bài nộp tốt nhất
                </Link>
              </div>

              <hr style={{ paddingTop: '0.3em', margin: '12px 0' }} />

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-check fa-fw" style={{ color: '#10b981', marginRight: '6px' }}></i> Điểm:
                </span>
                <span className="pi-value font-mono" style={{ fontWeight: 700 }}>
                  {problem.points ? problem.points.toFixed(2) : '100.00'} (OI)
                </span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-clock-o fa-fw" style={{ color: '#f59e0b', marginRight: '6px' }}></i> Thời gian giới hạn:
                </span>
                <span className="pi-value font-mono">{problem.time_limit}s</span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-server fa-fw" style={{ color: '#8b5cf6', marginRight: '6px' }}></i> Bộ nhớ giới hạn:
                </span>
                <span className="pi-value font-mono">{problem.memory_limit}M</span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-keyboard-o fa-fw" style={{ color: '#64748b', marginRight: '6px' }}></i> Đầu vào:
                </span>
                <span className="pi-value">
                  <i>stdin (standard input)</i>
                </span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-print fa-fw" style={{ color: '#64748b', marginRight: '6px' }}></i> Đầu ra:
                </span>
                <span className="pi-value">
                  <i>stdout (standard output)</i>
                </span>
              </div>

              <hr style={{ paddingTop: '0.7em', margin: '12px 0' }} />

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-pencil-square-o fa-fw" style={{ color: '#ec4899', marginRight: '6px' }}></i> Tác giả:
                </span>
                <div className="pi-value authors-value">
                  <span className="rating rate-none admin">
                    <Link to="/user/admin" style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>
                      admin
                    </Link>
                  </span>
                </div>
              </div>

              <div id="problem-types" style={{ marginTop: '16px' }}>
                <div className="toggle closed unselectable" style={{ fontSize: '13px', color: '#64748b' }}>
                  <i className="fa fa-chevron-right fa-fw"></i> Thể loại: Thuật toán &amp; Cấu trúc dữ liệu
                </div>
              </div>

              <div id="allowed-langs" style={{ marginTop: '12px', fontSize: '12.5px', color: '#64748b' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Ngôn ngữ hỗ trợ:</div>
                <div>C++17, Python 3, Rust, Java 17, C11, Pascal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Submit Dialog matching DMOJ #submit-modal */}
      {submitModalOpen && (
        <div id="submit-modal" className="active" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            id="submit-modal-overlay"
            onClick={() => setSubmitModalOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(3px)' }}
          ></div>
          <div
            id="submit-modal-dialog"
            style={{
              position: 'relative',
              zIndex: 10000,
              width: '90%',
              maxWidth: '800px',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="submit-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <i className="fa fa-paper-plane" style={{ marginRight: '8px', color: '#0066ff' }}></i>
                Nộp bài giải: [{problem.code}] {problem.name}
              </h3>
              <button
                type="button"
                className="submit-modal-close"
                onClick={() => setSubmitModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="submit-modal-body">
              <CodeEditor
                code={sourceCode}
                onChange={setSourceCode}
                language={language}
                onLanguageChange={handleLanguageChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
