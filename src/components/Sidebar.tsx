import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/activity', label: '활동', icon: '🗂️' },
  { to: '/ask', label: '질문하기', icon: '💬' },
];

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onBrandClick?: () => void;
};

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onBrandClick,
}: SidebarProps) {
  const classNames = [styles.sidebar];

  if (collapsed) {
    classNames.push(styles.collapsed);
  }

  if (mobileOpen) {
    classNames.push(styles.mobileOpen);
  }

  return (
    <>
      {mobileOpen && <div className={styles.mobileBackdrop} onClick={onCloseMobile} />}
      <aside className={classNames.join(' ')}>
        <div className={styles.brand}>
          <button type="button" className={styles.menuToggle} onClick={onToggleCollapse} aria-label="사이드바 접기">
            {collapsed ? '➡️' : '⬅️'}
          </button>
          {!collapsed && (
            <button type="button" className={styles.brandTitle} onClick={onBrandClick}>
              ClassBoard
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const linkClasses = [styles.navLink];
                if (collapsed) {
                  linkClasses.push(styles.iconOnly);
                }
                if (isActive) {
                  linkClasses.push(styles.navLinkActive);
                }
                return linkClasses.join(' ');
              }}
              onClick={onCloseMobile}
              end={item.to === '/'}
            >
              <span aria-hidden>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
