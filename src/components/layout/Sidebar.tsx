/**
 * 사이드바 컴포넌트
 */

import React, { useState, useEffect } from 'react';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <aside
      id="sidebar"
      className={isCollapsed ? 'collapsed' : ''}
      role="navigation"
      aria-label="주 메뉴"
    >
      <div className="sidebar-top">
        <div className="sidebar-brand" role="banner">
          <i className="bx bxs-graduation" aria-hidden="true"></i>
          <span className="brand-name">ClassBoard</span>
        </div>
        <button
          id="navbar-sidebar-toggle"
          className="navbar-sidebar-toggle-btn"
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className="bx bx-chevron-left" aria-hidden="true"></i>
        </button>
      </div>

      <ul className="sidebar-menu" id="sidebar-menu" role="menubar">
        {/* 메뉴 아이템은 동적으로 생성 */}
      </ul>
    </aside>
  );
};

