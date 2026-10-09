import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { id: 'cpp', name: 'C++ 20 (GCC)', monacoLang: 'cpp' },
  { id: 'cppthemis', name: 'C++ (Themis - 64MB Stack)', monacoLang: 'cpp' },
  { id: 'python', name: 'Python 3 (CPython)', monacoLang: 'python' },
  { id: 'pypy3', name: 'PyPy 3 (Fast JIT)', monacoLang: 'python' },
  { id: 'rust', name: 'Rust 2021 (rustc)', monacoLang: 'rust' },
  { id: 'c', name: 'C11 (GCC)', monacoLang: 'c' },
  { id: 'pas', name: 'Pascal (Free Pascal)', monacoLang: 'pascal' },
  { id: 'pasthemis', name: 'Pascal (Themis - 64MB Stack)', monacoLang: 'pascal' },
  { id: 'java', name: 'Java 17/21 (OpenJDK)', monacoLang: 'java' },
  { id: 'go', name: 'Go 1.22', monacoLang: 'go' },
  { id: 'scratch', name: 'Scratch 3.0 (sb3)', monacoLang: 'plaintext' },
  { id: 'kotlin', name: 'Kotlin (JVM)', monacoLang: 'kotlin' },
  { id: 'nodejs', name: 'JavaScript (Node.js)', monacoLang: 'javascript' },
  { id: 'monocs', name: 'C# (Mono)', monacoLang: 'csharp' },
  { id: 'f95', name: 'Fortran 95 (GFortran)', monacoLang: 'fortran' },
  { id: 'nasm', name: 'NASM x86 Assembly', monacoLang: 'plaintext' },
  { id: 'hask', name: 'Haskell (GHC)', monacoLang: 'plaintext' },
  { id: 'ocaml', name: 'OCaml', monacoLang: 'plaintext' },
  { id: 'ruby', name: 'Ruby', monacoLang: 'ruby' },
  { id: 'php', name: 'PHP 8', monacoLang: 'php' },
];

/**
 * Logic: Monaco Editor wrapper with language switcher and Ctrl+Enter submission shortcut.
 * Input: `code` (string), `onChange` (callback), `language` (selected language), `onSubmit` (submit handler).
 * Output: JSX.Element responsive IDE editor component with dark mode theme.
 */
export function CodeEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  onSubmit,
  isSubmitting = false,
}: CodeEditorProps): JSX.Element {
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isSubmitting) {
        onSubmit();
      }
    }
  };

  return (
    <div
      className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-xl"
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Language:
          </span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-500 sm:inline">
            Press <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-300">Ctrl+Enter</kbd> to submit
          </span>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              'Submit Code'
            )}
          </button>
        </div>
      </div>

      <div className="h-[480px] w-full">
        <Editor
          height="100%"
          language={currentLangObj.monacoLang}
          value={code}
          theme="vs-dark"
          onChange={(val) => onChange(val || '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
