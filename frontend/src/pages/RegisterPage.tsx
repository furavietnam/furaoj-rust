// Logic: Authentic DMOJ registration page matching oj.fura.io.vn/accounts/register/.
// Input: User registration credentials (username, email, password, confirmPassword).
// Output: Created account response with automatic redirection to login or dashboard.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Logic: Renders user registration form with validation and PBKDF2 account creation.
// Input: Form inputs for username, email, password, and password confirmation.
// Output: JSX.Element responsive registration view matching DMOJ design tokens.
export function RegisterPage(): JSX.Element {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Logic: Validates input fields and calls backend API to register new user.
  // Input: Form event containing registration credentials.
  // Output: Navigates to home upon successful account registration.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError('Tên người dùng phải có ít nhất 3 ký tự.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      await api.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      // Automatically log the user in upon successful registration
      try {
        await login(username.trim(), password);
        navigate('/');
      } catch {
        navigate('/login');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Đăng ký thất bại.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ display: 'inline-block', margin: 0, fontSize: '24px', fontWeight: 800 }}>
        Đăng ký tài khoản
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
                  Tên truy cập (Username)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Chọn tên truy cập..."
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <i className="fa fa-envelope fa-fw" style={{ marginRight: '6px', color: '#0066ff' }}></i>
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Địa chỉ email (tùy chọn)..."
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <i className="fa fa-key fa-fw" style={{ marginRight: '6px', color: '#0066ff' }}></i>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự..."
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  <i className="fa fa-check-circle fa-fw" style={{ marginRight: '6px', color: '#0066ff' }}></i>
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu..."
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

              <button
                type="submit"
                disabled={isLoading}
                className="button-primary-tab"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0066ff',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'background 0.2s ease',
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    Đang tạo tài khoản...
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #edf2f7',
                textAlign: 'center',
                fontSize: '13px',
                color: '#64748b',
              }}
            >
              Đã có tài khoản?{' '}
              <Link to="/login" style={{ color: '#0066ff', fontWeight: 700, textDecoration: 'none' }}>
                Đăng nhập tại đây
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
