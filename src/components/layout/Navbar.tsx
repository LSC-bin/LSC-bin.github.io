/**
 * 네비게이션 바 컴포넌트
 */

import React from 'react';
import { authService } from '@/services/auth';

export const Navbar: React.FC = () => {
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await authService.logout();
      window.location.href = '/';
    }
  };

  return (
    <header id="navbar" role="banner">
      <button
        id="menu-btn"
        className="menu-btn"
        aria-label="메뉴 열기"
        aria-expanded="false"
      >
        <i className="bx bx-menu" aria-hidden="true"></i>
      </button>

      <div className="navbar-class-info" id="navbar-class-info" role="button" tabIndex={0}>
        <i className="bx bxs-school" aria-hidden="true"></i>
        <span className="navbar-class-name" id="navbar-class-name">
          클래스를 선택하세요
        </span>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="profile" role="button" tabIndex={0} aria-label="프로필 메뉴">
            <span className="profile-name">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn"
              aria-label="로그아웃"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

