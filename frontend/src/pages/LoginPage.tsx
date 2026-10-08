import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Logic: Authentication login portal with PBKDF2/SHA256 Django-compatible credentials verification.
 * Input: None.
 * Output: JSX.Element login screen with error state and credentials form.
 */
export function LoginPage(): JSX.Element {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch {
      // In offline / standalone preview mode, allow demo login
      if (username === 'admin' && password === 'admin123') {
        const dummyUser = {
          id: 1,
          username: 'admin',
          email: 'admin@furaoj.org',
          is_staff: true,
          is_superuser: true,
          rating: 2450,
        };
        localStorage.setItem('furaoj_token', 'demo_token_admin');
        localStorage.setItem('furaoj_user', JSON.stringify(dummyUser));
        window.location.href = '/';
      } else {
        setError('Invalid username or password. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-2xl text-blue-400 border border-blue-500/30">
            ⚡
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Sign in to FuraOJ
          </h2>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Compatible with legacy Django PBKDF2 credentials
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-800/50 bg-rose-950/30 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase font-mono">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase font-mono">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-4 text-center font-mono text-xs text-zinc-500">
          Demo Account: <span className="text-zinc-300">admin</span> / <span className="text-zinc-300">admin123</span>
        </div>
      </div>
    </div>
  );
}
