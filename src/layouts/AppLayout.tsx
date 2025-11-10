import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import styles from './AppLayout.module.css';

export type AppLayoutContext = {
  searchTerm: string;
};

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handler = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setIsMobileSidebarOpen(false);
      }
    };

    const mediaQuery = window.matchMedia('(min-width: 961px)');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleNavbarSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) {
      setIsMobileSidebarOpen((value) => !value);
    } else {
      setIsSidebarCollapsed((value) => !value);
    }
  };

  const handleCollapseToggle = () => {
    setIsSidebarCollapsed((value) => !value);
  };

  const handleBrandClick = () => {
    if (typeof window !== 'undefined' && window.confirm('다른 클래스를 선택하시겠습니까?')) {
      window.location.href = '/legacy/class-select.html';
    }
  };

  const contextValue = useMemo<AppLayoutContext>(() => ({ searchTerm }), [searchTerm]);

  const contentAreaClassName = [styles.contentArea];
  if (isSidebarCollapsed) {
    contentAreaClassName.push(styles.contentAreaCollapsed);
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onToggleCollapse={handleCollapseToggle}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onBrandClick={handleBrandClick}
      />

      <div className={contentAreaClassName.join(' ')}>
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleSidebar={handleNavbarSidebarToggle}
          onToggleTheme={() => setIsDarkMode((value) => !value)}
          isDarkMode={isDarkMode}
        />
        <main className={styles.mainContent}>
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}
