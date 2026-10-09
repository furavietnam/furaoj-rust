// Logic: Top floating pill navigation bar matching authentic DMOJ / FuraOJ layout and styling.
// Input: Active route, user authentication state, live WebSocket status.
// Output: Responsive DMOJ navigation bar with dropdown menus, settings popup, and theme toggling.

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Logic: Renders authentic DMOJ top navigation bar matching templates/base.html and navbar.json.
// Input: Active route from react-router, authentication context, and user settings.
// Output: JSX.Element responsive navbar with dropdown menus and user account controls.
export function Navbar(): JSX.Element {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenDropdown(null);
    setSettingsOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdown(prev => (prev === name ? null : name));
    setSettingsOpen(false);
    setUserMenuOpen(false);
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSettingsOpen(prev => !prev);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUserMenuOpen(prev => !prev);
    setOpenDropdown(null);
    setSettingsOpen(false);
  };

  const isStaff = user?.is_staff || user?.username === 'admin';

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
          <li>
            <Link
              to="/problems"
              className={`nav-problems ${location.pathname.startsWith('/problem') ? 'active' : ''}`}
            >
              Danh sách bài
            </Link>
          </li>
          <li>
            <Link
              to="/submissions"
              className={`nav-submit ${location.pathname.startsWith('/submission') ? 'active' : ''}`}
            >
              Các bài nộp
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className={`nav-user ${
                location.pathname.startsWith('/users') ||
                (location.pathname.startsWith('/user') && !location.pathname.startsWith('/users'))
                  ? 'active'
                  : ''
              }`}
            >
              Thành viên
            </Link>
          </li>
          <li>
            <Link
              to="/contests"
              className={`nav-contest ${location.pathname.startsWith('/contest') ? 'active' : ''}`}
            >
              Các kỳ thi
            </Link>
          </li>
          <li className={openDropdown === 'about' ? 'dropdown-open is-open' : ''}>
            <a
              href="javascript:void(0)"
              className={`nav-about ${
                ['/status', '/custom_checkers', '/about'].includes(location.pathname) ? 'active' : ''
              }`}
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
                <Link to="/custom_checkers" className="nav-checkers">
                  Trình chấm tùy biến
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
          {!isAuthenticated ? (
            <>
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
              <span className="anon">
                <Link to="/login" className="btn-nav-login">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-nav-signup">
                  Đăng ký
                </Link>
              </span>
            </>
          ) : (
            <ul className="user-dropdown-nav">
              <li className={userMenuOpen ? 'dropdown-open is-open' : ''}>
                <a
                  href="javascript:void(0)"
                  className="user-profile-pill"
                  onClick={toggleUserMenu}
                >
                  <span className="user-avatar-circle">
                    {(user?.username || 'U')[0].toUpperCase()}
                  </span>
                  <span className="user-display-name">{user?.username}</span>
                  <i className="fa fa-angle-down user-chevron"></i>
                </a>
                <ul className="user-dropdown-menu" style={{ minWidth: 210, right: 0, left: 'auto' }}>
                  <li>
                    <Link to={`/user/${user?.username}`}>
                      <i className="fa fa-user"></i> Trang cá nhân
                    </Link>
                  </li>
                  {isStaff && (
                    <li>
                      <Link to="/admin">
                        <i className="fa fa-cogs"></i> Quản trị (Admin)
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to={`/user/${user?.username}`}>
                      <i className="fa fa-pencil"></i> Sửa hồ sơ
                    </Link>
                  </li>
                  <li>
                    <Link to="/tickets/new">
                      <i className="fa fa-bug"></i> Báo cáo sự cố
                    </Link>
                  </li>
                  <li
                    className="nav-dropdown-divider"
                    style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }}
                  ></li>
                  <li>
                    <div
                      className="nav-settings-row"
                      style={{
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span className="nav-settings-lbl" style={{ fontSize: '13px', color: '#64748b' }}>
                        Giao diện
                      </span>
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
                    <div
                      className="nav-settings-row"
                      style={{
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span className="nav-settings-lbl" style={{ fontSize: '13px', color: '#64748b' }}>
                        Ngôn ngữ
                      </span>
                      <span className="nav-seg">
                        <span className="nav-seg-btn active">VI</span>
                        <span className="nav-seg-btn">EN</span>
                      </span>
                    </div>
                  </li>
                  <li
                    className="nav-dropdown-divider"
                    style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }}
                  ></li>
                  <li>
                    <button onClick={logout} className="nav-logout-btn">
                      <i className="fa fa-sign-out"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
        </span>
      </div>
      <div id="nav-shadow"></div>
    </nav>
  );
}
