// Logic: Authentic DMOJ / FuraOJ problem detail interface matching oj.fura.io.vn/problem/{code}.
// Input: Active problem slug from route parameter, live source code edits, language selection.
// Output: Two-column problem detail with statement KaTeX rendering, info sidebar metadata, and code editor.

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProblemStatement } from '../components/ProblemStatement';
import { CodeEditor } from '../components/CodeEditor';
import { VerdictBadge } from '../components/VerdictBadge';

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
              style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid #edf2f7',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
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
          </div>

          {/* Right Column: Problem Metadata Sidebar */}
          <div id="content-right" style={{ width: '300px', flexShrink: 0 }}>
            <div className="info-float">
              <div style={{ marginBottom: '6px' }}>
                <Link to={`/submissions?problem=${problem.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                  Danh sách bài nộp
                </Link>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <Link to={`/submissions?problem=${problem.code}`} style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                  Bài nộp tốt nhất
                </Link>
              </div>

              <hr style={{ paddingTop: '0.3em', margin: '12px 0' }} />

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-check fa-fw" style={{ color: '#10b981', marginRight: '6px' }}></i> Điểm:
                </span>
                <span className="pi-value">
                  {problem.points ? problem.points.toFixed(2) : '100.00'} (OI)
                </span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-clock-o fa-fw" style={{ color: '#f59e0b', marginRight: '6px' }}></i> Giới hạn thời gian:
                </span>
                <span className="pi-value">{problem.time_limit}s</span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-server fa-fw" style={{ color: '#8b5cf6', marginRight: '6px' }}></i> Giới hạn bộ nhớ:
                </span>
                <span className="pi-value">{problem.memory_limit}M</span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-keyboard-o fa-fw" style={{ color: '#64748b', marginRight: '6px' }}></i> Input:
                </span>
                <span className="pi-value">
                  <i>standard input</i>
                </span>
              </div>

              <div className="problem-info-entry">
                <span className="pi-name">
                  <i className="fa fa-print fa-fw" style={{ color: '#64748b', marginRight: '6px' }}></i> Output:
                </span>
                <span className="pi-value">
                  <i>standard output</i>
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
                <div className="toggle closed unselectable" style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>
                  <i className="fa fa-chevron-right fa-fw"></i> Dạng bài: Thuật toán &amp; Cấu trúc dữ liệu
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
