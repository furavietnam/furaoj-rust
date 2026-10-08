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
    <div className="prose prose-invert max-w-none space-y-4 text-zinc-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 border-b border-zinc-800 pb-2 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-zinc-200 mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-zinc-200 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 mb-4">{children}</ol>,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-sm text-blue-300 border border-zinc-700/50">
                {children}
              </code>
            ) : (
              <div className="my-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/90 p-4">
                <code className="font-mono text-sm text-zinc-200">{children}</code>
              </div>
            );
          },
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 italic text-zinc-400 my-4 bg-zinc-900/40 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded border border-zinc-800">
              <table className="w-full text-left text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-zinc-800/80 px-4 py-2 font-semibold text-zinc-200 border-b border-zinc-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-zinc-300 border-b border-zinc-800/60">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
