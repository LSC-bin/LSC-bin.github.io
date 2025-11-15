/**
 * 앱 레이아웃 컴포넌트
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        메인 콘텐츠로 건너뛰기
      </a>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main id="main-content" className="main-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

