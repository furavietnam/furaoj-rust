// Logic: Authentic DMOJ authentication login page matching oj.fura.io.vn/accounts/login/.
// Input: User credentials (username, password).
// Output: Authentication session or error message aligned with DMOJ form layout.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ display: 'inline-block', margin: 0, fontSize: '24px', fontWeight: 800 }}>
        Đăng nhập
      </h2>
      <hr style={{ margin: '14px 0 24px 0' }} />

      <div id="content-body">
        <div className="auth-flow-form" style={{ maxWidth: 460, margin: '20px auto' }}>
          <div className="sidebox" style={{ padding: '28px' }}>
            {error && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <i className="fa fa-user fa-fw" style={{ marginRight: '6px', color: '#0066ff' }}></i>
                  Tên truy cập
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tên truy cập"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <i className="fa fa-key fa-fw" style={{ marginRight: '6px', color: '#0066ff' }}></i>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <hr style={{ margin: '18px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>
                  Quên mật khẩu?
                </a>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: '#0066ff',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,102,255,0.3)',
                  }}
                >
                  {isLoading ? 'Đang xác thực...' : 'Đăng nhập!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
