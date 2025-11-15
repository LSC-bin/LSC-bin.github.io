import { useEffect, type PropsWithChildren } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'

import { docLinks, primaryNavigation } from '../../lib/navigation'
import { useUIStore } from '../../stores'
import { AuthControls } from './AuthControls'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const baseLinkClass =
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition'

const getNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    baseLinkClass,
    isActive
      ? 'bg-brand-500 text-white shadow-soft'
      : 'text-slate-300 hover:bg-surface-800 hover:text-white',
  ].join(' ')

export const AppShell = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.dataset.theme = theme
  }, [theme])

  // TeacherOverview는 자체 레이아웃을 사용하므로 AppShell 레이아웃 제외
  const useCustomLayout = location.pathname.startsWith('/teacher')

  if (useCustomLayout) {
    return (
      <div className="min-h-screen bg-surface-950 text-slate-100">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 -translate-y-20 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus-visible:translate-y-0 focus-visible:outline-none"
        >
          본문 바로가기
        </a>
        {children}
        <Toaster richColors position="top-right" />
      </div>
    )
  }

  // 다른 페이지는 기존 레이아웃 유지 (향후 마이그레이션 예정)
  return (
    <div className="min-h-screen bg-surface-950 text-slate-100">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-50 -translate-y-20 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus-visible:translate-y-0 focus-visible:outline-none"
      >
        본문 바로가기
      </a>
      <header className="border-b border-slate-800 bg-surface-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
                <span className="text-lg font-semibold text-white">CB</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-200">
                ClassBoard Next
              </p>
              <h1 className="text-lg font-semibold text-white">수업 운영 플랫폼</h1>
            </div>
          </div>
          <div className="hidden flex-wrap items-center gap-2 text-xs text-slate-400 md:flex">
            {docLinks.map((doc) => (
              <a
                key={doc.to}
                href={doc.to}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 transition hover:border-brand-400 hover:text-white"
              >
                📄 {doc.label}
              </a>
            ))}
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {primaryNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavClass}>
                {item.label}
              </NavLink>
            ))}
            <AuthControls />
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12" tabIndex={-1}>
        {children}
      </main>

      <Toaster richColors position="top-right" />
    </div>
  )
}

