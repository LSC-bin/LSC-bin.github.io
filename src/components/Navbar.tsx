import { FormEvent } from 'react';
import styles from './Navbar.module.css';

type NavbarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
};

export default function Navbar({
  searchTerm,
  onSearchChange,
  onToggleSidebar,
  onToggleTheme,
  isDarkMode,
}: NavbarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button type="button" className={styles.menuButton} onClick={onToggleSidebar}>
          ☰
        </button>
        <form className={styles.search} onSubmit={handleSubmit} role="search">
          <label htmlFor="global-search" className="sr-only">
            전체 검색
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </form>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.actionButton} onClick={onToggleTheme}>
          {isDarkMode ? '라이트 모드' : '다크 모드'}
        </button>
      </div>
    </header>
  );
}
