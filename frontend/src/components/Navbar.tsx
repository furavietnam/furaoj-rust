// Logic: Top floating pill navigation bar matching authentic DMOJ / FuraOJ layout and styling.
// Input: Active route, user authentication state, live WebSocket status.
// Output: Responsive DMOJ navigation bar with dropdown menus, settings popup, and theme toggling.

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar(): JSX.Element {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setThemeState] = useState<string>(() => localStorage.getItem('furaoj_theme') || 'dark');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('furaoj_theme', theme);
  }, [theme]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setSettingsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenDropdown(null);
    setSettingsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdown(prev => (prev === name ? null : name));
    setSettingsOpen(false);
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSettingsOpen(prev => !prev);
    setOpenDropdown(null);
  };

  return (
    <nav id="navigation" className="unselectable" ref={navRef}>
      <div id="nav-container">
        <div className="nav-left-group">
          <a
            id="navicon"
            href="javascript:void(0)"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            <i className="fa fa-bars"></i>
          </a>
          <Link className="nav-brand-mobile" to="/">
            <img
              src="/logo.svg"
              alt="FuraOJ"
              width="130"
              height="40"
              style={{ border: 'none', paddingTop: '4px' }}
            />
          </Link>
        </div>

        <ul id="nav-list" className={mobileMenuOpen ? 'show-list' : ''}>
          <li className="home-nav-element">
            <Link to="/">
              <img
                src="/logo.svg"
                alt="FuraOJ"
                width="130"
                height="40"
                style={{ border: 'none', paddingTop: '4px' }}
              />
            </Link>
          </li>
          <li className="home-nav-element">
            <span className="nav-divider"></span>
          </li>
          <li className="home-menu-item">
            <Link to="/" className={`nav-home ${location.pathname === '/' ? 'active' : ''}`}>
              Trang chủ
            </Link>
          </li>
          <li className={openDropdown === 'problems' ? 'dropdown-open is-open' : ''}>
            <Link
              to="/problems"
              className={`nav-problems ${location.pathname.startsWith('/problem') ? 'active' : ''}`}
              onClick={(e) => toggleDropdown('problems', e)}
            >
              Bài
              <div className="nav-expand">&gt;</div>
            </Link>
            <ul>
              <li>
                <Link to="/submissions" className="nav-submit">
                  Các bài nộp
                </Link>
              </li>
              <li>
                <Link to="/contests" className="nav-contest">
                  Các kỳ thi
                </Link>
              </li>
              <li>
                <Link to="/exams" className="nav-exams">
                  Đề thi
                </Link>
              </li>
            </ul>
          </li>
          <li className={openDropdown === 'users' ? 'dropdown-open is-open' : ''}>
            <Link
              to="/users"
              className={`nav-user ${location.pathname.startsWith('/user') ? 'active' : ''}`}
              onClick={(e) => toggleDropdown('users', e)}
            >
              Thành viên
              <div className="nav-expand">&gt;</div>
            </Link>
            <ul>
              <li>
                <Link to="/organizations" className="nav-organizati">
                  Tổ chức
                </Link>
              </li>
            </ul>
          </li>
          <li className={openDropdown === 'about' ? 'dropdown-open is-open' : ''}>
            <a
              href="javascript:void(0)"
              className="nav-about"
              onClick={(e) => toggleDropdown('about', e)}
            >
              Thông tin
              <div className="nav-expand">&gt;</div>
            </a>
            <ul>
              <li>
                <Link to="/status" className="nav-status">
                  Máy chấm
                </Link>
              </li>
              <li>
                <a
                  href="//github.com/furavietnam/furaoj"
                  className="nav-github"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
              </li>
            </ul>
          </li>
        </ul>

        <span id="user-links">
          <ul className="anon-settings-nav">
            <li className={`anon-settings-item ${settingsOpen ? 'dropdown-open is-open' : ''}`}>
              <a
                href="javascript:void(0)"
                className="nav-gear-btn"
                title="Cài đặt"
                aria-label="Cài đặt"
                onClick={toggleSettings}
              >
                <i className="fa fa-gear"></i>
              </a>
              <ul className="settings-popup" style={{ minWidth: 210, right: 0, left: 'auto' }}>
                <li>
                  <div className="nav-settings-row">
                    <span className="nav-settings-lbl">Giao diện</span>
                    <span className="nav-seg">
                      <span
                        onClick={() => setThemeState('light')}
                        className={`nav-seg-btn ${theme === 'light' ? 'active' : ''}`}
                        role="button"
                      >
                        <i className="fa fa-sun-o"></i>
                      </span>
                      <span
                        onClick={() => setThemeState('dark')}
                        className={`nav-seg-btn ${theme === 'dark' ? 'active' : ''}`}
                        role="button"
                      >
                        <i className="fa fa-moon-o"></i>
                      </span>
                    </span>
                  </div>
                </li>
                <li>
                  <div className="nav-settings-row">
                    <span className="nav-settings-lbl">Ngôn ngữ</span>
                    <span className="nav-seg">
                      <span className="nav-seg-btn active">VI</span>
                      <span className="nav-seg-btn">EN</span>
                    </span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>

          {isAuthenticated && user ? (
            <span className="user-logged-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to={`/user/${user.username}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#0066ff',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="rating rate-none admin" style={{ fontWeight: 600 }}>
                  {user.username}
                </span>
              </Link>
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: 14,
                  padding: '4px 6px',
                }}
                title="Đăng xuất"
              >
                <i className="fa fa-sign-out"></i>
              </button>
            </span>
          ) : (
            <span className="anon">
              <Link to="/login" className="btn-nav-login">
                Đăng nhập
              </Link>
              <Link to="/login" className="btn-nav-signup">
                Đăng ký
              </Link>
            </span>
          )}
        </span>
      </div>
      <div id="nav-shadow"></div>
    </nav>
  );
}
