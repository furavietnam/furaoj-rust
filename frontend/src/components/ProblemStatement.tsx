import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ProblemStatementProps {
  content: string;
}

/**
 * Logic: Renders problem statement markdown with KaTeX mathematical formulas and syntax formatting.
 * Input: `content` (string containing markdown and LaTeX math syntax).
 * Output: JSX.Element styled prose container displaying rendered problem statement.
 */
export function ProblemStatement({ content }: ProblemStatementProps): JSX.Element {
  return (
    <div className="content-description max-w-none space-y-3 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '20px 0 10px 0' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '16px 0 8px 0' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '14px 0 6px 0' }}>
              {children}
            </h3>
          ),
          p: ({ children }) => <p style={{ margin: '0 0 12px 0', lineHeight: 1.65 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: '24px', margin: '0 0 12px 0' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: '24px', margin: '0 0 12px 0' }}>{children}</ol>,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code style={{ background: 'rgba(100, 116, 139, 0.12)', padding: '2px 5px', borderRadius: '4px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13.5px' }}>
                {children}
              </code>
            ) : (
              <pre style={{ background: 'rgba(15, 23, 42, 0.04)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', border: '1px solid rgba(100, 116, 139, 0.2)', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px' }}>
                <code>{children}</code>
              </pre>
            );
          },
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 italic text-zinc-700 dark:text-zinc-300 my-4 bg-zinc-100/70 dark:bg-zinc-900/40 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded border border-zinc-300 dark:border-zinc-800">
              <table className="w-full text-left text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-300 dark:border-zinc-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800/60">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
